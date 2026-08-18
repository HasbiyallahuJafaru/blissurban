import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://blissurban.example"),
  title: {
    default: "Bliss Urban Hotels & Suites — Barnawa, Kaduna",
    template: "%s — Bliss Urban Hotels & Suites",
  },
  description:
    "A business hotel in Barnawa, Kaduna. Twenty-four hour power, secure parking, fibre Wi-Fi, and a kitchen open until midnight. Request a room, order food, or book a table in the lounge.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "Bliss Urban Hotels & Suites",
  },
};

const CONTRACT = `<!--
THESIS: A Kaduna business hotel proves itself with facts a traveller actually checks
(power, gate, wifi, kitchen hours), not with a stock chandelier over a full-bleed video.
OWN-WORLD: Gold-blocked leather. Tanned-hide ground with grain, never flat black; gold is
leaf and brass, so rules are tooled (dark above, foil below), panels are bound plates, and
the arrow motif is a set eyelet. Bodoni Moda with opsz pinned low against Archivo.
STORY: This is clean, secure and powered; a person answers within seconds; request a room,
order dinner, or hold a table.
FIRST VIEWPORT: Split. Left, an eyebrow, a Bodoni headline breaking to gold italic, one
paragraph, a gold pill beside a ghost pill, and a tooled fact row. Right, a bound plate with
a rate card overlapping its lower-left corner.
FORM: Gold-blocked leather, candidate 4 of the grounded list; seed key 93c59e7b.
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
