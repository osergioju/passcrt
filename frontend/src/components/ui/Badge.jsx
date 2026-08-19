const TONES = {
  active:
    'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300',
  inactive:
    'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400',
  neutral:
    'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950 dark:text-indigo-300',
  warning:
    'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300',
}

export function Badge({ tone = 'neutral', children }) {
  return (
    <span className={'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ' + TONES[tone]}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  return <Badge tone={status === 'ACTIVE' ? 'active' : 'inactive'}>{status === 'ACTIVE' ? 'Ativo' : 'Inativo'}</Badge>
}
