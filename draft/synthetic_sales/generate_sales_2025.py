from __future__ import annotations

import csv
import hashlib
import math
import os
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from pathlib import Path
from typing import Dict, Iterable, List, Tuple, Optional

import polars as pl


BASE_DIR = Path(__file__).resolve().parents[1]
DATASETS_DIR = BASE_DIR / "Datasets"
OUT_DIR = DATASETS_DIR / "Sales_2025"

# Simulation year
START_DATE = date(2025, 1, 1)
END_DATE = date(2025, 12, 31)

# Deterministic seed (do NOT change if you want reproducibility)
GLOBAL_SEED = "DMART-CBE-2025"


@dataclass(frozen=True)
class Store:
    store_id: str
    warehouse_id: str


@dataclass(frozen=True)
class Product:
    sku_id: str
    sku_name: str
    category_id: str
    supplier_id: str
    selling_price: float
    mrp: float
    gst_percentage: float
    shelf_life_days: int
    perishable_flag: bool
    storage_type: str
    behavior_type: str
    reorder_quantity: int
    festival_relevance: str


@dataclass(frozen=True)
class Category:
    category_id: str
    category_name: str


@dataclass(frozen=True)
class StockPattern:
    sku_id: str
    movement_type: str
    avg_daily_sales: float
    replenishment_frequency_days: int
    demand_variability_score: float
    seasonal_peak_months: str
    weather_sensitivity: str
    promotion_sensitivity: str


@dataclass(frozen=True)
class Assortment:
    sku_id: str
    store_id: str
    demand_priority: str
    assortment_type: str
    min_stock_allocation: int
    max_stock_allocation: int
    promotion_priority: str


