const QUOTE_RECIPIENT = "info@tammuzmedical.com";
const DEFAULT_QUOTE_SENDER = "Tammuz Global Medical <website@tammuzmedical.com>";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function clean(value, maximumLength) {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== requestUrl.origin) {
    return json({ ok: false, error: "Invalid origin" }, 403);
  }

  if (Number(request.headers.get("Content-Length") || 0) > 25_000) {
    return json({ ok: false, error: "Request too large" }, 413);
  }

  let submitted;
  try {
    submitted = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  // A hidden honeypot field catches basic form spam without exposing the rule.
  if (clean(submitted.website, 200)) {
    return json({ ok: true });
  }

  const quote = {
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

  let delivery;
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
    const reference = delivery.headers.get("cf-ray") || delivery.status.toString();
    console.error(`Quote email delivery failed (${reference}).`);
    return json({ ok: false, error: "Email delivery failed" }, 502);
  }

  return json({ ok: true });
}
