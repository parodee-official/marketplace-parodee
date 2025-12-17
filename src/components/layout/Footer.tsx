// src/components/layout/Footer.tsx
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-blue">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-3">
        {/* Garis tipis di tengah, tidak full-bleed ke edge window */}
        <div className="mb-5 h-[1px] w-full max-w-5xl bg-black" />

        {/* Teks copyright di tengah */}
        <p className="text-center text-[10px] font-black sm:text-xs md:text-md">
          © {year} Parodee. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
