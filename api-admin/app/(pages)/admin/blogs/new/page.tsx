import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import BlogForm from "@/components/modules/admin/blogs/BlogForm";
import * as React from "react";

export default function NewBlogPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading name="Create Blog Post" description="Add a new blog post" />
        <Separator />
        <BlogForm />
      </div>
    </div>
  );
}
