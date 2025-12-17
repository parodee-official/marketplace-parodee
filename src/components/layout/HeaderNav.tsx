// src/components/layout/HeaderNav.tsx
"use client";

import { useState } from "react";
import WalletConnectModal from "./WalletConnectModal";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation"; // 1. Tambah useSearchParams
import WalletButton from "./WalletButton";
import BottomTabs from "./BottomTabs";
import MobileMainMenu from "./MobileMenu";
import Image from "next/image";

export default function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams(); // 2. Hook untuk baca URL (?slug=...)

  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCollect = pathname.startsWith("/collect");
  const isMerch = pathname.startsWith("/merch");

  // 3. Ambil slug aktif dari URL, jika kosong default ke pixel-chaos
  const activeSlug = searchParams.get("slug") || "parodee-pixel-chaos";

  const tabs = [
    { href: "/collect", label: "Collect" },
    { href: "/merch", label: "Merch" },
  ];


  // 4. KONFIGURASI MENU COLLECT (Label + Slug)
  const collectMenuOptions = [
    { label: "Pixel Chaos", slug: "parodee-pixel-chaos" },
    { label: "HyperEVM", slug: "parodee-hyperevm" },
  ];

  const merchMenuOptions = ["Merchandise", "Apparel", "Good", "Collectable"];

  const mobileMenuItems = isCollect
  ? collectMenuOptions.map(option => ({
      label: option.label,
      href: `/collect?slug=${option.slug}`,
    }))
  : merchMenuOptions.map(label => ({
      label,
      href: `/merch?category=${label.toLowerCase()}`,
    }));


  const ctaLabel = isCollect ? "CONNECT WALLET" : "LOGIN/SIGN UP";

  return (
    <header className="sticky top-0 z-30 bg-brand-blue">
      <div className="relative mx-auto max-w-6xl px-6 pt-7 pb-3 md:pb-6">
        {/* TAB BESAR (DESKTOP) */}
        <div className="pointer-events-auto absolute left-1/2 -top-2.5 hidden -translate-x-1/2 md:block">
          <div className="inline-flex">
            {tabs.map((tab, index) => {
              const active = pathname.startsWith(tab.href);
              const isFirst = index === 0;
              const isLast = index === tabs.length - 1;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    "flex items-center justify-center min-w-[130px] px-6 text-lg font-black leading-none border-[3px] border-black bg-white transition-all duration-150",
                    !active && isFirst && "rounded-bl-[23px]",
                    !active && isLast && "rounded-br-[23px] -ml-[2px]",
                    active && isFirst && "rounded-bl-[32px]",
                    active && isLast && "rounded-br-[32px] -ml-[2px]",
                    active && !isFirst && !isLast && "rounded-[20px]",
                    active ? "h-[38px] font-black" : "h-[56px] font-black",
                  ].filter(Boolean).join(" ")}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ROW: Logo | (menu kecil desktop) | CTA */}
        <div className="mt-3 md:mt-5 lg:mt-8 flex items-center justify-between gap-4">

          <Link href="/" className="flex flex-none items-center gap-3">
            <Image
              src="/icon/logo.svg"
              alt="P Icon"
              width={32}
              height={32}
              className="object-contain select-none"
            />
            <span className="text-xl md:text-2xl font-extrabold text-white">
              Marketplace
            </span>
          </Link>

          {/* Menu kecil – DESKTOP */}
          <nav className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center gap-10 text-md md:text-xl">

              {/* LOGIC RENDERING MENU: */}
              {isCollect ? (
                // A. JIKA HALAMAN COLLECT (Pakai Link dengan Slug)
                collectMenuOptions.map((option) => {
                  const isActive = activeSlug === option.slug;
                  return (
                    <Link
                      key={option.slug}
                      // Saat diklik, URL berubah jadi /collect?slug=parodee-hyperevm
                      href={`/collect?slug=${option.slug}`}
                      className={[
                        "cursor-pointer whitespace-nowrap transition-colors",
                        isActive
                          ? "font-bold text-white decoration-2 underline-offset-4"
                          : "font-semibold text-white/80 hover:text-white text-sm",
                      ].join(" ")}
                    >
                      Parodee : {option.label}
                    </Link>
                  );
                })
              ) : (
                // B. JIKA HALAMAN MERCH (Menu Biasa)
                merchMenuOptions.map((label, index) => {
                  const isActiveSmall = index === 0; // Sementara dummy logic
                  return (
                    <button
                      key={label}
                      type="button"
                      className={[
                        "cursor-pointer whitespace-nowrap transition-colors",
                        isActiveSmall
                          ? "font-semibold text-white"
                          : "font-normal text-white/80 hover:text-white text-sm",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })
              )}

            </div>
          </nav>

          {/* Kanan: Desktop → CTA + avatar, Mobile → Hamburger */}
          <div className="flex flex-none items-center gap-3">
            {/* Desktop CTA + avatar */}
            <div className="hidden items-center gap-3 md:flex">
              <div className="min-w-[170px]">
                <WalletButton
                  label={ctaLabel}
                  onClick={() => setWalletModalOpen(true)}
                />
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-black bg-white">
                <span role="img" aria-label="avatar">
                  🧑‍🎨
                </span>
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-[3px] border-black bg-white shadow-cartoonTwo md:hidden active:translate-x-1 active:translate-y-1 active:shadow-none"
              aria-label="Open menu"
            >
              <div className="flex flex-col gap-[3px]">
                <span className="block h-[2px] w-4 bg-black" />
                <span className="block h-[2px] w-4 bg-black" />
                <span className="block h-[2px] w-4 bg-black" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <MobileMainMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        // smallMenu={isCollect ? collectMenuOptions.map(o => o.label) : merchMenuOptions}
        smallMenu={mobileMenuItems}
        ctaLabel={ctaLabel}
      />

        <BottomTabs />
          <WalletConnectModal
          open={isWalletModalOpen}
          onClose={() => setWalletModalOpen(false)}
        />
    </header>
  );
}
