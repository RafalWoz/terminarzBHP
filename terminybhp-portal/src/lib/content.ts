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
    title: "Szkolenie wstepne BHP: co trzeba dopilnowac przed rozpoczeciem pracy",
    description:
      "Praktyczna lista elementow, ktore powinny znalezc sie w procesie dopuszczenia pracownika do pracy.",
    category: "Szkolenia",
    date: "2026-05-18",
    readingTime: "4 min",
    status: "publish",
    content: [
      "Szkolenie wstepne BHP jest jednym z podstawowych warunkow dopuszczenia pracownika do pracy. W praktyce najwazniejsze jest nie tylko samo przeprowadzenie szkolenia, ale tez poprawne udokumentowanie instruktazu ogolnego i stanowiskowego.",
      "Dobry proces zaczyna sie od sprawdzenia stanowiska, zakresu obowiazkow i ryzyk, ktore beda dotyczyc konkretnej osoby. Dzieki temu instruktaz stanowiskowy nie jest formalnoscia, tylko realnym przygotowaniem do pracy.",
      "Warto pilnowac rowniez terminow kolejnych szkolen okresowych. W serwisie TerminyBHP ta czesc pracy ma byc prowadzona automatycznie: firma, pracownicy, terminy i alerty w jednym miejscu.",
    ],
  },
  {
    slug: "badania-lekarskie-pracownikow",
    title: "Badania lekarskie pracownikow: jak nie zgubic terminow",
    description:
      "Krotki przewodnik po badaniach wstepnych, okresowych i kontrolnych oraz sposobie ich monitorowania.",
    category: "Badania",
    date: "2026-05-18",
    readingTime: "3 min",
    status: "publish",
    content: [
      "Badania lekarskie sa jednym z tych obszarow, w ktorych opoznienie szybko staje sie problemem organizacyjnym. Pracownik bez aktualnego orzeczenia nie powinien byc dopuszczony do pracy.",
      "Najprostszy porzadek to jedna lista pracownikow, przypisane stanowiska i daty waznosci badan. Przy wiekszej liczbie firm albo oddzialow reczne pilnowanie terminow szybko przestaje byc wygodne.",
      "TerminyBHP ma pomagac wlasnie w tym miejscu: porzadkowac dane i pokazywac, co wymaga reakcji teraz, a co dopiero za kilka tygodni.",
    ],
  },
  {
    slug: "rejestr-terminow-bhp",
    title: "Rejestr terminow BHP w firmie: co warto miec w jednym miejscu",
    description:
      "Szkolenia, badania, uprawnienia i audyty w jednym uporzadkowanym rejestrze.",
    category: "Organizacja",
    date: "2026-05-18",
    readingTime: "5 min",
    status: "publish",
    content: [
      "Dobry rejestr terminow BHP powinien odpowiadac na proste pytanie: kto, czego i do kiedy potrzebuje. Bez tego latwo przeoczyc szkolenie okresowe, badanie lekarskie albo wygasajace uprawnienie.",
      "W jednym miejscu warto trzymac firmy, pracownikow, stanowiska, rodzaje dokumentow, daty waznosci i notatki. Taki porzadek zmniejsza liczbe telefonow, arkuszy i lokalnych plikow.",
      "Publiczny blog TerminyBHP bedzie rozwijany obok serwisu, aby tlumaczyc te procesy prostym jezykiem i sciagac ruch z wyszukiwarki.",
    ],
  },
];

const postsDir = path.join(process.cwd(), "data", "posts");

export const tools = [
  {
    title: "Kalkulator ryzyka zawodowego",
    description:
      "Miejsce pod narzedzie do szybkiej oceny poziomu ryzyka na stanowisku pracy.",
    status: "Planowane",
  },
  {
    title: "Generator listy kontrolnej",
    description:
      "Szkic narzedzia do przygotowania checklisty dla firmy, stanowiska albo audytu.",
    status: "Planowane",
  },
  {
    title: "Przelicznik terminow",
    description:
      "Prosty pomocnik do liczenia dat szkolen okresowych, badan i przypomnien.",
    status: "Planowane",
  },
];

export const templates = [
  {
    title: "Lista kontrolna szkolenia wstepnego",
    description:
      "Szablon checklisty dla osoby przyjmowanej do pracy lub zmieniajacej stanowisko.",
    status: "Do przygotowania",
  },
  {
    title: "Rejestr badan lekarskich",
    description:
      "Wzor tabeli do zebrania terminow badan wstepnych, okresowych i kontrolnych.",
    status: "Do przygotowania",
  },
  {
    title: "Rejestr szkolen okresowych",
    description:
      "Prosty uklad danych, ktory pozniej bedzie mozna przeniesc do serwisu.",
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
