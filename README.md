# Loc Imóveis App — Front-end

Interface web desenvolvida em **React** para gestão de portfólio imobiliário, permitindo que proprietários administrem imóveis, inquilinos, contratos de locação, solicitações de manutenção e indicadores financeiros em um único painel.

---

## Funcionalidades

* **Dashboard (`/dashboard`):**
  * Indicadores financeiros consolidados (Total Recebido, Gastos em Reformas, Inadimplência e Status de Ocupação dos Imóveis).
  * Gráfico interativo de **Fluxo de Caixa e Ocorrências** (visão de 6 ou 12 meses) com seleção direta por competência.
  * Filtro mensal global que recalcula os cartões de métricas e filtra a tabela de **Controle de Inadimplência e Pendências** com contagem de dias em atraso.
* **Meus Imóveis (`/imoveis`):**
  * Cadastro, edição, listagem e exclusão de imóveis.
  * Controle de status (`DISPONIVEL` / `ALUGADO`), endereço, valor de aluguel, valor de IPTU e upload de foto do imóvel.
* **Inquilinos (`/inquilinos`):**
  * CRUD completo de locatários com busca por nome, e-mail ou CPF e gerenciamento de status da conta (`ATIVA`, `INATIVA`, `BLOQUEADA`).
  * Histórico expansível por inquilino exibindo todos os imóveis alugados, vigência dos contratos, valores acordados e status (`Contrato Ativo`, `Encerrado`, `Rescindido`).
* **Contratos (`/contratos`):**
  * Acompanhamento das locações vinculando imóveis e inquilinos.
* **Manutenções (`/manutencoes`):**
  * Registro e acompanhamento de pedidos de manutenção e custos de reformas.
* **Financeiro (`/financeiro`):**
  * Controle detalhado de cobranças, recebimentos e parcelas em aberto.
* **Autenticação e Perfil:**
  * Login com armazenamento de token JWT (`AuthContext`), rotas protegidas e modal para edição dos dados cadastrais do usuário logado (`/auth/me`).
  * Layout responsivo com menu lateral fixo no desktop e barra de navegação adaptada para dispositivos móveis.

---

## Tecnologias Utilizadas

* **React** (Hooks: `useState`, `useEffect`, `useRef`, `useContext`)
* **React Router DOM** (Roteamento SPA e navegação ativa)
* **Tailwind CSS** (Estilização utilitária e responsividade)
* **Lucide React** (Biblioteca de ícones)
* **Axios / Fetch API** (Comunicação HTTP com autenticação via `Bearer Token`)

---

## Pré-requisitos

* **Node.js** (versão 18 ou superior)
* **npm** ou **yarn**
* **Back-end (Spring Boot)** em execução na porta `8081` (`http://localhost:8081`)

---

## Como Executar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO_FRONTEND>
   cd <PASTA_DO_PROJETO>
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Verifique a URL da API:**
   Certifique-se de que o serviço de API (`src/services/api.js`) e as requisições apontam para o endereço do back-end:
   ```javascript
   baseURL: 'http://localhost:8081'
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   Abra o endereço exibido no terminal (geralmente `http://localhost:5173`).

---

## Estrutura Principal do Projeto

```text
src/
├── contexts/
│   └── AuthContext.jsx       # Gerenciamento de sessão, token JWT e logout
├── pages/
│   ├── Dashboard.jsx         # MenuPrincipal, gráfico de fluxo de caixa e painel financeiro
│   ├── MeusImoveis.jsx       # Listagem, cadastro, edição e upload de fotos de imóveis
│   ├── Inquilinos.jsx        # CRUD de locatários e histórico expansível de locações
│   ├── Contratos.jsx         # Gestão de contratos de locação
│   ├── Manutencoes.jsx       # Pedidos de manutenção e despesas
│   └── Financeiro.jsx        # Gestão de cobranças e pagamentos
├── services/
│   └── api.js                # Instância HTTP configurada com interceptors de autenticação
└── App.jsx                   # Definição de rotas públicas e privadas
```