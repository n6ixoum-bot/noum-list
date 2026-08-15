import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export type FocusTrack = { id: string; name: string; uri: string };
const TRACKS_KEY = "noum-list.focus-tracks.v1";

export async function loadFocusTracks(): Promise<FocusTrack[]> {
  const raw = await AsyncStorage.getItem(TRACKS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) as FocusTrack[]; } catch { return []; }
}

export async function importFocusTrack() {
  const result = await DocumentPicker.getDocumentAsync({ type: "audio/*", copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const id = `sound-${Date.now().toString(36)}`;
  let uri = asset.uri;
  if (Platform.OS !== "web") {
    const directory = `${FileSystem.documentDirectory}noum-focus/`;
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    uri = `${directory}${id}-${asset.name.replace(/[^\p{L}\p{N}._-]/gu, "_")}`;
    await FileSystem.copyAsync({ from: asset.uri, to: uri });
  }
  const track = { id, name: asset.name, uri };
  const tracks = await loadFocusTracks();
  await AsyncStorage.setItem(TRACKS_KEY, JSON.stringify([track, ...tracks]));
  return track;
}
