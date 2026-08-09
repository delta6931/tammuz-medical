"""Polite, cached fetcher for the official AsaDental source audit.

This utility is intentionally separate from the website build. It checks
robots.txt before every uncached request, identifies Tammuz Medical in its
User-Agent, rate-limits network traffic, and persists raw responses so repeated
audits do not request the same official page again.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import mimetypes
import time
from pathlib import Path
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import requests


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CACHE_ROOT = PROJECT_ROOT / "data" / "asadental" / "cache" / "asadental.com"
USER_AGENT = "TammuzMedical-CatalogAudit/1.0 (+https://tammuzmedical.com; info@tammuzmedical.com)"
ROBOTS_URL = "https://www.asadental.com/robots.txt"
MIN_REQUEST_INTERVAL_SECONDS = 0.75


class CachedFetcher:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
                "Accept-Encoding": "identity",
                "Connection": "close",
            }
        )
        self.last_request_at = 0.0
        self.request_interval_seconds = MIN_REQUEST_INTERVAL_SECONDS
        self.robot_parser: RobotFileParser | None = None

    @staticmethod
    def _cache_stem(url: str) -> str:
        parsed = urlparse(url)
        readable = (parsed.path.strip("/") or "home").replace("/", "__")
        readable = "".join(character if character.isalnum() or character in "-_." else "_" for character in readable)
        digest = hashlib.sha256(url.encode("utf-8")).hexdigest()[:12]
        return f"{readable[:120]}__{digest}"

    def _paths(self, url: str) -> tuple[Path, Path]:
        stem = self._cache_stem(url)
        return CACHE_ROOT / f"{stem}.body", CACHE_ROOT / f"{stem}.json"

    def _request(self, url: str) -> requests.Response:
        delay = self.request_interval_seconds - (time.monotonic() - self.last_request_at)
        if delay > 0:
            time.sleep(delay)
        try:
            response = self.session.get(url, timeout=45, allow_redirects=True)
        except requests.exceptions.SSLError:
            # The official host occasionally closes a long sitemap TLS stream.
            # Retry once on a fresh connection while preserving the same delay.
            time.sleep(self.request_interval_seconds)
            self.session.close()
            self.session = requests.Session()
            self.session.headers.update(
                {
                    "User-Agent": USER_AGENT,
                    "Accept": "text/html,application/xml,text/plain;q=0.9,*/*;q=0.8",
                    "Accept-Encoding": "identity",
                    "Connection": "close",
                }
            )
            response = self.session.get(url, timeout=45, allow_redirects=True)
        self.last_request_at = time.monotonic()
        response.raise_for_status()
        return response

    def _load_robots(self) -> RobotFileParser:
        if self.robot_parser is not None:
            return self.robot_parser
        robots_text = self.fetch(ROBOTS_URL, check_robots=False).decode("utf-8", errors="replace")
        parser = RobotFileParser()
        parser.set_url(ROBOTS_URL)
        parser.parse(robots_text.splitlines())
        crawl_delay = parser.crawl_delay(USER_AGENT) or parser.crawl_delay("*") or 0
        self.request_interval_seconds = max(MIN_REQUEST_INTERVAL_SECONDS, float(crawl_delay))
        self.robot_parser = parser
        return parser

    def fetch(self, url: str, *, check_robots: bool = True) -> bytes:
        parsed = urlparse(url)
        if parsed.scheme != "https" or parsed.netloc.lower() not in {"asadental.com", "www.asadental.com"}:
            raise ValueError(f"Only official HTTPS AsaDental URLs are allowed: {url}")

        body_path, metadata_path = self._paths(url)
        if body_path.exists() and metadata_path.exists():
            return body_path.read_bytes()

        if check_robots and not self._load_robots().can_fetch(USER_AGENT, url):
            raise PermissionError(f"robots.txt does not allow this audit URL: {url}")

        response = self._request(url)
        CACHE_ROOT.mkdir(parents=True, exist_ok=True)
        body_path.write_bytes(response.content)
        metadata_path.write_text(
            json.dumps(
                {
                    "requestedUrl": url,
                    "finalUrl": response.url,
                    "status": response.status_code,
                    "contentType": response.headers.get("Content-Type"),
                    "fetchedAtUnix": int(time.time()),
                    "userAgent": USER_AGENT,
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        return response.content


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("urls", nargs="+", help="Official AsaDental URLs to cache")
    args = parser.parse_args()
    fetcher = CachedFetcher()
    for url in args.urls:
        body = fetcher.fetch(url)
        guessed_type = mimetypes.guess_type(urlparse(url).path)[0] or "unknown"
        print(json.dumps({"url": url, "bytes": len(body), "guessedType": guessed_type}))


if __name__ == "__main__":
    main()
