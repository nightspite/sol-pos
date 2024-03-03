"use client";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { formatDateTime } from "@/lib/date";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { type RouterOutputs } from "@/trpc/shared";
import { type ColumnDef } from "@tanstack/react-table";
import { EyeIcon, MoreHorizontalIcon, PackageMinusIcon } from "lucide-react";
import Link from "next/link";
import { UnassignProductToStoreModal } from "./unassign-product-to-store-modal";
import { formatMoney } from "@/lib/money";

type StoreProductsTableItem = NonNullable<
  RouterOutputs["store"]["getStore"]
>["products"][number];

export const STORE_PRODUCTS_COLUMNS: ColumnDef<StoreProductsTableItem>[] = [
  {
    header: "Name",
    accessorKey: "name",
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
          {row?.original?.product?.price
            ? formatMoney(row?.original?.product?.price)
            : "-"}
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
    header: "Assigned at",
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
    header: "Modified at",
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
              <DropdownMenuSeparator />
              <UnassignProductToStoreModal
                storeId={row?.original?.storeId}
                productId={row?.original?.productId}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <PackageMinusIcon className="mr-2" size={16} />
                  Unnasign Product
                </DropdownMenuItem>
              </UnassignProductToStoreModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
