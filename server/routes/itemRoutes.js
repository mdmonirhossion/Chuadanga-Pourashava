const express = require("express");
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getItems);
router.get("/:id", protect, getItem);
router.post(
  "/",
  protect,
  authorize("admin", "storekeeper"),
  createItem
);
router.put(
  "/:id",
  protect,
  authorize("admin", "storekeeper"),
  updateItem
);
router.delete("/:id", protect, authorize("admin"), deleteItem);

module.exports = router;
