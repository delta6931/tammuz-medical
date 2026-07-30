/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  RESEND_API_KEY?: string;
  QUOTE_FROM_EMAIL?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

type QuoteRequest = {
  name: string;
  company: string;
  email: string;
  country: string;
  requirement: string;
  website?: string;
  requestId?: string;
};

const QUOTE_RECIPIENT = "info@tammuzmedical.com";
const DEFAULT_QUOTE_SENDER = "Tammuz Global Medical <website@tammuzmedical.com>";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function clean(value: unknown, maximumLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

async function handleQuoteRequest(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== requestUrl.origin) {
    return json({ ok: false, error: "Invalid origin" }, 403);
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > 25_000) {
    return json({ ok: false, error: "Request too large" }, 413);
  }

  let submitted: Partial<QuoteRequest>;
  try {
    submitted = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  // Bots commonly complete fields hidden from real visitors. Return a neutral
  // success so automated spam does not learn how to bypass the check.
  if (clean(submitted.website, 200)) {
    return json({ ok: true });
  }

  const quote: QuoteRequest = {
    name: clean(submitted.name, 120),
    company: clean(submitted.company, 160),
    email: clean(submitted.email, 254).toLowerCase(),
    country: clean(submitted.country, 80),
    requirement: clean(submitted.requirement, 5_000),
    requestId: clean(submitted.requestId, 80),
  };

  if (
    !quote.name ||
    !quote.company ||
    !EMAIL_PATTERN.test(quote.email) ||
    !quote.country ||
    !quote.requirement
  ) {
    return json({ ok: false, error: "Please complete every required field" }, 400);
  }

  if (!env.RESEND_API_KEY) {
    console.error("Quote delivery is not configured: RESEND_API_KEY is missing.");
    return json({ ok: false, error: "Quote delivery is temporarily unavailable" }, 503);
  }

  const subject = `Website quote request — ${quote.company || quote.name}`;
  const text = [
    "New quote request from tammuzmedical.com",
    "",
    `Name: ${quote.name}`,
    `Company / clinic: ${quote.company}`,
    `Email: ${quote.email}`,
    `Country: ${quote.country}`,
    "",
    "Requirement:",
    quote.requirement,
  ].join("\n");
  const html = `
    <h1>New website quote request</h1>
    <p><strong>Name:</strong> ${escapeHtml(quote.name)}</p>
    <p><strong>Company / clinic:</strong> ${escapeHtml(quote.company)}</p>
    <p><strong>Email:</strong> ${escapeHtml(quote.email)}</p>
    <p><strong>Country:</strong> ${escapeHtml(quote.country)}</p>
    <h2>Requirement</h2>
    <p>${escapeHtml(quote.requirement).replace(/\n/g, "<br/>")}</p>
  `;

  let delivery: Response;
  try {
    delivery = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": quote.requestId || crypto.randomUUID(),
        "User-Agent": "TammuzMedical/1.0",
      },
      body: JSON.stringify({
        from: env.QUOTE_FROM_EMAIL || DEFAULT_QUOTE_SENDER,
        to: [QUOTE_RECIPIENT],
        reply_to: quote.email,
        subject,
        text,
        html,
      }),
    });
  } catch {
    console.error("Quote email delivery could not reach the email service.");
    return json({ ok: false, error: "Email delivery failed" }, 502);
  }

  if (!delivery.ok) {
    const deliveryReference = delivery.headers.get("cf-ray") || delivery.status.toString();
    console.error(`Quote email delivery failed (${deliveryReference}).`);
    return json({ ok: false, error: "Email delivery failed" }, 502);
  }

  return json({ ok: true });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/quote") {
      return handleQuoteRequest(request, env);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
