import Link from "next/link";
import { FlashMessage } from "@/components/frontadmin/ui/flash-message";
import { MetricCard } from "@/components/frontadmin/ui/metric-card";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { StatusBadge } from "@/components/frontadmin/ui/status-badge";
import { formatDateTime, formatMoney } from "@/lib/admin-ui";
import {
  listCategories,
  listCustomers,
  listLocations,
  listProducts,
  listReservations,
  listVendors,
} from "@/lib/estore-api";

const actionLinkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

type SearchParams = {
  success?: string;
  error?: string;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [vendors, products, categories, reservations, customers, locations] =
    await Promise.all([
      listVendors(),
      listProducts(),
      listCategories(),
      listReservations(),
      listCustomers(),
      listLocations(),
    ]);

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "Pending"
  );
  const totalCatalogValue = products.reduce(
    (sum, product) => sum + product.price * product.stockQuantity,
    0
  );
  const totalReservedValue = reservations.reduce(
    (sum, reservation) => sum + reservation.totalAmount,
    0
  );

  const recentReservations = [...reservations]
    .sort((left, right) =>
      right.createdAt.localeCompare(left.createdAt)
    )
    .slice(0, 6);

  const lowStockProducts = products
    .filter((product) => product.stockQuantity - product.reservedQuantity <= 5)
    .sort(
      (left, right) =>
        left.stockQuantity - left.reservedQuantity - (right.stockQuantity - right.reservedQuantity)
    )
    .slice(0, 6);

  const vendorNames = new Map(vendors.map((vendor) => [vendor.id, vendor.displayName]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Console"
        title="Dashboard"
        description="This frontadmin build is aligned to EStore.Api and only exposes domains the backend supports today. Unsupported legacy sections stay reachable through explicit placeholder pages instead of broken calls."
        actions={
          <>
            <Link href="/admin/vendors" className={actionLinkClass}>
              Manage vendors
            </Link>
            <Link href="/admin/products/new" className={actionLinkClass}>
              Add product
            </Link>
            <Link href="/admin/categories/new" className={actionLinkClass}>
              Add category
            </Link>
          </>
        }
      />

      <FlashMessage kind="success" message={searchParams.success} />
      <FlashMessage kind="error" message={searchParams.error} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Vendors"
          value={vendors.length}
          detail={`${vendors.filter((vendor) => vendor.verified).length} verified`}
        />
        <MetricCard
          label="Products"
          value={products.length}
          detail={`${lowStockProducts.length} low-stock products need attention`}
        />
        <MetricCard
          label="Reservations"
          value={reservations.length}
          detail={`${pendingReservations.length} pending approval`}
        />
        <MetricCard
          label="Catalog Value"
          value={totalCatalogValue}
          detail={`${categories.length} categories, ${locations.length} locations`}
          currency
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Recent Reservations
              </p>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {formatMoney(totalReservedValue)} reserved across all vendors
              </h3>
            </div>
            <Link href="/admin/reservations" className={actionLinkClass}>
              View all
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Reservation</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
                {recentReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/reservations/${reservation.id}`}
                        className="font-semibold text-white hover:text-cyan-200"
                      >
                        {reservation.reservationNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {vendorNames.get(reservation.vendorId) || reservation.vendorId}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={reservation.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDateTime(reservation.createdAt)}
                    </td>
                    <td className="px-4 py-3">{formatMoney(reservation.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Low Stock</p>
            <div className="mt-4 space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-slate-400">No low-stock products right now.</p>
              ) : (
                lowStockProducts.map((product) => {
                  const available = product.stockQuantity - product.reservedQuantity;
                  return (
                    <div
                      key={product.id}
                      className="rounded-[1.4rem] border border-white/10 bg-slate-900/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-semibold text-white hover:text-cyan-200"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-1 text-xs text-slate-400">
                            Vendor: {vendorNames.get(product.vendorId) || product.vendorId}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                          {available} available
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Panel>

          <Panel>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Coverage Snapshot
            </p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-[1.4rem] border border-white/10 bg-slate-900/60 p-4">
                Customers synced: <strong className="text-white">{customers.length}</strong>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-slate-900/60 p-4">
                Locations configured: <strong className="text-white">{locations.length}</strong>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-slate-900/60 p-4">
                Categories available: <strong className="text-white">{categories.length}</strong>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
