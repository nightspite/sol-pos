"use client";

import { Button } from "@/app/components/ui/button";
import { EyeIcon, MoreHorizontalIcon } from "lucide-react";
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
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import Link from "next/link";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { formatMoney } from "@/lib/money";

export default function Page() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = api.order.getOrderList.useQuery({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <h1 className="text-3xl font-semibold">Orders</h1>
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

type TableItem = RouterOutputs["order"]["getOrderList"]["items"][0];

const COLUMS: ColumnDef<TableItem>[] = [
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => {
      return <span className="font-medium">{row?.original?.id ?? "-"}</span>;
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row?.original?.status ?? "-"}</span>
      );
    },
  },
  {
    header: "No. items",
    accessorKey: "items",
    cell: ({ row }) => {
      return (
        <span className="font-medium">
          {row?.original?.items?.length ?? "-"}
        </span>
      );
    },
  },
  {
    header: "Sum",
    accessorKey: "sum",
    cell: ({ row }) => {
      const sum = row?.original?.items?.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      return (
        <span className="font-medium">
          {(row?.original?.items || [])?.length > 0 ? formatMoney(sum) : "-"}
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
              <Link href={`${FRONTEND_ROUTES.ADMIN_ORDER}/${row.original?.id}`}>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <EyeIcon className="mr-2" size={16} />
                  View Order
                </DropdownMenuItem>
              </Link>
              <Link
                href={`${FRONTEND_ROUTES.ADMIN_STORE}/${row.original?.storeId}`}
              >
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  <EyeIcon className="mr-2" size={16} />
                  View Store
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
