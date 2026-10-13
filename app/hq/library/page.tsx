import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Archive,
  BookOpenCheck,
  FileText,
  GraduationCap,
  Plus,
  ScrollText,
  Shapes,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";

export default async function CompanyLibraryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const libraryClient =
    (prisma as any).libraryDocument ??
    (prisma as any).libraryDocuments;

  if (!libraryClient) {
    throw new Error(
      "LibraryDocument model is not available on the Prisma client."
    );
  }

  const documents = await libraryClient.findMany({
    where: {
      status: {
        not: "ARCHIVED",
      },
    },
    include: {
      owner: true,
      createdBy: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const activeCount = documents.filter(
    (document: any) => document.status === "ACTIVE"
  ).length;

  const draftCount = documents.filter(
    (document: any) => document.status === "DRAFT"
  ).length;

  const sopCount = documents.filter(
    (document: any) => document.type === "SOP"
  ).length;

  const typeIcons: Record<string, typeof FileText> = {
    SOP: BookOpenCheck,
    POLICY: ScrollText,
    TEMPLATE: Shapes,
    TRAINING: GraduationCap,
    REFERENCE: FileText,
  };

  const formatLabel = (value: string) =>
    value
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const getOwnerName = (document: any) =>
    document.owner?.name ??
    document.owner?.fullName ??
    document.owner?.email ??
    "Unassigned";

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-7 lg:px-9">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">
              ATFT Operations
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#162019]">
              Company Library
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#657168]">
              The central source for ATFT procedures, policies, templates,
              training materials, and internal references.
            </p>
          </div>

          <Link
            href="/hq/library/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253129]"
          >
            <Plus size={16} />
            New Document
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#657168]">Active Documents</p>
            <p className="mt-2 text-3xl font-semibold text-[#162019]">
              {activeCount}
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#657168]">SOPs</p>
            <p className="mt-2 text-3xl font-semibold text-[#162019]">
              {sopCount}
            </p>
          </div>

          <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-sm">
            <p className="text-sm text-[#657168]">Drafts</p>
            <p className="mt-2 text-3xl font-semibold text-[#162019]">
              {draftCount}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-black/[0.07] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
            <div>
              <h2 className="font-semibold text-[#162019]">
                Library Documents
              </h2>

              <p className="mt-1 text-xs text-[#7a857d]">
                {documents.length}{" "}
                {documents.length === 1 ? "document" : "documents"}
              </p>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#f3f5f4] text-[#657168]">
                <Archive size={20} />
              </div>

              <h3 className="mt-4 font-semibold text-[#162019]">
                No documents yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#657168]">
                Add your first SOP, policy, template, training document, or
                internal reference to start building the ATFT Company Library.
              </p>

              <Link
                href="/hq/library/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-semibold text-[#162019] shadow-sm transition hover:bg-[#f8faf9]"
              >
                <Plus size={15} />
                Add First Document
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {documents.map((document: any) => {
                const Icon = typeIcons[document.type] ?? FileText;

                return (
                  <Link
                    key={document.id}
                    href={`/hq/library/${document.id}`}
                    className="flex items-start gap-4 px-6 py-5 transition hover:bg-[#fafcfb]"
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f3f5f4] text-[#657168]">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[#162019]">
                          {document.title}
                        </h3>

                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                          {formatLabel(document.type)}
                        </span>

                        {document.status === "DRAFT" && (
                          <span className="rounded-full bg-[#f3f5f4] px-2.5 py-1 text-[11px] font-semibold text-[#657168]">
                            Draft
                          </span>
                        )}
                      </div>

                      {document.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#657168]">
                          {document.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#8a938d]">
                        <span>Owner: {getOwnerName(document)}</span>

                        <span>
                          Updated{" "}
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(document.updatedAt))}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}