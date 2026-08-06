"use client"

import { useState } from "react";
import Link from "next/link";
import AssignStudentsDrawer from "./assign-students-drawer";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck2,
  FileSignature,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { useHQ } from "@/context/HQContext";
import AppShell from "@/components/app-shell";
import WorkspaceNav from "@/components/workspace-nav";
import { peerCoaches } from "@/lib/mock-db/peer-coaches";

type CoachProfileProps = {
  coachId: string;
};

export default function CoachProfile({
  coachId,
}: CoachProfileProps) {
  const [assignOpen, setAssignOpen] = useState(false);
  const { members } = useHQ();

  const coach = peerCoaches.find(
    (currentCoach) => currentCoach.id === Number(coachId),
  );

  const assignedStudents = members.filter(
    (member) => member.peerCoachId === coach?.id
  );

  if (!coach) {
    notFound();
  }

  const isAccountabilityCoach =
    coach.role === "Accountability Coach";

  return (
    <AppShell>
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <WorkspaceNav active="Peer Coaches" />

        <Link
          href="/programs/atft-academy/coaches"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f7a72] transition hover:text-emerald-700"
        >
          <ArrowLeft size={16} />
          Back to Peer Coaches
        </Link>

        <section className="mt-6 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <CoachAvatar name={coach.name} />

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  ATFT Academy
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#17201a]">
                  {coach.name}
                </h1>

                <div className="mt-3 flex flex-wrap gap-2">
                  <RoleBadge
                    role={coach.role}
                    isAccountabilityCoach={isAccountabilityCoach} />

                  <MeetingBadge status={coach.meetingStatus} />
                </div>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe5e1] bg-white px-4 py-2.5 text-sm font-semibold text-[#4d5850] transition hover:border-emerald-700/30 hover:text-emerald-700"
            >
              <Pencil size={15} />
              Edit Coach
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.5fr]">
          <div className="space-y-5">
            <ProfileCard
              title="Contact Information"
              description="Coach contact details."
              icon={Phone}
            >
              <DetailRow
                label="Phone"
                value={coach.phone ? (
                  <a
                    href={`tel:${coach.phone.replace(/[^\d+]/g, "")}`}
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    {coach.phone}
                  </a>
                ) : (
                  "No phone on file"
                )} />

              <DetailRow
                label="Coach ID"
                value={`Coach #${coach.id}`} />
            </ProfileCard>

            <ProfileCard
              title="Coach Details"
              description="Role and meeting participation."
              icon={ShieldCheck}
            >
              <DetailRow label="Role" value={coach.role} />

              <DetailRow
                label="Meeting status"
                value={coach.meetingStatus} />

              <DetailRow
                label="Comments"
                value={coach.comments || "No comments added"} />
            </ProfileCard>
          </div>

          <div className="space-y-5">
            <article className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                  <UsersRound size={18} />
                </span>

                <div>
                  <h2 className="font-semibold text-[#17201a]">
                    Assigned Students
                  </h2>

                  <p className="mt-1 text-sm text-[#6f7a72]">
                    {assignedStudents.length} students assigned
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-700 bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                Assign Students
              </button>
            </article>

            <div className="mt-6">
              {assignedStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#dfe5e1] bg-[#fafbfa] px-5 py-8 text-center">
                  <p className="text-sm text-[#77827a]">
                    No students have been assigned yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-xl border border-[#edf0ee] px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-[#17201a]">
                          {student.name}
                        </p>

                        <p className="text-sm text-[#77827a]">
                          {student.program}
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Assigned
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto mt-6 max-w-[1500px] px-4 sm:px-7 lg:px-9">
          <FeatureCard
            title="Weekly Check-Ins"
            description="Review this coach’s submitted student check-ins."
            emptyText="No weekly check-ins have been submitted yet."
            actionLabel="View History"
            icon={CalendarCheck2}
          />

          <FeatureCard
            title="Peer Coach Covenant"
            description="Track covenant acknowledgement and signature."
            emptyText="Covenant status has not been recorded."
            actionLabel="Upload Covenant"
            icon={FileSignature}
          />
        </div>
      </main>

      <AssignStudentsDrawer
        open={assignOpen}
        coachId={coach.id}
        onClose={() => setAssignOpen(false)}
      />
    </AppShell>
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
    <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-emerald-700/10 text-2xl font-semibold text-emerald-700">
      {initials || <UserRound size={24} />}
    </span>
  );
}

function RoleBadge({
  role,
  isAccountabilityCoach,
}: {
  role: string;
  isAccountabilityCoach: boolean;
}) {
  return (
    <span
      className={
        isAccountabilityCoach
          ? "inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-700"
          : "inline-flex items-center gap-1.5 rounded-full bg-emerald-700/10 px-3 py-1 text-xs font-semibold text-emerald-700"
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

function MeetingBadge({ status }: { status: string }) {
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
  actionLabel: string;
  onAction?: () => void;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
};

function FeatureCard({
  title,
  description,
  emptyText,
  actionLabel,
  onAction,
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

        <button 
          type="button"
          onClick={onAction}
          disabled={!onAction}
          className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            onAction
              ? "border border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800"
              : "border border-[#dfe5e1] bg-white text-[#899938c]"
          }`}

        >
          {actionLabel}
        </button>
      </div>
    </article>
  );
}