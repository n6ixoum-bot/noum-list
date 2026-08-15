import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export type BookQuestion = {
  question: string;
  hint: string;
};

export type LocalBook = {
  id: string;
  title: string;
  fileName: string;
  uri: string;
  size: number | null;
  totalPages: number | null;
  currentPage: number;
  addedAt: string;
  analysisSource: string;
  questions: BookQuestion[];
  readingNote: string;
};

const BOOKS_KEY = "noum-list.local-books.v1";

export async function loadBooks(): Promise<LocalBook[]> {
  const raw = await AsyncStorage.getItem(BOOKS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as LocalBook[]; } catch { return []; }
}

async function saveBooks(books: LocalBook[]) {
  await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

function cleanFileName(name: string) {
  return name.replace(/[^\p{L}\p{N}._-]/gu, "_").slice(0, 90) || "book.pdf";
}

async function persistPdf(asset: DocumentPicker.DocumentPickerAsset, id: string) {
  if (Platform.OS === "web") return asset.uri;
  const directory = `${FileSystem.documentDirectory}noum-books/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const destination = `${directory}${id}-${cleanFileName(asset.name)}`;
  await FileSystem.copyAsync({ from: asset.uri, to: destination });
  return destination;
}

export async function importPdfBook() {
  const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const id = `book-${Date.now().toString(36)}`;
  const uri = await persistPdf(asset, id);
  const title = asset.name.replace(/\.pdf$/i, "").trim() || "كتاب بدون عنوان";
  const book: LocalBook = {
    id,
    title,
    fileName: asset.name,
    uri,
    size: asset.size ?? null,
    totalPages: null,
    currentPage: 0,
    addedAt: new Date().toISOString(),
    analysisSource: "",
    questions: [],
    readingNote: "",
  };
  const books = await loadBooks();
  await saveBooks([book, ...books]);
  return book;
}

export async function updateBook(id: string, patch: Partial<LocalBook>) {
  const books = await loadBooks();
  const next = books.map((book) => book.id === id ? { ...book, ...patch } : book);
  await saveBooks(next);
  return next.find((book) => book.id === id) ?? null;
}

export { bookCoverLetters, getBookProgress } from "./book-utils";
