const Item = require("../models/Item");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Supplier = require("../models/Supplier");
const Issue = require("../models/Issue");
const Return = require("../models/Return");
const StockTransaction = require("../models/StockTransaction");

const getDashboardStats = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments({ status: "active" });
    const totalEmployees = await Employee.countDocuments({ status: "active" });
    const totalDepartments = await Department.countDocuments({ status: "active" });
    const totalSuppliers = await Supplier.countDocuments({ status: "active" });

    const items = await Item.find({ status: "active" });
    let totalStockQty = 0;
    let lowStockCount = 0;
    let totalDamagedQty = 0;
    let totalLostQty = 0;

    items.forEach((item) => {
      totalStockQty += item.currentStock || 0;
      totalDamagedQty += item.damagedStock || 0;
      totalLostQty += item.lostStock || 0;
      if (item.currentStock <= item.minimumStock) {
        lowStockCount++;
      }
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayIssuesCount = await Issue.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    const todayReturnsCount = await Return.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
    });

    const recentTransactions = await StockTransaction.find()
      .populate("item")
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    const lowStockItems = await Item.find({
      $expr: { $lte: ["$currentStock", "$minimumStock"] },
    })
      .populate("category")
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalItems,
        totalEmployees,
        totalDepartments,
        totalSuppliers,
        totalStockQty,
        lowStockCount,
        todayIssuesCount,
        todayReturnsCount,
        totalDamagedQty,
        totalLostQty,
      },
      recentTransactions,
      lowStockItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
