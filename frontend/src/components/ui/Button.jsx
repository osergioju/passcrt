const VARIANTS = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 disabled:bg-indigo-300',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:outline-indigo-600 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700',
  danger:
    'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600 disabled:bg-red-300',
  ghost:
    'text-slate-600 hover:bg-slate-100 focus-visible:outline-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800',
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={
        'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium ' +
        'transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
        'disabled:cursor-not-allowed disabled:opacity-60 ' +
        VARIANTS[variant] +
        ' ' +
        className
      }
      {...props}
    />
  )
}
