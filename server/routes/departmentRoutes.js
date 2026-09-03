const express = require("express");
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getDepartments);
router.get("/:id", protect, getDepartment);
router.post(
  "/",
  protect,
  authorize("admin", "storekeeper"),
  createDepartment
);
router.put(
  "/:id",
  protect,
  authorize("admin", "storekeeper"),
  updateDepartment
);
router.delete("/:id", protect, authorize("admin"), deleteDepartment);

module.exports = router;
