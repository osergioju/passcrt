export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={'animate-spin text-indigo-600 ' + className} viewBox="0 0 24 24" fill="none" aria-label="Carregando">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Spinner className="h-8 w-8" />
    </div>
  )
}
