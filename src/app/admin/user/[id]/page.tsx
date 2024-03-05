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
import { USER_STORES_COLUMNS } from "./user-stores-columns";
import { UpdateUserModal } from "../update-user-modal";
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
  const { data, isLoading } = api.user.getUser.useQuery({
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
              <UpdateUserModal id={data?.id}>
                <Button size="icon" variant="ghost">
                  <PencilIcon size={16} />
                </Button>
              </UpdateUserModal>
            ) : null}
          </CardTitle>
          <CardDescription>{data?.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <b>Username:</b> {data?.username}
          </div>
          <div>
            <b>Role:</b> {data?.role}
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
          <CardTitle>User stores</CardTitle>
          <CardDescription>
            List of stores that the user has access to.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            // bordered
            columns={USER_STORES_COLUMNS}
            data={(data?.stores ?? [])?.map((store) => store?.store)}
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
