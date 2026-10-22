# DDM Indústria — Loja virtual (front-end)

Front-end em React + Vite do e-commerce da DDM Indústria e Comércio, fabricante de peças técnicas de borracha (sapatas para compactadores, coxins, proteções sanfonadas e molas). Inclui loja, checkout e painel administrativo, todos consumindo uma API própria.

<!-- Prints: adicionar imagens em docs/screenshots/ e referenciar aqui -->

## Destaques

- **Catálogo técnico com filtros combináveis:** busca por nome ou código DDM, filtros por categoria, marca, série e modelo de máquina, ordenação por nome, código ou preço e visualização em grade ou lista.
- **Página de produto completa:** galeria com miniaturas e zoom que acompanha o cursor, seletor pesquisável de modelos compatíveis e ficha técnica responsiva que mostra só os campos preenchidos (tabela no desktop, cards no celular).
- **Carrinho que funciona sem login:** os itens ficam salvos na API, ligados ao usuário ou a um ID de sessão anônima. No login, o que estava no carrinho local é sincronizado com a conta.
- **Checkout em 4 etapas:** identificação e endereço (preenchimento automático pelo ViaCEP e cadastro do visitante durante a compra), envio, pagamento (PIX com 5% de desconto ou cartão em até 12x) e confirmação.
- **Painel administrativo:** dashboard com gráficos, CRUD de produtos com upload de várias imagens, cadastro de embalagens e das tabelas técnicas.
- **Feito para celular:** menu lateral (drawer), filtros em painel deslizante e barra de compra fixa no rodapé da página de produto.

## Funcionalidades

### Loja

- **Home:** slider de banners com troca automática e animações (Framer Motion), mais uma vitrine com produtos ativos.
- **Catálogo (`/catalogo`):** os filtros de categoria e marca também podem vir pela URL (`?id_categoria=`, `?id_marca=`), e é assim que funcionam os links do menu e do rodapé.
- **Produto (`/produto?id=`):** preço com o valor no PIX em destaque, simulação de frete por CEP (serviço, prazo e preço retornados pela API) e botões "Adicionar" e "Comprar já".
- **Carrinho:** alteração de quantidade, remoção de itens, subtotal e simulação de frete. O contador do cabeçalho se atualiza na hora.
- **Checkout:** pré-visualização animada do cartão de crédito e cálculo das parcelas. O pedido é registrado na API com status "Pendente" e um número de protocolo. Ainda não há gateway de pagamento integrado.
- **Conta:** login, cadastro com CPF/CNPJ, edição de dados, troca de senha e gerenciamento de endereços, com um endereço favorito para entrega.
- **Institucional:** páginas Quem Somos e Contato.

### Painel administrativo (`/admin`, só para o perfil administrador)

- **Dashboard:** faturamento diário dos últimos 30 dias (gráfico de linha), os 5 produtos mais vendidos (barras) e a situação do estoque, separada em normal, baixo (até 5 unidades) e zerado (pizza).
- **Produtos:** listagem com busca por nome ou código, status ativo/inativo, criação, edição e exclusão. O formulário é dividido em abas (Geral, Dimensões, Técnico, Aplicações, Imagens) e valida os campos obrigatórios.
- **Imagens:** envio de várias imagens de uma vez, pré-visualização antes de salvar um produto novo, escolha da imagem de capa e remoção.
- **Vendas:** listagem dos pedidos com busca e status destacado por cor.
- **Embalagens:** cadastro de caixas com dimensões e peso máximo, além de ativar e desativar cada uma.
- **Técnica:** CRUD das tabelas auxiliares (roscas, materiais, cores, durezas, categorias e a hierarquia marca → série → modelo), todas com o mesmo componente de tabela genérico.

## Stack

**Front-end (este repositório)**

- React 18 + Vite 5
- React Router 6: rotas públicas, rotas protegidas e rotas exclusivas de admin
- TanStack Query 5: cache e sincronização dos dados do servidor
- Tailwind CSS 3, com clsx + tailwind-merge
- Recharts nos gráficos do dashboard
- Framer Motion nas animações, Lucide nos ícones e Sonner nas notificações
- ESLint

**Back-end:** API própria em Node.js/Express (repositório separado), com Express 5, MySQL (mysql2), autenticação JWT, senhas com bcrypt e upload de imagens com multer.

**Serviço externo:** ViaCEP, para buscar o endereço pelo CEP.

## Decisões técnicas

- **Uma única camada de acesso à API (`src/api/MysqlServer.js`).** A função `apiRequest` concentra todas as chamadas. Ela anexa o token JWT no cabeçalho `Authorization`, trata tanto JSON quanto `FormData` (upload) e, se receber 401, encerra a sessão e manda para o login. As URLs da API e das imagens vêm de variáveis de ambiente (`VITE_API_URL`, `VITE_IMG_URL`), então nenhum endereço fica fixo no código.
- **Estado do servidor com TanStack Query.** O contador do cabeçalho, a página do carrinho e o checkout leem a mesma query. Cada alteração invalida o cache, e todos se atualizam sem recarregar a página.
- **Componentes de UI próprios (`src/Components/ui`).** Button, dialog, select, sheet, tabs, accordion, table e os demais seguem a API do shadcn/ui, mas foram escritos com React Context e Tailwind. Não há biblioteca de componentes por trás: a única peça externa é o `Slot` do Radix, usado no padrão `asChild`.
- **Regra de embalagem isolada (`src/Components/shipping/BoxLogic.js`).** A função pura `findBestBox` soma o volume e o peso dos itens, ordena as caixas ativas da menor para a maior e devolve a primeira que comporta os dois. Se nenhuma comporta, devolve a maior, o que indica que o pedido precisa ser dividido. Como não depende de React, é fácil de testar e está pronta para entrar no cálculo de frete.

## Como rodar

Pré-requisitos: Node.js 18+ e a API rodando.

```bash
npm install
```

Crie um arquivo `.env.local` na raiz do projeto. O padrão `*.local` já está no `.gitignore`, então ele não vai para o repositório.

```env
# URL base da API
VITE_API_URL=
# URL base de onde as imagens dos produtos são servidas
VITE_IMG_URL=
```

```bash
npm run dev       # servidor de desenvolvimento
npm run build     # build de produção em dist/
npm run preview   # serve o build localmente
npm run lint      # análise estática com ESLint
```

## Autor

**Marcos Sergio**, desenvolvedor PHP / Full Stack em Brasília.
[LinkedIn](https://www.linkedin.com/in/marcos-sergio-jord%C3%A3o-de-sousa-8b6864180)
