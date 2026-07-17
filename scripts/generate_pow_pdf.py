#!/usr/bin/env python3
"""Generate Hanko / Sumiro Studio bounty Proof of Work PDF (compact Swiss editorial)."""

from pathlib import Path

from fpdf import FPDF

OUT = Path(__file__).resolve().parents[1] / "docs" / "Hanko-Sumiro-Proof-of-Work.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

INK = (10, 10, 10)
MUTE = (100, 100, 100)
RULE = (200, 200, 200)


class Doc(FPDF):
    def __init__(self):
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(20, 16, 20)

    def footer(self):
        self.set_y(-12)
        self.set_draw_color(*RULE)
        self.set_line_width(0.2)
        self.line(20, self.get_y(), 190, self.get_y())
        self.set_y(-10)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(*MUTE)
        self.cell(0, 5, f"Hanko  ·  Proof of Work  ·  {self.page_no()}", align="C")

    def ensure(self, h=20):
        if self.get_y() > 297 - 18 - h:
            self.add_page()

    def rule(self, heavy=False):
        self.set_x(20)
        self.set_draw_color(*(INK if heavy else RULE))
        self.set_line_width(0.55 if heavy else 0.25)
        y = self.get_y()
        self.line(20, y, 190, y)
        self.ln(3.5)

    def h2(self, t):
        self.ensure(28)
        self.ln(2)
        self.rule(True)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*INK)
        self.set_x(20)
        self.cell(0, 6.5, t.upper(), new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def h3(self, t):
        self.ensure(16)
        self.ln(1.5)
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(*INK)
        self.set_x(20)
        self.cell(0, 5.5, t, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def p(self, t):
        self.set_x(20)
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*INK)
        self.multi_cell(170, 4.8, t)
        self.ln(1.5)

    def note(self, t):
        self.set_x(20)
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*MUTE)
        self.multi_cell(170, 4.4, t)
        self.ln(1.2)

    def bullets(self, items):
        for item in items:
            self.ensure(10)
            self.set_x(20)
            self.set_font("Helvetica", "", 9.5)
            self.set_text_color(*INK)
            self.cell(4, 4.8, "-")
            self.multi_cell(166, 4.8, item)
            self.ln(0.4)

    def kv(self, k, v):
        self.set_x(20)
        self.set_font("Helvetica", "", 8.5)
        self.set_text_color(*MUTE)
        self.cell(38, 5, k)
        self.set_font("Helvetica", "", 9.5)
        self.set_text_color(*INK)
        self.multi_cell(132, 5, v)

    def row(self, left, right, w_left=48):
        self.ensure(8)
        y = self.get_y()
        self.set_xy(20, y)
        self.set_font("Helvetica", "B" if right == "" else "", 8.5)
        self.set_text_color(*INK)
        self.cell(w_left, 5.5, left)
        self.set_font("Helvetica", "", 8.5)
        self.set_xy(20 + w_left, y)
        self.multi_cell(170 - w_left, 5.5, right)
        self.set_draw_color(*RULE)
        self.set_line_width(0.15)
        self.line(20, self.get_y(), 190, self.get_y())


