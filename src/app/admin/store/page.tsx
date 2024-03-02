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
import Link from "next/link";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { DeleteStoreModal } from "./delete-store-modal";
import { CreateStoreModal } from "./create-store-modal";
import { UpdateStoreModal } from "./update-store-modal";

export default function Page() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = api.store.getStoreList.useQuery({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-3xl font-semibold">Stores</h1>
        <div className="ml-auto">
          <CreateStoreModal>
            <Button>
              <PlusIcon className="mr-2" size={16} />
              Create Store
            </Button>
          </CreateStoreModal>
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

type TableItem = RouterOutputs["store"]["getStoreList"]["items"][0];

const COLUMS: ColumnDef<TableItem>[] = [
  {
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      return <span className="font-medium">{row?.original?.name ?? "-"}</span>;
    },
  },
  {
    header: "Number of users",
    accessorKey: "users",
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row.original?.users?.length ?? 0}</span>
      );
    },
  },
  {
    header: "Number of PoS",
    accessorKey: "pos",
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row.original?.pos?.length ?? 0}</span>
      );
    },
  },
  {
    header: "Number of products",
    accessorKey: "products",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {row.original?.products?.length ?? 0}
        </span>
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
              <Link href={`${FRONTEND_ROUTES.ADMIN_STORE}/${row.original?.id}`}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <EyeIcon className="mr-2" size={16} />
                  View Store
                </DropdownMenuItem>
              </Link>

              <UpdateStoreModal id={row.original?.id}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <PencilIcon className="mr-2" size={16} />
                  Update Store
                </DropdownMenuItem>
              </UpdateStoreModal>
              <DropdownMenuSeparator />

              <DeleteStoreModal id={row.original?.id}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <TrashIcon className="mr-2" size={16} />
                  Delete Store
                </DropdownMenuItem>
              </DeleteStoreModal>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
