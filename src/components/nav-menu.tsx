"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
 
const components: { title: string; href: string; description: string }[] = [
  {
    title: "Dashboard",
    href: "/",
    description:
      "Chat with AI to find the best LP for your BTC.",
  },
  {
    title: "Profile",
    href: "/profile",
    description:
      "Check wallet balance and LP positions.",
  },
  {
    title: "Bridge",
    href: "/bridge",
    description:
      "Convert BTC to lBTC via bridge.",
  },
]


export default function NavMenu() {
  const [position, setPosition] = useState<string>('[&_div.absolute]:right-auto [&_div.absolute]:left-0');
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const checkPosition = () => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const menuWidth = 280; // Width of your menu content
      const spaceOnRight = window.innerWidth - menuRect.left;

      if (spaceOnRight < menuWidth) {
        setPosition('[&_div.absolute]:left-auto [&_div.absolute]:right-0');
      } else {
        setPosition('[&_div.absolute]:right-auto [&_div.absolute]:left-0');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkPosition();
      window.addEventListener('resize', checkPosition);
    }
    return () => window.removeEventListener('resize', checkPosition);
  }, [isOpen]);

  return (
    <NavigationMenu ref={menuRef} className={position} onValueChange={(value) => setIsOpen(!!value)}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="lg:w-[280px] w-[230px] gap-3 p-2 flex flex-col">
              {components.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-secondary hover:text-white focus:bg-secondary focus:text-white",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-white">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"