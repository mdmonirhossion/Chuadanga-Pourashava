const express = require("express");
const { getEmployeeLedger } = require("../controllers/employeeLedgerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:employeeId", protect, getEmployeeLedger);

module.exports = router;
