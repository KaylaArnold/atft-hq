
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, DollarSign } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

const STAFF_ROLES = [
  "OWNER",
  "COO",
  "MEMBER_SERVICES",
  "ADMINISTRATIVE_SERVICES",
  "TECHNICAL_SUPPORT",
] as const;

const SOURCES = [
  "DRIPPER_PROGRAM",
  "MEMBERSHIP",
  "CLASS",
  "CORPORATE_PARTNERSHIP",
  "OTHER",
] as const;

type RevenueSource = (typeof SOURCES)[number];

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function requireStaff() {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  const isStaff = currentUser?.roles.some((entry) =>
    STAFF_ROLES.some((role) => role === entry.role.name)
  );

  if (!currentUser || !isStaff) {
    throw new Error("You do not have permission to record revenue.");
  }

  return currentUser;
}

async function createRevenue(formData: FormData) {
  "use server";

  const currentUser = await requireStaff();

  const amountInput = String(formData.get("amount") ?? "").trim();
  const sourceInput = String(formData.get("source") ?? "").trim();
  const paymentDateInput = String(
    formData.get("paymentDate") ?? ""
  ).trim();
  const description = String(
    formData.get("description") ?? ""
  ).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(amountInput)) {
    throw new Error("Enter a valid payment amount.");
  }

  if (Number(amountInput) <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  if (!SOURCES.some((source) => source === sourceInput)) {
    throw new Error("Please select a valid revenue source.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDateInput)) {
    throw new Error("Please enter a valid payment date.");
  }

  const paymentDate = new Date(
    `${paymentDateInput}T12:00:00.000Z`
  );

  if (
    Number.isNaN(paymentDate.getTime()) ||
    paymentDate.toISOString().slice(0, 10) !== paymentDateInput
  ) {
    throw new Error("Please enter a valid payment date.");
  }

  const source = sourceInput as RevenueSource;

  // Avoid accidental duplicate records for the same payment.
  const duplicate = await prisma.revenueEntry.findFirst({
    where: {
      amount: amountInput,
      source,
      paymentDate,
      description: description || null,
    },
  });

  if (duplicate) {
    redirect("/hq/revenue?duplicate=1");
  }

  await prisma.revenueEntry.create({
    data: {
      amount: amountInput,
      source,
      paymentDate,
      description: description || null,
      recordedById: currentUser.id,
    },
  });

  revalidatePath("/hq/revenue");

  redirect("/hq/revenue?saved=1");
}

export default async function NewRevenuePage() {
  await requireStaff();

  const inputClass =
    "mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#162019] outline-none focus:border-emerald-600";

  const labelClass =
    "block text-sm font-semibold text-[#162019]";

  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-7">
        <Link
          href="/hq/revenue"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#657168] hover:text-[#162019]"
        >
          <ArrowLeft size={16} />
          Back to Revenue
        </Link>

        <div className="mb-7">
          <p className="text-sm font-semibold text-emerald-700">
            ATFT Operations
          </p>

          <h1 className="mt-1 text-3xl font-semibold text-[#162019]">
            Add Revenue
          </h1>

          <p className="mt-2 text-sm text-[#657168]">
            Record a payment ATFT has actually received.
            Do not enter estimated deals or unpaid invoices.
          </p>
        </div>

        <form
          action={createRevenue}
          className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
              <DollarSign size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-[#162019]">
                Payment Details
              </h2>

              <p className="text-xs text-[#657168]">
                All fields marked * are required.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className={labelClass}>
              Payment Amount ($) *
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="299.00"
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Revenue Source *
              <select
                name="source"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Select a source
                </option>

                {SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {formatLabel(source)}
                  </option>
                ))}
              </select>
            </label>

            <label className={labelClass}>
              Payment Date *
              <input
                name="paymentDate"
                type="date"
                required
                defaultValue={today}
                className={inputClass}
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Description / Reference
              <textarea
                name="description"
                rows={4}
                placeholder="Example: October Dripper enrollment payment, receipt number, or payment reference"
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
            Only record payments that have been confirmed as received.
            Check the payment history before adding a transaction
            to avoid duplicates.
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
            <Link
              href="/hq/revenue"
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-[#657168] hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-[#162019] px-6 py-3 text-sm font-semibold text-white hover:bg-[#253129]"
            >
              Save Revenue
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
