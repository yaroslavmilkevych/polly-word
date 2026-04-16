const MODIFIERS = [
  {
    id: "duzy",
    forms: { m: "duży", f: "duża", n: "duże" },
    ru: { m: "большой", f: "большая", n: "большое" },
  },
  {
    id: "maly",
    forms: { m: "mały", f: "mała", n: "małe" },
    ru: { m: "маленький", f: "маленькая", n: "маленькое" },
  },
  {
    id: "nowy",
    forms: { m: "nowy", f: "nowa", n: "nowe" },
    ru: { m: "новый", f: "новая", n: "новое" },
  },
  {
    id: "stary",
    forms: { m: "stary", f: "stara", n: "stare" },
    ru: { m: "старый", f: "старая", n: "старое" },
  },
  {
    id: "dobry",
    forms: { m: "dobry", f: "dobra", n: "dobre" },
    ru: { m: "хороший", f: "хорошая", n: "хорошее" },
  },
  {
    id: "spokojny",
    forms: { m: "spokojny", f: "spokojna", n: "spokojne" },
    ru: { m: "спокойный", f: "спокойная", n: "спокойное" },
  },
  {
    id: "szybki",
    forms: { m: "szybki", f: "szybka", n: "szybkie" },
    ru: { m: "быстрый", f: "быстрая", n: "быстрое" },
  },
  {
    id: "wolny",
    forms: { m: "wolny", f: "wolna", n: "wolne" },
    ru: { m: "медленный", f: "медленная", n: "медленное" },
  },
  {
    id: "wazny",
    forms: { m: "ważny", f: "ważna", n: "ważne" },
    ru: { m: "важный", f: "важная", n: "важное" },
  },
  {
    id: "ciekawy",
    forms: { m: "ciekawy", f: "ciekawa", n: "ciekawe" },
    ru: { m: "интересный", f: "интересная", n: "интересное" },
  },
  {
    id: "tani",
    forms: { m: "tani", f: "tania", n: "tanie" },
    ru: { m: "дешевый", f: "дешевая", n: "дешевое" },
  },
  {
    id: "drogi",
    forms: { m: "drogi", f: "droga", n: "drogie" },
    ru: { m: "дорогой", f: "дорогая", n: "дорогое" },
  },
  {
    id: "praktyczny",
    forms: { m: "praktyczny", f: "praktyczna", n: "praktyczne" },
    ru: { m: "практичный", f: "практичная", n: "практичное" },
  },
  {
    id: "nowoczesny",
    forms: { m: "nowoczesny", f: "nowoczesna", n: "nowoczesne" },
    ru: { m: "современный", f: "современная", n: "современное" },
  },
  {
    id: "ulubiony",
    forms: { m: "ulubiony", f: "ulubiona", n: "ulubione" },
    ru: { m: "любимый", f: "любимая", n: "любимое" },
  },
];

