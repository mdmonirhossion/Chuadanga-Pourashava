const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    condition: {
      type: String,
      enum: ["good", "damaged", "lost"],
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

const returnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    returnDate: {
      type: Date,
      default: Date.now,
    },

    items: {
      type: [returnItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Return must contain at least one item",
      },
    },

    receivedBy: {
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
  "Return",
  returnSchema
);