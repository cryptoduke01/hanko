import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
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
  title: {
    default: "Hanko, split a stock into three parts",
    template: "%s · Hanko",
  },
  description:
    "Hanko splits a tokenized stock into three tokens you can hold on their own: a safe part, a balanced part, and an upside part. Fully backed, recombine anytime.",
  openGraph: {
    title: "Hanko, split a stock into three parts",
    description:
      "Split a tokenized stock into a safe part, a balanced part, and an upside part. Fully backed, recombine anytime.",
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
          <SolanaProviders>
            <SiteHeader />
            <main className="flex flex-1 flex-col">{children}</main>
            <SiteFooter />
            <WelcomeModal />
            <CookieBanner />
          </SolanaProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
