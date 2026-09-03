const express = require("express");
const {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getSuppliers);
router.get("/:id", protect, getSupplier);
router.post(
  "/",
  protect,
  authorize("admin", "storekeeper"),
  createSupplier
);
router.put(
  "/:id",
  protect,
  authorize("admin", "storekeeper"),
  updateSupplier
);
router.delete("/:id", protect, authorize("admin"), deleteSupplier);

module.exports = router;
