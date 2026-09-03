const Employee = require("../models/Employee");
const Issue = require("../models/Issue");
const Return = require("../models/Return");

const getEmployeeLedger = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findById(employeeId).populate("department");
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const issues = await Issue.find({ employee: employeeId })
      .populate("items.item")
      .populate("issuedBy", "name email")
      .sort({ issueDate: 1 });

    const returns = await Return.find({ employee: employeeId })
      .populate("items.item")
      .populate("receivedBy", "name email")
      .sort({ returnDate: 1 });

    const holdingsMap = {};

    issues.forEach((issue) => {
      issue.items.forEach((itemObj) => {
        if (!itemObj.item) return;
        const itemId = itemObj.item._id.toString();
        if (!holdingsMap[itemId]) {
          holdingsMap[itemId] = {
            item: itemObj.item,
            totalIssued: 0,
            totalReturned: 0,
            currentHolding: 0,
          };
        }
        holdingsMap[itemId].totalIssued += itemObj.quantity;
      });
    });

    returns.forEach((ret) => {
      ret.items.forEach((itemObj) => {
        if (!itemObj.item) return;
        const itemId = itemObj.item._id.toString();
        if (!holdingsMap[itemId]) {
          holdingsMap[itemId] = {
            item: itemObj.item,
            totalIssued: 0,
            totalReturned: 0,
            currentHolding: 0,
          };
        }
        holdingsMap[itemId].totalReturned += itemObj.quantity;
      });
    });

    const holdings = Object.values(holdingsMap).map((h) => {
      h.currentHolding = Math.max(0, h.totalIssued - h.totalReturned);
      return h;
    });

    const timeline = [];

    issues.forEach((iss) => {
      iss.items.forEach((itemObj) => {
        if (!itemObj.item) return;
        timeline.push({
          date: iss.issueDate || iss.createdAt,
          type: "ISSUE",
          refNo: iss.issueNo,
          item: itemObj.item,
          quantity: itemObj.quantity,
          purpose: iss.purpose,
          issuedBy: iss.issuedBy,
        });
      });
    });

    returns.forEach((ret) => {
      ret.items.forEach((itemObj) => {
        if (!itemObj.item) return;
        timeline.push({
          date: ret.returnDate || ret.createdAt,
          type: "RETURN",
          refNo: ret.returnNo,
          item: itemObj.item,
          quantity: itemObj.quantity,
          condition: itemObj.condition,
          receivedBy: ret.receivedBy,
        });
      });
    });

    timeline.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      employee,
      holdings,
      timeline,
      issuesCount: issues.length,
      returnsCount: returns.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getEmployeeLedger,
};
