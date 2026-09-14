import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Hanko.",
};

const SECTIONS: { t: string; body: React.ReactNode }[] = [
  {
    t: "What Hanko is",
    body: (
      <p>
        Hanko is a non-custodial protocol and interface that locks a tokenized
        share and issues three tranche tokens (Shield, Core, Edge) against it. It
        is software, not a broker, dealer, exchange, or investment adviser, and
        nothing here is financial, investment, legal, or tax advice.
      </p>
    ),
  },
  {
    t: "Demo",
    body: (
      <p>
        The demo runs on Solana devnet with test tokens that have no monetary
        value. Anything you mint or trade there is for demonstration only.
      </p>
    ),
  },
  {
    t: "Real securities and Backpack Securities",
    body: (
      <p>
        Where the underlying is a real tokenized security, it is issued and
        redeemed by{" "}
        <a
          href="https://backpack.exchange"
          target="_blank"
          rel="noreferrer"
          className="text-ink underline decoration-rule underline-offset-2 hover:opacity-70"
        >
          Backpack Securities
        </a>{" "}
        and is subject to their Brokerage Services Terms. Those securities are not
        offered in every jurisdiction (including the United States, United
        Kingdom, United Arab Emirates, Japan, and the EU) and are not available to
        US persons. You are responsible for ensuring your use complies with the
        laws of your jurisdiction, and access may be geographically restricted.
      </p>
    ),
  },
  {
    t: "Your wallet and on-chain risk",
    body: (
      <p>
        You control your wallet and keys; you alone authorize every transaction.
        On-chain transactions are public and irreversible. This is experimental
        software provided as is, without warranties, and you use it at your own
        risk, including the risk of total loss.
      </p>
    ),
  },
  {
    t: "Changes",
    body: (
      <p>
        These terms may change as the protocol develops. Continued use after a
        change means you accept the updated terms.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-24">
      <header className="mb-12 animate-fade-up">
        <p className="text-[12px] font-medium tracking-[0.02em] text-mute">Legal</p>
        <h1 className="mt-3 font-sans text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          Terms of use
        </h1>
        <p className="mt-4 text-sm text-mute">Last updated 14 September 2026.</p>
      </header>
      <div className="space-y-10 text-sm leading-relaxed text-mute">
        {SECTIONS.map((s) => (
          <section key={s.t}>
            <h2 className="font-sans text-lg font-bold tracking-[-0.02em] text-ink">
              {s.t}
            </h2>
            <div className="mt-2">{s.body}</div>
          </section>
        ))}
        <p className="text-xs">Not financial advice.</p>
      </div>
    </div>
  );
}
