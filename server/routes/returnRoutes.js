const express = require("express");
const {
  getReturns,
  getReturn,
  createReturn,
} = require("../controllers/returnController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getReturns);
router.get("/:id", protect, getReturn);
router.post(
  "/",
  protect,
  authorize("admin", "storekeeper"),
  createReturn
);

module.exports = router;
