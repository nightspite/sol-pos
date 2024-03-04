"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { DataTable } from "@/app/components/ui/data-table";
import { formatDateTime } from "@/lib/date";
import { api } from "@/trpc/react";
import { formatMoney } from "@/lib/money";
import { ORDER_PRODUCTS_COLUMNS } from "./order-products-columns";
import { FRONTEND_ROUTES } from "@/lib/routes";
import Link from "next/link";

export default function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { data } = api.order.getOrder.useQuery({
    id: params.id,
  });

  const sum = (data?.items ?? [])?.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{data?.id}</CardTitle>
          <CardDescription>{formatMoney(sum)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <b>Status:</b> {data?.status ?? "-"}
          </div>
          <div>
            <b>Pos:</b> {data?.pos?.name} ({data?.posId ?? "-"})
          </div>
          <div>
            <b>Store: </b>
            <Link href={FRONTEND_ROUTES.ADMIN_STORE + "/" + data?.storeId}>
              {data?.store?.name} ({data?.storeId ?? "-"})
            </Link>
          </div>
          <div>
            <b>Created at:</b>{" "}
            {data?.createdAt ? formatDateTime(data?.createdAt) : "-"}
          </div>
          <div>
            <b>Updated at:</b>{" "}
            {data?.updatedAt ? formatDateTime(data?.updatedAt) : "-"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order products</CardTitle>
          <CardDescription>
            List of products that are in this order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            // bordered
            columns={ORDER_PRODUCTS_COLUMNS}
            data={data?.items ?? []}
            // onPaginationChange={setPagination}
            // pageCount={Math.ceil((data?.total ?? 0) / pagination.pageSize)}
            // pagination={{
            //   pageIndex: pagination.pageIndex,
            //   pageSize: pagination.pageSize,
            // }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
