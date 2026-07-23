"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { useHQ } from "@/context/HQContext";

import {
  buildSearchIndex,
  type SearchItem,
} from "@/lib/search";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const { members, tickets } = useHQ();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const resultRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const results = useMemo<SearchItem[]>(() => {
    const sanitizedMembers = members.map((member) => ({
      ...member,
      email: member.email ?? undefined,
      phone: member.phone ?? undefined,
    }));

    const items = buildSearchIndex({
      members: sanitizedMembers,
      tickets,
    });

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items.slice(0, 10);
    }

    const searchTerms = normalizedQuery.split(/\s+/).filter(Boolean);

    return items
      .filter((item) =>
        searchTerms.every((term) => item.searchText.includes(term))
      )
      .slice(0, 20);
  }, [members, query, tickets]);

  const memberResults = results.filter(
    (result) => result.type === "member"
  );

  const ticketResults = results.filter(
    (result) => result.type === "ticket"
  );

  function closePalette() {
    onOpenChange(false);
    setQuery("");
    setActiveIndex(0);
  }

  function openResult(result: SearchItem) {
    router.push(result.href);
    closePalette();
  }

  useEffect(() => {
    function handleGlobalShortcut(event: KeyboardEvent) {
      const isCommandShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k";

      if (!isCommandShortcut) {
        return;
      }

      event.preventDefault();
      onOpenChange(!open);
    }

    window.addEventListener("keydown", handleGlobalShortcut);

    return () => {
      window.removeEventListener("keydown", handleGlobalShortcut);
    };
  }, [onOpenChange, open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    resultRefs.current[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [activeIndex]);

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((current) => {
        if (results.length === 0) {
          return 0;
        }

        return current >= results.length - 1 ? 0 : current + 1;
      });

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((current) => {
        if (results.length === 0) {
          return 0;
        }

        return current <= 0 ? results.length - 1 : current - 1;
      });

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const selectedResult = results[activeIndex];

      if (selectedResult) {
        openResult(selectedResult);
      }
    }
  }

  function renderResult(result: SearchItem) {
    const resultIndex = results.findIndex(
      (item) => item.id === result.id
    );

    const isActive = resultIndex === activeIndex;
    const Icon = result.type === "member" ? UserRound : FileText;

    return (
      <button
        key={result.id}
        ref={(element) => {
          resultRefs.current[resultIndex] = element;
        }}
        type="button"
        onClick={() => openResult(result)}
        onMouseEnter={() => setActiveIndex(resultIndex)}
        className={
          isActive
            ? "flex w-full items-center gap-3 rounded-2xl bg-white/[0.07] px-3 py-3 text-left"
            : "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[0.045]"
        }
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#c6a6ee]/10 text-[#c6a6ee]">
          <Icon size={17} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-[#f6f3fa]">
            {result.title}
          </span>

          <span className="mt-0.5 block truncate text-xs text-[#8b8491]">
            {result.subtitle}
          </span>
        </span>

        <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-[#8e8895]">
          {result.type}
        </span>
      </button>
    );
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closePalette();
          return;
        }

        onOpenChange(true);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />

        <Dialog.Content
          onOpenAutoFocus={(event) => {
            event.preventDefault();

            requestAnimationFrame(() => {
              const input = document.querySelector<HTMLInputElement>(
                "[data-command-search]"
              );

              input?.focus();
            });
          }}
          className="fixed left-1/2 top-[12%] z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#111016] shadow-2xl sm:top-[18%]"
        >
          <Dialog.Title className="sr-only">
            Search ATFT HQ
          </Dialog.Title>

          <Dialog.Description className="sr-only">
            Search members and support tickets across ATFT HQ.
          </Dialog.Description>

          <div className="flex items-center gap-3 border-b border-white/10 px-5">
            <Search size={18} className="shrink-0 text-[#c6a6ee]" />

            <input
              data-command-search
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search members and support tickets..."
              className="h-16 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#716b78]"
            />

            <Dialog.Close
              aria-label="Close search"
              className="rounded-lg p-2 text-[#716b78] transition hover:bg-white/5 hover:text-white"
            >
              <X size={17} />
            </Dialog.Close>
          </div>

          <div className="max-h-[480px] overflow-y-auto p-3">
            {results.length === 0 ? (
              <div className="px-3 py-12 text-center">
                <p className="text-sm font-medium text-[#f6f3fa]">
                  No results found
                </p>

                <p className="mt-1 text-xs text-[#716b78]">
                  Try searching by member name, email, program, ticket, or
                  assignee.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {memberResults.length > 0 && (
                  <section>
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#716b78]">
                      Members
                    </p>

                    <div>{memberResults.map(renderResult)}</div>
                  </section>
                )}

                {ticketResults.length > 0 && (
                  <section>
                    <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#716b78]">
                      Member Care
                    </p>

                    <div>{ticketResults.map(renderResult)}</div>
                  </section>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3 text-[11px] text-[#716b78]">
            <span>
              {results.length} {results.length === 1 ? "result" : "results"}
            </span>

            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>Enter Open</span>
              <span>Esc Close</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}