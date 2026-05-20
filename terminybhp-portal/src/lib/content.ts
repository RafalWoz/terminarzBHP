import fs from "fs";
import path from "path";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingTime: string;
  content: string[];
  status: "publish" | "draft";
};

type RawPost = Partial<BlogPost> & {
  createdAt?: string;
  excerpt?: string;
  content?: string | string[];
};

const seedPosts: BlogPost[] = [
  {
    slug: "szkolenie-wstepne-bhp",
    title: "Szkolenie wstępne BHP: co trzeba dopilnować przed rozpoczęciem pracy",
    description:
      "Praktyczna lista elementów, które powinny znaleźć się w procesie dopuszczenia pracownika do pracy.",
    category: "Szkolenia",
    date: "2026-05-18",
    readingTime: "4 min",
    status: "publish",
    content: [
      "Szkolenie wstępne BHP jest jednym z podstawowych warunków dopuszczenia pracownika do pracy. W praktyce najważniejsze jest nie tylko samo przeprowadzenie szkolenia, ale też poprawne udokumentowanie instruktażu ogólnego i stanowiskowego.",
      "Dobry proces zaczyna się od sprawdzenia stanowiska, zakresu obowiązków i ryzyk, które będą dotyczyć konkretnej osoby. Dzięki temu instruktaż stanowiskowy nie jest formalnością, tylko realnym przygotowaniem do pracy.",
      "Warto pilnować również terminów kolejnych szkoleń okresowych. W serwisie TerminyBHP ta część pracy ma być prowadzona automatycznie: firma, pracownicy, terminy i alerty w jednym miejscu.",
    ],
  },
  {
    slug: "badania-lekarskie-pracownikow",
    title: "Badania lekarskie pracowników: jak nie zgubić terminów",
    description:
      "Krótki przewodnik po badaniach wstępnych, okresowych i kontrolnych oraz sposobie ich monitorowania.",
    category: "Badania",
    date: "2026-05-18",
    readingTime: "3 min",
    status: "publish",
    content: [
      "Badania lekarskie są jednym z tych obszarów, w których opóźnienie szybko staje się problemem organizacyjnym. Pracownik bez aktualnego orzeczenia nie powinien być dopuszczony do pracy.",
      "Najprostszy porządek to jedna lista pracowników, przypisane stanowiska i daty ważności badań. Przy większej liczbie firm albo oddziałów ręczne pilnowanie terminów szybko przestaje być wygodne.",
      "TerminyBHP ma pomagać właśnie w tym miejscu: porządkować dane i pokazywać, co wymaga reakcji teraz, a co dopiero za kilka tygodni.",
    ],
  },
  {
    slug: "rejestr-terminow-bhp",
    title: "Rejestr terminów BHP w firmie: co warto mieć w jednym miejscu",
    description:
      "Szkolenia, badania, uprawnienia i audyty w jednym uporządkowanym rejestrze.",
    category: "Organizacja",
    date: "2026-05-18",
    readingTime: "5 min",
    status: "publish",
    content: [
      "Dobry rejestr terminów BHP powinien odpowiadać na proste pytanie: kto, czego i do kiedy potrzebuje. Bez tego łatwo przeoczyć szkolenie okresowe, badanie lekarskie albo wygasające uprawnienie.",
      "W jednym miejscu warto trzymać firmy, pracowników, stanowiska, rodzaje dokumentów, daty ważności i notatki. Taki porządek zmniejsza liczbę telefonów, arkuszy i lokalnych plików.",
      "Publiczny blog TerminyBHP będzie rozwijany obok serwisu, aby tłumaczyć te procesy prostym językiem i ściągać ruch z wyszukiwarki.",
    ],
  },
];

const postsDir = path.join(process.cwd(), "data", "posts");

export const tools = [
  {
    title: "Kalkulator ryzyka zawodowego",
    description:
      "Miejsce pod narzędzie do szybkiej oceny poziomu ryzyka na stanowisku pracy.",
    status: "Planowane",
  },
  {
    title: "Generator listy kontrolnej",
    description:
      "Szkic narzędzia do przygotowania checklisty dla firmy, stanowiska albo audytu.",
    status: "Planowane",
  },
  {
    title: "Przelicznik terminów",
    description:
      "Prosty pomocnik do liczenia dat szkoleń okresowych, badań i przypomnień.",
    status: "Planowane",
  },
];

export const templates = [
  {
    title: "Lista kontrolna szkolenia wstępnego",
    description:
      "Szablon checklisty dla osoby przyjmowanej do pracy lub zmieniającej stanowisko.",
    status: "Do przygotowania",
  },
  {
    title: "Rejestr badań lekarskich",
    description:
      "Wzór tabeli do zebrania terminów badań wstępnych, okresowych i kontrolnych.",
    status: "Do przygotowania",
  },
  {
    title: "Rejestr szkoleń okresowych",
    description:
      "Prosty układ danych, który później będzie można przenieść do serwisu.",
    status: "Do przygotowania",
  },
];

function estimateReadingTime(content: string[]) {
  const words = content.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

function normalizeContent(content: string | string[] | undefined) {
  if (Array.isArray(content)) {
    return content.filter((paragraph) => typeof paragraph === "string" && paragraph.trim().length > 0);
  }

  if (typeof content !== "string") {
    return [];
  }

  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function normalizePost(rawPost: RawPost, fallbackSlug: string): BlogPost | null {
  const content = normalizeContent(rawPost.content);
  const slug = rawPost.slug || fallbackSlug;
  const title = rawPost.title;

  if (!slug || !title || content.length === 0) {
    return null;
  }

  return {
    slug,
    title,
    description: rawPost.description || rawPost.excerpt || content[0].slice(0, 180),
    category: rawPost.category || "BHP",
    date: rawPost.date || rawPost.createdAt || new Date().toISOString(),
    readingTime: rawPost.readingTime || estimateReadingTime(content),
    status: rawPost.status === "draft" ? "draft" : "publish",
    content,
  };
}

function readPostsFromFiles() {
  if (!fs.existsSync(postsDir)) {
    return [];
  }

  return fs
    .readdirSync(postsDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const filePath = path.join(postsDir, fileName);
      const fallbackSlug = fileName.replace(/\.json$/, "");

      try {
        return normalizePost(JSON.parse(fs.readFileSync(filePath, "utf-8")), fallbackSlug);
      } catch {
        return null;
      }
    })
    .filter((post): post is BlogPost => Boolean(post));
}

export function getAllPosts({ includeDrafts = false } = {}) {
  const postsBySlug = new Map<string, BlogPost>();

  for (const post of seedPosts) {
    postsBySlug.set(post.slug, post);
  }

  for (const post of readPostsFromFiles()) {
    postsBySlug.set(post.slug, post);
  }

  return Array.from(postsBySlug.values())
    .filter((post) => includeDrafts || post.status === "publish")
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export function getPost(slug: string) {
  return getAllPosts({ includeDrafts: false }).find((post) => post.slug === slug);
}
