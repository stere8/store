import Link from "next/link";
import { FlashMessage } from "@/components/frontadmin/ui/flash-message";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { formatDateTime } from "@/lib/admin-ui";
import { listCategories, listProducts } from "@/lib/estore-api";

type SearchParams = {
  success?: string;
  error?: string;
};

const actionLinkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Categories"
        title="Category management"
        description="Categories are fully backed by EStore.Api CRUD. Product counts below are calculated from the live catalog."
        actions={
          <Link href="/admin/categories/new" className={actionLinkClass}>
            Add category
          </Link>
        }
      />

      <FlashMessage kind="success" message={searchParams.success} />
      <FlashMessage kind="error" message={searchParams.error} />

      <Panel>
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
              {categories.map((category) => {
                const usage = products.filter(
                  (product) => product.categoryId === category.id
                ).length;

                return (
                  <tr key={category.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="font-semibold text-white hover:text-cyan-200"
                      >
                        {category.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {category.description || "No description"}
                    </td>
                    <td className="px-4 py-3">{usage}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDateTime(category.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
