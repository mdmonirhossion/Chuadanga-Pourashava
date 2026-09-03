const mongoose = require("mongoose");

const issueItemSchema = new mongoose.Schema(
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

    returnedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    pendingQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const issueSchema = new mongoose.Schema(
  {
    issueNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
    },

    items: {
      type: [issueItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Issue must contain at least one item",
      },
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "issued",
        "partially_returned",
        "fully_returned",
      ],
      default: "issued",
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

module.exports = mongoose.model("Issue", issueSchema);