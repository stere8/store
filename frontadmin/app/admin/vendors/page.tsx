import Link from "next/link";
import { FlashMessage } from "@/components/frontadmin/ui/flash-message";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { formatDateTime } from "@/lib/admin-ui";
import { approveVendorAction, createVendorAction } from "@/lib/admin-actions";
import {
  listLocations,
  listProducts,
  listReservations,
  listVendors,
} from "@/lib/estore-api";

type SearchParams = {
  success?: string;
  error?: string;
  active?: string;
};

const secondaryLinkClass =
  "rounded-full border border-cyan-300/40 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950";

const badgeClass =
  "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]";

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
  const activeFilter = searchParams.active === "inactive" ? "inactive" : searchParams.active === "active" ? "active" : "all";
  const verifiedCount = vendors.filter((vendor) => vendor.verified).length;
  const inactiveCount = vendors.filter((vendor) => !vendor.active).length;
  const filteredVendors = vendors.filter((vendor) => {
    if (activeFilter === "active") {
      return vendor.active;
    }
    if (activeFilter === "inactive") {
      return !vendor.active;
    }
    return true;
  });
  const filterSearch = new URLSearchParams();
  if (activeFilter !== "all") {
    filterSearch.set("active", activeFilter);
  }
  const returnTo = filterSearch.size > 0 ? `/admin/vendors?${filterSearch.toString()}` : "/admin/vendors";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Vendors"
        title="Vendor administration"
        description="Create, verify, and audit mall vendors directly against EStore.Api. Vendor profile editing is still a backend gap, but verification is now available here."
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
              <h3 className="mt-2 text-2xl font-bold text-white">
                {filteredVendors.length} of {vendors.length} vendors
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {verifiedCount} verified, {vendors.length - verifiedCount} pending, {inactiveCount} inactive
              </p>
            </div>
          </div>

          <form className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
            <select
              name="active"
              defaultValue={activeFilter}
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">All vendors</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>

            <button className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
              Apply filters
            </button>
          </form>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Products</th>
                  <th className="px-4 py-3 font-medium">Reservations</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
                {filteredVendors.map((vendor) => {
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
                        <p className="mt-1 text-xs text-slate-500">
                          Created {formatDateTime(vendor.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {vendor.locationId
                          ? locationNames.get(vendor.locationId) || "Unknown location"
                          : "Unassigned"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`${badgeClass} ${
                              vendor.active
                                ? "bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/30"
                                : "bg-slate-400/15 text-slate-200 ring-1 ring-slate-400/30"
                            }`}
                          >
                            {vendor.active ? "Active" : "Inactive"}
                          </span>
                          <span
                            className={`${badgeClass} ${
                              vendor.verified
                                ? "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-400/30"
                                : "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30"
                            }`}
                          >
                            {vendor.verified ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{vendorProducts.length}</td>
                      <td className="px-4 py-3">{vendorReservations.length}</td>
                      <td className="px-4 py-3">
                        {vendor.verified ? (
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                            Approved
                          </span>
                        ) : (
                          <form action={approveVendorAction}>
                            <input type="hidden" name="vendorId" value={vendor.id} />
                            <input type="hidden" name="returnTo" value={returnTo} />
                            <button className="rounded-full bg-emerald-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 transition hover:bg-emerald-200">
                              Approve
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredVendors.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No vendors match the current active state filter.
            </p>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
