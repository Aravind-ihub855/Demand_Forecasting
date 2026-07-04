const SalesTransactionMonthly = require("../models/SalesTransactionMonthly");

// Get available filters (years, festivals, months)
exports.getFilters = async (req, res) => {
  try {
    const years = await SalesTransactionMonthly.distinct("year");
    const festivals = await SalesTransactionMonthly.distinct("festival_effect", {
      festival_effect: { $ne: "None" }
    });

    res.json({
      years: years.sort((a, b) => b - a),
      festivals: festivals.filter(f => f && f !== "None"),
      months: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
    });
  } catch (error) {
    console.error("Error getting monthly analysis filters:", error);
    res.status(500).json({ error: "Failed to get filters" });
  }
};

// Chart 1: Festival Spike by Month (X: months, Y: spike percentage)
exports.getFestivalSpikeByMonth = async (req, res) => {
  try {
    const { year = 2024 } = req.query;

    const data = await SalesTransactionMonthly.aggregate([
      {
        $match: {
          year: Number(year),
          festival_effect: { $ne: "None" }
        }
      },
      {
        $group: {
          _id: "$month",
          avgSpike: { $avg: "$spike_percentage" },
          maxSpike: { $max: "$spike_percentage" },
          festivals: { $addToSet: "$festival_effect" }
        }
      },
      {
        $project: {
          month: "$_id",
          spikePercentage: { $round: ["$avgSpike", 1] },
          maxSpike: { $round: ["$maxSpike", 1] },
          festivals: 1,
          _id: 0
        }
      }
    ]);

    // Sort by month order
    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const sortedData = monthOrder.map(month => {
      const found = data.find(d => d.month === month);
      return found || { month, spikePercentage: 0, maxSpike: 0, festivals: [] };
    });

    res.json(sortedData);
  } catch (error) {
    console.error("Error getting festival spike by month:", error);
    res.status(500).json({ error: "Failed to get festival spike data" });
  }
};

// Chart 2: Product Spike by Month (Top products for selected month)
exports.getProductSpikeByMonth = async (req, res) => {
  try {
    const { month, year = 2024 } = req.query;

    if (!month) {
      return res.status(400).json({ error: "Month is required" });
    }

    const data = await SalesTransactionMonthly.find({
      month,
      year: Number(year)
    })
      .select("sku_name spike_percentage festival_effect seasonal_effect promotion_effect")
      .sort({ spike_percentage: -1 })
      .limit(50);

    const formattedData = data.map(item => ({
      productName: item.sku_name,
      spikePercentage: item.spike_percentage,
      festivalEffect: item.festival_effect,
      seasonalEffect: item.seasonal_effect,
      promotionEffect: item.promotion_effect
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error getting product spike by month:", error);
    res.status(500).json({ error: "Failed to get product spike data" });
  }
};

// Chart 3: Product Spike by Festival (Top products for selected festival)
exports.getProductSpikeByFestival = async (req, res) => {
  try {
    const { festival, year = 2024 } = req.query;

    if (!festival) {
      return res.status(400).json({ error: "Festival is required" });
    }

    const data = await SalesTransactionMonthly.find({
      year: Number(year),
      festival_effect: { $regex: festival, $options: "i" }
    })
      .select("sku_name month spike_percentage festival_effect demand_trend")
      .sort({ spike_percentage: -1 })
      .limit(50);

    const formattedData = data.map(item => ({
      productName: item.sku_name,
      month: item.month,
      spikePercentage: item.spike_percentage,
      festivalEffect: item.festival_effect,
      demandTrend: item.demand_trend
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error getting product spike by festival:", error);
    res.status(500).json({ error: "Failed to get product spike by festival" });
  }
};
