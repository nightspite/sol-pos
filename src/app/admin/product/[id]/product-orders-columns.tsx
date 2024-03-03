"use client";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/date";
import { formatMoney } from "@/lib/money";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { type RouterOutputs } from "@/trpc/shared";
import { type ColumnDef } from "@tanstack/react-table";
import { EyeIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";

type ProductOrdersTableItem = NonNullable<
  RouterOutputs["product"]["getProduct"]
>["orderItem"][0];

export const PRODUCT_ORDERS_COLUMNS: ColumnDef<ProductOrdersTableItem>[] = [
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {row?.original?.order?.status ?? "-"}
        </span>
      );
    },
  },
  {
    header: "Price",
    accessorKey: "price",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {row?.original?.price ? formatMoney(row?.original?.price) : "-"}
        </span>
      );
    },
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row?.original?.quantity ?? "-"}</span>
      );
    },
  },
  {
    header: "Created at",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {formatDateTime(row.original?.createdAt)}
        </span>
      );
    },
  },
  {
    header: "Updated at",
    accessorKey: "updatedAt",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {formatDateTime(row.original?.updatedAt)}
        </span>
      );
    },
  },
  {
    header: "",
    accessorKey: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Link
                href={`${FRONTEND_ROUTES.ADMIN_ORDER}/${row.original?.orderId}`}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <EyeIcon className="mr-2" size={16} />
                  View Order
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
