import { useEffect, useState, useRef } from "react";
import { api } from "@/api/client";
import type { Employee } from "@/api/employee";
import { ChevronUp, ChevronDown, MoreVertical } from "lucide-react";

type EmployeeForm = {
  empId: number;
  fullName: string;
  email: string;
  department: string;
};

type SortDirection = "asc" | "desc" | null;
type SortField = "empId" | null;

export const Employees = () => {
  const [form, setForm] = useState<EmployeeForm>({
    empId: 0,
    fullName: "",
    email: "",
    department: "",
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const menuRefs = useRef<{ [key: number]: HTMLElement | null }>({});

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<Employee[]>("/employees/");
      setEmployees(res.data);
    } catch (err) {
      setError("Failed to fetch employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const ref = menuRefs.current[openMenuId];
        if (ref && !ref.contains(event.target as Node)) {
          // Check if click is on the dropdown menu itself
          const target = event.target as HTMLElement;
          if (!target.closest('[class*="fixed"]')) {
            setOpenMenuId(null);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const getSortedEmployees = () => {
    if (!sortField || !sortDirection) return employees;

    const sorted = [...employees];
    sorted.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!form.empId || !form.fullName || !form.email || !form.department) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let res : any;
      if (editingId) {
        // Update existing employee
        res = await api.put<Employee>(`/employees/${editingId}/`, {
          empId: Number(form.empId),
          fullName: form.fullName,
          email: form.email,
          department: form.department,
        });

        // Update employee in the list
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === editingId ? res.data : emp))
        );
        setEditingId(null);
      } else {
        // Create new employee
        res = await api.post<Employee>("/employees/", {
          empId: Number(form.empId),
          fullName: form.fullName,
          email: form.email,
          department: form.department,
        });

        setEmployees((prev) => [res.data, ...prev]);
      }

      setForm({
        empId: 0,
        fullName: "",
        email: "",
        department: "",
      });
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const errorMessages = Object.entries(errors)
          .map(([key, value]: [string, any]) => {
            const msg = Array.isArray(value) ? value[0] : value;
            return `${key}: ${msg}`;
          })
          .join(", ");
        setError(errorMessages);
      } else {
        setError("Failed to save employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      setError(null);
      await api.delete(`/employees/${id}/`);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      setOpenMenuId(null);
    } catch (err) {
      setError("Failed to delete employee. Please try again.");
    }
  };

  const handleEdit = (emp: Employee) => {
    setForm({
      empId: emp.empId,
      fullName: emp.fullName,
      email: emp.email,
      department: emp.department,
    });
    setEditingId(emp.id);
    setOpenMenuId(null);
    setError(null);
  };

  const handleCancel = () => {
    setForm({
      empId: 0,
      fullName: "",
      email: "",
      department: "",
    });
    setEditingId(null);
    setError(null);
  };

  const sortedEmployees = getSortedEmployees();
  const isEmpty = employees.length === 0 && !loading;

  return (
    <section className="flex flex-col justify-center mx-10 my-22 px-4 sm:px-6 lg:px-8 items-center text-center gap-6 max-w-5xl">
      <div className="flex gap-2 items-center">
        <h1 className="mt-10">Ethara HRMS</h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 "
      >
        <input
          name="empId"
          value={form.empId || ""}
          type="number"
          onChange={handleChange}
          placeholder="Employee ID"
          disabled={editingId !== null}
          className="w-full rounded-full border border-surface-2 px-4 py-4 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:opacity-60"
        />
        <input
          name="fullName"
          value={form.fullName}
          type="text"
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full rounded-full border border-surface-2 px-4 py-4 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <input
          name="email"
          value={form.email}
          type="email"
          onChange={handleChange}
          placeholder="Email"
          className="w-full rounded-full border border-surface-2 px-4 py-4 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <input
          name="department"
          value={form.department}
          type="text"
          onChange={handleChange}
          placeholder="Department"
          className="w-full rounded-full border border-surface-2 px-4 py-4 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full font-semibold py-4 text-xl bg-linear-to-b from-text to-brand text-light disabled:opacity-50"
        >
          {loading
            ? editingId
              ? "Updating..."
              : "Adding..."
            : editingId
              ? "Update Employee"
              : "Add Employee"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancel}
            className="w-full rounded-full font-semibold py-4 text-xl border border-surface-2 text-text hover:bg-surface-2"
          >
            Cancel
          </button>
        )}
      </form>

      {loading && !isEmpty && (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted">Loading employees...</p>
        </div>
      )}

      {isEmpty && !loading && (
        <div className="mt-6 text-center py-12 text-muted">
          <p>No employees yet. Add one to get started.</p>
        </div>
      )}

      {!isEmpty && (
        <div className="mt-6 rounded-2xl bg-surface border border-surface w-full" style={{ overflow: "visible" }}>
          <div style={{ borderRadius: "1rem", overflow: "hidden" }}>
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
                </th>
                <th className="px-4 py-3 text-center font-medium text-text">
                  Email
                </th>
                <th className="px-4 py-3 text-center font-medium text-text">
                  Department
                </th>
                <th className="px-4 py-3 text-center font-medium text-text">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-2/50 bg-surface">
              {sortedEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-surface-2">
                  <td className="px-4 py-3">{emp.empId}</td>
                  <td className="px-4 py-3 font-medium">{emp.fullName}</td>
                  <td className="px-4 py-3">{emp.email}</td>
                  <td className="px-4 py-3">{emp.department}</td>
                  <td className="px-4 py-3 relative">
                    <button
                      ref={(el) => {
                        menuRefs.current[emp.id] = el;
                      }}
                      onClick={() =>
                        setOpenMenuId(openMenuId === emp.id ? null : emp.id)
                      }
                      className="p-1 hover:bg-surface-2/50 rounded inline-flex"
                      aria-label="Actions"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {openMenuId && menuRefs.current[openMenuId] && (
        <div
          className="fixed bg-surface border border-surface-2 rounded-lg shadow-lg ml-15 z-50 w-32"
          style={{
            top: (menuRefs.current[openMenuId] as HTMLElement)?.getBoundingClientRect().bottom + 8,
            left: (menuRefs.current[openMenuId] as HTMLElement)?.getBoundingClientRect().right - 128,
          }}
        >
          <button
            onClick={() => {
              const emp = employees.find(e => e.id === openMenuId);
              if (emp) handleEdit(emp);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-surface-2 text-sm text-text"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(openMenuId)}
            className="block w-full text-left px-4 py-2 hover:bg-surface-2 text-sm text-red-400"
          >
            Delete
          </button>
        </div>
      )}
    </section>
  );
};
