import type { Metadata } from "next";
import Link from "next/link";
import { GradeSeal } from "@/components/GradeSeal";
import { GRADE_RUBRIC, type Grade } from "@/lib/types";

export const metadata: Metadata = {
  title: "Method",
  description:
    "How Hanko grades tokenized asset claim structures from primary documents.",
};

const GRADES: Grade[] = ["A", "B", "C", "F"];

export default function MethodPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 animate-fade-up">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
          Methodology
        </p>
        <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          How grades work
        </h1>
        <p className="mt-3 text-base leading-relaxed text-mute">
          Hanko answers one question: what does this token legally entitle you
          to, and who says so? Grades come only from public primary documents,
          issuer filings, custody attestations, transfer-agent records, and
          on-chain structure. We do not invent values.
        </p>
      </header>

      <section
        className="animate-fade-up-delay-1"
        aria-labelledby="rubric-heading"
      >
        <h2
          id="rubric-heading"
          className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink"
        >
          Rubric
        </h2>
        <ul className="mt-4 space-y-0 border-t border-ink">
          {GRADES.map((grade) => (
            <li
              key={grade}
              className="flex gap-4 border-b border-rule py-5 transition-colors duration-300 hover:bg-haze/40"
            >
              <GradeSeal grade={grade} size="md" />
              <div>
                <p className="font-sans text-sm font-semibold text-ink">
                  {GRADE_RUBRIC[grade].title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-mute">
                  {GRADE_RUBRIC[grade].description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mt-12 animate-fade-up-delay-2 border-t border-rule pt-8"
        aria-labelledby="rules-heading"
      >
        <h2
          id="rules-heading"
          className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink"
        >
          Rules
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink">
          <li>
            Every claim on a label links to a primary source, or it renders as{" "}
            <span className="font-mono text-mute">NOT DISCLOSED</span>.
          </li>
          <li>
            Absence is intentional. Missing custody, authorization, or
            redeemability is a signal, not a gap to fill with marketing copy.
          </li>
          <li>
            Grades are structural, not investment advice. An A means the legal
            claim is clearer, not that the price will go up.
          </li>
          <li>
            Independence matters. Venues that list assets should not grade their
            own inventory. Hanko is the independent claim layer.
          </li>
          <li>
            Live market prices enrich the record. They never change a grade.
          </li>
        </ol>
      </section>

      <p className="mt-12 animate-fade-up-delay-3 flex flex-wrap gap-6">
        <Link
          href="/assets"
          className="font-mono text-xs uppercase tracking-[0.12em] text-ink underline decoration-rule underline-offset-4 transition-opacity duration-200 hover:opacity-60"
        >
          Browse the index →
        </Link>
        <Link
          href="/docs"
          className="font-mono text-xs uppercase tracking-[0.12em] text-mute underline decoration-rule underline-offset-4 transition-opacity duration-200 hover:text-ink hover:opacity-60"
        >
          Full docs →
        </Link>
      </p>
    </div>
  );
}
