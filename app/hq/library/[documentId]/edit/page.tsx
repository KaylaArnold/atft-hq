import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText, Save } from "lucide-react";

import AppShell from "@/components/app-shell";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-server";

export default async function EditLibraryDocumentPage({
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
  });

  if (!document) {
    notFound();
  }

  const users = await prisma.user.findMany({
    orderBy: {
      email: "asc",
    },
  });

  async function updateDocument(formData: FormData) {
    "use server";

    const { userId } = await auth();

    if (!userId) {
      redirect("/sign-in");
    }

    const { documentId } = await params;

    const updateLibraryClient =
      (prisma as any).libraryDocument ??
      (prisma as any).libraryDocuments;

    if (!updateLibraryClient) {
      throw new Error(
        "LibraryDocument model is not available on the Prisma client."
      );
    }

    const existingDocument = await updateLibraryClient.findUnique({
      where: {
        id: documentId,
      },
    });

    if (!existingDocument) {
      throw new Error("Library document could not be found.");
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(
      formData.get("description") ?? ""
    ).trim();
    const content = String(formData.get("content") ?? "").trim();
    const type = String(formData.get("type") ?? "SOP");
    const status = String(formData.get("status") ?? "DRAFT");
    const ownerId = String(formData.get("ownerId") ?? "").trim();

    if (!title) {
      throw new Error("Document title is required.");
    }

    let fileName = existingDocument.fileName;
    let filePath = existingDocument.filePath;
    let fileType = existingDocument.fileType;
    let fileSize = existingDocument.fileSize;

    const uploadedFile = formData.get("file");

    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      const maxFileSize = 25 * 1024 * 1024;

      if (uploadedFile.size > maxFileSize) {
        throw new Error("File must be 25 MB or smaller.");
      }

      const allowedExtensions = [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
        "csv",
        "txt",
      ];

      const extension =
        uploadedFile.name.split(".").pop()?.toLowerCase() ?? "";

      if (!allowedExtensions.includes(extension)) {
        throw new Error(
          "Unsupported file type. Upload a PDF, Word, Excel, PowerPoint, CSV, or text file."
        );
      }

      const safeFileName = uploadedFile.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const storagePath = `${userId}/${crypto.randomUUID()}-${safeFileName}`;

      const fileBuffer = await uploadedFile.arrayBuffer();

      const { error: uploadError } = await supabaseAdmin.storage
        .from("company-library")
        .upload(storagePath, fileBuffer, {
          contentType:
            uploadedFile.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(
          `File upload failed: ${uploadError.message}`
        );
      }

      // Only remove the old file after the replacement uploaded successfully.
      if (existingDocument.filePath) {
        const { error: removeError } = await supabaseAdmin.storage
          .from("company-library")
          .remove([existingDocument.filePath]);

        if (removeError) {
          // Do not fail the update just because cleanup failed.
          console.error(
            "Old Company Library attachment could not be removed:",
            removeError.message
          );
        }
      }

      fileName = uploadedFile.name;
      filePath = storagePath;
      fileType = uploadedFile.type || null;
      fileSize = uploadedFile.size;
    }

    await updateLibraryClient.update({
      where: {
        id: documentId,
      },
      data: {
        title,
        description: description || null,
        content: content || null,
        type,
        status,
        ownerId: ownerId || null,
        fileName,
        filePath,
        fileType,
        fileSize,
      },
    });

    redirect(`/hq/library/${documentId}`);
  }

  return (
    <AppShell variant="staff">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-7 lg:px-9">
        <Link
          href={`/hq/library/${document.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#657168] transition hover:text-[#162019]"
        >
          <ArrowLeft size={16} />
          Back to Document
        </Link>

        <div className="mb-7">
          <p className="text-sm font-semibold text-emerald-700">
            Company Library
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#162019]">
            Edit Document
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#657168]">
            Update this document or replace its attached file.
          </p>
        </div>

        <form
          action={updateDocument}
          className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white shadow-sm"
        >
          <div className="space-y-6 px-6 py-7 sm:px-8">
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-[#162019]"
              >
                Title
              </label>

              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={document.title}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#162019] outline-none focus:border-emerald-700/40 focus:ring-2 focus:ring-emerald-700/10"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="type"
                  className="mb-2 block text-sm font-semibold text-[#162019]"
                >
                  Document Type
                </label>

                <select
                  id="type"
                  name="type"
                  defaultValue={document.type}
                  className="w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#162019]"
                >
                  <option value="SOP">SOP</option>
                  <option value="POLICY">Policy</option>
                  <option value="TEMPLATE">Template</option>
                  <option value="TRAINING">Training</option>
                  <option value="REFERENCE">Reference</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-2 block text-sm font-semibold text-[#162019]"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue={document.status}
                  className="w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#162019]"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="ownerId"
                className="mb-2 block text-sm font-semibold text-[#162019]"
              >
                Owner
              </label>

              <select
                id="ownerId"
                name="ownerId"
                defaultValue={document.ownerId ?? ""}
                className="w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-[#162019]"
              >
                <option value="">Unassigned</option>

                {users.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name ??
                      user.fullName ??
                      user.email ??
                      "ATFT User"}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-[#8a938d]">
                The owner is responsible for keeping this document current.
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-[#162019]"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={document.description ?? ""}
                className="w-full resize-y rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm leading-6 text-[#162019]"
              />
            </div>

            {document.fileName && (
              <div>
                <p className="mb-2 text-sm font-semibold text-[#162019]">
                  Current Attachment
                </p>

                <div className="flex items-center gap-3 rounded-xl border border-black/[0.07] bg-[#fafcfb] px-4 py-3">
                  <FileText
                    size={17}
                    className="shrink-0 text-[#657168]"
                  />

                  <span className="min-w-0 truncate text-sm font-medium text-[#354039]">
                    {document.fileName}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="file"
                className="mb-2 block text-sm font-semibold text-[#162019]"
              >
                {document.fileName
                  ? "Replace Attachment"
                  : "File Attachment"}
              </label>

              <input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt"
                className="block w-full rounded-xl border border-dashed border-black/[0.12] bg-[#fafcfb] px-4 py-4 text-sm text-[#657168] file:mr-4 file:rounded-lg file:border-0 file:bg-[#162019] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#253129]"
              />

              <p className="mt-2 text-xs text-[#8a938d]">
                {document.fileName
                  ? "Leave this blank to keep the current attachment. Selecting a new file will replace it."
                  : "Optional. Maximum file size: 25 MB."}
              </p>
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-semibold text-[#162019]"
              >
                Document Content
              </label>

              <textarea
                id="content"
                name="content"
                rows={14}
                defaultValue={document.content ?? ""}
                className="w-full resize-y rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm leading-6 text-[#162019]"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-black/[0.06] bg-[#fafcfb] px-6 py-5 sm:px-8">
            <Link
              href={`/hq/library/${document.id}`}
              className="rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm font-semibold text-[#657168] transition hover:bg-[#f3f5f4] hover:text-[#162019]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-[#162019] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#253129]"
            >
              <Save size={15} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}