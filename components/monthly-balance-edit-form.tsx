"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";

type MonthlyBalanceEditFormProps = {
  balanceId: string;
  slug: string;
  startingBalance: number;
  endingBalance: number;
  signature: string;
  action: (formData: FormData) => void | Promise<void>;
};

export default function MonthlyBalanceEditForm({
  balanceId,
  slug,
  startingBalance,
  endingBalance,
  signature,
  action,
}: MonthlyBalanceEditFormProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Pencil size={15} />
        Edit Submission
      </button>
    );
  }

  return (
    <div className="mt-7 border-t border-[var(--border)] pt-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Pencil size={15} className="text-[var(--accent)]" />

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Edit Submission
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close edit form"
          className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text)]"
        >
          <X size={16} />
        </button>
      </div>

      <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
        Correct your balances if needed. Your original submission date and
        late/on-time status will remain unchanged.
      </p>

      <form action={action} className="mt-5 space-y-5">
        <input type="hidden" name="balanceId" value={balanceId} />
        <input type="hidden" name="slug" value={slug} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="editStartingBalance"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
            >
              Starting Balance
            </label>

            <input
              id="editStartingBalance"
              name="startingBalance"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={startingBalance}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label
              htmlFor="editEndingBalance"
              className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
            >
              Ending Balance
            </label>

            <input
              id="editEndingBalance"
              name="endingBalance"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={endingBalance}
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="editSignature"
            className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"
          >
            Confirm Signature
          </label>

          <input
            id="editSignature"
            name="signature"
            type="text"
            required
            defaultValue={signature}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface-strong)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}