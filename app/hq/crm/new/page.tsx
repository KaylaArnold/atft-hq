
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

const LEAD_TYPES = [
  "POTENTIAL_MEMBER",
  "CORPORATE",
  "PARTNERSHIP",
  "OTHER",
] as const;

export default async function NewLeadPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { roles: { include: { role: true } } },
  });

  const isStaff = currentUser?.roles.some((entry) =>
    STAFF_ROLES.some((role) => role === entry.role.name)
  );

  if (!currentUser || !isStaff) redirect("/");

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

  async function createLead(formData: FormData) {
    "use server";

    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) redirect("/sign-in");

    const creator = await prisma.user.findUnique({
      where: { clerkUserId },
      include: { roles: { include: { role: true } } },
    });

    if (
      !creator ||
      !creator.roles.some((entry) =>
        STAFF_ROLES.some((role) => role === entry.role.name)
      )
    ) {
      throw new Error("You are not authorized to create leads.");
    }

    const name = String(formData.get("name") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const type = String(formData.get("type") ?? "POTENTIAL_MEMBER");
    const source = String(formData.get("source") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();
    const ownerId = String(formData.get("ownerId") ?? "").trim();
    const followUpValue = String(formData.get("nextFollowUp") ?? "");

    if (!name) throw new Error("Contact name is required.");

    if (!LEAD_TYPES.some((allowed) => allowed === type)) {
      throw new Error("Invalid lead type.");
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

    const lead = await prisma.lead.create({
      data: {
        name,
        company: company || null,
        email: email || null,
        phone: phone || null,
        type: type as (typeof LEAD_TYPES)[number],
        status: "NEW",
        source: source || null,
        notes: notes || null,
        ownerId: ownerId || null,
        nextFollowUp,
      },
    });

    revalidatePath("/hq/crm");
    redirect(`/hq/crm/${lead.id}`);
  }

  return (
    <AppShell variant="staff">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-7">
        <Link
          href="/hq/crm"
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to CRM
        </Link>

        <h1 className="mt-5 text-3xl font-semibold text-[#162019]">
          Add New Lead
        </h1>

        <p className="mt-2 text-sm text-[#657168]">
          Add a potential member or business contact and assign
          responsibility for the next follow-up.
        </p>

        <form
          action={createLead}
          className="mt-8 space-y-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
        >
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Contact Name *
            </label>
            <input
              id="name"
              name="name"
              required
              maxLength={200}
              placeholder="First and last name"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-medium">
                Company / Organization
              </label>
              <input
                id="company"
                name="company"
                placeholder="Optional"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="type" className="mb-2 block text-sm font-medium">
                Lead Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue="POTENTIAL_MEMBER"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              >
                <option value="POTENTIAL_MEMBER">Potential Member</option>
                <option value="CORPORATE">Corporate</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="contact@example.com"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Optional"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="source" className="mb-2 block text-sm font-medium">
              Lead Source
            </label>
            <input
              id="source"
              name="source"
              placeholder="Instagram, website, referral, event..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="ownerId" className="mb-2 block text-sm font-medium">
                Assigned Staff Owner
              </label>
              <select
                id="ownerId"
                name="ownerId"
                defaultValue=""
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              >
                <option value="">Unassigned</option>
                {staff.map((person) => {
                  const personName = [person.firstName, person.lastName]
                    .filter(Boolean)
                    .join(" ")
                    .trim();

                  return (
                    <option key={person.id} value={person.id}>
                      {personName || person.email}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label
                htmlFor="nextFollowUp"
                className="mb-2 block text-sm font-medium"
              >
                Next Follow-up Date
              </label>
              <input
                id="nextFollowUp"
                name="nextFollowUp"
                type="date"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="mb-2 block text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              placeholder="What do we know about this lead? What should happen next?"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              className="rounded-xl bg-[#162019] px-5 py-3 text-sm font-semibold text-white hover:bg-[#253129]"
            >
              Save Lead
            </button>

            <Link
              href="/hq/crm"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
