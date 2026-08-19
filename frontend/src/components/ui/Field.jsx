const fieldClasses =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ' +
  'disabled:bg-slate-100 disabled:text-slate-500 ' +
  'dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500'

export function Label({ children, htmlFor, required }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={fieldClasses + ' ' + className} {...props} />
}

export function Textarea({ className = '', rows = 3, ...props }) {
  return <textarea rows={rows} className={fieldClasses + ' ' + className} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={fieldClasses + ' ' + className} {...props}>
      {children}
    </select>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1 text-xs text-red-600 dark:text-red-400">{children}</p>
}

export function Field({ label, htmlFor, required, error, children, hint }) {
  return (
    <div>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      <FieldError>{error}</FieldError>
    </div>
  )
}
