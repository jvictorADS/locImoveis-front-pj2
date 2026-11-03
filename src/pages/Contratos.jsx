import React, { useState, useEffect } from 'react';
import {
    FileText,
    Loader2,
    Plus,
    X,
    Pencil,
    Eye,
    Download,
    Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Contratos() {
    const { user, token } = useAuth();
    const jwtToken = token || localStorage.getItem('token');

    const [contratos, setContratos] = useState([]);
    const [imoveis, setImoveis] = useState([]);
    const [locatarios, setLocatarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modais
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

    // Estados de Arquivo/PDF
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfArquivo, setPdfArquivo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const contratoVazio = {
        imovelId: '',
        locatarioId: '',
        dataInicio: '',
        dataFim: '',
        diaVencimento: '',
        valorAcordado: '',
        indiceReajuste: 'IGPM'
    };

    const [novoContrato, setNovoContrato] = useState(contratoVazio);
    const [contratoEditando, setContratoEditando] = useState(null);

    const carregarDados = async () => {
        try {
            setIsLoading(true);

            const [contratosRes, imoveisRes, locatariosRes] = await Promise.all([
                fetch('http://localhost:8081/contratos', {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                }),
                fetch(`http://localhost:8081/imoveis/locador/${user?.id || 1}`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                }),
                fetch('http://localhost:8081/usuarios/tipo/LOCATARIO', {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                })
            ]);

            if (contratosRes.ok) setContratos(await contratosRes.json());
            if (imoveisRes.ok) setImoveis(await imoveisRes.json());
            if (locatariosRes.ok) setLocatarios(await locatariosRes.json());

        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    // Ação de Abrir o PDF na Janela/Modal
    const handleVisualizarPdf = async (idContrato) => {
        try {
            const response = await fetch(`http://localhost:8081/contratos/${idContrato}/documento`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${jwtToken}` }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Documento PDF não encontrado para este contrato.");
            }

            const blob = await response.blob();
            const fileUrl = window.URL.createObjectURL(blob);
            setPdfUrl(fileUrl);
            setIsPdfModalOpen(true);
        } catch (error) {
            alert(error.message);
        }
    };

    const fecharPdfModal = () => {
        setIsPdfModalOpen(false);
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        const imovelIdNum = Number(novoContrato.imovelId);
        const locatarioIdNum = Number(novoContrato.locatarioId);
        const valorAcordadoNum = Number(novoContrato.valorAcordado);
        const diaVencimentoNum = Number(novoContrato.diaVencimento) || 5;

        if (!imovelIdNum || !locatarioIdNum) {
            alert("Por favor, selecione um Imóvel e um Locatário.");
            return;
        }

        try {
            setIsSubmitting(true);

            const payload = {
                imovelId: imovelIdNum,
                locatarioId: locatarioIdNum,
                dataInicio: novoContrato.dataInicio,
                dataFim: novoContrato.dataFim,
                diaVencimento: diaVencimentoNum,
                valorAcordado: valorAcordadoNum,
                indiceReajuste: novoContrato.indiceReajuste || 'IGPM'
            };

            const response = await fetch('http://localhost:8081/contratos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMsg = 'Erro ao cadastrar contrato.';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.mensagem || errorData.message || errorMsg;
                } catch (_) {}
                throw new Error(errorMsg);
            }

            const contratoCriado = await response.json();
            const idValido = contratoCriado.idContrato || contratoCriado.id;

            if (pdfArquivo && idValido) {
                const formData = new FormData();
                formData.append('documento', pdfArquivo);
                await fetch(`http://localhost:8081/contratos/${idValido}/documento`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${jwtToken}` },
                    body: formData
                });
            }

            setIsCreateModalOpen(false);
            setNovoContrato(contratoVazio);
            setPdfArquivo(null);
            carregarDados();

        } catch (error) {
            alert(`Falha ao salvar: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const abrirModalEdicao = (contrato) => {
        setContratoEditando({
            id: contrato.idContrato || contrato.id,
            dataInicio: contrato.dataInicio || '',
            dataFim: contrato.dataFim || '',
            valorAcordado: contrato.valorAcordado || '',
            contratoStatus: contrato.contratoStatus || 'ATIVO'
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            const payload = {
                dataInicio: contratoEditando.dataInicio,
                dataFim: contratoEditando.dataFim,
                valorAcordado: Number(contratoEditando.valorAcordado),
                contratoStatus: contratoEditando.contratoStatus
            };

            const response = await fetch(`http://localhost:8081/contratos/${contratoEditando.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.message || "Erro ao atualizar contrato.");
            }

            setIsEditModalOpen(false);
            setContratoEditando(null);
            carregarDados();
        } catch (error) {
            alert(`Falha ao atualizar: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const obterNomeInquilino = (contrato) => {
        if (contrato.locatarioNome) return contrato.locatarioNome;

        const locId = contrato.locatarioId || contrato.locatario?.idUsuario || contrato.locatario?.id;
        if (!locId) return 'Inquilino não atribuído';

        const locatarioEncontrado = locatarios.find(l =>
            String(l.idUsuario || l.id) === String(locId)
        );

        return locatarioEncontrado ? locatarioEncontrado.nomeCompleto : `Inquilino (ID: ${locId})`;
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center text-[#15966a]">
                <Loader2 className="size-8 animate-spin" />
                <p className="mt-4 text-sm font-semibold text-[#092b5a]">Carregando contratos...</p>
            </div>
        );
    }

    return (
        <div className="contratos-page relative">
            <div className="mb-[26px] flex items-end justify-between gap-5 max-[700px]:mb-[19px] max-[700px]:flex-col max-[700px]:items-start">
                <div>
                    <p className="mb-2 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">GESTÃO</p>
                    <h1 className="m-0 text-[29px] leading-[1.2] font-extrabold text-[#092b5a]">Meus Contratos</h1>
                    <p className="mt-2 text-[13px] text-[#748196]">Gerencie os contratos de locação.</p>
                </div>

                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 rounded-md bg-[#15966a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#117a56]"
                >
                    <Plus className="size-4" />
                    Novo Contrato
                </button>
            </div>

            {contratos.length === 0 ? (
                <section className="flex min-h-[310px] flex-col items-center justify-center rounded-[9px] border border-[#e8edf2] bg-white px-5 py-8 text-center shadow-sm">
                    <span className="mb-[17px] grid size-[54px] place-items-center rounded-full bg-[#eaf6f0] text-[#15966a]">
                        <FileText className="size-6" />
                    </span>
                    <h2 className="m-0 text-base font-bold text-[#092b5a]">Nenhum contrato ativo</h2>
                    <p className="mt-2 mb-[19px] text-xs text-[#748196]">Clique acima para registrar o primeiro contrato.</p>
                </section>
            ) : (
                <div className="overflow-x-auto rounded-[9px] border border-[#e8edf2] bg-white shadow-sm">
                    <table className="w-full text-left text-sm text-[#46566b]">
                        <thead className="bg-[#f6f8fa] text-xs uppercase text-[#092b5a]">
                            <tr>
                                <th className="px-6 py-4">Inquilino</th>
                                <th className="px-4 py-3">Vigência</th>
                                <th className="px-4 py-3">Valor Acordado</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e8edf2]">
                            {contratos.map((contrato) => (
                                <tr key={contrato.idContrato || contrato.id} className="hover:bg-[#fcfdfd] transition-colors">
                                    <td className="px-4 py-3 font-medium text-[#092b5a]">
                                        {obterNomeInquilino(contrato)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Calendar className="size-3.5 text-[#8995a5]" />
                                            {contrato.dataInicio} até {contrato.dataFim}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <strong className="text-[#15966a]">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contrato.valorAcordado)}
                                        </strong>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                                            contrato.contratoStatus === 'ATIVO' ? 'bg-[#eaf6f0] text-[#15966a]' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {contrato.contratoStatus}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {contrato.temArquivo && (
                                                <button
                                                    onClick={() => handleVisualizarPdf(contrato.idContrato || contrato.id)}
                                                    title="Visualizar Contrato Completo"
                                                    className="p-1.5 text-[#092b5a] hover:bg-[#e8edf2] rounded-md transition-colors"
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => abrirModalEdicao(contrato)}
                                                title="Editar Contrato"
                                                className="p-1.5 text-[#092b5a] hover:bg-[#e8edf2] rounded-md transition-colors"
                                            >
                                                <Pencil className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* JANELA / MODAL DE VISUALIZAÇÃO DO CONTRATO (PDF) */}
            {isPdfModalOpen && pdfUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092b5a]/50 backdrop-blur-sm p-4">
                    <div className="flex flex-col w-full max-w-5xl h-[88vh] rounded-xl bg-white shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between border-b border-[#e8edf2] px-6 py-4 bg-[#f8fafc]">
                            <div className="flex items-center gap-2">
                                <FileText className="size-5 text-[#15966a]" />
                                <h2 className="text-base font-bold text-[#092b5a]">Visualização do Contrato</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={pdfUrl}
                                    download="contrato.pdf"
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#15966a] bg-[#eaf6f0] rounded-md hover:bg-[#d8efe3]"
                                >
                                    <Download className="size-3.5" />
                                    Baixar Cópia
                                </a>
                                <button onClick={fecharPdfModal} className="text-[#8995a5] hover:text-[#092b5a] p-1 rounded-md">
                                    <X className="size-6" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100 p-2">
                            <iframe
                                src={pdfUrl}
                                title="Documento do Contrato"
                                className="w-full h-full rounded-lg border-0"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CRIAÇÃO */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092b5a]/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="mb-5 flex items-center justify-between border-b border-[#e8edf2] pb-3">
                            <h2 className="text-lg font-bold text-[#092b5a]">Novo Contrato</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-[#8995a5] hover:text-[#092b5a]">
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Imóvel</label>
                                <select required className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] outline-none focus:border-[#15966a]"
                                    value={novoContrato.imovelId} onChange={(e) => setNovoContrato({ ...novoContrato, imovelId: e.target.value })}>
                                    <option value="">Selecione um imóvel...</option>
                                    {imoveis.map(i => <option key={i.idImovel || i.id} value={i.idImovel || i.id}>{i.endereco}</option>)}
                                </select>
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Locatário (Inquilino)</label>
                                <select required className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] outline-none focus:border-[#15966a]"
                                    value={novoContrato.locatarioId} onChange={(e) => setNovoContrato({ ...novoContrato, locatarioId: e.target.value })}>
                                    <option value="">Selecione o inquilino...</option>
                                    {locatarios.map(l => <option key={l.idUsuario || l.id} value={l.idUsuario || l.id}>{l.nomeCompleto}</option>)}
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Data Início</label>
                                <input type="date" required className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={novoContrato.dataInicio} onChange={(e) => setNovoContrato({ ...novoContrato, dataInicio: e.target.value })} />
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Data Fim</label>
                                <input type="date" required className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={novoContrato.dataFim} onChange={(e) => setNovoContrato({ ...novoContrato, dataFim: e.target.value })} />
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Valor Acordado (R$)</label>
                                <input type="number" step="0.01" required className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={novoContrato.valorAcordado} onChange={(e) => setNovoContrato({ ...novoContrato, valorAcordado: e.target.value })} />
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Dia do Vencimento</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    required
                                    placeholder="Ex: 5"
                                    className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={novoContrato.diaVencimento}
                                    onChange={(e) => setNovoContrato({ ...novoContrato, diaVencimento: e.target.value })}
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Índice de Reajuste</label>
                                <select className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={novoContrato.indiceReajuste} onChange={(e) => setNovoContrato({ ...novoContrato, indiceReajuste: e.target.value })}>
                                    <option value="IGPM">IGP-M</option>
                                    <option value="IPCA">IPCA</option>
                                    <option value="FIXO">Fixo</option>
                                    <option value="NENHUM">Nenhum</option>
                                </select>
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Arquivo do Contrato (PDF)</label>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="w-full rounded-md border border-[#e8edf2] px-3 py-1.5 text-sm text-[#092b5a] file:mr-3 file:rounded-md file:border-0 file:bg-[#eaf6f0] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#15966a] hover:file:bg-[#d8efe3]"
                                    onChange={(e) => setPdfArquivo(e.target.files[0])}
                                />
                            </div>

                            <div className="col-span-2 mt-4 flex gap-3 border-t border-[#e8edf2] pt-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 rounded-md border border-[#e8edf2] py-2.5 text-sm font-semibold text-[#46566b] hover:bg-[#f6f8fa]">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-md bg-[#15966a] py-2.5 text-sm font-semibold text-white hover:bg-[#117a56] disabled:opacity-70">
                                    {isSubmitting ? 'Salvando...' : 'Salvar Contrato'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE EDIÇÃO */}
            {isEditModalOpen && contratoEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092b5a]/40 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between border-b border-[#e8edf2] pb-3">
                            <h2 className="text-lg font-bold text-[#092b5a]">Editar Contrato</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-[#8995a5] hover:text-[#092b5a]">
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Status do Contrato</label>
                                <select className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] font-bold outline-none focus:border-[#15966a]"
                                    value={contratoEditando.contratoStatus}
                                    onChange={(e) => setContratoEditando({ ...contratoEditando, contratoStatus: e.target.value })}>
                                    <option value="ATIVO">ATIVO</option>
                                    <option value="RESCINDIDO">RESCINDIDO</option>
                                    <option value="ENCERRADO">ENCERRADO</option>
                                </select>
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Data Início</label>
                                <input type="date" required className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={contratoEditando.dataInicio} onChange={(e) => setContratoEditando({ ...contratoEditando, dataInicio: e.target.value })} />
                            </div>

                            <div className="col-span-1">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Data Fim</label>
                                <input type="date" required className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={contratoEditando.dataFim} onChange={(e) => setContratoEditando({ ...contratoEditando, dataFim: e.target.value })} />
                            </div>

                            <div className="col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Valor Acordado (R$)</label>
                                <input type="number" step="0.01" required className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-[#15966a]"
                                    value={contratoEditando.valorAcordado} onChange={(e) => setContratoEditando({ ...contratoEditando, valorAcordado: e.target.value })} />
                            </div>

                            <div className="col-span-2 mt-4 flex gap-3 border-t border-[#e8edf2] pt-4">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 rounded-md border border-[#e8edf2] py-2.5 text-sm font-semibold text-[#46566b] hover:bg-gray-50">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 rounded-md bg-[#092b5a] text-white py-2.5 text-sm font-semibold hover:bg-[#072044] disabled:opacity-70">
                                    {isSubmitting ? 'Atualizando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}