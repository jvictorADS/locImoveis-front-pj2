import { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  Pencil,
  X,
  Save,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

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
    path: '/manutencoes',
    label: 'Manutenções',
    description: 'Acompanhe os pedidos de manutenção',
    icon: Wrench,
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

function GraficoFluxoCaixa({ dados, formatarMoeda, mesSelecionado, onSelecionarMes }) {
  const [periodo, setPeriodo] = useState(6);
  const meses = Array.isArray(dados) ? dados.slice(-periodo) : [];
  const series = [
    { chave: 'recebido', nome: 'Arrecadado', cor: '#092b5a' },
    { chave: 'gastosReformas', nome: 'Reformas/Despesas', cor: '#f2c94c' },
    { chave: 'inadimplencia', nome: 'Inadimplência', cor: '#eb5757' },
  ];

  const valores = meses.flatMap((mes) => series.map(({ chave }) => Number(mes[chave]) || 0));
  const maiorValor = Math.max(...valores, 0);
  const limite = maiorValor > 0 ? maiorValor * 1.1 : 1000;
  const largura = 900;
  const altura = 300;
  const margem = { topo: 16, direita: 12, baixo: 42, esquerda: 82 };
  const larguraGrafico = largura - margem.esquerda - margem.direita;
  const alturaGrafico = altura - margem.topo - margem.baixo;
  const larguraGrupo = meses.length ? larguraGrafico / meses.length : 0;
  const larguraBarra = Math.min(18, larguraGrupo * 0.18);
  const espacoBarras = Math.min(5, larguraGrupo * 0.04);

  const formatarEixo = (valor) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(valor);

  const formatarMes = (mes) => {
    const data = new Date(`${mes.mes}-01T12:00:00`);
    const nomeMes = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(data).replace('.', '');
    const ano = new Intl.DateTimeFormat('pt-BR', { year: '2-digit' }).format(data);
    return `${nomeMes}/${ano}`;
  };

  const temMovimentacao = valores.some((valor) => valor > 0);

  return (
    <section className="mb-8 rounded-lg border border-[#e8edf2] bg-white p-6 shadow-sm max-[700px]:p-4">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[#092b5a]">Fluxo de Caixa e Ocorrências</h2>
          <p className="mt-1 text-[13px] text-[#748196]">
            Recebimentos, gastos de manutenção e valores em atraso agrupados por mês. Clique em um mês para filtrar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Período do gráfico">
          {[6, 12].map((quantidade) => (
            <button
              key={quantidade}
              type="button"
              aria-pressed={periodo === quantidade}
              onClick={() => setPeriodo(quantidade)}
              className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${periodo === quantidade ? 'border-[#092b5a] bg-[#092b5a] text-white' : 'border-[#dce3eb] bg-white text-[#46566b] hover:border-[#092b5a]'}`}
            >
              {quantidade} meses
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-medium text-[#46566b]" aria-label="Legenda">
        {series.map(({ nome, cor }) => (
          <div key={nome} className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm" style={{ backgroundColor: cor }} aria-hidden="true" />
            {nome}
          </div>
        ))}
      </div>

      {Array.isArray(dados) ? (
        <div className="relative overflow-x-auto">
          {meses.length > 0 ? (
            <svg
              className="h-[300px] min-w-[640px] w-full"
              viewBox={`0 0 ${largura} ${altura}`}
              role="group"
              aria-labelledby="grafico-fluxo-titulo"
              aria-describedby="grafico-fluxo-descricao"
            >
              <title id="grafico-fluxo-titulo">Fluxo de caixa nos últimos {periodo} meses</title>
              <desc id="grafico-fluxo-descricao">Gráfico de barras agrupadas. Clique ou foque em um mês para filtrar os indicadores.</desc>
              {[0, 1, 2, 3, 4].map((marcador) => {
                const valor = (limite * marcador) / 4;
                const y = margem.topo + alturaGrafico - (alturaGrafico * marcador) / 4;
                return (
                  <g key={marcador}>
                    <line
                      x1={margem.esquerda}
                      x2={largura - margem.direita}
                      y1={y}
                      y2={y}
                      stroke="#e8edf2"
                      strokeDasharray={marcador === 0 ? undefined : '4 4'}
                    />
                    <text x={margem.esquerda - 10} y={y + 4} textAnchor="end" fill="#748196" fontSize="11">
                      {formatarEixo(valor)}
                    </text>
                  </g>
                );
              })}
              {meses.map((mes, indice) => {
                const centroGrupo = margem.esquerda + larguraGrupo * (indice + 0.5);
                const larguraTotal = larguraBarra * series.length + espacoBarras * (series.length - 1);
                const inicioGrupo = centroGrupo - larguraTotal / 2;
                const isSelecionado = mesSelecionado === mes.mes;

                return (
                  <g key={mes.mes}>
                    {isSelecionado && (
                      <rect
                        x={margem.esquerda + larguraGrupo * indice + 4}
                        y={margem.topo}
                        width={Math.max(larguraGrupo - 8, 0)}
                        height={alturaGrafico}
                        rx="6"
                        fill="#092b5a"
                        fillOpacity="0.05"
                      />
                    )}
                    {series.map(({ chave, nome, cor }, serieIndice) => {
                      const valor = Number(mes[chave]) || 0;
                      if (valor <= 0) return null;
                      const alturaBarra = (valor / limite) * alturaGrafico;
                      const x = inicioGrupo + serieIndice * (larguraBarra + espacoBarras);
                      const y = margem.topo + alturaGrafico - alturaBarra;
                      return (
                        <rect
                          key={chave}
                          x={x}
                          y={y}
                          width={larguraBarra}
                          height={alturaBarra}
                          rx="3"
                          fill={cor}
                          tabIndex="0"
                          onClick={() => onSelecionarMes?.(mes.mes)}
                          aria-label={`${formatarMes(mes)}: ${nome}, ${formatarMoeda(valor)}`}
                          className="cursor-pointer transition-opacity hover:opacity-85 focus:stroke-[#15966a] focus:stroke-[3px]"
                        >
                          <title>{`${formatarMes(mes)} — ${nome}: ${formatarMoeda(valor)}`}</title>
                        </rect>
                      );
                    })}
                    <text
                      x={centroGrupo}
                      y={altura - 12}
                      textAnchor="middle"
                      fill={isSelecionado ? '#092b5a' : '#748196'}
                      fontWeight={isSelecionado ? '700' : '400'}
                      fontSize="11"
                      className="cursor-pointer"
                      onClick={() => onSelecionarMes?.(mes.mes)}
                    >
                      {formatarMes(mes)}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <p className="py-12 text-center text-sm text-[#748196]">Não há histórico mensal disponível para o gráfico.</p>
          )}
          {meses.length > 0 && !temMovimentacao && (
            <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-[#748196]">
              Nenhuma movimentação financeira no período.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-md bg-[#fcfcfd] px-4 py-10 text-center text-sm text-[#748196]">
          O histórico mensal não foi retornado pela API.
        </p>
      )}
    </section>
  );
}

export function MenuPrincipal() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = sections.find((section) => section.path === location.pathname);
  const accountMenuRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ nomeCompleto: '', cpf: '', telefone: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch((error) => {
        console.error('Erro ao carregar o perfil:', error);
        setProfileLoadError('Não foi possível carregar os dados do perfil.');
      })
      .finally(() => setProfileLoading(false));
  }, []);

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    const fecharAoClicarFora = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const fecharComEscape = (event) => {
      if (event.key === 'Escape') setIsProfileMenuOpen(false);
    };

    document.addEventListener('pointerdown', fecharAoClicarFora);
    document.addEventListener('keydown', fecharComEscape);
    return () => {
      document.removeEventListener('pointerdown', fecharAoClicarFora);
      document.removeEventListener('keydown', fecharComEscape);
    };
  }, [isProfileMenuOpen]);

  const abrirEdicaoPerfil = () => {
    setProfileForm({
      nomeCompleto: user?.nomeCompleto || '',
      cpf: user?.cpf || '',
      telefone: user?.telefone || '',
    });
    setProfileSaveError('');
    setIsProfileMenuOpen(false);
    setIsEditProfileOpen(true);
  };

  const salvarPerfil = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileSaveError('');

    try {
      const { data } = await api.put('/auth/me', profileForm);
      setUser(data);
      setIsEditProfileOpen(false);
    } catch (error) {
      setProfileSaveError(error.response?.data?.mensagem || error.response?.data?.message || 'Não foi possível salvar as alterações.');
    } finally {
      setProfileSaving(false);
    }
  };

  const nomeExibido = user?.nomeCompleto || 'Proprietário';
  const inicialUsuario = nomeExibido.charAt(0).toUpperCase();
  const tipoUsuario = user?.tipoUsuario === 'LOCATARIO' ? 'Locatário' : 'Proprietário';

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
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-[#d9eee5] bg-[#e8f6ef] text-xs font-extrabold text-[#092b5a]">{inicialUsuario}</span>
            <span className="grid min-w-0 gap-[3px]"><strong className="truncate text-xs text-white">{nomeExibido}</strong><small className="text-[11px] text-[#b3c3d7]">{tipoUsuario}</small></span>
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
          <div className="relative ml-auto" ref={accountMenuRef}>
            <button
              className="flex cursor-pointer items-center gap-[9px] rounded-lg border-0 bg-transparent px-2 py-1.5 text-left text-xs font-semibold text-[#46566b] hover:bg-[#f0f4f6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#15966a]"
              type="button"
              onClick={() => setIsProfileMenuOpen((aberto) => !aberto)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              aria-label={`Abrir opções do perfil de ${nomeExibido}`}
            >
              <span className="grid size-[30px] shrink-0 place-items-center rounded-full border border-[#d9eee5] bg-[#e8f6ef] text-xs font-extrabold text-[#092b5a]">{inicialUsuario}</span>
              <span className="max-w-[180px] truncate max-[700px]:hidden">{nomeExibido}</span>
              <ChevronDown className={`size-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[290px] overflow-hidden rounded-xl border border-[#e8edf2] bg-white text-left shadow-[0_12px_35px_#092b5a20]" role="menu" aria-label="Menu do perfil">
                <div className="border-b border-[#e8edf2] px-4 py-4">
                  <p className="m-0 truncate text-sm font-bold text-[#092b5a]">{nomeExibido}</p>
                  <p className="mt-1 truncate text-xs text-[#748196]">{user?.email || (profileLoading ? 'Carregando perfil...' : profileLoadError || tipoUsuario)}</p>
                  {user?.email && <p className="mt-1 text-[11px] text-[#748196]">{tipoUsuario}</p>}
                </div>
                <div className="p-2">
                  <button
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left text-[13px] font-medium text-[#18304d] hover:bg-[#f4f7f9] disabled:cursor-not-allowed disabled:opacity-50"
                    type="button"
                    role="menuitem"
                    onClick={abrirEdicaoPerfil}
                    disabled={!user}
                  >
                    <Pencil className="size-4 text-[#748196]" aria-hidden="true" />
                    Editar perfil
                  </button>
                  <button
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left text-[13px] font-medium text-[#b42318] hover:bg-[#fff3f2]"
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                    Sair da conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {isEditProfileOpen && (
          <div className="fixed inset-0 z-[60] grid place-items-center bg-[#092b5a70] px-4 py-6" onMouseDown={(event) => {
            if (event.target === event.currentTarget && !profileSaving) setIsEditProfileOpen(false);
          }}>
            <section className="w-full max-w-[470px] rounded-xl bg-white p-6 shadow-2xl max-[500px]:p-5" role="dialog" aria-modal="true" aria-labelledby="editar-perfil-titulo">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 id="editar-perfil-titulo" className="m-0 text-lg font-bold text-[#092b5a]">Editar perfil</h2>
                  <p className="mt-1 text-xs text-[#748196]">Atualize seus dados pessoais.</p>
                </div>
                <button className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-[#748196] hover:bg-[#f0f4f6]" type="button" onClick={() => setIsEditProfileOpen(false)} disabled={profileSaving} aria-label="Fechar edição de perfil">
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <form className="grid gap-4" onSubmit={salvarPerfil}>
                <label className="grid gap-1.5 text-xs font-semibold text-[#46566b]">
                  Nome completo
                  <input className="h-10 rounded-md border border-[#dce3eb] px-3 text-sm font-normal text-[#18304d] outline-none focus:border-[#15966a] focus:ring-2 focus:ring-[#15966a20]" required maxLength={120} value={profileForm.nomeCompleto} onChange={(event) => setProfileForm({ ...profileForm, nomeCompleto: event.target.value })} />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-[#46566b]">
                  CPF
                  <input className="h-10 rounded-md border border-[#dce3eb] px-3 text-sm font-normal text-[#18304d] outline-none focus:border-[#15966a] focus:ring-2 focus:ring-[#15966a20]" required maxLength={14} value={profileForm.cpf} onChange={(event) => setProfileForm({ ...profileForm, cpf: event.target.value })} />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-[#46566b]">
                  Telefone
                  <input className="h-10 rounded-md border border-[#dce3eb] px-3 text-sm font-normal text-[#18304d] outline-none focus:border-[#15966a] focus:ring-2 focus:ring-[#15966a20]" required maxLength={20} value={profileForm.telefone} onChange={(event) => setProfileForm({ ...profileForm, telefone: event.target.value })} />
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-[#46566b]">
                  E-mail
                  <input className="h-10 cursor-not-allowed rounded-md border border-[#e8edf2] bg-[#f6f8fa] px-3 text-sm font-normal text-[#748196]" value={user?.email || ''} disabled />
                  <span className="text-[11px] font-normal text-[#8995a5]">O e-mail de acesso não pode ser alterado por aqui.</span>
                </label>
                {profileSaveError && <p className="m-0 rounded-md bg-[#fff3f2] px-3 py-2 text-xs text-[#b42318]" role="alert">{profileSaveError}</p>}
                <div className="mt-1 flex justify-end gap-2">
                  <button className="cursor-pointer rounded-md border border-[#dce3eb] bg-white px-4 py-2 text-xs font-semibold text-[#46566b] hover:bg-[#f6f8fa]" type="button" onClick={() => setIsEditProfileOpen(false)} disabled={profileSaving}>Cancelar</button>
                  <button className="inline-flex cursor-pointer items-center gap-2 rounded-md border-0 bg-[#15966a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#117a56] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={profileSaving}>
                    {profileSaving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
                    {profileSaving ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* Menu Responsivo Mobile */}
        <nav className="hidden grid-cols-6 gap-0 border-b border-[#e8edf2] bg-white px-2 pt-[7px] max-[700px]:grid" aria-label="Seções principais">
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
  const [contratos, setContratos] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [mesSelecionado, setMesSelecionado] = useState('TODOS');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [tentativa, setTentativa] = useState(0);

  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  const extrairLista = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.content)) return payload.content;
    return [];
  };

  useEffect(() => {
    async function carregarDashboard() {
      try {
        setIsLoading(true);
        setLoadError('');

        const [resDash, resContratos, resImoveis] = await Promise.all([
          api.get('/dashboard'),
          api.get('/contratos').catch(() => ({ data: [] })),
          api.get('/imoveis').catch(() => ({ data: [] })),
        ]);

        const data = resDash.data;
        setMetricas(data);
        setInadimplentes(extrairLista(data?.inadimplentes));
        setContratos(extrairLista(resContratos?.data));
        setImoveis(extrairLista(resImoveis?.data));
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        setLoadError('Não foi possível carregar o painel financeiro. Verifique sua conexão e tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }

    carregarDashboard();
  }, [tentativa]);

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

  const formatarCompetencia = (mesAno) => {
    if (!mesAno || mesAno === 'TODOS') return 'Todos os períodos';
    const data = new Date(`${mesAno}-01T12:00:00`);
    if (Number.isNaN(data.getTime())) return mesAno;
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(data);
  };

  const formatarDataBr = (valorData) => {
    if (!valorData) return '';
    if (Array.isArray(valorData) && valorData.length >= 3) {
      const [ano, mes, dia] = valorData;
      return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
    }
    const str = String(valorData).trim();
    const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }
    const ymMatch = str.match(/^(\d{4})-(\d{2})$/);
    if (ymMatch) {
      return `${ymMatch[2]}/${ymMatch[1]}`;
    }
    return str;
  };

  const encontrarContratoRelacionado = (item) => {
    const contratoId =
      item.contratoId ??
      item.idContrato ??
      item.contrato?.idContrato ??
      item.contrato?.id;

    if (contratoId != null) {
      const porId = contratos.find(
        (c) => Number(c.idContrato ?? c.id) === Number(contratoId)
      );
      if (porId) return porId;
    }

    const imovelId =
      item.imovelId ??
      item.idImovel ??
      item.imovel?.idImovel ??
      item.imovel?.id;

    if (imovelId != null) {
      const porImovel = contratos.find(
        (c) => Number(c.imovelId ?? c.imovel?.idImovel ?? c.imovel?.id) === Number(imovelId)
      );
      if (porImovel) return porImovel;
    }

    // Fallback: cruza pelo nome do inquilino e valor da parcela
    const nomeItem = (item.locatarioNome || item.nomeInquilino || item.inquilino || '').trim().toLowerCase();
    const valorItem = Number(item.valor ?? item.valorCobrado ?? item.valorPendente ?? 0);

    if (nomeItem) {
      const candidatos = contratos.filter((c) => {
        const nomeContrato = (c.locatarioNome || c.locatario?.nomeCompleto || '').trim().toLowerCase();
        return nomeContrato === nomeItem;
      });
      if (candidatos.length === 1) return candidatos[0];
      if (candidatos.length > 1 && valorItem > 0) {
        const porValor = candidatos.find((c) => Number(c.valorAcordado) === valorItem);
        if (porValor) return porValor;
      }
    }

    return null;
  };

  const resolverImovelTexto = (item, contratoRelacionado) => {
    const direto =
      item.imovelEndereco ||
      item.enderecoImovel ||
      item.endereco ||
      (typeof item.imovel === 'string' ? item.imovel : item.imovel?.endereco) ||
      item.contrato?.imovelEndereco ||
      item.contrato?.imovel?.endereco;

    if (direto) return direto;

    const imovelId =
      item.imovelId ??
      item.idImovel ??
      item.imovel?.idImovel ??
      item.imovel?.id ??
      contratoRelacionado?.imovelId ??
      contratoRelacionado?.imovel?.idImovel ??
      contratoRelacionado?.imovel?.id;

    if (imovelId != null) {
      const imovelObj = imoveis.find(
        (im) => Number(im.idImovel ?? im.id ?? im.imovelId) === Number(imovelId)
      );
      const endImovel =
        imovelObj?.endereco ||
        imovelObj?.enderecoCompleto ||
        contratoRelacionado?.imovelEndereco ||
        contratoRelacionado?.imovel?.endereco;

      if (endImovel) return endImovel;
      return `Imóvel #${imovelId}`;
    }

    return 'Não informado';
  };

  const resolverVencimento = (item, contratoRelacionado) => {
    const dataBruta =
      item.dataVencimento ??
      item.vencimento ??
      item.dataPrevista ??
      item.dataCobranca ??
      item.dataPagamento ??
      item.dtVencimento ??
      item.data ??
      item.cobranca?.dataVencimento;

    if (dataBruta) {
      const formatada = formatarDataBr(dataBruta);
      let competencia = '';
      if (Array.isArray(dataBruta) && dataBruta.length >= 2) {
        competencia = `${dataBruta[0]}-${String(dataBruta[1]).padStart(2, '0')}`;
      } else {
        const m = String(dataBruta).match(/^(\d{4})-(\d{2})/);
        if (m) competencia = `${m[1]}-${m[2]}`;
      }
      return { texto: formatada, competencia };
    }

    const refMes = item.mesReferencia || item.competencia || item.referencia || '';
    const refStr = String(refMes).trim();
    const ymMatch = refStr.match(/^(\d{4})-(\d{2})/);
    const myMatch = refStr.match(/^(\d{2})\/(\d{4})/);

    const diaVenc =
      item.diaVencimento ??
      contratoRelacionado?.diaVencimento ??
      contratoRelacionado?.diaPagamento;

    if (ymMatch) {
      const competencia = `${ymMatch[1]}-${ymMatch[2]}`;
      const texto = diaVenc
        ? `${String(diaVenc).padStart(2, '0')}/${ymMatch[2]}/${ymMatch[1]}`
        : `${ymMatch[2]}/${ymMatch[1]}`;
      return { texto, competencia };
    }

    if (myMatch) {
      const competencia = `${myMatch[2]}-${myMatch[1]}`;
      const texto = diaVenc
        ? `${String(diaVenc).padStart(2, '0')}/${myMatch[1]}/${myMatch[2]}`
        : `${myMatch[1]}/${myMatch[2]}`;
      return { texto, competencia };
    }

    return { texto: 'N/I', competencia: '' };
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-[#15966a]">
        <Loader2 className="size-8 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-[#092b5a]">Carregando seu painel...</p>
      </div>
    );
  }

  if (loadError || !metricas) {
    return (
      <section className="flex min-h-[310px] flex-col items-center justify-center rounded-lg border border-[#e8edf2] bg-white px-5 py-8 text-center" role="alert">
        <AlertTriangle className="size-8 text-[#eb5757]" aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold text-[#092b5a]">{loadError || 'Não há dados disponíveis para o painel.'}</p>
        <button className="mt-4 cursor-pointer rounded-md border-0 bg-[#15966a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#117a56]" type="button" onClick={() => setTentativa((valor) => valor + 1)}>
          Tentar novamente
        </button>
      </section>
    );
  }

  const fluxoLista = Array.isArray(metricas.fluxoCaixa) ? metricas.fluxoCaixa : [];

  const inadimplentesEnriquecidos = inadimplentes.map((item) => {
    const contratoRelacionado = encontrarContratoRelacionado(item);
    const imovelTexto = resolverImovelTexto(item, contratoRelacionado);
    const { texto: vencimentoTexto, competencia } = resolverVencimento(item, contratoRelacionado);

    return {
      ...item,
      _imovelTexto: imovelTexto,
      _vencimentoTexto: vencimentoTexto,
      _competencia: competencia,
    };
  });

  const mesesSet = new Set([
    ...fluxoLista.map((item) => item.mes).filter(Boolean),
    ...inadimplentesEnriquecidos.map((item) => item._competencia).filter(Boolean),
  ]);
  const opcoesMeses = Array.from(mesesSet).sort().reverse();

  const dadosMesAtivo = mesSelecionado !== 'TODOS'
    ? fluxoLista.find((item) => item.mes === mesSelecionado)
    : null;

  const valorRecebidoExibido = dadosMesAtivo ? dadosMesAtivo.recebido : metricas.recebidoMes;
  const valorReformasExibido = dadosMesAtivo ? dadosMesAtivo.gastosReformas : metricas.gastosReformas;
  const valorInadimplenciaExibido = dadosMesAtivo
    ? (dadosMesAtivo.inadimplencia ?? 0)
    : metricas.totalPendente;

  const inadimplentesFiltrados = mesSelecionado === 'TODOS'
    ? inadimplentesEnriquecidos
    : inadimplentesEnriquecidos.filter((item) => item._competencia === mesSelecionado);

  const alternarMesNoGrafico = (mes) => {
    setMesSelecionado((atual) => (atual === mes ? 'TODOS' : mes));
  };

  return (
    <div className="dashboard-page">
      {/* Cabeçalho */}
      <div className="mb-[25px] flex items-end justify-between gap-5 max-[700px]:mb-[19px] max-[700px]:flex-col max-[700px]:items-start max-[700px]:gap-3">
        <div>
          <p className="mb-2 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">SEU ESPAÇO DE GESTÃO</p>
          <h1 className="m-0 text-[29px] leading-[1.2] font-extrabold text-[#092b5a] max-[700px]:text-[25px]">Visão geral</h1>
          <p className="mt-2 text-[13px] text-[#748196] max-[700px]:text-xs max-[700px]:leading-[1.5]">Tudo sobre seus imóveis, contratos e recebimentos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#dce3eb] bg-white px-3 py-1.5 shadow-sm">
            <Calendar className="size-4 text-[#15966a]" aria-hidden="true" />
            <label htmlFor="filtro-mes-dashboard" className="sr-only">Filtrar por mês</label>
            <select
              id="filtro-mes-dashboard"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="cursor-pointer bg-transparent text-xs font-semibold text-[#092b5a] capitalize outline-none"
            >
              <option value="TODOS">Visão Geral (Todos os meses)</option>
              {opcoesMeses.map((mes) => (
                <option key={mes} value={mes}>
                  {formatarCompetencia(mes)}
                </option>
              ))}
            </select>
          </div>
          <time className="pb-[3px] text-xs text-[#7b8797] capitalize max-[700px]:text-[11px]" dateTime={new Date().toISOString().slice(0, 10)}>{today}</time>
        </div>
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

      {/* Cartões de Métricas */}
      <section className="grid grid-cols-4 gap-[15px] mb-8 max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1">
        <div className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <span className="grid size-8 place-items-center rounded-md bg-[#eaf6f0] text-[#15966a]"><TrendingUp className="size-4" /></span>
            <span className="text-xs font-semibold text-[#748196]">
              {mesSelecionado === 'TODOS' ? 'Total Recebido (Mês)' : 'Recebido no Período'}
            </span>
          </div>
          <strong className="text-2xl font-bold text-[#092b5a]">{formatarMoeda(valorRecebidoExibido)}</strong>
          {mesSelecionado !== 'TODOS' && (
            <p className="mt-1 text-[11px] capitalize text-[#8995a5]">{formatarCompetencia(mesSelecionado)}</p>
          )}
        </div>

        <div className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <span className="grid size-8 place-items-center rounded-md bg-[#fff4e5] text-[#f2994a]"><Wrench className="size-4" /></span>
            <span className="text-xs font-semibold text-[#748196]">Gastos em Reformas</span>
          </div>
          {valorReformasExibido == null ? (
            <span className="text-lg font-bold text-[#748196]">Sem dados</span>
          ) : (
            <strong className="text-2xl font-bold text-[#092b5a]">{formatarMoeda(valorReformasExibido)}</strong>
          )}
          <p className="mt-1 text-[11px] text-[#8995a5]">
            {mesSelecionado === 'TODOS' ? 'Total informado nas manutenções' : `Manutenções em ${formatarCompetencia(mesSelecionado)}`}
          </p>
        </div>

        <div className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-md bg-[#feeeee] text-[#eb5757]"><AlertCircle className="size-4" /></span>
              <span className="text-xs font-semibold text-[#748196]">
                {mesSelecionado === 'TODOS' ? 'Total Pendente' : 'Inadimplência do Mês'}
              </span>
            </div>
          </div>
          <strong className="text-2xl font-bold text-[#eb5757]">{formatarMoeda(valorInadimplenciaExibido)}</strong>
          {mesSelecionado !== 'TODOS' && (
            <p className="mt-1 text-[11px] text-[#8995a5]">
              Pendente geral: {formatarMoeda(metricas.totalPendente)}
            </p>
          )}
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

      <GraficoFluxoCaixa
        dados={metricas.fluxoCaixa}
        formatarMoeda={formatarMoeda}
        mesSelecionado={mesSelecionado}
        onSelecionarMes={alternarMesNoGrafico}
      />

      {/* Tabela de Controle/Alertas de Inadimplência */}
      <section className="rounded-lg border border-[#e8edf2] bg-white overflow-hidden shadow-sm mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8edf2] bg-[#fcfcfd] px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-[#eb5757]" aria-hidden="true" />
            <h2 className="m-0 text-sm font-bold text-[#092b5a]">
              Controle de Inadimplência e Pendências
            </h2>
            {mesSelecionado !== 'TODOS' && (
              <span className="rounded-full bg-[#feeeee] px-2.5 py-0.5 text-[11px] font-bold capitalize text-[#eb5757]">
                {formatarCompetencia(mesSelecionado)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Filtrar inadimplência por mês"
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="cursor-pointer rounded-md border border-[#dce3eb] bg-white px-2.5 py-1 text-xs font-semibold text-[#092b5a] capitalize outline-none focus:border-[#15966a]"
            >
              <option value="TODOS">Todos os meses</option>
              {opcoesMeses.map((mes) => (
                <option key={mes} value={mes}>
                  {formatarCompetencia(mes)}
                </option>
              ))}
            </select>

            <Link
              to="/financeiro"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#15966a] no-underline hover:underline"
            >
              Ver financeiro <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {inadimplentesFiltrados.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="m-0 text-xs text-[#748196]">
              {mesSelecionado === 'TODOS'
                ? 'Nenhuma pendência ou inadimplência registrada no momento.'
                : `Nenhuma inadimplência registrada em ${formatarCompetencia(mesSelecionado)}.`}
            </p>
            {mesSelecionado !== 'TODOS' && (
              <button
                type="button"
                onClick={() => setMesSelecionado('TODOS')}
                className="mt-2 cursor-pointer border-0 bg-transparent text-xs font-semibold text-[#15966a] hover:underline"
              >
                Exibir todos os períodos
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#46566b]">
              <thead className="bg-[#f6f8fa] text-xs uppercase text-[#092b5a]">
                <tr>
                  <th className="px-5 py-3">Inquilino</th>
                  <th className="px-4 py-3">Imóvel</th>
                  <th className="px-4 py-3">Vencimento</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edf2]">
                {inadimplentesFiltrados.map((item, idx) => (
                  <tr key={item.idCobranca || item.id || idx} className="hover:bg-[#fcfdfd]">
                    <td className="px-5 py-3 font-semibold text-[#092b5a]">
                      {item.locatarioNome || item.nomeInquilino || item.inquilino || 'Inquilino'}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#748196]">
                      {item._imovelTexto}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {item._vencimentoTexto}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#eb5757]">
                      {formatarMoeda(item.valor || item.valorCobrado || item.valorPendente)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                        {item.diasAtraso != null
                          ? `${item.diasAtraso} ${item.diasAtraso === 1 ? 'dia' : 'dias'} em atraso`
                          : (item.status || 'Em atraso')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}