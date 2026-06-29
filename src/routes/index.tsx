import { createFileRoute } from "@tanstack/react-router";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import SelectedWork from "@/components/SelectedWork";
import Services from "@/components/Services";
import About from "@/components/About";

import Contact from "@/components/Contact";
import ScrollRefresher from "@/components/ScrollRefresher";


const SITE_URL = "https://chuzi.lovable.app";
const HOME_URL = `${SITE_URL}/`;
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const TITLE = "Ayesha — WordPress Developer & Frontend Specialist | Lahore";
const DESCRIPTION =
  "WordPress developer specializing in Elementor, WooCommerce, and responsive frontend builds. View recent projects and get in touch for freelance work.";

const PROFILE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  url: HOME_URL,
  inLanguage: "en",
  primaryImageOfPage: OG_IMAGE,
  mainEntity: {
    "@type": "Person",
    name: "Ayesha",
    jobTitle: "WordPress Developer",
    description:
      "Lahore-based WordPress and frontend developer building responsive sites, custom themes, and WooCommerce stores.",
    url: HOME_URL,
    image: OG_IMAGE,
    address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
    knowsAbout: [
      "WordPress",
      "WooCommerce",
      "Elementor",
      "PHP",
      "HTML",
      "CSS",
      "JavaScript",
      "Responsive Web Design",
      "Frontend Development",
    ],
    sameAs: ["https://www.linkedin.com/"],
  },
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: HOME_URL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: HOME_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(PROFILE_JSONLD),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <ScrollRefresher />
      
      
      <div className="relative z-10 bg-[#FAFAF7]">
        <Hero />
        <Manifesto />
        <SelectedWork />
        <Services />
        <About />
      </div>
      <Contact />
    </>
  );
}
