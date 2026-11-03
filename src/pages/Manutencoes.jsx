import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { api } from '../services/api';

const formularioVazio = {
  contratoId: '',
  descricaoProblema: '',
  valorGasto: '',
  prioridade: 'MEDIA',
};

const prioridades = {
  ALTA: { label: 'Alta', estilo: 'bg-red-50 text-red-700' },
  MEDIA: { label: 'Média', estilo: 'bg-amber-50 text-amber-700' },
  BAIXA: { label: 'Baixa', estilo: 'bg-emerald-50 text-emerald-700' },
};

export function Manutencoes() {
  const [manutencoes, setManutencoes] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manutencaoEditando, setManutencaoEditando] = useState(null);
  const [formData, setFormData] = useState(formularioVazio);
  const [formError, setFormError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelado = false;

    async function carregarDados() {
      try {
        const [manutencoesResponse, contratosResponse] = await Promise.all([
          api.get('/manutencoes'),
          api.get('/manutencoes/contratos'),
        ]);
        if (cancelado) return;
        setManutencoes(manutencoesResponse.data);
        setContratos(contratosResponse.data);
        setLoadError('');
      } catch (error) {
        if (!cancelado) {
          console.error('Erro ao carregar manutenções:', error);
          setLoadError('Não foi possível carregar as manutenções. Tente novamente.');
        }
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    }

    carregarDados();
    return () => { cancelado = true; };
  }, [reloadKey]);

  const abrirNovaManutencao = () => {
    setManutencaoEditando(null);
    setFormData(formularioVazio);
    setFormError('');
    setIsModalOpen(true);
  };

  const abrirEdicao = (manutencao) => {
    setManutencaoEditando(manutencao);
    setFormData({
      contratoId: String(manutencao.contratoId),
      descricaoProblema: manutencao.descricaoProblema,
      valorGasto: manutencao.valorGasto == null ? '' : String(manutencao.valorGasto),
      prioridade: manutencao.prioridade,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const salvarManutencao = async (event) => {
    event.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const payload = {
      contratoId: Number(formData.contratoId),
      descricaoProblema: formData.descricaoProblema.trim(),
      valorGasto: formData.valorGasto === '' ? null : Number(formData.valorGasto),
      prioridade: formData.prioridade,
    };

    try {
      const response = manutencaoEditando
        ? await api.put(`/manutencoes/${manutencaoEditando.idPedido}`, payload)
        : await api.post('/manutencoes', payload);
      const salva = response.data;

      setManutencoes((atuais) => manutencaoEditando
        ? atuais.map((item) => item.idPedido === salva.idPedido ? salva : item)
        : [salva, ...atuais]);
      setIsModalOpen(false);
    } catch (error) {
      setFormError(error.response?.data?.mensagem || 'Não foi possível salvar a manutenção.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const excluirManutencao = async (manutencao) => {
    if (!window.confirm('Deseja excluir este pedido de manutenção?')) return;

    try {
      await api.delete(`/manutencoes/${manutencao.idPedido}`);
      setManutencoes((atuais) => atuais.filter((item) => item.idPedido !== manutencao.idPedido));
    } catch (error) {
      setLoadError(error.response?.data?.mensagem || 'Não foi possível excluir a manutenção.');
    }
  };

  const manutencoesFiltradas = manutencoes.filter((item) => {
    const termo = filtro.toLocaleLowerCase('pt-BR');
    return item.descricaoProblema?.toLocaleLowerCase('pt-BR').includes(termo)
      || item.locatarioNome?.toLocaleLowerCase('pt-BR').includes(termo)
      || item.imovelEndereco?.toLocaleLowerCase('pt-BR').includes(termo);
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-[#15966a]">
        <Loader2 className="size-8 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-[#092b5a]">Carregando manutenções...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-6 flex items-end justify-between gap-5 max-[700px]:flex-col max-[700px]:items-start">
        <div>
          <p className="mb-1 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">OPERAÇÃO</p>
          <h1 className="m-0 text-[29px] leading-[1.2] font-extrabold text-[#092b5a]">Manutenções</h1>
          <p className="mt-1 text-[13px] text-[#748196]">Registre e acompanhe os pedidos vinculados aos seus imóveis.</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-md bg-[#15966a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#117a56] disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          onClick={abrirNovaManutencao}
          disabled={contratos.length === 0}
          title={contratos.length === 0 ? 'Cadastre um contrato antes de abrir um pedido' : 'Novo pedido de manutenção'}
        >
          <Plus className="size-4" aria-hidden="true" /> Novo pedido
        </button>
      </div>

      {loadError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <span className="flex items-center gap-2"><AlertTriangle className="size-4 shrink-0" aria-hidden="true" />{loadError}</span>
          <button
            className="shrink-0 font-semibold underline"
            type="button"
            onClick={() => { setIsLoading(true); setReloadKey((valor) => valor + 1); }}
          >
            Recarregar
          </button>
        </div>
      )}

      <div className="mb-4 flex max-w-md items-center gap-2 rounded-lg border border-[#e8edf2] bg-white px-3 py-2 shadow-sm">
        <Search className="size-4 text-[#8995a5]" aria-hidden="true" />
        <input
          aria-label="Buscar manutenções"
          className="w-full text-sm text-[#092b5a] outline-none placeholder:text-[#8995a5]"
          placeholder="Buscar por imóvel, inquilino ou descrição..."
          value={filtro}
          onChange={(event) => setFiltro(event.target.value)}
        />
      </div>

      {manutencoesFiltradas.length === 0 ? (
        <section className="flex min-h-[250px] flex-col items-center justify-center rounded-lg border border-[#e8edf2] bg-white px-5 py-8 text-center">
          <span className="mb-3 grid size-[50px] place-items-center rounded-full bg-[#eaf6f0] text-[#15966a]">
            <Wrench className="size-6" aria-hidden="true" />
          </span>
          <h2 className="m-0 text-base font-bold text-[#092b5a]">
            {filtro ? 'Nenhuma manutenção encontrada' : 'Nenhum pedido de manutenção'}
          </h2>
          <p className="mt-1 text-xs text-[#748196]">
            {filtro ? 'Ajuste os termos da busca.' : 'Os pedidos registrados para seus contratos aparecerão aqui.'}
          </p>
        </section>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#e8edf2] bg-white shadow-sm">
          <table className="w-full text-left text-sm text-[#46566b]">
            <thead className="bg-[#f6f8fa] text-xs uppercase text-[#092b5a]">
              <tr>
                <th className="px-5 py-3.5">Imóvel / Inquilino</th>
                <th className="px-4 py-3.5">Descrição</th>
                <th className="px-4 py-3.5">Valor gasto</th>
                <th className="px-4 py-3.5">Prioridade</th>
                <th className="px-4 py-3.5">Abertura</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8edf2]">
              {manutencoesFiltradas.map((manutencao) => {
                const prioridade = prioridades[manutencao.prioridade] || prioridades.MEDIA;
                return (
                  <tr key={manutencao.idPedido} className="transition-colors hover:bg-[#fcfdfd]">
                    <td className="min-w-[220px] px-5 py-3.5">
                      <div className="font-semibold text-[#092b5a]">{manutencao.imovelEndereco}</div>
                      <div className="text-xs text-[#748196]">{manutencao.locatarioNome}</div>
                    </td>
                    <td className="min-w-[240px] max-w-[420px] px-4 py-3.5">{manutencao.descricaoProblema}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-[#092b5a]">
                      {manutencao.valorGasto == null
                        ? 'Não informado'
                        : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(manutencao.valorGasto)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${prioridade.estilo}`}>
                        {prioridade.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" aria-hidden="true" />{new Date(`${manutencao.dataAbertura}T00:00:00`).toLocaleDateString('pt-BR')}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="rounded-md p-1.5 text-[#092b5a] transition-colors hover:bg-[#e8edf2]"
                          type="button"
                          onClick={() => abrirEdicao(manutencao)}
                          aria-label="Editar manutenção"
                          title="Editar manutenção"
                        ><Pencil className="size-4" aria-hidden="true" /></button>
                        <button
                          className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
                          type="button"
                          onClick={() => excluirManutencao(manutencao)}
                          aria-label="Excluir manutenção"
                          title="Excluir manutenção"
                        ><Trash2 className="size-4" aria-hidden="true" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092b5a]/40 p-4 backdrop-blur-sm">
          <section className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="manutencao-titulo">
            <div className="mb-5 flex items-center justify-between border-b border-[#e8edf2] pb-3">
              <h2 id="manutencao-titulo" className="m-0 text-base font-bold text-[#092b5a]">
                {manutencaoEditando ? 'Editar manutenção' : 'Novo pedido de manutenção'}
              </h2>
              <button
                className="rounded-md p-1 text-[#8995a5] hover:bg-[#f6f8fa] hover:text-[#092b5a]"
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar formulário"
              ><X className="size-5" aria-hidden="true" /></button>
            </div>

            <form className="grid gap-4" onSubmit={salvarManutencao}>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#46566b]" htmlFor="contrato-manutencao">Imóvel e inquilino</label>
                <select
                  id="contrato-manutencao"
                  className="w-full rounded-md border border-[#e8edf2] bg-white px-3 py-2.5 text-sm text-[#092b5a] outline-none focus:border-[#15966a]"
                  value={formData.contratoId}
                  onChange={(event) => setFormData({ ...formData, contratoId: event.target.value })}
                  required
                >
                  <option value="" disabled>Selecione um contrato</option>
                  {contratos.map((contrato) => (
                    <option key={contrato.idContrato} value={contrato.idContrato}>
                      {contrato.imovelEndereco} · {contrato.locatarioNome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#46566b]" htmlFor="descricao-manutencao">Descrição do problema</label>
                <textarea
                  id="descricao-manutencao"
                  className="min-h-[112px] w-full resize-y rounded-md border border-[#e8edf2] px-3 py-2.5 text-sm text-[#092b5a] outline-none focus:border-[#15966a]"
                  value={formData.descricaoProblema}
                  onChange={(event) => setFormData({ ...formData, descricaoProblema: event.target.value })}
                  placeholder="Descreva o reparo necessário"
                  maxLength={2000}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#46566b]" htmlFor="prioridade-manutencao">Prioridade</label>
                <select
                  id="prioridade-manutencao"
                  className="w-full rounded-md border border-[#e8edf2] bg-white px-3 py-2.5 text-sm text-[#092b5a] outline-none focus:border-[#15966a]"
                  value={formData.prioridade}
                  onChange={(event) => setFormData({ ...formData, prioridade: event.target.value })}
                >
                  <option value="ALTA">Alta</option>
                  <option value="MEDIA">Média</option>
                  <option value="BAIXA">Baixa</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#46566b]" htmlFor="valor-manutencao">Valor gasto na reforma (R$)</label>
                <input
                  id="valor-manutencao"
                  className="w-full rounded-md border border-[#e8edf2] px-3 py-2.5 text-sm text-[#092b5a] outline-none focus:border-[#15966a]"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Ex.: 850,00"
                  value={formData.valorGasto}
                  onChange={(event) => setFormData({ ...formData, valorGasto: event.target.value })}
                />
                <p className="mt-1 text-[11px] text-[#8995a5]">Deixe em branco enquanto o custo não for conhecido.</p>
              </div>

              {formError && <p className="m-0 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{formError}</p>}

              <div className="mt-1 flex gap-3 border-t border-[#e8edf2] pt-4">
                <button
                  className="flex-1 rounded-md border border-[#e8edf2] py-2 text-sm font-semibold text-[#46566b] hover:bg-[#f6f8fa]"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >Cancelar</button>
                <button
                  className="flex-1 rounded-md bg-[#15966a] py-2 text-sm font-semibold text-white hover:bg-[#117a56] disabled:opacity-60"
                  type="submit"
                  disabled={isSubmitting || contratos.length === 0}
                >{isSubmitting ? 'Salvando...' : 'Salvar pedido'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}