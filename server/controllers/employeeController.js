const Employee = require("../models/Employee");

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("department")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      designation,
      department,
      mobile,
      email,
      joiningDate,
    } = req.body;

    if (!employeeId || !name || !designation || !department) {
      return res.status(400).json({
        success: false,
        message: "Employee ID, Name, Designation, and Department are required",
      });
    }

    const existing = await Employee.findOne({ employeeId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Employee ID already exists",
      });
    }

    const employee = await Employee.create({
      employeeId,
      name,
      designation,
      department,
      mobile,
      email,
      joiningDate,
    });

    const populatedEmployee = await employee.populate("department");

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee: populatedEmployee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("department");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
