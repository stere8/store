import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import {
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/admin-actions";
import { listProducts, getCategory } from "@/lib/estore-api";

const linkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

export default async function CategoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [category, products] = await Promise.all([
    getCategory(params.id),
    listProducts(),
  ]);

  if (!category) {
    notFound();
  }

  const linkedProducts = products.filter((product) => product.categoryId === category.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Categories"
        title={`Edit ${category.name}`}
        description={`This category is currently linked to ${linkedProducts.length} products.`}
        actions={
          <Link href="/admin/categories" className={linkClass}>
            Back to categories
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel>
          <form action={updateCategoryAction} className="space-y-4">
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="returnTo" value={`/admin/categories/${category.id}`} />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={category.name}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
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
                defaultValue={category.description || ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <button className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
              Save category
            </button>
          </form>
        </Panel>

        <Panel className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Delete category</p>
            <p className="mt-3 text-sm text-slate-300">
              EStore.Api allows category delete. Use carefully if products still reference this
              category.
            </p>
          </div>

          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="returnTo" value="/admin/categories" />
            <button className="rounded-full bg-rose-400 px-5 py-2 text-sm font-semibold text-slate-950">
              Delete category
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
