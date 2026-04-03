import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { StatusBadge } from "@/components/frontadmin/ui/status-badge";
import {
  changeReservationStatusAction,
  updateReservationNoteAction,
} from "@/lib/admin-actions";
import { formatDateTime, formatMoney } from "@/lib/admin-ui";
import { getReservation } from "@/lib/estore-api";

const linkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

export default async function ReservationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const reservation = await getReservation(params.id);

  if (!reservation) {
    notFound();
  }

  const availableActions =
    reservation.status === "Pending"
      ? (["confirm", "reject", "cancel"] as const)
      : reservation.status === "Confirmed"
        ? (["complete", "cancel"] as const)
        : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Reservations"
        title={reservation.reservationNumber}
        description={`Pickup code ${reservation.pickupCode}. Created ${formatDateTime(reservation.createdAt)}.`}
        actions={
          <Link href="/admin/reservations" className={linkClass}>
            Back to reservations
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Status</p>
                <div className="mt-3">
                  <StatusBadge status={reservation.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Total</p>
                <p className="mt-3 text-2xl font-bold text-white">
                  {formatMoney(reservation.totalAmount)}
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/[0.03] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Unit price</th>
                    <th className="px-4 py-3 font-medium">Line total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
                  {(reservation.items || []).map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        {item.product?.name || item.productId}
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{formatMoney(item.unitPrice)}</td>
                      <td className="px-4 py-3">{formatMoney(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Customer Notes</p>
            <form action={updateReservationNoteAction} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={reservation.id} />
              <input
                type="hidden"
                name="returnTo"
                value={`/admin/reservations/${reservation.id}`}
              />
              <textarea
                name="note"
                rows={5}
                defaultValue={reservation.customerNotes || ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              />
              <button className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
                Save note
              </button>
            </form>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Reservation Meta</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Customer</dt>
                <dd className="mt-1 text-white">
                  {reservation.customer?.fullName || reservation.customerId}
                </dd>
                <dd className="mt-1 text-slate-400">
                  {reservation.customer?.phoneNumber || "No phone in payload"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Vendor</dt>
                <dd className="mt-1 text-white">
                  {reservation.vendor?.displayName || reservation.vendorId}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Expiry</dt>
                <dd className="mt-1 text-white">{formatDateTime(reservation.expiresAt)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Status Actions</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {availableActions.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No further admin actions are valid for this reservation state.
                </p>
              ) : (
                availableActions.map((action) => (
                  <form key={action} action={changeReservationStatusAction}>
                    <input type="hidden" name="id" value={reservation.id} />
                    <input
                      type="hidden"
                      name="returnTo"
                      value={`/admin/reservations/${reservation.id}`}
                    />
                    <input type="hidden" name="action" value={action} />
                    <button className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200">
                      {action}
                    </button>
                  </form>
                ))
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
