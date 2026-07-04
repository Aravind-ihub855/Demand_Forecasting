# synthetic_generator.py
import csv
from pathlib import Path
from datetime import date, timedelta

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR / "frontend"  # adjust if needed

TODAY = date(2026, 5, 7)

# ---------- helpers ----------

def read_csv(path, key=None):
    rows = []
    with open(path, newline='', encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
    if key is None:
        return rows
    d = {}
    for r in rows:
        d[r[key]] = r
    return d

def write_csv(path, fieldnames, rows):
    with open(path, "w", newline='', encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow(r)

def parse_float(v, default=0.0):
    try:
        return float(v)
    except Exception:
        return default

def store_persona(store_id):
    # matches your STORE_MASTER personas
    if store_id == "ST001":
        return "Gandhipuram"
    if store_id == "ST002":
        return "RS_Puram"
    if store_id == "ST003":
        return "Singanallur"
    if store_id == "ST004":
        return "Saibaba"
    if store_id == "ST005":
        return "Avinashi"
    return "Other"

def coverage_days_for_store(store_id, movement_type):
    # base days of cover by behavior & persona
    persona = store_persona(store_id)
    if movement_type in ("Fast_Moving", "Perishable"):
        base = 2
    elif movement_type in ("Seasonal", "Promotion_Sensitive", "Festival_Driven"):
        base = 4
    elif movement_type == "Slow_Moving":
        base = 12
    else:  # Stable
        base = 7

    if persona == "Singanallur":  # bulk
        base *= 1.3
    elif persona == "RS_Puram":   # premium less bulk
        base *= 0.9

    return max(1, int(round(base)))

def coverage_days_for_warehouse(warehouse_id, movement_type):
    # warehouse keeps higher days of cover
    if movement_type in ("Fast_Moving", "Perishable"):
        base = 15
    elif movement_type in ("Seasonal", "Promotion_Sensitive", "Festival_Driven"):
        base = 25
    elif movement_type == "Slow_Moving":
        base = 40
    else:
        base = 30

    if warehouse_id == "WH001":
        # central: more staples and grocery
        base *= 1.1
    else:  # WH002
        base *= 0.9
    return max(7, int(round(base)))

def is_perishable(cat_id, behavior_type):
    return cat_id in ("CAT02", "CAT07", "CAT08", "CAT09") or behavior_type == "Perishable"

def expiry_for_sku(cat_id, behavior_type, shelf_life_days, horizon_days=120):
    if not is_perishable(cat_id, behavior_type):
        # far future but finite
        return TODAY + timedelta(days=min(int(shelf_life_days), 365))
    # for perishable, keep within horizon
    span = min(int(shelf_life_days), horizon_days)
    return TODAY + timedelta(days=max(2, span // 2))

# ---------- load masters ----------

product_master = read_csv(FRONTEND_DIR / "PRODUCT_MASTER.csv", key="sku_id")
stock_patterns = read_csv(FRONTEND_DIR / "STOCK_PATTERNS.csv", key="sku_id")
sku_wh_map = read_csv(FRONTEND_DIR / "SKU_WAREHOUSE_MAPPING.csv")
stores = read_csv(FRONTEND_DIR / "STORE_MASTER.csv", key="store_id")
warehouses = read_csv(FRONTEND_DIR / "WAREHOUSE_MASTER.csv", key="warehouse_id")

all_skus = list(product_master.keys())
all_store_ids = list(stores.keys())

# ---------- regenerate PRODUCT_DISTRIBUTION for all 200 SKUs ----------

pd_rows = []
pd_id = 1

for sku in all_skus:
    p = product_master[sku]
    pat = stock_patterns[sku]
    cat = p["category_id"]
    beh = p["behavior_type"]

    avg_sales = max(0.5, parse_float(pat["avg_daily_sales"]))
    movement_type = pat["movement_type"]

    for store_id in all_store_ids:
        persona = store_persona(store_id)

        # decide if this sku should be in this store at all
        include = False
        assortment = "Core"
        demand_priority = "Medium"

        if cat == "CAT01":  # Grocery in all stores
            include = True
            demand_priority = "High"
        elif cat == "CAT02":  # Dairy in all
            include = True
            demand_priority = "High"
        elif cat == "CAT03":  # Beverages
            include = True
            if persona in ("Gandhipuram", "Avinashi"):
                demand_priority = "High"
        elif cat == "CAT04":  # Snacks
            include = True
            if persona in ("Gandhipuram", "Avinashi"):
                demand_priority = "High"
        elif cat == "CAT05":  # Household
            include = persona in ("Saibaba", "Singanallur", "Gandhipuram")
            demand_priority = "High" if persona in ("Saibaba", "Singanallur") else "Medium"
        elif cat == "CAT06":  # Personal Care
            include = True
            if persona == "RS_Puram":
                demand_priority = "High"
        elif cat == "CAT07":  # Fruits & Veg
            include = True
            demand_priority = "High"
        elif cat == "CAT08":  # Frozen
            include = persona in ("Singanallur", "RS_Puram", "Gandhipuram", "Avinashi")
            demand_priority = "Medium"
        elif cat == "CAT09":  # Bakery
            include = True
            if persona in ("Gandhipuram", "Avinashi"):
                demand_priority = "High"
        elif cat == "CAT10":  # Stationery
            include = persona in ("Gandhipuram", "RS_Puram", "Saibaba")

        # premium tweak
        if sku in ("SKU0110", "SKU0111", "SKU0196", "SKU0197", "SKU0198", "SKU0199", "SKU0200"):
            if store_id == "ST002":
                include = True
                assortment = "Premium"
                demand_priority = "High"
            else:
                assortment = "Optional"
                demand_priority = "Low"

        if not include:
            continue

        cov_days = coverage_days_for_store(store_id, movement_type)
        min_alloc = max(2, int(round(avg_sales * max(1, cov_days // 2))))
        max_alloc = max(min_alloc + 5, int(round(avg_sales * cov_days)))

        pd_rows.append({
            "distribution_id": f"PD{pd_id:04d}",
            "sku_id": sku,
            "store_id": store_id,
            "demand_priority": demand_priority,
            "assortment_type": assortment,
            "min_stock_allocation": min_alloc,
            "max_stock_allocation": max_alloc,
            "preferred_customer_segment": persona,
            "active_flag": "true",
            "local_preference_score": "0.80",
            "festival_relevance_score": "0.20",
            "climate_relevance": "None",
            "promotion_priority": "Medium" if movement_type in ("Fast_Moving", "Promotion_Sensitive") else "Low",
        })
        pd_id += 1

write_csv(
    FRONTEND_DIR / "PRODUCT_DISTRIBUTION.csv",
    [
        "distribution_id","sku_id","store_id","demand_priority","assortment_type",
        "min_stock_allocation","max_stock_allocation","preferred_customer_segment",
        "active_flag","local_preference_score","festival_relevance_score",
        "climate_relevance","promotion_priority"
    ],
    pd_rows,
)

# ---------- regenerate WAREHOUSE_INVENTORY for all 200 SKUs ----------

wi_rows = []
wi_id = 1

# group sku->warehouses from mapping
sku_to_whs = {}
for m in sku_wh_map:
    sku = m["sku_id"]
    wh = m["warehouse_id"]
    sku_to_whs.setdefault(sku, []).append(m)

for sku in all_skus:
    p = product_master[sku]
    pat = stock_patterns[sku]
    cat = p["category_id"]
    beh = p["behavior_type"]
    movement_type = pat["movement_type"]
    avg_sales = max(0.5, parse_float(pat["avg_daily_sales"]))

    for m in sku_to_whs.get(sku, []):
        wh_id = m["warehouse_id"]
        cov_days = coverage_days_for_warehouse(wh_id, movement_type)

        # approximate daily region demand (sum over 5 stores)
        daily_region = avg_sales * 5.0
        base_qty = int(round(daily_region * cov_days))

        min_q = int(m["min_storage_quantity"])
        max_q = int(m["max_storage_quantity"])
        qoh = max(min_q, min(base_qty, max_q * 3))  # keep inside a sane band

        allocated = int(round(qoh * 0.4))
        available = qoh - allocated
        damaged = max(0, int(qoh * 0.01))
        inbound = int(round(qoh * 0.1))
        outbound = int(round(qoh * 0.08))
        reorder_level = int(round(daily_region * max(7, cov_days // 2)))

        if qoh <= reorder_level * 0.3:
            inv_state = "Critical_Stock"
            reorder_flag = "true"
        elif qoh <= reorder_level:
            inv_state = "Low_Stock"
            reorder_flag = "true"
        elif qoh > max_q * 2:
            inv_state = "Overstock"
            reorder_flag = "false"
        else:
            inv_state = "Normal"
            reorder_flag = "false"

        shelf_life = int(p["shelf_life_days"] or "365")
        expiry = expiry_for_sku(cat, beh, shelf_life).isoformat()
        zone = m["preferred_storage_zone"]

        wi_rows.append({
            "warehouse_inventory_id": f"WI{wi_id:04d}",
            "warehouse_id": wh_id,
            "sku_id": sku,
            "batch_id": f"BATCH-{wh_id}-{sku}-01",
            "quantity_on_hand": qoh,
            "allocated_quantity": allocated,
            "available_quantity": available,
            "damaged_quantity": damaged,
            "inbound_quantity": inbound,
            "outbound_quantity": outbound,
            "reorder_flag": reorder_flag,
            "reorder_level": reorder_level,
            "inventory_status": inv_state,
            "last_stock_update": TODAY.isoformat(),
            "expiry_date": expiry,
            "storage_zone": zone,
        })
        wi_id += 1

write_csv(
    FRONTEND_DIR / "WAREHOUSE_INVENTORY.csv",
    [
        "warehouse_inventory_id","warehouse_id","sku_id","batch_id","quantity_on_hand",
        "allocated_quantity","available_quantity","damaged_quantity","inbound_quantity",
        "outbound_quantity","reorder_flag","reorder_level","inventory_status",
        "last_stock_update","expiry_date","storage_zone",
    ],
    wi_rows,
)

# ---------- regenerate STORE_INVENTORY for all 200 SKUs ----------

si_rows = []
si_id = 1

# build quick map from PRODUCT_DISTRIBUTION
from collections import defaultdict
sku_store_pd = defaultdict(list)
for r in pd_rows:
    sku_store_pd[(r["sku_id"], r["store_id"])].append(r)

for sku in all_skus:
    p = product_master[sku]
    pat = stock_patterns[sku]
    cat = p["category_id"]
    beh = p["behavior_type"]
    movement_type = pat["movement_type"]
    avg_sales = max(0.5, parse_float(pat["avg_daily_sales"]))
    shelf_life = int(p["shelf_life_days"] or "365")

    for store_id in all_store_ids:
        pds = sku_store_pd.get((sku, store_id))
        if not pds:
            continue
        # just pick first mapping for allocation bounds
        pd0 = pds[0]
        min_alloc = int(pd0["min_stock_allocation"])
        max_alloc = int(pd0["max_stock_allocation"])
        # choose qty inside bounds leaning towards upper side
        base_qty = max_alloc - max(0, int(avg_sales))  # a little below max
        qoh = max(min_alloc, base_qty)
        reserved = max(0, int(qoh * 0.03))
        damaged = max(0, int(qoh * 0.01))
        expired = 0

        cov_days = coverage_days_for_store(store_id, movement_type)
        reorder_level = int(round(avg_sales * max(2, cov_days // 2)))

        if qoh <= reorder_level * 0.3:
            inv_state = "Critical_Stock"
            reorder_flag = "true"
        elif qoh <= reorder_level:
            inv_state = "Low_Stock"
            reorder_flag = "true"
        elif qoh > max_alloc:
            inv_state = "Overstock"
            reorder_flag = "false"
        else:
            inv_state = "Normal"
            reorder_flag = "false"

        # expiry
        exp_date = expiry_for_sku(cat, beh, shelf_life, horizon_days=30)
        storage_zone = (
            "Milk-Chiller-1" if cat == "CAT02"
            else "Frozen-Bin-1" if cat == "CAT08"
            else "Vegetable-Rack-1" if cat == "CAT07"
            else "Snacks-Gondola-1" if cat == "CAT04"
            else "Beverage-Aisle-1" if cat == "CAT03"
            else "Rack-A1"
        )

        si_rows.append({
            "store_inventory_id": f"SI{si_id:04d}",
            "store_id": store_id,
            "sku_id": sku,
            "batch_id": f"BATCH-{store_id}-{sku}-01",
            "quantity_on_hand": qoh,
            "reserved_quantity": reserved,
            "available_quantity": qoh - reserved,
            "damaged_quantity": damaged,
            "expired_quantity": expired,
            "inventory_status": inv_state,
            "reorder_flag": reorder_flag,
            "reorder_level": reorder_level,
            "last_restocked_date": (TODAY - timedelta(days=1)).isoformat(),
            "last_stock_update": TODAY.isoformat(),
            "expiry_date": exp_date.isoformat(),
            "storage_zone": storage_zone,
        })
        si_id += 1

write_csv(
    FRONTEND_DIR / "STORE_INVENTORY.csv",
    [
        "store_inventory_id","store_id","sku_id","batch_id","quantity_on_hand",
        "reserved_quantity","available_quantity","damaged_quantity","expired_quantity",
        "inventory_status","reorder_flag","reorder_level","last_restocked_date",
        "last_stock_update","expiry_date","storage_zone",
    ],
    si_rows,
)

print("Synthetic distribution and inventory regenerated for all 200 SKUs.")