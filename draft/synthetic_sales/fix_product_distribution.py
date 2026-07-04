"""
Appends missing PRODUCT_DISTRIBUTION rows for SKU0041-SKU0300 (5 stores each = 1300 rows).
Run once from the project root or synthetic_sales folder.
"""
import csv
import os

DATASETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'Datasets')
MASTER_FILE = os.path.join(DATASETS_DIR, 'PRODUCT_MASTER.csv')
DIST_FILE   = os.path.join(DATASETS_DIR, 'PRODUCT_DISTRIBUTION.csv')

STORES = ['ST001', 'ST002', 'ST003', 'ST004', 'ST005']
SEGMENTS = {
    'ST001': 'Gandhipuram',
    'ST002': 'RS_Puram',
    'ST003': 'Singanallur',
    'ST004': 'Saibaba',
    'ST005': 'Avinashi',
}

# min/max stock per store index [ST001, ST002, ST003, ST004, ST005]
PROFILES = {
    'Fast_Moving':    dict(priority='High',   assortment='Core',
                           mins=[30,25,40,28,32], maxs=[60,50,80,56,64],
                           lp=0.85, fr=0.10, promo='Low'),
    'Stable_Demand':  dict(priority='High',   assortment='Core',
                           mins=[20,16,28,18,22], maxs=[50,40,70,45,55],
                           lp=0.80, fr=0.20, promo='Low'),
    'Seasonal':       dict(priority='Medium', assortment='Extended',
                           mins=[8, 6, 10, 7, 8],  maxs=[20,16,24,18,22],
                           lp=0.70, fr=0.60, promo='Medium'),
    'Niche':          dict(priority='Low',    assortment='Niche',
                           mins=[3, 2, 4, 3, 3],   maxs=[8, 6,10, 8, 9],
                           lp=0.60, fr=0.30, promo='High'),
    'Slow_Moving':    dict(priority='Low',    assortment='Niche',
                           mins=[2, 2, 3, 2, 2],   maxs=[6, 5, 8, 6, 7],
                           lp=0.50, fr=0.10, promo='Low'),
}

SEASONAL_CLIMATE = {
    'Summer': 'Summer', 'Monsoon': 'Monsoon', 'Winter': 'Winter',
}

def get_climate(festival_relevance, behavior_type):
    if behavior_type != 'Seasonal':
        return 'None'
    for k, v in SEASONAL_CLIMATE.items():
        if k in str(festival_relevance):
            return v
    return 'None'

# Read master — collect SKU info for SKU0041+
skus = {}
with open(MASTER_FILE, newline='', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        raw_id = row.get('sku_id') or row.get('\ufeffsku_id', '')
        if not raw_id or raw_id == 'sku_id':
            continue
        sku_num = int(raw_id.replace('SKU', ''))
        if sku_num >= 41:
            skus[raw_id] = {
                'behavior': row.get('behavior_type', 'Stable_Demand'),
                'festival': row.get('festival_relevance', 'None'),
            }

# Find last PD id used
last_id = 0
with open(DIST_FILE, newline='', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if line.startswith('PD'):
            try:
                num = int(line.split(',')[0].replace('PD', ''))
                if num > last_id:
                    last_id = num
            except ValueError:
                pass

print(f"Last existing PD id: {last_id}")
print(f"SKUs to add: {len(skus)} × 5 stores = {len(skus)*5} rows")

rows_added = 0
with open(DIST_FILE, 'a', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    for sku_id in sorted(skus.keys()):
        info = skus[sku_id]
        behavior = info['behavior']
        festival = info['festival']
        profile = PROFILES.get(behavior, PROFILES['Stable_Demand'])
        climate = get_climate(festival, behavior)

        for i, store_id in enumerate(STORES):
            last_id += 1
            pd_id = f'PD{last_id:04d}'
            writer.writerow([
                pd_id,
                sku_id,
                store_id,
                profile['priority'],
                profile['assortment'],
                profile['mins'][i],
                profile['maxs'][i],
                SEGMENTS[store_id],
                'true',
                profile['lp'],
                profile['fr'],
                climate,
                profile['promo'],
            ])
            rows_added += 1

print(f"Done. {rows_added} rows appended to PRODUCT_DISTRIBUTION.csv")
print(f"New total PD id range: PD0001 - PD{last_id:04d}")
