
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

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

async function createOpportunity(formData: FormData) {
  "use server";

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
    throw new Error("You do not have permission to create opportunities.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();

  if (!title || !company) {
    throw new Error("Opportunity title and company are required.");
  }

  const stageInput = String(formData.get("stage") ?? "PROSPECTING");

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

  const opportunity = await prisma.opportunity.create({
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

  redirect(`/hq/opportunities/${opportunity.id}?saved=1`);
}

export default async function NewOpportunityPage() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { roles: { include: { role: true } } },
  });

  const isStaff = currentUser?.roles.some((entry) =>
    STAFF_ROLES.some((role) => role === entry.role.name)
  );

  if (!isStaff) redirect("/");

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
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#162019] outline-none focus:border-emerald-600";

  const labelClass = "block text-sm font-semibold text-[#162019]";

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

        <div className="mb-7">
          <p className="text-sm font-semibold text-emerald-700">
            ATFT Operations
          </p>

          <h1 className="mt-1 text-3xl font-semibold text-[#162019]">
            New Corporate Opportunity
          </h1>

          <p className="mt-2 text-sm text-[#657168]">
            Add a corporate partnership, sponsorship, training deal,
            or other business opportunity.
          </p>
        </div>

        <form
          action={createOpportunity}
          className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <BriefcaseBusiness size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-[#162019]">
                Opportunity Details
              </h2>

              <p className="text-xs text-[#657168]">
                Fields marked * are required.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className={labelClass}>
              Opportunity Title *
              <input
                name="title"
                required
                placeholder="Corporate Training Partnership"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Company *
              <input
                name="company"
                required
                placeholder="Company name"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Contact Name
              <input
                name="contactName"
                placeholder="Primary contact"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Contact Email
              <input
                name="contactEmail"
                type="email"
                placeholder="contact@company.com"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Pipeline Stage
              <select
                name="stage"
                defaultValue="PROSPECTING"
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
                placeholder="5000"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Assigned Owner
              <select
                name="ownerId"
                defaultValue=""
                className={inputClass}
              >
                <option value="">Unassigned</option>

                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {`${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() || person.email}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Next Follow-up
              <input
                name="nextFollowUp"
                type="date"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Expected Close Date
              <input
                name="expectedClose"
                type="date"
                className={inputClass}
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Next Step
              <input
                name="nextStep"
                placeholder="Schedule an introductory meeting"
                className={inputClass}
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Description / Notes
              <textarea
                name="description"
                rows={5}
                placeholder="Describe the opportunity, discussions, and important details..."
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              href="/hq/opportunities"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#657168] hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-[#162019] px-6 py-3 text-sm font-semibold text-white hover:bg-[#253129]"
            >
              Save Opportunity
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
