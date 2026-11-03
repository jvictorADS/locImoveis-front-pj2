import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Wallet,
  TrendingUp,
  Wrench,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Users,
  PlusCircle,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const sections = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    description: 'Visão geral da sua operação',
    icon: LayoutDashboard,
  },
  {
    path: '/imoveis',
    label: 'Meus imóveis',
    description: 'Acompanhe seu portfólio',
    icon: Building2,
  },
  {
    path: '/inquilinos',
    label: 'Inquilinos',
    description: 'Gerencie os locatários',
    icon: Users,
  },
  {
    path: '/contratos',
    label: 'Contratos',
    description: 'Consulte as locações',
    icon: FileText,
  },
  {
    path: '/financeiro',
    label: 'Financeiro',
    description: 'Acompanhe as cobranças',
    icon: Wallet,
  },
];

const sectionDetails = {
  imoveis: {
    title: 'Meus imóveis',
    eyebrow: 'PORTFÓLIO',
    description: 'Seus imóveis em um só lugar.',
    icon: Building2,
    emptyTitle: 'Nenhum imóvel para exibir',
    emptyDescription: 'Quando seus imóveis estiverem disponíveis, você poderá acompanhá-los por aqui.',
  },
  inquilinos: {
    title: 'Inquilinos',
    eyebrow: 'CADASTROS',
    description: 'Gerencie os locatários da sua carteira.',
    icon: Users,
    emptyTitle: 'Nenhum inquilino para exibir',
    emptyDescription: 'Cadastre os locatários para vincular aos seus imóveis e contratos.',
  },
  contratos: {
    title: 'Contratos',
    eyebrow: 'LOCAÇÕES',
    description: 'Acompanhe os contratos de locação.',
    icon: FileText,
    emptyTitle: 'Nenhum contrato para exibir',
    emptyDescription: 'Os contratos vinculados aos seus imóveis serão apresentados nesta área.',
  },
  financeiro: {
    title: 'Financeiro',
    eyebrow: 'COBRANÇAS',
    description: 'Tenha clareza sobre as movimentações da sua carteira.',
    icon: Wallet,
    emptyTitle: 'Nenhuma cobrança para exibir',
    emptyDescription: 'As cobranças relacionadas aos contratos poderão ser acompanhadas nesta área.',
  },
};

