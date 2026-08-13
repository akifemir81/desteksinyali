import json
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "opportunities.json"
REQUIRED = {"id", "title", "organization", "source_url", "summary", "checked_at"}


def main() -> None:
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    rows = payload.get("opportunities")
    if not isinstance(rows, list):
        raise SystemExit("opportunities bir liste olmalı")

    seen = set()
    for index, row in enumerate(rows):
        missing = REQUIRED - row.keys()
        if missing:
            raise SystemExit(f"Kayıt {index}: eksik alanlar: {sorted(missing)}")
        if row["id"] in seen:
            raise SystemExit(f"Tekrarlanan id: {row['id']}")
        seen.add(row["id"])
        parsed = urlparse(row["source_url"])
        if parsed.scheme != "https" or not parsed.netloc:
            raise SystemExit(f"Kayıt {index}: geçersiz kaynak URL'si")

    print(f"Doğrulandı: {len(rows)} fırsat")


if __name__ == "__main__":
    main()

