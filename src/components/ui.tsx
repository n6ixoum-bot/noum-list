import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Check, MoreHorizontal } from "lucide-react";

export type EmptyStateKind = "tasks" | "paths" | "notes" | "cards" | "library" | "focus" | "stats";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Noum List">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      {!compact ? <span className="brand-name">Noum <b>List</b></span> : null}
    </div>
  );
}

export function IconButton({ label, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className={`icon-button ${className}`} type="button" aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function Panel({ title, subtitle, action, children, className = "" }: { title?: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) ? (
        <div className="panel-heading">
          <div>
            {subtitle ? <p className="eyebrow">{subtitle}</p> : null}
            {title ? <h2>{title}</h2> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function ProgressBar({ value, tone = "mint", label }: { value: number; tone?: "mint" | "blue" | "amber" | "violet"; label?: string }) {
  return (
    <div className="progress-wrap">
      {label ? <span className="sr-only">{label}</span> : null}
      <div className={`progress-track ${tone}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <span style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
      </div>
    </div>
  );
}

export function ProgressRing({ value, size = 72, stroke = 7, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * Math.PI * 2;
  const offset = circumference - (Math.max(0, Math.min(value, 100)) / 100) * circumference;
  return (
    <div className="progress-ring" style={{ width: size, height: size }} aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} />
        <circle className="ring-value" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span>{value}%</span>
    </div>
  );
}

export function CompletionBox({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" className={`completion-box ${checked ? "checked" : ""}`} onClick={onClick} aria-label={label}>
      {checked ? <Check size={14} strokeWidth={3} /> : null}
    </button>
  );
}

export function MoreButton({ label }: { label: string }) {
  return <IconButton label={label} className="muted-action"><MoreHorizontal size={20} /></IconButton>;
}

export function EmptyState({
  kind = "tasks",
  icon,
  title,
  text,
  action,
}: {
  kind?: EmptyStateKind;
  icon: ReactNode;
  title?: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <section className={`empty-state empty-state--${kind}`}>
      <div className="empty-illustration" aria-hidden="true">
        <i className="empty-orbit orbit-one" />
        <i className="empty-orbit orbit-two" />
        <div className="empty-object"><span>{icon}</span></div>
        <i className="empty-spark spark-one" />
        <i className="empty-spark spark-two" />
        <i className="empty-spark spark-three" />
      </div>
      <div className="empty-copy">
        {title ? <h3>{title}</h3> : null}
        <p>{text}</p>
      </div>
      {action ? <div className="empty-action">{action}</div> : null}
    </section>
  );
}
