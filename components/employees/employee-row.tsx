import Link from "next/link";
import type { Employee } from "@/lib/types/employee";

type EmployeeRowProps = {
  employee: Employee;
};

export default function EmployeeRow({
  employee,
}: EmployeeRowProps) {
  return (
    <Link
      href={`/people/employees/${employee.id}`}
      className="grid grid-cols-[2fr_1.6fr_1.6fr_1fr_1fr] items-center gap-4 border-b border-[#edf0ee] px-6 py-4 transition hover:bg-[#f8faf9]"
    >
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-xl bg-emerald-700/10 font-semibold text-emerald-700">
          {employee.initials}
        </div>

        <div>
          <p className="font-medium text-[#17201a]">
            {employee.name}
          </p>

          <p className="text-sm text-[#77827a]">
            {employee.email ?? "No email"}
          </p>
        </div>
      </div>

      <p>{employee.role}</p>

      <p>{employee.department}</p>

      <p>{employee.loginStatus}</p>

      <p>{employee.status}</p>
    </Link>
  );
}