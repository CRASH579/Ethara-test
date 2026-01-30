import { useEffect, useState, useRef } from "react";
import { api } from "@/api/client";
import type { Employee } from "@/api/employee";
import { Filter, ChevronUp, ChevronDown } from "lucide-react";

export type Attendance = {
  id: number;
  employee: number;
  date: string;
  status: "PRESENT" | "ABSENT";
};

type SortDirection = "asc" | "desc" | null;
type SortField = "empId" | "date" | null;

export const Attendance = () => {
  const [form, setForm] = useState({
    empId: "",
    date: new Date().toISOString().slice(0, 10),
    status: "PRESENT" as "PRESENT" | "ABSENT",
  });

  const [filters, setFilters] = useState({
    empId: "",
    department: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Employee[]>("/employees/");
      const ares = await api.get<Attendance[]>("/attendance/");
      setAttendance(ares.data);
      setEmployees(res.data);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(detail || "Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilters]);

  const fetchFilteredAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      if (filters.empId) params.employee = filters.empId;
      if (filters.department) params.department = filters.department;
      if (filters.dateFrom) params.date_from = filters.dateFrom;
      if (filters.dateTo) params.date_to = filters.dateTo;
      if (filters.status) params.status = filters.status;

      const res = await api.get<Attendance[]>("/attendance/", { params });
      setAttendance(res.data);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(detail || "Failed to fetch attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchFilteredAttendance();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({
      empId: "",
      department: "",
      dateFrom: "",
      dateTo: "",
      status: "",
    });
    setSortField(null);
    setSortDirection(null);
    setAttendance([]);
  };

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
        employee_id: Number(form.empId),
        date: form.date,
        status: form.status,
      });

      setAttendance((prev) => [res.data, ...prev]);
      
      setForm({
        empId: "",
        date: new Date().toISOString().slice(0, 10),
        status: "PRESENT",
      });
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      const detail = err?.response?.data?.detail;
      const nonFieldErrors = err?.response?.data?.non_field_errors;
      
      if (errors) {
        const errorMessages = Object.entries(errors)
          .map(([key, value]: [string, any]) => {
            const msg = Array.isArray(value) ? value[0] : value;
            return `${key}: ${msg}`;
          })
          .join(", ");
        setError(errorMessages);
      } else if (nonFieldErrors && Array.isArray(nonFieldErrors)) {
        setError(nonFieldErrors[0]);
      } else if (detail) {
        setError(detail);
      } else {
        setError("Failed to mark attendance. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedAttendance = () => {
    if (!sortField || !sortDirection) return attendance;

    const sorted = [...attendance];
    sorted.sort((a, b) => {
      if (sortField === "empId") {
        const empA = getEmployeeById(a.employee)?.empId || 0;
        const empB = getEmployeeById(b.employee)?.empId || 0;
        return sortDirection === "asc" ? empA - empB : empB - empA;
      } else if (sortField === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });

    return sorted;
  };

  const sortedAttendance = getSortedAttendance();

  const getPresentCount = () =>
    sortedAttendance.filter((a) => a.status === "PRESENT").length;
  const getAbsentCount = () =>
    sortedAttendance.filter((a) => a.status === "ABSENT").length;

  const isEmpty = attendance.length === 0 && !loading && filters.empId;

  return (
    <section className="flex flex-col justify-center mx-10 my-22 px-4 sm:px-6 lg:px-8 items-center text-center gap-6 max-w-5xl">
      <div className="flex gap-2 items-center">
        <h1 className="mt-10">Ethara HRMS</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
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
          className="w-full rounded-full text-text border border-surface-2 bg-bg px-4 py-4 text-md
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
          className="w-full rounded-full border border-surface-2 px-4 bg-bg py-4 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
        </select>

        {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full px-4 py-4 text-xl font-semibold bg-linear-to-b from-text to-brand text-light disabled:opacity-50"
        >
          {loading ? "Marking..." : "Mark Attendance"}
        </button>

        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="w-14 h-14 rounded-full bg-linear-to-b from-surface to-surface-2 text-text p-0 flex items-center justify-center hover:from-surface-2"
          >
            <Filter size={20} />
          </button>

          {showFilters && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-surface border border-surface-2 rounded-lg shadow-lg p-4 z-20 grid grid-cols-2 gap-4 w-96">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Employee
                </label>
                <select
                  value={filters.empId}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, empId: e.target.value }))
                  }
                  className="w-full rounded-full border border-surface-2 bg-bg px-3 py-2 text-sm
                    focus:border-brand outline-none focus:ring-1 focus:ring-brand text-text"
                >
                  <option value="">All</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.department}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  className="w-full rounded-full border border-surface-2 bg-bg px-3 py-2 text-sm
                    focus:border-brand outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                  className="w-full rounded-full border border-surface-2 bg-bg px-3 py-2 text-sm
                    focus:border-brand outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateTo: e.target.value,
                    }))
                  }
                  className="w-full rounded-full border border-surface-2 bg-bg px-3 py-2 text-sm
                    focus:border-brand outline-none focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-text mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full rounded-full border border-surface-2 bg-bg px-3 py-2 text-sm
                    focus:border-brand outline-none focus:ring-1 focus:ring-brand text-text"
                >
                  <option value="">All</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="col-span-1 rounded-full bg-brand text-light text-sm font-semibold py-2"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={handleClearFilters}
                className="col-span-1 rounded-full border border-surface-2 text-text text-sm font-semibold py-2"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </form>

      {loading && !isEmpty && (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted">Loading attendance...</p>
        </div>
      )}

      {isEmpty && !loading && (
        <div className="mt-6 text-center py-12 text-muted">
          <p>No attendance records found.</p>
        </div>
      )}

      {!isEmpty && (
        <>
          {filters.empId && (
            <div className="mt-4 text-sm text-text flex gap-4">
              <span>
                Present: <strong>{getPresentCount()}</strong>
              </span>
              <span>
                Absent: <strong>{getAbsentCount()}</strong>
              </span>
            </div>
          )}
          <div className="mt-6 overflow-hidden rounded-2xl bg-surface border border-surface w-full">
            <table className="min-w-full divide-y divide-brand/50 text-sm">
              <thead className="bg-surface-2">
                <tr>
                  <th
                    onClick={() => handleSort("empId")}
                    className="px-4 py-3 text-center font-medium text-text cursor-pointer hover:bg-surface-2/80 select-none flex items-center justify-center gap-2"
                  >
                    Emp ID
                    {sortField === "empId" && sortDirection === "asc" && (
                      <ChevronUp size={16} />
                    )}
                    {sortField === "empId" && sortDirection === "desc" && (
                      <ChevronDown size={16} />
                    )}
                    {(sortField !== "empId" || !sortDirection) && (
                      <span className="text-xs text-muted">⇅</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-text">
                    Name
                  </th>{" "}
                  <th className="px-4 py-3 text-center font-medium text-text">
                    Department
                  </th>
                  <th
                    onClick={() => handleSort("date")}
                    className="px-4 py-3 text-center font-medium text-text cursor-pointer hover:bg-surface-2/80 select-none flex items-center justify-center gap-2"
                  >
                    Date
                    {sortField === "date" && sortDirection === "asc" && (
                      <ChevronUp size={16} />
                    )}
                    {sortField === "date" && sortDirection === "desc" && (
                      <ChevronDown size={16} />
                    )}
                    {(sortField !== "date" || !sortDirection) && (
                      <span className="text-xs text-muted">⇅</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-text">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-surface-2/50 bg-surface">
                {sortedAttendance.map((a: any) => {
                  return (
                    <tr key={a.id} className="hover:bg-surface-2">
                      <td className="px-4 py-3 text-center">
                        {a.employee?.empId ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-center font-medium">
                        {a.employee?.fullName ?? "Unknown"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {a.employee?.department ?? "-"}
                      </td>

                      <td className="px-4 py-3 text-center">{a.date}</td>
                      <td
                        className={`px-4 py-3 text-center ${a.status === "PRESENT" ? "text-green-300" : "text-red-300"}`}
                      >
                        {a.status === "PRESENT" ? "Present" : "Absent"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};
