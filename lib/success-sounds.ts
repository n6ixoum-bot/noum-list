import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import { Platform } from "react-native";

export const SUCCESS_SOUND_KEY = "noum-list.success-sounds.v1";
export const successSoundUri = require("@/assets/audio/noum-success-chime.mp3");

export async function loadSuccessSoundEnabled() {
  const stored = await AsyncStorage.getItem(SUCCESS_SOUND_KEY);
  return stored !== "false";
}

export async function setSuccessSoundEnabled(enabled: boolean) {
  await AsyncStorage.setItem(SUCCESS_SOUND_KEY, String(enabled));
  return enabled;
}

export async function playSuccessSound() {
  if (Platform.OS === "web" || !(await loadSuccessSoundEnabled())) return false;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    const player = createAudioPlayer(successSoundUri);
    player.play();
    setTimeout(() => player.remove(), 3500);
    return true;
  } catch {
    return false;
  }
}
