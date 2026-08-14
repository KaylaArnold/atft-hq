import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ArrowRightLeft,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { RoleName } from "@/generated/prisma/client";

async function assignPeerCoach(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const staffUser = await prisma.user.findUnique({
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

  const hasHQAccess =
    staffUser?.roles.some(
      ({ role }) =>
        role.name === RoleName.OWNER ||
        role.name === RoleName.COO ||
        role.name === RoleName.MEMBER_SERVICES ||
        role.name === RoleName.ADMINISTRATIVE_SERVICES
    ) ?? false;

  if (!staffUser || !hasHQAccess) {
    redirect("/");
  }

  const memberId = formData.get("memberId");
  const peerCoachId = formData.get("peerCoachId");
  const programId = formData.get("programId");

  if (
    typeof memberId !== "string" ||
    typeof peerCoachId !== "string" ||
    typeof programId !== "string" ||
    !memberId ||
    !peerCoachId ||
    !programId
  ) {
    return;
  }

  /*
   * Make sure the selected coach really has
   * the PEER_COACH role.
   */
  const peerCoach = await prisma.user.findFirst({
    where: {
      id: peerCoachId,
      roles: {
        some: {
          role: {
            name: RoleName.PEER_COACH,
          },
        },
      },
    },
  });

  if (!peerCoach) {
    return;
  }

  /*
   * Make sure the member is actively enrolled
   * in the program being assigned.
   */
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: memberId,
      programId,
      active: true,
    },
  });

  if (!enrollment) {
    return;
  }

  /*
   * One assignment per member/program.
   *
   * If one already exists, this becomes a reassignment.
   */
  await prisma.peerCoachAssignment.upsert({
    where: {
      memberId_programId: {
        memberId,
        programId,
      },
    },
    update: {
      peerCoachId,
      active: true,
      endedAt: null,
      assignedAt: new Date(),
    },
    create: {
      memberId,
      peerCoachId,
      programId,
      active: true,
    },
  });

  revalidatePath("/hq/peer-coaches");
}

