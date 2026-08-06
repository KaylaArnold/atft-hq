"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import type {
  PeerCoach,
  PeerCoachMeetingStatus,
  PeerCoachRole,
} from "@/lib/types/peer-coach";

type PeerCoachTableProps = {
  coaches: PeerCoach[];
};

type RoleFilter = "All" | PeerCoachRole;
type MeetingFilter = "All" | PeerCoachMeetingStatus;

export default function PeerCoachTable({
  coaches,
}: PeerCoachTableProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [meetingFilter, setMeetingFilter] =
    useState<MeetingFilter>("All");
  
  const filteredCoaches = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return coaches.filter((coach) => {
      const matchesSearch =
        !normalizedSearch ||
        coach.name.toLowerCase().includes(normalizedSearch) ||
        coach.phone.toLowerCase().includes(normalizedSearch) ||
        coach.comments.toLowerCase().includes(normalizedSearch);

      const matchesRole =
        roleFilter === "All" || coach.role === roleFilter;

      const matchesMeeting =
        meetingFilter === "All" ||
        coach.meetingStatus === meetingFilter;

      return matchesSearch && matchesRole && matchesMeeting;
    });
  }, [coaches, meetingFilter, roleFilter, searchTerm]);

  return (
    <section className="panel overflow-hidden rounded-3xl">
      <div className="border-b border-[#e8ece9] p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
              Coach Directory
            </p>

            <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
              All coaches
            </h2>

            <p className="mt-2 text-sm text-[#6f7a72]">
              Search and filter all peer coaches and accountability coaches.
            </p>
          </div>

          <div className="relative w-full xl:max-w-sm">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#89938c]"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search coaches..."
              className="w-full rounded-xl border border-[#dfe5e1] bg-white py-3 pl-11 pr-4 text-sm text-[#17201a] outline-none transition placeholder:text-[#9aa39d] focus:border-emerald-700/40 focus:ring-4 focus:ring-emerald-700/5"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={roleFilter === "All"}
              label="All roles"
              onClick={() => setRoleFilter("All")}
            />

            <FilterButton
              active={roleFilter === "Peer Coach"}
              label="Peer Coaches"
              onClick={() => setRoleFilter("Peer Coach")}
            />

            <FilterButton
              active={roleFilter === "Accountability Coach"}
              label="Accountability Coaches"
              onClick={() => setRoleFilter("Accountability Coach")}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={meetingFilter === "All"}
              label="All attendance"
              onClick={() => setMeetingFilter("All")}
            />

            <FilterButton
              active={meetingFilter === "Attended"}
              label="Attended"
              onClick={() => setMeetingFilter("Attended")}
            />

            <FilterButton
              active={meetingFilter === "Did Not Attend"}
              label="Did not attend"
              onClick={() => setMeetingFilter("Did Not Attend")}
            />
          </div>
        </div>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[850px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e8ece9] bg-[#fbfcfb]">
              <TableHeading>Coach</TableHeading>
              <TableHeading>Role</TableHeading>
              <TableHeading>Phone</TableHeading>
              <TableHeading>Meeting status</TableHeading>
              <TableHeading>Comments</TableHeading>
            </tr>
          </thead>

          <tbody>
            {filteredCoaches.map((coach) => (
              <tr
                key={coach.id}
                role="link"
                tabIndex={0}
                onClick={() =>
                  router.push(`/programs/atft-academy/coaches/${coach.id}`)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    router.push(`/programs/atft-academy/coaches/${coach.id}`);
                  }
                }}
                className="cursor-pointer border-b border-[#edf0ee] transition last:border-b-0 hover:bg-emerald-700/[0.035] focus:bg-emerald-700/[0.035] focus:outline-none"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <CoachAvatar name={coach.name} />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#17201a]">
                        {coach.name}
                      </p>

                      <p className="mt-1 text-xs text-[#89938c]">
                        Coach #{coach.id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <RoleBadge role={coach.role} />
                </td>

                <td className="px-6 py-4">
                  {coach.phone ? (
                    <a
                      href={`tel:${coach.phone.replace(/[^\d+]/g, "")}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#4d5850] transition hover:text-emerald-700"
                    >
                      <Phone size={15} />
                      {coach.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-[#9aa39d]">
                      No phone on file
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <MeetingBadge status={coach.meetingStatus} />
                </td>

                <td className="max-w-xs px-6 py-4">
                  <p className="truncate text-sm text-[#6f7a72]">
                    {coach.comments || "—"}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-[#edf0ee] md:hidden">
        {filteredCoaches.map((coach) => (
            <article 
                key={coach.id} 
                role="link"
                tabIndex={0}
                onClick={() =>
                router.push(`/programs/atft-academy/coaches/${coach.id}`)
                }
                onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    router.push(`/programs/atft-academy/coaches/${coach.id}`);
                }
                }}
                className="cursor-pointer p-5 transition hover:bg-emerald-700/[0.025] focus:bg-emerald-700/[0.025] focus:outline-none"
            >


            <div className="flex items-start gap-3">
              <CoachAvatar name={coach.name} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#17201a]">
                  {coach.name}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <RoleBadge role={coach.role} />
                  <MeetingBadge status={coach.meetingStatus} />
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {coach.phone ? (
                <a
                  href={`tel:${coach.phone.replace(/[^\d+]/g, "")}`}
                  onClick={(event) => event.stopPropagation()}
                  className="flex items-center gap-2 text-sm font-medium text-[#4d5850]"
                >
                  <Phone size={15} />
                  {coach.phone}
                </a>
              ) : (
                <p className="text-sm text-[#9aa39d]">
                  No phone on file
                </p>
              )}

              {coach.comments ? (
                <p className="text-sm leading-6 text-[#6f7a72]">
                  {coach.comments}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {filteredCoaches.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f0f4f1] text-emerald-700">
            <UsersRound size={21} />
          </span>

          <p className="mt-4 text-sm font-semibold text-[#2d3730]">
            No coaches found
          </p>

          <p className="mt-2 text-sm text-[#77827a]">
            Try changing the search or filters.
          </p>
        </div>
      ) : null}

      <div className="border-t border-[#e8ece9] bg-[#fbfcfb] px-6 py-4">
        <p className="text-sm text-[#77827a]">
          Showing{" "}
          <span className="font-semibold text-[#2d3730]">
            {filteredCoaches.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#2d3730]">
            {coaches.length}
          </span>{" "}
          coaches
        </p>
      </div>
    </section>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white"
          : "rounded-full border border-[#dfe5e1] bg-white px-4 py-2 text-xs font-semibold text-[#6f7a72] transition hover:border-emerald-700/30 hover:text-emerald-700"
      }
    >
      {label}
    </button>
  );
}

function TableHeading({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#89938c]">
      {children}
    </th>
  );
}

function CoachAvatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-sm font-semibold text-emerald-700">
      {initials || <UserRound size={18} />}
    </span>
  );
}

function RoleBadge({ role }: { role: PeerCoachRole }) {
  const isAccountabilityCoach = role === "Accountability Coach";

  return (
    <span
      className={
        isAccountabilityCoach
          ? "inline-flex items-center gap-1.5 rounded-full border border-violet-500/10 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700"
          : "inline-flex items-center gap-1.5 rounded-full border border-emerald-700/10 bg-emerald-700/10 px-3 py-1 text-xs font-semibold text-emerald-700"
      }
    >
      {isAccountabilityCoach ? (
        <ShieldCheck size={13} />
      ) : (
        <UsersRound size={13} />
      )}

      {role}
    </span>
  );
}

function MeetingBadge({
  status,
}: {
  status: PeerCoachMeetingStatus;
}) {
  const attended = status === "Attended";

  return (
    <span
      className={
        attended
          ? "inline-flex rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold text-emerald-700"
          : "inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700"
      }
    >
      {status}
    </span>
  );
}