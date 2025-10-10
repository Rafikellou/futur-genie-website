import { HeroSectionV2 } from "@/components/landing/HeroSectionV2";
import { ProblemSectionV2 } from "@/components/landing/ProblemSectionV2";
import { SolutionSectionV2 } from "@/components/landing/SolutionSectionV2";
import { FeaturesSectionV2 } from "@/components/landing/FeaturesSectionV2";
import { PricingSectionV2 } from "@/components/landing/PricingSectionV2";
import { FAQSectionV2 } from "@/components/landing/FAQSectionV2";
import { FinalCTASectionV2 } from "@/components/landing/FinalCTASectionV2";

export default function HomePage() {
  return (
    <>
      <HeroSectionV2 />
      <ProblemSectionV2 />
      <SolutionSectionV2 />
      <FeaturesSectionV2 />
      <PricingSectionV2 />
      <FAQSectionV2 />
      <FinalCTASectionV2 />
    </>
  );
}
