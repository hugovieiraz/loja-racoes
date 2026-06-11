# Loja de Rações — Controle de Vendas

Aplicativo web simples, mobile-first, para controle diário de uma pequena loja de rações: produtos, clientes, vendas (à vista e fiado), débitos, pagamentos, estoque, lucro e relatórios.

## Tecnologias

- React 19 + Vite
- Tailwind CSS 4
- Dados salvos no **localStorage** do navegador (sem login, sem servidor)
- Ícones: lucide-react

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (ex.: `http://localhost:5173`). Para acessar pelo celular na mesma rede Wi-Fi, rode `npm run dev -- --host` e use o IP do computador.

## Como publicar (Vercel)

```bash
npm run build
```

O projeto está pronto para a Vercel: basta importar o repositório do GitHub — a Vercel detecta o Vite automaticamente. Depois é só abrir o link no celular e "Adicionar à tela inicial" para usar como aplicativo.

## Estrutura

```
src/
├── App.jsx                  # Navegação por abas
├── main.jsx                 # Ponto de entrada
├── index.css                # Tailwind
├── context/
│   └── DadosContext.jsx     # Estado global + persistência no localStorage
├── components/
│   ├── BarraNavegacao.jsx   # Abas inferiores (estilo app)
│   └── Ui.jsx               # Componentes reutilizáveis (Card, Botao, Campo, Modal...)
├── pages/
│   ├── Dashboard.jsx        # Resumo do dia/mês, débitos e estoque baixo
│   ├── Produtos.jsx         # Cadastro de produtos com lucro por saco
│   ├── Clientes.jsx         # Lista e cadastro de clientes (com foto)
│   ├── ClienteDetalhe.jsx   # Página do cliente: histórico, débito, pagamentos
│   ├── Venda.jsx            # Registro rápido de venda + histórico
│   ├── HistoricoVendas.jsx  # Histórico com filtros
│   ├── Fiados.jsx           # Débitos, pagamento parcial e quitação
│   └── Relatorios.jsx       # Relatórios por dia/mês + backup JSON
└── utils/
    ├── formato.js           # Moeda (R$, em centavos), datas, formas de pagamento
    ├── calculos.js          # Débitos, totais, rankings
    └── imagem.js            # Compressão da foto do cliente
```

## Regras importantes

- **Valores em centavos**: todos os preços são guardados como inteiros (centavos) para evitar erros de arredondamento.
- **Venda fiada**: entra no histórico do cliente **e** soma no débito dele. Venda à vista só entra no histórico.
- **Estoque**: baixa automática a cada venda; excluir uma venda devolve os itens ao estoque.
- **Débito do cliente** = total de compras fiadas − total de pagamentos.
- **Backup**: exporte o JSON com frequência (aba Relatórios). Os dados ficam apenas no navegador do celular.
