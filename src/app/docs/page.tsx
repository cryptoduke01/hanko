import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { CutCard } from "@/components/CutCard";
import { SplitExplainer } from "@/components/SplitExplainer";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Hanko splits a tokenized share into Shield, Core and Edge, three fully backed tokens that recombine into one share.",
};

const SECTIONS = [
  {
    n: "01",
    t: "What Hanko is",
    body: (
      <p className="mt-3 text-mute">
        Hanko splits a tokenized stock into three tokens you can hold on their
        own: Shield, the safe part, Core, the middle, and Edge, the upside. Hold
        one, or hold all three. Put all three back together and you get your
        share.
      </p>
    ),
  },
  {
    n: "02",
    t: "How it works",
    body: (
      <p className="mt-3 text-mute">
        You lock one tokenized share in a vault. The vault mints three tokens
        against it, each a claim on part of the share&apos;s value at a set date.
        The three claims always add up to exactly the share, never more. Fully
        backed, no leverage. On the settlement date the vault reads the price and
        pays each token its part. Hold all three and you can recombine them into
        the share anytime.
      </p>
    ),
  },
  {
    n: "03",
    t: "The three tokens",
    body: (
      <>
        <p className="mt-3 text-mute">
          With a floor L and a cap U, at a settlement price S:
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            {
              name: "Shield",
              varName: "--shield",
              pay: "min(S, L)",
              desc: "The first, safest part. Impaired only if the stock falls below the floor.",
            },
            {
              name: "Core",
              varName: "--core",
              pay: "clamp(S−L, 0, U−L)",
              desc: "Plain exposure through the middle band.",
            },
            {
              name: "Edge",
              varName: "--edge",
              pay: "max(S−U, 0)",
              desc: "The upside, and it can never be liquidated.",
            },
          ].map((t) => (
            <CutCard
              key={t.name}
              padding="p-4"
              tint={`var(--glow-${t.name.toLowerCase()})`}
            >
              <div
                className="text-sm font-semibold"
                style={{ color: `var(${t.varName})` }}
              >
                {t.name}
              </div>
              <div className="mt-1 text-xs tabular-nums text-ink">{t.pay}</div>
              <p className="mt-2 text-xs leading-relaxed text-mute">{t.desc}</p>
            </CutCard>
          ))}
        </div>
        <p className="mt-4 tabular-nums text-ink">Shield + Core + Edge = S.</p>
      </>
    ),
  },
  {
    n: "04",
    t: "Why it is possible",
    body: (
      <p className="mt-3 text-mute">
        A tokenized share is a programmable token, so a contract can lock it and
        issue claim tokens whose payoffs are set in code and settled against a
        price feed. It is the same technique a bond desk uses to strip a bond
        into principal and coupons, and Pendle uses to split yield, applied to
        equity.
      </p>
    ),
  },
  {
    n: "05",
    t: "Real securities",
    body: (
      <p className="mt-3 text-mute">
        The underlying can be a real, custody-backed tokenized security. Backpack
        Securities has opened a public mint and redeem API, so a real US share
        can be issued on Solana and redeemed back one to one. Hanko refracts that
        security into its three parts; recombine the parts into a whole share and
        redeem it for the real stock. The demo uses test shares in place of this.
      </p>
    ),
  },
  {
    n: "06",
    t: "What Hanko is not",
    body: (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-mute">
        <li>Not leverage. Every token is fully backed by a real share.</li>
        <li>Not rehypothecation. The share stays locked until you recombine or settle.</li>
        <li>Not financial advice.</li>
      </ul>
    ),
  },
  {
    n: "07",
    t: "Roadmap",
    body: (
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-mute">
        <li>Real underlyings and redemption via Backpack Securities</li>
        <li>Tranche markets so each token trades with depth</li>
        <li>Pyth price feeds for settlement</li>
      </ul>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-16 sm:px-8 sm:py-24">
      <header className="mb-16 max-w-3xl animate-fade-up">
        <p className="text-[12px] font-medium tracking-[0.02em] text-mute">
          How it works
        </p>
        <h1 className="mt-3 font-sans text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          One share, split three ways.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-mute sm:text-lg">
          The whole idea, the payoff math, and why it holds together — in plain
          terms.
        </p>
      </header>

      {/* The simple version — an interactive one-minute explainer */}
      <section className="mb-16">
        <h2 className="font-sans text-2xl font-bold tracking-[-0.02em] text-ink">
          The simple version
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">
          A share is really three things in one: a <span className="text-ink">safe part</span>,
          a <span className="text-ink">middle part</span>, and a{" "}
          <span className="text-ink">jackpot part</span>. Normally you have to buy
          all three together. Hanko splits them so you can keep just the one you
          want — and they always snap back into a whole share. Drag the price and
          watch it happen:
        </p>
        <div className="mt-6">
          <SplitExplainer />
        </div>
      </section>

      <div className="space-y-14 text-base leading-relaxed">
        {SECTIONS.map((s) => (
          <section
            key={s.n}
            className="grid gap-3 border-t border-rule pt-8 sm:grid-cols-[64px_1fr] sm:gap-8"
          >
            <div className="text-sm tabular-nums text-mute sm:pt-1">{s.n}</div>
            <div>
              <h2 className="font-sans text-xl font-bold tracking-[-0.02em] text-ink">
                {s.t}
              </h2>
              {s.body}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16">
        <Link
          href="/refract"
          className="press btn-liquid inline-flex items-center gap-2 rounded-full border border-ink bg-ink px-6 py-3 text-[14px] font-medium tracking-[0.01em] text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Refract a share
          <ArrowRight size={15} />
        </Link>
      </div>

      <p className="mt-8 text-xs text-mute">Not financial advice.</p>
    </div>
  );
}
