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
import { STORE_USERS_COLUMNS } from "./store-users-columns";
import { AssignUserToStoreModal } from "./assign-user-to-store-modal";
import { Button } from "@/app/components/ui/button";
import {
  BookPlusIcon,
  PackagePlusIcon,
  PencilIcon,
  UserPlusIcon,
} from "lucide-react";
import { STORE_POS_COLUMNS } from "./store-pos-columns";
import { AssignPosToStoreModal } from "./assign-pos-to-store-modal";
import { AssignProductToStoreModal } from "./assign-product-to-store-modal";
import { STORE_PRODUCTS_COLUMNS } from "./store-products-columns";
import { UpdateStoreModal } from "../update-store-modal";

export default function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { data } = api.store.getStore.useQuery({
    id: params.id,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            {data?.name}

            <UpdateStoreModal id={data?.id}>
              <Button size="icon" variant="ghost">
                <PencilIcon size={16} />
              </Button>
            </UpdateStoreModal>
          </CardTitle>
          <CardDescription>{data?.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
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
          <CardTitle>
            Users
            {data?.id ? (
              <AssignUserToStoreModal storeId={data?.id}>
                <Button size="icon" variant="ghost">
                  <UserPlusIcon size={16} />
                </Button>
              </AssignUserToStoreModal>
            ) : null}
          </CardTitle>
          <CardDescription>
            List of users that have access to this store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            // bordered
            columns={STORE_USERS_COLUMNS}
            data={data?.users ?? []}
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
          <CardTitle>
            Points of Sale
            {data?.id ? (
              <AssignPosToStoreModal storeId={data?.id}>
                <Button size="icon" variant="ghost">
                  <BookPlusIcon size={16} />
                </Button>
              </AssignPosToStoreModal>
            ) : null}
          </CardTitle>
          <CardDescription>
            List of points of sale that are part of this store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            // bordered
            columns={STORE_POS_COLUMNS}
            data={data?.pos ?? []}
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
          <CardTitle>
            Products
            {data?.id ? (
              <AssignProductToStoreModal storeId={data?.id}>
                <Button size="icon" variant="ghost">
                  <PackagePlusIcon size={16} />
                </Button>
              </AssignProductToStoreModal>
            ) : null}
          </CardTitle>
          <CardDescription>
            List of products that are part of this store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            // bordered
            columns={STORE_PRODUCTS_COLUMNS}
            data={data?.products ?? []}
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
