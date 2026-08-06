"use client";

import { Search, UserPlus } from "lucide-react";
import type { Employee } from "@/lib/types/employee";
import EmployeeRow from "./employee-row";
import { useState } from "react";
import InviteEmployeeDrawer from "./invite-employee-drawer";
import { useHQ } from "@/context/HQContext";

export default function EmployeeTable() {
const { employees, addEmployee } = useHQ();
const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#17201a]">
            Employees
          </h2>

          <p className="mt-1 text-sm text-[#6f7a72]">
            {employees.length} employees
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#97a19a]"
            />

            <input
              type="text"
              placeholder="Search employees..."
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-white pl-10 pr-4 text-sm outline-none transition focus:border-emerald-600 sm:w-72"
            />
          </div>

          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            <UserPlus size={16} />
            Invite Employee
          </button>
        </div>
      </div>
    <div className="grid grid-cols-[2fr_1.6fr_1.6fr_1fr_1fr] gap-4 border-b border-[var(--border)] bg-[#fafbfa] px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-[#7b867f]">
  <span>Employee</span>
  <span>Role</span>
  <span>Department</span>
  <span>Login</span>
  <span>Status</span>
</div>

<div>
  {employees.map((employee) => (
    <EmployeeRow
      key={employee.id}
      employee={employee}
    />
  ))}
</div>

<InviteEmployeeDrawer
  open={inviteOpen}
  onClose={() => setInviteOpen(false)}
  onInvite={(newEmployee) => {
    addEmployee(newEmployee);
  }}
/>
    </section>
  );
}