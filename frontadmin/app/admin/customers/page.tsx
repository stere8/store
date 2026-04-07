import Link from "next/link";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { formatDateTime } from "@/lib/admin-ui";
import { listCustomers, listReservations } from "@/lib/estore-api";

type SearchParams = {
  q?: string;
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [customers, reservations] = await Promise.all([
    listCustomers(searchParams.q),
    listReservations(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Customers"
        title="Customer records"
        description="Customer listing and search are supported today through EStore.Api. Customer delete, merge, and segmentation are still backend gaps."
        actions={
          <Link
            href="/admin/reconciliation"
            className="rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950"
          >
            Open reconciliation
          </Link>
        }
      />

      <Panel>
        <form className="flex flex-col gap-4 md:flex-row">
          <input
            name="q"
            defaultValue={searchParams.q || ""}
            placeholder="Search by name, phone, or email"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
          />
          <button className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
            Search
          </button>
        </form>
      </Panel>

      <Panel>
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Reservations</th>
                <th className="px-4 py-3 font-medium">Recent activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
              {customers.map((customer) => {
                const customerReservations = reservations
                  .filter((reservation) => reservation.customerId === customer.id)
                  .sort((left, right) =>
                    right.createdAt.localeCompare(left.createdAt)
                  );

                return (
                  <tr key={customer.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{customer.fullName}</p>
                      <p className="mt-1 text-xs text-slate-500">{customer.username}</p>
                    </td>
                    <td className="px-4 py-3">{customer.phoneNumber}</td>
                    <td className="px-4 py-3">{customer.email || "No email"}</td>
                    <td className="px-4 py-3">{customerReservations.length}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {formatDateTime(customerReservations[0]?.createdAt)}
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
