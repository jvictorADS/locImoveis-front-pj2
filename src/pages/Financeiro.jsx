import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Clock3,
  CreditCard,
  FileText,
  Home,
  Loader2,
  RefreshCw,
  TrendingUp,
  Wallet,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const formatarMoeda = (valor) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const formatarData = (data) =>
  data ? new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR') : 'Data não informada';

const somar = (itens, obterValor) =>
  itens.reduce((total, item) => total + Number(obterValor(item) || 0), 0);

function CartaoResumo({ titulo, valor, detalhe, icon: Icon, tone = 'green' }) {
  const tons = {
    green: 'bg-[#eaf6f0] text-[#15966a]',
    navy: 'bg-[#eef2f8] text-[#092b5a]',
    orange: 'bg-[#fff4e5] text-[#d88735]',
    red: 'bg-[#feeeee] text-[#eb5757]',
  };

  return (
    <article className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[#748196]">{titulo}</span>
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tons[tone]}`}>
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <strong className="block text-[22px] leading-tight font-bold text-[#092b5a]">{valor}</strong>
      <p className="mt-2 mb-0 text-[11px] text-[#8995a5]">{detalhe}</p>
    </article>
  );
}

function EstadoVazio({ children }) {
  return <p className="m-0 py-8 text-center text-xs text-[#8995a5]">{children}</p>;
}

export function Financeiro() {
  const [dados, setDados] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesIndiceAtual = hoje.getMonth();
  const hojeLocal = `${anoAtual}-${String(mesIndiceAtual + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
  const chaveMesAtual = `${anoAtual}-${String(mesIndiceAtual + 1).padStart(2, '0')}`;
  const inicioMesSeguinte = new Date(anoAtual, mesIndiceAtual + 1, 1);
  const dataLimiteMes = `${inicioMesSeguinte.getFullYear()}-${String(inicioMesSeguinte.getMonth() + 1).padStart(2, '0')}-01`;
  const mesAtual = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(hoje);

  useEffect(() => {
    let cancelado = false;

    async function carregarDados() {
      setIsLoading(true);
      setLoadError('');

      try {
        const [contratosResponse, imoveisResponse, manutencoesResponse] = await Promise.all([
          api.get('/contratos'),
          api.get('/imoveis/me'),
          api.get('/manutencoes'),
        ]);
        const contratos = contratosResponse.data;
        const cobrancasPorContrato = await Promise.all(contratos.map(async (contrato) => {
          const response = await api.get(`/cobrancas/contrato/${contrato.idContrato}`);
          return response.data.map((cobranca) => ({ ...cobranca, contratoId: contrato.idContrato }));
        }));

        if (cancelado) return;
        setDados({
          contratos,
          imoveis: imoveisResponse.data,
          manutencoes: manutencoesResponse.data,
          cobrancas: cobrancasPorContrato.flat(),
        });
      } catch (error) {
        if (!cancelado) {
          console.error('Erro ao carregar dados financeiros:', error);
          setLoadError('Não foi possível carregar os dados financeiros. Verifique sua conexão e tente novamente.');
        }
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    }

    carregarDados();
    return () => { cancelado = true; };
  }, [reloadKey]);

  const financeiro = useMemo(() => {
    if (!dados) return null;

    const contratosPorId = new Map(dados.contratos.map((contrato) => [contrato.idContrato, contrato]));
    const imoveisPorId = new Map(dados.imoveis.map((imovel) => [imovel.idImovel, imovel]));
    const detalharCobranca = (cobranca) => {
      const contrato = contratosPorId.get(cobranca.contratoId);
      const imovel = contrato ? imoveisPorId.get(contrato.imovelId) : null;
      return {
        ...cobranca,
        inquilino: contrato?.locatarioNome || 'Inquilino não identificado',
        imovel: imovel?.endereco || 'Imóvel não identificado',
      };
    };
    const cobrancas = dados.cobrancas.map(detalharCobranca);
    const manutencoes = dados.manutencoes
      .filter((item) => item.valorGasto != null)
      .map((item) => ({ ...item, valorGasto: Number(item.valorGasto) }));
    const pagasNoMes = cobrancas.filter((item) =>
      item.cobrancaStatus === 'PAGA' && item.dataPagamento?.startsWith(chaveMesAtual));
    const despesasNoMes = manutencoes.filter((item) => item.dataAbertura?.startsWith(chaveMesAtual));
    const emAberto = cobrancas.filter((item) =>
      item.cobrancaStatus === 'PENDENTE' || item.cobrancaStatus === 'ATRASADA');
    const emAtraso = emAberto
      .filter((item) => item.cobrancaStatus === 'ATRASADA' || item.dataVencimento < hojeLocal)
      .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));
    const aReceber = emAberto
      .filter((item) => item.dataVencimento >= hojeLocal)
      .sort((a, b) => a.dataVencimento.localeCompare(b.dataVencimento));
    const previstoNoMes = aReceber.filter((item) => item.dataVencimento < dataLimiteMes);
    const meses = Array.from({ length: 6 }, (_, index) => {
      const data = new Date(anoAtual, mesIndiceAtual - 5 + index, 1);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      const recebido = somar(cobrancas.filter((item) =>
        item.cobrancaStatus === 'PAGA' && item.dataPagamento?.startsWith(chave)), (item) => item.valor);
      const gastos = somar(manutencoes.filter((item) =>
        item.dataAbertura?.startsWith(chave)), (item) => item.valorGasto);
      return {
        chave,
        nome: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(data).replace('.', ''),
        recebido,
        gastos,
      };
    });

    return {
      pagasNoMes,
      despesasNoMes,
      emAtraso,
      aReceber,
      previstoNoMes,
      manutencoesRecentes: [...manutencoes].sort((a, b) => (b.dataAbertura || '').localeCompare(a.dataAbertura || '')),
      meses,
    };
  }, [dados, anoAtual, mesIndiceAtual, hojeLocal, chaveMesAtual, dataLimiteMes]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-[#15966a]">
        <Loader2 className="size-8 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-[#092b5a]">Carregando seus dados financeiros...</p>
      </div>
    );
  }

  if (loadError || !financeiro) {
    return (
      <section className="flex min-h-[310px] flex-col items-center justify-center rounded-lg border border-[#e8edf2] bg-white px-5 py-8 text-center" role="alert">
        <AlertTriangle className="size-8 text-[#eb5757]" aria-hidden="true" />
        <p className="mt-4 text-sm font-semibold text-[#092b5a]">{loadError || 'Não foi possível carregar os dados financeiros.'}</p>
        <button
          className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-md border-0 bg-[#15966a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#117a56]"
          type="button"
          onClick={() => { setIsLoading(true); setReloadKey((valor) => valor + 1); }}
        >
          <RefreshCw className="size-4" aria-hidden="true" /> Tentar novamente
        </button>
      </section>
    );
  }

  const recebidoMes = somar(financeiro.pagasNoMes, (item) => item.valor);
  const despesasMes = somar(financeiro.despesasNoMes, (item) => item.valorGasto);
  const totalAtraso = somar(financeiro.emAtraso, (item) => item.valor);
  const saldoMes = recebidoMes - despesasMes;
  const proximoRecebimento = financeiro.aReceber[0];
  const maiorMovimento = Math.max(...financeiro.meses.flatMap(({ recebido, gastos }) => [recebido, gastos]), 0);
  const temHistorico = maiorMovimento > 0;

  return (
    <div className="dashboard-page">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">CONTROLE DA CARTEIRA</p>
          <h1 className="m-0 text-[29px] leading-[1.2] font-extrabold text-[#092b5a] max-[700px]:text-[25px]">Financeiro</h1>
          <p className="mt-2 text-[13px] text-[#748196]">Acompanhe somente cobranças e despesas registradas na sua conta.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#dce3eb] bg-white px-3 py-2 text-[11px] font-semibold capitalize text-[#46566b]">
          <CalendarDays className="size-4 text-[#15966a]" aria-hidden="true" />
          {mesAtual}
        </span>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-lg border border-[#d9e8f4] bg-[#f3f8fc] px-4 py-3 text-xs leading-relaxed text-[#46566b]" role="note">
        <FileText className="mt-0.5 size-4 shrink-0 text-[#092b5a]" aria-hidden="true" />
        <p className="m-0">Os valores vêm dos seus contratos, cobranças e manutenções. Cadastre contratos e lançamentos nas respectivas áreas; nenhum dado é criado automaticamente nesta página.</p>
      </div>

      <section className="mb-7 grid grid-cols-4 gap-4 max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1" aria-label="Resumo financeiro do mês">
        <CartaoResumo titulo="Recebido no mês" valor={formatarMoeda(recebidoMes)} detalhe={`${financeiro.pagasNoMes.length} cobrança(s) marcada(s) como paga`} icon={ArrowDownLeft} />
        <CartaoResumo titulo="Despesas registradas" valor={formatarMoeda(despesasMes)} detalhe={`${financeiro.despesasNoMes.length} manutenção(ões) com valor`} icon={ArrowUpRight} tone="orange" />
        <CartaoResumo titulo="Saldo do mês" valor={formatarMoeda(saldoMes)} detalhe="Recebimentos menos despesas registradas" icon={TrendingUp} tone="navy" />
        <CartaoResumo titulo="Aluguéis em atraso" valor={formatarMoeda(totalAtraso)} detalhe={`${financeiro.emAtraso.length} cobrança(s) vencida(s)`} icon={CircleAlert} tone="red" />
      </section>

      <section className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_.85fr]">
        <article className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="m-0 text-[15px] font-bold text-[#092b5a]">Próximo aluguel a receber</h2>
              <p className="mt-1 mb-0 text-xs text-[#748196]">Cobrança futura registrada nos seus contratos.</p>
            </div>
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eaf6f0] text-[#15966a]">
              <Clock3 className="size-[18px]" aria-hidden="true" />
            </span>
          </div>
          {proximoRecebimento ? (
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg bg-[#f7faf8] p-4">
              <div>
                <p className="mb-1 text-[11px] font-semibold text-[#748196]">{formatarData(proximoRecebimento.dataVencimento)} · {proximoRecebimento.inquilino}</p>
                <strong className="text-[25px] font-bold text-[#092b5a]">{formatarMoeda(proximoRecebimento.valor)}</strong>
                <p className="mt-1 mb-0 text-xs text-[#748196]">{proximoRecebimento.imovel}</p>
              </div>
            </div>
          ) : (
            <EstadoVazio>Nenhuma cobrança futura registrada. As cobranças são consultadas a partir dos seus contratos.</EstadoVazio>
          )}
        </article>

        <article className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="m-0 text-[15px] font-bold text-[#092b5a]">A receber neste mês</h2>
              <p className="mt-1 mb-0 text-xs text-[#748196]">Cobranças futuras já registradas</p>
            </div>
            <Wallet className="size-5 text-[#15966a]" aria-hidden="true" />
          </div>
          <strong className="text-[22px] font-bold text-[#092b5a]">{formatarMoeda(somar(financeiro.previstoNoMes, (item) => item.valor))}</strong>
          <p className="mt-1 mb-0 text-[11px] text-[#8995a5]">{financeiro.previstoNoMes.length} cobrança(s) com vencimento neste mês</p>
        </article>
      </section>

      <section className="mb-7 rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-[15px] font-bold text-[#092b5a]">Recebimentos previstos</h2>
            <p className="mt-1 mb-0 text-xs text-[#748196]">Cobranças futuras que já existem no sistema.</p>
          </div>
          <Link to="/contratos" className="inline-flex items-center gap-1 text-xs font-bold text-[#15966a] no-underline hover:underline">
            Ver contratos <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {financeiro.aReceber.length === 0 ? (
          <EstadoVazio>Nenhum recebimento futuro registrado.</EstadoVazio>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="text-[10px] font-bold tracking-wide text-[#8995a5] uppercase">
                <tr className="border-b border-[#e8edf2]">
                  <th className="px-3 py-3">Inquilino</th>
                  <th className="px-3 py-3">Imóvel</th>
                  <th className="px-3 py-3">Vencimento</th>
                  <th className="px-3 py-3 text-right">Valor</th>
                  <th className="px-3 py-3 text-right">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef1f4]">
                {financeiro.aReceber.map((item) => (
                  <tr key={item.idCobranca} className="text-[#46566b]">
                    <td className="px-3 py-3 font-semibold text-[#092b5a]">{item.inquilino}</td>
                    <td className="px-3 py-3">{item.imovel}</td>
                    <td className="px-3 py-3">{formatarData(item.dataVencimento)}</td>
                    <td className="px-3 py-3 text-right font-semibold text-[#092b5a]">{formatarMoeda(item.valor)}</td>
                    <td className="px-3 py-3 text-right">
                      <span className="rounded-full bg-[#f0f4f8] px-2.5 py-1 text-[10px] font-bold text-[#46566b]">Pendente</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="overflow-hidden rounded-lg border border-[#f2d8d8] bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-[#f2d8d8] bg-[#fffafa] px-5 py-4">
            <div className="flex items-center gap-2">
              <CircleAlert className="size-4 text-[#eb5757]" aria-hidden="true" />
              <h2 className="m-0 text-sm font-bold text-[#092b5a]">Cobranças em atraso</h2>
            </div>
            <span className="rounded-full bg-[#feeeee] px-2.5 py-1 text-[10px] font-bold text-[#c54141]">{financeiro.emAtraso.length} pendente(s)</span>
          </div>
          {financeiro.emAtraso.length === 0 ? (
            <EstadoVazio>Nenhuma cobrança vencida registrada.</EstadoVazio>
          ) : (
            <ul className="m-0 divide-y divide-[#eef1f4] p-0">
              {financeiro.emAtraso.map((item) => (
                <li key={item.idCobranca} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <strong className="block text-xs text-[#092b5a]">{item.inquilino}</strong>
                    <span className="mt-1 block text-[11px] text-[#748196]">{item.imovel} · venceu {formatarData(item.dataVencimento)}</span>
                  </div>
                  <strong className="block text-xs text-[#eb5757]">{formatarMoeda(item.valor)}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-sm font-bold text-[#092b5a]">Despesas registradas</h2>
              <p className="mt-1 mb-0 text-[11px] text-[#748196]">Manutenções com valor informado.</p>
            </div>
            <Link to="/manutencoes" aria-label="Ver manutenções" className="text-[#15966a] hover:text-[#117a56]">
              <ChevronRight className="size-5" aria-hidden="true" />
            </Link>
          </div>
          {financeiro.manutencoesRecentes.length === 0 ? (
            <EstadoVazio>Nenhuma despesa com valor registrada.</EstadoVazio>
          ) : (
            <ul className="m-0 divide-y divide-[#eef1f4] p-0">
              {financeiro.manutencoesRecentes.slice(0, 5).map((item) => (
                <li key={item.idPedido} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#fff4e5] text-[#d88735]"><Wrench className="size-4" aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <strong className="block truncate text-xs text-[#092b5a]">{item.descricaoProblema}</strong>
                      <span className="mt-1 block truncate text-[10px] text-[#748196]">{item.imovelEndereco} · {formatarData(item.dataAbertura)}</span>
                    </div>
                  </div>
                  <strong className="shrink-0 text-xs text-[#092b5a]">{formatarMoeda(item.valorGasto)}</strong>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="rounded-lg border border-[#e8edf2] bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="m-0 text-[15px] font-bold text-[#092b5a]">Resumo de recebimentos e despesas</h2>
          <p className="mt-1 mb-0 text-xs text-[#748196]">Movimentações reais dos últimos seis meses.</p>
        </div>
        <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-medium text-[#46566b]">
          <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-[#15966a]" />Recebido</span>
          <span className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm bg-[#f2c94c]" />Despesas</span>
        </div>
        {!temHistorico ? (
          <EstadoVazio>Nenhuma movimentação financeira registrada nos últimos seis meses.</EstadoVazio>
        ) : (
          <div className="grid grid-cols-6 gap-3 max-[700px]:grid-cols-3">
            {financeiro.meses.map(({ chave, nome, recebido, gastos }) => (
              <div key={chave} className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-full items-end justify-center gap-1.5 rounded-md bg-[#f8fafb] px-2 pt-2">
                  <div
                    className="w-4 max-w-[40%] rounded-t-sm bg-[#15966a]"
                    style={{ height: `${(recebido / maiorMovimento) * 100}%` }}
                    title={`Recebido: ${formatarMoeda(recebido)}`}
                    aria-label={`${nome}: recebido ${formatarMoeda(recebido)}`}
                  />
                  <div
                    className="w-4 max-w-[40%] rounded-t-sm bg-[#f2c94c]"
                    style={{ height: `${(gastos / maiorMovimento) * 100}%` }}
                    title={`Despesas: ${formatarMoeda(gastos)}`}
                    aria-label={`${nome}: despesas ${formatarMoeda(gastos)}`}
                  />
                </div>
                <span className="text-[10px] font-semibold capitalize text-[#748196]">{nome}/{chave.slice(2, 4)}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 mb-0 flex items-center gap-2 text-[10px] text-[#8995a5]"><CreditCard className="size-3.5" aria-hidden="true" />Recebimentos vêm de cobranças marcadas como pagas; despesas vêm dos valores informados nas manutenções.</p>
      </section>

      {financeiro.aReceber.length === 0 && financeiro.emAtraso.length === 0 && financeiro.manutencoesRecentes.length === 0 && (
        <section className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e8edf2] bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-[#eef2f8] text-[#092b5a]"><Home className="size-5" aria-hidden="true" /></span>
            <div>
              <h2 className="m-0 text-sm font-bold text-[#092b5a]">Comece pelos seus contratos</h2>
              <p className="mt-1 mb-0 text-xs text-[#748196]">Cadastre contratos, gere cobranças e informe despesas para preencher este painel.</p>
            </div>
          </div>
          <Link to="/contratos" className="inline-flex items-center gap-1 text-xs font-bold text-[#15966a] no-underline hover:underline">
            Ir para contratos <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      )}
    </div>
  );
}
