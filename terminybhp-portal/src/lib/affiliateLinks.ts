export type BlogAffiliateRecommendation = {
  href: string;
  title: string;
  description: string;
  cta: string;
};

const vibrationReductionProgram: BlogAffiliateRecommendation = {
  href: "https://webep1.com/go/fd8d12da71",
  title: "Program ograniczania oddziaływania czynników",
  description:
    "Jeżeli po rozpoznaniu czynników szkodliwych musisz uporządkować działania ograniczające narażenie, sprawdź gotowy program, który pomoże przejść od oceny ryzyka do konkretnych zabezpieczeń.",
  cta: "Sprawdź program ograniczania oddziaływania",
};

const safetyServiceTraining: BlogAffiliateRecommendation = {
  href: "https://webep1.com/go/3cb8f1ce71",
  title: "Szkolenie dla pracowników służby BHP",
  description:
    "Artykuł pokazuje zadania służby BHP. Jeżeli obsługą bezpieczeństwa zajmuje się wewnętrzny specjalista, warto od razu porównać wymagania z ofertą szkolenia dla tej grupy.",
  cta: "Sprawdź szkolenie dla służby BHP",
};

const managersPeriodicTraining: BlogAffiliateRecommendation = {
  href: "https://webep1.com/go/961c8fa171",
  title: "Szkolenie okresowe dla osób kierujących pracownikami",
  description:
    "Jeżeli wybierasz kurs dla kierowników, sprawdź program, dokumentację, egzamin i formę zaświadczenia. To dobre uzupełnienie kryteriów opisanych w rankingu.",
  cta: "Sprawdź szkolenie dla osób kierujących",
};

const managersOnlineTraining: BlogAffiliateRecommendation = {
  href: "https://webep1.com/go/961c8fa171",
  title: "Szkolenie okresowe online dla osób kierujących",
  description:
    "Jeżeli organizujesz szkolenie okresowe w formule online dla kadry kierowniczej, sprawdź program, sposób realizacji i dokumenty potwierdzające ukończenie kursu.",
  cta: "Sprawdź szkolenie okresowe online",
};

const managersTrainingDocuments: BlogAffiliateRecommendation = {
  href: "https://webep1.com/go/961c8fa171",
  title: "Szkolenie okresowe dla osób kierujących",
  description:
    "Przy porządkowaniu poleceń, zaświadczeń i protokołów warto od razu sprawdzić, jak wygląda pełna ścieżka szkolenia okresowego dla pracodawców i osób kierujących pracownikami.",
  cta: "Sprawdź szkolenie dla kierujących",
};

const prefabricationIbwr: BlogAffiliateRecommendation = {
  href: "https://webep1.com/go/1be748e371",
  title: "BWR dla prac prefabrykacyjnych",
  description:
    "Przy pracach budowlanych i montażowych sama instrukcja bywa za mało szczegółowa. Dla robót z prefabrykatami sprawdź też gotowe BWR dopasowane do tego rodzaju prac.",
  cta: "Sprawdź BWR dla prefabrykacji",
};

const initialTraining: BlogAffiliateRecommendation = {
  href: "https://webep1.com/go/b27b2a3071",
  title: "Szkolenie wstępne i instruktaż ogólny",
  description:
    "Po sprawdzeniu zasad z artykułu możesz porównać program, kartę szkolenia i dokumenty z gotową ofertą szkolenia wstępnego BHP. Pamiętaj, że instruktaż stanowiskowy nadal wymaga dopasowania do realnej pracy.",
  cta: "Sprawdź szkolenie wstępne BHP",
};

const generalSafetySupport: BlogAffiliateRecommendation = {
  href: "https://webep1.com/go/4dc6f1a671",
  title: "Potrzebujesz szerszego wsparcia BHP?",
  description:
    "Jeżeli po przeglądzie dokumentacji widzisz, że brakuje czasu albo osoby do bieżącej obsługi BHP, możesz porównać zakres prac z ofertą zewnętrznego wsparcia.",
  cta: "Sprawdź Pogotowie BHP",
};

const affiliateRecommendationsBySlug: Record<string, BlogAffiliateRecommendation> = {
  "czynniki-niebezpieczne-szkodliwe-i-uciazliwe": vibrationReductionProgram,
  "drgania-mechaniczne-wibracje": vibrationReductionProgram,
  "ocena-ryzyka-drgan-praca-mlotek-pneumatyczny": vibrationReductionProgram,
  "wplyw-cisnienia-powietrza-na-drgania-mlotka-pneumatycznego": vibrationReductionProgram,

  "sluzba-bhp": safetyServiceTraining,
  "nadzor-nad-warunkami-pracy": safetyServiceTraining,
  "procedura-przekazywania-protokolow-ryzyka-do-sluzby-bhp": safetyServiceTraining,
  "umowa-powierzenia-koordynacji-bhp-sluzbie-bhp": safetyServiceTraining,

  "kurs-bhp-online": managersPeriodicTraining,
  "pierwsze-szkolenie-okresowe-bhp": managersPeriodicTraining,
  "szkolenie-okresowe-bhp-dla-pracodawcy": managersPeriodicTraining,
  "rozliczenie-czasu-pracy-szkolenie-okresowe-bhp": managersPeriodicTraining,
  "odpowiedzialnosc-za-naruszenie-przepisow-bhp": managersPeriodicTraining,
  "szkolenie-okresowe-bhp-online": managersOnlineTraining,
  "szkolenie-okresowe-bhp-online-cena": managersOnlineTraining,
  "edukacyjna-godzina-45-minut-rozliczenie-e-learningu": managersOnlineTraining,
  "polecenie-e-learning-asynchroniczny-okno-realizacji-godziny": managersOnlineTraining,
  "wzor-polecenia-sluzbowego-udzialu-w-szkoleniu-bhp": managersTrainingDocuments,
  "wzor-protokolu-egzaminu-szkolenia-okresowego-bhp": managersTrainingDocuments,
  "wzor-zaswiadczenia-szkolenie-okresowe-zalacznik-3": managersTrainingDocuments,
  "jak-sprawdzic-aktualnosc-zaswiadczenia-szkolenie-okresowe": managersTrainingDocuments,
  "zwolnienie-z-pierwszego-szkolenia-okresowego-zaswiadczenie-inny-pracodawca": managersTrainingDocuments,

  "instrukcja-bhp-przy-pracach-budowlanych": prefabricationIbwr,
  "prace-szczegolnie-niebezpieczne": prefabricationIbwr,
  "prace-na-wysokosci": prefabricationIbwr,
  "prace-ziemne-wykopy-pod-fundamenty": prefabricationIbwr,

  "szkolenia-bhp": initialTraining,
  "wzor-karty-szkolenia-wstepnego": initialTraining,
  "szkolenie-wstepne-bhp-biurowych": initialTraining,
  "instruktaz-ogolny-dla-praktykantow": initialTraining,
  "lista-obecnosci-instruktaz-bhp-praktyki": initialTraining,
  "przechowywanie-karty-szkolenia-wstepnego-czesc-b": initialTraining,

  "dokumentacja-bhp": generalSafetySupport,
  "audyty-i-kontrole-stanu-bhp": generalSafetySupport,
  "konsultacje-bhp": generalSafetySupport,
  "koordynacja-bhp": generalSafetySupport,
  "bhp-w-magazynach-i-logistyce": generalSafetySupport,
  "bhp-w-przemysle-i-na-produkcji": generalSafetySupport,
  "bhp-w-ochronie-zdrowia": generalSafetySupport,
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
