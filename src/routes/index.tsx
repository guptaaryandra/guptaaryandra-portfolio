import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { About } from "@/components/sections/about";
import { Work } from "@/components/sections/work";
import { Experience } from "@/components/sections/experience";

import { Projects } from "@/components/sections/projects";
import { Learning } from "@/components/sections/learning";
import { Stack } from "@/components/sections/stack";
import { Roadmap } from "@/components/sections/roadmap";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative z-10">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Work />
        <Experience />

        <Projects />
        <Learning />
        <Stack />
        <Roadmap />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
