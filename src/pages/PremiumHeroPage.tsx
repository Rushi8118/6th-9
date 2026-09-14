import { Helmet } from "react-helmet-async"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PremiumHero } from "@/components/premium-earth/PremiumHero"

/** Standalone preview route for the premium Three.js hero redesign. */
export default function PremiumHeroPage() {
  return (
    <>
      <Helmet>
        <title>Premium Hero Preview | Siddhivinayak Overseas</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <SiteHeader />
      <main className="min-h-screen bg-[#070d1c]">
        <PremiumHero />
      </main>
      <SiteFooter />
    </>
  )
}
