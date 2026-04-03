import { lookupAdminGap } from "@/lib/admin-gaps";
import { slugLabel } from "@/lib/admin-ui";
import { Panel } from "@/components/frontadmin/ui/panel";

export function UnsupportedFeature({ segments }: { segments: string[] }) {
  const gap = lookupAdminGap(segments);

  return (
    <Panel className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Backend Gap</p>
        <h2 className="mt-3 text-3xl font-bold text-white">
          {gap?.title || `${slugLabel(segments)} is not implemented in EStore.Api yet.`}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          {gap?.summary ||
            "This legacy admin section was intentionally not reconnected because the .NET API does not provide the domain model or CRUD surface the UI would need."}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
          Recommended API additions
        </p>
        <ul className="mt-4 space-y-3 text-sm text-slate-200">
          {(gap?.recommendedEndpoints || [
            "GET /api/<resource> and GET /api/<resource>/{id}",
            "POST /api/<resource>",
            "PUT or PATCH /api/<resource>/{id}",
            "DELETE /api/<resource>/{id}",
          ]).map((item) => (
            <li key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}
