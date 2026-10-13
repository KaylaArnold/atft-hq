
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Plus,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
  "TECHNICAL_SUPPORT",
] as const;

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: Date | null) {
  if (!value) return "Not scheduled";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export default async function CRMPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { roles: { include: { role: true } } },
  });

  const isStaff = currentUser?.roles.some((entry) =>
    STAFF_ROLES.some((role) => role === entry.role.name)
  );

  if (!isStaff) {
    redirect("/");
  }

  const leads = await prisma.lead.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const newLeads = leads.filter(
    (lead) => lead.status === "NEW"
  );

  const followUpsDue = leads.filter(
    (lead) =>
      lead.nextFollowUp &&
      lead.nextFollowUp <= today &&
      lead.status !== "CONVERTED" &&
      lead.status !== "CLOSED_LOST"
  );

  const converted = leads.filter(
    (lead) => lead.status === "CONVERTED"
  );

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-7 lg:px-9">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              ATFT Operations
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#162019]">
              CRM & Lead Tracking
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657168]">
              Manage potential members, business contacts, assigned
              owners, and follow-ups in one place.
            </p>
          </div>

          <Link
            href="/hq/crm/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253129]"
          >
            <Plus size={16} />
            Add New Lead
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Leads",
              value: leads.length,
              icon: UsersRound,
            },
            {
              label: "New Leads",
              value: newLeads.length,
              icon: UserRoundPlus,
            },
            {
              label: "Follow-ups Due",
              value: followUpsDue.length,
              icon: Clock3,
            },
            {
              label: "Converted",
              value: converted.length,
              icon: CheckCircle2,
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#657168]">
                    {stat.label}
                  </p>

                  <Icon size={17} className="text-[#8a938d]" />
                </div>

                <p className="mt-2 text-3xl font-semibold text-[#162019]">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#162019]">
                Lead Directory
              </h2>
              <p className="mt-1 text-xs text-[#8a938d]">
                All potential members and business contacts.
              </p>
            </div>

            <span className="text-xs text-[#8a938d]">
              {leads.length} contacts
            </span>
          </div>

          {leads.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <UsersRound
                size={26}
                className="mx-auto text-[#8a938d]"
              />

              <h3 className="mt-4 font-semibold text-[#162019]">
                No leads added yet
              </h3>

              <p className="mt-2 text-sm text-[#657168]">
                Add your first contact to begin tracking outreach
                and follow-ups.
              </p>

              <Link
                href="/hq/crm/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Add New Lead
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#f8faf8] text-xs text-[#657168]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-4 py-4 font-semibold">Type</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold">Owner</th>
                    <th className="px-4 py-4 font-semibold">Next Follow-up</th>
                    <th className="px-6 py-4 font-semibold">View</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => {
                    const isDue =
                      lead.nextFollowUp &&
                      lead.nextFollowUp <= today &&
                      lead.status !== "CONVERTED" &&
                      lead.status !== "CLOSED_LOST";

                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/hq/crm/${lead.id}`}
                            className="font-semibold text-[#162019] hover:text-emerald-700"
                          >
                            {lead.name}
                          </Link>

                          {lead.company && (
                            <p className="mt-1 text-xs text-[#657168]">
                              {lead.company}
                            </p>
                          )}

                          {lead.email && (
                            <p className="mt-1 text-xs text-[#8a938d]">
                              {lead.email}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 text-[#657168]">
                          {formatLabel(lead.type)}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                            {formatLabel(lead.status)}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-[#657168]">
                          {lead.owner?.firstName || lead.owner?.lastName
                            ? `${lead.owner.firstName ?? ""} ${lead.owner.lastName ?? ""}`.trim()
                            : lead.owner?.email || "Unassigned"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={
                              isDue
                                ? "font-semibold text-red-600"
                                : "text-[#657168]"
                            }
                          >
                            {formatDate(lead.nextFollowUp)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <Link
                            href={`/hq/crm/${lead.id}`}
                            aria-label={`View ${lead.name}`}
                            className="inline-flex text-emerald-700 hover:text-emerald-900"
                          >
                            <ArrowUpRight size={18} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
