import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Plus,
  RotateCcw,
  UserRound,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

export default async function ApprovalsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const approvalClient =
    (prisma as any).approval ??
    (prisma as any).approvals;

  if (!approvalClient) {
    throw new Error(
      "Approval model is not available on the Prisma client."
    );
  }

  const approvals = await approvalClient.findMany({
    include: {
      requester: true,
      approver: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const now = new Date();

  const pending = approvals.filter(
    (approval: any) => approval.status === "PENDING"
  );

  const overdue = approvals.filter(
    (approval: any) =>
      approval.status === "PENDING" &&
      approval.dueDate &&
      new Date(approval.dueDate) < now
  );

  const changesRequested = approvals.filter(
    (approval: any) => approval.status === "CHANGES_REQUESTED"
  );

  const recentlyDecided = approvals
    .filter(
      (approval: any) =>
        approval.status === "APPROVED" ||
        approval.status === "REJECTED"
    )
    .slice(0, 5);

  const formatLabel = (value: string) =>
    value
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const getUserName = (user: any) =>
    user?.name ??
    user?.fullName ??
    user?.email ??
    "Unassigned";

  const formatDate = (date: Date | string | null) => {
    if (!date) {
      return "No due date";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const renderApproval = (approval: any) => {
    const isOverdue =
      approval.status === "PENDING" &&
      approval.dueDate &&
      new Date(approval.dueDate) < now;

    return (
      <Link
        key={approval.id}
        href={`/hq/approvals/${approval.id}`}
        className="block rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm transition hover:border-emerald-700/20 hover:shadow-md"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-[#162019]">
                {approval.title}
              </h3>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                {formatLabel(approval.type)}
              </span>

              {isOverdue && (
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
                  Overdue
                </span>
              )}
            </div>

            {approval.description && (
              <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#657168]">
                {approval.description}
              </p>
            )}
          </div>

          <span className="rounded-full bg-[#f3f5f4] px-3 py-1 text-[11px] font-semibold text-[#657168]">
            {formatLabel(approval.status)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#8a938d]">
          <span className="inline-flex items-center gap-1.5">
            <UserRound size={13} />
            Requested by {getUserName(approval.requester)}
          </span>

          <span>
            Approver: {getUserName(approval.approver)}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={13} />
            {formatDate(approval.dueDate)}
          </span>
        </div>
      </Link>
    );
  };

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-7 lg:px-9">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              ATFT Operations
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#162019]">
              Approvals
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657168]">
              Track decisions that need review so requests, feedback, and
              approvals do not get lost in messages or conversations.
            </p>
          </div>

          <Link
            href="/hq/approvals/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253129]"
          >
            <Plus size={16} />
            New Approval Request
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#657168]">
                Pending
              </p>

              <FileCheck2
                size={17}
                className="text-[#8a938d]"
              />
            </div>

            <p className="mt-2 text-3xl font-semibold text-[#162019]">
              {pending.length}
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#657168]">
                Overdue
              </p>

              <AlertCircle
                size={17}
                className="text-[#8a938d]"
              />
            </div>

            <p className="mt-2 text-3xl font-semibold text-[#162019]">
              {overdue.length}
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#657168]">
                Changes Requested
              </p>

              <RotateCcw
                size={17}
                className="text-[#8a938d]"
              />
            </div>

            <p className="mt-2 text-3xl font-semibold text-[#162019]">
              {changesRequested.length}
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#657168]">
                Recently Decided
              </p>

              <CheckCircle2
                size={17}
                className="text-[#8a938d]"
              />
            </div>

            <p className="mt-2 text-3xl font-semibold text-[#162019]">
              {recentlyDecided.length}
            </p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#162019]">
                  Pending Approvals
                </h2>

                <p className="mt-1 text-xs text-[#8a938d]">
                  Items currently waiting for a decision.
                </p>
              </div>
            </div>

            {pending.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-black/[0.1] bg-white px-6 py-12 text-center">
                <CheckCircle2
                  size={24}
                  className="mx-auto text-[#8a938d]"
                />

                <h3 className="mt-3 font-semibold text-[#162019]">
                  Nothing waiting for approval
                </h3>

                <p className="mt-2 text-sm text-[#657168]">
                  New requests will appear here when they are submitted.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(renderApproval)}
              </div>
            )}

            {changesRequested.length > 0 && (
              <div className="mt-8">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-[#162019]">
                    Changes Requested
                  </h2>

                  <p className="mt-1 text-xs text-[#8a938d]">
                    Requests that need revision before another decision.
                  </p>
                </div>

                <div className="space-y-3">
                  {changesRequested.map(renderApproval)}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#162019]">
                Recently Decided
              </h2>

              <p className="mt-1 text-xs text-[#8a938d]">
                Recent approvals and rejected requests.
              </p>
            </div>

            {recentlyDecided.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-black/[0.1] bg-white px-6 py-10 text-center">
                <FileCheck2
                  size={22}
                  className="mx-auto text-[#8a938d]"
                />

                <p className="mt-3 text-sm text-[#657168]">
                  No decisions have been recorded yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentlyDecided.map(renderApproval)}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}