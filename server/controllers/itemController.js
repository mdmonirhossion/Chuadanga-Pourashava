const Item = require("../models/Item");

const getItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("category")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("category");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createItem = async (req, res) => {
  try {
    const {
      itemCode,
      name,
      category,
      unit,
      itemType,
      openingStock,
      minimumStock,
      description,
    } = req.body;

    if (!itemCode || !name || !category || !unit || !itemType) {
      return res.status(400).json({
        success: false,
        message: "Item Code, Name, Category, Unit, and Item Type are required",
      });
    }

    const existing = await Item.findOne({ itemCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Item Code already exists",
      });
    }

    const initialStock = openingStock || 0;

    const item = await Item.create({
      itemCode,
      name,
      category,
      unit,
      itemType,
      openingStock: initialStock,
      currentStock: initialStock,
      minimumStock: minimumStock || 0,
      description,
    });

    const populatedItem = await item.populate("category");

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      item: populatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
};
