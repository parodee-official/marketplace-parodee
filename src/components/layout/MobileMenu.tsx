"use client";
import { useState } from "react";
import WalletButton from "./WalletButton";
import WalletConnectModal from "./WalletConnectModal";

type MobileMainMenuProps = {
  open: boolean;
  onClose: () => void;
  smallMenu: string[];
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
    <div className="fixed inset-0 z-40 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Centered card */}
      <div className="relative flex h-full items-center justify-center px-6">
        <div className="w-full max-w-xs rounded-[32px] border-[3.5px] border-black bg-white p-5 shadow-cartoon">
          {/* Top: CTA + avatar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex-1">
              <WalletButton
                label={ctaLabel}
                onClick={() => setWalletModalOpen(true)}
              />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3.5px] border-black bg-white">
              <span role="img" aria-label="avatar">
                🧑‍🎨
              </span>
            </div>
          </div>

          {/* Menu list (Parodee / Merch dll) */}
          <div className="space-y-4">
            {smallMenu.map((label) => (
              <button
                key={label}
                type="button"
                className="w-full rounded-xl border-[3.5px] border-black bg-white px-4 py-3 text-center text-sm font-semibold"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Bottom icons */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border-[3.5px] border-black bg-white"
            >
              🎮
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-[3.5px] border-black bg-white"
            >
              ✕
            </button>
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
