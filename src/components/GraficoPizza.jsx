// Gráfico de pizza (rosca) em SVG puro — leve, sem bibliotecas.
const CORES = ['#28663c', '#e3a23c', '#c05b4d', '#5b8bc0', '#8a62a8', '#6aa84f', '#b08968', '#64748b']

export default function GraficoPizza({ itens, unidade = 'un.' }) {
  const total = itens.reduce((s, i) => s + i.valor, 0)
  if (total <= 0) {
    return <div className="text-center text-slate-400 py-8">Sem dados no período.</div>
  }

  const raio = 42
  const circunferencia = 2 * Math.PI * raio
  let acumulado = 0
  const fatias = itens.map((item, i) => {
    const fracao = item.valor / total
    const fatia = { ...item, fracao, offset: acumulado, cor: CORES[i % CORES.length] }
    acumulado += fracao
    return fatia
  })

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0 -rotate-90">
        {fatias.map((f) => (
          <circle
            key={f.rotulo}
            cx="60"
            cy="60"
            r={raio}
            fill="none"
            stroke={f.cor}
            strokeWidth="26"
            strokeDasharray={`${Math.max(f.fracao * circunferencia - 1.5, 0.5)} ${circunferencia}`}
            strokeDashoffset={-f.offset * circunferencia}
          />
        ))}
      </svg>
      <div className="flex-1 min-w-0 space-y-1.5">
        {fatias.map((f) => (
          <div key={f.rotulo} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: f.cor }} />
            <span className="flex-1 truncate text-slate-700">{f.rotulo}</span>
            <span className="font-semibold text-slate-800 shrink-0">
              {f.valor} {unidade}
            </span>
            <span className="text-slate-400 text-xs shrink-0 w-10 text-right">
              {Math.round(f.fracao * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
