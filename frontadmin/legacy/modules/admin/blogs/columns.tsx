"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Badge } from "@/components/ui/badge";
import * as React from "react";

export type BlogColumn = {
  _id: string;
  title: string;
  status: "draft" | "published" | "archived";
  category: string;
  featured: boolean;
  views: number;
  createdAt: string;
};

export const columns: ColumnDef<BlogColumn>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "published"
            ? "primary"
            : row.original.status === "draft"
            ? "default"
            : "secondary"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "featured",
    header: "Featured",
    cell: ({ row }) => (
      <Badge variant={row.original.featured ? "default" : "outline"}>
        {row.original.featured ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "views",
    header: "Views",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
