import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-20 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
        404
      </p>
      <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-ink">
        No claim record
      </h1>
      <p className="mt-3 text-sm text-mute">
        That asset is not in the seed index yet.
      </p>
      <Link
        href="/assets"
        className="mt-8 font-mono text-xs uppercase tracking-[0.12em] text-ink underline decoration-rule underline-offset-4"
      >
        Back to index
      </Link>
    </div>
  );
}
