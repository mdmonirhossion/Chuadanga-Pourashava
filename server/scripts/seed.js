const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/User");
const Department = require("../models/Department");
const Category = require("../models/Category");
const Employee = require("../models/Employee");
const Supplier = require("../models/Supplier");
const Item = require("../models/Item");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for Seeding...");

    // 1. Seed Admin User
    let adminUser = await User.findOne({ email: "admin@chuadanga.gov.bd" });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin123456", 10);
      adminUser = await User.create({
        name: "Super Admin",
        email: "admin@chuadanga.gov.bd",
        password: hashedPassword,
        role: "admin",
        status: "active",
      });
      console.log("Admin user created: admin@chuadanga.gov.bd / admin123456");
    } else {
      console.log("Admin user already exists.");
    }

    // 2. Seed Departments
    const deptData = [
      { name: "Engineering Department", code: "ENG", description: "Public works & civil engineering" },
      { name: "Health & Sanitation", code: "HLT", description: "Public health, waste management & sanitation" },
      { name: "General Administration", code: "ADM", description: "Administrative operations & governance" },
      { name: "Accounts & Tax", code: "ACC", description: "Financial management, revenue & store budget" },
    ];

    const departments = [];
    for (const d of deptData) {
      let dept = await Department.findOne({ code: d.code });
      if (!dept) {
        dept = await Department.create(d);
        console.log(`Department created: ${d.name}`);
      }
      departments.push(dept);
    }

    // 3. Seed Categories
    const catData = [
      { name: "Electrical Supplies", description: "Lighting, switches, cables, bulbs" },
      { name: "Office Stationery", description: "Paper, pens, registers, files" },
      { name: "Hardware & Tools", description: "Tools, nails, hammers, drills" },
      { name: "Sanitation & Cleaning", description: "Disinfectants, brooms, soap" },
    ];

    const categories = [];
    for (const c of catData) {
      let cat = await Category.findOne({ name: c.name });
      if (!cat) {
        cat = await Category.create(c);
        console.log(`Category created: ${c.name}`);
      }
      categories.push(cat);
    }

    // 4. Seed Employee
    let employee = await Employee.findOne({ employeeId: "EMP-001" });
    if (!employee && departments.length > 0) {
      employee = await Employee.create({
        employeeId: "EMP-001",
        name: "Md. Rahim Uddin",
        designation: "Assistant Engineer",
        department: departments[0]._id,
        mobile: "01700000000",
        email: "rahim@chuadanga.gov.bd",
        status: "active",
      });
      console.log("Employee created: EMP-001 Md. Rahim Uddin");
    }

    // 5. Seed Supplier
    let supplier = await Supplier.findOne({ supplierCode: "SUP-001" });
    if (!supplier) {
      supplier = await Supplier.create({
        supplierCode: "SUP-001",
        name: "Bangla Electricals & Hardware Store",
        company: "Bangla Trade Syndicate",
        phone: "01800000000",
        email: "info@banglatrade.com",
        address: "Station Road, Chuadanga",
        status: "active",
      });
      console.log("Supplier created: SUP-001 Bangla Electricals");
    }

    // 6. Seed Items
    if (categories.length > 0) {
      const itemData = [
        {
          itemCode: "ELEC-001",
          name: "LED Bulb 20W",
          category: categories[0]._id,
          unit: "Piece",
          itemType: "consumable",
          openingStock: 100,
          currentStock: 100,
          minimumStock: 20,
          description: "20 Watt Energy saving LED bulb",
        },
        {
          itemCode: "STAT-001",
          name: "A4 Paper Box (80 GSM)",
          category: categories[1]._id,
          unit: "Box",
          itemType: "consumable",
          openingStock: 50,
          currentStock: 50,
          minimumStock: 10,
          description: "5 reams per box",
        },
        {
          itemCode: "TOOL-001",
          name: "Heavy Duty Electric Drill Machine",
          category: categories[2]._id,
          unit: "Piece",
          itemType: "returnable",
          openingStock: 5,
          currentStock: 5,
          minimumStock: 1,
          description: "Portable 800W Impact Drill Machine",
        },
      ];

      for (const iData of itemData) {
        const itemExists = await Item.findOne({ itemCode: iData.itemCode });
        if (!itemExists) {
          await Item.create(iData);
          console.log(`Item created: ${iData.name}`);
        }
      }
    }

    console.log("\nDatabase Seeding Completed Successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error.message);
    process.exit(1);
  }
};

seedDatabase();
