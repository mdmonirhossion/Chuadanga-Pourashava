const StockTransaction = require("../models/StockTransaction");

const getStockTransactions = async (req, res) => {
  try {
    const { item, transactionType, startDate, endDate } = req.query;

    const filter = {};

    if (item) {
      filter.item = item;
    }
    if (transactionType) {
      filter.transactionType = transactionType;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await StockTransaction.find(filter)
      .populate("item")
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getItemStockMovement = async (req, res) => {
  try {
    const { itemId } = req.params;

    const transactions = await StockTransaction.find({ item: itemId })
      .populate("item")
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getStockTransactions,
  getItemStockMovement,
};
