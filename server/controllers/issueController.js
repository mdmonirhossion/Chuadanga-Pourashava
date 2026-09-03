const Issue = require("../models/Issue");
const Item = require("../models/Item");
const Employee = require("../models/Employee");
const StockTransaction = require("../models/StockTransaction");

const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate("employee")
      .populate("department")
      .populate("issuedBy", "name email")
      .populate("items.item")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("employee")
      .populate("department")
      .populate("issuedBy", "name email")
      .populate("items.item");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue record not found",
      });
    }

    res.json({
      success: true,
      issue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createIssue = async (req, res) => {
  try {
    const { employee, purpose, items, remarks, issueDate } = req.body;

    if (!employee || !purpose || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Employee, purpose, and at least one item are required",
      });
    }

    const employeeObj = await Employee.findById(employee);
    if (!employeeObj) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    for (const reqItem of items) {
      const dbItem = await Item.findById(reqItem.item);
      if (!dbItem) {
        return res.status(404).json({
          success: false,
          message: `Item not found (ID: ${reqItem.item})`,
        });
      }
      if (dbItem.currentStock < reqItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${dbItem.name}". Available: ${dbItem.currentStock}, Requested: ${reqItem.quantity}`,
        });
      }
    }

    const issueNo = `ISS-${Date.now().toString().slice(-6)}`;

    const processedItems = items.map((i) => ({
      item: i.item,
      quantity: Number(i.quantity),
      returnedQuantity: 0,
      pendingQuantity: Number(i.quantity),
    }));

    const issue = await Issue.create({
      issueNo,
      employee,
      department: employeeObj.department,
      issueDate: issueDate || Date.now(),
      purpose,
      items: processedItems,
      issuedBy: req.user._id,
      status: "issued",
      remarks,
    });

    for (const pItem of processedItems) {
      const dbItem = await Item.findById(pItem.item);
      const previousStock = dbItem.currentStock;
      const newStock = previousStock - pItem.quantity;

      dbItem.currentStock = newStock;
      await dbItem.save();

      await StockTransaction.create({
        item: pItem.item,
        transactionType: "ISSUE",
        quantity: pItem.quantity,
        previousStock,
        newStock,
        referenceId: issue._id,
        referenceType: "Issue",
        performedBy: req.user._id,
        remarks: `Issue No: ${issueNo} to ${employeeObj.name}`,
      });
    }

    const populatedIssue = await Issue.findById(issue._id)
      .populate("employee")
      .populate("department")
      .populate("issuedBy", "name email")
      .populate("items.item");

    res.status(201).json({
      success: true,
      message: "Materials issued successfully",
      issue: populatedIssue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getIssues,
  getIssue,
  createIssue,
};
