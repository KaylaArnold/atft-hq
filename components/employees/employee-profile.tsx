import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { employees } from "@/lib/mock-db/employees";

type EmployeeProfileProps = {
  employeeId: string;
};

export default function EmployeeProfile({
  employeeId,
}: EmployeeProfileProps) {
  const employee = employees.find(
    (currentEmployee) =>
      currentEmployee.id === Number(employeeId),
  );

  if (!employee) {
    notFound();
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <Link
          href="/people/employees"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f7a72] transition hover:text-emerald-700"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </Link>

        <section className="mt-6 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-700/10 text-xl font-semibold text-emerald-700">
                {employee.initials || <UserRound size={24} />}
              </span>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  ATFT Team
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17201a]">
                  {employee.name}
                </h1>

                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge
                    label={employee.role}
                    variant="role"
                  />

                  <StatusBadge
                    label={employee.status}
                    variant="active"
                  />

                  <StatusBadge
                    label={employee.loginStatus}
                    variant="login"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-xl border border-[#dfe5e1] bg-white px-4 py-2.5 text-sm font-semibold text-[#4d5850] transition hover:border-emerald-700/30 hover:text-emerald-700"
            >
              Edit Employee
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.45fr]">
          <div className="space-y-5">
            <ProfileCard
              title="Contact Information"
              description="Employee contact details."
              icon={Mail}
            >
              <DetailRow
                label="Email"
                value={
                  employee.email ? (
                    <a
                      href={`mailto:${employee.email}`}
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      {employee.email}
                    </a>
                  ) : (
                    "No email on file"
                  )
                }
              />

              <DetailRow
                label="Phone"
                value={
                  employee.phone ? (
                    <a
                      href={`tel:${employee.phone.replace(/[^\d+]/g, "")}`}
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      {employee.phone}
                    </a>
                  ) : (
                    "No phone on file"
                  )
                }
              />
            </ProfileCard>

            <ProfileCard
              title="Employment Details"
              description="Role and department information."
              icon={BriefcaseBusiness}
            >
              <DetailRow label="Role" value={employee.role} />
              <DetailRow
                label="Department"
                value={employee.department}
              />
              <DetailRow
                label="Employee status"
                value={employee.status}
              />
            </ProfileCard>
          </div>

          <div className="space-y-5">
            <FeatureCard
              title="Permissions"
              description="System access and permission groups."
              emptyText="Permissions have not been configured yet."
              icon={ShieldCheck}
            />

            <FeatureCard
              title="Account Access"
              description="Login and security information."
              emptyText={`Login status: ${employee.loginStatus}`}
              icon={KeyRound}
            />

            <FeatureCard
              title="Activity"
              description="Recent employee activity will appear here."
              emptyText="No activity recorded yet."
              icon={Phone}
            />
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "role" | "active" | "login";
}) {
  const className =
    variant === "active"
      ? "bg-emerald-700/10 text-emerald-700"
      : variant === "login"
        ? label === "Active"
          ? "bg-sky-500/10 text-sky-700"
          : label === "Invite Pending"
            ? "bg-amber-500/10 text-amber-700"
            : "bg-slate-500/10 text-slate-600"
        : "bg-violet-500/10 text-violet-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

type ProfileCardProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  children: React.ReactNode;
};

function ProfileCard({
  title,
  description,
  icon: Icon,
  children,
}: ProfileCardProps) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
          <Icon size={18} />
        </span>

        <div>
          <h2 className="font-semibold text-[#17201a]">
            {title}
          </h2>

          <p className="mt-1 text-sm text-[#6f7a72]">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 divide-y divide-[#edf0ee]">
        {children}
      </div>
    </article>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <span className="text-sm text-[#77827a]">
        {label}
      </span>

      <span className="text-sm font-medium text-[#2d3730] sm:text-right">
        {value}
      </span>
    </div>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  emptyText: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
};

function FeatureCard({
  title,
  description,
  emptyText,
  icon: Icon,
}: FeatureCardProps) {
  return (
    <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
          <Icon size={18} />
        </span>

        <div>
          <h2 className="font-semibold text-[#17201a]">
            {title}
          </h2>

          <p className="mt-1 text-sm text-[#6f7a72]">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-[#dfe5e1] bg-[#fafbfa] px-5 py-8 text-center">
        <p className="text-sm text-[#77827a]">
          {emptyText}
        </p>
      </div>
    </article>
  );
}