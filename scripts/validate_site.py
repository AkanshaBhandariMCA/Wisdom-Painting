from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent

required_files = [
    "index.html",
    "services.html",
    "residential.html",
    "commercial.html",
    "reviews.html",
    "contact.html",
    "styles.css",
    "script.js",
    "server.js",
    "functions/api/reviews.js",
    "data/reviews.json",
    "robots.txt",
    "sitemap.xml",
    "README.md",
    "package.json",
]

required_content = {
    "index.html": ["Wisdom Painting", "10 years", "Client Reviews"],
    "services.html": ["OUR SERVICES", "Residential", "Commercial"],
    "residential.html": ["Residential", "Interiors", "Exteriors"],
    "commercial.html": ["Commercial", "Commercial clients include", "retail"],
    "reviews.html": ["All Verified Reviews", "verified reviews"],
    "contact.html": ["CONTACT US TODAY", "(519) 555-1234", "London, ON, Canada"],
    "styles.css": ["--accent", ".feature-band", ".contact-band", ".floating-call", ".submenu", ".review-slider"],
    "script.js": ["loadVerifiedReviews", "data-review-slider", "/api/reviews"],
    "server.js": ["/api/reviews", "reviews.json", "POST"],
    "functions/api/reviews.js": ["REVIEWS_KV", "onRequestPost", "onRequestGet"],
}


def fail(msg: str) -> None:
    print(f"FAIL: {msg}")
    sys.exit(1)


def main() -> None:
    for name in required_files:
        if not (ROOT / name).exists():
            fail(f"Missing file: {name}")

    for name, checks in required_content.items():
        content = (ROOT / name).read_text(encoding="utf-8")
        for check in checks:
            if check not in content:
                fail(f"Missing expected content '{check}' in {name}")

    print("PASS: Website structure and required content validated.")


if __name__ == "__main__":
    main()
