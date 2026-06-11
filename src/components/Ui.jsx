import { Search, X } from 'lucide-react'

// Componentes visuais reutilizáveis, pensados para uso no celular (botões grandes, toque fácil).

export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 p-4 ${onClick ? 'active:bg-slate-50 active:scale-[0.99] transition-transform cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function CardResumo({ titulo, valor, destaque = 'text-slate-800', icone = null }) {
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        {icone}
        <span>{titulo}</span>
      </div>
      <div className={`text-xl font-bold ${destaque}`}>{valor}</div>
    </Card>
  )
}

export function Botao({ children, variante = 'primario', className = '', ...props }) {
  const estilos = {
    primario: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 active:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none',
    secundario: 'bg-slate-200 text-slate-800 active:bg-slate-300',
    perigo: 'bg-red-600 text-white shadow-sm shadow-red-600/30 active:bg-red-700',
    contorno: 'border-2 border-emerald-600 text-emerald-700 active:bg-emerald-50',
  }
  return (
    <button
      className={`w-full py-3.5 px-4 rounded-xl font-semibold text-base transition-all active:scale-[0.98] ${estilos[variante]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Campo({ rotulo, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{rotulo}</span>
      <input
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
        {...props}
      />
    </label>
  )
}

export function CampoArea({ rotulo, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{rotulo}</span>
      <textarea
        rows={2}
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
        {...props}
      />
    </label>
  )
}

export function CampoSelecao({ rotulo, opcoes, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-600">{rotulo}</span>
      <select
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
        {...props}
      >
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Busca({ valor, aoMudar, placeholder = 'Pesquisar...' }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
      <input
        type="search"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  )
}

export function Vazio({ mensagem }) {
  return (
    <div className="text-center text-slate-400 py-12 px-4">{mensagem}</div>
  )
}

export function Selo({ children, cor = 'bg-slate-100 text-slate-600' }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${cor}`}>
      {children}
    </span>
  )
}

export function Avatar({ foto, nome, tamanho = 'w-12 h-12' }) {
  if (foto) {
    return (
      <img
        src={foto}
        alt={nome}
        className={`${tamanho} rounded-full object-cover shrink-0`}
      />
    )
  }
  const iniciais = (nome || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
  return (
    <div
      className={`${tamanho} rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0`}
    >
      {iniciais}
    </div>
  )
}

export function Modal({ titulo, aberto, aoFechar, children }) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={aoFechar} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{titulo}</h2>
          <button
            onClick={aoFechar}
            className="p-2 rounded-full active:bg-slate-100"
            aria-label="Fechar"
          >
            <X size={22} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export function Cabecalho({ titulo, acao = null }) {
  return (
    <header className="sticky top-0 z-10 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-3.5 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2.5">
        <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="w-8 h-8 rounded-lg shadow-sm" />
        <h1 className="text-lg font-bold tracking-tight">{titulo}</h1>
      </div>
      {acao}
    </header>
  )
}
