
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

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

type OpportunityStage = (typeof STAGES)[number];

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateForInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function optionalDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) return null;

  const date = new Date(`${text}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  return date;
}

async function requireStaff() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { roles: { include: { role: true } } },
  });

  const isStaff = currentUser?.roles.some((entry) =>
    STAFF_ROLES.some((role) => role === entry.role.name)
  );

  if (!isStaff) {
    throw new Error("You do not have permission to access opportunities.");
  }
}

async function updateOpportunity(
  opportunityId: string,
  formData: FormData
) {
  "use server";

  await requireStaff();

  const existing = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!existing) notFound();

  const title = String(formData.get("title") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();

  if (!title || !company) {
    throw new Error("Opportunity title and company are required.");
  }

  const stageInput = String(
    formData.get("stage") ?? "PROSPECTING"
  );

  if (!STAGES.some((stage) => stage === stageInput)) {
    throw new Error("Invalid opportunity stage.");
  }

  const stage = stageInput as OpportunityStage;

  const valueInput = String(
    formData.get("estimatedValue") ?? ""
  ).trim();

  let estimatedValue: string | null = null;

  if (valueInput) {
    if (!/^\d+(\.\d{1,2})?$/.test(valueInput)) {
      throw new Error("Enter a valid estimated value.");
    }

    estimatedValue = valueInput;
  }

  const ownerInput = String(formData.get("ownerId") ?? "").trim();

  let ownerId: string | null = null;

  if (ownerInput) {
    const owner = await prisma.user.findFirst({
      where: {
        id: ownerInput,
        roles: {
          some: {
            role: {
              name: { in: [...STAFF_ROLES] },
            },
          },
        },
      },
    });

    if (!owner) {
      throw new Error("Please select a valid staff owner.");
    }

    ownerId = owner.id;
  }

  await prisma.opportunity.update({
    where: { id: opportunityId },
    data: {
      title,
      company,
      contactName: optionalText(formData.get("contactName")),
      contactEmail: optionalText(formData.get("contactEmail")),
      description: optionalText(formData.get("description")),
      stage,
      estimatedValue,
      nextStep: optionalText(formData.get("nextStep")),
      nextFollowUp: optionalDate(formData.get("nextFollowUp")),
      expectedClose: optionalDate(formData.get("expectedClose")),
      ownerId,
    },
  });

  revalidatePath("/hq/opportunities");
  revalidatePath(`/hq/opportunities/${opportunityId}`);

  redirect(`/hq/opportunities/${opportunityId}?saved=1`);
}

export default async function OpportunityDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ opportunityId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireStaff();

  const { opportunityId } = await params;
  const { saved } = await searchParams;

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
  });

  if (!opportunity) notFound();

  const staff = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: { in: [...STAFF_ROLES] },
          },
        },
      },
    },
    orderBy: { firstName: "asc" },
  });

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#162019] outline-none focus:border-emerald-600";

  const labelClass = "block text-sm font-semibold text-[#162019]";

  const saveAction = updateOpportunity.bind(null, opportunityId);

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-7">
        <Link
          href="/hq/opportunities"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#657168] hover:text-[#162019]"
        >
          <ArrowLeft size={16} />
          Back to Opportunities
        </Link>

        {saved === "1" && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800"
          >
            <CheckCircle2 size={20} />
            Changes saved successfully!
          </div>
        )}

        <div className="mb-7">
          <p className="text-sm font-semibold text-emerald-700">
            Corporate Opportunity
          </p>

          <h1 className="mt-1 text-3xl font-semibold text-[#162019]">
            {opportunity.title}
          </h1>

          <p className="mt-2 text-sm text-[#657168]">
            {opportunity.company} · Created{" "}
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(opportunity.createdAt)}
          </p>
        </div>

        <form
          action={saveAction}
          className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 border-b border-gray-100 pb-5">
            <h2 className="text-lg font-semibold text-[#162019]">
              Opportunity Details
            </h2>

            <p className="mt-1 text-sm text-[#657168]">
              Update the stage, ownership, deal value, or next steps.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className={labelClass}>
              Opportunity Title *
              <input
                name="title"
                required
                defaultValue={opportunity.title}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Company *
              <input
                name="company"
                required
                defaultValue={opportunity.company}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Contact Name
              <input
                name="contactName"
                defaultValue={opportunity.contactName ?? ""}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Contact Email
              <input
                name="contactEmail"
                type="email"
                defaultValue={opportunity.contactEmail ?? ""}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Pipeline Stage
              <select
                name="stage"
                defaultValue={opportunity.stage}
                className={inputClass}
              >
                {STAGES.map((stage) => (
                  <option key={stage} value={stage}>
                    {formatLabel(stage)}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Estimated Deal Value ($)
              <input
                name="estimatedValue"
                type="number"
                min="0"
                step="0.01"
                defaultValue={
                  opportunity.estimatedValue?.toString() ?? ""
                }
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Assigned Owner
              <select
                name="ownerId"
                defaultValue={opportunity.ownerId ?? ""}
                className={inputClass}
              >
                <option value="">Unassigned</option>

                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {[person.firstName, person.lastName].filter(Boolean).join(" ") || person.email}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Next Follow-up
              <input
                name="nextFollowUp"
                type="date"
                defaultValue={dateForInput(
                  opportunity.nextFollowUp
                )}
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Expected Close Date
              <input
                name="expectedClose"
                type="date"
                defaultValue={dateForInput(
                  opportunity.expectedClose
                )}
                className={inputClass}
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Next Step
              <input
                name="nextStep"
                defaultValue={opportunity.nextStep ?? ""}
                className={inputClass}
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Description / Notes
              <textarea
                name="description"
                rows={5}
                defaultValue={opportunity.description ?? ""}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              href="/hq/opportunities"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#657168] hover:bg-gray-50"
            >
              Back to Directory
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-[#162019] px-6 py-3 text-sm font-semibold text-white hover:bg-[#253129]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
