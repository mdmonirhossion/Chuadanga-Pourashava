const express = require("express");
const {
  getIssues,
  getIssue,
  createIssue,
} = require("../controllers/issueController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getIssues);
router.get("/:id", protect, getIssue);
router.post(
  "/",
  protect,
  authorize("admin", "storekeeper"),
  createIssue
);

module.exports = router;
