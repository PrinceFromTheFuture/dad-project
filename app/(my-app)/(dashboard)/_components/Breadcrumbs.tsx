// Breadcrumbs.tsx
"use client";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((seg, i) => {
          if (i === 0) return;
          const viewSeg = seg.charAt(0).toUpperCase() + seg.slice(1);
          return (
            <BreadcrumbItem key={i}>
              {i === segments.length - 1 ? (
                <BreadcrumbPage>{viewSeg}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={`/${segments.slice(0, i + 1).join("/")}`}>{viewSeg}</Link>
                </BreadcrumbLink>
              )}
              {i < segments.length - 1 && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
