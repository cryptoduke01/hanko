import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
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

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Hanko, claim records for tokenized assets on Solana",
    template: "%s · Hanko",
  },
  description:
    "Every tokenized stock has a price, a chart, a ticker, and a legal structure. Your wallet shows you three. Hanko is the claim record for the fourth, with live market data.",
  openGraph: {
    title: "Hanko, claim records for tokenized assets on Solana",
    description:
      "What does this token legally entitle you to, and who says so?",
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
      className={`${interTight.variable} ${jetbrainsMono.variable} h-full`}
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
