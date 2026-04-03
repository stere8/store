import { redirect } from "next/navigation";

export default function StoreDetailRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/admin/vendors/${params.id}`);
}
