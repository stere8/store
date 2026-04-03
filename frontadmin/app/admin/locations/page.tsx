import { FlashMessage } from "@/components/frontadmin/ui/flash-message";
import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { Panel } from "@/components/frontadmin/ui/panel";
import { createLocationAction } from "@/lib/admin-actions";
import { formatDateTime } from "@/lib/admin-ui";
import { listLocations, listVendors } from "@/lib/estore-api";

type SearchParams = {
  success?: string;
  error?: string;
};

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [locations, vendors] = await Promise.all([listLocations(), listVendors()]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin / Locations"
        title="Location registry"
        description="Locations are available as create/list in EStore.Api and are used to assign vendors to physical spots."
      />

      <FlashMessage kind="success" message={searchParams.success} />
      <FlashMessage kind="error" message={searchParams.error} />

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Panel>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Create Location</p>
          <form action={createLocationAction} className="mt-5 space-y-4">
            <input type="hidden" name="returnTo" value="/admin/locations" />

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                placeholder="Kigali City Mall - Floor 2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="code">
                Code
              </label>
              <input
                id="code"
                name="code"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                placeholder="KCM-F2"
              />
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
              />
            </div>

            <button className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-semibold text-slate-950">
              Create location
            </button>
          </form>

          <p className="mt-5 text-xs text-amber-200">
            Update and delete location endpoints are still missing from EStore.Api.
          </p>
        </Panel>

        <Panel>
          <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Vendors</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-200">
                {locations.map((location) => {
                  const usage = vendors.filter(
                    (vendor) => vendor.locationId === location.id
                  ).length;

                  return (
                    <tr key={location.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{location.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {location.description || "No description"}
                        </p>
                      </td>
                      <td className="px-4 py-3">{location.code || "n/a"}</td>
                      <td className="px-4 py-3">{usage}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {formatDateTime(location.createdAt)}
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
