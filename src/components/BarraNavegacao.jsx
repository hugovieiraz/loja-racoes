import { Home, Package, Users, ShoppingCart, HandCoins, BarChart3 } from 'lucide-react'

const ABAS = [
  { id: 'inicio', rotulo: 'Início', Icone: Home },
  { id: 'produtos', rotulo: 'Produtos', Icone: Package },
  { id: 'clientes', rotulo: 'Clientes', Icone: Users },
  { id: 'venda', rotulo: 'Venda', Icone: ShoppingCart },
  { id: 'fiados', rotulo: 'Fiados', Icone: HandCoins },
  { id: 'relatorios', rotulo: 'Relatórios', Icone: BarChart3 },
]

export default function BarraNavegacao({ abaAtiva, aoTrocar }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-6">
        {ABAS.map(({ id, rotulo, Icone }) => {
          const ativa = abaAtiva === id
          return (
            <button
              key={id}
              onClick={() => aoTrocar(id)}
              className={`flex flex-col items-center gap-0.5 py-2 ${
                ativa ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <Icone size={22} strokeWidth={ativa ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{rotulo}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