const SEED_WORDS = [
  ["a1-dom", "dom", "дом", "Быт", "A1", "m"],
  ["a1-kawa", "kawa", "кофе", "Кафе", "A1", "f"],
  ["a1-herbata", "herbata", "чай", "Кафе", "A1", "f"],
  ["a1-sklep", "sklep", "магазин", "Покупки", "A1", "m"],
  ["a1-cena", "cena", "цена", "Покупки", "A1", "f"],
  ["a1-autobus", "autobus", "автобус", "Город", "A1", "m"],
  ["a1-szkola", "szkoła", "школа", "Быт", "A1", "f"],
  ["a1-dzien", "dzień", "день", "Время", "A1", "m"],
  ["a1-rodzina", "rodzina", "семья", "Быт", "A1", "f"],
  ["a1-przyjaciel", "przyjaciel", "друг", "Знакомство", "A1", "m"],
  ["a1-ulica", "ulica", "улица", "Город", "A1", "f"],
  ["a1-bilet", "bilet", "билет", "Город", "A1", "m"],
  ["a1-chleb", "chleb", "хлеб", "Покупки", "A1", "m"],
  ["a1-woda", "woda", "вода", "Кафе", "A1", "f"],
  ["a1-praca", "praca", "работа", "Быт", "A1", "f"],

  ["a2-podroz", "podróż", "путешествие", "Путешествия", "A2", "f"],
  ["a2-lotnisko", "lotnisko", "аэропорт", "Путешествия", "A2", "n"],
  ["a2-rezerwacja", "rezerwacja", "бронь", "Путешествия", "A2", "f"],
  ["a2-spotkanie", "spotkanie", "встреча", "Работа и учеба", "A2", "n"],
  ["a2-zadanie", "zadanie", "задание", "Работа и учеба", "A2", "n"],
  ["a2-wiadomosc", "wiadomość", "сообщение", "Общение", "A2", "f"],
  ["a2-kuchnia", "kuchnia", "кухня", "Быт", "A2", "f"],
  ["a2-pogoda", "pogoda", "погода", "Путешествия", "A2", "f"],
  ["a2-rower", "rower", "велосипед", "Город", "A2", "m"],
  ["a2-walizka", "walizka", "чемодан", "Путешествия", "A2", "f"],
  ["a2-mapa", "mapa", "карта", "Путешествия", "A2", "f"],
  ["a2-sasiad", "sąsiad", "сосед", "Знакомство", "A2", "m"],
  ["a2-kino", "kino", "кино", "Город", "A2", "n"],
  ["a2-restauracja", "restauracja", "ресторан", "Кафе", "A2", "f"],
  ["a2-telefon", "telefon", "телефон", "Общение", "A2", "m"],

  ["b1-zdrowie", "zdrowie", "здоровье", "Здоровье", "B1", "n"],
  ["b1-energia", "energia", "энергия", "Здоровье", "B1", "f"],
  ["b1-rozmowa", "rozmowa", "разговор", "Общение", "B1", "f"],
  ["b1-decyzja", "decyzja", "решение", "Работа и учеба", "B1", "f"],
  ["b1-doswiadczenie", "doświadczenie", "опыт", "Работа и учеба", "B1", "n"],
  ["b1-kultura", "kultura", "культура", "Общение", "B1", "f"],
  ["b1-projekt", "projekt", "проект", "Работа и учеба", "B1", "m"],
  ["b1-raport", "raport", "отчет", "Работа и учеба", "B1", "m"],
  ["b1-klient", "klient", "клиент", "Работа и учеба", "B1", "m"],
  ["b1-odpoczynek", "odpoczynek", "отдых", "Здоровье", "B1", "m"],
  ["b1-problem", "problem", "проблема", "Общение", "B1", "m"],
  ["b1-rozwiazanie", "rozwiązanie", "решение", "Работа и учеба", "B1", "n"],
  ["b1-kurs", "kurs", "курс", "Работа и учеба", "B1", "m"],
  ["b1-badanie", "badanie", "обследование", "Здоровье", "B1", "n"],
  ["b1-wyklad", "wykład", "лекция", "Работа и учеба", "B1", "m"],

  ["b2-strategia", "strategia", "стратегия", "Работа и учеба", "B2", "f"],
  ["b2-analiza", "analiza", "анализ", "Работа и учеба", "B2", "f"],
  ["b2-rozwoj", "rozwój", "развитие", "Работа и учеба", "B2", "m"],
  ["b2-skutecznosc", "skuteczność", "эффективность", "Работа и учеба", "B2", "f"],
  ["b2-wspolpraca", "współpraca", "сотрудничество", "Общение", "B2", "f"],
  ["b2-organizacja", "organizacja", "организация", "Работа и учеба", "B2", "f"],
  ["b2-jakosc", "jakość", "качество", "Работа и учеба", "B2", "f"],
  ["b2-perspektywa", "perspektywa", "перспектива", "Общение", "B2", "f"],
  ["b2-proces", "proces", "процесс", "Работа и учеба", "B2", "m"],
  ["b2-wartosc", "wartość", "ценность", "Общение", "B2", "f"],
  ["b2-odpowiedzialnosc", "odpowiedzialność", "ответственность", "Работа и учеба", "B2", "f"],
  ["b2-komunikacja", "komunikacja", "коммуникация", "Общение", "B2", "f"],
  ["b2-elastycznosc", "elastyczność", "гибкость", "Работа и учеба", "B2", "f"],
  ["b2-narzedzie", "narzędzie", "инструмент", "Работа и учеба", "B2", "n"],
  ["b2-priorytet", "priorytet", "приоритет", "Работа и учеба", "B2", "m"],

  ["c1-niezaleznosc", "niezależność", "независимость", "Общение", "C1", "f"],
  ["c1-precyzja", "precyzja", "точность", "Работа и учеба", "C1", "f"],
  ["c1-wiarygodnosc", "wiarygodność", "достоверность", "Работа и учеба", "C1", "f"],
  ["c1-zlozonosc", "złożoność", "сложность", "Работа и учеба", "C1", "f"],
  ["c1-metodologia", "metodologia", "методология", "Работа и учеба", "C1", "f"],
  ["c1-przywodztwo", "przywództwo", "лидерство", "Работа и учеба", "C1", "n"],
  ["c1-konsekwencja", "konsekwencja", "последовательность", "Общение", "C1", "f"],
  ["c1-stabilnosc", "stabilność", "стабильность", "Работа и учеба", "C1", "f"],
  ["c1-narracja", "narracja", "повествование", "Общение", "C1", "f"],
  ["c1-interpretacja", "interpretacja", "интерпретация", "Общение", "C1", "f"],
  ["c1-innowacja", "innowacja", "инновация", "Работа и учеба", "C1", "f"],
  ["c1-transformacja", "transformacja", "трансформация", "Работа и учеба", "C1", "f"],
  ["c1-autonomia", "autonomia", "автономия", "Работа и учеба", "C1", "f"],
  ["c1-odpornosć", "odporność", "устойчивость", "Здоровье", "C1", "f"],
  ["c1-reputacja", "reputacja", "репутация", "Общение", "C1", "f"],
];

