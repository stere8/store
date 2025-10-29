import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import Blog from "@/components/modules/admin/blogs";
import * as React from "react";

export default function BlogsPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading name="Blog Posts" description="Manage your blog posts" />
        <Separator />
        <Blog />
      </div>
    </div>
  );
}
