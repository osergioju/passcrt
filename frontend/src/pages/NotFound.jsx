import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button.jsx'

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <p className="text-5xl">🔍</p>
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Página não encontrada</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">O endereço acessado não existe.</p>
      <Link to="/">
        <Button className="mt-2">Voltar ao início</Button>
      </Link>
    </div>
  )
}
