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
import { PRODUCT_STORES_COLUMNS } from "./product-stores-columns";
import { formatMoney } from "@/lib/money";
import { PRODUCT_ORDERS_COLUMNS } from "./product-orders-columns";
import { UpdateProductModal } from "../update-product-modal";
import { Button } from "@/app/components/ui/button";
import { PencilIcon } from "lucide-react";
import { FullscreenMessage } from "@/app/components/fullscreen-message";
import { Spinner } from "@/app/components/ui/spinner";

export default function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { data, isLoading } = api.product.getProduct.useQuery({
    id: params.id,
  });

  if (isLoading) {
    return (
      <FullscreenMessage custom>
        <Spinner size="xl" />
      </FullscreenMessage>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {data?.name}
            {data?.id ? (
              <UpdateProductModal id={data?.id}>
                <Button size="icon" variant="ghost">
                  <PencilIcon size={16} />
                </Button>
              </UpdateProductModal>
            ) : null}
          </CardTitle>
          <CardDescription>{data?.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <b>Price:</b> {data?.price ? formatMoney(data?.price) : "-"}
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
          <CardTitle>Product stores</CardTitle>
          <CardDescription>
            List of stores where this product is available
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            // bordered
            columns={PRODUCT_STORES_COLUMNS}
            data={data?.stores ?? []}
            // onPaginationChange={setPagination}
            // pageCount={Math.ceil((data?.total ?? 0) / pagination.pageSize)}
            // pagination={{
            //   pageIndex: pagination.pageIndex,
            //   pageSize: pagination.pageSize,
            // }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Product orders</CardTitle>
          <CardDescription>
            List of orders that contain this product
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            // bordered
            columns={PRODUCT_ORDERS_COLUMNS}
            data={data?.orderItem ?? []}
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