async function unassignPeerCoach(formData: FormData) {
  "use server";

  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const staffUser = await prisma.user.findUnique({
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

  const hasHQAccess =
    staffUser?.roles.some(
      ({ role }) =>
        role.name === RoleName.OWNER ||
        role.name === RoleName.COO ||
        role.name === RoleName.MEMBER_SERVICES ||
        role.name === RoleName.ADMINISTRATIVE_SERVICES
    ) ?? false;

  if (!staffUser || !hasHQAccess) {
    redirect("/");
  }

  const assignmentId = formData.get("assignmentId");

  if (
    typeof assignmentId !== "string" ||
    !assignmentId
  ) {
    return;
  }

  await prisma.peerCoachAssignment.update({
    where: {
      id: assignmentId,
    },
    data: {
      active: false,
      endedAt: new Date(),
    },
  });

  revalidatePath("/hq/peer-coaches");
}

export default async function PeerCoachesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const staffUser = await prisma.user.findUnique({
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

  if (!staffUser) {
    redirect("/");
  }

  const hasHQAccess = staffUser.roles.some(
    ({ role }) =>
      role.name === RoleName.OWNER ||
      role.name === RoleName.COO ||
      role.name === RoleName.MEMBER_SERVICES ||
      role.name === RoleName.ADMINISTRATIVE_SERVICES
  );

  if (!hasHQAccess) {
    redirect("/");
  }

  const miniDrippers = await prisma.program.findUnique({
    where: {
      slug: "mini-drippers",
    },
  });

  if (!miniDrippers) {
    return (
      <AppShell variant="staff">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
          <section className="panel rounded-3xl p-8">
            <h1 className="text-xl font-semibold text-[var(--text)]">
              Mini Drippers not found
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              The Mini Drippers program must exist before peer coach
              assignments can be managed.
            </p>
          </section>
        </div>
      </AppShell>
    );
  }

  /*
   * Peer Coaches are members with PEER_COACH role.
   * They are NOT being treated as staff here.
   */
  const peerCoaches = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: RoleName.PEER_COACH,
          },
        },
      },
    },
    include: {
      peerCoachAssignments: {
        where: {
          active: true,
          programId: miniDrippers.id,
        },
        include: {
          member: true,
        },
        orderBy: {
          assignedAt: "asc",
        },
      },
    },
    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
    ],
  });

  /*
   * All active Mini Drippers.
   */
  const miniDripperMembers = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: RoleName.MEMBER,
          },
        },
      },
      enrollments: {
        some: {
          active: true,
          programId: miniDrippers.id,
        },
      },
    },
    include: {
      peerCoachAssignmentsAsMember: {
        where: {
          active: true,
          programId: miniDrippers.id,
        },
      },
    },
    orderBy: [
      {
        firstName: "asc",
      },
      {
        lastName: "asc",
      },
    ],
  });

  const unassignedMembers = miniDripperMembers.filter(
    (member) =>
      member.peerCoachAssignmentsAsMember.length === 0
  );

  const assignedCount =
    miniDripperMembers.length - unassignedMembers.length;

  return (
    <AppShell variant="staff">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-7 lg:px-9 lg:py-10">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Peer Coaching
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--text)] sm:text-[42px]">
            Peer Coach Assignments
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Manage Mini Drippers peer coach assignments and balance
            coaching workloads.
          </p>
        </section>

        <section className="mt-9 grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Peer Coaches"
            value={peerCoaches.length}
            detail="Available coaches"
          />

          <SummaryCard
            label="Assigned"
            value={assignedCount}
            detail="Mini Drippers with a coach"
          />

          <SummaryCard
            label="Unassigned"
            value={unassignedMembers.length}
            detail="Still need a coach"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          {peerCoaches.map((coach) => {
            const coachName =
              [coach.firstName, coach.lastName]
                .filter(Boolean)
                .join(" ") ||
              coach.email ||
              "Peer Coach";

            return (
              <article
                key={coach.id}
                className="panel rounded-3xl p-6 sm:p-8"
              >
                <div className="flex items-center gap-4">
                  {coach.avatarUrl ? (
                    <img
                      src={coach.avatarUrl}
                      alt={coachName}
                      className="size-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid size-12 place-items-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                      {coachName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      Peer Coach
                    </p>

                    <h2 className="mt-1 truncate text-lg font-semibold text-[var(--text)]">
                      {coachName}
                    </h2>

                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {coach.peerCoachAssignments.length}{" "}
                      {coach.peerCoachAssignments.length === 1
                        ? "assigned Dripper"
                        : "assigned Drippers"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {coach.peerCoachAssignments.length > 0 ? (
                    coach.peerCoachAssignments.map(
                      (assignment) => {
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
                          <div
                            key={assignment.id}
                            className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-[var(--text)]">
                                  {memberName}
                                </p>

                                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                                  Assigned{" "}
                                  {new Intl.DateTimeFormat(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  ).format(
                                    assignment.assignedAt
                                  )}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <form
                                  action={assignPeerCoach}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="hidden"
                                    name="memberId"
                                    value={assignment.memberId}
                                  />

                                  <input
                                    type="hidden"
                                    name="programId"
                                    value={miniDrippers.id}
                                  />

                                  <select
                                    name="peerCoachId"
                                    defaultValue={coach.id}
                                    className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs text-[var(--text)] outline-none"
                                  >
                                    {peerCoaches.map(
                                      (coachOption) => {
                                        const optionName =
                                          [
                                            coachOption.firstName,
                                            coachOption.lastName,
                                          ]
                                            .filter(Boolean)
                                            .join(" ") ||
                                          coachOption.email ||
                                          "Peer Coach";

                                        return (
                                          <option
                                            key={coachOption.id}
                                            value={coachOption.id}
                                          >
                                            {optionName}
                                          </option>
                                        );
                                      }
                                    )}
                                  </select>

                                  <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                  >
                                    <ArrowRightLeft size={13} />
                                    Reassign
                                  </button>
                                </form>

                                <form action={unassignPeerCoach}>
                                  <input
                                    type="hidden"
                                    name="assignmentId"
                                    value={assignment.id}
                                  />

                                  <button
                                    type="submit"
                                    className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                  >
                                    Unassign
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-5 text-center">
                      <p className="text-sm font-medium text-[var(--text)]">
                        No Drippers assigned.
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {peerCoaches.length === 0 && (
            <section className="panel rounded-3xl p-8 xl:col-span-2">
              <div className="text-center">
                <UsersRound
                  size={24}
                  className="mx-auto text-[var(--text-muted)]"
                />

                <h2 className="mt-3 text-lg font-semibold text-[var(--text)]">
                  No Peer Coaches found
                </h2>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Members with the Peer Coach role will appear here.
                </p>
              </div>
            </section>
          )}
        </section>

        <section className="panel mt-6 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <UserRoundCheck size={18} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                Needs Assignment
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[var(--text)]">
                Unassigned Mini Drippers
              </h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {unassignedMembers.length > 0 ? (
              unassignedMembers.map((member) => {
                const memberName =
                  [member.firstName, member.lastName]
                    .filter(Boolean)
                    .join(" ") ||
                  member.email ||
                  "ATFT Member";

                return (
                  <div
                    key={member.id}
                    className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">
                        {memberName}
                      </p>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Mini Drippers
                      </p>
                    </div>

                    {peerCoaches.length > 0 ? (
                      <form
                        action={assignPeerCoach}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input
                          type="hidden"
                          name="memberId"
                          value={member.id}
                        />

                        <input
                          type="hidden"
                          name="programId"
                          value={miniDrippers.id}
                        />

                        <select
                          name="peerCoachId"
                          required
                          defaultValue=""
                          className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--text)] outline-none"
                        >
                          <option
                            value=""
                            disabled
                          >
                            Select Peer Coach
                          </option>

                          {peerCoaches.map((coach) => {
                            const coachName =
                              [
                                coach.firstName,
                                coach.lastName,
                              ]
                                .filter(Boolean)
                                .join(" ") ||
                              coach.email ||
                              "Peer Coach";

                            return (
                              <option
                                key={coach.id}
                                value={coach.id}
                              >
                                {coachName} (
                                {
                                  coach
                                    .peerCoachAssignments
                                    .length
                                }{" "}
                                assigned)
                              </option>
                            );
                          })}
                        </select>

                        <button
                          type="submit"
                          className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                          Assign
                        </button>
                      </form>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)]">
                        Add a Peer Coach before assigning this
                        member.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-8 text-center">
                <p className="text-sm font-medium text-[var(--text)]">
                  Everyone has a Peer Coach.
                </p>

                <p className="mt-2 text-xs text-[var(--text-secondary)]">
                  There are no unassigned Mini Drippers right now.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="panel rounded-2xl p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-semibold text-[var(--text)]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        {detail}
      </p>
    </div>
  );
}