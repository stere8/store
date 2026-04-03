import Link from "next/link";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { createCategoryAction } from "@/lib/admin-actions";

const linkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Categories"
        title="Create category"
        description="This form posts directly to EStore.Api category CRUD and redirects back with the result."
        actions={
          <Link href="/admin/categories" className={linkClass}>
            Back to categories
          </Link>
        }
      />

      <Panel className="max-w-2xl">
        <form action={createCategoryAction} className="space-y-4">
          <input type="hidden" name="returnTo" value="/admin/categories" />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              placeholder="Electronics"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              placeholder="Optional category summary."
            />
          </div>

          <button className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
            Create category
          </button>
        </form>
      </Panel>
    </div>
  );
}
