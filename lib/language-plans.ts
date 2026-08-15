export type LanguageKey = "English" | "Spanish" | "Turkish" | "German";

export type LanguagePlan = {
  language: LanguageKey;
  title: string;
  weeks: Array<{ title: string; focus: string; tasks: string[] }>;
};

const genericWeeks = (language: string) => [
  { title: "الأسبوع 1: الصوت والأساس", focus: "ابنِ نطقًا صحيحًا وعبارات للبداية.", tasks: [`تعلّم 20 صوتًا أو حرفًا أساسيًا في ${language}`, "احفظ 15 تحية وعبارة يومية", "كرر 10 دقائق بصوت مرتفع"] },
  { title: "الأسبوع 2: كلمات الحياة", focus: "اربط الكلمات بمواقف فعلية.", tasks: ["احفظ 40 كلمة شائعة", "كوّن 10 جمل عن نفسك", "استمع إلى مقطع قصير للمبتدئين"] },
  { title: "الأسبوع 3: محادثة قصيرة", focus: "تدرّب على الاستجابة بدل الحفظ فقط.", tasks: ["تدرّب على سؤال وجواب من 5 أسطر", "سجّل صوتك لمدة دقيقة", "راجع الكلمات الصعبة"] },
  { title: "الأسبوع 4: تثبيت العادة", focus: "استمر يوميًا وطبّق في محتوى بسيط.", tasks: ["اكتب يوميات من 3 جمل", "شاهد مقطعًا مع ترجمة", "اختبر نفسك في 60 كلمة"] },
];

export function getLanguagePlan(language: LanguageKey): LanguagePlan {
  return { language, title: `خطة ${language} من الصفر`, weeks: genericWeeks(language) };
}
