const express = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getInventoryMeta,
  getWarehouseInventory,
  getStoreInventory,
} = require("../controllers/inventoryController");

const router = express.Router();

router.get("/meta", requireAuth, getInventoryMeta);
router.get("/warehouse/:warehouse_id", requireAuth, getWarehouseInventory);
router.get("/store/:store_id", requireAuth, getStoreInventory);

module.exports = router;

