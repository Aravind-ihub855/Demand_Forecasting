"""
Monthly Sales Summary Report Generator for D-Mart Singanallur
===============================================================
Generates realistic monthly retail sales intelligence reports.

This system works INDEPENDENTLY from the daily sales generator.
It creates aggregated monthly summaries with business context for LLM forecasting.

Author: AI Data Architect
Purpose: Reduce data volume for LLM while preserving retail intelligence
"""

import csv
import random
import os
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional, Tuple
from enum import Enum

# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

STORE_ID = 'ST003'
STORE_NAME = 'D-Mart Singanallur'
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'output')
DATASETS_DIR = os.path.join(os.path.dirname(__file__), '..', 'Datasets')

# Month definitions with days and season
MONTHS = [
    ('January', 31, 'Winter'),
    ('February', 28, 'Winter'),
    ('March', 31, 'Summer'),
    ('April', 30, 'Summer'),
    ('May', 31, 'Summer'),
    ('June', 30, 'Monsoon'),
    ('July', 31, 'Monsoon'),
    ('August', 31, 'Monsoon'),
    ('September', 30, 'Monsoon'),
    ('October', 31, 'Winter'),
    ('November', 30, 'Winter'),
    ('December', 31, 'Winter'),
]

# Festival calendar with date ranges and affected product patterns
FESTIVALS = {
    'January': [
        {'name': 'Pongal', 'start': 12, 'end': 18, 'products': [
            'Pongal', 'Rice', 'Jaggery', 'Turmeric', 'Sugar', 'Dhoti', 'Saree',
            'Banana', 'Coconut', 'Ghee', 'Raw Rice', 'Pooja', 'Prayer', 'Religious',
            'Lamp', 'Oil', 'Kumkum', 'Kumkuma', 'Festival', 'Decorative'
        ], 'multiplier': 3.5}
    ],
    'March': [
        {'name': 'Ramadan', 'start': 28, 'end': 31, 'products': [
            'Dates', 'Vermicelli', 'Rooh Afza', 'Basmati', 'Badam', 'Dry Fruit',
            'Biryani', 'Cardamom', 'Pista', 'Semiya', 'Payasam', 'Kheer',
            'Vermicelli Kheer', 'Semiya Kheer', 'Sheer Khurma'
        ], 'multiplier': 4.0}
    ],
    'April': [
        {'name': 'Ramadan', 'start': 1, 'end': 2, 'products': [
            'Dates', 'Vermicelli', 'Rooh Afza', 'Basmati', 'Badam', 'Dry Fruit',
            'Biryani', 'Cardamom', 'Pista', 'Semiya', 'Payasam', 'Kheer',
            'Vermicelli Kheer', 'Semiya Kheer', 'Sheer Khurma'
        ], 'multiplier': 4.0},
        {'name': 'Tamil New Year', 'start': 14, 'end': 14, 'products': [
            'Sweet', 'New Year', 'Festival', 'Fruit', 'Gift', 'Pooja', 'Prayer',
            'Religious', 'Kumkum', 'Decorative', 'Neivedyam', 'Offering'
        ], 'multiplier': 2.0}
    ],
    'June': [
        {'name': 'Bakrid', 'start': 6, 'end': 8, 'products': [
            'Biryani Masala', 'Chicken Masala', 'Basmati', 'Dry Fruit',
            'Ghee', 'Oil', 'Soft Drink', 'Disposable', 'Meat', 'Bakrid', 'Eid'
        ], 'multiplier': 3.0}
    ],
    'October': [
        {'name': 'Diwali', 'start': 20, 'end': 31, 'products': [
            'Ghee', 'Sweet', 'Dry Fruit', 'Decorative', 'Candle', 'Gift',
            'Lamp', 'Oil', 'Cashew', 'Almond', 'Raisin', 'Pista', 'Snack',
            'Pooja', 'Prayer', 'Religious', 'Kumkum', 'Kumkuma', 'Diya',
            'Deepam', 'Festival', 'Plated', 'Plate Set', 'Pooja Item'
        ], 'multiplier': 3.5}
    ],
    'November': [
        {'name': 'Diwali', 'start': 1, 'end': 5, 'products': [
            'Ghee', 'Sweet', 'Dry Fruit', 'Decorative', 'Candle', 'Gift',
            'Lamp', 'Oil', 'Cashew', 'Almond', 'Raisin', 'Pista', 'Snack',
            'Pooja', 'Prayer', 'Religious', 'Kumkum', 'Kumkuma', 'Diya',
            'Deepam', 'Festival', 'Plated', 'Plate Set', 'Pooja Item'
        ], 'multiplier': 3.0}
    ],
    'December': [
        {'name': 'Christmas', 'start': 20, 'end': 31, 'products': [
            'Cake', 'Chocolate', 'Decorative', 'Soft Drink', 'Ice Cream',
            'Gift', 'Plum', 'Christmas', 'Santa', 'Wine', 'Plum Cake'
        ], 'multiplier': 2.5}
    ],
}

