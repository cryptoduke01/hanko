import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hanko, refract a tokenized share into its spectrum",
    template: "%s · Hanko",
  },
  description:
    "A share bundles safety, exposure and upside into one price. Hanko refracts a tokenized stock into three tradeable tranches — SHIELD, CORE, EDGE — that always recombine into one share. Structured products, unbundled and provable, on Solana.",
  openGraph: {
    title: "Hanko, refract a tokenized share into its spectrum",
    description:
      "One share, refracted into safety, exposure and upside. Own only the wavelength you want.",
    type: "website",
  },
};

const themeInitScript = `
(function(){
  try {
    var k='hanko-theme';
    var s=localStorage.getItem(k);
    var d=window.matchMedia('(prefers-color-scheme: dark)').matches;
    var t=(s==='light'||s==='dark')?s:(d?'dark':'light');
    if(t==='dark') document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme=t;
    document.documentElement.style.colorScheme=t;
  } catch(e){}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink antialiased">
        <ThemeProvider>
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
