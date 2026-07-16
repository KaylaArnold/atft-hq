import Link from "next/link";
import {
  ArrowRight,
  Mail,
  MessageSquare,
  NotebookPen,
  Phone,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

type Member = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  program: string;
  community: boolean;
  payments: string;
  support: string;
  status: string;
};

type MemberCardProps = {
  member: Member;
};

export default function MemberCard({ member }: MemberCardProps) {
  const needsAttention = member.status === "Needs Attention";

  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  const memberDetails = [
    [
      "Community",
      member.community ? "Access Granted" : "No Access",
      ShieldCheck,
    ],
    ["Payments", member.payments, WalletCards],
    ["Support", member.support, Mail],
  ] as const;

  return (
    <div className="panel group w-full rounded-3xl p-6 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/20">
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-sm font-semibold text-emerald-300">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{member.name}</h2>

              <p className="mt-1 text-sm text-[#7f8881]">
                {member.program}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail
                    size={15}
                    className="shrink-0 text-emerald-300"
                  />

                  {member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      className="truncate text-[#cfd6d1] transition hover:text-emerald-300"
                    >
                      {member.email}
                    </a>
                  ) : (
                    <span className="text-[#6f7771]">
                      No email on file
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Phone
                    size={15}
                    className="shrink-0 text-emerald-300"
                  />

                  {member.phone ? (
                    <a
                      href={`tel:${member.phone}`}
                      className="text-[#a6afa8] transition hover:text-emerald-300"
                    >
                      {member.phone}
                    </a>
                  ) : (
                    <span className="text-[#6f7771]">
                      No phone number on file
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span
              className={
                needsAttention
                  ? "w-fit rounded-full border border-amber-400/15 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-300"
                  : "w-fit rounded-full border border-emerald-400/15 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300"
              }
            >
              {member.status}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            {memberDetails.map(([label, value, Icon], index) => (
              <div
                key={label}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${
                  index !== memberDetails.length - 1
                    ? "border-b border-white/[0.06]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-emerald-300" />

                  <span className="text-sm text-[#808983]">
                    {label}
                  </span>
                </div>

                <span className="text-right text-sm font-medium">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-5">
            {member.email ? (
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
              >
                <Mail size={14} />
                Email
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/[0.04] px-3 py-2 text-xs text-[#555d57]"
              >
                <Mail size={14} />
                Email
              </button>
            )}

            {member.phone ? (
              <a
                href={`tel:${member.phone}`}
                className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
              >
                <Phone size={14} />
                Call
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-white/[0.04] px-3 py-2 text-xs text-[#555d57]"
              >
                <Phone size={14} />
                Call
              </button>
            )}

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
            >
              <MessageSquare size={14} />
              Mighty
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] px-3 py-2 text-xs transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300"
            >
              <NotebookPen size={14} />
              Notes
            </button>

            <Link
              href={`/members/${member.id}`}
              className="ml-auto flex items-center gap-2 text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
            >
              View Profile
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}