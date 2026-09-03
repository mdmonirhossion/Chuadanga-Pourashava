const express = require("express");
const {
  getStockReport,
  getPurchaseReport,
  getIssueReport,
  getReturnReport,
  getDamagedLostReport,
} = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/stock", protect, getStockReport);
router.get("/purchases", protect, getPurchaseReport);
router.get("/issues", protect, getIssueReport);
router.get("/returns", protect, getReturnReport);
router.get("/damaged-lost", protect, getDamagedLostReport);

module.exports = router;
