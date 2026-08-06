"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { useHQ } from "@/context/HQContext";

type AssignStudentsDrawerProps = {
  open: boolean;
  coachId: number;
  onClose: () => void;
};

export default function AssignStudentsDrawer({
  open,
  coachId,
  onClose,
}: AssignStudentsDrawerProps) {
  const { members, updateMember } = useHQ();
  const [search, setSearch] = useState("");
  
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (!open) return;

    const assignedIds = members
      .filter((member) => member.peerCoachId === coachId)
      .map((member) => member.id);

    setSelected(assignedIds);
  }, [open, coachId, members]);

  const filteredMembers = useMemo(() => {
  const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return members;
    }

    return members.filter((member) => {
      return (
        member.name.toLowerCase().includes(normalizedSearch) ||
        member.program.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [members, search]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <button
        type="button"
        aria-label="Close assign students drawer"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <aside className="relative z-10 flex h-full w-full max-w-[360px] flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-black/[0.08] px-5 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#17201a]">Assign Students</h2>
            <p className="mt-1 text-sm text-[#77827a]">
              Select members to assign to this coach.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close assign students drawer"
            onClick={onClose}
            className="rounded-full p-2 text-[#657168] transition hover:bg-[#f8faf9]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="border-b border-black/[0.07] p-4">
          <div className="flex items-center gap-2 rounded-xl border border-black/[0.09] bg-[#f8faf9] px-3 py-2.5">
            <Search size={16} className="shrink-0 text-[#89938c]" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members..."
              className="w-full bg-transparent text-sm text-[#17201a] outline-none placeholder:text-[#98a19b]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <label
                key={member.id}
                className="flex cursor-pointer items-center gap-3 border-b border-black/[0.06] px-5 py-4 transition hover:bg-[#f8faf9]"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(member.id)}
                  onChange={(event) => {
                    setSelected((current) =>
                      event.target.checked
                        ? current.includes(member.id)
                          ? current
                          : [...current, member.id]
                        : current.filter((id) => id !== member.id)
                    );
                  }}
                  className="size-4 accent-emerald-700"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#17201a]">
                    {member.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-[#77827a]">
                    {member.program}
                  </p>
                </div>
              </label>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[#4d5850]">
                No members found
              </p>

              <p className="mt-1 text-xs text-[#89938c]">
                Try searching by another name or program.
              </p>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-black/[0.08] bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-black/[0.09] bg-white px-4 py-2.5 text-sm font-semibold text-[#657168] transition hover:bg-[#f8faf9]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
                members.forEach((member) => {
                    const shouldAssign = selected.includes(member.id);

                    updateMember({
                        ...member,
                        peerCoachId: shouldAssign ? coachId : null,
                    });
                });

                onClose();
            }}
            className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
            Save Assignments
        </button>
        </footer>
      </aside>
    </div>
  );
}