"use client";

import { DotmSquare3 } from "@/components/ui/dotm-square-3";

/**
 * App loader. Dot-matrix loader from Dot Matrix (dotmatrix.zzzzshawn.cloud),
 * vendored as local code. Inherits text color so it stays monochrome.
 */
export function Loader({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex ${className}`} style={{ color: "currentColor" }}>
      <DotmSquare3
        size={size}
        dotSize={size <= 18 ? 2 : 3}
        color="currentColor"
        speed={1.4}
        ariaLabel="Loading"
      />
    </span>
  );
}
