const Item = require("../models/Item");
const Purchase = require("../models/Purchase");
const Issue = require("../models/Issue");
const Return = require("../models/Return");

const getStockReport = async (req, res) => {
  try {
    const { category, lowStockOnly } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (lowStockOnly === "true") {
      filter.$expr = { $lte: ["$currentStock", "$minimumStock"] };
    }

    const items = await Item.find(filter)
      .populate("category")
      .sort({ name: 1 });

    res.json({
      success: true,
      count: items.length,
      report: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPurchaseReport = async (req, res) => {
  try {
    const { supplier, startDate, endDate } = req.query;
    const filter = {};

    if (supplier) filter.supplier = supplier;
    if (startDate || endDate) {
      filter.purchaseDate = {};
      if (startDate) filter.purchaseDate.$gte = new Date(startDate);
      if (endDate) filter.purchaseDate.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(filter)
      .populate("supplier")
      .populate("items.item")
      .populate("receivedBy", "name email")
      .sort({ purchaseDate: -1 });

    const totalAmount = purchases.reduce(
      (sum, p) => sum + (p.totalAmount || 0),
      0
    );

    res.json({
      success: true,
      count: purchases.length,
      totalAmount,
      report: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getIssueReport = async (req, res) => {
  try {
    const { employee, department, startDate, endDate } = req.query;
    const filter = {};

    if (employee) filter.employee = employee;
    if (department) filter.department = department;
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }

    const issues = await Issue.find(filter)
      .populate("employee")
      .populate("department")
      .populate("items.item")
      .populate("issuedBy", "name email")
      .sort({ issueDate: -1 });

    res.json({
      success: true,
      count: issues.length,
      report: issues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReturnReport = async (req, res) => {
  try {
    const { employee, startDate, endDate } = req.query;
    const filter = {};

    if (employee) filter.employee = employee;
    if (startDate || endDate) {
      filter.returnDate = {};
      if (startDate) filter.returnDate.$gte = new Date(startDate);
      if (endDate) filter.returnDate.$lte = new Date(endDate);
    }

    const returns = await Return.find(filter)
      .populate("issue")
      .populate("employee")
      .populate("items.item")
      .populate("receivedBy", "name email")
      .sort({ returnDate: -1 });

    res.json({
      success: true,
      count: returns.length,
      report: returns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDamagedLostReport = async (req, res) => {
  try {
    const items = await Item.find({
      $or: [{ damagedStock: { $gt: 0 } }, { lostStock: { $gt: 0 } }],
    })
      .populate("category")
      .sort({ name: 1 });

    res.json({
      success: true,
      count: items.length,
      report: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStockReport,
  getPurchaseReport,
  getIssueReport,
  getReturnReport,
  getDamagedLostReport,
};
