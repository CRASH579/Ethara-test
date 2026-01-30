import { useEffect, useState } from "react";
import { api } from "@/api/client";
import type { Employee } from "@/api/employee";

type EmployeeForm = {
  empId: number;
  fullName: string;
  email: string;
  department: string;
};
export type Attendance = {
  id: number;
  employee: number;
  date: string;
  status: "PRESENT" | "ABSENT";
};

export const Attendance = () => {
  const [form, setForm] = useState({
    empId: "",
    date: new Date().toISOString().slice(0, 10),
    status: "PRESENT" as "PRESENT" | "ABSENT",
  });
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get<Employee[]>("/employees/");
      const ares = await api.get<Attendance[]>("/attendance/");
      setAttendance(ares.data);
      setEmployees(res.data);
    } catch (err) {
      setError("Failed to fetch employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!form.empId) return;

    api
      .get<Attendance[]>("/attendance/", {
        params: { employee: form.empId },
      })
      .then((res) => setAttendance(res.data));
  }, [form.empId]);

  const getEmployeeById = (id: number) =>
    employees.find((emp) => emp.id === id);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.empId) {
      setError("Please select an employee");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.post<Attendance>("/attendance/", {
        employee: Number(form.empId),
        date: form.date,
        status: form.status,
      });

      // update
      setAttendance((prev) => [res.data, ...prev]);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Attendance already marked for this date",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col justify-center mx-10 my-22 items-center text-center gap-6 max-w-5xl">
      <div className="flex gap-2 items-center">
        <h1 className="mt-10">Ethara HRMS</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 "
      >
        <select
          value={form.empId}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, empId: e.target.value }))
          }
          className={`rounded-full border border-surface-2 bg-bg px-3 py-2
    focus:border-brand outline-none focus:ring-1 focus:ring-brand
    ${!form.empId ? "text-muted" : "text-text"}
  `}
        >
          <option value="" disabled>
            Select employee
          </option>

          {employees.map((emp) => (
            <option key={emp.id} value={emp.id} className="text-text">
              {emp.fullName}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, date: e.target.value }))
          }
          className="w-full rounded-full border border-surface-2 px-4 py-4 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />

        <select
          value={form.status}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              status: e.target.value as "PRESENT" | "ABSENT",
            }))
          }
          className="w-full rounded-full border border-surface-2 px-4 py-4 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
        </select>

        {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full px-4 py-4 text-xl font-semibold bg-linear-to-b from-text to-brand text-light "
        >
          {loading ? "Marking..." : "Mark Attendance"}
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl bg-surface border border-surface w-full">
        {attendance.length === 0 && form.empId && (
          <p className="text-sm text-muted mt-4">No attendance records yet</p>
        )}
        <table className="min-w-full divide-y divide-brand/50 text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="px-4 py-3 text-center font-medium text-text">
                Emp ID
              </th>
              <th className="px-4 py-3 text-center font-medium text-text">
                Name
              </th>
              <th className="px-4 py-3 text-center font-medium text-text">
                Date
              </th>
              <th className="px-4 py-3 text-center font-medium text-text">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-2/50 bg-surface">
            {attendance.map((a) => {
              const emp = getEmployeeById(a.employee);

              return (
                <tr key={a.id} className="hover:bg-surface-2">
                  <td className="px-4 py-3 text-center">{emp?.empId ?? "-"}</td>
                  <td className="px-4 py-3 text-center font-medium">
                    {emp?.fullName ?? "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-center">{a.date}</td>
                  <td className="px-4 py-3 text-center">
                    {a.status === "PRESENT" ? "Present" : "Absent"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
