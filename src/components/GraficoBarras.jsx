// Gráfico de barras simples, sem bibliotecas — leve e rápido no celular.
export default function GraficoBarras({ itens, formatarValor }) {
  const maximo = Math.max(...itens.map((i) => i.valor), 1)
  const [melhor] = [...itens].sort((a, b) => b.valor - a.valor)

  return (
    <div>
      <div className="flex items-end gap-[2px] h-28">
        {itens.map((item) => (
          <div
            key={item.rotulo}
            className={`flex-1 rounded-t ${
              item.valor > 0
                ? item === melhor
                  ? 'bg-emerald-500'
                  : 'bg-emerald-600/60'
                : 'bg-slate-200'
            }`}
            style={{ height: item.valor > 0 ? `${Math.max((item.valor / maximo) * 100, 3)}%` : '2px' }}
            title={`${item.rotulo}: ${formatarValor(item.valor)}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{itens[0]?.rotulo}</span>
        <span>{itens[Math.floor(itens.length / 2)]?.rotulo}</span>
        <span>{itens[itens.length - 1]?.rotulo}</span>
      </div>
      {melhor && melhor.valor > 0 && (
        <div className="text-xs text-slate-500 mt-2">
          Melhor dia: <strong className="text-emerald-600">{melhor.rotulo}</strong> com{' '}
          <strong>{formatarValor(melhor.valor)}</strong>
        </div>
      )}
    </div>
  )
}
