"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import React from "react";
import { cn, getDate } from "@/lib/utils";

export type Order = {
  _id: string;
  status: string;
  createdAt: string;
  total: string;
};

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "_id",
    header: "ORDER ID",
    cell: ({ row }) => {
      return <span className="font-medium">#{row.getValue("_id")}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      const status = row.getValue("status");
      let color = "";

      switch (status) {
        case "pending":
          color = "text-primary-500";
          break;

        case "cancelled":
          color = "text-danger-500";
          break;

        case "completed":
          color = "text-success-500";
          break;

        default:
          color = "";
          break;
      }

      return (
        <span className={cn("font-medium uppercase", color)}>
          {row.getValue("status")}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "DATE",
    cell: ({ row }) => {
      const formatted = getDate(row.getValue("createdAt"));
      return <div className="font-medium uppercase">{formatted}</div>;
    },
  },
  {
    accessorKey: "total",
    header: "TOTAL",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
