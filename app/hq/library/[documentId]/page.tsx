import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Pencil,
  UserRound,
} from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-server";

export default async function LibraryDocumentPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { documentId } = await params;

  const libraryClient =
    (prisma as any).libraryDocument ??
    (prisma as any).libraryDocuments;

  if (!libraryClient) {
    throw new Error(
      "LibraryDocument model is not available on the Prisma client."
    );
  }

  const document = await libraryClient.findUnique({
    where: {
      id: documentId,
    },
    include: {
      owner: true,
      createdBy: true,
    },
  });

  if (!document) {
    notFound();
  }

  let attachmentUrl: string | null = null;

  if (document.filePath) {
    const { data, error } = await supabaseAdmin.storage
      .from("company-library")
      .createSignedUrl(document.filePath, 60 * 10);

    if (!error && data?.signedUrl) {
      attachmentUrl = data.signedUrl;
    }
  }

  const formatLabel = (value: string) =>
    value
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const ownerName =
    document.owner?.name ??
    document.owner?.fullName ??
    document.owner?.email ??
    "Unassigned";

  const updatedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(document.updatedAt));

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-7 lg:px-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/hq/library"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#657168] transition hover:text-[#162019]"
          >
            <ArrowLeft size={16} />
            Back to Company Library
          </Link>

          <Link
            href={`/hq/library/${document.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253129]"
          >
            <Pencil size={15} />
            Edit Document
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-sm">
          <div className="border-b border-black/[0.06] px-6 py-7 sm:px-8">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                {formatLabel(document.type)}
              </span>

              <span className="rounded-full bg-[#f3f5f4] px-3 py-1 text-xs font-semibold text-[#657168]">
                {formatLabel(document.status)}
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#162019] sm:text-3xl">
              {document.title}
            </h1>

            {document.description && (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#657168]">
                {document.description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#8a938d]">
              <span className="inline-flex items-center gap-1.5">
                <UserRound size={13} />
                Owner: {ownerName}
              </span>

              <span>Last updated: {updatedDate}</span>
            </div>
          </div>

          {document.fileName && (
            <div className="border-b border-black/[0.06] bg-[#fafcfb] px-6 py-6 sm:px-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#8a938d]">
                Attachment
              </p>

              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/[0.07] bg-white p-4">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f3f5f4] text-[#657168]">
                  <FileText size={19} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#162019]">
                    {document.fileName}
                  </p>

                  <p className="mt-1 text-xs text-[#8a938d]">
                    {formatFileSize(document.fileSize) ??
                      "File attachment"}
                  </p>
                </div>

                {attachmentUrl ? (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#162019] transition hover:bg-[#f3f5f4]"
                    >
                      <ExternalLink size={14} />
                      Open File
                    </a>

                    <a
                      href={attachmentUrl}
                      download={document.fileName}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#253129]"
                    >
                      <Download size={14} />
                      Download
                    </a>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-red-600">
                    Attachment unavailable
                  </p>
                )}
              </div>

              <p className="mt-2 text-xs text-[#8a938d]">
                File access is temporary because Company Library attachments
                are stored privately.
              </p>
            </div>
          )}

          <div className="px-6 py-7 sm:px-8">
            <h2 className="text-sm font-semibold text-[#162019]">
              Document Content
            </h2>

            {document.content ? (
              <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-black/[0.06] bg-[#fafcfb] px-5 py-5 text-sm leading-7 text-[#354039]">
                {document.content}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-black/[0.1] bg-[#fafcfb] px-5 py-8 text-center text-sm text-[#7a857d]">
                {document.fileName
                  ? "This document is provided as an attached file."
                  : "No document content has been added yet."}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}