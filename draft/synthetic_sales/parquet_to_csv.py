from __future__ import annotations

import argparse
from pathlib import Path
from typing import Iterable, List

import polars as pl


def iter_partition_dirs(root: Path) -> Iterable[Path]:
    """
    Expected layout:
      root/
        sales_date=YYYY-MM-DD/
          store_id=ST001/
            part-00000.parquet
    """
    if not root.exists():
        raise FileNotFoundError(f"Parquet root not found: {root}")

    for day_dir in sorted([p for p in root.iterdir() if p.is_dir() and p.name.startswith("sales_date=")]):
        for store_dir in sorted([p for p in day_dir.iterdir() if p.is_dir() and p.name.startswith("store_id=")]):
            yield store_dir


def convert_store_partition_to_csv(store_dir: Path, out_root: Path, mode: str) -> Path:
    """
    mode:
      - "per_store_per_day": writes 1 CSV per store/day directory
      - "per_parquet_file": writes 1 CSV per parquet file
    """
    out_root.mkdir(parents=True, exist_ok=True)

    day_dir = store_dir.parent
    day = day_dir.name.split("sales_date=", 1)[1]
    store = store_dir.name.split("store_id=", 1)[1]

    parquet_glob = str(store_dir / "*.parquet")

    if mode == "per_store_per_day":
        # Use lazy scan to avoid loading everything into RAM at once
        lf = pl.scan_parquet(parquet_glob)
        df = lf.collect(streaming=True)
        # Organized output: YYYY-MM/sales_date=YYYY-MM-DD/sales_YYYY-MM-DD_ST001.csv
        month_folder = out_root / day[:7]
        date_folder = month_folder / f"sales_date={day}"
        date_folder.mkdir(parents=True, exist_ok=True)
        out_path = date_folder / f"sales_{day}_{store}.csv"
        df.write_csv(out_path)
        return date_folder

    if mode == "per_parquet_file":
        month_folder = out_root / day[:7]
        out_dir = month_folder / f"sales_date={day}" / f"store_id={store}"
        out_dir.mkdir(parents=True, exist_ok=True)
        for pq in sorted(store_dir.glob("*.parquet")):
            df = pl.read_parquet(pq)
            df.write_csv(out_dir / (pq.stem + ".csv"))
        return out_dir

    raise ValueError(f"Unknown mode: {mode}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert partitioned Parquet sales data to CSV files.")
    parser.add_argument(
        "--parquet-root",
        type=str,
        default=str(Path("Datasets") / "Sales_2025"),
        help="Root folder containing partitioned Parquet (default: Datasets/Sales_2025)",
    )
    parser.add_argument(
        "--out",
        type=str,
        default=str(Path("Datasets") / "Sales_2025_CSV"),
        help="Output folder for CSV files (default: Datasets/Sales_2025_CSV)",
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["per_store_per_day", "per_parquet_file"],
        default="per_store_per_day",
        help="Export strategy (default: per_store_per_day)",
    )

    args = parser.parse_args()
    parquet_root = Path(args.parquet_root)
    out_root = Path(args.out)

    store_dirs: List[Path] = list(iter_partition_dirs(parquet_root))
    if not store_dirs:
        raise RuntimeError(f"No partitions found under: {parquet_root}")

    print(f"Found {len(store_dirs)} store partitions under {parquet_root}")
    print(f"Writing CSVs to {out_root} (mode={args.mode})")

    for i, store_dir in enumerate(store_dirs, start=1):
        out_path = convert_store_partition_to_csv(store_dir, out_root, args.mode)
        if i % 50 == 0:
            print(f"Converted {i}/{len(store_dirs)} partitions...")

    print("Done.")


if __name__ == "__main__":
    main()

