"use client";

import { useState } from "react";

/** Underlying company logo, fetched from a public logo CDN by ticker symbol. */
export function StockLogo({
  symbol,
  size = 20,
  className = "",
}: {
  symbol: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
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
      src={`https://assets.parqet.com/logos/symbol/${symbol}?format=png&size=64`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`inline-block shrink-0 rounded-[22%] object-contain ring-1 ring-inset ring-rule/60 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
