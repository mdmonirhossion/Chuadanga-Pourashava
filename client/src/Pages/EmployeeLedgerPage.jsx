import { useState, useEffect } from "react";
import api from "../Services/api";
import { BookOpen, Printer } from "lucide-react";

const EmployeeLedgerPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees");
        const empList = res.data?.employees || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setEmployees(empList);
        if (empList.length > 0) {
          setSelectedEmployeeId(empList[0]._id);
        }
      } catch (err) {
        console.error("Failed to load employees:", err);
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) return;

    const fetchLedger = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/employee-ledger/${selectedEmployeeId}`);
        if (res.data && res.data.success) {
          setLedgerData(res.data);
        }
      } catch (err) {
        console.error("Failed to load employee ledger:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [selectedEmployeeId]);

  const handlePrint = () => {
    window.print();
  };

  const holdingsList = ledgerData?.holdings || ledgerData?.ledger || [];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <BookOpen size={28} className="text-emerald-600" />
            কর্মকর্তা/কর্মচারী স্টোর লেজার (Employee Store Ledger)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            কোন কর্মকর্তার নিকট কোন মালামাল কতটি জমা আছে তার ব্যক্তিগত ষ্টোর রেজিস্টার
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="btn bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Printer size={16} />
          প্রিন্ট করুন (Print Ledger)
        </button>
      </div>

      {/* Employee Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs print:hidden">
        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
          কর্মকর্তা/কর্মচারী নির্বাচন করুন
        </label>
        <select
          value={selectedEmployeeId}
          onChange={(e) => setSelectedEmployeeId(e.target.value)}
          className="w-full md:w-96 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {employees?.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name} — {emp.designation} ({emp.department?.name || "General"})
            </option>
          ))}
        </select>
      </div>

      {/* Printable Ledger Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6">
        <div className="text-center border-b border-slate-200 pb-6">
          <img
            src="/logo.png"
            alt="চুয়াডাঙ্গা পৌরসভা লোগো"
            className="w-14 h-14 object-contain mx-auto mb-2"
          />
          <h2 className="text-2xl font-extrabold text-slate-900">চুয়াডাঙ্গা পৌরসভা কার্যালয়</h2>
          <p className="text-xs text-slate-500 font-medium">স্টোর শাখা — কর্মকর্তা ব্যক্তিগত মালামাল রেজিস্টার</p>
          {ledgerData?.employee && (
            <div className="mt-4 bg-emerald-50/60 border border-emerald-200/80 inline-block px-6 py-3 rounded-2xl text-left">
              <p className="font-extrabold text-slate-900 text-base">
                কর্মকর্তার নাম: {ledgerData.employee.name}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                পদবী: {ledgerData.employee.designation} | বিভাগ: {ledgerData.employee.department?.name || "N/A"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                মোবাইল: {ledgerData.employee.mobile || "N/A"} | আইডি: {ledgerData.employee.employeeId}
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <span className="loading loading-spinner loading-lg text-emerald-600"></span>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-base">
              বর্তমান হস্তগত ফেরতযোগ্য মালামালের তালিকা (Currently Holding Returnable Items)
            </h3>

            <div className="overflow-x-auto">
              <table className="table w-full border border-slate-200 rounded-2xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-xs">
                    <th>মালামালের নাম</th>
                    <th>একক (Unit)</th>
                    <th>মোট ইস্যুকৃত</th>
                    <th>মোট ফেরত প্রদানকৃত</th>
                    <th>বর্তমানে হাতে জমা (Balance)</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {holdingsList.length > 0 ? (
                    holdingsList.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="font-bold text-slate-800">
                          {row.item?.name} ({row.item?.itemCode})
                        </td>
                        <td>{row.item?.unit}</td>
                        <td className="text-blue-700 font-semibold">{row.totalIssued || 0}</td>
                        <td className="text-purple-700 font-semibold">{row.totalReturned || 0}</td>
                        <td className="font-extrabold text-rose-600 bg-rose-50/50">
                          {row.currentHolding ?? row.balanceQuantity ?? 0} {row.item?.unit}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        বর্তমানে এই কর্মকর্তার নিকট কোন ফেরতযোগ্য মালামাল জমা নেই
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLedgerPage;
