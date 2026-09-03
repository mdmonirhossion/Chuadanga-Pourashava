const express = require("express");
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getEmployees);
router.get("/:id", protect, getEmployee);
router.post(
  "/",
  protect,
  authorize("admin", "storekeeper"),
  createEmployee
);
router.put(
  "/:id",
  protect,
  authorize("admin", "storekeeper"),
  updateEmployee
);
router.delete("/:id", protect, authorize("admin"), deleteEmployee);

module.exports = router;
