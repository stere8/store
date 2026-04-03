import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import {
  deleteProductAction,
  updateProductAction,
} from "@/lib/admin-actions";
import { formatDateTime, formatMoney } from "@/lib/admin-ui";
import {
  getProduct,
  listCategories,
  listProductReviews,
  listVendors,
} from "@/lib/estore-api";

const linkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, vendors, categories, reviews] = await Promise.all([
    getProduct(params.id),
    listVendors(),
    listCategories(),
    listProductReviews(params.id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Products"
        title={`Edit ${product.name}`}
        description={`Created ${formatDateTime(product.createdAt)}. Current price ${formatMoney(product.price)}.`}
        actions={
          <Link href="/admin/products" className={linkClass}>
            Back to products
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel>
          <form action={updateProductAction} className="space-y-4">
            <input type="hidden" name="id" value={product.id} />
            <input type="hidden" name="returnTo" value={`/admin/products/${product.id}`} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="vendorId">
                  Vendor
                </label>
                <select
                  id="vendorId"
                  name="vendorId"
                  required
                  defaultValue={product.vendorId}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                >
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="categoryId">
                  Category
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={product.categoryId || ""}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="name">
                Product name
              </label>
              <input
                id="name"
                name="name"
                required
                defaultValue={product.name}
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
                defaultValue={product.description || ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  defaultValue={product.price}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="stock">
                  Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  required
                  defaultValue={product.stockQuantity}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                />
              </div>
            </div>

            <button className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
              Save product
            </button>
          </form>

          <p className="mt-4 text-xs text-amber-200">
            Image URL updates are not part of the current `ProductUpdateDto` in EStore.Api.
          </p>
        </Panel>

        <div className="space-y-6">
          <Panel className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Archive product</p>
              <p className="mt-3 text-sm text-slate-300">
                EStore.Api uses soft-delete for products by toggling the active state server-side.
              </p>
            </div>

            <form action={deleteProductAction}>
              <input type="hidden" name="id" value={product.id} />
              <input type="hidden" name="returnTo" value="/admin/products" />
              <button className="rounded-full bg-rose-400 px-5 py-2 text-sm font-semibold text-slate-950">
                Archive product
              </button>
            </form>
          </Panel>

          <Panel>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Reviews</p>
            <div className="mt-4 space-y-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-slate-400">No reviews on this product yet.</p>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[1.4rem] border border-white/10 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-white">
                        Rating {review.rating}/5
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDateTime(review.createdAt)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">
                      {review.comment || review.title || "Review captured with no comment."}
                    </p>
                  </div>
                ))
              )}
            </div>
            <p className="mt-4 text-xs text-amber-200">
              Review moderation and delete endpoints do not exist yet in EStore.Api.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
