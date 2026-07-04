## Synthetic Sales Generator (2025) — D‑Mart Coimbatore

This generator creates **hourly** POS-style sales line items for 2025 and writes them as **partitioned Parquet**.

### Input (required)

Reads these CSVs from `Datasets/`:

- `PRODUCT_MASTER.csv`
- `PRODUCT_CATEGORY.csv`
- `STORE_MASTER.csv`
- `WAREHOUSE_MASTER.csv`
- `PRODUCT_DISTRIBUTION.csv`
- `STOCK_PATTERNS.csv`
- `STORE_INVENTORY.csv` (used only for reorder-level logic; timestamps are ignored)
- `WAREHOUSE_INVENTORY.csv` (used as starting warehouse availability)

### Output

Writes partitioned Parquet to:

`Datasets/Sales_2025/`

Partitioning layout:

`Datasets/Sales_2025/sales_date=YYYY-MM-DD/store_id=ST00X/part-00000.parquet`

### Install

```bash
pip install polars pyarrow
```

### Run

From repo root:

```bash
python -m synthetic_sales.generate_sales_2025
```

## Convert Parquet → CSV (optional)

CSV export can be **very large**. Recommended export is **one CSV per store per day**.

Install deps:

```bash
pip install polars pyarrow
```

Run (default: per store/day):

```bash
python -m synthetic_sales.parquet_to_csv
```

Outputs to:

`Datasets/Sales_2025_CSV/` with files like:

`sales_2025-01-01_ST001.csv`

If you really want **one CSV per parquet file**:

```bash
python -m synthetic_sales.parquet_to_csv --mode per_parquet_file
```

### Notes on realism

- Uses store personas, weekend vs weekday effects, month-start bulk effects (ST003/ST004), summer/monsoon/winter seasonality, and festival windows.
- Promotions are **calendar-driven** (weekend + festival windows) and only uplift promotion-sensitive categories.
- Sales are **hard-capped by store inventory-on-hand**, and inventory is replenished from the mapped warehouse when below reorder level (subject to warehouse availability).
- Weather (Coimbatore-like) is generated deterministically per day, including a heavy-rain week.

