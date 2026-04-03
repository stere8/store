import Link from "next/link";
import { notFound } from "next/navigation";
import { MetricCard } from "@/components/frontadmin/ui/metric-card";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { StatusBadge } from "@/components/frontadmin/ui/status-badge";
import { formatDateTime, formatMoney } from "@/lib/admin-ui";
import {
  getVendor,
  listLocations,
  listProducts,
  listReservations,
} from "@/lib/estore-api";

const actionLinkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

export default async function VendorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [vendor, locations, products, reservations] = await Promise.all([
    getVendor(params.id),
    listLocations(),
    listProducts(),
    listReservations(),
  ]);

  if (!vendor) {
    notFound();
  }

  const vendorProducts = products.filter((product) => product.vendorId === vendor.id);
  const vendorReservations = reservations.filter(
    (reservation) => reservation.vendorId === vendor.id
  );
  const pendingReservations = vendorReservations.filter(
    (reservation) => reservation.status === "Pending"
  );
  const linkedLocation = locations.find((location) => location.id === vendor.locationId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Vendor Detail"
        title={vendor.displayName}
        description={vendor.description || "No vendor description has been stored yet."}
        actions={
          <>
            <Link href="/admin/products/new" className={actionLinkClass}>
              Add product
            </Link>
            <Link href="/admin/reservations" className={actionLinkClass}>
              View reservations
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Products"
          value={vendorProducts.length}
          detail={`${vendorProducts.filter((product) => product.active).length} active`}
        />
        <MetricCard
          label="Reservations"
          value={vendorReservations.length}
          detail={`${pendingReservations.length} pending`}
        />
        <MetricCard
          label="Reserved Value"
          value={vendorReservations.reduce(
            (sum, reservation) => sum + reservation.totalAmount,
            0
          )}
          detail="Total reservation amount recorded for this vendor"
          currency
        />
        <MetricCard
          label="Catalog Stock"
          value={vendorProducts.reduce((sum, product) => sum + product.stockQuantity, 0)}
          detail="Units currently in stock"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Vendor Profile</p>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-slate-500">Legal name</dt>
              <dd className="mt-1 text-white">{vendor.legalName}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Contact</dt>
              <dd className="mt-1 text-white">{vendor.contactPhone}</dd>
              <dd className="mt-1 text-slate-400">{vendor.contactEmail || "No email"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="mt-1 text-white">
                {linkedLocation ? linkedLocation.name : "No location assigned"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Verification</dt>
              <dd className="mt-1">
                <StatusBadge status={vendor.verified ? "Confirmed" : "Pending"} />
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Created</dt>
              <dd className="mt-1 text-white">{formatDateTime(vendor.createdAt)}</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-[1.4rem] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
            EStore.Api currently exposes vendor create/list only. Admin-side vendor update, activate,
            suspend, and delete endpoints are still missing and are listed in the API proposal doc.
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Products</p>
                <h3 className="mt-2 text-2xl font-bold text-white">
                  {vendorProducts.length} vendor products
                </h3>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Reserved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
                  {vendorProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-semibold text-white hover:text-cyan-200"
                        >
                          {product.name}
                        </Link>
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

          <Panel>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Reservations</p>
            <div className="mt-4 space-y-3">
              {vendorReservations.slice(0, 8).map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-slate-900/60 p-4"
                >
                  <div>
                    <Link
                      href={`/admin/reservations/${reservation.id}`}
                      className="font-semibold text-white hover:text-cyan-200"
                    >
                      {reservation.reservationNumber}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDateTime(reservation.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={reservation.status} />
                    <span className="text-sm text-white">
                      {formatMoney(reservation.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
