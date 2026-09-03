import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import DashboardLayout from "./Layouts/DashboardLayout";

// Pages
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import ItemsPage from "./Pages/ItemsPage";
import PurchasesPage from "./Pages/PurchasesPage";
import IssuesPage from "./Pages/IssuesPage";
import ReturnsPage from "./Pages/ReturnsPage";
import EmployeeLedgerPage from "./Pages/EmployeeLedgerPage";
import DepartmentsPage from "./Pages/DepartmentsPage";
import CategoriesPage from "./Pages/CategoriesPage";
import SuppliersPage from "./Pages/SuppliersPage";
import ReportsPage from "./Pages/ReportsPage";
import StockTransactionsPage from "./Pages/StockTransactionsPage";
import UsersPage from "./Pages/UsersPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard & App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/employee-ledger" element={<EmployeeLedgerPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/transactions" element={<StockTransactionsPage />} />

            {/* Admin Exclusive Route */}
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;