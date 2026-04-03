import Link from "next/link";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { StatusBadge } from "@/components/frontadmin/ui/status-badge";
import { formatDateTime, formatMoney } from "@/lib/admin-ui";
import { listReservations, listVendors } from "@/lib/estore-api";

type SearchParams = {
  status?: string;
  vendorId?: string;
};

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [reservations, vendors] = await Promise.all([listReservations(), listVendors()]);
  const vendorNames = new Map(vendors.map((vendor) => [vendor.id, vendor.displayName]));

  const filteredReservations = reservations.filter((reservation) => {
    if (searchParams.status && reservation.status !== searchParams.status) {
      return false;
    }
    if (searchParams.vendorId && reservation.vendorId !== searchParams.vendorId) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Reservations"
        title="Reservation workflows"
        description="Review, confirm, reject, cancel, and complete reservation flows using the current EStore.Api reservation endpoints."
      />

      <Panel>
        <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <select
            name="status"
            defaultValue={searchParams.status || ""}
            className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>

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
                <th className="px-4 py-3 font-medium">Reservation</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
              {filteredReservations.map((reservation) => (
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
    </div>
  );
}
