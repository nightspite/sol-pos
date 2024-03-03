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
import { type RouterOutputs } from "@/trpc/shared";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontalIcon, UserMinus } from "lucide-react";
import { UnassignPosToStoreModal } from "./unassign-pos-to-store-modal";

type StorePosTableItem = NonNullable<
  RouterOutputs["store"]["getStore"]
>["pos"][number];

export const STORE_POS_COLUMNS: ColumnDef<StorePosTableItem>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      return <span className="font-medium">{row?.original?.name ?? "-"}</span>;
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
              {/* <Link href={`${FRONTEND_ROUTES.ADMIN_POS}/${row.original?.id}`}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <EyeIcon className="mr-2" size={16} />
                  View PoS
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator /> */}
              <UnassignPosToStoreModal
                storeId={row?.original?.storeId}
                posId={row?.original?.id}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <UserMinus className="mr-2" size={16} />
                  Unnasign PoS
                </DropdownMenuItem>
              </UnassignPosToStoreModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
