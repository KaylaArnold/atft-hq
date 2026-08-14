import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  UsersRound,
} from "lucide-react";

import Link from "next/link";
import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import {
  BalanceMarker,
  RoleName,
} from "@/generated/prisma/client";

export default async function PeerCoachPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  const isPeerCoach = user.roles.some(
    ({ role }) => role.name === RoleName.PEER_COACH
  );

  if (!isPeerCoach) {
    redirect("/");
  }

  const assignments =
    await prisma.peerCoachAssignment.findMany({
      where: {
        peerCoachId: user.id,
        active: true,
      },
      include: {
        member: true,
        program: true,
      },
      orderBy: {
        assignedAt: "asc",
      },
    });

  const now = new Date();

  const reportingDate = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  );

  const reportingMonth =
    reportingDate.getMonth() + 1;

  const reportingYear =
    reportingDate.getFullYear();

  const assignedMembers = await Promise.all(
    assignments.map(async (assignment) => {
      const latestBalance =
        await prisma.monthlyBalance.findUnique({
          where: {
            userId_programId_month_year: {
              userId: assignment.memberId,
              programId: assignment.programId,
              month: reportingMonth,
              year: reportingYear,
            },
          },
          select: {
            marker: true,
          },
        });

      return {
        ...assignment,
        needsFollowUp:
          latestBalance?.marker ===
          BalanceMarker.RED,
      };
    })
  );

  const followUpCount = assignedMembers.filter(
    (assignment) => assignment.needsFollowUp
  ).length;

  return (
    <AppShell variant="member">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Peer Coaching
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            My Assigned Drippers
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            View the Mini Drippers assigned to you and see when a coaching
            follow-up is needed.
          </p>
        </section>

        <section className="mt-9 grid gap-4 sm:grid-cols-2">
          <div className="panel rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <UsersRound size={18} />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Assigned
                </p>

                <p className="mt-1 text-2xl font-semibold text-[var(--text)]">
                  {assignedMembers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="panel rounded-3xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={18} />
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Follow-Up Needed
                </p>

                <p className="mt-1 text-2xl font-semibold text-[var(--text)]">
                  {followUpCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {assignedMembers.length > 0 ? (
            assignedMembers.map((assignment) => {
              const memberName =
                [
                  assignment.member.firstName,
                  assignment.member.lastName,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                assignment.member.email ||
                "ATFT Member";

              return (
                <article
                  key={assignment.id}
                  className="panel rounded-3xl p-6 sm:p-8"
                >
                  <Link
                    href={`/peer-coach/members/${assignment.memberId}`}
                    className="block"
                  >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      {assignment.member.avatarUrl ? (
                        <img
                          src={assignment.member.avatarUrl}
                          alt={memberName}
                          className="size-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="grid size-12 place-items-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                          {memberName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">
                          {memberName}
                        </p>

                        <p className="mt-1 text-xs text-[var(--text-secondary)]">
                          {assignment.program.name}
                        </p>
                      </div>
                    </div>

                    {assignment.needsFollowUp ? (
                      <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                        <AlertTriangle size={13} />
                        Follow-Up Needed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 size={13} />
                        On Track
                      </span>
                    )}
                  </div>

                  {assignment.needsFollowUp && (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/60 p-4">
                      <p className="text-sm font-semibold text-red-700">
                        Monthly coaching follow-up needed
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-700/80">
                        Please connect with this Dripper for coaching support.
                      </p>
                    </div>
                  )}
                  </Link>
                </article>
              );
            })
          ) : (
            <section className="panel rounded-3xl p-8 text-center">
              <UsersRound
                size={24}
                className="mx-auto text-[var(--text-muted)]"
              />

              <h2 className="mt-3 text-lg font-semibold text-[var(--text)]">
                No Drippers assigned yet
              </h2>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Your assigned Mini Drippers will appear here.
              </p>
            </section>
          )}
        </section>
      </div>
    </AppShell>
  );
}