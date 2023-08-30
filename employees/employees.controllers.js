import asyncHandler from "express-async-handler";
import Employee from "./employees.models.js";

// Create a new employee
const createEmployee = asyncHandler(async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all employees
const getAllEmployees = asyncHandler(async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee by ID
const getEmployeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: `Employee  ${id} not found` });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee by ID
const updateEmployee = asyncHandler(async (req, res) => {
  const {id} = req.params
  try {
    const employee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!employee) {
      return res.status(404).json({ message: `Employee  ${id} not found` });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee by ID
const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await Employee.findByIdAndRemove(id);
    if (!employee) {
      return res.status(404).json({ message: `Employee  ${id} not found` });
    }
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  deleteEmployee,
  updateEmployee,
};
