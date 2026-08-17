import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Coffee,
  Download,
  Flame,
  Focus,
  FolderKanban,
  GraduationCap,
  Keyboard,
  Languages,
  LayoutDashboard,
  ListChecks,
  Menu,
  Moon,
  Music2,
  NotebookPen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  TimerReset,
  Trophy,
  Upload,
  Volume2,
  WifiOff,
  X,
} from "lucide-react";
import { BrandMark, CompletionBox, EmptyState, IconButton, MoreButton, Panel, ProgressBar, ProgressRing } from "./components/ui";
import { BackupPanel } from "./components/backup-panel";
import { downloadBackup, makeCloudBackup, parseCloudBackup, readBackupFile, type BackupEnvelope } from "./lib/noum-backup";
import { loadNoumState, resetNoumState, saveNoumState } from "./lib/noum-store";
import { createFocusSession } from "./lib/focus-sessions";
import { getRemoteSnapshot, getSyncStatus, startSyncLogin, uploadSnapshot, type RemoteSnapshot, type SyncUser } from "./lib/sync-client";
import type { Locale, NoumState, Task, TaskPriority, ViewId } from "./types";

const navigation: { id: ViewId; ar: string; en: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", ar: "نظرة عامة", en: "Overview", icon: LayoutDashboard },
  { id: "paths", ar: "المسارات", en: "Learning paths", icon: FolderKanban },
  { id: "brain", ar: "العقل الثاني", en: "Second brain", icon: BrainCircuit },
  { id: "learning", ar: "التعلّم", en: "Learning", icon: Languages },
  { id: "library", ar: "المكتبة", en: "Library", icon: BookOpen },
  { id: "focus", ar: "التركيز", en: "Focus", icon: Focus },
  { id: "stats", ar: "الإحصاءات", en: "Insights", icon: Trophy },
  { id: "settings", ar: "الإعدادات", en: "Settings", icon: Settings2 },
];

const localeCopy = {
  ar: {
    greeting: "مساء هادئ،",
    user: "مستخدم Noum",
    subtitle: "لديك مساحة مركزة اليوم. لنرتّب أهم خطوة تالية.",
    quickCapture: "التقاط سريع",
    newPath: "مسار جديد",
    todayPlan: "خطة اليوم",
    todayPlanSub: "مهام صغيرة، أثر واضح",
    viewAll: "عرض الكل",
    focus: "تركيز",
    activePaths: "مسارات نشطة",
    completion: "معدل الإنجاز",
    streak: "سلسلة الإنجاز",
    paths: "مساراتك",
    current: "قيد التقدم",
    continue: "متابعة",
    review: "المراجعة اليوم",
    dueCards: "بطاقات مستحقة",
    knowledge: "من العقل الثاني",
    knowledgeSub: "فكرة صغيرة تستحق العودة إليها",
    addTask: "أضف مهمة جديدة",
    taskPlaceholder: "اكتب أصغر خطوة تقدر تبدأ بها…",
    save: "حفظ",
    close: "إغلاق",
    completed: "تم",
    minutes: "دقيقة",
    allDone: "كل المهام مكتملة. أحسنت!",
    insight: "التقدم الهادئ يتراكم.",
    focusNow: "ابدأ جلسة تركيز",
    today: "اليوم",
    tomorrow: "غدًا",
    high: "مهم",
    medium: "متوسط",
    low: "خفيف",
    noPaths: "ليس لديك مسارات بعد",
    createPath: "أنشئ مسارك الأول",
    pathName: "اسم المسار",
    pathDesc: "ما النتيجة التي تريد الوصول إليها؟",
    create: "إنشاء المسار",
    cancel: "إلغاء",
    notes: "ملاحظاتك",
    newNote: "ملاحظة جديدة",
    newNoteTitle: "عنوان الملاحظة",
    newNoteBody: "اكتب فكرتك باستخدام Markdown…",
    saveNote: "حفظ الملاحظة",
    linked: "مرتبط بـ",
    cards: "بطاقات اليوم",
    showAnswer: "أظهر الإجابة",
    again: "مرة أخرى",
    good: "جيد",
    easy: "سهل",
    addCard: "بطاقة جديدة",
    books: "مكتبة القراءة",
    importBook: "إضافة كتاب PDF",
    continueReading: "تابع القراءة",
    question: "سؤال للمراجعة",
    focusRoom: "غرفة التركيز",
    focusSubtitle: "جلسة بلا تشتت، بخطوة واحدة واضحة.",
    start: "ابدأ الجلسة",
    pause: "إيقاف مؤقت",
    reset: "إعادة",
    sound: "صوت نجاح هادئ",
    focusComplete: "اكتملت جلسة التركيز — +30 XP",
    weekly: "إيقاعك هذا الأسبوع",
    completedTasks: "مهام مكتملة",
    focusHours: "ساعات تركيز",
    reviewAccuracy: "تذكّر البطاقات",
    settings: "تفضيلات مساحة العمل",
    language: "لغة الواجهة",
    arabic: "العربية",
    english: "English",
    resetData: "إعادة بيانات العرض",
    resetDescription: "يعيد بيانات المثال الافتراضية فقط على هذا المتصفح.",
    resetConfirm: "تمت إعادة البيانات المحلية.",
    saved: "تم الحفظ محليًا",
    pathCreated: "تم إنشاء المسار. ابدأ بخطوة صغيرة.",
    taskDone: "أحسنت — تقدّمت خطوة.",
    reviewDone: "ممتاز، تم تحديث موعد المراجعة.",
    bookUpdated: "تم حفظ تقدم القراءة.",
    mobileMenu: "فتح القائمة",
    command: "البحث أو تنفيذ أمر",
    androidApp: "تطبيق أندرويد",
    androidAppDescription: "نسخة أندرويد محلية من Noum List تعمل من دون شبكة بعد التثبيت.",
    buildApk: "إنشاء APK",
    apkHint: "مشروع أندرويد جاهز. استخدم زر Publish لإنشاء ملف APK قابل للتنزيل.",
  },
  en: {
    greeting: "A calm evening,",
    user: "Noum user",
    subtitle: "You have a focused space today. Let’s shape the next important step.",
    quickCapture: "Quick capture",
    newPath: "New path",
    todayPlan: "Today’s plan",
    todayPlanSub: "Small tasks, meaningful progress",
    viewAll: "View all",
    focus: "Focus",
    activePaths: "Active paths",
    completion: "Completion rate",
    streak: "Learning streak",
    paths: "Your paths",
    current: "In progress",
    continue: "Continue",
    review: "Today’s review",
    dueCards: "cards due",
    knowledge: "From your second brain",
    knowledgeSub: "A small idea worth revisiting",
    addTask: "Add a task",
    taskPlaceholder: "Write the smallest step you can start now…",
    save: "Save",
    close: "Close",
    completed: "Done",
    minutes: "min",
    allDone: "Everything is complete. Well done!",
    insight: "Quiet progress compounds.",
    focusNow: "Start focus session",
    today: "Today",
    tomorrow: "Tomorrow",
    high: "Important",
    medium: "Medium",
    low: "Light",
    noPaths: "No learning paths yet",
    createPath: "Create your first path",
    pathName: "Path name",
    pathDesc: "What outcome do you want to reach?",
    create: "Create path",
    cancel: "Cancel",
    notes: "Your notes",
    newNote: "New note",
    newNoteTitle: "Note title",
    newNoteBody: "Write your thought in Markdown…",
    saveNote: "Save note",
    linked: "Linked to",
    cards: "Today’s cards",
    showAnswer: "Show answer",
    again: "Again",
    good: "Good",
    easy: "Easy",
    addCard: "New card",
    books: "Reading library",
    importBook: "Import PDF book",
    continueReading: "Continue reading",
    question: "Review question",
    focusRoom: "Focus room",
    focusSubtitle: "One clear step, free from distractions.",
    start: "Start session",
    pause: "Pause",
    reset: "Reset",
    sound: "Soft success sound",
    focusComplete: "Focus session complete — +30 XP",
    weekly: "Your rhythm this week",
    completedTasks: "Completed tasks",
    focusHours: "Focus hours",
    reviewAccuracy: "Card recall",
    settings: "Workspace preferences",
    language: "Interface language",
    arabic: "العربية",
    english: "English",
    resetData: "Reset sample data",
    resetDescription: "Resets the default demo data in this browser only.",
    resetConfirm: "Local data has been reset.",
    saved: "Saved locally",
    pathCreated: "Path created. Start with one small step.",
    taskDone: "Nice — one step forward.",
    reviewDone: "Great, the review schedule is updated.",
    bookUpdated: "Reading progress saved.",
    mobileMenu: "Open menu",
    command: "Search or run a command",
    androidApp: "Android app",
    androidAppDescription: "A local Android edition of Noum List that works offline after installation.",
    buildApk: "Create APK",
    apkHint: "The Android project is ready. Use Publish to create a downloadable APK.",
  },
} as const;