# Seasonal multipliers by product keywords
SEASONAL_PATTERNS = {
    'Summer': {
        'Ice Cream': 2.5, 'Cold Drink': 2.2, 'Soft Drink': 2.0,
        'Watermelon': 1.8, 'Electrolyte': 1.7, 'Cooler': 1.5,
        'Juice': 1.6, 'Lime': 1.5, 'Thirst': 1.4
    },
    'Monsoon': {
        'Umbrella': 2.8, 'Raincoat': 2.5, 'Soup': 1.8,
        'Hot Drink': 1.4, 'Tea': 1.3, 'Pakoda': 1.3
    },
    'Winter': {
        'Blanket': 2.0, 'Hot Beverage': 1.6, 'Ghee': 1.3,
        'Dry Fruit': 1.4, 'Sweet': 1.3, 'Wool': 1.5
    }
}

# Behavior type base daily sales (units per day)
BEHAVIOR_BASELINE = {
    'Fast_Moving': (25, 45),      # High volume, stable
    'Stable_Demand': (15, 30),    # Medium volume, very stable
    'Seasonal': (8, 20),          # Variable based on season
    'Niche': (3, 8),              # Low volume, specific customers
    'Slow_Moving': (1, 4),        # Very low volume
}

# Weekend uplift by category
WEEKEND_UPLIFT = {
    'CAT01': 1.15,  # Grocery - slight uplift
    'CAT02': 1.25,  # Dairy - family shopping
    'CAT03': 1.40,  # Beverages - party shopping
    'CAT04': 1.60,  # Snacks - weekend binge
    'CAT05': 1.10,  # Household - stable
    'CAT06': 1.20,  # Personal Care - self-care
    'CAT07': 1.30,  # Fruits & Vegetables - weekend cooking
    'CAT08': 1.50,  # Frozen Foods - weekend treats
    'CAT09': 1.35,  # Bakery - weekend breakfast
    'CAT10': 1.10,  # Stationery - stable
    'CAT11': 1.20,  # Electronics - weekend browsing
    'CAT12': 1.25,  # Lifestyle - weekend shopping
}

# Inventory constraints simulation
STOCKOUT_PROBABILITY = 0.05  # 5% chance of stockout per month
LOW_STOCK_THRESHOLD = 0.15   # 15% chance of low stock impact

