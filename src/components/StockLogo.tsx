"use client";

import { useState } from "react";

/**
 * Company / asset logo. Tries the best source available and falls back down the
 * chain, ending at the ticker's first letter:
 *   1. an explicit `src` (e.g. the PreStocks token image, or Tokens.xyz imageUrl)
 *   2. the Tokens.xyz xStock logo, by symbol
 *   3. the parqet public logo CDN
 *   4. the first letter
 */
export function StockLogo({
  symbol,
  size = 20,
  className = "",
  src,
}: {
  symbol: string;
  size?: number;
  className?: string;
  src?: string;
}) {
  const candidates = [
    src,
    `https://api.tokens.xyz/logos/xstocks/${symbol.toUpperCase()}x.png`,
    `https://assets.parqet.com/logos/symbol/${symbol}?format=png&size=64`,
  ].filter((u): u is string => Boolean(u));
  const [i, setI] = useState(0);

  if (i >= candidates.length) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-[22%] border border-rule font-sans text-[10px] font-semibold text-mute ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {symbol.charAt(0)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[i]}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setI((n) => n + 1)}
      className={`inline-block shrink-0 rounded-[22%] bg-white object-contain ring-1 ring-inset ring-rule/60 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
