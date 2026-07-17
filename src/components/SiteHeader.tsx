"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/assets", label: "Assets" },
  { href: "/method", label: "Method" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/market")
      .then((r) => {
        if (!cancelled) setLive(r.ok);
      })
      .catch(() => {
        if (!cancelled) setLive(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background,border-color,backdrop-filter] duration-300 ${
        scrolled
          ? "border-rule/80 bg-paper/80 backdrop-blur-xl"
          : "border-rule bg-paper/95 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link
            href="/"
            className="group shrink-0 font-sans text-sm font-semibold tracking-tight text-ink"
          >
            HANKO
            <span className="ml-1.5 font-normal text-mute transition-opacity duration-300 group-hover:opacity-70">
              判子
            </span>
          </Link>
          <span className="hidden items-center gap-1.5 border border-rule px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-mute sm:inline-flex">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                live ? "live-dot bg-up" : "bg-mute/50"
              }`}
              aria-hidden
            />
            {live ? "Live market" : "Market"}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <nav className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-active={active}
                  className={`nav-link text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-300 ${
                    active ? "text-ink" : "text-mute hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <ThemeToggle />

          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center border border-rule text-ink md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 top-0 block h-px w-full bg-ink transition-transform duration-300 ${
                  open ? "translate-y-[5.5px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[5.5px] block h-px w-full bg-ink transition-opacity duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[11px] block h-px w-full bg-ink transition-transform duration-300 ${
                  open ? "-translate-y-[5.5px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-rule transition-[max-height,opacity] duration-400 ease-out md:hidden ${
          open ? "max-h-56 opacity-100" : "max-h-0 opacity-0 border-t-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 py-2.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-200 ${
                  active ? "bg-haze text-ink" : "text-mute hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="mt-1 flex items-center gap-1.5 px-2 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                live ? "live-dot bg-up" : "bg-mute/50"
              }`}
            />
            {live ? "Live market feed" : "Market offline"}
          </div>
        </nav>
      </div>
    </header>
  );
}
