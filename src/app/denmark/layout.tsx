import type { ReactNode } from "react";
import { CountryLayout } from "@/components/country-layout";

export default function DenmarkLayout({ children }: { children: ReactNode }) {
  return <CountryLayout country="denmark">{children}</CountryLayout>;
}
