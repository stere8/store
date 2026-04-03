import Link from "next/link";
import { FlashMessage } from "@/components/frontadmin/ui/flash-message";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { formatMoney } from "@/lib/admin-ui";
import {
  listCategories,
  listProducts,
  listVendors,
} from "@/lib/estore-api";

type SearchParams = {
  success?: string;
  error?: string;
  vendorId?: string;
  categoryId?: string;
};

const actionLinkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [products, vendors, categories] = await Promise.all([
    listProducts(),
    listVendors(),
    listCategories(),
  ]);

  const vendorNames = new Map(vendors.map((vendor) => [vendor.id, vendor.displayName]));
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));

  const filteredProducts = products.filter((product) => {
    if (searchParams.vendorId && product.vendorId !== searchParams.vendorId) {
      return false;
    }
    if (searchParams.categoryId && product.categoryId !== searchParams.categoryId) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Products"
        title="Catalog management"
        description="Product CRUD is fully active against EStore.Api. Vendor and category filters below are applied client-side from the live catalog response."
        actions={
          <Link href="/admin/products/new" className={actionLinkClass}>
            Add product
          </Link>
        }
      />

      <FlashMessage kind="success" message={searchParams.success} />
      <FlashMessage kind="error" message={searchParams.error} />

      <Panel>
        <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <select
            name="vendorId"
            defaultValue={searchParams.vendorId || ""}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.displayName}
              </option>
            ))}
          </select>

          <select
            name="categoryId"
            defaultValue={searchParams.categoryId || ""}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <button className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
            Apply filters
          </button>
        </form>
      </Panel>

      <Panel>
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Reserved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="font-semibold text-white hover:text-cyan-200"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {vendorNames.get(product.vendorId) || product.vendorId}
                  </td>
                  <td className="px-4 py-3">
                    {product.categoryId
                      ? categoryNames.get(product.categoryId) || product.categoryId
                      : "Uncategorized"}
                  </td>
                  <td className="px-4 py-3">{formatMoney(product.price)}</td>
                  <td className="px-4 py-3">{product.stockQuantity}</td>
                  <td className="px-4 py-3">{product.reservedQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
