import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import { SITE } from "@/lib/seo";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-bodoni",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  // Every relative URL in metadata — canonicals, og:url, og:image — resolves
  // against this, so it is read from the one constant in lib/seo.
  metadataBase: new URL(SITE),
  title: {
    default: "Bliss Urban Hotels & Suites — Barnawa, Kaduna",
    template: "%s — Bliss Urban Hotels & Suites",
  },
  description:
    "A business hotel in Barnawa, Kaduna. Twenty-four hour power, secure parking, fibre Wi-Fi, and a kitchen open till midnight.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "/",
    siteName: "Bliss Urban Hotels & Suites",
  },
  twitter: { card: "summary_large_image" },
  // `max-image-preview: large` is what lets a hotel show a full-width photo in
  // results rather than a thumbnail, and costs nothing to ask for.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

const CONTRACT = `<!--
THESIS: A Kaduna business hotel proves itself with facts a traveller actually checks
(power, gate, wifi, kitchen hours), not with a stock chandelier over a full-bleed video.
OWN-WORLD: Foil-blocked stationery. Warm paper stock with tooth, black ink, gold foil as a
material rather than a tint: rules are struck with a lit lower edge, panels are letterpress
plates, and one ink band per page carries the weight. Bodoni Moda against Archivo.
STORY: This is clean, secure and powered; a person answers within seconds; request a room,
order dinner, or hold a table.
FIRST VIEWPORT: Deliberately off-axis, 5/7 not 6/6. Left, an eyebrow, a Bodoni headline
breaking to gold italic, one paragraph, two pills, a foil-ruled fact row. Right, a plate
running off the right edge with a rate card set half onto the paper.
FORM: Foil-blocked stationery, from the gold-blocked leather direction (candidate 4,
seed key 93c59e7b) re-grounded on the client's beige/white/black/gold palette.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
the verdict, and DESIGN.md
-->`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-NG" className={`${bodoni.variable} ${archivo.variable} h-full`}>
      <body className="relative min-h-full">
        <div hidden dangerouslySetInnerHTML={{ __html: CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
