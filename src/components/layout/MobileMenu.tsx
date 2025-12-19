"use client";
import { useState } from "react";
import WalletButton from "./WalletButton";
import WalletConnectModal from "./WalletConnectModal";
import Link from "next/link";
import Image from "next/image";

type MobileMenuItem = {
  label: string;
  href: string;
};

type MobileMainMenuProps = {
  open: boolean;
  onClose: () => void;
  // smallMenu: string[];
  smallMenu: MobileMenuItem[];
  ctaLabel: string;
};

export default function MobileMenu({
  open,
  onClose,
  smallMenu,
  ctaLabel,
}: MobileMainMenuProps) {
  if (!open) return null;

  const [isWalletModalOpen, setWalletModalOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-40 md:hidden ">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Centered card */}
      <div className="relative flex h-full items-center justify-center px-4">
        {/* Card: fixed width, bounded height, divided in 3 vertical sections */}
        <div
          className="
            w-full max-w-xs
            rounded-[28px] border-[3.5px] border-black bg-white
            shadow-[3px_3px_0px_#000000]
            overflow-hidden
            min-h-[450px] max-h-[80vh]
            flex flex-col
            py-6
            px-7
          "
          role="dialog"
          aria-modal="true"
        >
          {/* === TOP: CTA + avatar (sticky top within card) */}
          <div className="mx-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <WalletButton
                  label={ctaLabel}
                  onClick={() => setWalletModalOpen(true)}
                />
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3.5px] border-black bg-white ml-3">
                <span role="img" aria-label="avatar">
                  🧑‍🎨
                </span>
              </div>
            </div>
          </div>

          {/* === CENTER: menu list (centered vertically & horizontally) */}
          <div className="flex-1 flex items-center justify-center">
            {/* inner container limits width and can scroll if many items */}
            <div className="w-full  flex flex-col items-center justify-center gap-4 overflow-y-auto py-2">
              {smallMenu.length === 0 ? (
                <div className="text-sm text-gray-500">No menu</div>
              ) : (
                smallMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className="w-full max-w-[260px] rounded-xl border-[3px] border-black bg-white px-4 py-3 text-center text-sm font-semibold shadow-[3px_3px_0px_#000000]"
                  >
                    {item.label}
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* === BOTTOM: icons row (sticky bottom) */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center gap-4">
              <Link
                  href="https://discord.com/invite/rjwjQZSg5k"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border-[2.5px] border-black bg-white shadow-cartoonTwo
                            active:translate-x-1 active:translate-y-1 active:shadow-none"
                  aria-label="Discord"
                >
                  <Image
                    src="/icon/discord.svg"
                    alt="Discord"
                    width={18}
                    height={18}
                  />
                </Link>

              <Link
                href="https://x.com/parodeenft"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg border-[2.5px] border-black bg-white shadow-cartoonTwo
                          active:translate-x-1 active:translate-y-1 active:shadow-none"
                aria-label="Twitter"
                onClick={onClose}
              >
                <Image
                  src="/icon/twitter-x.svg"
                  alt="Twitter"
                  width={18}
                  height={18}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <WalletConnectModal
        open={isWalletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </div>
  );
}
