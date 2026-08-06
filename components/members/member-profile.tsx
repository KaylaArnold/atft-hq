"use client";

import { useState } from "react";
import EditMemberDrawer from "@/components/members/edit-member-drawer";
import { useHQ } from "@/context/HQContext";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
  TicketCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import WorkspaceNav from "@/components/workspace-nav";

type MemberProfilePageProps = {
  memberId: string;
};

export default function MemberProfile({
  memberId,
}: MemberProfilePageProps) {

  const { members, updateMember } = useHQ();

  const member = members.find(
    (item) => String(item.id) === memberId,
  );

  if (!member) {
    notFound();
  }

  const [isEditing, setIsEditing] = useState(false);

  const initials = member.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <>
    <AppShell>
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">

        <Link
          href="/programs/atft-academy/people"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6f7a72] transition hover:text-emerald-700"
        >
          <ArrowLeft size={16} />
          Back to People
        </Link>

        <div className="mt-6">
          <WorkspaceNav active="People" />
        </div>

        <div className="mt-6 space-y-6">
          <section className="panel rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-emerald-700/10 text-xl font-semibold text-emerald-700">
                  {initials || <UserRound size={24} />}
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                    Academy Member
                  </p>

                  <h1 className="mt-2 truncate text-3xl font-semibold tracking-[-0.04em] text-[#17201a]">
                    {member.name}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <StatusBadge status={member.status} />

                    <span className="rounded-full border border-[#e3e8e5] bg-[#fbfcfb] px-3 py-1 text-xs font-semibold text-[#6f7a72]">
                      {member.program}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {member.email ? (
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#e3e8e5] bg-white px-4 py-3 text-sm font-semibold text-[#2d3730] transition hover:border-emerald-700/30 hover:text-emerald-700"
                  >
                    <Mail size={16} />
                    Send email
                  </a>
                ) : null}

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Edit member
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ProfileStat
              label="Program"
              value={member.program}
              detail="Current enrollment"
              icon={ShieldCheck}
            />

            <ProfileStat
              label="Community"
              value={member.community ? "In Community" : "Pending"}
              detail={
                member.community
                  ? "Community access is active"
                  : "Community access is not active"
              }
              icon={CheckCircle2}
            />

            <ProfileStat
              label="Payments"
              value={member.payments}
              detail="Current payment standing"
              icon={WalletCards}
            />

            <ProfileStat
              label="Support"
              value={member.support}
              detail="Current support status"
              icon={TicketCheck}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-6">
              <div className="panel rounded-3xl p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Contact Information
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Member details
                </h2>

                <div className="mt-6 space-y-4">
                  <ContactRow
                    icon={Mail}
                    label="Email"
                    value={member.email || "No email on file"}
                    href={
                      member.email ? `mailto:${member.email}` : undefined
                    }
                  />

                  <ContactRow
                    icon={Phone}
                    label="Phone"
                    value={member.phone || "No phone number on file"}
                    href={
                      member.phone
                        ? `tel:${member.phone.replace(/[^\d+]/g, "")}`
                        : undefined
                    }
                  />

                  <ContactRow
                    icon={ShieldCheck}
                    label="Program"
                    value={member.program}
                  />
                </div>
              </div>

              <div className="panel rounded-3xl p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Quick Actions
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Manage member
                </h2>

                <div className="mt-6 grid gap-3">
                  <ActionButton label="Edit member information" />
                  <ActionButton label="Update payment status" />
                  <ActionButton label="Manage community access" />
                  <ActionButton label="Open support request" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="panel rounded-3xl p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                      Internal Notes
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                      Notes about {member.name}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#6f7a72]">
                      Keep private operational notes for coaches and staff.
                    </p>
                  </div>

                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
                    <MessageSquareText size={19} />
                  </span>
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-[#dfe5e1] bg-[#fbfcfb] px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-[#2d3730]">
                    No notes yet
                  </p>

                  <p className="mt-2 text-sm text-[#77827a]">
                    Notes added by the Academy team will appear here.
                  </p>

                  <button
                    type="button"
                    className="mt-5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  >
                    Add note
                  </button>
                </div>
              </div>

              <div className="panel rounded-3xl p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#89938c]">
                  Activity
                </p>

                <h2 className="mt-2 text-xl font-semibold text-[#17201a]">
                  Member timeline
                </h2>

                <div className="mt-6 space-y-5">
                  <TimelineItem
                    title="Member record created"
                    detail={`${member.name} was added to ${member.program}.`}
                  />

                  <TimelineItem
                    title="Community status"
                    detail={
                      member.community
                        ? "Community access is currently active."
                        : "Community access is currently pending."
                    }
                  />

                  <TimelineItem
                    title="Payment status"
                    detail={`Payment standing is marked as ${member.payments.toLowerCase()}.`}
                  />

                  <TimelineItem
                    title="Support status"
                    detail={`Support is marked as ${member.support.toLowerCase()}.`}
                    isLast
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>

    <EditMemberDrawer
      open={isEditing}
      member={member}
      onClose={() => setIsEditing(false)}
      onSave={(updatedMember) => {
        updateMember(updatedMember);
        setIsEditing(false);
      }}
    /> 
  </>   
);

type ProfileStatProps = {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
};

function ProfileStat({
  label,
  value,
  detail,
  icon: Icon,
}: ProfileStatProps) {
  return (
    <article className="panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#89938c]">
            {label}
          </p>

          <p className="mt-3 truncate text-lg font-semibold text-[#17201a]">
            {value}
          </p>
        </div>

        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-700/10 text-emerald-700">
          <Icon size={19} strokeWidth={1.8} />
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#6f7a72]">
        {detail}
      </p>
    </article>
  );
}

type ContactRowProps = {
  icon: React.ComponentType<{
    size?: number;
    className?: string;
  }>;
  label: string;
  value: string;
  href?: string;
};

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: ContactRowProps) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f0f4f1] text-emerald-700">
        <Icon size={17} />
      </span>

      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#89938c]">
          {label}
        </span>

        <span className="mt-1 block truncate text-sm font-medium text-[#2d3730]">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex items-center gap-3 rounded-2xl border border-[#e8ece9] p-4 transition hover:border-emerald-700/20 hover:bg-emerald-700/[0.03]"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e8ece9] p-4">
      {content}
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl border border-[#e3e8e5] bg-white px-4 py-3.5 text-left text-sm font-semibold text-[#2d3730] transition hover:border-emerald-700/30 hover:bg-emerald-700/[0.03] hover:text-emerald-700"
    >
      {label}
      <span aria-hidden="true">→</span>
    </button>
  );
}

function TimelineItem({
  title,
  detail,
  isLast = false,
}: {
  title: string;
  detail: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {!isLast ? (
        <span className="absolute left-[5px] top-5 h-[calc(100%+4px)] w-px bg-[#dfe5e1]" />
      ) : null}

      <span className="relative mt-1.5 size-3 shrink-0 rounded-full border-[3px] border-emerald-100 bg-emerald-700" />

      <div className="pb-1">
        <p className="text-sm font-semibold text-[#2d3730]">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-[#77827a]">
          {detail}
        </p>
      </div>
    </div>
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
}}