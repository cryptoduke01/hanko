import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy policy for Hanko.",
};

const SECTIONS: { t: string; body: React.ReactNode }[] = [
  {
    t: "What we collect",
    body: (
      <p>
        Nothing personal. Hanko has no accounts, no sign-up, no analytics, and no
        third-party trackers. We do not collect your name, email, or any personal
        information.
      </p>
    ),
  },
  {
    t: "Your browser",
    body: (
      <p>
        Small preferences are stored only in your browser (theme, a demo mint
        reference, and whether you have seen the welcome and cookie notices).
        They never leave your device and we cannot read them.
      </p>
    ),
  },
  {
    t: "Your wallet",
    body: (
      <p>
        When you connect a wallet, your public address is used only to read your
        on-chain balances and to submit transactions that you sign. Hanko never
        sees your private keys and does not store your address.
      </p>
    ),
  },
  {
    t: "On-chain data",
    body: (
      <p>
        Transactions you make are recorded on Solana, which is a public ledger.
        Anything on-chain is public by nature and outside anyone&apos;s control.
      </p>
    ),
  },
  {
    t: "Service providers",
    body: (
      <p>
        To read the chain and show prices, the app talks to a Solana RPC provider
        and a public price feed, which receive ordinary network request data
        (such as your IP) as any website does. Identity checks for real securities
        are handled by Backpack Securities under their own privacy policy, not by
        Hanko.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-8 sm:py-24">
      <header className="mb-12 animate-fade-up">
        <p className="text-[12px] font-medium tracking-[0.02em] text-mute">Legal</p>
        <h1 className="mt-3 font-sans text-4xl font-bold tracking-[-0.03em] text-ink sm:text-5xl">
          Privacy policy
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
      </div>
    </div>
  );
}
