import { useRef } from "react";
import { Cloud, Download, FileUp, HardDriveDownload, KeyRound, RefreshCw, ShieldCheck, UploadCloud } from "lucide-react";
import { Panel } from "./ui";
import type { SyncUser } from "../lib/sync-client";

type BackupPanelProps = {
  locale: "ar" | "en";
  user: SyncUser | null;
  remoteUpdatedAt: string | null;
  busy: boolean;
  onExport: () => void;
  onImport: (file: File) => void;
  onLogin: () => void;
  onUpload: () => void;
  onRestoreRemote: () => void;
};

const copy = {
  ar: {
    title: "النسخ الاحتياطي والمزامنة",
    subtitle: "بياناتك محلية أولًا، والمزامنة لا تُفعّل إلا بطلبك.",
    local: "نسخة محلية",
    localDescription: "نزّل ملفًا خاصًا بك واستعده على أي جهاز دون تسجيل دخول.",
    export: "تنزيل نسخة احتياطية",
    import: "استيراد ملف احتياطي",
    sync: "مزامنة بين الأجهزة",
    syncDescription: "اربط حسابك لحفظ نسخة مشفّرة على الخادم واستعادتها عند تسجيل الدخول من جهاز آخر.",
    connect: "ربط الحساب وتفعيل المزامنة",
    connected: "المزامنة مرتبطة بحسابك",
    upload: "حفظ نسخة الآن",
    restore: "استعادة النسخة السحابية",
    remoteAvailable: "توجد نسخة محفوظة",
    encrypted: "تُشفّر اللقطة أثناء حفظها، وتبقى النسخة المحلية هي الأساس.",
    lastSync: "آخر نسخة سحابية",
  },
  en: {
    title: "Backup & sync",
    subtitle: "Your data stays local first. Sync only activates when you choose it.",
    local: "Local backup",
    localDescription: "Download your own file and restore it on any device without signing in.",
    export: "Download backup",
    import: "Import backup file",
    sync: "Cross-device sync",
    syncDescription: "Link your account to save an encrypted snapshot and restore it after signing in on another device.",
    connect: "Link account & enable sync",
    connected: "Sync is linked to your account",
    upload: "Save a snapshot now",
    restore: "Restore cloud snapshot",
    remoteAvailable: "A cloud snapshot is available",
    encrypted: "The snapshot is encrypted while stored. Your local copy remains the source of truth.",
    lastSync: "Last cloud snapshot",
  },
} as const;

function dateLabel(value: string, locale: "ar" | "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function BackupPanel({ locale, user, remoteUpdatedAt, busy, onExport, onImport, onLogin, onUpload, onRestoreRemote }: BackupPanelProps) {
  const text = copy[locale];
  const input = useRef<HTMLInputElement>(null);
  return <Panel title={text.title} className="backup-panel">
    <p className="backup-lead">{text.subtitle}</p>
    <div className="backup-grid">
      <section className="backup-option">
        <div className="backup-option-icon local"><HardDriveDownload size={19} /></div>
        <div className="backup-option-copy"><p className="eyebrow">{text.local}</p><h3>{text.local}</h3><p>{text.localDescription}</p></div>
        <div className="backup-actions">
          <button className="soft-button" type="button" onClick={onExport}><Download size={15} /> {text.export}</button>
          <button className="ghost-button" type="button" onClick={() => input.current?.click()}><FileUp size={15} /> {text.import}</button>
          <input ref={input} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => { const file = event.target.files?.[0]; if (file) onImport(file); event.currentTarget.value = ""; }} />
        </div>
      </section>
      <section className="backup-option cloud">
        <div className="backup-option-icon cloud"><Cloud size={19} /></div>
        <div className="backup-option-copy"><p className="eyebrow">{text.sync}</p><h3>{text.sync}</h3><p>{text.syncDescription}</p></div>
        {user ? <div className="sync-connected"><div className="sync-user"><span><KeyRound size={14} /></span><div><strong>{text.connected}</strong><small>{user.name ?? "Noum user"}</small></div></div><div className="backup-actions"><button className="primary-button" type="button" disabled={busy} onClick={onUpload}>{busy ? <RefreshCw className="spin" size={15} /> : <UploadCloud size={15} />} {text.upload}</button>{remoteUpdatedAt ? <button className="ghost-button" type="button" disabled={busy} onClick={onRestoreRemote}><RefreshCw size={15} /> {text.restore}</button> : null}</div>{remoteUpdatedAt ? <p className="remote-date">{text.lastSync}: {dateLabel(remoteUpdatedAt, locale)}</p> : null}</div> : <button className="primary-button" type="button" onClick={onLogin}><KeyRound size={15} /> {text.connect}</button>}
      </section>
    </div>
    <p className="backup-security"><ShieldCheck size={15} /> {text.encrypted}</p>
  </Panel>;
}
