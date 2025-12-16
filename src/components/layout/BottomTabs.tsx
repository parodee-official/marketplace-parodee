// src/components/layout/BottomTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/collect", label: "Collect" },
  { href: "/merch", label: "Merch" },
];

export default function BottomTabs() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 md:hidden">
      <div className="mx-auto max-w-[60%] px-4">
        {/* Outer pill */}
        <div className="flex overflow-hidden rounded-full border-2 border-black bg-white">
          {tabs.map((tab, index) => {
            const isActive = pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={[
                  "flex-1 px-6 py-3 text-center text-sm font-black leading-none",
                  index === 0 ? "border-r-2 border-black" : "",
                  isActive
                    ? "bg-white text-black"
                    : "bg-white text-black/70",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
