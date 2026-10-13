
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/app-shell";

const STAFF_ROLES = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
  "TECHNICAL_SUPPORT",
] as const;

const TYPES = [
  "POTENTIAL_MEMBER",
  "CORPORATE",
  "PARTNERSHIP",
  "OTHER",
] as const;

const STATUSES = [
  "NEW",
  "CONTACTED",
  "FOLLOW_UP",
  "QUALIFIED",
  "CONVERTED",
  "CLOSED_LOST",
] as const;

type LeadType = (typeof TYPES)[number];
type LeadStatus = (typeof STATUSES)[number];

function isStaff(user: {
  roles: { role: { name: string } }[];
} | null) {
  return !!user?.roles.some((entry) =>
    STAFF_ROLES.some((role) => role === entry.role.name)
  );
}

function label(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateForInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { roles: { include: { role: true } } },
  });

  if (!isStaff(currentUser)) redirect("/");

  const { leadId } = await params;
  const { saved } = await searchParams;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { owner: true },
  });

  if (!lead) notFound();

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
    orderBy: { email: "asc" },
  });

  async function updateLead(formData: FormData) {
    "use server";

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) redirect("/sign-in");

    const editor = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { roles: { include: { role: true } } },
    });

    if (!isStaff(editor)) {
      throw new Error("You are not authorized to edit leads.");
    }

    const name = String(formData.get("name") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const type = String(formData.get("type") ?? "");
    const status = String(formData.get("status") ?? "");
    const source = String(formData.get("source") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const ownerId = String(formData.get("ownerId") ?? "").trim();
    const followUpValue = String(formData.get("nextFollowUp") ?? "");

    if (!name) throw new Error("Contact name is required.");

    if (!TYPES.includes(type as LeadType)) {
      throw new Error("Invalid lead type.");
    }

    if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
      throw new Error("Invalid lead status.");
    }

    if (ownerId) {
      const validOwner = await prisma.user.findFirst({
        where: {
          id: ownerId,
          roles: {
            some: {
              role: {
                name: { in: [...STAFF_ROLES] },
              },
            },
          },
        },
      });

      if (!validOwner) {
        throw new Error("Please select a valid staff owner.");
      }
    }

    const nextFollowUp = followUpValue
      ? new Date(`${followUpValue}T12:00:00Z`)
      : null;

    if (nextFollowUp && Number.isNaN(nextFollowUp.getTime())) {
      throw new Error("Invalid follow-up date.");
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        name,
        company: company || null,
        email: email || null,
        phone: phone || null,
        type: type as LeadType,
        status: status as LeadStatus,
        source: source || null,
        notes: notes || null,
        ownerId: ownerId || null,
        nextFollowUp,
      },
    });

    revalidatePath("/hq/crm");
    revalidatePath(`/hq/crm/${leadId}`);
    redirect(`/hq/crm/${leadId}?saved=1`);  }

  const fieldClass =
    "mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm";

  return (
    <AppShell variant="staff">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-7">
        <Link
          href="/hq/crm"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to CRM
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold text-emerald-700">
            CRM & Lead Tracking
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#162019]">
            {lead.name}
          </h1>

          <p className="mt-2 text-sm text-[#657168]">
            Update contact information, ownership, status, and follow-ups.
          </p>
        </div>

        {saved === "1" && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800"
          >
            ✓ Changes saved successfully!
          </div>
)}

        <form
          action={updateLead}
          className="mt-8 space-y-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Contact Name *
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={lead.name}
              className={fieldClass}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="company" className="text-sm font-medium">
                Company / Organization
              </label>
              <input
                id="company"
                name="company"
                defaultValue={lead.company ?? ""}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="type" className="text-sm font-medium">
                Lead Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue={lead.type}
                className={fieldClass}
              >
                {TYPES.map((type) => (
                  <option key={String(type)} value={type}>
                    {label(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={lead.email ?? ""}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={lead.phone ?? ""}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="text-sm font-medium">
                Lead Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={lead.status}
                className={fieldClass}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {label(status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="source" className="text-sm font-medium">
                Lead Source
              </label>
              <input
                id="source"
                name="source"
                defaultValue={lead.source ?? ""}
                className={fieldClass}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ownerId" className="text-sm font-medium">
                Assigned Staff Owner
              </label>
              <select
                id="ownerId"
                name="ownerId"
                defaultValue={lead.ownerId ?? ""}
                className={fieldClass}
              >
                <option value="">Unassigned</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {[person.firstName, person.lastName].filter(Boolean).join(" ") || person.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="nextFollowUp" className="text-sm font-medium">
                Next Follow-up Date
              </label>
              <input
                id="nextFollowUp"
                name="nextFollowUp"
                type="date"
                defaultValue={dateForInput(lead.nextFollowUp)}
                className={fieldClass}
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={6}
              defaultValue={lead.notes ?? ""}
              className={fieldClass}
            />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              className="rounded-xl bg-[#162019] px-5 py-3 text-sm font-semibold text-white hover:bg-[#253129]"
            >
              Save Changes
            </button>

            <Link
              href="/hq/crm"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium"
            >
              Back to CRM
            </Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
