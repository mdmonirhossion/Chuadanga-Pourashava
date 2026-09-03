const express = require("express");
const {
  getPurchases,
  getPurchase,
  createPurchase,
} = require("../controllers/purchaseController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getPurchases);
router.get("/:id", protect, getPurchase);
router.post(
  "/",
  protect,
  authorize("admin", "storekeeper"),
  createPurchase
);

module.exports = router;