const EXPRESSION_TEMPLATES = [
  {
    id: "plan",
    buildPolish: (word) => `plan na ${word.polish}`,
    buildRussian: (word) => `план на ${word.russian}`,
    example: (phrase) => `To jest ${phrase}.`,
  },
  {
    id: "kurs",
    buildPolish: (word) => `kurs o temacie: ${word.polish}`,
    buildRussian: (word) => `курс на тему: ${word.russian}`,
    example: (phrase) => `Dzisiaj mamy ${phrase}.`,
  },
  {
    id: "rozmowa",
    buildPolish: (word) => `rozmowa o temacie: ${word.polish}`,
    buildRussian: (word) => `разговор на тему: ${word.russian}`,
    example: (phrase) => `To jest ${phrase}.`,
  },
  {
    id: "cwiczenie",
    buildPolish: (word) => `ćwiczenie ze słowem: ${word.polish}`,
    buildRussian: (word) => `упражнение со словом: ${word.russian}`,
    example: (phrase) => `Robimy ${phrase}.`,
  },
  {
    id: "notatka",
    buildPolish: (word) => `notatka o słowie: ${word.polish}`,
    buildRussian: (word) => `заметка о слове: ${word.russian}`,
    example: (phrase) => `Mam ${phrase}.`,
  },
];

function baseEntry([id, polish, russian, topic, level, gender]) {
  return {
    id,
    polish,
    russian,
    topic,
    level,
    gender,
    example: `To jest ${polish}.`,
  };
}

function modifierEntry(word, modifier) {
  const polish = `${modifier.forms[word.gender]} ${word.polish}`;
  const russian = `${modifier.ru[word.gender]} ${word.russian}`;

  return {
    id: `${word.id}-${modifier.id}`,
    polish,
    russian,
    topic: word.topic,
    level: word.level,
    gender: word.gender,
    example: `To jest ${polish}.`,
  };
}

function expressionEntry(word, template) {
  const polish = template.buildPolish(word);
  const russian = template.buildRussian(word);

  return {
    id: `${word.id}-${template.id}`,
    polish,
    russian,
    topic: word.topic,
    level: word.level,
    gender: word.gender,
    example: template.example(polish),
  };
}

const baseWords = SEED_WORDS.map(baseEntry);
const modifierWords = baseWords.flatMap((word) =>
  MODIFIERS.map((modifier) => modifierEntry(word, modifier)),
);
const expressionWords = baseWords.flatMap((word) =>
  EXPRESSION_TEMPLATES.map((template) => expressionEntry(word, template)),
);

export const WORDS = [...baseWords, ...modifierWords, ...expressionWords];
