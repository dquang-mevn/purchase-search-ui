"use client";

import React from "react";
import { Grid2x2PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingHeader() {
  const pathname = usePathname();
  const links = [
    {
      label: "Main Search",
      href: "/",
    },
    {
      label: "Prompt Assist",
      href: "/ai-studio",
    },
    {
      label: "Fulltext Search",
      href: "/fulltext",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Analyzer",
      href: "/analyzer"
    }
  ];

  return (
    <header
      className={cn(
        "sticky top-3 z-50",
        "mx-auto w-full max-w-3xl rounded-lg border shadow",
        "bg-background/95 `supports-backdrop-filter:bg-background/80 backdrop-blur-lg",
      )}
    >
      <nav className="mx-auto flex items-center justify-between p-1.5">
        <Link href={"/"}>
          <div className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 duration-100">
            <Grid2x2PlusIcon className="size-5" />
            <p className="font-mono text-base font-bold">CHAMELEON</p>
          </div>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                className={cn(
                  buttonVariants({
                    variant: isActive ? "default" : "ghost",
                    size: "sm",
                  }),
                  isActive && "text-white",
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
