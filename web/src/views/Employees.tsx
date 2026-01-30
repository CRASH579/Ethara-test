import { useEffect, useState } from "react";
import { api } from "@/api/client"
import type { Employee } from "@/api/employee";

type EmployeeForm = {
  empId: number;
  fullName: string;
  email: string;
  department: string;
};


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

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get<Employee[]>("/employees/");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.empId || !form.fullName || !form.email || !form.department) {
      return "All fields are required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Invalid email address";
    }

    return null;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault() 
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.post<Employee>("/employees/", {
        empId: Number(form.empId),
        fullName: form.fullName,
        email: form.email,
        department: form.department,
      });

    setEmployees(prev => [...prev, res.data])

    setForm({
      empId: 0,
      fullName: "",
      email: "",
      department: "",
    })

    } catch (err) {
      setError("Failed to add employee. Please try again.");
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
        className="grid grid-cols-1 md:grid-cols-4 gap-4 "
      >
        <input
          name="empId"
          value={form.empId}
          type="text"
          onChange={handleChange}
          placeholder="Employee ID"
          className="w-full rounded-full border border-surface-2 px-3 py-2 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <input
          name="fullName"
          value={form.fullName}
          type="text"
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full rounded-full border border-surface-2 px-3 py-2 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <input
          name="email"
          value={form.email}
          type="text"
          onChange={handleChange}
          placeholder="Email"
          className="w-full rounded-full border border-surface-2 px-3 py-2 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        <input
          name="department"
          value={form.department}
          type="text"
          onChange={handleChange}
          placeholder="Department"
          className="w-full rounded-full border border-surface-2 px-3 py-2 text-md
               focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
        {error && <p className="col-span-full text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full py-4 text-xl bg-linear-to-b from-text to-brand text-light "
        >
          {loading ? "Adding..." : "Add Employee"}
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl bg-surface border border-surface w-full">
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
                Email
              </th>
              <th className="px-4 py-3 text-center font-medium text-text">
                Department
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-muted bg-surface">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-surface-2">
                <td className="px-4 py-3">{emp.empId}</td>
                <td className="px-4 py-3 font-medium">{emp.fullName}</td>
                <td className="px-4 py-3">{emp.email}</td>
                <td className="px-4 py-3">{emp.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