def _read_csv_dict(path: Path) -> List[dict]:
    with path.open("r", newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def _stable_hash_int(*parts: str, mod: int = 10_000_000) -> int:
    s = "|".join(parts)
    h = hashlib.sha256(s.encode("utf-8")).hexdigest()
    return int(h[:12], 16) % mod


def _bool(v: str) -> bool:
    return str(v).strip().lower() in {"true", "1", "yes", "y"}


def load_reference_data() -> Tuple[
    Dict[str, Store],
    Dict[str, Product],
    Dict[str, Category],
    Dict[str, StockPattern],
    Dict[Tuple[str, str], Assortment],
]:
    store_rows = _read_csv_dict(DATASETS_DIR / "STORE_MASTER.csv")
    stores: Dict[str, Store] = {}
    for r in store_rows:
        stores[r["store_id"]] = Store(store_id=r["store_id"], warehouse_id=r["warehouse_id"])

    cat_rows = _read_csv_dict(DATASETS_DIR / "PRODUCT_CATEGORY.csv")
    categories: Dict[str, Category] = {r["category_id"]: Category(r["category_id"], r["category_name"]) for r in cat_rows}

    pm_rows = _read_csv_dict(DATASETS_DIR / "PRODUCT_MASTER.csv")
    products: Dict[str, Product] = {}
    for r in pm_rows:
        products[r["sku_id"]] = Product(
            sku_id=r["sku_id"],
            sku_name=r["sku_name"],
            category_id=r["category_id"],
            supplier_id=r["supplier_id"],
            selling_price=float(r["selling_price"]),
            mrp=float(r["mrp"]),
            gst_percentage=float(r["gst_percentage"]),
            shelf_life_days=int(float(r["shelf_life_days"])),
            perishable_flag=_bool(r["perishable_flag"]),
            storage_type=r["storage_type"],
            behavior_type=r["behavior_type"],
            reorder_quantity=int(float(r["reorder_quantity"])),
            festival_relevance=r.get("festival_relevance", ""),
        )

    sp_rows = _read_csv_dict(DATASETS_DIR / "STOCK_PATTERNS.csv")
    patterns: Dict[str, StockPattern] = {}
    for r in sp_rows:
        patterns[r["sku_id"]] = StockPattern(
            sku_id=r["sku_id"],
            movement_type=r["movement_type"],
            avg_daily_sales=float(r["avg_daily_sales"]),
            replenishment_frequency_days=int(float(r["replenishment_frequency_days"])),
            demand_variability_score=float(r["demand_variability_score"]),
            seasonal_peak_months=r["seasonal_peak_months"].strip('"'),
            weather_sensitivity=r["weather_sensitivity"].strip('"'),
            promotion_sensitivity=r["promotion_sensitivity"].strip('"'),
        )

    pd_rows = _read_csv_dict(DATASETS_DIR / "PRODUCT_DISTRIBUTION.csv")
    assortments: Dict[Tuple[str, str], Assortment] = {}
    for r in pd_rows:
        assortments[(r["sku_id"], r["store_id"])] = Assortment(
            sku_id=r["sku_id"],
            store_id=r["store_id"],
            demand_priority=r["demand_priority"],
            assortment_type=r["assortment_type"],
            min_stock_allocation=int(float(r["min_stock_allocation"])),
            max_stock_allocation=int(float(r["max_stock_allocation"])),
            promotion_priority=r["promotion_priority"],
        )

    return stores, products, categories, patterns, assortments


def load_sku_warehouse_minmax() -> Dict[Tuple[str, str], Tuple[int, int, str]]:
    """
    Returns (warehouse_id, sku_id) -> (min_storage_quantity, max_storage_quantity, preferred_storage_zone)
    """
    rows = _read_csv_dict(DATASETS_DIR / "SKU_WAREHOUSE_MAPPING.csv")
    out: Dict[Tuple[str, str], Tuple[int, int, str]] = {}
    for r in rows:
        out[(r["warehouse_id"], r["sku_id"])] = (
            int(float(r["min_storage_quantity"])),
            int(float(r["max_storage_quantity"])),
            r["preferred_storage_zone"],
        )
    return out


def store_persona(store_id: str) -> str:
    return {
        "ST001": "Gandhipuram",
        "ST002": "RS_Puram",
        "ST003": "Singanallur",
        "ST004": "Saibaba",
        "ST005": "Avinashi",
    }.get(store_id, "Other")


def month_season_name(m: int) -> str:
    if m in (3, 4, 5, 6):
        return "Summer"
    if m in (7, 8, 9):
        return "Monsoon"
    if m in (11, 12, 1, 2):
        return "Winter"
    return "Shoulder"


def festival_for_day(d: date) -> Tuple[bool, str]:
    # Tamil Nadu / India 2025 approximate windows (good enough for enterprise simulation)
    if date(2025, 1, 12) <= d <= date(2025, 1, 18):
        return True, "Pongal"
    if date(2025, 10, 20) <= d <= date(2025, 11, 5):
        return True, "Diwali"
    if d == date(2025, 4, 14):
        return True, "Tamil New Year"
    if date(2025, 3, 28) <= d <= date(2025, 4, 2):
        return True, "Ramadan"
    if date(2025, 12, 20) <= d <= date(2025, 12, 31):
        return True, "Christmas"
    if d == date(2025, 1, 1):
        return True, "New Year"
    return False, ""


def weather_for_day(d: date) -> Tuple[str, float]:
    # Coimbatore-like seasonal temperature bands; deterministic with slight daily variation.
    base = {
        "Summer": 35.0,
        "Monsoon": 29.0,
        "Winter": 27.0,
        "Shoulder": 31.0,
    }[month_season_name(d.month)]
    wobble = (_stable_hash_int(GLOBAL_SEED, d.isoformat(), mod=700) - 350) / 100.0  # -3.5..+3.5
    temp = round(base + wobble, 1)

    # Heavy rain week: 2025-07-15..2025-07-21
    if date(2025, 7, 15) <= d <= date(2025, 7, 21):
        return "Heavy_Rain", max(24.0, temp - 2.5)

    if month_season_name(d.month) == "Monsoon":
        return "Rain", temp
    if temp >= 34.0:
        return "Hot", temp
    return "Clear", temp


def competitor_event_for_day(d: date) -> Tuple[bool, float]:
    # One weekend per month competitor does 10-20% discounts, impacts some categories.
    # Deterministic selection by month.
    anchor = _stable_hash_int(GLOBAL_SEED, f"competitor-{d.year}-{d.month}", mod=28) + 1
    # if anchor falls on a weekend around that date, treat that weekend as competitor event
    month_start = date(d.year, d.month, 1)
    event_day = month_start + timedelta(days=min(anchor, 27))
    if event_day.weekday() in (5, 6):  # Sat/Sun
        if d == event_day or d == (event_day + timedelta(days=1)):
            pct = 0.10 + (_stable_hash_int(GLOBAL_SEED, d.isoformat(), "comp", mod=11) / 100.0)  # 0.10..0.20
            return True, round(pct, 2)
    return False, 0.0


def _festival_product_multiplier(
    fest_name: str,
    cat_id: str,
    sku_name: str,
    festival_relevance: str,
) -> float:
    name = sku_name.lower()
    rel = (festival_relevance or "").lower()

    if fest_name == "Pongal":
        strong_kw = (
            "rice", "jaggery", "ghee", "dal", "sugar", "flour",
            "coconut", "banana", "cashew", "raisin", "payasam", "sweet"
        )
        avoid_kw = (
            "noodles", "chips", "kurkure", "lays", "cola", "popcorn",
            "angles", "soda", "water", "choco"
        )
        if cat_id == "CAT01":         # Grocery staples (core Pongal basket)
            boost = 2.40
        elif cat_id == "CAT07":       # Fruits & veg (festival cooking + offerings)
            boost = 1.60
        elif cat_id == "CAT09":       # Bakery/sweets
            boost = 1.30
        elif cat_id == "CAT02":       # Dairy should be present but not dominate
            boost = 0.95
        elif cat_id in ("CAT03", "CAT04"):
            boost = 0.45
        else:
            boost = 0.80
        if any(k in name for k in strong_kw):
            boost *= 1.25
        if any(k in name for k in avoid_kw):
            boost *= 0.35
        if rel in ("pongal", "festival"):
            boost *= 1.35
        return boost

    if fest_name == "Diwali":
        strong_kw = (
            "dry fruit", "cashew", "almond", "ghee", "sweet", "laddu",
            "halwa", "mixture", "namkeen", "choco", "cookie", "cake"
        )
        avoid_kw = ("water", "noodles", "idli batter")
        if cat_id in ("CAT04", "CAT09", "CAT01", "CAT07"):
            boost = 1.65
        elif cat_id in ("CAT03",):
            boost = 1.08
        else:
            boost = 0.88
        if any(k in name for k in strong_kw):
            boost *= 1.28
        if any(k in name for k in avoid_kw):
            boost *= 0.55
        if rel in ("diwali", "festival"):
            boost *= 1.20
        return boost

    if fest_name == "Ramadan":
        strong_kw = ("dates", "milk", "vermicelli", "seviyan", "rose", "sharbat", "dry fruit")
        if cat_id in ("CAT01", "CAT02", "CAT03"):
            boost = 1.35
        else:
            boost = 0.9
        if any(k in name for k in strong_kw):
            boost *= 1.22
        if rel in ("ramadan", "festival"):
            boost *= 1.15
        return boost

    if fest_name == "Christmas":
        strong_kw = ("cake", "chocolate", "cookie", "biscuit", "plum")
        if cat_id in ("CAT09", "CAT04", "CAT03"):
            boost = 1.35
        else:
            boost = 0.92
        if any(k in name for k in strong_kw):
            boost *= 1.30
        if rel in ("christmas", "festival"):
            boost *= 1.20
        return boost

    if fest_name == "New Year":
        strong_kw = ("beverage", "chips", "snack", "chocolate", "cake", "cola", "juice")
        if cat_id in ("CAT03", "CAT04", "CAT09"):
            boost = 1.25
        else:
            boost = 0.95
        if any(k in name for k in strong_kw):
            boost *= 1.20
        return boost

    if fest_name == "Tamil New Year":
        if cat_id in ("CAT01", "CAT02"):
            return 1.18
        return 0.95

    return 1.0


def day_multipliers(
    d: date,
    store_id: str,
    cat_id: str,
    movement_type: str,
    sku_name: str,
    festival_relevance: str,
) -> float:
    persona = store_persona(store_id)
    is_weekend = d.weekday() in (5, 6)
    is_month_start = 1 <= d.day <= 10

    mult = 1.0
    if is_weekend:
        mult *= 1.15
        if cat_id in ("CAT03", "CAT04", "CAT09"):  # beverages/snacks/bakery higher on weekends
            mult *= 1.12
    else:
        if cat_id in ("CAT03", "CAT04"):
            mult *= 0.96

    if is_month_start and persona in ("Singanallur", "Saibaba") and cat_id in ("CAT01", "CAT05"):
        mult *= 1.20

    # persona-driven
    if persona in ("Gandhipuram", "Avinashi"):
        if cat_id in ("CAT03", "CAT04"):
            mult *= 1.25
    if persona == "RS_Puram":
        if movement_type in ("Slow_Moving",) or cat_id in ("CAT06",):
            mult *= 1.18
        if cat_id == "CAT01" and "Rice" in movement_type:
            mult *= 0.95
    if persona == "Singanallur":
        if cat_id == "CAT01":
            mult *= 1.20

    # seasonality
    season = month_season_name(d.month)
    if season == "Summer" and cat_id in ("CAT03", "CAT08"):
        mult *= 1.30
    if season == "Monsoon" and cat_id in ("CAT01", "CAT03") and movement_type in ("Stable", "Fast_Moving"):
        mult *= 0.97
    if season == "Winter" and cat_id in ("CAT09", "CAT02", "CAT06"):
        mult *= 1.08

    fest_flag, fest_name = festival_for_day(d)
    if fest_flag:
        mult *= _festival_product_multiplier(
            fest_name=fest_name,
            cat_id=cat_id,
            sku_name=sku_name,
            festival_relevance=festival_relevance,
        )

    wc, temp = weather_for_day(d)
    if wc in ("Hot",) and cat_id in ("CAT03", "CAT08"):
        mult *= 1.15
    if wc in ("Rain", "Heavy_Rain"):
        mult *= 0.92
        if cat_id in ("CAT01", "CAT04"):
            mult *= 1.05  # more instant food/snacks at home

    comp_flag, comp_pct = competitor_event_for_day(d)
    if comp_flag:
        # reduce some discretionary categories
        if cat_id in ("CAT03", "CAT04", "CAT06", "CAT05"):
            mult *= 0.90

    return mult


def hourly_profile(store_id: str, cat_id: str) -> List[float]:
    # 24 weights sum to 1.0, shaped by category and store persona
    persona = store_persona(store_id)
    base = [0.02] * 24

    # morning bump for dairy/bakery
    if cat_id in ("CAT02", "CAT09"):
        for h in range(7, 11):
            base[h] += 0.03

    # evening bump for snacks/beverages
    if cat_id in ("CAT03", "CAT04"):
        for h in range(17, 22):
            base[h] += 0.05

    # lunch / afternoon stable groceries
    if cat_id == "CAT01":
        for h in range(11, 15):
            base[h] += 0.02

    # persona extra evening peaks
    if persona in ("Gandhipuram", "Avinashi"):
        for h in range(18, 22):
            base[h] += 0.02

    s = sum(base)
    return [x / s for x in base]


def promo_for_sku_day(d: date, assortment: Assortment, cat_id: str, promo_sensitivity: str) -> Tuple[bool, str, float]:
    # Promotions are calendar-driven: weekends + festival windows + occasional mid-week.
    fest_flag, fest_name = festival_for_day(d)
    is_weekend = d.weekday() in (5, 6)

    promo = False
    promo_type = ""
    discount = 0.0

    if fest_flag and assortment.promotion_priority in ("High", "Very_High", "Medium"):
        promo = True
        promo_type = "Festival sale"
        discount = 0.10 if cat_id in ("CAT01", "CAT05") else 0.15

    if is_weekend and cat_id in ("CAT03", "CAT04", "CAT05") and promo_sensitivity in ("High", "Very_High", "Medium"):
        promo = True
        promo_type = "Weekend sale"
        discount = max(discount, 0.12)

    # Deterministic mid-week brand push for promotion-sensitive SKUs
    if promo_sensitivity in ("High", "Very_High") and (d.weekday() == 3):  # Thursday
        if _stable_hash_int(GLOBAL_SEED, d.isoformat(), assortment.sku_id, assortment.store_id, "promo", mod=10) == 0:
            promo = True
            promo_type = "Flat discount"
            discount = max(discount, 0.08)

    if promo and discount > 0.0:
        # clamp
        discount = min(0.25, round(discount, 2))
    return promo, promo_type, discount


def inventory_state_from_qty(qty: int, reorder_level: int, max_alloc: int) -> str:
    if qty <= max(1, int(0.3 * reorder_level)):
        return "Critical Stock"
    if qty <= reorder_level:
        return "Low Stock"
    if qty > max_alloc:
        return "Overstock"
    return "Normal"


def ensure_dirs():
    OUT_DIR.mkdir(parents=True, exist_ok=True)


def _warehouse_procure(
    d: date,
    products: Dict[str, Product],
    wh_available: Dict[Tuple[str, str], int],
    wh_batch: Dict[Tuple[str, str], str],
    wh_expiry: Dict[Tuple[str, str], str],
    wh_minmax: Dict[Tuple[str, str], Tuple[int, int, str]],
) -> None:
    """
    Simulate supplier replenishment into warehouses so inventory doesn't drain out by March.
    This is intentionally simple but rule-driven:
    - If available < min_storage_quantity, top up towards ~1.6 * max_storage_quantity.
    - Perishables are replenished in smaller cycles (keeps freshness).
    - Uses product shelf life to set a realistic batch expiry.
    """
    for (wh_id, sku_id), (min_q, max_q, _zone) in wh_minmax.items():
        cur = wh_available.get((wh_id, sku_id), 0)
        if cur >= min_q:
            continue

        p = products.get(sku_id)
        if not p:
            continue

        target = int(round(max_q * 1.6))
        needed = max(0, target - cur)
        if needed == 0:
            continue

        # Procurement cycle sizing
        if p.perishable_flag or p.storage_type in ("Cold", "Frozen"):
            # smaller, more frequent replenishment
            inbound = min(needed, max(200, int(max_q * 0.6)))
            expiry = (d + timedelta(days=max(2, min(p.shelf_life_days, 45)))).isoformat()
        else:
            inbound = min(needed, max(500, int(max_q * 0.9)))
            expiry = (d + timedelta(days=min(p.shelf_life_days, 365))).isoformat()

        wh_available[(wh_id, sku_id)] = cur + inbound
        wh_batch[(wh_id, sku_id)] = f"BATCH-{wh_id}-{sku_id}-{d.strftime('%Y%m%d')}"
        wh_expiry[(wh_id, sku_id)] = expiry


def generate_2025(partition_by: Tuple[str, ...] = ("sales_date", "store_id")) -> None:
    ensure_dirs()

    stores, products, categories, patterns, assortments = load_reference_data()
    wh_minmax = load_sku_warehouse_minmax()

    # Initial store inventory state (for 2025-01-01) derived from assortment bounds.
    # We don't use the 2026 timestamps in STORE_INVENTORY — only its reorder levels are consistent.
    store_on_hand: Dict[Tuple[str, str], int] = {}
    store_reorder_level: Dict[Tuple[str, str], int] = {}

    # Start inventory around 75-90% of max allocation so year doesn't begin in stockout.
    for (sku_id, store_id), a in assortments.items():
        seed = _stable_hash_int(GLOBAL_SEED, "init", sku_id, store_id, mod=100)
        start_ratio = 0.75 + (seed / 100.0) * 0.15  # 0.75..0.90
        start_qty = max(a.min_stock_allocation, int(round(a.max_stock_allocation * start_ratio)))
        store_on_hand[(store_id, sku_id)] = start_qty
        # reorder baseline based on min allocation (acts like safety stock trigger)
        store_reorder_level[(store_id, sku_id)] = max(1, a.min_stock_allocation)

    # Warehouse inventory state (for 2025-01-01) from WAREHOUSE_INVENTORY.csv quantities
    wh_rows = _read_csv_dict(DATASETS_DIR / "WAREHOUSE_INVENTORY.csv")
    wh_available: Dict[Tuple[str, str], int] = {}
    wh_batch: Dict[Tuple[str, str], str] = {}
    wh_expiry: Dict[Tuple[str, str], str] = {}
    for r in wh_rows:
        key = (r["warehouse_id"], r["sku_id"])
        wh_available[key] = int(float(r["available_quantity"]))
        wh_batch[key] = r["batch_id"]
        wh_expiry[key] = r["expiry_date"]

    # Cache category names
    cat_name = {c.category_id: c.category_name for c in categories.values()}

    # Precompute sku -> list of stores (from assortments)
    sku_to_stores: Dict[str, List[str]] = {}
    for (sku_id, store_id) in assortments.keys():
        sku_to_stores.setdefault(sku_id, []).append(store_id)

    # Generation loop (day-by-day, store-by-store)
    d = START_DATE
    part_counter = 0
    while d <= END_DATE:
        # Procurement into warehouses (keeps year-long continuity)
        _warehouse_procure(d, products, wh_available, wh_batch, wh_expiry, wh_minmax)

        wc, temp = weather_for_day(d)
        fest_flag, fest_name = festival_for_day(d)
        season = month_season_name(d.month)
        comp_flag, comp_pct = competitor_event_for_day(d)

        # rough footfall per store per day from STORE_MASTER avg_daily_customers with weekend uplift
        for store_id, store in stores.items():
            persona = store_persona(store_id)
            # base footfall from store master if present; else a safe default
            base_footfall = 2200
            # use existing store master values if available
            # (reading store master each time is slow; instead pull once from csv now)
            # we approximate by persona
            if persona == "Singanallur":
                base_footfall = 3400
            elif persona == "Gandhipuram":
                base_footfall = 2600
            elif persona == "RS_Puram":
                base_footfall = 2100
            elif persona == "Saibaba":
                base_footfall = 2300
            elif persona == "Avinashi":
                base_footfall = 2900

            if d.weekday() in (5, 6):
                base_footfall = int(round(base_footfall * 1.18))
            if fest_flag:
                base_footfall = int(round(base_footfall * 1.12))
            if wc == "Heavy_Rain":
                base_footfall = int(round(base_footfall * 0.80))
            elif wc == "Rain":
                base_footfall = int(round(base_footfall * 0.90))

            customer_footfall = base_footfall

            # Start-of-day replenishment from assigned warehouse (simple, realistic trigger)
            wh_id = store.warehouse_id
            for sku_id in sku_to_stores.keys():
                a = assortments.get((sku_id, store_id))
                if not a:
                    continue

                on_hand = store_on_hand[(store_id, sku_id)]
                reorder_level = store_reorder_level[(store_id, sku_id)]

                # if below reorder level, replenish towards max allocation
                if on_hand <= reorder_level:
                    target = a.max_stock_allocation
                    needed = max(0, target - on_hand)
                    if needed == 0:
                        continue

                    # cap by product reorder_quantity for realism
                    rq = products[sku_id].reorder_quantity
                    # perishable: smaller replenishments more frequent
                    if products[sku_id].perishable_flag or products[sku_id].storage_type in ("Cold", "Frozen"):
                        ship_qty = min(needed, max(10, int(rq * 0.6)))
                    else:
                        ship_qty = min(needed, rq)

                    wh_key = (wh_id, sku_id)
                    avail = wh_available.get(wh_key, 0)
                    if avail <= 0:
                        continue

                    shipped = min(ship_qty, avail)
                    wh_available[wh_key] = avail - shipped
                    store_on_hand[(store_id, sku_id)] = on_hand + shipped

            # Build hourly transactions for all SKUs in this store on this day
            rows: List[dict] = []
            sales_date_str = d.isoformat()

            for (sku_id, sid), a in assortments.items():
                if sid != store_id:
                    continue

                p = products[sku_id]
                sp = patterns[sku_id]
                category = p.category_id

                base_daily = sp.avg_daily_sales
                mult = day_multipliers(
                    d=d,
                    store_id=store_id,
                    cat_id=category,
                    movement_type=sp.movement_type,
                    sku_name=p.sku_name,
                    festival_relevance=p.festival_relevance,
                )

                promo_flag, promo_type, disc_pct = promo_for_sku_day(d, a, category, sp.promotion_sensitivity)
                if promo_flag:
                    # promo uplift
                    if category in ("CAT03", "CAT04"):
                        mult *= 1.25
                    elif category in ("CAT05", "CAT06"):
                        mult *= 1.15
                    else:
                        mult *= 1.08

                # daily desired units, then cap by inventory
                desired_units = max(0.0, base_daily * mult)
                desired_units_int = int(math.floor(desired_units))

                on_hand_start = store_on_hand[(store_id, sku_id)]
                sellable = max(0, on_hand_start)
                units_today = min(desired_units_int, sellable)

                # stockout if demand > supply
                stockout_flag = desired_units_int > sellable

                # allocate across hours
                weights = hourly_profile(store_id, category)
                hourly = [int(math.floor(units_today * w)) for w in weights]
                remainder = units_today - sum(hourly)

                # deterministic remainder distribution: assign 1 unit to the highest weighted hours
                if remainder > 0:
                    ranked = sorted(range(24), key=lambda h: (-weights[h], h))
                    for i in range(remainder):
                        hourly[ranked[i % 24]] += 1

                # Now generate rows with inventory decrement hour by hour
                on_hand = on_hand_start
                for hour in range(24):
                    qty = min(hourly[hour], on_hand)
                    inv_before = on_hand
                    on_hand -= qty

                    # skip zero rows to control missingness; but keep under 2% missing
                    if qty == 0:
                        continue

                    # pricing fields (unit_price = selling_price; can vary slightly under promo)
                    unit_price = p.selling_price
                    if promo_flag and disc_pct > 0:
                        unit_price = round(p.selling_price * (1.0 - disc_pct), 2)

                    discount_amount = round(p.selling_price - unit_price, 2)
                    total_sales = round(unit_price * qty, 2)

                    # inventory state from qty after sale
                    reorder_level = store_reorder_level[(store_id, sku_id)]
                    inv_state = inventory_state_from_qty(on_hand, reorder_level, a.max_stock_allocation)

                    # expiry (perishable uses a rolling expiry window)
                    if p.perishable_flag or p.storage_type in ("Cold", "Frozen"):
                        # within a realistic horizon
                        exp = d + timedelta(days=max(1, min(p.shelf_life_days, 30)))
                    else:
                        exp = d + timedelta(days=min(p.shelf_life_days, 365))

                    days_to_expiry = (exp - d).days
                    sales_ts = datetime.combine(d, time(hour=hour, minute=15))

                    # ids
                    invoice_id = f"INV-{store_id}-{sales_date_str}-{hour:02d}"
                    tx_id = f"TX-{store_id}-{sku_id}-{sales_date_str}-{hour:02d}"

                    rows.append(
                        {
                            "transaction_id": tx_id,
                            "invoice_id": invoice_id,
                            "sales_date": sales_date_str,
                            "sales_timestamp": sales_ts.isoformat(),
                            "store_id": store_id,
                            "warehouse_id": store.warehouse_id,
                            "sku_id": sku_id,
                            "sku_name": p.sku_name,
                            "category_id": category,
                            "category_name": cat_name.get(category, ""),
                            "supplier_id": p.supplier_id,
                            "batch_id": wh_batch.get((store.warehouse_id, sku_id), f"BATCH-{store.warehouse_id}-{sku_id}-01"),
                            "quantity_sold": qty,
                            "unit_price": round(unit_price, 2),
                            "selling_price": round(p.selling_price, 2),
                            "discount_percentage": round(disc_pct * 100.0, 2) if promo_flag else 0.0,
                            "discount_amount": round(discount_amount * qty, 2) if promo_flag else 0.0,
                            "total_sales_amount": total_sales,
                            "promotion_flag": promo_flag,
                            "promotion_type": promo_type if promo_flag else "",
                            "festival_flag": fest_flag,
                            "festival_name": fest_name if fest_flag else "",
                            "season_name": season,
                            "weather_condition": wc,
                            "temperature_celsius": temp,
                            "competitor_activity_flag": comp_flag,
                            "competitor_discount_percentage": round(comp_pct * 100.0, 2) if comp_flag else 0.0,
                            "trend_score": round(0.50 + (_stable_hash_int(GLOBAL_SEED, sales_date_str, sku_id, mod=50) / 100.0), 2),
                            "customer_footfall": customer_footfall,
                            "inventory_on_hand": inv_before,
                            "inventory_state": inv_state,
                            "stockout_flag": stockout_flag,
                            "reorder_level": reorder_level,
                            "expiry_date": exp.isoformat(),
                            "days_to_expiry": days_to_expiry,
                            "payment_mode": "UPI" if (_stable_hash_int(GLOBAL_SEED, tx_id, "pay", mod=10) < 6) else "Card",
                            "customer_type": "Premium" if (store_id == "ST002" and _stable_hash_int(GLOBAL_SEED, tx_id, "cust", mod=10) < 6) else "Regular",
                            "sales_channel": "InStore",
                            "source_system": "POS",
                            "ingestion_timestamp": datetime.combine(d, time(23, 55)).isoformat(),
                        }
                    )

                # persist end-of-day on_hand
                store_on_hand[(store_id, sku_id)] = on_hand

            if not rows:
                continue

            df = pl.DataFrame(rows)
            # Partition path: Sales_2025/sales_date=YYYY-MM-DD/store_id=STxxx/part-XXXX.parquet
            out_path = OUT_DIR / f"sales_date={sales_date_str}" / f"store_id={store_id}"
            out_path.mkdir(parents=True, exist_ok=True)
            file_path = out_path / f"part-{part_counter:05d}.parquet"
            df.write_parquet(file_path, compression="zstd")
            part_counter += 1

        d = d + timedelta(days=1)


if __name__ == "__main__":
    # Quick sanity: ensure polars is installed and output directory exists
    generate_2025()
    print(f"Done. Parquet partitions written to: {OUT_DIR}")

