export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">{children}</table>
    </div>
  )
}

export function Thead({ children }) {
  return <thead className="bg-slate-50 dark:bg-slate-900">{children}</thead>
}

export function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={
        'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ' +
        className
      }
    >
      {children}
    </th>
  )
}

export function Tbody({ children }) {
  return (
    <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
      {children}
    </tbody>
  )
}

export function Td({ children, className = '', ...props }) {
  return (
    <td className={'px-4 py-3 text-sm text-slate-700 dark:text-slate-300 ' + className} {...props}>
      {children}
    </td>
  )
}