const priorityLabel = (priority: TaskPriority, locale: Locale) => localeCopy[locale][priority];
const pathProgress = (path: NoumState["paths"][number]) => Math.round((path.completedSteps / path.steps) * 100);
const minutesToText = (minutes: number) => `${minutes.toString().padStart(2, "0")}:${"00"}`;

function App() {
  const [state, setState] = useState<NoumState>(() => loadNoumState());
  const [activeView, setActiveView] = useState<ViewId>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [showNewPath, setShowNewPath] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newPathTitle, setNewPathTitle] = useState("");
  const [newPathDescription, setNewPathDescription] = useState("");
  const [newNote, setNewNote] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [focusDuration, setFocusDuration] = useState(25);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [syncUser, setSyncUser] = useState<SyncUser | null>(null);
  const [remoteSnapshot, setRemoteSnapshot] = useState<RemoteSnapshot | null>(null);
  const [syncBusy, setSyncBusy] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<BackupEnvelope | null>(null);
  const [restoreSource, setRestoreSource] = useState<"local" | "cloud">("local");
  const [confirmCloudOverwrite, setConfirmCloudOverwrite] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState("");
  const [libraryFilter, setLibraryFilter] = useState<"all" | "active" | "finished">("all");
  const [isOnline, setIsOnline] = useState(() => typeof navigator === "undefined" || navigator.onLine);
  const pdfInput = useRef<HTMLInputElement>(null);

  const locale = state.locale;
  const copy = localeCopy[locale];
  const isArabic = locale === "ar";

  useEffect(() => {
    const timeout = window.setTimeout(() => saveNoumState(state), 120);
    return () => window.clearTimeout(timeout);
  }, [state]);
  useEffect(() => { document.documentElement.lang = locale; document.documentElement.dir = isArabic ? "rtl" : "ltr"; }, [isArabic, locale]);
  useEffect(() => {
    const markOnline = () => setIsOnline(true);
    const markOffline = () => setIsOnline(false);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    return () => {
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
    };
  }, []);
  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((remaining) => {
        if (remaining > 1) return remaining - 1;
        window.clearInterval(interval);
        setTimerRunning(false);
        setState((current) => {
          const activeFocusPath = current.paths.find((path) => pathProgress(path) < 100) ?? current.paths[0];
          const session = createFocusSession(focusDuration, activeFocusPath?.id ?? null);
          return {
            ...current,
            focusMinutes: current.focusMinutes + session.minutes,
            focusSessions: [session, ...current.focusSessions].slice(0, 30),
          };
        });
        setToast(copy.focusComplete);
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [copy.focusComplete, focusDuration, timerRunning]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3400);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setShowNewTask(true);
      }
      if (event.key === "Escape") {
        setShowNewTask(false);
        setShowNewPath(false);
        setNewNote(false);
        setPendingRestore(null);
        setConfirmCloudOverwrite(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);
  useEffect(() => {
    void refreshSyncStatus();
  }, []);

  const completedTasks = state.tasks.filter((task) => task.completed).length;
  const completionRate = state.tasks.length ? Math.round((completedTasks / state.tasks.length) * 100) : 0;
  const dueCards = state.flashcards.filter((card) => card.due);
  const currentStreak = Math.max(0, ...state.paths.map((path) => path.streak));
  const xpTotal = completedTasks * 30 + state.paths.reduce((total, path) => total + path.completedSteps * 10, 0) + state.flashcards.reduce((total, card) => total + card.reviews * 5, 0);
  const level = Math.max(1, Math.floor(xpTotal / 250) + 1);
  const levelBase = (level - 1) * 250;
  const levelProgress = Math.min(100, Math.round(((xpTotal - levelBase) / 250) * 100));
  const todayLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const activePath = state.paths.find((path) => pathProgress(path) < 100) ?? state.paths[0];
  const activeNote = state.notes.find((note) => note.id === selectedNoteId) ?? state.notes[0];
  const filteredBooks = useMemo(() => {
    const query = libraryQuery.trim().toLocaleLowerCase();
    return state.books.filter((book) => {
      const matchesQuery = !query || `${book.title} ${book.author}`.toLocaleLowerCase().includes(query);
      const matchesFilter = libraryFilter === "all" || (libraryFilter === "finished" ? book.progress >= 100 : book.progress < 100);
      return matchesQuery && matchesFilter;
    }).sort((a, b) => a.title.localeCompare(b.title));
  }, [libraryFilter, libraryQuery, state.books]);
  const focusDisplay = `${Math.floor(secondsLeft / 60).toString().padStart(2, "0")}:${(secondsLeft % 60).toString().padStart(2, "0")}`;
  const chartValues = useMemo(() => Array(7).fill(0), []);

  const notify = (message: string) => setToast(message);
  const changeView = (view: ViewId) => { setActiveView(view); setMobileOpen(false); };

  function toggleTask(taskId: string) {
    const target = state.tasks.find((task) => task.id === taskId);
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task),
    }));
    if (target && !target.completed) notify(copy.taskDone);
  }

  function addTask() {
    const title = newTaskTitle.trim();
    if (!title) return;
    const task: Task = {
      id: `task-${Date.now()}`,
      title,
      pathId: activePath?.id ?? "inbox",
      completed: false,
      due: copy.today,
      priority: "medium",
      minutes: 15,
    };
    setState((current) => ({ ...current, tasks: [task, ...current.tasks] }));
    setNewTaskTitle("");
    setShowNewTask(false);
    notify(copy.saved);
  }

  function addPath() {
    const title = newPathTitle.trim();
    if (!title) return;
    setState((current) => ({
      ...current,
      paths: [{
        id: `path-${Date.now()}`,
        title,
        description: newPathDescription.trim() || (isArabic ? "مسار شخصي منظم بخطوات قصيرة قابلة للقياس." : "A personal path shaped into small measurable steps."),
        category: isArabic ? "مسار شخصي" : "Personal path",
        color: "violet",
        steps: 12,
        completedSteps: 0,
        streak: 0,
        nextAction: isArabic ? "حدّد أول خطوة قابلة للبدء" : "Choose the first actionable step",
      }, ...current.paths],
    }));
    setNewPathTitle("");
    setNewPathDescription("");
    setShowNewPath(false);
    notify(copy.pathCreated);
  }

  function saveNote() {
    const title = newNoteTitle.trim();
    if (!title) return;
    const noteId = `note-${Date.now()}`;
    setState((current) => ({
      ...current,
      notes: [{ id: noteId, title, body: newNoteBody.trim() || "# New note", linkedPathIds: activePath ? [activePath.id] : [], updatedAt: copy.today, tags: [isArabic ? "جديد" : "New"] }, ...current.notes],
    }));
    setSelectedNoteId(noteId);
    setNewNote(false);
    setNewNoteTitle("");
    setNewNoteBody("");
    notify(copy.saved);
  }

  function reviewCard(quality: "again" | "good" | "easy") {
    const card = dueCards[0];
    if (!card) return;
    const intervalMap = { again: 1, good: Math.max(card.interval + 2, 3), easy: Math.max(card.interval + 5, 7) };
    setState((current) => ({
      ...current,
      flashcards: current.flashcards.map((item) => item.id === card.id ? { ...item, due: false, interval: intervalMap[quality], reviews: item.reviews + 1 } : item),
    }));
    setShowAnswer(false);
    notify(copy.reviewDone);
  }

  function advanceBook(bookId: string) {
    setState((current) => ({ ...current, books: current.books.map((book) => book.id === bookId ? { ...book, progress: Math.min(100, book.progress + 5) } : book) }));
    notify(copy.bookUpdated);
  }

  function importPdf(file: File) {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf || file.size > 8 * 1024 * 1024) {
      notify(isArabic ? "اختر ملف PDF صالحًا بحجم أقل من 8MB." : "Choose a valid PDF smaller than 8MB.");
      return;
    }
    const title = file.name.replace(/\.pdf$/i, "").trim() || (isArabic ? "كتاب مستورد" : "Imported book");
    setState((current) => ({
      ...current,
      books: [{ id: `book-${Date.now()}`, title, author: isArabic ? "ملف محلي" : "Local file", progress: 0, pages: 0, accent: "#48e2a3", question: isArabic ? "ما الفكرة التي تريد الاحتفاظ بها من هذا الكتاب؟" : "What idea do you want to keep from this book?" }, ...current.books],
    }));
    const objectUrl = URL.createObjectURL(file);
    window.open(objectUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    notify(isArabic ? "تمت إضافة الكتاب وفتح ملف PDF." : "The book was added and the PDF was opened.");
  }

  function resetFocus(minutes: number = 25) { setTimerRunning(false); setFocusDuration(minutes); setSecondsLeft(minutes * 60); }

  function toggleFocusTimer() {
    if (timerRunning) {
      setTimerRunning(false);
      return;
    }
    if (secondsLeft <= 0) setSecondsLeft(focusDuration * 60);
    setTimerRunning(true);
  }

  async function refreshSyncStatus() {
    try {
      const status = await getSyncStatus();
      setSyncUser(status.user);
      if (status.user) {
        const remote = await getRemoteSnapshot();
        setRemoteSnapshot(remote.snapshot);
      }
    } catch {
      setSyncUser(null);
      setRemoteSnapshot(null);
    }
  }

  function exportBackup() {
    downloadBackup(state);
    notify(isArabic ? "تم تنزيل النسخة الاحتياطية المحلية." : "Your local backup was downloaded.");
  }

  async function importBackup(file: File) {
    try {
      const backup = await readBackupFile(file);
      setRestoreSource("local");
      setPendingRestore(backup);
    } catch {
      notify(isArabic ? "تعذر قراءة الملف. اختر نسخة Noum List احتياطية صالحة." : "We could not read that file. Choose a valid Noum List backup.");
    }
  }

  function applyRestore() {
    if (!pendingRestore) return;
    setState(pendingRestore.state);
    setPendingRestore(null);
    notify(isArabic ? "تمت استعادة بياناتك محليًا." : "Your data was restored locally.");
  }

  async function uploadCloudBackup() {
    if (!syncUser) return;
    setSyncBusy(true);
    try {
      const backup = await makeCloudBackup(state);
      const saved = await uploadSnapshot(backup);
      setRemoteSnapshot({ ...backup, updatedAt: saved.updatedAt });
      notify(isArabic ? "تم حفظ نسخة مشفّرة في حسابك." : "An encrypted snapshot was saved to your account.");
    } catch (error) {
      notify(isArabic ? "تعذرت المزامنة الآن. بقيت بياناتك المحلية آمنة." : "Sync is unavailable right now. Your local data is still safe.");
      if (error instanceof Error && error.message === "UNAUTHORIZED") setSyncUser(null);
    } finally {
      setSyncBusy(false);
    }
  }

  function requestCloudBackup() {
    if (remoteSnapshot) {
      setConfirmCloudOverwrite(true);
      return;
    }
    void uploadCloudBackup();
  }

  async function restoreCloudBackup() {
    if (!remoteSnapshot) return;
    setSyncBusy(true);
    try {
      const backup = await parseCloudBackup(remoteSnapshot.payload, remoteSnapshot.checksum);
      setRestoreSource("cloud");
      setPendingRestore(backup);
    } catch {
      notify(isArabic ? "تعذر التحقق من النسخة السحابية." : "We could not verify the cloud snapshot.");
    } finally {
      setSyncBusy(false);
    }
  }

  function renderDashboard() {
    const todayTasks = state.tasks.filter((task) => task.due === copy.today || task.due === "اليوم" || task.due === "Today");
    return (
      <>
        <header className="page-header dashboard-header">
          <div>
            <p className="eyebrow"><Sparkles size={13} /> {copy.greeting}</p>
            <h1>{copy.user}</h1>
            <p className="page-subtitle">{copy.subtitle}</p>
          </div>
          <div className="header-actions">
            <button className="ghost-button" onClick={() => setShowNewTask(true)} type="button"><ClipboardCheck size={17} /> {copy.quickCapture}</button>
            <button className="primary-button" onClick={() => setShowNewPath(true)} type="button"><Plus size={18} /> {copy.newPath}</button>
          </div>
        </header>

        <section className="metric-grid" aria-label={copy.insight}>
          <MetricCard icon={<ListChecks size={20} />} value={`${completedTasks}/${state.tasks.length}`} label={copy.completedTasks} detail={isArabic ? "خطوات منجزة اليوم" : "steps completed today"} tone="mint" />
          <MetricCard icon={<Focus size={20} />} value={`${Math.floor(state.focusMinutes / 60)}.${Math.round((state.focusMinutes % 60) / 6)}`} label={copy.focusHours} detail={isArabic ? "هذا الأسبوع" : "this week"} tone="blue" />
          <MetricCard icon={<Flame size={20} />} value={`${currentStreak}`} label={copy.streak} detail={isArabic ? "أيام متتالية" : "days in a row"} tone="amber" />
          <MetricCard icon={<BrainCircuit size={20} />} value={`${dueCards.length}`} label={copy.dueCards} detail={isArabic ? "مراجعة قصيرة تكفي" : "a short review is enough"} tone="violet" />
        </section>

        <section className="dashboard-layout">
          <Panel title={copy.todayPlan} subtitle={copy.todayPlanSub} className="today-panel" action={<button className="text-button" onClick={() => changeView("paths")}>{copy.viewAll} <ChevronLeft size={16} /></button>}>
            {todayTasks.length ? <div className="task-list">{todayTasks.map((task) => <TaskRow key={task.id} task={task} locale={locale} onToggle={() => toggleTask(task.id)} />)}</div> : <EmptyState kind="tasks" icon={<Check size={22} />} title={isArabic ? "يوم جديد، بداية بسيطة" : "A fresh day, one small start"} text={isArabic ? "أضف مهمة قصيرة لتمنح يومك اتجاهًا واضحًا." : "Add one small task to give your day a clear direction."} action={<button className="soft-button" type="button" onClick={() => setShowNewTask(true)}><Plus size={15} /> {copy.addTask}</button>} />}
            <button className="add-line" type="button" onClick={() => setShowNewTask(true)}><Plus size={16} /> {copy.addTask}</button>
          </Panel>

          <section className="focus-callout">
            <div className="glow-orb" />
            <div className="callout-icon"><Focus size={21} /></div>
            <p className="eyebrow">{copy.focus}</p>
            <h2>{isArabic ? "مساحة بلا ضوضاء" : "A quiet space"}</h2>
            <p>{isArabic ? "جلسة واحدة مركزة الآن أفضل من خطة كبيرة مؤجلة." : "One focused session now beats a large plan postponed."}</p>
            <button className="dark-button" type="button" onClick={() => changeView("focus")}><Play size={16} fill="currentColor" /> {copy.focusNow}</button>
          </section>
        </section>

        <section className="three-grid">
          <Panel title={copy.paths} subtitle={copy.current} action={<button className="text-button" onClick={() => changeView("paths")}>{copy.viewAll} <ChevronLeft size={16} /></button>}>
            {state.paths.length ? <div className="compact-path-list">{state.paths.slice(0, 3).map((path) => <PathMini key={path.id} path={path} locale={locale} onContinue={() => changeView("paths")} />)}</div> : <EmptyState kind="paths" icon={<FolderKanban size={22} />} title={isArabic ? "خطتك تبدأ بفكرة" : "A path starts with an idea"} text={isArabic ? "حوّل هدفًا واحدًا إلى مسار واضح." : "Turn one goal into a clear path."} action={<button className="soft-button" type="button" onClick={() => setShowNewPath(true)}><Plus size={15} /> {copy.newPath}</button>} />}
          </Panel>
          <Panel title={copy.review} subtitle={`${dueCards.length} ${copy.dueCards}`} action={<button className="text-button" onClick={() => changeView("learning")}>{copy.continue} <ChevronLeft size={16} /></button>}>
            <div className="review-preview">
              <div className="review-card-dots"><i /><i /><i /></div>
              <p className="review-language">{dueCards[0]?.language ?? (isArabic ? "لا توجد بطاقات" : "No cards yet")}</p>
              <strong>{dueCards[0]?.front ?? (isArabic ? "ابدأ بإضافة بطاقة" : "Add your first card")}</strong>
              <span>{dueCards[0]?.back ?? copy.allDone}</span>
            </div>
          </Panel>
          <Panel title={copy.knowledge} subtitle={copy.knowledgeSub} action={<button className="text-button" onClick={() => changeView("brain")}>{copy.viewAll} <ChevronLeft size={16} /></button>}>
            {state.notes.length ? <article className="note-preview">
              <div className="note-preview-mark"><NotebookPen size={18} /></div>
              <h3>{state.notes[0].title}</h3>
              <p>{`${state.notes[0].body.replace(/[#*\[\]]/g, "").slice(0, 108)}…`}</p>
              <span>{state.notes[0].updatedAt}</span>
            </article> : <EmptyState kind="notes" icon={<NotebookPen size={22} />} title={isArabic ? "هنا تنمو أفكارك" : "This is where ideas grow"} text={isArabic ? "دوّن فكرة بسيطة لتصبح جزءًا من معرفتك." : "Capture one small idea to grow your knowledge."} action={<button className="soft-button" type="button" onClick={() => setNewNote(true)}><Plus size={15} /> {copy.newNote}</button>} />}
          </Panel>
        </section>
      </>
    );
  }

  function renderPaths() {
    return <>
      <PageIntro eyebrow={copy.current} title={copy.paths} subtitle={isArabic ? "حوّل أي هدف إلى مراحل صغيرة، وشاهد أثر كل خطوة." : "Turn any goal into small stages and see the impact of each step."} action={<button className="primary-button" type="button" onClick={() => setShowNewPath(true)}><Plus size={18} /> {copy.newPath}</button>} />
      {state.paths.length ? <div className="path-grid">{state.paths.map((path) => <PathCard key={path.id} path={path} locale={locale} onContinue={() => { changeView("dashboard"); notify(path.nextAction); }} />)}</div> : <EmptyState kind="paths" icon={<FolderKanban size={22} />} title={isArabic ? "ارسم أول مسار لك" : "Sketch your first path"} text={isArabic ? "اختر هدفًا صغيرًا، وسنرتّب خطواته معًا." : "Choose a small goal and organize its next steps."} action={<button className="primary-button" type="button" onClick={() => setShowNewPath(true)}><Plus size={16} /> {copy.newPath}</button>} />}
      <section className="path-advice"><div><Sparkles size={20} /><div><strong>{isArabic ? "اقتراح ذكي" : "Smart suggestion"}</strong><p>{isArabic ? "اختر مهمة مدتها أقل من 25 دقيقة عندما تشعر بالمقاومة. البداية الصغيرة تحافظ على السلسلة." : "Choose a task under 25 minutes when you feel resistance. A small start protects your streak."}</p></div></div><button className="ghost-button" type="button" onClick={() => setShowNewTask(true)}>{copy.addTask}</button></section>
    </>;
  }

  function renderBrain() {
    return <>
      <PageIntro eyebrow="Second brain" title={isArabic ? "العقل الثاني" : "Second brain"} subtitle={isArabic ? "التقط الأفكار واربطها بالمسارات قبل أن تضيع." : "Capture ideas and link them to paths before they disappear."} action={<button className="primary-button" type="button" onClick={() => setNewNote(true)}><Plus size={18} /> {copy.newNote}</button>} />
      <div className="brain-layout">
        <Panel title={copy.notes} className="notes-index">{state.notes.length ? <div className="note-index-list">{state.notes.map((note) => <button type="button" className={`note-index-item ${note.id === activeNote?.id ? "active" : ""}`} key={note.id} onClick={() => setSelectedNoteId(note.id)}><span className="note-icon"><NotebookPen size={16} /></span><span><strong>{note.title}</strong><small>{note.updatedAt}</small></span><ChevronLeft size={16} /></button>)}</div> : <EmptyState kind="notes" icon={<NotebookPen size={22} />} title={isArabic ? "التقط فكرة قبل أن تضيع" : "Catch the idea before it fades"} text={isArabic ? "ملاحظة واحدة قد تصبح بداية مشروعك القادم." : "One note can become the start of your next project."} action={<button className="soft-button" type="button" onClick={() => setNewNote(true)}><Plus size={15} /> {copy.newNote}</button>} />}</Panel>
        <Panel className="note-reader" action={<div className="reader-actions"><IconButton label="Search"><Search size={18} /></IconButton><MoreButton label="More" /></div>}>
          <article className="markdown-note">
            <div className="note-meta"><span>{activeNote?.updatedAt}</span><span>•</span><span>{activeNote?.tags.join(" · ")}</span></div>
            <h2>{activeNote?.title ?? (isArabic ? "مساحة المعرفة" : "Knowledge space")}</h2>
            {activeNote ? activeNote.body.split("\n").map((line, index) => line.startsWith("# ") ? <h1 key={index}>{line.replace("# ", "")}</h1> : line.startsWith("## ") ? <h3 key={index}>{line.replace("## ", "")}</h3> : line.startsWith("- ") ? <p className="bullet" key={index}>{line.replace("- ", "")}</p> : <p key={index}>{line.replace(/\*\*/g, "")}</p>) : <p>{isArabic ? "أنشئ ملاحظتك الأولى لربط الأفكار بالمسارات." : "Create your first note to connect ideas to paths."}</p>}
            <div className="linked-paths"><span>{copy.linked}</span>{activeNote?.linkedPathIds.map((id) => <button key={id} type="button" onClick={() => changeView("paths")}>↗ {state.paths.find((path) => path.id === id)?.title}</button>)}</div>
          </article>
        </Panel>
        <aside className="knowledge-map"><p className="eyebrow">Knowledge map</p><h3>{isArabic ? "الروابط تتشكل" : "Connections forming"}</h3><div className="map-canvas"><span className="map-node center">{state.notes[0]?.title.slice(0, 11)}</span><span className="map-node left">{state.paths[0]?.title.slice(0, 9)}</span><span className="map-node top">{isArabic ? "تركيز" : "Focus"}</span><span className="map-node right">{isArabic ? "تكرار" : "Review"}</span><i className="map-link one" /><i className="map-link two" /><i className="map-link three" /></div><p>{isArabic ? "كل ملاحظة ترتبط بفكرة أو مسار حتى تصبح المعرفة قابلة للاستخدام." : "Link every note to an idea or path so knowledge stays usable."}</p></aside>
      </div>
    </>;
  }

  function renderLearning() {
    const currentCard = dueCards[0];
    return <>
      <PageIntro eyebrow="Spaced repetition" title={isArabic ? "تعلّم بلا نسيان" : "Learn without forgetting"} subtitle={isArabic ? "بطاقات خفيفة مع مراجعة ذكية في الوقت المناسب." : "Lightweight cards, reviewed at the right moment."} action={<button className="ghost-button" type="button" onClick={() => notify(copy.addCard)}><Plus size={17} /> {copy.addCard}</button>} />
      <section className="learning-top-grid">
        <Panel title={copy.cards} subtitle={`${dueCards.length} ${copy.dueCards}`} className="flashcard-panel">
          {currentCard ? <div className={`flashcard ${showAnswer ? "revealed" : ""}`}><div className="card-face card-front"><span>{currentCard.language}</span><h2>{currentCard.front}</h2><small>{isArabic ? "فكّر في المعنى ثم اقلب البطاقة" : "Recall the meaning before you reveal it"}</small></div><div className="card-face card-back"><span>{currentCard.language}</span><h2>{currentCard.back}</h2><small>{isArabic ? `المراجعة التالية بعد ${currentCard.interval} أيام` : `next review in ${currentCard.interval} days`}</small></div></div> : <EmptyState kind="cards" icon={<BrainCircuit size={22} />} title={isArabic ? "بطاقة صغيرة، أثر كبير" : "One small card, lasting recall"} text={isArabic ? "أنشئ مسار لغة لتبدأ مراجعة مفرداتك بذكاء." : "Create a language path to begin smarter vocabulary review."} action={<button className="soft-button" type="button" onClick={() => setShowNewPath(true)}><Plus size={15} /> {copy.newPath}</button>} />}
          {currentCard ? !showAnswer ? <button className="primary-button full-button" type="button" onClick={() => setShowAnswer(true)}>{copy.showAnswer}</button> : <div className="review-actions"><button className="soft-danger" type="button" onClick={() => reviewCard("again")}>{copy.again}</button><button className="soft-button" type="button" onClick={() => reviewCard("good")}>{copy.good}</button><button className="primary-button" type="button" onClick={() => reviewCard("easy")}>{copy.easy}</button></div> : null}
        </Panel>
        <Panel title={copy.weekly} className="learning-chart"><div className="chart-card"><div className="bar-chart">{chartValues.map((value, index) => <div className="bar-column" key={index}><i style={{ height: `${value}%` }} /><span>{["س", "ح", "ن", "ث", "ر", "خ", "ج"][index]}</span></div>)}</div><div className="chart-legend"><span><i className="legend-dot" />{isArabic ? "مراجعات" : "Reviews"}</span><strong>0%</strong></div></div><div className="mini-stat-row"><div><strong>{state.flashcards.reduce((sum, card) => sum + card.reviews, 0)}</strong><span>{isArabic ? "مراجعة" : "reviews"}</span></div><div><strong>0%</strong><span>{copy.reviewAccuracy}</span></div></div></Panel>
      </section>
      <Panel title={isArabic ? "حزمة المفردات" : "Vocabulary pack"} subtitle={isArabic ? "أضف بطاقاتك الأولى للبدء." : "Add your first cards to begin."}>{state.flashcards.length ? <div className="vocab-grid">{state.flashcards.map((card) => <article key={card.id} className={`vocab-card ${card.due ? "due" : ""}`}><span>{card.language}</span><h3>{card.front}</h3><p>{card.back}</p><small>{card.due ? `${copy.review} · ${card.interval}d` : (isArabic ? "مجدولة لاحقًا" : "Scheduled later")}</small></article>)}</div> : <EmptyState kind="cards" icon={<BrainCircuit size={22} />} title={isArabic ? "اجعل الكلمات قابلة للاستدعاء" : "Make words easy to recall"} text={isArabic ? "أنشئ مسارًا لغويًا لتبدأ بالكلمات الأهم لك." : "Create a language path to start with words that matter to you."} action={<button className="soft-button" type="button" onClick={() => setShowNewPath(true)}><Plus size={15} /> {copy.newPath}</button>} />}</Panel>
    </>;
  }

  function renderLibrary() {
    return <>
      <PageIntro eyebrow={isArabic ? "قراءة واعية" : "Intentional reading"} title={copy.books} subtitle={isArabic ? "احفظ تقدمك، أضف ملاحظاتك، وارجع إلى أسئلة المراجعة." : "Keep your place, save notes, and return to review questions."} action={<><button className="primary-button" type="button" onClick={() => pdfInput.current?.click()}><Upload size={17} /> {copy.importBook}</button><input ref={pdfInput} className="sr-only" type="file" accept="application/pdf,.pdf" onChange={(event) => { const file = event.target.files?.[0]; if (file) importPdf(file); event.currentTarget.value = ""; }} /></>} />
      <div className="library-toolbar"><label className="library-search"><Search size={17} /><span className="sr-only">{isArabic ? "بحث في المكتبة" : "Search library"}</span><input value={libraryQuery} onChange={(event) => setLibraryQuery(event.target.value)} placeholder={isArabic ? "ابحث باسم الكتاب أو المؤلف" : "Search by title or author"} /></label><div className="library-filters" role="group" aria-label={isArabic ? "تصفية الكتب" : "Book filters"}><button type="button" className={libraryFilter === "all" ? "active" : ""} onClick={() => setLibraryFilter("all")}>{isArabic ? "كل الكتب" : "All books"}</button><button type="button" className={libraryFilter === "active" ? "active" : ""} onClick={() => setLibraryFilter("active")}>{isArabic ? "قيد القراءة" : "In progress"}</button><button type="button" className={libraryFilter === "finished" ? "active" : ""} onClick={() => setLibraryFilter("finished")}>{isArabic ? "مكتملة" : "Finished"}</button></div></div>
      {filteredBooks.length ? <div className="book-shelf">{filteredBooks.map((book) => <article className="book-card" key={book.id}><div className="book-cover" style={{ "--book-accent": book.accent } as React.CSSProperties}><span>{isArabic ? "مكتبة نوم" : "Noum Library"}</span><b>{book.title}</b><i /></div><div className="book-card-content"><div><p>{book.author}</p><h2>{book.title}</h2></div><div className="book-progress"><div><span>{book.progress}%</span><small>{book.pages > 0 ? `${Math.round((book.pages * book.progress) / 100)} / ${book.pages} ${isArabic ? "صفحة" : "pages"}` : (isArabic ? "تقدم محفوظ محليًا" : "Progress saved locally")}</small></div><ProgressBar value={book.progress} tone="mint" label={`${book.title} progress`} /></div><div className="book-question"><CircleHelp size={16} /><p><strong>{copy.question}</strong>{book.question}</p></div><button className="soft-button full-button" type="button" onClick={() => advanceBook(book.id)}><BookOpen size={16} /> {copy.continueReading}</button></div></article>)}</div> : <Panel className="library-empty"><EmptyState kind="library" icon={<BookOpen size={23} />} title={isArabic ? "مكتبتك تبدأ من هنا" : "Your library starts here"} text={isArabic ? "أضف كتاب PDF من جهازك، وسيُحفظ تقدمه داخل هذا المتصفح." : "Import a PDF from your device and keep its progress in this browser."} action={<button className="primary-button" type="button" onClick={() => pdfInput.current?.click()}><Upload size={17} /> {copy.importBook}</button>} /></Panel>}
    </>;
  }

  function renderFocus() {
    return <>
      <PageIntro eyebrow={isArabic ? "عمل عميق" : "Deep work"} title={copy.focusRoom} subtitle={copy.focusSubtitle} />
      <section className="focus-room"><div className="focus-room-ambient" /><div className="focus-room-inner"><div className="focus-mode-tag"><Moon size={15} /> {isArabic ? "وضع هادئ" : "Quiet mode"}</div><h2>{activePath?.title ?? copy.focusRoom}</h2><p>{activePath?.nextAction ?? copy.focusSubtitle}</p><div className="timer-value"><span>{focusDisplay}</span></div><div className="timer-preset"><button onClick={() => resetFocus(25)} className={secondsLeft === 1500 ? "active" : ""} type="button">25</button><button onClick={() => resetFocus(50)} className={secondsLeft === 3000 ? "active" : ""} type="button">50</button><button onClick={() => resetFocus(90)} className={secondsLeft === 5400 ? "active" : ""} type="button">90</button><span>{copy.minutes}</span></div><div className="timer-controls"><button className="timer-reset" type="button" onClick={() => resetFocus()} aria-label={copy.reset}><TimerReset size={19} /></button><button className="timer-start" type="button" onClick={toggleFocusTimer}>{timerRunning ? <><Pause size={18} fill="currentColor" /> {copy.pause}</> : <><Play size={18} fill="currentColor" /> {copy.start}</>}</button></div></div><aside className="focus-sidecard"><div className="focus-side-icon"><Music2 size={18} /></div><strong>{isArabic ? "الصوت المحيط" : "Ambient sound"}</strong><p>{isArabic ? "دع ضوضاء خفيفة تحجب المقاطعات." : "Use a light sound layer to hide interruptions."}</p><button className={`sound-toggle ${state.soundEnabled ? "on" : ""}`} type="button" onClick={() => setState((current) => ({ ...current, soundEnabled: !current.soundEnabled }))}><Volume2 size={16} /><span>{state.soundEnabled ? (isArabic ? "مفعّل" : "On") : (isArabic ? "متوقف" : "Off")}</span><i /></button><div className="focus-tip"><Coffee size={16} /><span>{isArabic ? "خذ استراحة قصيرة بعد كل جلستين." : "Take a short break after every two sessions."}</span></div></aside></section>
      <section className="focus-history"><Panel title={isArabic ? "آخر الجلسات" : "Recent sessions"}>{state.focusSessions.length ? <div className="session-list">{state.focusSessions.slice(0, 6).map((session) => { const sessionPath = state.paths.find((path) => path.id === session.pathId); const date = new Intl.DateTimeFormat(isArabic ? "ar-SA" : "en-US", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(session.completedAt)); return <article className="focus-session" key={session.id}><span className={`session-icon ${sessionPath?.color ?? "mint"}`}><TimerReset size={16} /></span><div><strong>{session.minutes} {copy.minutes}</strong><small>{sessionPath?.title ?? (isArabic ? "جلسة تركيز شخصية" : "Personal focus session")}</small></div><time dateTime={session.completedAt}>{date}</time></article>; })}</div> : <EmptyState kind="focus" icon={<TimerReset size={22} />} title={isArabic ? "ابدأ مساحة تركيزك" : "Start your focus space"} text={isArabic ? "ستظهر جلساتك هنا بعد أول جلسة مركزة." : "Your sessions will appear here after your first focused session."} action={<button className="soft-button" type="button" onClick={() => resetFocus(25)}><Play size={15} /> {copy.start}</button>} />}</Panel></section>
    </>;
  }

  function renderStats() {
    return <>
      <PageIntro eyebrow={isArabic ? "نمو واضح" : "Visible growth"} title={copy.weekly} subtitle={isArabic ? "بدون ضغط: أرقام بسيطة تساعدك على الاستمرار." : "No pressure: simple signals that help you keep moving."} />
      <div className="stats-hero-grid"><Panel className="insight-panel"><div className="insight-top"><div><p className="eyebrow">{copy.completion}</p><h2>{completionRate}%</h2><p>{isArabic ? "من مهامك الحالية مكتملة" : "of current tasks completed"}</p></div><ProgressRing value={completionRate} label={copy.completion} /></div><ProgressBar value={completionRate} label={copy.completion} /></Panel><Panel className="streak-panel"><Flame size={30} /><div><p>{copy.streak}</p><h2>{currentStreak} {isArabic ? "أيام" : "days"}</h2><span>{isArabic ? `أعلى سلسلة مسجلة: ${currentStreak} يومًا` : `Current best: ${currentStreak} days`}</span></div></Panel><Panel className="xp-panel"><Sparkles size={24} /><p>{isArabic ? "مستواك الحالي" : "Your current level"}</p><h2>Level {level.toString().padStart(2, "0")}</h2><ProgressBar value={levelProgress} tone="violet" label="Level progress" /><small>{xpTotal} XP · {levelProgress}%</small></Panel></div>
      <div className="stats-grid"><Panel title={copy.weekly} subtitle={isArabic ? "دقائق تركيز" : "Focus minutes"} className="wide-chart"><div className="bar-chart large">{chartValues.map((value, index) => <div className="bar-column" key={index}><i style={{ height: `${value}%` }} /><span>{["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"][index]}</span></div>)}</div></Panel><Panel title={isArabic ? "تقدم المسارات" : "Path progress"}>{state.paths.length ? state.paths.map((path) => <div className="stats-path" key={path.id}><div><span className={`color-dot ${path.color}`} /><strong>{path.title}</strong><small>{path.completedSteps}/{path.steps}</small></div><ProgressBar value={pathProgress(path)} tone={path.color} label={path.title} /></div>) : <EmptyState kind="stats" icon={<FolderKanban size={22} />} title={isArabic ? "أول خطوة تصنع أول رقم" : "The first step creates the first number"} text={isArabic ? "أنشئ مسارًا لتبدأ إحصاءاتك الحقيقية." : "Create a path to start your real insights."} action={<button className="soft-button" type="button" onClick={() => setShowNewPath(true)}><Plus size={15} /> {copy.newPath}</button>} />}</Panel></div>
      <Panel title={isArabic ? "الشارات التي فتحتها" : "Unlocked badges"}><EmptyState kind="stats" icon={<Sparkles size={22} />} title={isArabic ? "إنجازاتك قادمة" : "Your achievements are ahead"} text={isArabic ? "ابدأ مسارًا صغيرًا لتفتح أول إنجازاتك الحقيقية." : "Start a small path to unlock your first real achievements."} action={<button className="soft-button" type="button" onClick={() => setShowNewPath(true)}><Plus size={15} /> {copy.newPath}</button>} /></Panel>
    </>;
  }

  function renderSettings() {
    return <>
      <PageIntro eyebrow="Noum List" title={copy.settings} subtitle={isArabic ? "خيارات تحفظ على هذا المتصفح فقط." : "Preferences that stay in this browser only."} />
      <div className="settings-stack">
        <BackupPanel locale={locale} user={syncUser} remoteUpdatedAt={remoteSnapshot?.updatedAt ?? null} busy={syncBusy} onExport={exportBackup} onImport={importBackup} onLogin={startSyncLogin} onUpload={requestCloudBackup} onRestoreRemote={() => void restoreCloudBackup()} />
        <Panel title={copy.language}><div className="setting-row"><div><strong>{copy.language}</strong><span>{isArabic ? "بدّل اتجاه المحتوى ولغة الواجهة فورًا." : "Switch content direction and interface copy instantly."}</span></div><div className="segment-control"><button className={locale === "ar" ? "active" : ""} type="button" onClick={() => setState((current) => ({ ...current, locale: "ar" }))}>{copy.arabic}</button><button className={locale === "en" ? "active" : ""} type="button" onClick={() => setState((current) => ({ ...current, locale: "en" }))}>{copy.english}</button></div></div></Panel>
        <Panel title={copy.focusRoom}><div className="setting-row"><div><strong>{copy.sound}</strong><span>{isArabic ? "يُشغّل صوتًا بسيطًا بعد إنهاء جلسة ناجحة." : "Plays a subtle sound after a completed session."}</span></div><button className={`switch ${state.soundEnabled ? "enabled" : ""}`} aria-label={copy.sound} type="button" onClick={() => setState((current) => ({ ...current, soundEnabled: !current.soundEnabled }))}><i /></button></div></Panel>
        <Panel title={copy.androidApp}><div className="setting-row android-release-row"><div><strong>{copy.androidApp}</strong><span>{copy.androidAppDescription}</span></div><button className="primary-button" type="button" onClick={() => notify(copy.apkHint)}><Download size={16} /> {copy.buildApk}</button></div></Panel>
        <Panel title={copy.resetData}><div className="setting-row"><div><strong>{copy.resetData}</strong><span>{copy.resetDescription}</span></div><button className="danger-button" type="button" onClick={() => { setState(resetNoumState()); setActiveView("dashboard"); notify(copy.resetConfirm); }}><RotateCcw size={16} /> {copy.resetData}</button></div></Panel>
      </div>
    </>;
  }

  const viewContent: Record<ViewId, () => React.ReactNode> = { dashboard: renderDashboard, paths: renderPaths, brain: renderBrain, learning: renderLearning, library: renderLibrary, focus: renderFocus, stats: renderStats, settings: renderSettings };

  return <div className="app-shell" dir={isArabic ? "rtl" : "ltr"}>
    <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-top"><BrandMark /><IconButton label={copy.close} className="sidebar-close" onClick={() => setMobileOpen(false)}><X size={20} /></IconButton></div>
      <nav className="side-nav" aria-label="Primary navigation">{navigation.map((item) => { const Icon = item.icon; const active = activeView === item.id; return <button key={item.id} className={active ? "active" : ""} type="button" onClick={() => changeView(item.id)}><Icon size={19} strokeWidth={active ? 2.3 : 1.85} /><span>{isArabic ? item.ar : item.en}</span>{item.id === "learning" && dueCards.length ? <b>{dueCards.length}</b> : null}</button>; })}</nav>
      <div className="sidebar-bottom"><button className="shortcut-hint" type="button" onClick={() => setShowNewTask(true)}><Keyboard size={15} /><span>{isArabic ? "التقاط فكرة" : "Capture thought"}</span><kbd>⌘ K</kbd></button><div className="profile-card"><span className="profile-avatar">ن</span><div><strong>{isArabic ? "مساحتي" : "My workspace"}</strong><small>Level {level.toString().padStart(2, "0")} · {xpTotal} XP</small></div><MoreButton label="Profile actions" /></div></div>
    </aside>
    {mobileOpen ? <button className="nav-backdrop" aria-label={copy.close} type="button" onClick={() => setMobileOpen(false)} /> : null}
    <main className="main-content"><div className="topbar"><IconButton label={copy.mobileMenu} className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></IconButton><button className="command-search" type="button" aria-label={copy.command} onClick={() => setShowNewTask(true)}><Search size={18} /><span>{copy.command}</span><kbd>⌘ K</kbd></button><div className="topbar-actions">{!isOnline ? <div className="offline-indicator" role="status"><WifiOff size={14} /><span>{isArabic ? "دون اتصال — محفوظ محليًا" : "Offline — saved locally"}</span></div> : null}<IconButton label="Notifications" className="notification-button"><Bell size={19} /><i /></IconButton><div className="date-chip"><Clock3 size={16} /><span>{todayLabel}</span></div></div></div><div className="workspace">{viewContent[activeView]()}</div></main>
    {toast ? <div className="toast-message" role="status"><Check size={17} />{toast}</div> : null}
    {showNewTask ? <Modal title={copy.addTask} onClose={() => setShowNewTask(false)}><label className="field-label">{copy.addTask}<input autoFocus value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder={copy.taskPlaceholder} onKeyDown={(event) => { if (event.key === "Enter") addTask(); }} /></label><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowNewTask(false)}>{copy.cancel}</button><button className="primary-button" type="button" onClick={addTask}>{copy.save}</button></div></Modal> : null}
    {showNewPath ? <Modal title={copy.newPath} onClose={() => setShowNewPath(false)}><label className="field-label">{copy.pathName}<input autoFocus value={newPathTitle} onChange={(event) => setNewPathTitle(event.target.value)} placeholder={isArabic ? "مثال: تعلّم الرسم الرقمي" : "Example: Learn digital art"} /></label><label className="field-label">{copy.pathDesc}<textarea value={newPathDescription} onChange={(event) => setNewPathDescription(event.target.value)} placeholder={isArabic ? "صف النتيجة التي تريدها…" : "Describe the outcome you want…"} rows={3} /></label><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowNewPath(false)}>{copy.cancel}</button><button className="primary-button" type="button" onClick={addPath}>{copy.create}</button></div></Modal> : null}
    {newNote ? <Modal title={copy.newNote} onClose={() => setNewNote(false)}><label className="field-label">{copy.newNoteTitle}<input autoFocus value={newNoteTitle} onChange={(event) => setNewNoteTitle(event.target.value)} /></label><label className="field-label">Markdown<textarea value={newNoteBody} onChange={(event) => setNewNoteBody(event.target.value)} placeholder={copy.newNoteBody} rows={7} /></label><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setNewNote(false)}>{copy.cancel}</button><button className="primary-button" type="button" onClick={saveNote}>{copy.saveNote}</button></div></Modal> : null}
    {pendingRestore ? <Modal title={isArabic ? "تأكيد الاستعادة" : "Confirm restore"} onClose={() => setPendingRestore(null)}><p className="restore-message">{isArabic ? `سيتم استبدال بيانات هذا المتصفح بالنسخة ${restoreSource === "cloud" ? "السحابية" : "المحلية"} التي أُنشئت في ${new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(pendingRestore.createdAt))}. نزّل نسخة محلية أولًا إذا كنت تريد الاحتفاظ بالحالة الحالية.` : `This will replace this browser’s data with the ${restoreSource === "cloud" ? "cloud" : "local"} backup created ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(pendingRestore.createdAt))}. Download a local backup first if you want to keep the current state.`}</p><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setPendingRestore(null)}>{copy.cancel}</button><button className="primary-button" type="button" onClick={applyRestore}>{isArabic ? "استعادة البيانات" : "Restore data"}</button></div></Modal> : null}
    {confirmCloudOverwrite ? <Modal title={isArabic ? "استبدال النسخة السحابية" : "Replace cloud snapshot"} onClose={() => setConfirmCloudOverwrite(false)}><p className="restore-message">{isArabic ? "توجد نسخة محفوظة في حسابك. سيحل وضعك المحلي الحالي محلها بعد التأكيد، ولن تتغير بيانات هذا المتصفح." : "A snapshot is already saved in your account. Your current local state will replace it after confirmation; this browser’s data will not change."}</p><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setConfirmCloudOverwrite(false)}>{copy.cancel}</button><button className="primary-button" type="button" onClick={() => { setConfirmCloudOverwrite(false); void uploadCloudBackup(); }}>{isArabic ? "استبدال النسخة" : "Replace snapshot"}</button></div></Modal> : null}
  </div>;
}

