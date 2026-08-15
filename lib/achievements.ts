export type Achievement = { id: string; title: string; description: string; icon: string; unlocked: boolean };

export function getAchievements(input: { xp: number; focusMinutes: number; reviewCount: number; streak: number }): Achievement[] {
  return [
    { id: "first-step", title: "البداية", description: "اكسب 25 XP", icon: "flag-checkered", unlocked: input.xp >= 25 },
    { id: "focus-hour", title: "ساعة تركيز", description: "أكمل 60 دقيقة تركيز", icon: "timer-outline", unlocked: input.focusMinutes >= 60 },
    { id: "memory-builder", title: "باني الذاكرة", description: "أكمل 20 مراجعة", icon: "cards-outline", unlocked: input.reviewCount >= 20 },
    { id: "streak-seven", title: "ثابت", description: "حافظ على 7 أيام متتالية", icon: "fire", unlocked: input.streak >= 7 },
  ];
}
