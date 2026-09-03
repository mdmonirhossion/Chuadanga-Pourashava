const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  updateUserStatus,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/users", protect, authorize("admin"), getUsers);
router.put("/users/:id", protect, authorize("admin"), updateUserStatus);

module.exports = router;
