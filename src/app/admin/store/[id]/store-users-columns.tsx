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
import { EyeIcon, MoreHorizontalIcon, UserMinus } from "lucide-react";
import Link from "next/link";
import { UnassignUserToStoreModal } from "./unassign-user-to-store-modal";

type StoreUsersTableItem = NonNullable<
  RouterOutputs["store"]["getStore"]
>["users"][number];

export const STORE_USERS_COLUMNS: ColumnDef<StoreUsersTableItem>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row?.original?.user?.name ?? "-"}</span>
      );
    },
  },
  {
    header: "Username",
    accessorKey: "username",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {row?.original?.user?.username ?? "-"}
        </span>
      );
    },
  },
  {
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row?.original?.user?.role ?? "-"}</span>
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
                href={`${FRONTEND_ROUTES.ADMIN_USER}/${row.original?.userId}`}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <EyeIcon className="mr-2" size={16} />
                  View User
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <UnassignUserToStoreModal
                storeId={row?.original?.storeId}
                userId={row?.original?.userId}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <UserMinus className="mr-2" size={16} />
                  Unnasign User
                </DropdownMenuItem>
              </UnassignUserToStoreModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
