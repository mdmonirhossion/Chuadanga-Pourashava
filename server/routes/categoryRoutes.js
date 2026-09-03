const express = require("express");
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getCategories);
router.get("/:id", protect, getCategory);
router.post(
  "/",
  protect,
  authorize("admin", "storekeeper"),
  createCategory
);
router.put(
  "/:id",
  protect,
  authorize("admin", "storekeeper"),
  updateCategory
);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