export function MenuPrincipal() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = sections.find((section) => section.path === location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8fa] text-[#18304d] max-[700px]:block">
      <aside className="sticky top-0 flex h-screen w-[254px] shrink-0 flex-col bg-[#092b5a] px-4 pt-[27px] pb-[18px] text-white max-[700px]:hidden">
        <Link className="mb-[54px] ml-2 inline-flex items-center gap-[10px] self-start text-white no-underline" to="/dashboard" aria-label="Loc Imóveis, ir para o dashboard">
          <span className="grid size-[38px] place-items-center rounded-[10px] bg-[#15966a]"><Home className="size-[21px]" aria-hidden="true" /></span>
          <span className="flex items-baseline gap-1.5 text-[17px] font-bold">Loc Imóveis<span className="text-[10px] font-bold text-[#70d8ad]">App</span></span>
        </Link>

        <div className="mb-3 px-3 text-[10px] font-extrabold tracking-[.08em] text-[#94a9c5]">MENU PRINCIPAL</div>
        <nav className="grid gap-[5px]" aria-label="Seções principais">
          {sections.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) => `flex min-h-[45px] items-center gap-3 rounded-lg px-3 text-[13px] font-semibold text-[#d7e0ec] no-underline transition-colors hover:bg-[#ffffff12] hover:text-white ${isActive ? 'bg-[#ffffff19] text-white shadow-[inset_3px_0_#15966a]' : ''}`}
            >
              <Icon className={`size-[18px] ${path === activeSection?.path ? 'text-[#78dfb4]' : 'text-[#a9bbd0]'}`} aria-hidden="true" />
              <span>{label}</span>
              {path === activeSection?.path && <span className="ml-auto size-1.5 rounded-full bg-[#78dfb4]" aria-hidden="true" />}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-[10px] border-t border-[#ffffff20] px-2 pt-[14px] pb-[18px]">
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#d9eee5] bg-[#e8f6ef] text-xs font-extrabold text-[#092b5a]">L</span>
            <span className="grid gap-[3px]"><strong className="text-xs text-white">Minha conta</strong><small className="text-[11px] text-[#b3c3d7]">Proprietário</small></span>
          </div>
          <button className="flex w-full cursor-pointer items-center gap-[11px] rounded-[7px] border-0 bg-transparent px-[10px] py-[11px] text-left text-xs text-[#d7e0ec] hover:bg-[#ffffff12] hover:text-white" type="button" onClick={handleLogout}>
            <LogOut className="size-[17px]" aria-hidden="true" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[70px] items-center justify-between border-b border-[#e8edf2] bg-white px-[42px] max-[1050px]:px-7 max-[700px]:h-[60px] max-[700px]:px-[18px]">
          <div className="hidden items-center gap-2 text-[13px] text-[#092b5a] max-[700px]:flex">
            <span className="grid size-[30px] place-items-center rounded-lg bg-[#15966a]"><Home className="size-[17px]" aria-hidden="true" /></span>
            <strong>Loc Imóveis</strong>
          </div>
          <div className="flex items-center gap-[10px] text-xs text-[#8995a5] max-[700px]:hidden">
            <span>Loc Imóveis</span><span aria-hidden="true">/</span><strong className="font-bold text-[#092b5a]">{activeSection?.label}</strong>
          </div>
          <div className="flex items-center gap-[9px] text-xs font-semibold text-[#46566b] max-[700px]:text-[0px]"><span className="grid size-[30px] shrink-0 place-items-center rounded-full border border-[#d9eee5] bg-[#e8f6ef] text-xs font-extrabold text-[#092b5a]">L</span><span>Proprietário</span></div>
          <button className="hidden size-8 cursor-pointer place-items-center rounded-[7px] border-0 bg-transparent text-[#092b5a] hover:bg-[#f0f4f6] max-[700px]:grid" type="button" onClick={handleLogout} aria-label="Sair da conta" title="Sair da conta">
            <LogOut className="size-[17px]" aria-hidden="true" />
          </button>
        </header>

        {/* Menu Responsivo Mobile com 5 Colunas */}
        <nav className="hidden grid-cols-5 gap-0 border-b border-[#e8edf2] bg-white px-2 pt-[7px] max-[700px]:grid" aria-label="Seções principais">
          {sections.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} end className={({ isActive }) => `flex min-h-[51px] min-w-0 flex-col items-center justify-center gap-[3px] border-b-2 px-px py-[3px] text-center text-[9px] font-semibold no-underline ${isActive ? 'border-[#15966a] text-[#092b5a]' : 'border-transparent text-[#6e7d90]'}`}>
              <Icon className="size-[15px]" aria-hidden="true" /><span className="truncate max-w-full px-0.5">{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-[1230px] px-[42px] pt-[38px] pb-[54px] max-[1050px]:px-7 max-[700px]:px-[18px] max-[700px]:pt-[25px] max-[700px]:pb-[38px]"><Outlet /></main>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [metricas, setMetricas] = useState(null);
  const [inadimplentes, setInadimplentes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setIsLoading(true);
        
        // TODO: Substitua este bloco pela sua chamada de API real.
        const data = {
          metricas: {
            recebidoMes: 0,
            gastosReformas: 0,
            totalPendente: 0,
            imoveisAlugados: 0,
            imoveisVagos: 0,
          },
          inadimplentes: [],
          graficoFluxo: [] 
        };

        setMetricas(data.metricas);
        setInadimplentes(data.inadimplentes);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

  if (isLoading || !metricas) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-[#15966a]">
        <Loader2 className="size-8 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-[#092b5a]">Carregando seu painel...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Cabeçalho */}
      <div className="mb-[25px] flex items-end justify-between gap-5 max-[700px]:mb-[19px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-2">
        <div>
          <p className="mb-2 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">SEU ESPAÇO DE GESTÃO</p>
          <h1 className="m-0 text-[29px] leading-[1.2] font-extrabold text-[#092b5a] max-[700px]:text-[25px]">Visão geral</h1>
          <p className="mt-2 text-[13px] text-[#748196] max-[700px]:text-xs max-[700px]:leading-[1.5]">Tudo sobre seus imóveis, contratos e recebimentos.</p>
        </div>
        <time className="pb-[3px] text-xs text-[#7b8797] capitalize max-[700px]:text-[11px]" dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
      </div>

      {/* Banner de Boas-Vindas */}
      <section className="relative flex min-h-[204px] items-center overflow-hidden rounded-[10px] bg-[#092b5a] px-9 py-[30px] text-white mb-8 after:absolute after:-top-[220px] after:right-[115px] after:size-[370px] after:rounded-full after:border after:border-[#ffffff13] after:content-[''] after:shadow-[0_0_0_35px_#ffffff08,0_0_0_70px_#ffffff05] max-[700px]:min-h-[190px] max-[700px]:px-5 max-[700px]:py-6">
        <div className="relative z-[1] max-w-[520px] max-[700px]:max-w-[90%]">
          <span className="text-[9px] font-bold tracking-[.12em] text-[#9eafc4] max-[700px]:text-[8px]">LOC IMÓVEIS <span className="px-[5px] text-[#74d8ae]" aria-hidden="true">/</span> PAINEL DO PROPRIETÁRIO</span>
          <h2 className="mt-[18px] mb-2 text-[26px] leading-[1.2] font-bold text-white max-[700px]:mt-[15px] max-[700px]:max-w-[240px] max-[700px]:text-[22px]">Bem-vindo ao seu painel.</h2>
          <p className="m-0 text-[13px] text-[#c5d1df] max-[700px]:max-w-[230px] max-[700px]:text-[11px] max-[700px]:leading-[1.5]">Uma visão clara para cuidar da sua carteira de locação.</p>
        </div>
        <div className="absolute right-[35px] bottom-0 h-[180px] w-[255px] max-[700px]:right-[-78px] max-[700px]:opacity-[.55]" aria-hidden="true">
          <div className="absolute right-[132px] bottom-7 grid h-[102px] w-[78px] grid-cols-2 gap-[9px] border border-[#ffffff43] bg-[#ffffff12] px-3 pt-[15px] pb-3 opacity-[.72]"><span className="h-[14px] w-[10px] bg-[#84ddb6]" /><span className="h-[14px] w-[10px] bg-[#84ddb6]" /><span className="h-[14px] w-[10px] bg-[#84ddb6]" /><span className="h-[14px] w-[10px] bg-[#84ddb6]" /></div>
          <div className="absolute right-10 bottom-7 grid h-[133px] w-[106px] grid-cols-2 gap-[9px] border border-[#ffffff70] bg-[#ffffff1c] px-3 pt-[15px] pb-3"><span className="h-4 w-3 bg-[#84ddb6]" /><span className="h-4 w-3 bg-[#84ddb6]" /><span className="h-4 w-3 bg-[#84ddb6]" /><span className="h-4 w-3 bg-[#84ddb6]" /></div>
          <div className="absolute right-0 bottom-[27px] left-0 h-px bg-[#ffffff60]" />
        </div>
      </section>

      {/* BLOCO DE ACESSO RÁPIDO */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide uppercase text-[#092b5a]">Acesso Rápido</h2>
        </div>
        <div className="grid grid-cols-4 gap-4 max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1">
          <Link
            to="/inquilinos"
            className="flex items-center justify-between rounded-lg border border-[#e8edf2] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#15966a] hover:shadow-md no-underline group"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-[#eaf6f0] text-[#15966a] group-hover:bg-[#15966a] group-hover:text-white transition-colors">
                <Users className="size-5" />
              </span>
              <div>
                <strong className="block text-sm font-bold text-[#092b5a]">Inquilinos</strong>
                <span className="text-xs text-[#748196]">Gerenciar locatários</span>
              </div>
            </div>
            <ChevronRight className="size-4 text-[#8995a5] group-hover:text-[#15966a] transition-colors" />
          </Link>

          <Link
            to="/imoveis"
            className="flex items-center justify-between rounded-lg border border-[#e8edf2] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#15966a] hover:shadow-md no-underline group"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-[#f0f4f8] text-[#092b5a] group-hover:bg-[#092b5a] group-hover:text-white transition-colors">
                <Building2 className="size-5" />
              </span>
              <div>
                <strong className="block text-sm font-bold text-[#092b5a]">Meus Imóveis</strong>
                <span className="text-xs text-[#748196]">Cadastrar e listar</span>
              </div>
            </div>
            <ChevronRight className="size-4 text-[#8995a5] group-hover:text-[#092b5a] transition-colors" />
          </Link>

          <Link
            to="/contratos"
            className="flex items-center justify-between rounded-lg border border-[#e8edf2] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#15966a] hover:shadow-md no-underline group"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-[#f0f4f8] text-[#092b5a] group-hover:bg-[#092b5a] group-hover:text-white transition-colors">
                <FileText className="size-5" />
              </span>
              <div>
                <strong className="block text-sm font-bold text-[#092b5a]">Contratos</strong>
                <span className="text-xs text-[#748196]">Criar e consultar</span>
              </div>
            </div>
            <ChevronRight className="size-4 text-[#8995a5] group-hover:text-[#092b5a] transition-colors" />
          </Link>

          <Link
            to="/financeiro"
            className="flex items-center justify-between rounded-lg border border-[#e8edf2] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#15966a] hover:shadow-md no-underline group"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-[#f0f4f8] text-[#092b5a] group-hover:bg-[#092b5a] group-hover:text-white transition-colors">
                <Wallet className="size-5" />
              </span>
              <div>
                <strong className="block text-sm font-bold text-[#092b5a]">Financeiro</strong>
                <span className="text-xs text-[#748196]">Baixas e relatórios</span>
              </div>
            </div>
            <ChevronRight className="size-4 text-[#8995a5] group-hover:text-[#092b5a] transition-colors" />
          </Link>
        </div>
      </section>

      {/* Cartões de Métricas */}
      <section className="grid grid-cols-4 gap-[15px] mb-8 max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1">
        <div className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <span className="grid size-8 place-items-center rounded-md bg-[#eaf6f0] text-[#15966a]"><TrendingUp className="size-4" /></span>
            <span className="text-xs font-semibold text-[#748196]">Total Recebido (Mês)</span>
          </div>
          <strong className="text-2xl font-bold text-[#092b5a]">{formatarMoeda(metricas.recebidoMes)}</strong>
        </div>

        <div className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <span className="grid size-8 place-items-center rounded-md bg-[#fff4e5] text-[#f2994a]"><Wrench className="size-4" /></span>
            <span className="text-xs font-semibold text-[#748196]">Gastos em Reformas</span>
          </div>
          <strong className="text-2xl font-bold text-[#092b5a]">{formatarMoeda(metricas.gastosReformas)}</strong>
        </div>

        <div className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <span className="grid size-8 place-items-center rounded-md bg-[#feeeee] text-[#eb5757]"><AlertCircle className="size-4" /></span>
            <span className="text-xs font-semibold text-[#748196]">Total Pendente</span>
          </div>
          <strong className="text-2xl font-bold text-[#eb5757]">{formatarMoeda(metricas.totalPendente)}</strong>
        </div>

        <div className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <span className="grid size-8 place-items-center rounded-md bg-[#f0f4f8] text-[#46566b]"><Home className="size-4" /></span>
            <span className="text-xs font-semibold text-[#748196]">Status dos Imóveis</span>
          </div>
          <div className="flex items-end gap-2">
            <strong className="text-2xl font-bold text-[#092b5a]">{metricas.imoveisAlugados}</strong>
            <span className="text-xs text-[#748196] mb-1">alugados /</span>
            <strong className="text-xl font-bold text-[#8995a5]">{metricas.imoveisVagos}</strong>
            <span className="text-xs text-[#748196] mb-1">vagos</span>
          </div>
        </div>
      </section>

      {/* Estrutura do Gráfico (Fluxo de Caixa) */}
      <section className="rounded-lg border border-[#e8edf2] bg-white p-6 shadow-sm mb-8">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#092b5a]">Fluxo de Caixa e Ocorrências</h2>
            <p className="mt-1 text-[13px] text-[#748196]">Arrecadação vs. Inadimplência vs. Gastos com Reformas.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium text-[#46566b]">
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#092b5a]"></span>Arrecadado</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#f2c94c]"></span>Reformas/Desp.</div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#eb5757]"></span>Inadimplência</div>
          </div>
        </div>

        <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-md border-2 border-dashed border-[#e8edf2] bg-[#fcfcfd] text-[#8995a5]">
          <TrendingUp className="mb-3 size-8 opacity-40" />
          <span className="text-[13px] font-medium">Área reservada para o Gráfico de Barras</span>
          <span className="mt-1 text-[11px] opacity-70">Aguardando integração com os dados da API</span>
        </div>
      </section>

      {/* Tabela de Controle/Alertas */}
      <section className="rounded-lg border border-[#e8edf2] bg-white overflow-hidden shadow-sm mb-8">
        <div className="flex items-center gap-2 border-b border-[#e8edf2] bg-[#fcfcfd] px-5 py-4">
          <AlertTriangle className="size-4 text-[#eb5757]" />
          <h2 className="text-[14px] font-bold text-[#092b5a]">Atenção: Pagamentos em atraso</h2>
        </div>

        {inadimplentes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f9fafb] text-[#748196]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Inquilino</th>
                  <th className="px-5 py-3 font-semibold">Imóvel</th>
                  <th className="px-5 py-3 font-semibold">Atraso</th>
                  <th className="px-5 py-3 font-semibold">Valor Pendente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edf2]">
                {inadimplentes.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f6f8fa] transition-colors">
                    <td className="px-5 py-3 font-medium text-[#092b5a]">{item.inquilino}</td>
                    <td className="px-5 py-3 text-[#46566b]">{item.imovel}</td>
                    <td className="px-5 py-3 text-[#eb5757] font-semibold">{item.diasAtraso} dias</td>
                    <td className="px-5 py-3 font-medium text-[#092b5a]">{formatarMoeda(item.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-[13px] text-[#748196]">
            Nenhum registro de inadimplência no momento.
          </div>
        )}
      </section>
    </div>
  );
}

export function SectionPage({ section }) {
  const { title, eyebrow, description, icon: Icon, emptyTitle, emptyDescription } = sectionDetails[section];

  return (
    <div className="section-page">
      <div className="mb-[26px] max-[700px]:mb-[19px]">
        <div><p className="mb-2 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">{eyebrow}</p><h1 className="m-0 text-[29px] leading-[1.2] font-extrabold text-[#092b5a] max-[700px]:text-[25px]">{title}</h1><p className="mt-2 text-[13px] text-[#748196] max-[700px]:text-xs max-[700px]:leading-[1.5]">{description}</p></div>
      </div>
      <section className="flex min-h-[310px] flex-col items-center justify-center rounded-[9px] border border-[#e8edf2] bg-white px-5 py-8 text-center max-[700px]:min-h-[275px] max-[700px]:px-[18px] max-[700px]:py-[25px]">
        <span className="mb-[17px] grid size-[54px] place-items-center rounded-full bg-[#eaf6f0] text-[#15966a]"><Icon className="size-6" aria-hidden="true" /></span>
        <h2 className="m-0 text-base text-[#092b5a]">{emptyTitle}</h2>
        <p className="mt-2 mb-[19px] max-w-[400px] text-xs leading-[1.6] text-[#748196]">{emptyDescription}</p>
        <Link to="/dashboard" className="inline-flex items-center gap-[7px] text-xs font-bold text-[#15966a] no-underline hover:underline"><ArrowRight className="size-[15px] rotate-180" aria-hidden="true" /> Voltar ao dashboard</Link>
      </section>
    </div>
  );
}