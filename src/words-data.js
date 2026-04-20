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

const BASE_EXAMPLES = {
  "a1-dom": "Ten dom stoi blisko parku.",
  "a1-kawa": "Rano piję kawę bez cukru.",
  "a1-herbata": "Wieczorem często robię herbatę z cytryną.",
  "a1-sklep": "Ten sklep jest otwarty do dziewiątej.",
  "a1-cena": "Cena tego biletu jest całkiem dobra.",
  "a1-autobus": "Ten autobus jedzie prosto do centrum.",
  "a1-szkola": "Moja szkoła zaczyna zajęcia o ósmej.",
  "a1-dzien": "Dziś mam bardzo dobry dzień.",
  "a1-rodzina": "Moja rodzina lubi wspólne kolacje.",
  "a1-przyjaciel": "Mój przyjaciel mieszka niedaleko mnie.",
  "a1-ulica": "Ta ulica jest spokojna wieczorem.",
  "a1-bilet": "Mam już bilet na jutrzejszy pociąg.",
  "a1-chleb": "Świeży chleb pachnie bardzo dobrze.",
  "a1-woda": "Zawsze mam przy sobie butelkę wody.",
  "a1-praca": "Moja praca daje mi dużo doświadczenia.",

  "a2-podroz": "Ta podróż była spokojna i dobrze zaplanowana.",
  "a2-lotnisko": "Na lotnisko jedziemy bardzo wcześnie rano.",
  "a2-rezerwacja": "Moja rezerwacja jest już potwierdzona.",
  "a2-spotkanie": "To spotkanie zaczyna się za dziesięć minut.",
  "a2-zadanie": "To zadanie wymaga trochę cierpliwości.",
  "a2-wiadomosc": "Dostałem ważną wiadomość od nauczyciela.",
  "a2-kuchnia": "Ta kuchnia jest jasna i bardzo wygodna.",
  "a2-pogoda": "Dzisiaj pogoda sprzyja spacerom.",
  "a2-rower": "Mój rower stoi przed domem.",
  "a2-walizka": "Ta walizka jest gotowa na wyjazd.",
  "a2-mapa": "Mapa pomaga nam szybko znaleźć drogę.",
  "a2-sasiad": "Mój sąsiad zawsze mówi mi dzień dobry.",
  "a2-kino": "To kino pokazuje dziś ciekawy film.",
  "a2-restauracja": "Ta restauracja serwuje dobre obiady.",
  "a2-telefon": "Mój telefon jest dziś prawie rozładowany.",

  "b1-zdrowie": "Zdrowie jest dla mnie naprawdę ważne.",
  "b1-energia": "Po urlopie mam więcej energii do pracy.",
  "b1-rozmowa": "Ta rozmowa wiele mi wyjaśniła.",
  "b1-decyzja": "To była trudna, ale dobra decyzja.",
  "b1-doswiadczenie": "To doświadczenie dużo mnie nauczyło.",
  "b1-kultura": "Kultura pracy w tym zespole jest bardzo dobra.",
  "b1-projekt": "Nasz projekt wchodzi teraz w ważny etap.",
  "b1-raport": "Raport jest już gotowy do wysłania.",
  "b1-klient": "Ten klient zadał bardzo konkretne pytania.",
  "b1-odpoczynek": "Po pracy potrzebuję chwili odpoczynku.",
  "b1-problem": "Ten problem da się spokojnie rozwiązać.",
  "b1-rozwiazanie": "To rozwiązanie wygląda najbardziej praktycznie.",
  "b1-kurs": "Ten kurs pomaga mi mówić pewniej po polsku.",
  "b1-badanie": "Badanie trwało krócej, niż myślałem.",
  "b1-wyklad": "Wykład był ciekawy i dobrze przygotowany.",

  "b2-strategia": "Nasza strategia musi być jasna dla całego zespołu.",
  "b2-analiza": "Ta analiza pokazuje główne przyczyny problemu.",
  "b2-rozwoj": "Rozwój firmy zależy od dobrych decyzji.",
  "b2-skutecznosc": "Skuteczność tej metody naprawdę mnie zaskoczyła.",
  "b2-wspolpraca": "Dobra współpraca skraca czas realizacji projektu.",
  "b2-organizacja": "Organizacja pracy w tym miesiącu jest lepsza.",
  "b2-jakosc": "Jakość tej usługi jest coraz wyższa.",
  "b2-perspektywa": "Ta perspektywa pomaga inaczej spojrzeć na problem.",
  "b2-proces": "Proces wdrożenia trwa dłużej niż planowaliśmy.",
  "b2-wartosc": "Ta wartość jest ważna dla całego zespołu.",
  "b2-odpowiedzialnosc": "Odpowiedzialność za wynik spoczywa na całej grupie.",
  "b2-komunikacja": "Dobra komunikacja zmniejsza liczbę błędów.",
  "b2-elastycznosc": "Elastyczność bardzo przydaje się w codziennej pracy.",
  "b2-narzedzie": "To narzędzie oszczędza nam sporo czasu.",
  "b2-priorytet": "Naszym priorytetem jest teraz jakość.",

  "c1-niezaleznosc": "Niezależność finansowa daje ludziom większy spokój.",
  "c1-precyzja": "Precyzja w języku ułatwia dobrą komunikację.",
  "c1-wiarygodnosc": "Wiarygodność źródła ma tu kluczowe znaczenie.",
  "c1-zlozonosc": "Złożoność tego tematu wymaga spokojnej analizy.",
  "c1-metodologia": "Metodologia badania została dobrze opisana.",
  "c1-przywodztwo": "Dobre przywództwo buduje zaufanie w zespole.",
  "c1-konsekwencja": "Konsekwencja pomaga osiągać długofalowe cele.",
  "c1-stabilnosc": "Stabilność systemu jest dziś najważniejsza.",
  "c1-narracja": "Narracja autora zmienia odbiór całego tekstu.",
  "c1-interpretacja": "Twoja interpretacja jest bardzo przekonująca.",
  "c1-innowacja": "Ta innowacja może zmienić sposób pracy firmy.",
  "c1-transformacja": "Transformacja cyfrowa trwa dłużej niż zakładano.",
  "c1-autonomia": "Autonomia zespołu zwiększa jego odpowiedzialność.",
  "c1-odpornosć": "Odporność psychiczna pomaga w trudnych momentach.",
  "c1-reputacja": "Dobra reputacja buduje się latami.",
};

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
    example: BASE_EXAMPLES[id] ?? `To jest ${polish}.`,
  };
}

function hashText(value) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function pickExampleVariant(key, variants) {
  return variants[hashText(key) % variants.length];
}

function modifierEntry(word, modifier) {
  const polish = `${modifier.forms[word.gender]} ${word.polish}`;
  const russian = `${modifier.ru[word.gender]} ${word.russian}`;
  const example = pickExampleVariant(`${word.id}-${modifier.id}`, [
    `Myślę, że ${polish} to bardzo dobry wybór.`,
    `W tym tygodniu ${polish} naprawdę zwraca moją uwagę.`,
    `Coraz częściej słyszę wyrażenie: ${polish}.`,
  ]);

  return {
    id: `${word.id}-${modifier.id}`,
    polish,
    russian,
    topic: word.topic,
    level: word.level,
    gender: word.gender,
    example,
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
