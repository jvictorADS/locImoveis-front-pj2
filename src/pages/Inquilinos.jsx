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
    Ban
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
    const [filtro, setFiltro] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modais e Estados do Formulário
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inquilinoEditando, setInquilinoEditando] = useState(null);
    const [formData, setFormData] = useState(formVazio);

    const carregarInquilinos = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:8081/usuarios/tipo/LOCATARIO', {
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setInquilinos(data);
            }
        } catch (error) {
            console.error("Erro ao carregar inquilinos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarInquilinos();
    }, []);

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
                throw new Error(err.message || 'Erro ao salvar informações do inquilino.');
            }

            setIsModalOpen(false);
            carregarInquilinos();
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
            carregarInquilinos();
        } catch (error) {
            alert(error.message);
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
                <div className="overflow-x-auto rounded-[9px] border border-[#e8edf2] bg-white shadow-sm">
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
                                return (
                                    <tr key={id} className="hover:bg-[#fcfdfd] transition-colors">
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
                                            </div>
                                        </td>
                                    </tr>
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