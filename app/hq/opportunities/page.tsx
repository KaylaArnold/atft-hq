
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  DollarSign,
  Plus,
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

const STAGES = [
  "PROSPECTING",
  "CONTACTED",
  "DISCOVERY",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function OpportunitiesPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { roles: { include: { role: true } } },
  });

  const isStaff = currentUser?.roles.some((entry) =>
    STAFF_ROLES.some((role) => role === entry.role.name)
  );

  if (!isStaff) redirect("/");

  const opportunities = await prisma.opportunity.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  });

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const openOpportunities = opportunities.filter(
    (opportunity) =>
      opportunity.stage !== "WON" &&
      opportunity.stage !== "LOST"
  );

  const pipelineValue = openOpportunities.reduce(
    (total, opportunity) =>
      total + Number(opportunity.estimatedValue ?? 0),
    0
  );

  const wonOpportunities = opportunities.filter(
    (opportunity) => opportunity.stage === "WON"
  );

  const followUpsDue = openOpportunities.filter(
    (opportunity) =>
      opportunity.nextFollowUp &&
      opportunity.nextFollowUp <= today
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
              Corporate Opportunities
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657168]">
              Track partnerships, sponsorships, corporate training
              opportunities, deal values, and next steps.
            </p>
          </div>

          <Link
            href="/hq/opportunities/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253129]"
          >
            <Plus size={16} />
            New Opportunity
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Opportunities",
              value: String(opportunities.length),
              icon: BriefcaseBusiness,
            },
            {
              label: "Open Pipeline Value",
              value: formatMoney(pipelineValue),
              icon: DollarSign,
            },
            {
              label: "Deals Won",
              value: String(wonOpportunities.length),
              icon: CheckCircle2,
            },
            {
              label: "Follow-ups Due",
              value: String(followUpsDue.length),
              icon: Clock3,
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

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[#162019]">
            Pipeline Overview
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {STAGES.map((stage) => {
              const stageOpportunities = opportunities.filter(
                (opportunity) => opportunity.stage === stage
              );

              const stageValue = stageOpportunities.reduce(
                (total, opportunity) =>
                  total + Number(opportunity.estimatedValue ?? 0),
                0
              );

              return (
                <div
                  key={stage}
                  className="rounded-2xl border border-black/[0.07] bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold text-[#657168]">
                    {formatLabel(stage)}
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-[#162019]">
                    {stageOpportunities.length}
                  </p>

                  <p className="mt-1 text-xs text-[#8a938d]">
                    {formatMoney(stageValue)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.07] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-[#162019]">
                Opportunity Directory
              </h2>

              <p className="mt-1 text-xs text-[#8a938d]">
                All corporate opportunities and their current stages.
              </p>
            </div>

            <span className="text-xs text-[#8a938d]">
              {opportunities.length} opportunities
            </span>
          </div>

          {opportunities.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <BriefcaseBusiness
                size={26}
                className="mx-auto text-[#8a938d]"
              />

              <h3 className="mt-4 font-semibold text-[#162019]">
                No opportunities added yet
              </h3>

              <p className="mt-2 text-sm text-[#657168]">
                Add your first corporate opportunity to begin
                tracking deals and follow-ups.
              </p>

              <Link
                href="/hq/opportunities/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} />
                New Opportunity
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#f8faf8] text-xs text-[#657168]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Opportunity
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Stage
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Estimated Value
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Owner
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Next Follow-up
                    </th>
                    <th className="px-6 py-4 font-semibold">
                      View
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {opportunities.map((opportunity) => {
                    const isDue =
                      opportunity.nextFollowUp &&
                      opportunity.nextFollowUp <= today &&
                      opportunity.stage !== "WON" &&
                      opportunity.stage !== "LOST";

                    return (
                      <tr
                        key={opportunity.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/hq/opportunities/${opportunity.id}`}
                            className="font-semibold text-[#162019] hover:text-emerald-700"
                          >
                            {opportunity.title}
                          </Link>

                          <p className="mt-1 text-xs text-[#657168]">
                            {opportunity.company}
                          </p>

                          {opportunity.contactName && (
                            <p className="mt-1 text-xs text-[#8a938d]">
                              {opportunity.contactName}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                            {formatLabel(opportunity.stage)}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-medium text-[#162019]">
                          {opportunity.estimatedValue === null
                            ? "Not set"
                            : formatMoney(
                                Number(opportunity.estimatedValue)
                              )}
                        </td>

                        <td className="px-4 py-4 text-[#657168]">
                          {opportunity.owner
                            ? [
                                opportunity.owner.firstName,
                                opportunity.owner.lastName,
                              ].filter(Boolean).join(" ") ||
                              opportunity.owner.email
                            : "Unassigned"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={
                              isDue
                                ? "font-semibold text-red-600"
                                : "text-[#657168]"
                            }
                          >
                            {formatDate(opportunity.nextFollowUp)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <Link
                            href={`/hq/opportunities/${opportunity.id}`}
                            aria-label={`View ${opportunity.title}`}
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