# Promotion calendar
PROMOTIONS = {
    'January': [('New Year Sale', 1.3, 'Buy 1 Get 1 on select snacks')],
    'March': [('Summer Kickoff', 1.25, 'Discount on beverages')],
    'May': [('Summer Mega Sale', 1.4, 'Buy 1 Get 1 on ice creams')],
    'June': [('Monsoon Prep', 1.2, 'Umbrella and rain gear offers')],
    'August': [('Independence Sale', 1.25, 'Patriotic themed offers')],
    'October': [('Diwali Dhamaka', 1.5, 'Massive festive discounts')],
    'November': [('Black Friday Style', 1.35, 'Electronics and lifestyle deals')],
    'December': [('Year End Clearance', 1.3, 'Clearance sale on seasonal items')],
}


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class Product:
    sku_id: str
    sku_name: str
    category_id: str
    category_name: str
    subcategory: str
    brand: str
    behavior_type: str
    festival_relevance: str
    mrp: float
    selling_price: float
    cost_price: float
    
    
@dataclass  
class MonthlyReport:
    month: str
    year: int
    sku_id: str
    sku_name: str
    category: str
    subcategory: str
    monthly_units_sold: int
    avg_daily_sales: float
    total_revenue: float
    spike_percentage: float
    spike_reason: str
    event_type: str
    inventory_impact: str
    demand_trend: str
    festival_effect: str
    seasonal_effect: str
    promotion_effect: str
    weekend_effect: str
    stockout_days: int
    lost_sales_units: int
    business_notes: str


# ============================================================================
# DATA LOADING
# ============================================================================

