"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ListIcon,
  BridgeIcon,
  HouseIcon,
  WalletIcon,
} from "@phosphor-icons/react";

export default function NavMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const routes = [
    { name: "Dashboard", path: "/", icon: HouseIcon },
    { name: "Profile", path: "/profile", icon: WalletIcon },
    { name: "Bridge", path: "/bridge", icon: BridgeIcon },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="icon" size="icon" className="h-8 w-8">
          <ListIcon className="h-5 w-5" />
          <span className="sr-only">Navigation Menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border">
        {routes.map((route) => {
          const isActive = pathname === route.path;
          return (
            <DropdownMenuItem
              key={route.path}
              asChild
              className={`${
                isActive ? "bg-primary text-white" : "text-white"
              } hover:bg-primary/20 hover:text-primary cursor-pointer group`}
              onClick={() => setOpen(false)}
            >
              <Link
                href={route.path}
                className="flex items-center gap-2 w-full"
              >
                <route.icon
                  className={`${
                    isActive ? "text-white" : "text-primary"
                  } group-hover:text-primary`}
                  size={20}
                />
                {route.name}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
