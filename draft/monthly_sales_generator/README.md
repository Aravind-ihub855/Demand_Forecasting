# Monthly Sales Summary Generator

## Overview

This is an **independent** system that generates realistic monthly retail sales summary reports for D-Mart Singanallur. It works separately from the daily sales generation system and produces aggregated business intelligence data optimized for LLM-based forecasting and planning.

## Purpose

- Reduce data volume before sending to LLM (3,600 monthly rows vs millions of daily transactions)
- Preserve realistic retail business intelligence
- Explain **WHY** sales changed, not just **WHAT** changed
- Generate enterprise-quality analytics reports

## Key Features

### Business Intelligence Included

1. **Festival Effects**
   - Pongal (January): Rice, Jaggery, Sugarcane, Ghee spikes
   - Ramadan (March/April): Dates, Vermicelli, Dry Fruits, Biryani Masala spikes
   - Bakrid (June): Biryani ingredients, Ghee, Soft Drinks
   - Diwali (October/November): Sweets, Ghee, Decorative items, Dry Fruits
   - Christmas (December): Cakes, Chocolates, Gifts

2. **Seasonal Patterns**
   - Summer: Ice cream (+170%), Cold drinks, Watermelon, Electrolytes
   - Monsoon: Umbrellas (+180%), Raincoats, Soup
   - Winter: Blankets, Hot beverages, Dry fruits

3. **Promotions**
   - New Year Sale, Summer Kickoff, Diwali Dhamaka, etc.
   - Realistic promotion multipliers (1.2x - 1.5x)

4. **Weekend Effects**
   - Category-specific weekend uplift percentages
   - Snacks (+60%), Beverages (+40%), Dairy (+25%)

5. **Inventory Impact Simulation**
   - Stockout incidents (5-6% probability)
   - Low stock situations
   - Lost sales tracking
   - Replenishment issues

6. **Random Fluctuations**
   - ±15% noise for realistic variation
   - Non-linear patterns
   - Business anomalies

## Output Format

| Column | Description |
|--------|-------------|
| `month` | Month name |
| `year` | Year |
| `sku_id` | Product SKU identifier |
| `sku_name` | Product name |
| `category` | Product category |
| `subcategory` | Product subcategory |
| `monthly_units_sold` | Total units sold in month |
| `avg_daily_sales` | Average daily sales |
| `total_revenue` | Revenue (selling_price × units) |
| `spike_percentage` | % variance from baseline |
| `spike_reason` | Human-readable explanation |
| `event_type` | Classification (Festival/Promotion/Seasonal/Normal) |
| `inventory_impact` | Stockout days or low stock info |
| `demand_trend` | Trend classification |
| `festival_effect` | Festival name if applicable |
| `seasonal_effect` | Seasonal driver if applicable |
| `promotion_effect` | Promotion name if applicable |
| `weekend_effect` | Weekend uplift % |
| `stockout_days` | Days product was out of stock |
| `lost_sales_units` | Missed sales due to stockout |
| `business_notes` | Comprehensive business context |

## Usage

### Generate Full Dataset (300 products × 12 months = 3,600 reports)

```bash
cd "E:\Vikram\SNSiHub\Demand Forecasting"
python monthly_sales_generator/generate_monthly_reports.py --year 2024
```

### Sample Mode (50 products for testing)

```bash
python monthly_sales_generator/generate_monthly_reports.py --sample --year 2024
```

### Custom Year

```bash
python monthly_sales_generator/generate_monthly_reports.py --year 2025
```

## Output Location

Generated files are saved to:
```
monthly_sales_generator/output/monthly_sales_summary_ST003_YYYYMMDD_HHMMSS.csv
```

## Store Profile

**D-Mart Singanallur (ST003)**
- Location: Singanallur, Coimbatore, Tamil Nadu
- Type: Hypermarket
- Size: 35,000 sq ft
- Avg Daily Customers: 3,400
- Peak Hours: 10:00-13:00
- Demographic: Family residential with bulk shoppers
- Income Segment: Middle

## Sample Data Examples

### Festival Spike - Diwali
```
October, 2024, SKU0018, Ghee 500ml, Grocery
Monthly Units: 2,068 (+178% spike)
Reason: "Diwali demand surge - Ghee; Winter demand - Ghee"
Event Type: "Festival - Diwali"
Business Notes: "Festival demand: Diwali; Significant demand spike - review forecast"
```

### Seasonal Spike - Summer
```
March, 2024, SKU0070, Ice Cream Family Pack 1L, Dairy
Monthly Units: 1,680 (+171% spike)
Reason: "Summer demand - Ice Cream"
Event Type: "Seasonal - Summer"
Inventory Impact: "Stockout for 4 days - lost 190 units"
```

### Normal Trading with Weekend Effect
```
January, 2024, SKU0063, Fresh Milk 500ml, Dairy
Monthly Units: 1,275 (+8.2% from baseline)
Weekend Effect: "7% avg weekend uplift"
Event Type: "Normal Trading"
Business Notes: "Normal trading pattern"
```

## Files

| File | Description |
|------|-------------|
| `generate_monthly_reports.py` | Main generation engine |
| `output/*.csv` | Generated monthly reports |
| `README.md` | This documentation |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONTHLY GENERATOR                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Load Product Master (300 products)                          │
│  2. Filter for ST003 (Singanallur)                              │
│  3. For each month (12):                                        │
│     - Calculate baseline from behavior_type                     │
│     - Apply festival multipliers                                │
│     - Apply seasonal multipliers                                │
│     - Apply promotion multipliers                               │
│     - Apply weekend uplift                                      │
│     - Add randomness (±15%)                                     │
│     - Simulate inventory constraints                            │
│     - Generate business notes                                   │
│  4. Output 3,600 monthly reports                                │
└─────────────────────────────────────────────────────────────────┘
```

## Dependencies

- Python 3.8+
- Standard library only (csv, random, os, datetime, dataclasses)
- No external packages required

## Independence from Daily Sales System

⚠️ **IMPORTANT**: This system operates independently from the daily sales generator.

- Does NOT read daily transaction data
- Does NOT modify existing datasets
- Generates realistic simulated data from scratch
- Uses PRODUCT_MASTER and PRODUCT_DISTRIBUTION for product definitions only

## Statistics (Full Run)

```
Total Reports: 3,600 (300 products × 12 months)
Total Revenue: ₹515,586,695
Total Units Sold: 2,036,460
Lost Sales: 27,651 units (stockouts)
Festival Impact: 246 reports (6.8%)
Promotion Impact: 146 reports (4%)
Stockout Incidents: 220 reports (6%)
```

## LLM Optimization

This data is specifically designed for LLM consumption:

1. **Reduced Volume**: 3,600 rows vs millions of transactions
2. **Rich Context**: Every spike has a business reason
3. **Causal Explanations**: Why demand changed, not just what
4. **Forecasting Ready**: Historical patterns for prediction
5. **Actionable Insights**: Inventory issues, lost sales documented

## License

Internal use for D-Mart demand forecasting system.

## Author

Retail Data Simulation Architect
