"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { api } from "@/trpc/react";
import { useMemo, useState } from "react";
import { FRONTEND_ROUTES } from "@/lib/routes";

export default function Page() {
  const { data } = api.user.getMe.useQuery();

  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const selectedStorePosList = useMemo(() => {
    return data?.stores?.find((store) => store.storeId === selectedStore)?.store
      ?.pos;
  }, [data, selectedStore]);

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden">
      <div className="relative mx-auto mt-8 w-full max-w-5xl overflow-hidden">
        <div className="mb-4 flex items-center gap-4">
          <h1 className="text-3xl font-semibold">
            {!selectedStore ? "Select a store" : "Select a Point of Sale"}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {!selectedStore ? (
            <>
              {data?.stores?.map((store) => (
                <Card key={store.storeId}>
                  <CardHeader>
                    <CardTitle>{store?.store?.name}</CardTitle>
                    <CardDescription>{}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="default"
                      onClick={() => setSelectedStore(store.storeId)}
                    >
                      Select Store
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {selectedStorePosList?.map((pos) => (
                <Card key={pos.id}>
                  <CardHeader>
                    <CardTitle>{pos?.name}</CardTitle>
                    <CardDescription>{}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href={FRONTEND_ROUTES.POS + "/" + pos?.id}>
                      <Button variant="default">Select PoS</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
