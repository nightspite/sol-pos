"use client";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { formatMoney } from "@/lib/money";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { type RouterOutputs } from "@/trpc/shared";
import { type ColumnDef } from "@tanstack/react-table";
import { EyeIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";

type OrderProductsTableItem = NonNullable<
  RouterOutputs["order"]["getOrder"]
>["items"][0];

export const ORDER_PRODUCTS_COLUMNS: ColumnDef<OrderProductsTableItem>[] = [
  {
    header: "Product",
    accessorKey: "product",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {row?.original?.product?.name ?? "-"}
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
                href={`${FRONTEND_ROUTES.ADMIN_PRODUCT}/${row.original?.productId}`}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <EyeIcon className="mr-2" size={16} />
                  View Product
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
