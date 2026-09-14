import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import { ClusterBanner } from "@/components/ClusterBanner";
import { ClusterProvider } from "@/components/ClusterProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SolanaProviders } from "@/components/SolanaProviders";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WelcomeModal } from "@/components/WelcomeModal";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hankolabs.xyz"),
  title: {
    default: "Hanko, trade a stock as three tokens",
    template: "%s · Hanko",
  },
  description:
    "Hanko splits a tokenized stock into three tokens you can hold on their own: a safe part, a balanced part, and an upside part. Fully backed, recombine anytime.",
  keywords: [
    "tokenized stocks",
    "Solana",
    "tranches",
    "Backpack Securities",
    "xStocks",
    "structured products",
    "DeFi",
  ],
  openGraph: {
    title: "Hanko, trade a stock as three tokens",
    description:
      "Split a tokenized stock into a safe part, a balanced part, and an upside part. Fully backed, recombine anytime.",
    url: "https://hankolabs.xyz",
    siteName: "Hanko",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hanko, trade a stock as three tokens",
    description:
      "Split a tokenized stock into a safe part, a balanced part, and an upside part.",
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
          <ClusterProvider>
            <SolanaProviders>
              <SiteHeader />
              <ClusterBanner />
              <main className="flex flex-1 flex-col">{children}</main>
              <SiteFooter />
              <WelcomeModal />
              <CookieBanner />
            </SolanaProviders>
          </ClusterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
