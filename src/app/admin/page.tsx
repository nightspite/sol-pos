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
import { ArrowRightIcon } from "lucide-react";
import { ADMIN_MENU_ITEMS } from "../components/navbar";

const MENU_ITEMS =
  ADMIN_MENU_ITEMS?.find((item) => item.label === "Admin")?.children?.filter(
    (item) => item.label !== "General",
  ) ?? [];

export default function Page() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {MENU_ITEMS.map((item) => (
        <Card key={item.href}>
          <CardHeader>
            <CardTitle>{item?.label}</CardTitle>
            <CardDescription>{item?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href={item?.href}>
              <Button variant="default">
                View <ArrowRightIcon size={16} className="ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
