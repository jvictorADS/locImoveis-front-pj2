import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Wallet,
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
      <aside className="flex w-[254px] shrink-0 flex-col bg-[#092b5a] px-4 pt-[27px] pb-[18px] text-white max-[700px]:hidden">
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

        <nav className="hidden grid-cols-4 gap-0 border-b border-[#e8edf2] bg-white px-2 pt-[7px] max-[700px]:grid" aria-label="Seções principais">
          {sections.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} end className={({ isActive }) => `flex min-h-[51px] min-w-0 flex-col items-center justify-center gap-[3px] border-b-2 px-px py-[3px] text-center text-[9px] font-semibold no-underline ${isActive ? 'border-[#15966a] text-[#092b5a]' : 'border-transparent text-[#6e7d90]'}`}>
              <Icon className="size-[15px]" aria-hidden="true" /><span className="whitespace-nowrap">{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="mx-auto w-full max-w-[1230px] px-[42px] pt-[38px] pb-[54px] max-[1050px]:px-7 max-[700px]:px-[18px] max-[700px]:pt-[25px] max-[700px]:pb-[38px]"><Outlet /></main>
      </div>
    </div>
  );
}

export function Dashboard() {
  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  return (
    <div className="dashboard-page">
      <div className="mb-[25px] flex items-end justify-between gap-5 max-[700px]:mb-[19px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-2">
        <div>
          <p className="mb-2 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">SEU ESPAÇO DE GESTÃO</p>
          <h1 className="m-0 text-[29px] leading-[1.2] font-extrabold text-[#092b5a] max-[700px]:text-[25px]">Visão geral</h1>
          <p className="mt-2 text-[13px] text-[#748196] max-[700px]:text-xs max-[700px]:leading-[1.5]">Tudo sobre seus imóveis, contratos e recebimentos.</p>
        </div>
        <time className="pb-[3px] text-xs text-[#7b8797] capitalize max-[700px]:text-[11px]" dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
      </div>

      <section className="relative flex min-h-[204px] items-center overflow-hidden rounded-[10px] bg-[#092b5a] px-9 py-[30px] text-white after:absolute after:-top-[220px] after:right-[115px] after:size-[370px] after:rounded-full after:border after:border-[#ffffff13] after:content-[''] after:shadow-[0_0_0_35px_#ffffff08,0_0_0_70px_#ffffff05] max-[700px]:min-h-[190px] max-[700px]:px-5 max-[700px]:py-6">
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

      <section className="mt-[33px] max-[700px]:mt-[26px]" aria-labelledby="sections-heading">
        <div className="mb-[15px] flex items-end justify-between">
          <div><p className="mb-1 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">ACESSO RÁPIDO</p><h2 className="m-0 text-[17px] font-bold text-[#092b5a]" id="sections-heading">Suas áreas</h2></div>
        </div>
        <div className="grid grid-cols-3 gap-[13px] max-[1050px]:grid-cols-1 max-[700px]:gap-[9px]">
          {sections.slice(1).map(({ path, label, description, icon: Icon }) => (
            <Link className="flex min-h-[98px] items-center gap-3 rounded-lg border border-[#e8edf2] bg-white p-4 text-inherit no-underline transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-[#a6d8c2] hover:shadow-[0_8px_20px_#18304d0c] max-[1050px]:min-h-[74px] max-[700px]:min-h-[70px] max-[700px]:p-3 motion-reduce:transition-none" to={path} key={path}>
              <span className="grid size-[38px] shrink-0 place-items-center rounded-lg bg-[#eaf6f0] text-[#15966a]"><Icon className="size-[19px]" aria-hidden="true" /></span>
              <span className="grid min-w-0 gap-[5px]"><strong className="text-xs text-[#092b5a]">{label}</strong><small className="text-[10px] leading-[1.4] text-[#748196]">{description}</small></span>
              <ArrowRight className="ml-auto size-4 shrink-0 text-[#98a5b5]" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 flex items-center gap-[14px] rounded-lg border border-[#dcece4] bg-[#f0f8f4] px-[18px] py-4 max-[700px]:flex-wrap max-[700px]:items-start max-[700px]:gap-[10px] max-[700px]:p-[14px]" aria-label="Resumo da carteira">
        <span className="grid size-[35px] shrink-0 place-items-center rounded-full bg-white text-[#15966a]"><LayoutDashboard className="size-[17px]" aria-hidden="true" /></span>
        <div className="max-[700px]:min-w-[180px] max-[700px]:flex-1"><h2 className="mb-1 text-xs text-[#092b5a]">Seu painel está pronto</h2><p className="m-0 text-[11px] leading-[1.5] text-[#63776f]">Selecione uma área para acompanhar os imóveis, contratos e cobranças da sua carteira.</p></div>
        <Link to="/imoveis" className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-[#08764e] no-underline hover:underline max-[700px]:ml-[45px]">Ver meus imóveis <ArrowRight className="size-[14px]" aria-hidden="true" /></Link>
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