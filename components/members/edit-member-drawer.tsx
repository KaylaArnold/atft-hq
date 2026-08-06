"use client";

import { useEffect, useState } from "react";

import Drawer from "@/components/ui/drawer";
import TextField from "@/components/ui/text-field";
import SelectField from "@/components/ui/select-field";
import Button from "@/components/ui/button";

import type {
  Member,
  MemberStatus,
  PaymentStatus,
  SupportStatus,
} from "@/lib/types/member";

type Props = {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onSave: (member: Member) => void;
};

export default function EditMemberDrawer({
  open,
  member,
  onClose,
  onSave,
}: Props) {
  const emptyMember: Member = {
    id: 0,
    name: "",
    email: null,
    phone: null,
    program: "",
    community: "",
    payments: "Current",
    support: "None",
    status: "Active",
  };

  const [form, setForm] = useState<Member>(member ?? emptyMember);

  useEffect(() => {
    if (member) {
      setForm(member);
    }
  }, [member]);

  if (!open || !member) return null;

  function update<K extends keyof Member>(
    key: K,
    value: Member[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handleSave() {
    onSave(form);
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Edit ${form.name}`}
      width="lg"
    >
      <div className="space-y-6">
        <TextField
          label="Name"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
        />

        <TextField
          label="Email"
          type="email"
          value={form.email ?? ""}
          onChange={(event) =>
            update("email", event.target.value || null)
          }
        />

        <TextField
          label="Phone"
          type="tel"
          value={form.phone ?? ""}
          onChange={(event) =>
            update("phone", event.target.value || null)
          }
        />

        <TextField
          label="Program"
          value={form.program}
          onChange={(event) => update("program", event.target.value)}
        />

        <SelectField
          label="Status"
          value={form.status}
          onChange={(event) =>
            update("status", event.target.value as MemberStatus)
          }
        >
          <option value="Active">Active</option>
          <option value="Needs Attention">Needs Attention</option>
          <option value="Inactive">Inactive</option>
        </SelectField>

        <SelectField
          label="Payments"
          value={form.payments}
          onChange={(event) =>
            update("payments", event.target.value as PaymentStatus)
          }
        >
          <option value="Current">Current</option>
          <option value="Past Due">Past Due</option>
          <option value="Deposit Paid">Deposit Paid</option>
          <option value="Paid in Full">Paid in Full</option>
        </SelectField>

        <SelectField
          label="Support"
          value={form.support}
          onChange={(event) =>
            update("support", event.target.value as SupportStatus)
          }
        >
          <option value="None">None</option>
          <option value="Open">Open</option>
          <option value="Waiting Reply">Waiting Reply</option>
          <option value="Waiting on Member">
            Waiting on Member
          </option>
          <option value="Resolved">Resolved</option>
        </SelectField>

        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </Drawer>
  );
}