def build():
    d = Doc()
    d.add_page()

    # Cover
    d.set_font("Helvetica", "", 8)
    d.set_text_color(*MUTE)
    d.cell(0, 4, "PROOF OF WORK", new_x="LMARGIN", new_y="NEXT")
    d.ln(3)
    d.set_font("Helvetica", "B", 26)
    d.set_text_color(*INK)
    d.cell(0, 10, "Hanko", new_x="LMARGIN", new_y="NEXT")
    d.set_font("Helvetica", "", 12)
    d.multi_cell(170, 6, "Claim records for tokenized assets on Solana")
    d.ln(2)
    d.rule(True)

    d.kv("Submitted by", "duke.sol  |  @dukedotsol")
    d.kv("Bounty", "Sumiro Studio: Best startup idea that should exist on Solana")
    d.kv("Product", "https://hankolabs.xyz")
    d.kv("Repository", "https://github.com/cryptoduke01/hanko")
    d.kv("Date", "July 17, 2026")
    d.kv("Entry", "Twitter/X thread + shipped MVP + this document")
    d.ln(2)

    d.set_draw_color(*INK)
    d.set_line_width(0.7)
    y0 = d.get_y()
    d.set_x(24)
    d.set_font("Helvetica", "", 9.5)
    d.set_text_color(*INK)
    d.multi_cell(
        162,
        5,
        "Every tokenized stock has a price, a chart, a ticker, and a legal structure. "
        "Your wallet shows you three. Hanko is the stamp that makes the fourth real.",
    )
    y1 = d.get_y()
    d.line(20, y0, 20, y1)
    d.ln(3)

    # 1
    d.h2("1. Executive Summary")
    d.p(
        "This is proof of work for the Sumiro Studio bounty on Superteam Earn. "
        "The brief asks for one sharp Solana startup thesis as a Twitter/X thread "
        "(3+ tweets), tagging Superteam, SuperteamEarn, Solana, and SumiroStudio. "
        "First prize includes capital, branding, a pitch deck, and an MVP built with Sumiro."
    )
    d.p(
        "I did not stop at a thread. I researched tokenized equities on Solana, wrote a "
        "defensible claim-grading method, and shipped a live product. Judges can open "
        "hankolabs.xyz and inspect claim cards with primary-source footnotes, live market "
        "data, chart previews, and an explicit grading rubric."
    )
    d.p(
        "That flips judging from \"is this idea good\" to \"why is this not already funded.\" "
        "The thread is the thesis. The product is the receipt."
    )
    d.h3("Delivered")
    d.bullets(
        [
            "Thesis: independent claim records for tokenized assets on Solana",
            "Thread covering problem, user, Solana fit, why now, MVP, revenue, competitors, GTM",
            "Live app: Next.js, TypeScript, Tailwind, monochrome Swiss editorial UI",
            "25 claim records; 23 with live DexScreener prices and chart previews",
            "Grading A/B/C/F on /method; product docs on /docs; public GitHub + Vercel",
        ]
    )

    # 2
    d.h2("2. Bounty Requirements Map")
    d.row("Requirement", "Delivery")
    for a, b in [
        ("Idea", "Hanko: claim record layer for tokenized equities"),
        ("Problem", "Same ticker, different legal claims; wallets show 3 of 4 fields"),
        ("User", "Retail buyers; wallets/venues; agents trading tokenized equity"),
        ("Why Solana", "Leading tokenized equity volume; speed/fees for continuous checks"),
        ("Why now", "PreStocks void event; Backpack SPCX; Securitize; DTCC; x402 agents"),
        ("First product", "Public labels + index + method; live market enrichment"),
        ("Business model", "Issuer certification; venue data licenses; agent API (x402)"),
        ("Competitors", "RWA dashboards / PoR / ratings: not at Solana trade point"),
        ("Independence", "Venues must not grade their own inventory"),
        ("MVP", "Shipped: hankolabs.xyz (not a promise)"),
        ("Original angle", "Nutrition-label cards; NOT DISCLOSED as signal"),
        ("Form", "Thread + tags per sponsor; Earn submission link"),
    ]:
        d.row(a, b)

    # 3
    d.h2("3. Research Process")
    d.p(
        "I spent time reading structures instead of charts. Core finding: on Solana, "
        "multiple tokens print near-identical company charts while representing different "
        "legal objects."
    )
    d.h3("Structural classes")
    d.bullets(
        [
            "Registered / issuer-sponsored redeemable equity (e.g. Backpack SPCX via ACATS)",
            "Custodial economic exposure via offshore SPVs (xStocks / Backed; substitute collateral)",
            "Synthetic / PreStocks-class trackers (underlying issuer may void transfers)",
            "Unbacked perpetuals: price reference, zero shares held",
        ]
    )
    d.h3("Timing evidence used in the thesis")
    d.bullets(
        [
            "Solana leadership in tokenized equity volume (multi-week / multi-hundred-million days in public coverage)",
            "May Anthropic PreStocks drawdown; holders learned from charts, not interfaces",
            "Issuer posture: unauthorized transfers void; third-party tokenized sales may have no value",
            "Backpack SpaceX, Securitize on Solana, DTCC limited production context",
            "x402 Foundation: agents will buy faster than they can parse Jersey PDFs",
            "Public observation (e.g. Jito's Bruder): multiple NVIDIA versions, different charts",
        ]
    )
    d.note(
        "Honesty rule: every claim field is linked to a public/primary source or marked "
        "NOT DISCLOSED. Invented custody would make Hanko another marketing surface. "
        "Absence is the product. Live prices never change a grade."
    )

    # 4
    d.h2("4. Product Shipped")
    d.p(
        "Hanko answers one question at the point of trade: what does this token legally "
        "entitle you to, and who says so? Named for the seal that makes a document real."
    )
    d.kv("Production", "https://hankolabs.xyz")
    d.kv("Alt deploy", "https://hanko-three.vercel.app")
    d.kv("GitHub", "https://github.com/cryptoduke01/hanko")
    d.kv("API", "GET /api/market  (~30s revalidation)")
    d.ln(1)

    d.h3("Routes")
    d.row("Route", "Purpose", 42)
    for a, b in [
        ("/", "Landing thesis + monochrome seal hero"),
        ("/assets", "Index: search, filters, live price, sparkline, grade"),
        ("/assets/[ticker]", "8-field claim label + market strip + chart embed"),
        ("/method", "A/B/C/F rubric and rules"),
        ("/docs", "Boundaries, API notes, roadmap"),
        ("/api/market", "JSON quotes by slug (DexScreener)"),
    ]:
        d.row(a, b, 42)

    d.h3("Eight-field claim schema")
    d.p(
        "Issuer · Jurisdiction · Custodian · Authorized by the company · "
        "Redeemable into the real share · Voting rights · Dividend treatment · "
        "Who may legally hold it. Disclosed values carry source markers; gaps render "
        "NOT DISCLOSED with no link."
    )

    d.h3("Grades")
    d.row("Grade", "Meaning", 22)
    d.row("A", "Registered/issuer-sponsored; redeemable; named custody", 22)
    d.row("B", "Economic exposure; collateral may substitute; no vote/direct dividend", 22)
    d.row("C", "Material disclosure gaps; incomplete attestation", 22)
    d.row("F", "Issuer disputed/voided structure, or no assets held", 22)

    d.h3("Coverage at submission")
    d.p(
        "25 claim records. 23 Solana mints with live price, 24h change, volume, liquidity, "
        "sparkline, and DexScreener pair chart where a liquid pair exists. Examples: SPCX "
        "(A), SECZ structure (A, mint not forced), xStocks set (B), PreStocks class (F), "
        "NVDA-PERP unbacked illustration (F)."
    )

    d.h3("Stack")
    d.bullets(
        [
            "Next.js App Router, TypeScript, Tailwind CSS v4",
            "Typed static claims (src/lib/assets.ts); no invent-to-fill backend",
            "DexScreener public market feed; 30s client poll",
            "Dark/light mode; Vercel production; monochrome editorial system",
        ]
    )

    # 5
    d.h2("5. Thread and Visual Package")
    d.p("Narrative arc is thesis, not listicle:")
    d.bullets(
        [
            "Hook: four things exist; wallets show three",
            "Proof event: Anthropic PreStocks vs issuer posture",
            "Taxonomy: registered vs economic exposure vs perpetual",
            "Product: Hanko as claim seal, not price feed",
            "Label UX: eight lines people will actually read",
            "Market size + Solana leadership in tokenized equities",
            "Why now: six-month timeline of real vs fake wrappers",
            "Agents / x402 will pick cheapest NVDA without reading PDFs",
            "MVP, distribution, revenue, competitors, venue independence",
            "Why Sumiro: make unreadable things readable and ship",
        ]
    )
    d.h3("Four screenshots")
    d.bullets(
        [
            "01 Home (brand optional in caption focus)",
            "02 Index: multi-asset table with live prices and sparklines",
            "03 Detail: one claim card + market + chart",
            "04 Method: grading rubric",
        ]
    )
    d.note(
        "Writeups for posts emphasize index, detail, and method; home can appear in the "
        "gallery without driving the caption."
    )

    # 6
    d.h2("6. Company, Not Feature")
    d.p(
        "Objection: why doesn't Jupiter build this? Venues that listed PreStocks cannot "
        "be the independent grade of their own inventory. That independence is the firm."
    )
    d.p(
        "Comparables measure RWA value, verify reserves at issuer request, or rate tokens "
        "off the Solana trade surface. None stamp the claim at click-to-buy in wallets "
        "and terminals."
    )
    d.p(
        "Revenue: issuers pay for certification/monitoring; venues license feeds for "
        "post-PreStocks liability; agents pay per claim call (x402-ready). The schema "
        "that becomes the standard owns the category."
    )

    # 7
    d.h2("7. Authenticity")
    d.h3("What I did")
    d.bullets(
        [
            "Mapped structural classes from public materials",
            "Resolved real mints for live enrichment (not mock prices)",
            "Wrote claim schema and grades before expanding coverage",
            "Shipped production UI with semantic tables and source links",
            "Refused to invent fields to look complete",
            "Documented what Hanko is not (terminal, advice, issuer endorsement)",
        ]
    )
    d.h3("What this is not")
    d.bullets(
        [
            "Not financial advice or a buy/sell recommendation",
            "Not full coverage of all ~150 tokenized assets",
            "Not fully automated legal reading; claims are curated with live market overlay",
        ]
    )

    # 8
    d.h2("8. Why Sumiro")
    d.p(
        "Sumiro turns unreadable systems into clear identity and shippable product in short "
        "cycles. A claim label is that craft applied to tokenized equity. Solana is winning "
        "volume and inheriting unverified claims; someone must write the standard. A studio "
        "that shapes identity and ships fast is the right co-builder for brand, deck, "
        "methodology, and public build."
    )
    d.p(
        "v1 already exists in public. Collaboration multiplies distribution into wallets, "
        "venues, and Superteam channels, and hardens a standard later versions can attach "
        "on-chain via token extensions."
    )

    # 9
    d.h2("9. Links")
    d.kv("Product", "https://hankolabs.xyz")
    d.kv("Index", "https://hankolabs.xyz/assets")
    d.kv("Method", "https://hankolabs.xyz/method")
    d.kv("Docs", "https://hankolabs.xyz/docs")
    d.kv("API", "https://hankolabs.xyz/api/market")
    d.kv("Source", "https://github.com/cryptoduke01/hanko")
    d.kv("Author", "duke.sol  |  https://x.com/dukedotsol")
    d.kv("Host", "Superteam Earn  |  Sumiro Studio listing")
    d.ln(2)
    d.rule(True)
    d.h3("Closing")
    d.p(
        "The thread argues the idea. The product proves the work. Twenty-five claim "
        "records are a wedge; roughly a hundred and fifty wrappers still trade with "
        "unread legal structures. Hanko exists so that at the point of trade, the fourth "
        "thing is no longer invisible."
    )
    d.ln(2)
    d.note(
        "Document prepared by duke.sol\n"
        "Builder  |  Growth  |  Product\n"
        "July 17, 2026\n\n"
        "Not financial advice. Grades describe legal-structure clarity from public "
        "materials, not expected returns."
    )

    d.output(str(OUT))
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes), pages={d.page_no()}")


if __name__ == "__main__":
    build()
