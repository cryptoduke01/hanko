/** Brand logos of the live-data providers Hanko integrates. */
const SOURCES = [
  { name: "Pyth", src: "/integrations/pyth.png", url: "https://pyth.network" },
  { name: "Tokens.xyz", src: "/integrations/tokens.png", url: "https://tokens.xyz" },
  {
    name: "PreStocks",
    src: "/integrations/prestocks.png",
    url: "https://prestocks.com",
  },
];

export function DataIntegrations({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}>
      <span className="text-[11px] tracking-[0.02em] text-mute">Live data from</span>
      {SOURCES.map((s) => (
        <a
          key={s.name}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-mute transition-colors duration-200 hover:text-ink"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.src}
            alt=""
            width={16}
            height={16}
            className="rounded-[22%] bg-white object-contain ring-1 ring-inset ring-rule/60"
            style={{ width: 16, height: 16 }}
          />
          {s.name}
        </a>
      ))}
    </div>
  );
}
