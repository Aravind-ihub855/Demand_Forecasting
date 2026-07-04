export const MOCK_DEMAND_INTELLIGENCE = {
  kpis: {
    total_products_analyzed: 46,
    validated_products: 7,
    new_product_opportunities: 11,
    missed_historical_products: 6,
    season_omitted_products: 2,
    store_omitted_products: 20,
    top_priority_products: 5,
    immediate_procurement_products: 25,
    near_festival_procurement_products: 12,
    high_risk_products: 8,
    perishable_products: 10,
    non_perishable_products: 27,
    trending_opportunities: 10,
    trending_inventory_plans: 10,
    supply_chain_total_products: 26,
    supply_chain_inventory_products: 14,
    supply_chain_candidate_products: 12,
    critical_products: 3,
    emergency_procurement: 2,
    warehouse_transfer: 3,
    vendor_onboarding: 2,
    new_sku_launch: 2,
    safe_inventory: 4
  },
  executive_summary: {
    festival: "Pongal",
    store: "D-Mart Saravanampatti",
    forecast_confidence: "High",
    overall_demand_outlook:
      "Aggressive growth expected with a 2.5x demand multiplier, specifically in staples and convenience-led festive items.",
    key_finding:
      "The IT corridor demographic necessitates a shift from traditional raw ritual items (clay pots, sugarcane) toward high-quality staples, ready-to-eat snacks, and gifting assortments.",
    festival_period: "14/01/2027 - 17/01/2027",
    planning_date: "2026-11-15",
    days_remaining: 60
  },
  inventory_summary: {
    immediate_procurement_products: 25,
    near_festival_procurement_products: 12,
    high_risk_products: 8,
    perishable_products: 10,
    non_perishable_products: 27
  },
  historical_data_layer: {
    historical_products: [
      { sku_id: "SKU0001", sku_name: "Raw Rice (Ponni)", category: "Rice & Staples", normal_sales: 3425, peak_sales: 9384, spike_percentage: 174, driver_type: "festival" },
      { sku_id: "SKU0002", sku_name: "Sona Masoori Rice", category: "Rice & Staples", normal_sales: 3065, peak_sales: 4086, spike_percentage: 33, driver_type: "daily" },
      { sku_id: "SKU0003", sku_name: "Moong Dal", category: "Pulses", normal_sales: 4674, peak_sales: 15980, spike_percentage: 242, driver_type: "festival" },
      { sku_id: "SKU0004", sku_name: "Jaggery Blocks", category: "Sweeteners", normal_sales: 2488, peak_sales: 7736, spike_percentage: 211, driver_type: "festival" },
      { sku_id: "SKU0005", sku_name: "Ghee", category: "Dairy", normal_sales: 2177, peak_sales: 4789, spike_percentage: 120, driver_type: "festival" },
      { sku_id: "SKU0006", sku_name: "Cashew Nuts", category: "Dry Fruits", normal_sales: 3560, peak_sales: 8649, spike_percentage: 143, driver_type: "festival" },
      { sku_id: "SKU0007", sku_name: "Raisins", category: "Dry Fruits", normal_sales: 4668, peak_sales: 13832, spike_percentage: 196, driver_type: "festival" },
      { sku_id: "SKU0008", sku_name: "Sugar", category: "Sweeteners", normal_sales: 5061, peak_sales: 16123, spike_percentage: 219, driver_type: "festival" },
      { sku_id: "SKU0009", sku_name: "Milk", category: "Dairy", normal_sales: 1894, peak_sales: 2585, spike_percentage: 36, driver_type: "daily" },
      { sku_id: "SKU0010", sku_name: "Curd", category: "Dairy", normal_sales: 4227, peak_sales: 5574, spike_percentage: 32, driver_type: "daily" },
      { sku_id: "SKU0011", sku_name: "Butter", category: "Dairy", normal_sales: 4888, peak_sales: 6594, spike_percentage: 35, driver_type: "daily" },
      { sku_id: "SKU0012", sku_name: "Paneer", category: "Dairy", normal_sales: 4591, peak_sales: 7722, spike_percentage: 68, driver_type: "daily" },
      { sku_id: "SKU0013", sku_name: "Sunflower Oil", category: "Edible Oil", normal_sales: 4109, peak_sales: 5134, spike_percentage: 25, driver_type: "daily" },
      { sku_id: "SKU0014", sku_name: "Groundnut Oil", category: "Edible Oil", normal_sales: 3185, peak_sales: 9776, spike_percentage: 207, driver_type: "festival" },
      { sku_id: "SKU0016", sku_name: "Bru Instant Coffee", category: "Beverages", normal_sales: 3260, peak_sales: 4292, spike_percentage: 32, driver_type: "daily" },
      { sku_id: "SKU0019", sku_name: "Bread", category: "Bakery", normal_sales: 5269, peak_sales: 8312, spike_percentage: 58, driver_type: "daily" },
      { sku_id: "SKU0020", sku_name: "Eggs", category: "Dairy & Eggs", normal_sales: 3987, peak_sales: 5809, spike_percentage: 46, driver_type: "daily" },
      { sku_id: "SKU0032", sku_name: "Mixture", category: "Snacks", normal_sales: 5252, peak_sales: 17191, spike_percentage: 227, driver_type: "festival" },
      { sku_id: "SKU0033", sku_name: "Murukku", category: "Snacks", normal_sales: 2107, peak_sales: 4675, spike_percentage: 122, driver_type: "festival" },
      { sku_id: "SKU0038", sku_name: "Apples", category: "Fruits", normal_sales: 4131, peak_sales: 10702, spike_percentage: 159, driver_type: "season" },
      { sku_id: "SKU0052", sku_name: "Ice Cream Family Packs", category: "Frozen Foods", normal_sales: 3859, peak_sales: 8898, spike_percentage: 131, driver_type: "season" },
      { sku_id: "SKU0053", sku_name: "Chocolates Gift Packs", category: "Confectionery", normal_sales: 4334, peak_sales: 9641, spike_percentage: 122, driver_type: "festival" },
      { sku_id: "SKU0054", sku_name: "Dry Fruits Gift Boxes", category: "Dry Fruits", normal_sales: 2778, peak_sales: 9274, spike_percentage: 234, driver_type: "festival" }
    ]
  },
  festival_layer: {
    festival_products: [
      { product_name: "Raw Rice (Pachai Arisi)", category: "Grocery - Staples", confidence_score: 99, reason: "Core ingredient for making the traditional Sakkarai Pongal dish." },
      { product_name: "Jaggery (Vellam) - Blocks & Powder", category: "Grocery - Staples", confidence_score: 99, reason: "Essential sweetener for Pongal preparations; high demand in Coimbatore region." },
      { product_name: "Moong Dal (Paasi Paruppu)", category: "Grocery - Staples", confidence_score: 98, reason: "Key protein component for both Sweet and Ven Pongal." },
      { product_name: "Ghee (Clarified Butter)", category: "Dairy & FMCG", confidence_score: 98, reason: "Heavy usage in festival cooking and traditional sweets." },
      { product_name: "Cashew Nuts", category: "Dry Fruits", confidence_score: 95, reason: "Primary garnishing for Pongal and festive desserts." },
      { product_name: "Raisins (Kishmish)", category: "Dry Fruits", confidence_score: 95, reason: "Essential ingredient for traditional Tamil festive sweets." },
      { product_name: "Cardamom (Elaichi)", category: "Spices", confidence_score: 94, reason: "Key aromatic spice for flavoring the Pongal pot." },
      { product_name: "Turmeric Bunches (Manjal Kothu)", category: "Fresh Produce / Religious", confidence_score: 97, reason: "Tied around the Pongal pot as per Tamil tradition." },
      { product_name: "Sugarcane Stalks", category: "Fresh Produce", confidence_score: 99, reason: "The iconic symbol of the harvest festival; high demand for full stalks." },
      { product_name: "Clay Pots (Pongal Paanai)", category: "Household / Traditional", confidence_score: 92, reason: "Traditional vessel used for boiling the first rice of the harvest." },
      { product_name: "Stainless Steel Cooking Pots", category: "Home & Kitchen", confidence_score: 90, reason: "Modern alternative for IT professionals living in Saravanampatti apartments." },
      { product_name: "Rangoli Colors (Kolam Maavu)", category: "Home Needs", confidence_score: 96, reason: "Used for elaborate Kolams (floor art) during the 4-day festival." },
      { product_name: "Refined Sunflower Oil (5L Packs)", category: "Grocery - Staples", confidence_score: 95, reason: "Bulk purchase for deep-frying festive snacks like Vada and Murukku." },
      { product_name: "Urad Dal (Ulundhu)", category: "Grocery - Staples", confidence_score: 94, reason: "Main ingredient for Medu Vada, a staple breakfast item during Pongal." },
      { product_name: "Sweet Box Assortments", category: "FMCG - Packaged Food", confidence_score: 88, reason: "Gifting culture among IT professionals and corporate employees." },
      { product_name: "Savory Snacks (Murukku/Mixture)", category: "FMCG - Packaged Food", confidence_score: 92, reason: "Traditional Tamil snacks consumed during family gatherings." },
      { product_name: "Vermicelli (Semiya)", category: "Grocery - Staples", confidence_score: 89, reason: "Used for making Payasam (kheer) as a quick dessert." },
      { product_name: "Condensed Milk", category: "Dairy / FMCG", confidence_score: 87, reason: "Modern convenience for making sweets in urban households." },
      { product_name: "Men's Cotton Dhotis (Veshti)", category: "Apparel", confidence_score: 94, reason: "Traditional attire worn by men during Pongal celebrations." },
      { product_name: "Women's Ethnic Wear / Sarees", category: "Apparel", confidence_score: 93, reason: "High demand for traditional clothing for festival visits." },
      { product_name: "Floor Cleaners & Disinfectants", category: "Home Care", confidence_score: 90, reason: "Pre-festival deep cleaning of homes (Bhogi tradition)." },
      { product_name: "Detergent Powder (Bulk Packs)", category: "Home Care", confidence_score: 88, reason: "Cleaning of curtains, bedsheets, and new clothes for the festival." },
      { product_name: "Soft Drinks (2L PET Bottles)", category: "Beverages", confidence_score: 91, reason: "High consumption during family get-togethers and feasts." },
      { product_name: "Fruit Juices (Tetra Packs)", category: "Beverages", confidence_score: 89, reason: "Healthier beverage option for IT professional families." },
      { product_name: "Milk (Full Cream)", category: "Dairy", confidence_score: 98, reason: "Essential for the 'overflowing' milk ritual (Pongalo Pongal)." }
    ]
  },
  season_layer: {
    season_approved_products: [
      { product_name: "Raw Rice (Pachai Arisi)", category: "Grocery - Staples", confidence_score: 99 },
      { product_name: "Jaggery (Vellam) - Blocks & Powder", category: "Grocery - Staples", confidence_score: 99 },
      { product_name: "Moong Dal (Paasi Paruppu)", category: "Grocery - Staples", confidence_score: 98 },
      { product_name: "Ghee (Clarified Butter)", category: "Dairy & FMCG", confidence_score: 98 },
      { product_name: "Cashew Nuts", category: "Dry Fruits", confidence_score: 95 },
      { product_name: "Raisins (Kishmish)", category: "Dry Fruits", confidence_score: 95 },
      { product_name: "Cardamom (Elaichi)", category: "Spices", confidence_score: 94 },
      { product_name: "Turmeric Bunches (Manjal Kothu)", category: "Fresh Produce / Religious", confidence_score: 97 },
      { product_name: "Sugarcane Stalks", category: "Fresh Produce", confidence_score: 99 },
      { product_name: "Clay Pots (Pongal Paanai)", category: "Household / Traditional", confidence_score: 92 },
      { product_name: "Stainless Steel Cooking Pots", category: "Home & Kitchen", confidence_score: 90 },
      { product_name: "Rangoli Colors (Kolam Maavu)", category: "Home Needs", confidence_score: 96 },
      { product_name: "Refined Sunflower Oil (5L Packs)", category: "Grocery - Staples", confidence_score: 95 },
      { product_name: "Urad Dal (Ulundhu)", category: "Grocery - Staples", confidence_score: 94 },
      { product_name: "Sweet Box Assortments", category: "FMCG - Packaged Food", confidence_score: 88 },
      { product_name: "Savory Snacks (Murukku/Mixture)", category: "FMCG - Packaged Food", confidence_score: 92 },
      { product_name: "Vermicelli (Semiya)", category: "Grocery - Staples", confidence_score: 89 },
      { product_name: "Condensed Milk", category: "Dairy / FMCG", confidence_score: 87 },
      { product_name: "Men's Cotton Dhotis (Veshti)", category: "Apparel", confidence_score: 94 },
      { product_name: "Women's Ethnic Wear / Sarees", category: "Apparel", confidence_score: 93 },
      { product_name: "Floor Cleaners & Disinfectants", category: "Home Care", confidence_score: 90 },
      { product_name: "Detergent Powder (Bulk Packs)", category: "Home Care", confidence_score: 88 },
      { product_name: "Milk (Full Cream)", category: "Dairy", confidence_score: 98 }
    ],
    season_omitted_products: [
      { product_name: "Soft Drinks (2L PET Bottles)", category: "Beverages", confidence_score: 91, reason: "Cold beverages experience significantly reduced demand during the winter season due to weather influence and health concerns." },
      { product_name: "Fruit Juices (Tetra Packs)", category: "Beverages", confidence_score: 89, reason: "Consumer preference shifts away from chilled packaged juices toward warm beverages during the winter months." }
    ]
  },
  store_layer: {
    store_approved_products: [
      { product_name: "Raw Rice (Pachai Arisi)", category: "Grocery - Staples", confidence_score: 99 },
      { product_name: "Jaggery (Vellam) - Blocks & Powder", category: "Grocery - Staples", confidence_score: 99 },
      { product_name: "Moong Dal (Paasi Paruppu)", category: "Grocery - Staples", confidence_score: 98 },
      { product_name: "Ghee (Clarified Butter)", category: "Dairy & FMCG", confidence_score: 98 },
      { product_name: "Cashew Nuts", category: "Dry Fruits", confidence_score: 95 },
      { product_name: "Raisins (Kishmish)", category: "Dry Fruits", confidence_score: 95 },
      { product_name: "Cardamom (Elaichi)", category: "Spices", confidence_score: 94 },
      { product_name: "Refined Sunflower Oil (5L Packs)", category: "Grocery - Staples", confidence_score: 95 },
      { product_name: "Urad Dal (Ulundhu)", category: "Grocery - Staples", confidence_score: 94 },
      { product_name: "Sweet Box Assortments", category: "FMCG - Packaged Food", confidence_score: 88 },
      { product_name: "Savory Snacks (Murukku/Mixture)", category: "FMCG - Packaged Food", confidence_score: 92 },
      { product_name: "Vermicelli (Semiya)", category: "Grocery - Staples", confidence_score: 89 },
      { product_name: "Condensed Milk", category: "Dairy / FMCG", confidence_score: 87 },
      { product_name: "Floor Cleaners & Disinfectants", category: "Home Care", confidence_score: 90 },
      { product_name: "Detergent Powder (Bulk Packs)", category: "Home Care", confidence_score: 88 },
      { product_name: "Milk (Full Cream)", category: "Dairy", confidence_score: 98 }
    ],
    store_omitted_products: [
      { product_name: "Clay Pots (Pongal Paanai)", category: "Household / Traditional", confidence_score: 92, reason: "IT corridor residents and students living in apartments prefer modern cookware over traditional clay pots due to space and convenience." },
      { product_name: "Sugarcane Stalks", category: "Fresh Produce", confidence_score: 99, reason: "Bulky fresh produce is difficult for the IT professional demographic to transport and process in urban apartments." },
      { product_name: "Turmeric Bunches (Manjal Kothu)", category: "Fresh Produce / Religious", confidence_score: 97, reason: "Highly seasonal and traditional; the target segment (students/IT employees) typically opts for processed turmeric powder." },
      { product_name: "Children's Ethnic Wear (Pattu Pavadai)", category: "Apparel", confidence_score: 92, reason: "The demographic consists largely of young professionals and students; the demand for children's wear is minimal." },
      { product_name: "Banana Leaves", category: "Fresh Produce", confidence_score: 95, reason: "Perishable item with high waste risk; IT employees and students prefer disposable plates." },
      { product_name: "Pooja Thali & Brass Lamps", category: "Home & Kitchen", confidence_score: 85, reason: "High-cost durable goods that are low-frequency purchases for transient student/IT populations." },
      { product_name: "Men's Cotton Dhotis (Veshti)", category: "Apparel", confidence_score: 94, reason: "Low daily relevance for the IT/Student demographic who primarily wear casual attire." },
      { product_name: "Women's Ethnic Wear / Sarees", category: "Apparel", confidence_score: 93, reason: "The target segment prefers modern style boutiques or online marketplaces for custom fashion apparel." }
    ]
  },
  historical_validation_layer: {
    historically_validated_products: [
      { product_name: "Moong Dal (Paasi Paruppu)", normal_sales: 4674, peak_sales: 15980, spike_percentage: 242, driver_type: "festival", expected_demand_level: "Very High" },
      { product_name: "Jaggery Blocks (Vellam)", normal_sales: 2488, peak_sales: 7736, spike_percentage: 211, driver_type: "festival", expected_demand_level: "Very High" },
      { product_name: "Ghee (Clarified Butter)", normal_sales: 2177, peak_sales: 4789, spike_percentage: 120, driver_type: "festival", expected_demand_level: "High" },
      { product_name: "Cashew Nuts", normal_sales: 3560, peak_sales: 8649, spike_percentage: 143, driver_type: "festival", expected_demand_level: "High" },
      { product_name: "Raisins (Kishmish)", normal_sales: 4668, peak_sales: 13832, spike_percentage: 196, driver_type: "festival", expected_demand_level: "High" },
      { product_name: "Milk (Full Cream)", normal_sales: 1894, peak_sales: 2585, spike_percentage: 36, driver_type: "daily", expected_demand_level: "Low" },
      { product_name: "Butter", normal_sales: 4888, peak_sales: 6594, spike_percentage: 35, driver_type: "daily", expected_demand_level: "Low" }
    ],
    new_product_opportunities: [
      { product_name: "Raw Rice (Pachai Arisi)", reason: "Identified by AI agent for Pongal festival staples; not tracked in standard non-festival baselines." },
      { product_name: "Cardamom (Elakkai)", reason: "Critical flavor driver for festive sweets; recommended for bulk display." },
      { product_name: "Refined Sunflower Oil (5L Packs)", reason: "Substantial cooking oil volume shifts predicted due to home deep-frying traditions." },
      { product_name: "Urad Dal (Ulutham Paruppu)", reason: "Key ingredient for festive breakfast items like Vada; omitted in historical baseline." },
      { product_name: "Sweet Boxes (Assorted)", reason: "Gifting behavior indicator spikes in corporate segments; high margins." },
      { product_name: "Savory Snacks (Murukku/Mixture)", reason: "Ready-to-eat convenience snacks preferred by IT workers for get-togethers." },
      { product_name: "Vermicelli (Semiya)", reason: "Essential for quick desserts like payasam; high demand among younger households." },
      { product_name: "Floor Cleaners (Phenyl/Lizol)", reason: "Cleaning season checklist item linked to pre-festival household preparation." },
      { product_name: "Detergent Powder (Bulk Packs)", reason: "High volume purchase for cleaning linens and festival outfits." }
    ],
    missed_historical_products: [
      { product_name: "Sugar", normal_sales: 5061, peak_sales: 16123, spike_percentage: 219, driver_type: "festival", reason: "Strong historical performer with high volume that was omitted from standard AI recommendations." },
      { product_name: "Groundnut Oil", normal_sales: 3185, peak_sales: 9776, spike_percentage: 207, driver_type: "festival", reason: "Preferred local frying oil with a 3x peak spike omitted in initial assortment sweeps." },
      { product_name: "Mixture", normal_sales: 5252, peak_sales: 17191, spike_percentage: 227, driver_type: "festival", reason: "Niche traditional savory item showing consistent peaks during festival evenings." },
      { product_name: "Murukku", normal_sales: 2107, peak_sales: 4675, spike_percentage: 122, driver_type: "festival", reason: "High-volume traditional snack showing spikes but bypassed by automation models." },
      { product_name: "Chocolates Gift Packs", normal_sales: 4334, peak_sales: 9641, spike_percentage: 122, driver_type: "festival", reason: "Corporate/IT gift standard; massive peak overlooked in daily sales trackers." },
      { product_name: "Dry Fruits Gift Boxes", normal_sales: 2778, peak_sales: 9274, spike_percentage: 234, driver_type: "festival", reason: "Premium gifting option with high seasonal spike omitted due to niche categories." }
    ],
    trending_product_opportunities: [
      { product_name: "Millet Pongal Mix", category: "Ready-To-Cook", trend_score: 94, trend_type: "Health Trends", trend_reason: "Surge in consumer preference for traditional millet-based foods and health-conscious grains.", business_relevance: "High margin, appeals to the IT corridor fitness demographic.", risk_signal: "Supply Chain Risks" },
      { product_name: "A2 Ghee", category: "Dairy", trend_score: 92, trend_type: "Health Trends", trend_reason: "Growing demand for organic and native breed A2 dairy products over standard commercial fats.", business_relevance: "Premium pricing tier with 40% higher margins than standard ghee.", risk_signal: "Logistics Risks" },
      { product_name: "Dry Fruit Gift Boxes", category: "Dry Fruits", trend_score: 88, trend_type: "Gifting Trends", trend_reason: "Shift towards wellness gifting instead of traditional high-sugar sweets.", business_relevance: "High volume velocity during pre-festival weeks.", risk_signal: "" },
      { product_name: "Instant Oats Pongal", category: "Ready-To-Eat", trend_score: 85, trend_type: "Convenience Trends", trend_reason: "Younger consumer segment preferring quick-preparation breakfast alternatives.", business_relevance: "High shelf stability and rapid retail turnover.", risk_signal: "Crop Failure Risks" },
      { product_name: "Organic Jaggery Powder", category: "Sweeteners", trend_score: 91, trend_type: "Health Trends", trend_reason: "Avoidance of refined sugars and chemical-processed sweeteners in traditional sweets.", business_relevance: "Premium staple category expansion.", risk_signal: "Weather Risks" },
      { product_name: "Millet Murukku (Air-Fried)", category: "Snacks", trend_score: 76, trend_type: "Social Media Trends", trend_reason: "Viral healthy snacking trends promoting guilt-free traditional snacks.", business_relevance: "Captures incremental student snack spend.", risk_signal: "Inflation Risks" },
      { product_name: "Biodegradable Pooja Plates", category: "Home Needs", trend_score: 78, trend_type: "Retail Trends", trend_reason: "Eco-friendly retail campaigns and urban plastic ban adherence.", business_relevance: "High volume, low unit cost but excellent cross-sell opportunity.", risk_signal: "Supply Chain Risks" },
      { product_name: "Instant Sambar Paste", category: "Spices & Condiments", trend_score: 82, trend_type: "Convenience Trends", trend_reason: "Convenience-first cooking methods for single-person student/IT households.", business_relevance: "Direct companion to Millet Pongal Mix.", risk_signal: "Crop Failure Risks" },
      { product_name: "Traditional Brass Diyas (Small)", category: "Pooja Essentials", trend_score: 68, trend_type: "Regional Trends", trend_reason: "Local festive shopping spikes driven by traditional home decoration activities.", business_relevance: "Low margin but essential for festive completeness.", risk_signal: "Commodity Risks" },
      { product_name: "Premium Cardamom Pack", category: "Spices", trend_score: 89, trend_type: "Retail Trends", trend_reason: "Premium spice packaging and grade-A quality labeling campaigns.", business_relevance: "Extremely high price-per-kg, low shelf footprint.", risk_signal: "Commodity Risks" }
    ]
  },
  inventory_planning_layer: {
    validated_inventory_plan: [
      { product_name: "Moong Dal (Paasi Paruppu)", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Medium", procurement_strategy: "Bulk Purchase", recommendation: "Pre-order safety stock with 3x buffer" },
      { product_name: "Jaggery Blocks (Vellam)", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Medium", procurement_strategy: "Strategic Stockpile", recommendation: "Secure dry warehouse storage early" },
      { product_name: "Ghee (Clarified Butter)", stock_type: "Semi-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Low", procurement_strategy: "Bulk Buy", recommendation: "Procure standard units with 2x safety multiplier" },
      { product_name: "Cashew Nuts", stock_type: "Non-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Low", procurement_strategy: "Local Supplier Contract", recommendation: "Arrange staggered deliveries" },
      { product_name: "Raisins (Kishmish)", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Low", procurement_strategy: "Bulk Buy", recommendation: "Order 30 days in advance" },
      { product_name: "Milk (Full Cream)", stock_type: "Perishable", stocking_priority: "Low", stocking_window: "Near Festival", risk_level: "High", procurement_strategy: "Just-In-Time", recommendation: "Schedule daily cold chain deliveries" },
      { product_name: "Butter", stock_type: "Perishable", stocking_priority: "Low", stocking_window: "Near Festival", risk_level: "High", procurement_strategy: "Just-In-Time", recommendation: "Verify cold storage buffer capacities" }
    ],
    new_opportunity_inventory_plan: [
      { product_name: "Raw Rice (Pachai Arisi)", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Low", procurement_strategy: "Strategic Stockpile", recommendation: "Procure local Tamil Nadu varieties" },
      { product_name: "Cardamom (Elakkai)", stock_type: "Non-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Low", procurement_strategy: "Local Supplier Contract", recommendation: "Stagger delivery to preserve aroma" },
      { product_name: "Refined Sunflower Oil (5L Packs)", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Low", procurement_strategy: "Bulk Purchase", recommendation: "Secure promotional endcap space" },
      { product_name: "Urad Dal (Ulutham Paruppu)", stock_type: "Non-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Medium", procurement_strategy: "Local Supplier Contract", recommendation: "Align stocking levels with Moong Dal" },
      { product_name: "Sweet Boxes (Assorted)", stock_type: "Semi-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Medium", procurement_strategy: "Just-In-Time", recommendation: "Procure from local premium sweet shops" },
      { product_name: "Savory Snacks (Murukku/Mixture)", stock_type: "Semi-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Low", procurement_strategy: "Local Supplier Contract", recommendation: "Display near beverages sections" },
      { product_name: "Vermicelli (Semiya)", stock_type: "Non-Perishable", stocking_priority: "Low", stocking_window: "Near Festival", risk_level: "Low", procurement_strategy: "On-demand ordering", recommendation: "Stock standard volumes, no extra safety buffer" },
      { product_name: "Floor Cleaners (Phenyl/Lizol)", stock_type: "Non-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Low", procurement_strategy: "Bulk Buy", recommendation: "Position as pre-festival home cleaning essential" },
      { product_name: "Detergent Powder (Bulk Packs)", stock_type: "Non-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Low", procurement_strategy: "Bulk Buy", recommendation: "Offer bundle discounts with home care items" }
    ],
    missed_historical_inventory_plan: [
      { product_name: "Sugar", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Medium", procurement_strategy: "Bulk Purchase", recommendation: "Increase safety stock by 3x immediately" },
      { product_name: "Groundnut Oil", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Low", procurement_strategy: "Strategic Stockpile", recommendation: "Secure 5L bulk containers" },
      { product_name: "Mixture", stock_type: "Semi-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Medium", procurement_strategy: "Just-In-Time", recommendation: "Arrange staggered daily deliveries" },
      { product_name: "Murukku", stock_type: "Semi-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Low", procurement_strategy: "Local Supplier Contract", recommendation: "Maintain 2x buffer stock" },
      { product_name: "Chocolates Gift Packs", stock_type: "Semi-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Low", procurement_strategy: "Bulk Purchase", recommendation: "Create bulk display towers near billing" },
      { product_name: "Dry Fruits Gift Boxes", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Low", procurement_strategy: "Bulk Purchase", recommendation: "Create premium packaging displays at entrance" }
    ],
    trending_product_opportunities_inventory_plan: [
      { product_name: "Millet Pongal Mix", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Medium", procurement_strategy: "Contract farming sourcing", recommendation: "Pre-order safety stock early to meet demand spikes." },
      { product_name: "A2 Ghee", stock_type: "Semi-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Low", procurement_strategy: "Direct dairy sourcing contract", recommendation: "Stock in primary promotional aisles." },
      { product_name: "Dry Fruit Gift Boxes", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Low", procurement_strategy: "Bulk manufacturer sourcing", recommendation: "Setup prominent entrance displays." },
      { product_name: "Instant Oats Pongal", stock_type: "Non-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Low", procurement_strategy: "Local distributor agreements", recommendation: "Display adjacent to raw ingredients." },
      { product_name: "Organic Jaggery Powder", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Medium", procurement_strategy: "Strategic farmer group stockpile", recommendation: "Position as healthy alternative." },
      { product_name: "Millet Murukku (Air-Fried)", stock_type: "Semi-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Low", procurement_strategy: "Co-branded snack suppliers", recommendation: "Bundle with tea/coffee displays." },
      { product_name: "Biodegradable Pooja Plates", stock_type: "Non-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "High", procurement_strategy: "Regional eco-product makers", recommendation: "Cross-sell with camphor and incense." },
      { product_name: "Instant Sambar Paste", stock_type: "Semi-Perishable", stocking_priority: "Medium", stocking_window: "Medium-Term", risk_level: "Medium", procurement_strategy: "Just-in-time delivery contract", recommendation: "Stack next to instant mixes." },
      { product_name: "Traditional Brass Diyas (Small)", stock_type: "Non-Perishable", stocking_priority: "Low", stocking_window: "Near Festival", risk_level: "Low", procurement_strategy: "Wholesale handicraft market buy", recommendation: "Place in checkout queue bins." },
      { product_name: "Premium Cardamom Pack", stock_type: "Non-Perishable", stocking_priority: "High", stocking_window: "Immediate", risk_level: "Medium", procurement_strategy: "Commodity exchange bulk procurement", recommendation: "Secure high-value counter space." }
    ]
  },
  business_insights: [
    { insight: "The Saravanampatti demographic (IT/Students) is moving away from 'Do-It-Yourself' traditional rituals, evidenced by the low demand for clay pots, sugarcane, and labor-intensive vegetables." },
    { insight: "Winter seasonality is negatively impacting the beverage category, with a 90% confidence score in declining sales for aerated drinks and juices." },
    { insight: "Bulk purchasing behavior is evident in staples like Moong Dal and Raisins, suggesting a 'stock-up' mentality before the festival holidays." },
    { insight: "There is a significant gap in the current assortment regarding modern essentials like floor cleaners and bulk detergents which are high-potential new opportunities for urban dwellers." }
  ],
  recommended_actions: [
    { action: "Aggressive Stocking of Staples", reason: "Ensure 3x safety stock for Moong Dal, Jaggery, and Sugar to prevent stock-outs during the 200%+ demand spikes." },
    { action: "Repurpose Traditional Space for Gifting", reason: "Reallocate floor space intended for clay pots and sugarcane to high-margin Dry Fruit and Chocolate Gift Packs." },
    { action: "Introduce 'Convenience' Combo Packs", reason: "Bundle Raw Rice, Moong Dal, Ghee, and Cardamom to cater to time-constrained IT professionals." },
    { action: "De-list/Reduce Cold Beverages", reason: "Minimize inventory of 2L Aerated drinks and Tetra Pack juices to avoid capital blockage during the winter slump." },
    { action: "Cross-Sell Cleaning Supplies", reason: "Place Floor Cleaners and Detergents near the entrance as 'Pre-Festival Home Cleaning' essentials to capture new product opportunity demand." }
  ],
  supply_chain_action_center: {
    summary: {
      total_products: 26,
      inventory_products: 14,
      candidate_products: 12,
      critical_products: 3,
      emergency_procurement: 2,
      warehouse_transfer: 3,
      vendor_onboarding: 2,
      new_sku_launch: 2,
      safe_inventory: 4
    },
    critical_products: [
      {
        product_name: "Moong Dal (Paasi Paruppu)",
        warehouse: "Coimbatore South Hub",
        inventory_health: "Critical",
        procurement_urgency: "High",
        replenishment_quantity: 4500,
        current_stock: 500,
        expected_demand: 5000,
        coverage_percentage: 10,
        recommended_action: "Initiate Emergency Warehouse Pull",
        priority: "Critical"
      },
      {
        product_name: "Jaggery Blocks (Vellam)",
        warehouse: "Saravanampatti Hub",
        inventory_health: "Critical",
        procurement_urgency: "High",
        replenishment_quantity: 3000,
        current_stock: 300,
        expected_demand: 3300,
        coverage_percentage: 9,
        recommended_action: "Local Procurement Fast-track",
        priority: "High"
      },
      {
        product_name: "Turmeric Bunches (Manjal Kothu)",
        warehouse: "Mettupalayam Transit Hub",
        inventory_health: "Critical",
        procurement_urgency: "High",
        replenishment_quantity: 1200,
        current_stock: 150,
        expected_demand: 1350,
        coverage_percentage: 11,
        recommended_action: "Expedite Vendor Delivery",
        priority: "High"
      }
    ],
    emergency_procurement: [
      {
        product_name: "Raw Rice (Pachai Arisi)",
        replenishment_quantity: 12000,
        lead_time_days: 3,
        estimated_stockout_date: "2026-11-02",
        procurement_recommendation: "Purchase from local spot market immediately",
        recommendation: "Purchase from local spot market immediately"
      },
      {
        product_name: "Urad Dal (Ulutham Paruppu)",
        replenishment_quantity: 6000,
        lead_time_days: 2,
        estimated_stockout_date: "2026-11-03",
        procurement_recommendation: "Re-route truck from Pollachi Warehouse",
        recommendation: "Re-route truck from Pollachi Warehouse"
      }
    ],
    warehouse_transfer: [
      {
        product_name: "Moong Dal",
        warehouse: "Saravanampatti Hub",
        source_warehouse: "Pollachi Central Hub",
        destination_warehouse: "Saravanampatti Hub",
        transfer_quantity: 3500,
        transfer_reason: "Surplus stock available at Pollachi Central Hub, ready for local festival demand spike.",
        transfer_required: true,
        priority: "High"
      },
      {
        product_name: "Sunflower Oil",
        warehouse: "Coimbatore South Hub",
        source_warehouse: "Mettupalayam Transit Hub",
        destination_warehouse: "Coimbatore South Hub",
        transfer_quantity: 2500,
        transfer_reason: "Stock re-balancing to match high-density urban buyer demographic.",
        transfer_required: true,
        priority: "Medium"
      },
      {
        product_name: "Sugar",
        warehouse: "Saravanampatti Hub",
        source_warehouse: "Pollachi Central Hub",
        destination_warehouse: "Saravanampatti Hub",
        transfer_quantity: 4000,
        transfer_reason: "Fast replenishment to meet immediate daily demand requirements.",
        transfer_required: true,
        priority: "High"
      }
    ],
    vendor_onboarding: [
      {
        product_name: "Millet Pongal Mix",
        business_opportunity: "High consumer interest in healthy breakfast options during harvest festival",
        suggested_initial_quantity: 1500,
        procurement_strategy: "Local Contract Farmer Group",
        recommendation: "Onboard Organic Farmer Cooperative of Pollachi for direct supply"
      },
      {
        product_name: "Instant Sambar Paste",
        business_opportunity: "Cross-sell bundle companion to quick Pongal mixes for IT demographics",
        suggested_initial_quantity: 2000,
        procurement_strategy: "Regional Packers Network",
        recommendation: "Onboard Priya Foods Tamil Nadu Division for high margin convenience line"
      }
    ],
    new_sku_launch: [
      {
        product_name: "A2 Ghee (Premium Local)",
        suggested_initial_stock: 800,
        launch_priority: "Critical",
        business_reason: "High margin premium dairy category growth in IT demographics",
        recommendation: "Launch A2 Ghee in 250ml and 500ml packs for festive gifting",
        priority: "Critical"
      },
      {
        product_name: "Air-Fried Millet Murukku",
        suggested_initial_stock: 1200,
        launch_priority: "High",
        business_reason: "Social media fitness trend promoting guilt-free traditional snacks",
        recommendation: "Roll out air-fried snacks in promotional endcaps near checkout queues",
        priority: "High"
      }
    ],
    safe_inventory: [
      {
        product_name: "Ghee (Clarified Butter)",
        warehouse: "Coimbatore South Hub",
        days_of_cover: 45,
        inventory_health: "Optimal",
        current_stock: 8000,
        status: "Safe"
      },
      {
        product_name: "Cashew Nuts",
        warehouse: "Saravanampatti Hub",
        days_of_cover: 38,
        inventory_health: "Safe",
        current_stock: 6200,
        status: "Safe"
      },
      {
        product_name: "Raisins (Kishmish)",
        warehouse: "Coimbatore South Hub",
        days_of_cover: 42,
        inventory_health: "Optimal",
        current_stock: 7500,
        status: "Safe"
      },
      {
        product_name: "Condensed Milk",
        warehouse: "Mettupalayam Transit Hub",
        days_of_cover: 50,
        inventory_health: "Optimal",
        current_stock: 3800,
        status: "Safe"
      }
    ],
    recommended_actions: [
      {
        priority: "Critical",
        action: "Initiate Emergency Warehouse Pull",
        title: "Stock Transfer Alert",
        description: "Pull 3,500 units of Moong Dal from Pollachi Central Hub to Saravanampatti to resolve critical 10% coverage gap.",
        affected_products: "Moong Dal"
      },
      {
        priority: "High",
        action: "Spot Market Purchase Order",
        title: "Emergency Procurement",
        description: "Execute spot buy order of 12,000 units of Raw Rice from local mills to cover immediate 3-day lead time shortfall.",
        affected_products: "Raw Rice (Pachai Arisi)"
      },
      {
        priority: "Medium",
        action: "Farmer Group Contract Finalization",
        title: "Vendor Onboarding",
        description: "Sign agreements with Pollachi Organic Farmer Cooperative to secure direct supply of Millet Pongal Mix.",
        affected_products: "Millet Pongal Mix"
      }
    ]
  }
};
