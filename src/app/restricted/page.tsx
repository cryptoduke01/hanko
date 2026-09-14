import Link from "next/link";

export const metadata = {
  title: "Not available in your region",
  description: "Hanko's real-securities features are not available in your jurisdiction.",
};

export default function RestrictedPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-[12px] font-medium tracking-[0.02em] text-mute">Region</p>
      <h1 className="mt-3 font-sans text-3xl font-bold tracking-[-0.03em] text-ink sm:text-4xl">
        Not available in your region
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-mute">
        Hanko refracts real tokenized securities issued by Backpack Securities,
        which are not offered in your jurisdiction (including the United States,
        United Kingdom, United Arab Emirates, and Japan) or to US persons.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-mute">
        You can still read how Hanko works.
      </p>
      <div className="mt-8">
        <Link
          href="/docs"
          className="press inline-flex items-center rounded-full border border-rule px-6 py-3 text-[14px] font-medium tracking-[0.01em] text-ink transition-colors duration-200 hover:border-ink"
        >
          How it works
        </Link>
      </div>
    </div>
  );
}
