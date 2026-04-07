import { redirect } from "next/navigation";
import { readVendorAccessToken } from "@/lib/vendor-session";

export default function HomePage() {
  redirect(readVendorAccessToken() ? "/dashboard" : "/login");
}
