"use client";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { NAVBAR_HEIGHT } from "@/lib/constants";
import Link from "next/link";
import { FRONTEND_ROUTES } from "@/lib/routes";
import { useSession } from "next-auth/react";

type MenuItem = {
  label: string;
  href: (typeof FRONTEND_ROUTES)[keyof typeof FRONTEND_ROUTES];
  children?: {
    label: string;
    href: (typeof FRONTEND_ROUTES)[keyof typeof FRONTEND_ROUTES];
    description: string;
  }[];
};

const MENU_ITEMS: MenuItem[] = [
  {
    label: "Home",
    href: FRONTEND_ROUTES.HOME,
  },
];

const CASHIER_MENU_ITEMS: MenuItem[] = [
  ...MENU_ITEMS,
  {
    label: "POS",
    href: FRONTEND_ROUTES.POS,
  },
];

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  ...CASHIER_MENU_ITEMS,
  {
    label: "Admin",
    href: FRONTEND_ROUTES.ADMIN,
    children: [
      {
        label: "General",
        href: FRONTEND_ROUTES.ADMIN,
        description: "General admin settings",
      },
      {
        label: "Manage Users",
        href: FRONTEND_ROUTES.ADMIN_USER,
        description: "Manage users, assign roles, create new users",
      },
      {
        label: "Manage Stores",
        href: FRONTEND_ROUTES.ADMIN_STORE,
        description: "Manage stores, assign users, points of sale and products",
      },
      {
        label: "Manage Products",
        href: FRONTEND_ROUTES.ADMIN_PRODUCT,
        description: "Manage products",
      },
      {
        label: "View Orders",
        href: FRONTEND_ROUTES.ADMIN_ORDER,
        description: "View and manage orders",
      },
      {
        label: "View Transactions",
        href: FRONTEND_ROUTES.ADMIN_TRANSACTION,
        description: "View and manage transactions",
      },
    ],
  },
];

export const Navbar = () => {
  const session = useSession();

  const menuItems =
    session?.data?.user?.role === "ADMIN"
      ? ADMIN_MENU_ITEMS
      : session?.data?.user?.role === "CASHIER"
        ? CASHIER_MENU_ITEMS
        : MENU_ITEMS;

  return (
    <NavigationMenu
      className={cn(
        "supports-backdrop-blur:bg-background/60 container z-50 justify-between bg-background/40 backdrop-blur",
        "mx-0 w-full !max-w-full border-b border-border px-6",
      )}
      style={{
        height: NAVBAR_HEIGHT,
        minHeight: NAVBAR_HEIGHT,
        maxHeight: NAVBAR_HEIGHT,
      }}
    >
      <NavigationMenuList className="mx-auto w-full !max-w-5xl lg:flex lg:flex-row">
        {menuItems?.map((item, index) =>
          item?.children && item?.children?.length > 0 ? (
            <NavigationMenuItem key={index}>
              <NavigationMenuTrigger>{item?.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                  {item?.children?.map((child) => (
                    <li key={child.href}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={child?.href}
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            {child?.label}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {child?.description}
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={index}>
              <Link href={item.href} legacyBehavior passHref scroll={false}>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle(), "bg-transparent")}
                >
                  {item.label}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
