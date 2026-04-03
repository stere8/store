import { PageHeader } from "@/components/frontadmin/ui/page-header";
import { UnsupportedFeature } from "@/components/frontadmin/ui/unsupported-feature";

export default function AdminFallbackPage({
  params,
}: {
  params: { slug: string[] };
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Legacy Section"
        title="Unsupported Admin Feature"
        description="This route existed in the older admin, but the current frontadmin build only reconnects areas backed by EStore.Api."
      />
      <UnsupportedFeature segments={params.slug} />
    </div>
  );
}
