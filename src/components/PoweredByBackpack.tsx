/* eslint-disable @next/next/no-img-element */

/**
 * "Powered by Backpack Securities" — the underlying tokenized shares are minted
 * and redeemed one to one via Backpack. Their mark, our type.
 */
export function PoweredByBackpack({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://backpack.exchange"
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 transition-colors duration-200 ${className}`}
    >
      <span className="text-[11px] text-mute transition-colors group-hover:text-ink">
        Powered by
      </span>
      <img src="/backpack.svg" alt="Backpack" className="h-[15px] w-auto" />
      <span className="text-[13px] font-medium text-ink">Backpack Securities</span>
    </a>
  );
}
