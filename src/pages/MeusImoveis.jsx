import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Loader2, MapPin, Home, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; 

export function Imoveis() {
  const { user, token } = useAuth(); // Resgata o usuário e token do contexto de autenticação
  
  // Pega o token do contexto ou direto do localStorage caso seu contexto salve lá
  const jwtToken = token || localStorage.getItem('token');
  
  // ID do locador logado (ajuste conforme a estrutura retornada pelo seu login)
  const locadorId = user?.id || user?.idUsuario || 1; 

  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [novoImovel, setNovoImovel] = useState({
    endereco: '',
    valorAluguel: '',
    valorIPTU: ''
  });

  // GET: Buscar imóveis pelo locador com Token
  const carregarImoveis = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:8081/imoveis/locador/${locadorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}` // Token de Autenticação
        }
      });

      if (!response.ok) throw new Error('Erro ao buscar imóveis');
      
      const data = await response.json();
      setImoveis(data);
      
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
      setImoveis([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (locadorId) {
      carregarImoveis();
    }
  }, [locadorId]);

  // POST: Criar novo imóvel com Token
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Token enviado:", jwtToken);
    console.log("Locador ID:", locadorId);
    try {
      setIsSubmitting(true);

      const response = await fetch('http://localhost:8081/imoveis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}` // Token de Autenticação
        },
        body: JSON.stringify({
          endereco: novoImovel.endereco,
          valorAluguel: parseFloat(novoImovel.valorAluguel),
          valorIPTU: novoImovel.valorIPTU ? parseFloat(novoImovel.valorIPTU) : 0.0,
          locadorId: locadorId
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText || 'Erro ao cadastrar imóvel'}`);
      }

      setIsModalOpen(false);
      setNovoImovel({ endereco: '', valorAluguel: '', valorIPTU: '' });
      carregarImoveis(); 

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert(`Falha ao salvar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-[#15966a]">
        <Loader2 className="size-8 animate-spin" />
        <p className="mt-4 text-sm font-semibold text-[#092b5a]">Carregando seu portfólio...</p>
      </div>
    );
  }

  return (
    <div className="imoveis-page relative">
      {/* Cabeçalho */}
      <div className="mb-[26px] flex items-end justify-between gap-5 max-[700px]:mb-[19px] max-[700px]:flex-col max-[700px]:items-start">
        <div>
          <p className="mb-2 text-[10px] font-extrabold tracking-[.1em] text-[#15966a]">PORTFÓLIO</p>
          <h1 className="m-0 text-[29px] leading-[1.2] font-extrabold text-[#092b5a] max-[700px]:text-[25px]">Meus imóveis</h1>
          <p className="mt-2 text-[13px] text-[#748196] max-[700px]:text-xs max-[700px]:leading-[1.5]">Seus imóveis em um só lugar.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-md bg-[#15966a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#117a56]"
        >
          <Home className="size-4" />
          Adicionar Imóvel
        </button>
      </div>

      {imoveis.length === 0 ? (
        <section className="flex min-h-[310px] flex-col items-center justify-center rounded-[9px] border border-[#e8edf2] bg-white px-5 py-8 text-center shadow-sm max-[700px]:min-h-[275px] max-[700px]:px-[18px] max-[700px]:py-[25px]">
          <span className="mb-[17px] grid size-[54px] place-items-center rounded-full bg-[#eaf6f0] text-[#15966a]">
            <Building2 className="size-6" aria-hidden="true" />
          </span>
          <h2 className="m-0 text-base font-bold text-[#092b5a]">Nenhum imóvel para exibir</h2>
          <p className="mt-2 mb-[19px] max-w-[400px] text-xs leading-[1.6] text-[#748196]">
            Ainda não há imóveis cadastrados. Clique no botão acima para adicionar o primeiro.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-3 gap-5 max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1">
          {imoveis.map((imovel) => (
            <div key={imovel.idImovel} className="flex flex-col overflow-hidden rounded-[9px] border border-[#e8edf2] bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="h-[140px] w-full bg-[#f0f4f8] relative">
                <div className="flex h-full w-full items-center justify-center text-[#8995a5]">
                  <Building2 className="size-10 opacity-30" />
                </div>
                <span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                  imovel.ocupacaoStatus === 'ALUGADO' ? 'bg-[#eaf6f0] text-[#15966a]' : 'bg-[#f0f4f8] text-[#46566b]'
                }`}>
                  {imovel.ocupacaoStatus}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-1 text-[15px] font-bold text-[#092b5a] line-clamp-1">
                  Imóvel #{imovel.idImovel}
                </h3>
                <div className="mb-4 flex items-start gap-1 text-[12px] text-[#748196]">
                  <MapPin className="mt-[2px] size-[13px] shrink-0" />
                  <span className="leading-tight line-clamp-2">{imovel.endereco}</span>
                </div>
                <div className="mt-auto pt-3 border-t border-[#e8edf2] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#8995a5]">Valor do aluguel</span>
                  <strong className="text-[14px] text-[#092b5a]">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(imovel.valorAluguel || 0)}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Modal de Criação de Imóvel */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092b5a]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#092b5a]">Cadastrar Novo Imóvel</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8995a5] hover:text-[#092b5a]">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Endereço Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] outline-none focus:border-[#15966a] focus:ring-1 focus:ring-[#15966a]"
                  value={novoImovel.endereco}
                  onChange={(e) => setNovoImovel({...novoImovel, endereco: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-[#46566b]">Valor Aluguel (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] outline-none focus:border-[#15966a] focus:ring-1 focus:ring-[#15966a]"
                    value={novoImovel.valorAluguel}
                    onChange={(e) => setNovoImovel({...novoImovel, valorAluguel: e.target.value})}
                  />
                </div>
                
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-[#46566b]">Valor IPTU (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] outline-none focus:border-[#15966a] focus:ring-1 focus:ring-[#15966a]"
                    value={novoImovel.valorIPTU}
                    onChange={(e) => setNovoImovel({...novoImovel, valorIPTU: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-md border border-[#e8edf2] py-2.5 text-sm font-semibold text-[#46566b] transition-colors hover:bg-[#f6f8fa]"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-[#15966a] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#117a56] disabled:opacity-70"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Imóvel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}