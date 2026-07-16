"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import PageHeader from "@/components/ui/page-header";
import { useHQ } from "@/context/HQContext";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Search,
} from "lucide-react";

const filters = [
  "All",
  "Mini Drippers",
  "Needs Attention",
  "Active",
] as const;

type Filter = (typeof filters)[number];

type SortKey =
  | "name"
  | "program"
  | "payments"
  | "community"
  | "support";

type SortDirection = "asc" | "desc";

export default function MembersPage() {
  const router = useRouter();
  const { members } = useHQ();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = members.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.program.toLowerCase().includes(query);

      const needsAttention =
        member.payments !== "Current" ||
        !member.community ||
        member.support.toLowerCase().includes("waiting");

      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Mini Drippers" &&
          member.program === "Mini Drippers") ||
        (activeFilter === "Needs Attention" && needsAttention) ||
        (activeFilter === "Active" &&
          member.community &&
          member.payments === "Current");

      return matchesSearch && matchesFilter;
    });

    return [...filtered].sort((a, b) => {
      let firstValue: string | boolean;
      let secondValue: string | boolean;

      if (sortKey === "community") {
        firstValue = a.community;
        secondValue = b.community;
      } else {
        firstValue = a[sortKey] ?? "";
        secondValue = b[sortKey] ?? "";
      }

      const comparison = String(firstValue).localeCompare(
        String(secondValue),
        undefined,
        {
          sensitivity: "base",
          numeric: true,
        }
      );

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [activeFilter, members, search, sortDirection, sortKey]);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <PageHeader
          eyebrow="Operations"
          title="Member Directory"
          description="Search, manage, and review member records across all ATFT programs."
        />

        <div className="panel rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-xl">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#77827a]"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or program..."
                className="h-12 w-full rounded-2xl border border-[#dfe5e1] bg-white pl-11 pr-4 text-sm text-[#17201a] outline-none transition placeholder:text-[#98a19a] focus:border-emerald-700/25 focus:ring-4 focus:ring-emerald-700/5"
              />
            </div>

            <p className="text-sm font-medium text-[#667169]">
              {filteredMembers.length}{" "}
              {filteredMembers.length === 1 ? "member" : "members"}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={
                    isActive
                      ? "rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white"
                      : "rounded-xl border border-[#dfe5e1] bg-white px-4 py-2.5 text-xs font-medium text-[#556159] transition hover:border-emerald-700/20 hover:bg-emerald-50 hover:text-emerald-700"
                  }
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel mt-6 overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="border-b border-[#e5e9e6] bg-[#f8faf9]">
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-[#7a857d]">
                  <SortableHeader
                    label="Member"
                    sortKey="name"
                    activeSortKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />

                  <SortableHeader
                    label="Program"
                    sortKey="program"
                    activeSortKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />

                  <SortableHeader
                    label="Payments"
                    sortKey="payments"
                    activeSortKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />

                  <SortableHeader
                    label="Community"
                    sortKey="community"
                    activeSortKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />

                  <SortableHeader
                    label="Support"
                    sortKey="support"
                    activeSortKey={sortKey}
                    direction={sortDirection}
                    onSort={handleSort}
                  />

                  <th className="px-6 py-4" />
                </tr>
              </thead>

              <tbody>
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => router.push(`/members/${member.id}`)}
                    className="group cursor-pointer border-b border-[#edf1ee] transition last:border-b-0 hover:bg-[#f8faf9]"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-[#17201a]">
                        {member.name}
                      </p>

                      <p className="mt-1 text-sm text-[#77827a]">
                        {member.email || "No email on file"}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-[#2d3730]">
                      {member.program}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={
                          member.payments === "Current"
                            ? { 
                                backgroundColor:"var(--success-soft)",
                                color: "var(--success)",
                              }
                            : {
                                backgroundColor:"var(--info-soft)",
                                color: "var(--warning)",
                            }

                        }
                      >
                        {member.payments}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={
                          member.community
                            ? {
                                backgroundColor: "var(--success-soft)",
                                color: "var(--success)",
                              }
                            : {
                                backgroundColor: "var(--info-soft)",
                                color: "var(--info)",
                              }
                        }
                      >
                        {member.community ? "Active" : "Pending"}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-[#2d3730]">
                      {member.support}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <ChevronRight
                        size={18}
                        className="text-[#9aa39c] transition group-hover:translate-x-1 group-hover:text-emerald-700"
                      />
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center text-sm text-[#77827a]"
                    >
                      No members match your search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

type SortableHeaderProps = {
  label: string;
  sortKey: SortKey;
  activeSortKey: SortKey;
  direction: SortDirection;
  onSort: (key: SortKey) => void;
};

function SortableHeader({
  label,
  sortKey,
  activeSortKey,
  direction,
  onSort,
}: SortableHeaderProps) {
  const isActive = activeSortKey === sortKey;

  const Icon = !isActive
    ? ArrowUpDown
    : direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <th className="px-6 py-4">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-2 font-semibold transition hover:text-emerald-700"
      >
        {label}

        <Icon
          size={13}
          className={isActive ? "text-emerald-700" : "text-[#9aa39c]"}
        />
      </button>
    </th>
  );
}