function PageIntro({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle: string; action?: React.ReactNode }) { return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-subtitle">{subtitle}</p></div>{action ? <div className="header-actions">{action}</div> : null}</header>; }
function MetricCard({ icon, value, label, detail, tone }: { icon: React.ReactNode; value: string; label: string; detail: string; tone: string }) { return <article className={`metric-card ${tone}`}><div className="metric-icon">{icon}</div><div><strong>{value}</strong><span>{label}</span><small>{detail}</small></div></article>; }
function TaskRow({ task, locale, onToggle }: { task: Task; locale: Locale; onToggle: () => void }) { const c = localeCopy[locale]; return <article className={`task-row ${task.completed ? "completed" : ""}`}><CompletionBox checked={task.completed} onClick={onToggle} label={task.title} /><div className="task-copy"><strong>{task.title}</strong><span><i className={`priority-dot ${task.priority}`} />{priorityLabel(task.priority, locale)} <b>·</b> <Clock3 size={13} /> {task.minutes} {c.minutes}</span></div><div className="task-due">{task.due === "اليوم" || task.due === "Today" ? c.today : c.tomorrow}</div></article>; }
function PathMini({ path, locale, onContinue }: { path: NoumState["paths"][number]; locale: Locale; onContinue: () => void }) { const progress = pathProgress(path); return <article className="path-mini"><div className={`path-badge ${path.color}`}><FolderKanban size={17} /></div><div className="path-mini-copy"><strong>{path.title}</strong><span>{path.completedSteps}/{path.steps} · {progress}%</span><ProgressBar value={progress} tone={path.color} label={path.title} /></div><button className="arrow-button" onClick={onContinue} type="button" aria-label={`${localeCopy[locale].continue} ${path.title}`}><ChevronLeft size={18} /></button></article>; }
function PathCard({ path, locale, onContinue }: { path: NoumState["paths"][number]; locale: Locale; onContinue: () => void }) { const progress = pathProgress(path); return <article className={`path-card-web ${path.color}`}><div className="path-card-top"><span className="path-category">{path.category}</span><div className={`path-badge ${path.color}`}><FolderKanban size={19} /></div></div><h2>{path.title}</h2><p>{path.description}</p><div className="path-card-progress"><div><span>{localeCopy[locale].completion}</span><strong>{progress}%</strong></div><ProgressBar value={progress} tone={path.color} label={path.title} /></div><div className="path-card-footer"><span><Flame size={15} /> {path.streak}</span><button className="soft-button" type="button" onClick={onContinue}>{localeCopy[locale].continue} <ChevronLeft size={15} /></button></div></article>; }
function Badge({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) { return <article className="badge"><span>{icon}</span><div><strong>{title}</strong><small>{detail}</small></div></article>; }
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) { return <div className="modal-layer" role="dialog" aria-modal="true" aria-label={title}><button className="modal-backdrop" type="button" onClick={onClose} aria-label="Close modal" /><section className="modal-card"><div className="modal-heading"><h2>{title}</h2><IconButton label="Close" onClick={onClose}><X size={20} /></IconButton></div>{children}</section></div>; }

export default App;
