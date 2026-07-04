from __future__ import annotations

import argparse
import re
from pathlib import Path


FILENAME_RE = re.compile(r"^sales_(\d{4}-\d{2}-\d{2})_(ST\d{3})\.csv$")


def main() -> None:
    parser = argparse.ArgumentParser(description="Organize flat sales CSVs into month/date folders.")
    parser.add_argument(
        "--in",
        dest="in_dir",
        type=str,
        default=str(Path("Datasets") / "Sales_2025_CSV"),
        help="Input folder containing flat CSV files (default: Datasets/Sales_2025_CSV)",
    )
    parser.add_argument(
        "--out",
        dest="out_dir",
        type=str,
        default=str(Path("Datasets") / "Sales_2025_CSV_Organized"),
        help="Output folder for organized CSV files (default: Datasets/Sales_2025_CSV_Organized)",
    )
    parser.add_argument(
        "--move",
        action="store_true",
        help="Move files instead of copying (default: copy)",
    )
    args = parser.parse_args()

    in_dir = Path(args.in_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    if not in_dir.exists():
        raise FileNotFoundError(f"Input folder not found: {in_dir}")

    files = sorted([p for p in in_dir.iterdir() if p.is_file() and p.suffix.lower() == ".csv"])
    if not files:
        raise RuntimeError(f"No CSV files found in: {in_dir}")

    organized = 0
    skipped = 0

    for f in files:
        m = FILENAME_RE.match(f.name)
        if not m:
            skipped += 1
            continue

        day = m.group(1)  # YYYY-MM-DD
        month = day[:7]   # YYYY-MM
        target_dir = out_dir / month / f"sales_date={day}"
        target_dir.mkdir(parents=True, exist_ok=True)
        target_file = target_dir / f.name

        if args.move:
            f.replace(target_file)
        else:
            target_file.write_bytes(f.read_bytes())

        organized += 1
        if organized % 500 == 0:
            print(f"Organized {organized}/{len(files)} files...")

    print(f"Done. Organized: {organized}, skipped (name mismatch): {skipped}")
    print(f"Output: {out_dir}")


if __name__ == "__main__":
    main()

