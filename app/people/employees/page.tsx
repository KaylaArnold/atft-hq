import AppShell from "@/components/app-shell";
import EmployeeTable from "@/components/employees/employee-table";

export default function EmployeesPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
          People
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17201a]">
          Employees
        </h1>

        <p className="mt-3 text-sm text-[#6f7a72]">
          Manage employees, coordinators, leadership, and system access.
        </p>

        <div className="mt-8">
          <EmployeeTable />
        </div>
      </main>
    </AppShell>
  );
}