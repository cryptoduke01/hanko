/** The Hanko seal (inkan): white 判 on a vermilion ground with a carved frame.
 *  The seal is always vermilion in both themes. It is the brand's one warm mark. */
export function HankoMark({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Hanko"
    >
      <rect x="8" y="8" width="184" height="184" rx="42" fill="#c8402f" />
      <rect
        x="22"
        y="22"
        width="156"
        height="156"
        rx="30"
        fill="none"
        stroke="#fbf5f0"
        strokeOpacity="0.9"
        strokeWidth="4"
      />
      <text
        x="100"
        y="106"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'Hiragino Mincho ProN','Yu Mincho','Noto Serif JP',serif"
        fontWeight="600"
        fontSize="118"
        fill="#fbf5f0"
      >
        判
      </text>
    </svg>
  );
}
