"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import type {
  Employee,
  EmployeeDepartment,
  EmployeeRole,
  EmployeeStatus,
  LoginStatus,
} from "@/lib/types/employee";

type EditEmployeeDrawerProps = {
  open: boolean;
  employee: Employee;
  onClose: () => void;
  onSave: (employee: Employee) => void;
};

const departmentRoles: Record<
  EmployeeDepartment,
  readonly EmployeeRole[]
> = {
  "Executive Leadership": [
    "Founder",
    "Chief Operating Officer",
  ],
  Technology: ["Technology Coordinator"],
  Coaching: ["Trading Coach", "Coach"],
  Community: ["Community Director"],
  Hospitality: ["Hospitality Coordinator"],
  "Office Operations": ["Office Coordinator"],
  Instruction: ["Instructional Coordinator"],
  Administration: ["Administrative Coordinator"],
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default function EditEmployeeDrawer({
  open,
  employee,
  onClose,
  onSave,
}: EditEmployeeDrawerProps) {
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email ?? "");
  const [phone, setPhone] = useState(employee.phone ?? "");
  const [department, setDepartment] =
    useState<EmployeeDepartment>(employee.department);
  const [role, setRole] =
    useState<EmployeeRole>(employee.role);
  const [status, setStatus] =
    useState<EmployeeStatus>(employee.status);
  const [loginStatus, setLoginStatus] =
    useState<LoginStatus>(employee.loginStatus);
  const [error, setError] = useState("");

  const roleOptions = useMemo(
    () => departmentRoles[department],
    [department],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(employee.name);
    setEmail(employee.email ?? "");
    setPhone(employee.phone ?? "");
    setDepartment(employee.department);
    setRole(employee.role);
    setStatus(employee.status);
    setLoginStatus(employee.loginStatus);
    setError("");
  }, [open, employee]);

  if (!open) {
    return null;
  }

  function handleSubmit() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Employee name is required.");
      return;
    }

    onSave({
      ...employee,
      name: trimmedName,
      email: email.trim() || null,
      phone: phone.trim() || null,
      department,
      role,
      status,
      loginStatus,
      initials: getInitials(trimmedName),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button
        type="button"
        aria-label="Close edit employee drawer"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-black/[0.08] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#17201a]">
              Edit Employee
            </h2>

            <p className="mt-1 text-sm text-[#77827a]">
              Update employee details and account status.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="grid size-9 place-items-center rounded-xl text-[#657168] transition hover:bg-black/[0.05] hover:text-[#17201a]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <Field
            label="Full Name"
            value={name}
            onChange={setName}
          />

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
          />

          <Field
            label="Phone"
            value={phone}
            onChange={setPhone}
          />

          <SelectField
            label="Department"
            value={department}
            options={Object.keys(
              departmentRoles,
            ) as EmployeeDepartment[]}
            onChange={(value) => {
              const nextDepartment =
                value as EmployeeDepartment;

              setDepartment(nextDepartment);

              const nextRoles =
                departmentRoles[nextDepartment];

              if (!nextRoles.includes(role)) {
                setRole(nextRoles[0]);
              }
            }}
          />

          <SelectField
            label="Role"
            value={role}
            options={roleOptions}
            onChange={(value) =>
              setRole(value as EmployeeRole)
            }
          />

          <SelectField
            label="Employee Status"
            value={status}
            options={["Active", "Inactive"]}
            onChange={(value) =>
              setStatus(value as EmployeeStatus)
            }
          />

          <SelectField
            label="Login Status"
            value={loginStatus}
            options={[
              "Active",
              "Invite Pending",
              "Not Invited",
              "Disabled",
            ]}
            onChange={(value) =>
              setLoginStatus(value as LoginStatus)
            }
          />

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex gap-3 border-t border-[var(--border)] bg-white p-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-[#657168] transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Save Changes
          </button>
        </footer>
      </aside>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
};

function Field({
  label,
  value,
  onChange,
  type = "text",
}: FieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-[#17201a]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200"
      />
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
};

function SelectField({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-[#17201a]">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}