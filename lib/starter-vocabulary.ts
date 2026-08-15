import { createFlashcard, loadFlashcards, type Flashcard } from "@/lib/flashcards";

export type StarterWord = { front: string; back: string };

export const starterVocabulary: Record<string, StarterWord[]> = {
  English: [
    { front: "hello", back: "مرحبًا" }, { front: "thank you", back: "شكرًا لك" }, { front: "please", back: "من فضلك" }, { front: "water", back: "ماء" }, { front: "today", back: "اليوم" }, { front: "learn", back: "يتعلّم" }, { front: "friend", back: "صديق" }, { front: "good morning", back: "صباح الخير" },
  ],
  Spanish: [
    { front: "hola", back: "مرحبًا" }, { front: "gracias", back: "شكرًا" }, { front: "por favor", back: "من فضلك" }, { front: "agua", back: "ماء" }, { front: "hoy", back: "اليوم" }, { front: "amigo", back: "صديق" },
  ],
  Turkish: [
    { front: "merhaba", back: "مرحبًا" }, { front: "teşekkürler", back: "شكرًا" }, { front: "lütfen", back: "من فضلك" }, { front: "su", back: "ماء" }, { front: "bugün", back: "اليوم" }, { front: "arkadaş", back: "صديق" },
  ],
  German: [
    { front: "hallo", back: "مرحبًا" }, { front: "danke", back: "شكرًا" }, { front: "bitte", back: "من فضلك" }, { front: "wasser", back: "ماء" }, { front: "heute", back: "اليوم" }, { front: "freund", back: "صديق" },
  ],
};

export async function importStarterVocabulary(language: string) {
  const words = starterVocabulary[language] ?? [];
  const existing = await loadFlashcards();
  const existingKeys = new Set(existing.filter((card) => card.language === language).map((card) => card.front.toLocaleLowerCase()));
  const additions = words.filter((word) => !existingKeys.has(word.front.toLocaleLowerCase()));
  for (const word of additions) await createFlashcard({ ...word, language });
  return additions.length;
}
