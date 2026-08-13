"use client";

type DeletePostButtonProps = {
  postId: string;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export function DeletePostButton({
  postId,
  deleteAction,
}: DeletePostButtonProps) {
  return (
    <form
      action={deleteAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to permanently delete this post? This cannot be undone."
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="postId" value={postId} />

      <button
        type="submit"
        className="rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}