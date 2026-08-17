export type BlogAffiliateRecommendation = {
  href: string;
  title: string;
  description: string;
  cta: string;
};

const affiliateRecommendationsBySlug: Record<string, BlogAffiliateRecommendation> = {
  "czynniki-niebezpieczne-szkodliwe-i-uciazliwe": {
    href: "https://webep1.com/go/fd8d12da71",
    title: "Program ograniczania oddziaływania czynników",
    description:
      "Jeżeli po rozpoznaniu czynników szkodliwych musisz uporządkować działania ograniczające narażenie, sprawdź gotowy program, który pomoże przejść od oceny ryzyka do konkretnych zabezpieczeń.",
    cta: "Sprawdź program ograniczania oddziaływania",
  },
  "sluzba-bhp": {
    href: "https://webep1.com/go/3cb8f1ce71",
    title: "Szkolenie dla pracowników służby BHP",
    description:
      "Artykuł pokazuje zadania służby BHP. Jeżeli obsługą bezpieczeństwa zajmuje się wewnętrzny specjalista, warto od razu porównać wymagania z ofertą szkolenia dla tej grupy.",
    cta: "Sprawdź szkolenie dla służby BHP",
  },
  "kurs-bhp-online": {
    href: "https://webep1.com/go/961c8fa171",
    title: "Szkolenie okresowe dla osób kierujących pracownikami",
    description:
      "Jeżeli wybierasz kurs dla kierowników, sprawdź program, dokumentację, egzamin i formę zaświadczenia. To dobre uzupełnienie kryteriów opisanych w rankingu.",
    cta: "Sprawdź szkolenie dla osób kierujących",
  },
  "instrukcja-bhp-przy-pracach-budowlanych": {
    href: "https://webep1.com/go/1be748e371",
    title: "BWR dla prac prefabrykacyjnych",
    description:
      "Przy pracach budowlanych i montażowych sama instrukcja bywa za mało szczegółowa. Dla robót z prefabrykatami sprawdź też gotowe BWR dopasowane do tego rodzaju prac.",
    cta: "Sprawdź BWR dla prefabrykacji",
  },
  "szkolenia-bhp": {
    href: "https://webep1.com/go/b27b2a3071",
    title: "Szkolenie wstępne i instruktaż ogólny",
    description:
      "Po sprawdzeniu zasad z artykułu możesz porównać program, kartę szkolenia i dokumenty z gotową ofertą szkolenia wstępnego BHP. Pamiętaj, że instruktaż stanowiskowy nadal wymaga dopasowania do realnej pracy.",
    cta: "Sprawdź szkolenie wstępne BHP",
  },
  "dokumentacja-bhp": {
    href: "https://webep1.com/go/4dc6f1a671",
    title: "Potrzebujesz szerszego wsparcia BHP?",
    description:
      "Jeżeli po przeglądzie dokumentacji widzisz, że brakuje czasu albo osoby do bieżącej obsługi BHP, możesz porównać zakres prac z ofertą zewnętrznego wsparcia.",
    cta: "Sprawdź Pogotowie BHP",
  },
};

export function getAffiliateRecommendation(slug: string) {
  return affiliateRecommendationsBySlug[slug];
}

export function isAffiliateHref(href: string) {
  try {
    const normalizedHost = new URL(href).hostname.toLowerCase();
    return normalizedHost === "webep1.com" || normalizedHost.endsWith(".webep1.com");
  } catch {
    return false;
  }
}
