from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent

required_files = [
    "index.html",
    "services.html",
    "residential.html",
    "commercial.html",
    "contact.html",
    "query.html",
    "styles.css",
    "script.js",
    "server.js",
    "robots.txt",
    "sitemap.xml",
    "README.md",
    "package.json",
]

required_content = {
    "index.html": ["Wisdom Painting", "10 years", "Project Query"],
    "services.html": ["OUR SERVICES", "Residential", "Commercial"],
    "residential.html": ["Residential", "Interiors", "Exteriors"],
    "commercial.html": ["Commercial", "Commercial clients include", "retail"],
    "contact.html": ["CONTACT US TODAY", "(437) 299-1782", "London, ON, Canada"],
    "query.html": ["Project Query", "Send your query", "Submit Query"],
    "styles.css": ["--accent", ".feature-band", ".contact-band", ".floating-call", ".submenu"],
    "script.js": ["menuButton", "query-form", "IntersectionObserver"],
    "server.js": ["createServer", "serveStatic", "Cache-Control"],
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
