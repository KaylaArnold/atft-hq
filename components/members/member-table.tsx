"use client";

import { useRouter } from "next/navigation";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import { members } from "@/lib/mock-db/members";
import { Member } from "@/lib/types/member";

type AcademyMember = (typeof members)[number];

type Props = {
  members: Member[];
  onEditMember?: (member: Member) => void;
};

type StatusFilter = "All" | "Active" | "Needs Attention" | "Inactive";

const statusFilters: StatusFilter[] = [
  "All",
  "Active",
  "Needs Attention",
  "Inactive",
];

export default function MemberTable({
  members,
  onEditMember,
 }: Props): import("react").JSX.Element {
  
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const filteredMembers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;

      const searchableText = [
        member.name,
        member.email,
        member.phone,
        member.program,
        member.payments,
        member.support,
        member.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [members, searchQuery, statusFilter]);

  return (
    <section className="panel overflow-hidden rounded-3xl">
      <div className="border-b border-[#e8ece9] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
              Member Directory
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
              Academy members
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
              Search and review member contact information, program access,
              payments, and support status.
            </p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#89938c]"
            />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search members..."
              className="h-12 w-full rounded-2xl border border-[#e3e8e5] bg-[#fbfcfb] pl-11 pr-4 text-sm text-[#17201a] outline-none transition placeholder:text-[#98a19a] focus:border-emerald-700/30 focus:bg-white focus:ring-4 focus:ring-emerald-700/5"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const isActive = statusFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-[#e3e8e5] bg-white text-[#6f7a72] hover:border-emerald-700/30 hover:text-emerald-700"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] border-collapse">
          <thead>
            <tr className="border-b border-[#e8ece9] bg-[#fbfcfb] text-left">
              <TableHeading>Member</TableHeading>
              <TableHeading>Status</TableHeading>
              <TableHeading>Program</TableHeading>
              <TableHeading>Community</TableHeading>
              <TableHeading>Payments</TableHeading>
              <TableHeading>Support</TableHeading>
              <TableHeading>
                <span className="sr-only">Open member</span>
              </TableHeading>
            </tr>
          </thead>

      <tbody>
  {filteredMembers.map((member) => (
    <tr
      key={member.id}
      onClick={() => 
        router.push(`/programs/atft-academy/people/${member.id}`)
      }
      className="cursor-pointer hover:bg-gray-50"
    >
      <td className="px-6 py-4">
        <div className="group flex items-center gap-3">
          <MemberAvatar name={member.name} />

          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-[#17201a] transition group-hover:text-emerald-700">
              {member.name}
            </span>

            <span className="mt-1 block truncate text-xs text-[#77827a]">
              {member.email ||
                member.phone ||
                "No contact information"}
            </span>
          </span>
        </div>
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={member.status} />
      </td>

      <td className="px-6 py-4 text-sm text-[#4f5b53]">
        {member.program}
      </td>

      <td className="px-6 py-4">
        <CommunityStatus hasAccess={member.community} />
      </td>

      <td className="px-6 py-4">
        <PaymentBadge status={member.payments} />
      </td>

      <td className="px-6 py-4">
        <SupportBadge status={member.support} />
      </td>

      <td className="px-6 py-4 text-right">
        <button
          type="button"
          aria-label={`Edit ${member.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onEditMember?.(member);
          }}
          className="inline-grid size-9 place-items-center rounded-xl text-[#98a19a] transition hover:bg-emerald-700/10 hover:text-emerald-700"
        >
          <ArrowRight size={16} />
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f0f4f1] text-[#77827a]">
              <Users size={21} />
            </span>

            <h3 className="mt-4 text-base font-semibold text-[#17201a]">
              No members found
            </h3>

            <p className="mt-2 text-sm text-[#77827a]">
              Try changing the search or status filter.
            </p>
          </div>
        </div>
      ) : (
        <div className="border-t border-[#e8ece9] px-6 py-4 text-xs text-[#77827a]">
          Showing {filteredMembers.length} of {members.length} members
        </div>
      )}
    </section>
  );
}

function TableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
      {children}
    </th>
  );
}

function MemberAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-700/10 text-sm font-semibold text-emerald-700">
      {initials || <UserRound size={17} />}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Active"
      ? "border-emerald-700/10 bg-emerald-700/10 text-emerald-700"
      : status === "Needs Attention"
        ? "border-rose-500/10 bg-rose-500/10 text-rose-700"
        : "border-[#dfe5e1] bg-[#f4f6f4] text-[#6f7a72]";

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}

function CommunityStatus({ hasAccess }: { hasAccess: boolean | string }) {
  const accessGranted =
    hasAccess === true || hasAccess === "true" || hasAccess === "yes";

  return accessGranted ? (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
      <CheckCircle2 size={15} />
      Granted
    </span>
  ) : (
    <span className="text-sm font-medium text-amber-700">Pending</span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles =
    status === "Current"
      ? "bg-emerald-700/10 text-emerald-700"
      : "bg-amber-500/10 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}

function SupportBadge({ status }: { status: string }) {
  const styles =
    status === "Resolved"
      ? "bg-emerald-700/10 text-emerald-700"
      : status === "Waiting Reply"
        ? "bg-amber-500/10 text-amber-700"
        : "bg-[#f0f3f1] text-[#6f7a72]";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles}`}
    >
      {status}
    </span>
  );
}