import Link from "next/link";
import { FlashMessage } from "@/components/frontadmin/ui/flash-message";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { formatDateTime } from "@/lib/admin-ui";
import { createVendorAction } from "@/lib/admin-actions";
import {
  listLocations,
  listProducts,
  listReservations,
  listVendors,
} from "@/lib/estore-api";

type SearchParams = {
  success?: string;
  error?: string;
};

const secondaryLinkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [vendors, locations, products, reservations] = await Promise.all([
    listVendors(),
    listLocations(),
    listProducts(),
    listReservations(),
  ]);

  const locationNames = new Map(locations.map((location) => [location.id, location.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Vendors"
        title="Vendor administration"
        description="Create and audit vendors directly against EStore.Api. Editing vendor profile details is still a backend gap, so this screen currently supports create plus admin visibility."
        actions={
          <Link href="/admin/locations" className={secondaryLinkClass}>
            Manage locations
          </Link>
        }
      />

      <FlashMessage kind="success" message={searchParams.success} />
      <FlashMessage kind="error" message={searchParams.error} />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Panel>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Create Vendor</p>
          <form action={createVendorAction} className="mt-5 space-y-4">
            <input type="hidden" name="returnTo" value="/admin/vendors" />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="displayName">
                Display name
              </label>
              <input
                id="displayName"
                name="displayName"
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-slate-500"
                placeholder="Stereo 8 Downtown"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="legalName">
                Legal name
              </label>
              <input
                id="legalName"
                name="legalName"
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                placeholder="Stereo 8 Downtown Ltd."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="contactPhone">
                  Contact phone
                </label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                  placeholder="+250..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="contactEmail">
                  Contact email
                </label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                  placeholder="vendor@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="locationId">
                Location
              </label>
              <select
                id="locationId"
                name="locationId"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                defaultValue=""
              >
                <option value="">No location assigned yet</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                placeholder="Short admin-facing summary of the vendor."
              />
            </div>

            <button className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
              Create vendor
            </button>
          </form>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Current Vendors</p>
              <h3 className="mt-2 text-2xl font-bold text-white">{vendors.length} vendors</h3>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Products</th>
                  <th className="px-4 py-3 font-medium">Reservations</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
                {vendors.map((vendor) => {
                  const vendorProducts = products.filter(
                    (product) => product.vendorId === vendor.id
                  );
                  const vendorReservations = reservations.filter(
                    (reservation) => reservation.vendorId === vendor.id
                  );

                  return (
                    <tr key={vendor.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/vendors/${vendor.id}`}
                          className="font-semibold text-white hover:text-cyan-200"
                        >
                          {vendor.displayName}
                        </Link>
                        <p className="mt-1 text-xs text-slate-500">{vendor.contactPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {vendor.locationId
                          ? locationNames.get(vendor.locationId) || "Unknown location"
                          : "Unassigned"}
                      </td>
                      <td className="px-4 py-3">{vendorProducts.length}</td>
                      <td className="px-4 py-3">{vendorReservations.length}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {formatDateTime(vendor.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
