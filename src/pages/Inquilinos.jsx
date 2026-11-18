import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Loader2,
    Pencil,
    Trash2,
    X,
    Search,
    ShieldAlert,
    CheckCircle2,
    Ban,
    ChevronDown,
    Building2,
    Calendar,
    MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const formVazio = {
    nomeCompleto: '',
    email: '',
    cpf: '',
    telefone: '',
    tipoUsuario: 'LOCATARIO',
    contaStatus: 'ATIVA'
};

export function Inquilinos() {
    const { token } = useAuth();
    const jwtToken = token || localStorage.getItem('token');

    const [inquilinos, setInquilinos] = useState([]);
    const [contratos, setContratos] = useState([]);
    const [imoveis, setImoveis] = useState([]);
    const [expandedInquilinoId, setExpandedInquilinoId] = useState(null);
    const [loadingImoveisIds, setLoadingImoveisIds] = useState(false);

    const [filtro, setFiltro] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inquilinoEditando, setInquilinoEditando] = useState(null);
    const [formData, setFormData] = useState(formVazio);

    const extrairLista = (data) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.content)) return data.content;
        return [];
    };

    const carregarDados = async () => {
        try {
            setIsLoading(true);
            const headers = { 'Authorization': `Bearer ${jwtToken}` };

            const [resInquilinos, resContratos, resImoveis] = await Promise.all([
                fetch('http://localhost:8081/usuarios/tipo/LOCATARIO', { headers }),
                fetch('http://localhost:8081/contratos', { headers }),
                fetch('http://localhost:8081/imoveis/me', { headers })
            ]);

            if (resInquilinos.ok) {
                setInquilinos(extrairLista(await resInquilinos.json()));
            }
            if (resContratos.ok) {
                setContratos(extrairLista(await resContratos.json()));
            }
            if (resImoveis.ok) {
                setImoveis(extrairLista(await resImoveis.json()));
            }
        } catch (error) {
            console.error("Erro ao carregar dados de inquilinos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const obterContratosDoInquilino = (inquilinoId) => {
        return contratos
            .filter((c) => {
                const locId = c.locatarioId ?? c.locatario?.idUsuario ?? c.locatario?.id;
                return Number(locId) === Number(inquilinoId);
            })
            .sort((a, b) => {
                if (a.contratoStatus === 'ATIVO' && b.contratoStatus !== 'ATIVO') return -1;
                if (a.contratoStatus !== 'ATIVO' && b.contratoStatus === 'ATIVO') return 1;
                return new Date(b.dataInicio || 0) - new Date(a.dataInicio || 0);
            });
    };

    const toggleExpandirInquilino = async (id) => {
        if (expandedInquilinoId === id) {
            setExpandedInquilinoId(null);
            return;
        }
        setExpandedInquilinoId(id);
        const contratosDoInquilino = obterContratosDoInquilino(id);
        const idsFaltantes = [
            ...new Set(
                contratosDoInquilino
                    .map((c) => c.imovelId ?? c.imovel?.idImovel ?? c.imovel?.id)
                    .filter((imId) => imId != null)
            )
        ].filter(
            (imId) => !imoveis.some((im) => Number(im.idImovel ?? im.id ?? im.imovelId) === Number(imId))
        );

        if (idsFaltantes.length > 0) {
            try {
                setLoadingImoveisIds(true);
                const headers = { 'Authorization': `Bearer ${jwtToken}` };
                const respostas = await Promise.all(
                    idsFaltantes.map((imId) =>
                        fetch(`http://localhost:8081/imoveis/${imId}`, { headers })
                            .then((res) => (res.ok ? res.json() : null))
                            .catch(() => null)
                    )
                );

                const novosImoveis = respostas.filter(Boolean);
                if (novosImoveis.length > 0) {
                    setImoveis((prev) => [...prev, ...novosImoveis]);
                }
            } finally {
                setLoadingImoveisIds(false);
            }
        }
    };

    const abrirModalNovo = () => {
        setInquilinoEditando(null);
        setFormData(formVazio);
        setIsModalOpen(true);
    };

    const abrirModalEdicao = (inquilino) => {
        setInquilinoEditando(inquilino);
        setFormData({
            nomeCompleto: inquilino.nomeCompleto || '',
            email: inquilino.email || '',
            cpf: inquilino.cpf || '',
            telefone: inquilino.telefone || '',
            tipoUsuario: 'LOCATARIO',
            contaStatus: inquilino.contaStatus || 'ATIVA'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const isEditing = !!inquilinoEditando;
            const url = isEditing
                ? `http://localhost:8081/usuarios/${inquilinoEditando.idUsuario || inquilinoEditando.id}`
                : 'http://localhost:8081/usuarios';

            const method = isEditing ? 'PUT' : 'POST';

            const payload = isEditing
                ? {
                    nomeCompleto: formData.nomeCompleto,
                    email: formData.email,
                    cpf: formData.cpf,
                    telefone: formData.telefone,
                    contaStatus: formData.contaStatus
                  }
                : {
                    nomeCompleto: formData.nomeCompleto,
                    email: formData.email,
                    cpf: formData.cpf,
                    telefone: formData.telefone,
                    tipoUsuario: 'LOCATARIO'
                  };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                const mensagem = err.mensagem
                    || err.message
                    || err.errors?.map((error) => error.defaultMessage).join(' | ')
                    || 'Erro ao salvar informações do inquilino.';
                throw new Error(mensagem);
            }

            setIsModalOpen(false);
            carregarDados();
        } catch (error) {
            alert(`Falha na operação: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExcluir = async (id) => {
        if (!window.confirm("Tem certeza que deseja remover este inquilino do sistema?")) return;

        try {
            const response = await fetch(`http://localhost:8081/usuarios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            if (!response.ok) throw new Error("Erro ao excluir inquilino.");
            carregarDados();
        } catch (error) {
            alert(error.message);
        }
    };

    const formatarData = (dataStr) => {
        if (!dataStr) return 'N/I';
        const partes = dataStr.split('T')[0].split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return dataStr;
    };

    const formatarMoeda = (valor) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

    const extrairEnderecoCampoUnico = (obj) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj.trim();
        const valor =
            obj.endereco ||
            obj.enderecoCompleto ||
            obj.enderecoImovel ||
            obj.imovelEndereco ||
            obj.localizacao ||
            '';
        return typeof valor === 'string' ? valor.trim() : '';
    };

    const obterDetalhesImovel = (contrato) => {
        const imovelId = contrato.imovelId ?? contrato.imovel?.idImovel ?? contrato.imovel?.id;
        const imovelEncontrado = imoveis.find(
            (im) => Number(im.idImovel ?? im.id ?? im.imovelId) === Number(imovelId)
        );

        const endereco =
            extrairEnderecoCampoUnico(contrato) ||
            extrairEnderecoCampoUnico(contrato.imovel) ||
            extrairEnderecoCampoUnico(imovelEncontrado);

        const tipoOuTitulo =
            imovelEncontrado?.titulo ||
            imovelEncontrado?.nome ||
            imovelEncontrado?.tipoImovel ||
            contrato.imovel?.tipoImovel;

        return {
            enderecoPrincipal: endereco || `Imóvel #${imovelId}`,
            subtitulo: endereco
                ? [tipoOuTitulo, imovelId ? `Imóvel #${imovelId}` : null].filter(Boolean).join(' • ')
                : ''
        };
    };

    const renderContratoStatusBadge = (status) => {
    const st = status ? status.toUpperCase() : 'INATIVO';
    switch (st) {
        case 'ATIVO':
            return (
                <span className="inline-flex items-center rounded-full bg-[#eaf6f0] px-2.5 py-0.5 text-[11px] font-bold text-[#15966a]">
                    Contrato Ativo
                </span>
            );
        case 'FINALIZADO':
        case 'ENCERRADO':
            return (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                    Encerrado
                </span>
            );
        case 'RESCINDIDO':
            return (
                <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">
                    Rescindido
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-600">
                    {st}
                </span>
            );
    }
};

    const renderStatusBadge = (status) => {
        const st = status ? status.toUpperCase() : 'INATIVA';
        switch (st) {
            case 'ATIVA':
            case 'ENABLED':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf6f0] px-2.5 py-1 text-[11px] font-bold text-[#15966a]">
                        <CheckCircle2 className="size-3" /> Ativa
                    </span>
                );
            case 'BLOQUEADA':
            case 'BLOCKED':
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">
                        <Ban className="size-3" /> Bloqueada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-600">
                        <ShieldAlert className="size-3" /> Inativa
                    </span>
                );
        }
    };

    const inquilinosFiltrados = inquilinos.filter(i =>
        i.nomeCompleto?.toLowerCase().includes(filtro.toLowerCase()) ||
        i.email?.toLowerCase().includes(filtro.toLowerCase()) ||
        i.cpf?.includes(filtro)
    );

    if (isLoading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center text-[#15966a]">
                <Loader2 className="size-8 animate-spin" />
                <p className="mt-4 text-sm font-semibold text-[#092b5a]">Carregando inquilinos...</p>
            </div>
        );
    }

    return (
        <div className="inquilinos-page relative">
            <div className="mb-6 flex items-end justify-between gap-5 max-[700px]:flex-col max-[700px]:items-start">
                <div>
                    <p className="mb-1 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">CADASTROS</p>
                    <h1 className="m-0 text-[29px] leading-[1.2] font-extrabold text-[#092b5a]">Inquilinos</h1>
                    <p className="mt-1 text-[13px] text-[#748196]">Gerencie os locatários cadastrados no sistema.</p>
                </div>

                <button
                    onClick={abrirModalNovo}
                    className="flex items-center gap-2 rounded-md bg-[#15966a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#117a56]"
                >
                    <UserPlus className="size-4" />
                    Novo Inquilino
                </button>
            </div>

            {/* Barra de Busca */}
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#e8edf2] bg-white px-3 py-2 shadow-sm max-w-md">
                <Search className="size-4 text-[#8995a5]" />
                <input
                    type="text"
                    placeholder="Buscar por nome, e-mail ou CPF..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full text-sm text-[#092b5a] outline-none placeholder:text-[#8995a5]"
                />
            </div>

            {inquilinosFiltrados.length === 0 ? (
                <section className="flex min-h-[250px] flex-col items-center justify-center rounded-[9px] border border-[#e8edf2] bg-white px-5 py-8 text-center shadow-sm">
                    <span className="mb-3 grid size-[50px] place-items-center rounded-full bg-[#eaf6f0] text-[#15966a]">
                        <Users className="size-6" />
                    </span>
                    <h2 className="m-0 text-base font-bold text-[#092b5a]">Nenhum inquilino encontrado</h2>
                    <p className="mt-1 text-xs text-[#748196]">Cadastre um novo locatário ou ajuste o filtro de busca.</p>
                </section>
            ) : (
                <div className="max-h-[70vh] overflow-x-auto overflow-y-auto rounded-[9px] border border-[#e8edf2] bg-white shadow-sm">
                    <table className="w-full text-left text-sm text-[#46566b]">
                        <thead className="bg-[#f6f8fa] text-xs uppercase text-[#092b5a]">
                            <tr>
                                <th className="px-5 py-3.5">Nome / E-mail</th>
                                <th className="px-4 py-3.5">CPF</th>
                                <th className="px-4 py-3.5">Telefone</th>
                                <th className="px-4 py-3.5">Status da Conta</th>
                                <th className="px-4 py-3.5 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8edf2]">
                            {inquilinosFiltrados.map((inquilino) => {
                                const id = inquilino.idUsuario || inquilino.id;
                                const isExpanded = expandedInquilinoId === id;
                                const contratosInquilino = obterContratosDoInquilino(id);

                                return (
                                    <React.Fragment key={id}>
                                        <tr className={`transition-colors ${isExpanded ? 'bg-[#f8fafc]' : 'hover:bg-[#fcfdfd]'}`}>
                                            <td className="px-5 py-3.5">
                                                <div className="font-semibold text-[#092b5a]">{inquilino.nomeCompleto}</div>
                                                <div className="text-xs text-[#748196]">{inquilino.email}</div>
                                            </td>
                                            <td className="px-4 py-3.5 text-xs font-mono text-[#092b5a]">{inquilino.cpf || 'N/I'}</td>
                                            <td className="px-4 py-3.5 text-xs text-[#46566b]">{inquilino.telefone || 'N/I'}</td>
                                            <td className="px-4 py-3.5">{renderStatusBadge(inquilino.contaStatus)}</td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => abrirModalEdicao(inquilino)}
                                                        title="Editar Inquilino"
                                                        className="p-1.5 text-[#092b5a] hover:bg-[#e8edf2] rounded-md transition-colors"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleExcluir(id)}
                                                        title="Excluir Inquilino"
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>

                                                    <span className="mx-1 h-4 w-px bg-[#e8edf2]" aria-hidden="true" />

                                                    <button
                                                        onClick={() => toggleExpandirInquilino(id)}
                                                        title={isExpanded ? "Ocultar imóveis alugados" : "Ver imóveis alugados"}
                                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                                                            isExpanded
                                                                ? 'bg-[#eaf6f0] text-[#15966a]'
                                                                : 'text-[#46566b] hover:bg-[#e8edf2] hover:text-[#092b5a]'
                                                        }`}
                                                    >
                                                        <Building2 className="size-3.5" />
                                                        <span>{contratosInquilino.length}</span>
                                                        <ChevronDown
                                                            className={`size-4 transition-transform duration-200 ${
                                                                isExpanded ? 'rotate-180' : ''
                                                            }`}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* ÁREA EXPANSÍVEL COM HISTÓRICO DE IMÓVEIS DO INQUILINO */}
                                        {isExpanded && (
                                            <tr className="bg-[#f8fafc]">
                                                <td colSpan={5} className="px-5 py-4">
                                                    <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#092b5a]">
                                                                <Building2 className="size-4 text-[#15966a]" />
                                                                Histórico de Imóveis e Locações
                                                            </h3>
                                                            <span className="text-xs text-[#748196]">
                                                                {contratosInquilino.length}{' '}
                                                                {contratosInquilino.length === 1 ? 'registro' : 'registros'}
                                                            </span>
                                                        </div>

                                                        {loadingImoveisIds ? (
                                                            <div className="flex items-center justify-center gap-2 py-4 text-xs text-[#748196]">
                                                                <Loader2 className="size-4 animate-spin text-[#15966a]" />
                                                                <span>Carregando endereços dos imóveis...</span>
                                                            </div>
                                                        ) : contratosInquilino.length === 0 ? (
                                                            <p className="py-3 text-center text-xs text-[#748196]">
                                                                Este inquilino ainda não possui imóveis ou contratos vinculados.
                                                            </p>
                                                        ) : (
                                                            <div className="grid gap-2.5">
                                                                {contratosInquilino.map((contrato) => {
                                                                    const { enderecoPrincipal, subtitulo } = obterDetalhesImovel(contrato);
                                                                    const contratoId = contrato.idContrato || contrato.id;

                                                                    return (
                                                                        <div
                                                                            key={contratoId}
                                                                            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#edf2f7] bg-[#fcfdfd] px-3.5 py-2.5"
                                                                        >
                                                                            <div className="flex items-start gap-2.5">
                                                                                <MapPin className="mt-0.5 size-4 shrink-0 text-[#15966a]" />
                                                                                <div>
                                                                                    <div className="text-sm font-bold text-[#092b5a]">
                                                                                        {enderecoPrincipal}
                                                                                    </div>
                                                                                    {subtitulo && (
                                                                                        <div className="text-xs text-[#748196]">
                                                                                            {subtitulo}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex flex-wrap items-center gap-4 text-xs">
                                                                                <div className="flex items-center gap-1.5 text-[#46566b]">
                                                                                    <Calendar className="size-3.5 text-[#8995a5]" />
                                                                                    <span>
                                                                                        {formatarData(contrato.dataInicio)} até{' '}
                                                                                        {formatarData(contrato.dataFim)}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="font-semibold text-[#092b5a]">
                                                                                    {formatarMoeda(contrato.valorAcordado)}
                                                                                </div>

                                                                                {renderContratoStatusBadge(contrato.contratoStatus)}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DE CADASTRO E EDIÇÃO */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092b5a]/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between border-b border-[#e8edf2] pb-3">
                            <h2 className="text-base font-bold text-[#092b5a]">
                                {inquilinoEditando ? 'Editar Inquilino' : 'Novo Inquilino'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#8995a5] hover:text-[#092b5a]">
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3.5">
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={formData.nomeCompleto}
                                    onChange={(e) => setFormData({ ...formData, nomeCompleto: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">E-mail</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">CPF</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="000.000.000-00"
                                    className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={formData.cpf}
                                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                                />
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Telefone</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="(00) 00000-0000"
                                    className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={formData.telefone}
                                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                                />
                            </div>

                            {inquilinoEditando && (
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="mb-1 block text-xs font-semibold text-[#46566b]">Status da Conta</label>
                                    <select
                                        className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm font-semibold text-[#092b5a] outline-none focus:border-[#15966a]"
                                        value={formData.contaStatus}
                                        onChange={(e) => setFormData({ ...formData, contaStatus: e.target.value })}
                                    >
                                        <option value="ATIVA">ATIVA</option>
                                        <option value="INATIVA">INATIVA</option>
                                        <option value="BLOQUEADA">BLOQUEADA</option>
                                    </select>
                                </div>
                            )}

                            <div className="col-span-2 mt-3 flex gap-3 border-t border-[#e8edf2] pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 rounded-md border border-[#e8edf2] py-2 text-sm font-semibold text-[#46566b] hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 rounded-md bg-[#15966a] py-2 text-sm font-semibold text-white hover:bg-[#117a56] disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Salvar Inquilino'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}