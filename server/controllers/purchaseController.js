const Purchase = require("../models/Purchase");
const Item = require("../models/Item");
const StockTransaction = require("../models/StockTransaction");

const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier")
      .populate("receivedBy", "name email")
      .populate("items.item")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplier")
      .populate("receivedBy", "name email")
      .populate("items.item");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase record not found",
      });
    }

    res.json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createPurchase = async (req, res) => {
  try {
    const { supplier, invoiceNo, purchaseDate, items, remarks } = req.body;

    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Supplier and at least one item are required",
      });
    }

    const purchaseNo = `PUR-${Date.now().toString().slice(-6)}`;

    let calculatedTotalAmount = 0;
    const processedItems = items.map((i) => {
      const qty = Number(i.quantity);
      const price = Number(i.unitPrice) || 0;
      const total = qty * price;
      calculatedTotalAmount += total;
      return {
        item: i.item,
        quantity: qty,
        unitPrice: price,
        totalPrice: total,
      };
    });

    const purchase = await Purchase.create({
      purchaseNo,
      supplier,
      invoiceNo,
      purchaseDate: purchaseDate || Date.now(),
      items: processedItems,
      totalAmount: calculatedTotalAmount,
      receivedBy: req.user._id,
      remarks,
    });

    for (const pItem of processedItems) {
      const itemObj = await Item.findById(pItem.item);
      if (itemObj) {
        const previousStock = itemObj.currentStock;
        const newStock = previousStock + pItem.quantity;

        itemObj.currentStock = newStock;
        await itemObj.save();

        await StockTransaction.create({
          item: pItem.item,
          transactionType: "PURCHASE",
          quantity: pItem.quantity,
          previousStock,
          newStock,
          referenceId: purchase._id,
          referenceType: "Purchase",
          performedBy: req.user._id,
          remarks: `Purchase No: ${purchaseNo}`,
        });
      }
    }

    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate("supplier")
      .populate("receivedBy", "name email")
      .populate("items.item");

    res.status(201).json({
      success: true,
      message: "Purchase processed and stock updated successfully",
      purchase: populatedPurchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPurchases,
  getPurchase,
  createPurchase,
};
