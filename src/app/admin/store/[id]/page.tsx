import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { DataTable } from "@/app/components/ui/data-table";
import { formatDateTime } from "@/lib/date";
import { api } from "@/trpc/server";
import { USER_STORES_COLUMNS } from "./user-stores-columns";

export default async function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const data = await api.user.getUser.query({
    id: params.id,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{data?.name}</CardTitle>
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
