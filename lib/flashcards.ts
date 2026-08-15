import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  language: string;
  dueAt: string;
  intervalDays: number;
  ease: number;
  repetitions: number;
  createdAt: string;
};

export type FlashcardReview = { cardId: string; rating: ReviewRating; reviewedAt: string };

const FLASHCARDS_KEY = "noum-list.flashcards.v1";
const FLASHCARD_REVIEWS_KEY = "noum-list.flashcard-reviews.v1";

function dateAtStart(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function addDays(date: Date | string, amount: number) {
  const next = dateAtStart(date);
  next.setDate(next.getDate() + amount);
  return next.toISOString();
}

export function scheduleReview(card: Flashcard, rating: ReviewRating, reviewedAt = new Date()): Flashcard {
  const baseInterval = Math.max(1, card.intervalDays);
  const calculations: Record<ReviewRating, { days: number; ease: number }> = {
    again: { days: 1, ease: Math.max(1.3, card.ease - 0.2) },
    hard: { days: Math.max(1, Math.round(baseInterval * 1.2)), ease: Math.max(1.3, card.ease - 0.15) },
    good: { days: card.repetitions === 0 ? 1 : card.repetitions === 1 ? 3 : Math.max(3, Math.round(baseInterval * card.ease)), ease: card.ease },
    easy: { days: card.repetitions === 0 ? 4 : Math.max(4, Math.round(baseInterval * card.ease * 1.3)), ease: Math.min(3.2, card.ease + 0.15) },
  };
  const next = calculations[rating];
  return { ...card, dueAt: addDays(reviewedAt, next.days), intervalDays: next.days, ease: next.ease, repetitions: rating === "again" ? 0 : card.repetitions + 1 };
}

export function getDueCards(cards: Flashcard[], referenceDate = new Date()) {
  const today = dateAtStart(referenceDate).getTime();
  return cards.filter((card) => dateAtStart(card.dueAt).getTime() <= today).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export async function loadFlashcards(): Promise<Flashcard[]> {
  const raw = await AsyncStorage.getItem(FLASHCARDS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as Flashcard[]; } catch { return []; }
}

async function saveFlashcards(cards: Flashcard[]) {
  await AsyncStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
}

export async function createFlashcard(input: Pick<Flashcard, "front" | "back" | "language">) {
  const now = new Date().toISOString();
  const card: Flashcard = { id: `card-${Date.now().toString(36)}`, front: input.front.trim(), back: input.back.trim(), language: input.language, dueAt: now, intervalDays: 0, ease: 2.3, repetitions: 0, createdAt: now };
  const cards = await loadFlashcards();
  await saveFlashcards([card, ...cards]);
  return card;
}

export async function reviewFlashcard(id: string, rating: ReviewRating, reviewedAt = new Date()) {
  const cards = await loadFlashcards();
  const updated = cards.map((card) => card.id === id ? scheduleReview(card, rating, reviewedAt) : card);
  await saveFlashcards(updated);
  const reviews = await loadFlashcardReviews();
  await AsyncStorage.setItem(FLASHCARD_REVIEWS_KEY, JSON.stringify([{ cardId: id, rating, reviewedAt: reviewedAt.toISOString() }, ...reviews].slice(0, 500)));
  return updated;
}

export async function loadFlashcardReviews(): Promise<FlashcardReview[]> {
  const raw = await AsyncStorage.getItem(FLASHCARD_REVIEWS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as FlashcardReview[]; } catch { return []; }
}

export function getWeeklyReviewCount(reviews: FlashcardReview[], referenceDate = new Date()) {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 6);
  return reviews.filter((review) => new Date(review.reviewedAt).getTime() >= start.getTime()).length;
}
