const express = require("express");
const {
  getStockTransactions,
  getItemStockMovement,
} = require("../controllers/stockTransactionController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getStockTransactions);
router.get("/item/:itemId", protect, getItemStockMovement);

module.exports = router;
