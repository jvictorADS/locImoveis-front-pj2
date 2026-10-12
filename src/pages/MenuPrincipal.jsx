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
import './MenuPrincipal.css';

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
    <div className="menu-app">
      <aside className="menu-sidebar">
        <Link className="menu-brand" to="/dashboard" aria-label="Loc Imóveis, ir para o dashboard">
          <span className="menu-brand-mark"><Home aria-hidden="true" /></span>
          <span className="menu-brand-name">Loc Imóveis<span>App</span></span>
        </Link>

        <div className="menu-nav-label">MENU PRINCIPAL</div>
        <nav className="menu-nav" aria-label="Seções principais">
          {sections.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end
              className={({ isActive }) => `menu-nav-link${isActive ? ' is-active' : ''}`}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              {path === activeSection?.path && <span className="menu-active-dot" aria-hidden="true" />}
            </NavLink>
          ))}
        </nav>

        <div className="menu-sidebar-bottom">
          <div className="menu-account">
            <span className="menu-avatar">L</span>
            <span className="menu-account-copy"><strong>Minha conta</strong><small>Proprietário</small></span>
          </div>
          <button className="menu-logout" type="button" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <div className="menu-main-column">
        <header className="menu-topbar">
          <div className="menu-mobile-brand">
            <span className="menu-brand-mark"><Home aria-hidden="true" /></span>
            <strong>Loc Imóveis</strong>
          </div>
          <div className="menu-breadcrumb">
            <span>Loc Imóveis</span><span aria-hidden="true">/</span><strong>{activeSection?.label}</strong>
          </div>
          <div className="menu-topbar-account"><span className="menu-avatar">L</span><span>Proprietário</span></div>
          <button className="menu-mobile-logout" type="button" onClick={handleLogout} aria-label="Sair da conta" title="Sair da conta">
            <LogOut aria-hidden="true" />
          </button>
        </header>

        <nav className="menu-mobile-tabs" aria-label="Seções principais">
          {sections.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} end className={({ isActive }) => `menu-mobile-tab${isActive ? ' is-active' : ''}`}>
              <Icon aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="menu-content"><Outlet /></main>
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
      <div className="dashboard-heading">
        <div>
          <p className="menu-eyebrow">SEU ESPAÇO DE GESTÃO</p>
          <h1>Visão geral</h1>
          <p className="dashboard-subtitle">Tudo sobre seus imóveis, contratos e recebimentos.</p>
        </div>
        <time className="dashboard-date" dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
      </div>

      <section className="dashboard-welcome">
        <div className="welcome-copy">
          <span className="welcome-kicker">LOC IMÓVEIS <span aria-hidden="true">/</span> PAINEL DO PROPRIETÁRIO</span>
          <h2>Bem-vindo ao seu painel.</h2>
          <p>Uma visão clara para cuidar da sua carteira de locação.</p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-building building-back"><span /><span /><span /><span /></div>
          <div className="welcome-building building-front"><span /><span /><span /><span /></div>
          <div className="welcome-ground" />
        </div>
      </section>

      <section className="dashboard-section" aria-labelledby="sections-heading">
        <div className="dashboard-section-heading">
          <div><p className="menu-eyebrow">ACESSO RÁPIDO</p><h2 id="sections-heading">Suas áreas</h2></div>
        </div>
        <div className="dashboard-links">
          {sections.slice(1).map(({ path, label, description, icon: Icon }) => (
            <Link className="dashboard-link" to={path} key={path}>
              <span className="dashboard-link-icon"><Icon aria-hidden="true" /></span>
              <span className="dashboard-link-copy"><strong>{label}</strong><small>{description}</small></span>
              <ArrowRight className="dashboard-link-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-note" aria-label="Resumo da carteira">
        <span className="dashboard-note-icon"><LayoutDashboard aria-hidden="true" /></span>
        <div><h2>Seu painel está pronto</h2><p>Selecione uma área para acompanhar os imóveis, contratos e cobranças da sua carteira.</p></div>
        <Link to="/imoveis" className="dashboard-note-link">Ver meus imóveis <ArrowRight aria-hidden="true" /></Link>
      </section>
    </div>
  );
}

export function SectionPage({ section }) {
  const { title, eyebrow, description, icon: Icon, emptyTitle, emptyDescription } = sectionDetails[section];

  return (
    <div className="section-page">
      <div className="section-page-heading">
        <div><p className="menu-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
      </div>
      <section className="section-empty-state">
        <span className="section-empty-icon"><Icon aria-hidden="true" /></span>
        <h2>{emptyTitle}</h2>
        <p>{emptyDescription}</p>
        <Link to="/dashboard" className="section-back-link"><ArrowRight aria-hidden="true" /> Voltar ao dashboard</Link>
      </section>
    </div>
  );
}