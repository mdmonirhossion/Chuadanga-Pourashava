const mongoose = require("mongoose");

const stockTransactionSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    transactionType: {
      type: String,
      enum: [
        "PURCHASE",
        "ISSUE",
        "RETURN",
        "DAMAGE",
        "LOSS",
        "ADJUSTMENT",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    previousStock: {
      type: Number,
      required: true,
      min: 0,
    },

    newStock: {
      type: Number,
      required: true,
      min: 0,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceType: {
      type: String,
      enum: [
        "Purchase",
        "Issue",
        "Return",
        "Adjustment",
        null,
      ],
      default: null,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "StockTransaction",
  stockTransactionSchema
);