def load_products() -> Dict[str, Product]:
    """Load products from PRODUCT_MASTER with category names."""
    products = {}
    
    # Load category mapping
    categories = {}
    cat_file = os.path.join(DATASETS_DIR, 'PRODUCT_CATEGORY.csv')
    with open(cat_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cat_id = row.get('category_id') or row.get('\ufeffcategory_id', '')
            categories[cat_id] = row.get('category_name', cat_id)
    
    # Load products
    prod_file = os.path.join(DATASETS_DIR, 'PRODUCT_MASTER.csv')
    with open(prod_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            sku_id = row.get('sku_id') or row.get('\ufeffsku_id', '')
            if not sku_id or sku_id == 'sku_id':
                continue
            
            cat_id = row.get('category_id', '')
            products[sku_id] = Product(
                sku_id=sku_id,
                sku_name=row.get('sku_name', ''),
                category_id=cat_id,
                category_name=categories.get(cat_id, cat_id),
                subcategory=row.get('subcategory_id', ''),
                brand=row.get('brand', ''),
                behavior_type=row.get('behavior_type', 'Stable_Demand'),
                festival_relevance=row.get('festival_relevance', 'None'),
                mrp=float(row.get('mrp', 0)),
                selling_price=float(row.get('selling_price', 0)),
                cost_price=float(row.get('cost_price', 0))
            )
    
    return products


def get_store_products() -> List[str]:
    """Get list of SKU IDs for D-Mart Singanallur (ST003)."""
    sku_list = []
    dist_file = os.path.join(DATASETS_DIR, 'PRODUCT_DISTRIBUTION.csv')
    
    with open(dist_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            store_id = row.get('store_id', '')
            sku_id = row.get('sku_id') or row.get('\ufeffsku_id', '')
            active = row.get('active_flag', 'true').lower()
            
            if store_id == STORE_ID and active == 'true' and sku_id:
                sku_list.append(sku_id)
    
    return list(set(sku_list))  # Remove duplicates


# ============================================================================
# SALES CALCULATION ENGINE
# ============================================================================

def calculate_festival_impact(
    month_name: str, 
    product: Product, 
    base_sales: int,
    days_in_month: int
) -> Tuple[float, str, str]:
    """
    Calculate festival multiplier and impact description.
    Returns: (multiplier, festival_name, description)
    """
    if month_name not in FESTIVALS:
        return 1.0, 'None', 'No festival this month'
    
    festivals = FESTIVALS[month_name]
    
    for festival in festivals:
        # Check if product matches festival keywords
        # Add spaces to enable word-boundary matching and prevent substring matches
        product_text = f" {product.sku_name} {product.subcategory} {product.festival_relevance} ".lower()
        
        matching_keywords = []
        for kw in festival['products']:
            kw_lower = kw.lower()
            # Check for whole word match (surrounded by spaces or word boundaries)
            # This prevents 'oil' matching inside 'toilet'
            if f" {kw_lower} " in product_text or \
               product_text.startswith(f"{kw_lower} ") or \
               product_text.endswith(f" {kw_lower}"):
                matching_keywords.append(kw)
            # Also check for exact match of compound terms like "coconut oil"
            elif kw_lower in product.sku_name.lower():
                # For compound terms in product name, check it's a real match
                if kw_lower in ["coconut oil", "groundnut oil", "gingelly oil", "pooja oil"]:
                    matching_keywords.append(kw)
        
        if matching_keywords:
            # Calculate festival days impact
            festival_days = festival['end'] - festival['start'] + 1
            normal_days = days_in_month - festival_days
            
            # Weighted average: festival days get multiplier, normal days are baseline
            multiplier = (
                (festival_days * festival['multiplier']) + 
                (normal_days * 1.0)
            ) / days_in_month
            
            desc = f"{festival['name']} demand surge - {', '.join(matching_keywords[:3])}"
            return multiplier, festival['name'], desc
    
    return 1.0, 'None', 'No matching festival products'


def calculate_seasonal_impact(
    season: str, 
    product: Product
) -> Tuple[float, str]:
    """
    Calculate seasonal multiplier based on product keywords.
    Returns: (multiplier, description)
    """
    if season not in SEASONAL_PATTERNS:
        return 1.0, 'No seasonal pattern'
    
    # Add spaces for word-boundary matching
    product_text = f" {product.sku_name} ".lower()
    patterns = SEASONAL_PATTERNS[season]
    
    for keyword, multiplier in patterns.items():
        kw_lower = keyword.lower()
        # Check for whole word match with spaces (prevents partial matches)
        if f" {kw_lower} " in product_text or \
           product_text.startswith(f"{kw_lower} ") or \
           product_text.endswith(f" {kw_lower}"):
            return multiplier, f"{season} demand - {keyword}"
    
    return 1.0, f'No {season} relevance'


def calculate_promotion_impact(
    month_name: str,
    product: Product
) -> Tuple[float, str, str]:
    """
    Calculate promotion multiplier if applicable.
    Returns: (multiplier, promo_name, description)
    """
    if month_name not in PROMOTIONS:
        return 1.0, 'None', 'No promotion this month'
    
    promotions = PROMOTIONS[month_name]
    
    # Randomly select if this product gets promotion benefit
    if random.random() < 0.3:  # 30% of products get promoted
        promo = random.choice(promotions)
        
        # Check if promo applies to this category
        promo_cat_boost = {
            'snack': ['CAT04'],
            'beverage': ['CAT03'],
            'ice cream': ['CAT08'],
            'umbrella': ['CAT12'],
            'electronics': ['CAT11'],
            'lifestyle': ['CAT12']
        }
        
        applicable = False
        promo_text = promo[2].lower()
        for keyword, cats in promo_cat_boost.items():
            if keyword in promo_text and product.category_id in cats:
                applicable = True
                break
        
        # ONLY apply promotion if category matches - no random fallback
        if applicable:
            return promo[1], promo[0], promo[2]
    
    return 1.0, 'None', 'No promotion for this product'


def calculate_weekend_effect(
    days_in_month: int,
    category_id: str,
    behavior_type: str
) -> Tuple[float, str]:
    """
    Calculate average weekend uplift for the month.
    Returns: (weekend_multiplier, description)
    """
    # Approximate 8-9 weekends per month
    weekend_days = min(9, days_in_month // 4 + 2)
    weekday_days = days_in_month - weekend_days
    
    uplift = WEEKEND_UPLIFT.get(category_id, 1.15)
    
    # Reduce uplift for niche/slow moving items
    if behavior_type in ['Niche', 'Slow_Moving']:
        uplift = 1.0 + (uplift - 1.0) * 0.3
    
    # Weighted average
    avg_multiplier = (weekend_days * uplift + weekday_days * 1.0) / days_in_month
    
    uplift_pct = round((avg_multiplier - 1.0) * 100)
    
    return avg_multiplier, f"{uplift_pct}% avg weekend uplift"


def simulate_inventory_impact(
    base_demand: int,
    month_name: str,
    product: Product
) -> Tuple[int, int, int, str]:
    """
    Simulate inventory constraints and stockouts.
    Returns: (actual_sales, lost_sales, stockout_days, impact_desc)
    """
    # Determine stockout probability based on behavior type
    if product.behavior_type == 'Fast_Moving':
        stockout_prob = 0.08  # Higher chance for fast movers
    elif product.behavior_type == 'Seasonal' and month_name in ['January', 'October', 'March']:
        stockout_prob = 0.12  # High during festival months
    else:
        stockout_prob = STOCKOUT_PROBABILITY
    
    # Check if stockout occurs
    if random.random() < stockout_prob:
        stockout_days = random.randint(2, 5)
        
        # Lost sales during stockout (partial fulfillment)
        daily_demand = base_demand // 30
        lost_sales = daily_demand * stockout_days * random.randint(60, 90) // 100
        actual_sales = base_demand - lost_sales
        
        return actual_sales, lost_sales, stockout_days, \
               f"Stockout for {stockout_days} days - lost {lost_sales} units"
    
    # Check for low stock (partial impact)
    if random.random() < LOW_STOCK_THRESHOLD:
        impact_factor = random.uniform(0.90, 0.98)
        actual_sales = int(base_demand * impact_factor)
        lost_sales = base_demand - actual_sales
        return actual_sales, lost_sales, 0, \
               f"Low stock impact - {lost_sales} units missed opportunity"
    
    return base_demand, 0, 0, "Adequate inventory maintained"


def determine_demand_trend(
    current_sales: int,
    baseline: int,
    month_idx: int,
    product: Product
) -> str:
    """Determine demand trend classification."""
    variance = (current_sales - baseline) / baseline if baseline > 0 else 0
    
    if variance > 0.5:
        return "Strong Increase"
    elif variance > 0.2:
        return "Moderate Increase"
    elif variance > -0.1:
        return "Stable"
    elif variance > -0.3:
        return "Moderate Decline"
    else:
        return "Significant Decline"


def generate_business_notes(
    product: Product,
    festival: str,
    seasonal: str,
    promo: str,
    inventory: str,
    spike_pct: float
) -> str:
    """Generate comprehensive business notes explaining sales behavior."""
    notes = []
    
    if festival != 'None':
        notes.append(f"Festival demand: {festival}")
    
    if 'Summer' in seasonal or 'Monsoon' in seasonal or 'Winter' in seasonal:
        notes.append(f"Seasonal factor: {seasonal}")
    
    if promo != 'None':
        notes.append(f"Promotion active: {promo}")
    
    if 'Stockout' in inventory:
        notes.append(f"Inventory issue: {inventory}")
    
    if spike_pct > 50:
        notes.append("Significant demand spike - review forecast")
    elif spike_pct < -20:
        notes.append("Demand below baseline - investigate cause")
    
    if product.behavior_type == 'Niche':
        notes.append("Niche product - irregular demand pattern")
    
    return "; ".join(notes) if notes else "Normal trading pattern"


# ============================================================================
# MAIN GENERATION ENGINE
# ============================================================================

def generate_monthly_report(
    year: int,
    month_idx: int,
    product: Product,
    products: Dict[str, Product]
) -> MonthlyReport:
    """Generate a single monthly report entry for a product."""
    
    month_name, days_in_month, season = MONTHS[month_idx]
    
    # Get baseline daily range for this behavior type
    baseline_range = BEHAVIOR_BASELINE.get(product.behavior_type, (10, 25))
    baseline_daily = random.randint(baseline_range[0], baseline_range[1])
    
    # Calculate base monthly sales
    base_monthly = baseline_daily * days_in_month
    
    # Apply various multipliers
    festival_mult, festival_name, festival_desc = calculate_festival_impact(
        month_name, product, base_monthly, days_in_month
    )
    
    seasonal_mult, seasonal_desc = calculate_seasonal_impact(season, product)
    
    promo_mult, promo_name, promo_desc = calculate_promotion_impact(month_name, product)
    
    weekend_mult, weekend_desc = calculate_weekend_effect(
        days_in_month, product.category_id, product.behavior_type
    )
    
    # Combine multipliers
    total_multiplier = festival_mult * seasonal_mult * promo_mult * weekend_mult
    
    # Add randomness (±15%)
    noise = random.uniform(0.85, 1.15)
    
    adjusted_demand = int(base_monthly * total_multiplier * noise)
    
    # Apply inventory constraints
    actual_sales, lost_sales, stockout_days, inventory_impact = \
        simulate_inventory_impact(adjusted_demand, month_name, product)
    
    # Calculate metrics
    avg_daily = round(actual_sales / days_in_month, 1)
    revenue = round(actual_sales * product.selling_price, 2)
    
    # Calculate spike percentage vs baseline
    baseline_sales = base_monthly
    spike_pct = round(((actual_sales - baseline_sales) / baseline_sales) * 100, 1)
    
    # Determine primary event type
    if festival_name != 'None':
        event_type = f"Festival - {festival_name}"
    elif promo_name != 'None':
        event_type = f"Promotion - {promo_name}"
    elif abs(seasonal_mult - 1.0) > 0.2:
        event_type = f"Seasonal - {season}"
    elif spike_pct > 20:
        event_type = "Weekend/Demand Surge"
    else:
        event_type = "Normal Trading"
    
    # Build spike reason
    reasons = []
    if festival_name != 'None':
        reasons.append(festival_desc)
    if seasonal_mult > 1.1:
        reasons.append(seasonal_desc)
    if promo_name != 'None':
        reasons.append(promo_desc)
    if not reasons:
        reasons.append("Regular consumer demand")
    
    spike_reason = "; ".join(reasons[:2])
    
    # Determine trend
    demand_trend = determine_demand_trend(actual_sales, baseline_sales, month_idx, product)
    
    # Generate comprehensive notes
    business_notes = generate_business_notes(
        product, festival_name, seasonal_desc, promo_name, inventory_impact, spike_pct
    )
    
    return MonthlyReport(
        month=month_name,
        year=year,
        sku_id=product.sku_id,
        sku_name=product.sku_name,
        category=product.category_name,
        subcategory=product.subcategory,
        monthly_units_sold=actual_sales,
        avg_daily_sales=avg_daily,
        total_revenue=revenue,
        spike_percentage=spike_pct,
        spike_reason=spike_reason,
        event_type=event_type,
        inventory_impact=inventory_impact,
        demand_trend=demand_trend,
        festival_effect=festival_name if festival_name != 'None' else 'None',
        seasonal_effect=seasonal_desc,
        promotion_effect=promo_name if promo_name != 'None' else 'None',
        weekend_effect=weekend_desc,
        stockout_days=stockout_days,
        lost_sales_units=lost_sales,
        business_notes=business_notes
    )


def generate_all_reports(year: int = 2024, sample_mode: bool = False) -> List[MonthlyReport]:
    """Generate monthly reports for all products across all months."""
    
    print(f"Loading product data...")
    products = load_products()
    store_skus = get_store_products()
    
    print(f"Found {len(store_skus)} products for {STORE_NAME}")
    
    if sample_mode:
        # For testing, limit to 50 products
        store_skus = store_skus[:50]
        print(f"SAMPLE MODE: Processing {len(store_skus)} products")
    
    reports = []
    total_iterations = len(store_skus) * 12
    processed = 0
    
    for month_idx in range(12):
        month_name = MONTHS[month_idx][0]
        print(f"\nProcessing {month_name} {year}...")
        
        for sku_id in store_skus:
            if sku_id not in products:
                continue
            
            product = products[sku_id]
            report = generate_monthly_report(year, month_idx, product, products)
            reports.append(report)
            
            processed += 1
            if processed % 500 == 0:
                print(f"  Progress: {processed}/{total_iterations} reports generated")
    
    return reports


def save_reports_to_csv(reports: List[MonthlyReport], filename: str = None):
    """Save generated reports to CSV file."""
    
    if filename is None:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"monthly_sales_summary_{STORE_ID}_{timestamp}.csv"
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    if not reports:
        print("No reports to save!")
        return
    
    # Get field names from dataclass
    fieldnames = list(asdict(reports[0]).keys())
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for report in reports:
            writer.writerow(asdict(report))
    
    print(f"\nSaved {len(reports)} monthly reports to: {filepath}")
    
    # Print summary statistics
    print_summary(reports)
    
    return filepath


def print_summary(reports: List[MonthlyReport]):
    """Print summary statistics of the generated reports."""
    
    total_revenue = sum(r.total_revenue for r in reports)
    total_units = sum(r.monthly_units_sold for r in reports)
    total_lost = sum(r.lost_sales_units for r in reports)
    
    festival_reports = [r for r in reports if r.festival_effect != 'None']
    promo_reports = [r for r in reports if r.promotion_effect != 'None']
    stockout_reports = [r for r in reports if r.stockout_days > 0]
    
    print("\n" + "="*60)
    print("MONTHLY SALES SUMMARY REPORT - STATISTICS")
    print("="*60)
    print(f"Store: {STORE_NAME} ({STORE_ID})")
    print(f"Total Reports Generated: {len(reports)}")
    print(f"Period Covered: 12 months")
    print(f"Products Covered: {len(reports) // 12}")
    print(f"\nTotal Revenue: ₹{total_revenue:,.2f}")
    print(f"Total Units Sold: {total_units:,}")
    print(f"Total Lost Sales: {total_lost:,} units")
    
    print(f"\nFestival Impact Reports: {len(festival_reports)} ({len(festival_reports)*100//len(reports)}%)")
    print(f"Promotion Impact Reports: {len(promo_reports)} ({len(promo_reports)*100//len(reports)}%)")
    print(f"Stockout Incidents: {len(stockout_reports)} ({len(stockout_reports)*100//len(reports)}%)")
    
    # Monthly breakdown
    print("\nMonthly Unit Sales Breakdown:")
    for month_idx in range(12):
        month_name = MONTHS[month_idx][0]
        month_reports = [r for r in reports if r.month == month_name]
        month_units = sum(r.monthly_units_sold for r in month_reports)
        month_revenue = sum(r.total_revenue for r in month_reports)
        print(f"  {month_name:12s}: {month_units:8,} units | ₹{month_revenue:12,.0f}")
    
    print("="*60)


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == '__main__':
    import sys
    
    # Allow sample mode for testing
    sample_mode = '--sample' in sys.argv
    year = 2024
    
    if '--year' in sys.argv:
        year_idx = sys.argv.index('--year')
        if year_idx + 1 < len(sys.argv):
            year = int(sys.argv[year_idx + 1])
    
    print("="*70)
    print("D-MART SINGANALLUR - MONTHLY SALES SUMMARY GENERATOR")
    print("="*70)
    print(f"Generating reports for year: {year}")
    if sample_mode:
        print("SAMPLE MODE ENABLED (50 products only)")
    print("="*70)
    
    # Generate reports
    reports = generate_all_reports(year=year, sample_mode=sample_mode)
    
    # Save to file
    output_file = save_reports_to_csv(reports)
    
    print(f"\nOutput saved to: {output_file}")
    print("\nGeneration complete!")
