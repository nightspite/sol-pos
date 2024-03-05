"use client";

import { Button } from "@/app/components/ui/button";
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useState } from "react";
import { DataTable } from "@/app/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { type RouterOutputs } from "@/trpc/shared";
import { formatDateTime } from "@/lib/date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { DeleteUserModal } from "./delete-user-modal";
import Link from "next/link";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { CreateUserModal } from "./create-user-modal";
import { UpdateUserModal } from "./update-user-modal";
import { FullscreenMessage } from "@/app/components/fullscreen-message";
import { Spinner } from "@/app/components/ui/spinner";

export default function Page() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = api.user.getUserList.useQuery({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  if (isLoading) {
    return (
      <FullscreenMessage custom>
        <Spinner size="xl" />
      </FullscreenMessage>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-3xl font-semibold">Users</h1>
        <div className="ml-auto">
          <CreateUserModal>
            <Button>
              <PlusIcon className="mr-2" size={16} />
              Create User
            </Button>
          </CreateUserModal>
        </div>
      </div>

      <DataTable
        bordered
        columns={COLUMS}
        data={data?.items ?? []}
        isLoading={isLoading}
        onPaginationChange={setPagination}
        pageCount={Math.ceil((data?.total ?? 0) / pagination.pageSize)}
        pagination={{
          pageIndex: pagination.pageIndex,
          pageSize: pagination.pageSize,
        }}
      />
    </div>
  );
}

type TableItem = RouterOutputs["user"]["getUserList"]["items"][0];

const COLUMS: ColumnDef<TableItem>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      return <span className="font-medium">{row?.original?.name ?? "-"}</span>;
    },
  },
  {
    header: "Username",
    accessorKey: "username",
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row?.original?.username ?? "-"}</span>
      );
    },
  },
  {
    header: "No. stores",
    accessorKey: "stores",
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row.original?.stores?.length ?? 0}</span>
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
              <Link href={`${FRONTEND_ROUTES.ADMIN_USER}/${row.original?.id}`}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <EyeIcon className="mr-2" size={16} />
                  View User
                </DropdownMenuItem>
              </Link>

              <UpdateUserModal id={row.original?.id}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <PencilIcon className="mr-2" size={16} />
                  Update User
                </DropdownMenuItem>
              </UpdateUserModal>
              <DropdownMenuSeparator />

              <DeleteUserModal id={row.original?.id}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <TrashIcon className="mr-2" size={16} />
                  Delete User
                </DropdownMenuItem>
              </DeleteUserModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
