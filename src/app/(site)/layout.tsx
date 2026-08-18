import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSettings, isDemo } from "@/sanity/lib/fetch";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-60 focus:rounded-full focus:bg-leaf focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-hide"
      >
        Skip to content
      </a>

      {isDemo ? (
        <p className="relative z-40 border-b border-leaf/15 bg-hide-3 px-5 py-1.5 text-center text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-leaf/75">
          Demo content · rooms, prices and menus are placeholders until Sanity is connected
        </p>
      ) : null}

      <SiteHeader />
      <main id="main" className="relative">
        {children}
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
