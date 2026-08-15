export type BookProgressInput = { totalPages: number | null; currentPage: number };

export function getBookProgress(book: BookProgressInput) {
  if (!book.totalPages || book.totalPages <= 0) return 0;
  return Math.round(Math.min(100, (book.currentPage / book.totalPages) * 100));
}

export function bookCoverLetters(title: string) {
  return title.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "PDF";
}
