"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ClusterToggle } from "./ClusterToggle";
import { ThemeToggle } from "./ThemeToggle";
import { Menu } from "./icons";
import { explorerUrl, truncate } from "@/lib/solana/config";

const LINKS = [
  { href: "/refract", label: "Refract" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/assets", label: "Stocks" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const address = publicKey?.toBase58() ?? "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const rowLink =
    "block rounded-lg px-3 py-2.5 text-[13px] font-medium tracking-[0.01em] transition-colors duration-150";
  const menuItem =
    "block w-full rounded-md px-3 py-2 text-left text-[13px] tracking-[0.01em] transition-colors duration-150";

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-rule/70 bg-paper/80 backdrop-blur-xl"
          : "border-rule bg-paper/95 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-sans text-[15px] font-semibold tracking-tight text-ink"
        >
          Hanko
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                data-active={active}
                className={`nav-link text-[14px] font-medium tracking-[0.01em] transition-colors duration-300 ${
                  active ? "text-ink" : "text-mute hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="press relative flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink transition-colors duration-200 hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <Menu size={16} />
            {connected && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-paper bg-up" />
            )}
          </button>

          {open && (
            <div className="animate-modal absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-rule bg-paper p-2 shadow-lg shadow-ink/5">
              {/* Nav (mobile) */}
              <div className="md:hidden">
                {LINKS.map((link) => {
                  const active =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`${rowLink} ${
                        active ? "bg-haze text-ink" : "text-mute hover:bg-haze hover:text-ink"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="my-2 border-t border-rule" />
              </div>

              {/* Wallet */}
              {!connected ? (
                <button
                  type="button"
                  onClick={() => {
                    setVisible(true);
                    setOpen(false);
                  }}
                  disabled={connecting}
                  className="press w-full rounded-lg border border-ink bg-ink px-3 py-2.5 text-[13px] font-medium tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                >
                  {connecting ? "Connecting" : "Connect wallet"}
                </button>
              ) : (
                <div className="rounded-lg border border-rule p-1">
                  <div className="flex items-center gap-2 px-3 py-2 text-[11px] tabular-nums text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-up" />
                    {truncate(address)}
                  </div>
                  <button
                    type="button"
                    onClick={copy}
                    className={`${menuItem} text-mute hover:bg-haze hover:text-ink`}
                  >
                    {copied ? "Copied" : "Copy address"}
                  </button>
                  <a
                    href={explorerUrl("address", address)}
                    target="_blank"
                    rel="noreferrer"
                    className={`${menuItem} text-mute hover:bg-haze hover:text-ink`}
                  >
                    View on explorer
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      disconnect();
                      setOpen(false);
                    }}
                    className={`${menuItem} text-down hover:bg-haze`}
                  >
                    Disconnect
                  </button>
                </div>
              )}

              {/* Network */}
              <div className="mt-1.5 flex items-center justify-between rounded-lg px-3 py-1.5">
                <span className="text-[13px] tracking-[0.01em] text-mute">
                  Network
                </span>
                <ClusterToggle />
              </div>

              {/* Appearance */}
              <div className="mt-0.5 flex items-center justify-between rounded-lg px-3 py-1.5">
                <span className="text-[13px] tracking-[0.01em] text-mute">
                  Appearance
                </span>
                <ThemeToggle />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
