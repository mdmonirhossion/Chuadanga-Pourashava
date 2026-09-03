const Return = require("../models/Return");
const Issue = require("../models/Issue");
const Item = require("../models/Item");
const StockTransaction = require("../models/StockTransaction");

const getReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate("issue")
      .populate("employee")
      .populate("receivedBy", "name email")
      .populate("items.item")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: returns.length,
      returns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getReturn = async (req, res) => {
  try {
    const returnRecord = await Return.findById(req.params.id)
      .populate("issue")
      .populate("employee")
      .populate("receivedBy", "name email")
      .populate("items.item");

    if (!returnRecord) {
      return res.status(404).json({
        success: false,
        message: "Return record not found",
      });
    }

    res.json({
      success: true,
      returnRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createReturn = async (req, res) => {
  try {
    const { issue: issueId, items, remarks, returnDate } = req.body;

    if (!issueId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Issue reference and at least one returned item are required",
      });
    }

    const issueDoc = await Issue.findById(issueId);
    if (!issueDoc) {
      return res.status(404).json({
        success: false,
        message: "Issue document not found",
      });
    }

    for (const rItem of items) {
      const issueItem = issueDoc.items.find(
        (i) => i.item.toString() === rItem.item.toString()
      );
      if (!issueItem) {
        return res.status(400).json({
          success: false,
          message: `Item (ID: ${rItem.item}) was not part of this issue`,
        });
      }
      if (rItem.quantity > issueItem.pendingQuantity) {
        return res.status(400).json({
          success: false,
          message: `Return quantity (${rItem.quantity}) exceeds pending quantity (${issueItem.pendingQuantity}) for this item`,
        });
      }
    }

    const returnNo = `RET-${Date.now().toString().slice(-6)}`;

    const returnRecord = await Return.create({
      returnNo,
      issue: issueId,
      employee: issueDoc.employee,
      returnDate: returnDate || Date.now(),
      items: items.map((i) => ({
        item: i.item,
        quantity: Number(i.quantity),
        condition: i.condition || "good",
        remarks: i.remarks || "",
      })),
      receivedBy: req.user._id,
      remarks,
    });

    for (const rItem of items) {
      const dbItem = await Item.findById(rItem.item);
      const qty = Number(rItem.quantity);
      const previousStock = dbItem.currentStock;

      let transactionType = "RETURN";
      let newStock = previousStock;

      if (rItem.condition === "good") {
        newStock = previousStock + qty;
        dbItem.currentStock = newStock;
        transactionType = "RETURN";
      } else if (rItem.condition === "damaged") {
        dbItem.damagedStock += qty;
        transactionType = "DAMAGE";
      } else if (rItem.condition === "lost") {
        dbItem.lostStock += qty;
        transactionType = "LOSS";
      }

      await dbItem.save();

      await StockTransaction.create({
        item: rItem.item,
        transactionType,
        quantity: qty,
        previousStock,
        newStock,
        referenceId: returnRecord._id,
        referenceType: "Return",
        performedBy: req.user._id,
        remarks: `Return No: ${returnNo} (Condition: ${rItem.condition})`,
      });

      const issueItemIndex = issueDoc.items.findIndex(
        (i) => i.item.toString() === rItem.item.toString()
      );
      if (issueItemIndex !== -1) {
        issueDoc.items[issueItemIndex].returnedQuantity += qty;
        issueDoc.items[issueItemIndex].pendingQuantity -= qty;
      }
    }

    const totalPending = issueDoc.items.reduce(
      (sum, i) => sum + i.pendingQuantity,
      0
    );
    const totalReturned = issueDoc.items.reduce(
      (sum, i) => sum + i.returnedQuantity,
      0
    );

    if (totalPending === 0) {
      issueDoc.status = "fully_returned";
    } else if (totalReturned > 0) {
      issueDoc.status = "partially_returned";
    }

    await issueDoc.save();

    const populatedReturn = await Return.findById(returnRecord._id)
      .populate("issue")
      .populate("employee")
      .populate("receivedBy", "name email")
      .populate("items.item");

    res.status(201).json({
      success: true,
      message: "Material return processed successfully",
      returnRecord: populatedReturn,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getReturns,
  getReturn,
  createReturn,
};
