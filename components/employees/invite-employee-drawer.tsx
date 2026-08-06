"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import type {
  Employee,
  EmployeeDepartment,
  EmployeeRole,
} from "@/lib/types/employee";

type InviteEmployeeDrawerProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (employee: Employee) => void;
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

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
}: FieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-[#17201a]">
        {label}
        {required ? (
          <span className="ml-1 text-red-500">*</span>
        ) : null}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
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
  disabled?: boolean;
  required?: boolean;
};

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
  required = false,
}: SelectFieldProps) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-[#17201a]">
        {label}
        {required ? (
          <span className="ml-1 text-red-500">*</span>
        ) : null}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
        className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        <option value="">
          {disabled
            ? "Select a department first"
            : "Select..."}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export default function InviteEmployeeDrawer({
  open,
  onClose,
  onInvite,
}: InviteEmployeeDrawerProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] =
    useState<EmployeeDepartment | "">("");
  const [role, setRole] = useState<EmployeeRole | "">("");
  const [error, setError] = useState("");

  const roleOptions = useMemo(() => {
    return department
      ? departmentRoles[department]
      : [];
  }, [department]);

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setDepartment("");
    setRole("");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (
      !trimmedName ||
      !trimmedEmail ||
      !department ||
      !role
    ) {
      setError(
        "Please enter a name and email, then select a department and role.",
      );
      return;
    }

    const newEmployee: Employee = {
      id: Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      phone: phone.trim() || null,
      department,
      role,
      status: "Active",
      loginStatus: "Invite Pending",
      initials: getInitials(trimmedName),
    };

    onInvite(newEmployee);
    resetForm();
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button
        type="button"
        aria-label="Close invite employee drawer"
        onClick={handleClose}
        className="absolute inset-0 cursor-default"
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-black/[0.08] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#17201a]">
              Invite Employee
            </h2>

            <p className="mt-1 text-sm text-[#77827a]">
              Add a team member and prepare their HQ access.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close drawer"
            className="grid size-9 place-items-center rounded-xl text-[#657168] transition hover:bg-black/[0.05] hover:text-[#17201a]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            <Field
              label="Full Name"
              placeholder="Full name"
              value={name}
              onChange={setName}
              required
            />

            <Field
              label="Email"
              placeholder="name@company.com"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />

            <Field
              label="Phone"
              placeholder="(555) 555-5555"
              value={phone}
              onChange={setPhone}
            />

            <SelectField
              label="Department"
              value={department}
              onChange={(value) => {
                setDepartment(
                  value as EmployeeDepartment | "",
                );
                setRole("");
              }}
              options={Object.keys(
                departmentRoles,
              ) as EmployeeDepartment[]}
              required
            />

            <SelectField
              label="Role"
              value={role}
              onChange={(value) =>
                setRole(value as EmployeeRole | "")
              }
              options={roleOptions}
              disabled={!department}
              required
            />

            {error ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <footer className="flex gap-3 border-t border-[var(--border)] bg-white p-6">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-[#657168] transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Send Invitation
          </button>
        </footer>
      </aside>
    </div>
  );
}