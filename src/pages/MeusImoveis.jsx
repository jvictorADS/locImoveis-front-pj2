import React, { useState, useEffect } from 'react';
import {
  Building2,
  Loader2,
  MapPin,
  Home,
  X,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Imoveis() {
  const { user, token } = useAuth();
  const jwtToken = token || localStorage.getItem('token');
  const locadorId = user?.id || user?.idUsuario || 1;

  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [fotoArquivo, setFotoArquivo] = useState(null);

  // estados dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // estados dos Formulários e Seleção
  const [selectedImovel, setSelectedImovel] = useState(null);
  const [novoImovel, setNovoImovel] = useState({
    endereco: '',
    valorAluguel: '',
    valorIPTU: ''
  });

  const [editFormData, setEditFormData] = useState({
    endereco: '',
    valorAluguel: '',
    valorIPTU: ''
  });

  // buscar imóveis do locador
  const carregarImoveis = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8081/imoveis/locador/${locadorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
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
    if (locadorId) carregarImoveis();
  }, [locadorId]);

  // envio de foto em Multipart
  const enviarFoto = async (imovelId) => {
    if (!fotoArquivo) return;

    const formData = new FormData();
    formData.append('foto', fotoArquivo);

    try {
      const response = await fetch(`http://localhost:8081/imoveis/${imovelId}/foto`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro devolvido pelo backend no upload:", errorText);
        throw new Error('Falha ao enviar a foto para o servidor');
      }

      const imovelComFoto = await response.json();
      console.log("Foto anexada com sucesso:", imovelComFoto);
    } catch (error) {
      console.error("Erro no upload da foto:", error);
      alert("Imóvel salvo, mas ocorreu um erro ao carregar a imagem.");
    }
  };

  // cadastrar novo imóvel
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const response = await fetch('http://localhost:8081/imoveis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
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
        throw new Error(errorText || 'Erro ao cadastrar imóvel');
      }

      const imovelCriado = await response.json();
      const idValido = imovelCriado.idImovel || imovelCriado.id;

      if (fotoArquivo && idValido) {
        await enviarFoto(idValido);
      }

      setIsCreateModalOpen(false);
      setNovoImovel({ endereco: '', valorAluguel: '', valorIPTU: '' });
      setFotoArquivo(null);

      setTimeout(() => {
        carregarImoveis();
      }, 400);

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert(`Falha ao salvar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // editar imóvel existente
  const handleEditOpen = (imovel) => {
    setSelectedImovel(imovel);
    setEditFormData({
      endereco: imovel.endereco,
      valorAluguel: imovel.valorAluguel,
      valorIPTU: imovel.valorIPTU || ''
    });
    setFotoArquivo(null);
    setOpenMenuId(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await fetch(`http://localhost:8081/imoveis/${selectedImovel.idImovel}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          endereco: editFormData.endereco,
          valorAluguel: parseFloat(editFormData.valorAluguel),
          valorIPTU: editFormData.valorIPTU ? parseFloat(editFormData.valorIPTU) : 0.0
        })
      });

      if (!response.ok) throw new Error('Erro ao atualizar imóvel');

      if (fotoArquivo && selectedImovel?.idImovel) {
        await enviarFoto(selectedImovel.idImovel);
      }

      setIsEditModalOpen(false);
      setSelectedImovel(null);
      setFotoArquivo(null);

      setTimeout(() => {
        carregarImoveis();
      }, 400);

    } catch (error) {
      console.error("Erro ao editar:", error);
      alert(`Falha ao atualizar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // excluir imóvel
  const handleDeleteOpen = (imovel) => {
    setSelectedImovel(imovel);
    setOpenMenuId(null);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`http://localhost:8081/imoveis/${selectedImovel.idImovel}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (!response.ok) throw new Error('Erro ao excluir imóvel');

      setIsDeleteModalOpen(false);
      setSelectedImovel(null);
      carregarImoveis();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert(`Falha ao excluir: ${error.message}`);
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
          <p className="mt-2 text-[13px] text-[#748196] max-[700px]:text-xs max-[700px]:leading-[1.5]">Gerencie seus imóveis cadastrados.</p>
        </div>

        <button
          onClick={() => {
            setFotoArquivo(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-md bg-[#15966a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#117a56]"
        >
          <Home className="size-4" />
          Adicionar Imóvel
        </button>
      </div>

      {/* Lista de Imóveis */}
      {imoveis.length === 0 ? (
        <section className="flex min-h-[310px] flex-col items-center justify-center rounded-[9px] border border-[#e8edf2] bg-white px-5 py-8 text-center shadow-sm">
          <span className="mb-[17px] grid size-[54px] place-items-center rounded-full bg-[#eaf6f0] text-[#15966a]">
            <Building2 className="size-6" />
          </span>
          <h2 className="m-0 text-base font-bold text-[#092b5a]">Nenhum imóvel para exibir</h2>
          <p className="mt-2 mb-[19px] max-w-[400px] text-xs leading-[1.6] text-[#748196]">
            Ainda não há imóveis cadastrados. Clique no botão acima para adicionar o primeiro.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-3 gap-5 max-[1050px]:grid-cols-2 max-[700px]:grid-cols-1">
          {imoveis.map((imovel) => (
            <div key={imovel.idImovel} className="flex flex-col overflow-hidden rounded-[9px] border border-[#e8edf2] bg-white shadow-sm transition-shadow hover:shadow-md relative">

              {/* Topo do Card com Foto ou Ícone Padrão */}
              <div className="h-[140px] w-full bg-[#f0f4f8] relative overflow-hidden">
                {imovel.fotoUrl ? (
                  <img
                    src={imovel.fotoUrl}
                    alt={imovel.endereco}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#8995a5]">
                    <Building2 className="size-10 opacity-30" />
                  </div>
                )}

                {/* Badge de Status */}
                <span className={`absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase shadow-sm ${
                  imovel.ocupacaoStatus === 'ALUGADO' 
                    ? 'bg-[#eaf6f0] text-[#15966a]' 
                    : 'bg-white/90 text-[#46566b] border border-[#d2dbe4]'
                }`}>
                  {imovel.ocupacaoStatus}
                </span>

                {/* Botão de Menu (Três Pontinhos) */}
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === imovel.idImovel ? null : imovel.idImovel)}
                    className="flex size-7 items-center justify-center rounded-full bg-white/90 text-[#092b5a] shadow-sm hover:bg-white transition-colors"
                  >
                    <MoreVertical className="size-4" />
                  </button>

                  {/* Dropdown do Menu */}
                  {openMenuId === imovel.idImovel && (
                    <div className="absolute right-0 mt-1 w-36 rounded-md bg-white py-1 shadow-lg border border-[#e8edf2] z-20">
                      <button
                        onClick={() => handleEditOpen(imovel)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#092b5a] hover:bg-[#f6f8fa]"
                      >
                        <Pencil className="size-3.5 text-[#15966a]" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteOpen(imovel)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Corpo do Card */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-1 text-[15px] font-bold text-[#092b5a]">
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

      {/* Modal de Cadastro */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092b5a]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#092b5a]">Cadastrar Novo Imóvel</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#8995a5] hover:text-[#092b5a]">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Endereço Completo</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] outline-none focus:border-[#15966a] focus:ring-1 focus:ring-[#15966a]"
                  value={novoImovel.endereco}
                  onChange={(e) => setNovoImovel({ ...novoImovel, endereco: e.target.value })}
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
                    onChange={(e) => setNovoImovel({ ...novoImovel, valorAluguel: e.target.value })}
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-[#46566b]">Valor IPTU (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] outline-none focus:border-[#15966a] focus:ring-1 focus:ring-[#15966a]"
                    value={novoImovel.valorIPTU}
                    onChange={(e) => setNovoImovel({ ...novoImovel, valorIPTU: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Foto do Imóvel</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-md border border-[#e8edf2] px-3 py-1.5 text-sm text-[#092b5a] file:mr-3 file:rounded-md file:border-0 file:bg-[#eaf6f0] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#15966a] hover:file:bg-[#d8efe3]"
                  onChange={(e) => setFotoArquivo(e.target.files[0])}
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-md border border-[#e8edf2] py-2.5 text-sm font-semibold text-[#46566b] hover:bg-[#f6f8fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-[#15966a] py-2.5 text-sm font-semibold text-white hover:bg-[#117a56] disabled:opacity-70"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Imóvel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092b5a]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#092b5a]">Editar Imóvel #{selectedImovel?.idImovel}</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#8995a5] hover:text-[#092b5a]">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Endereço Completo</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] outline-none focus:border-[#15966a] focus:ring-1 focus:ring-[#15966a]"
                  value={editFormData.endereco}
                  onChange={(e) => setEditFormData({ ...editFormData, endereco: e.target.value })}
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
                    value={editFormData.valorAluguel}
                    onChange={(e) => setEditFormData({ ...editFormData, valorAluguel: e.target.value })}
                  />
                </div>

                <div className="flex-1">
                  <label className="mb-1 block text-xs font-semibold text-[#46566b]">Valor IPTU (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full rounded-md border border-[#e8edf2] px-3 py-2 text-sm text-[#092b5a] outline-none focus:border-[#15966a] focus:ring-1 focus:ring-[#15966a]"
                    value={editFormData.valorIPTU}
                    onChange={(e) => setEditFormData({ ...editFormData, valorIPTU: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#46566b]">Foto do Imóvel (Opcional para alterar)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full rounded-md border border-[#e8edf2] px-3 py-1.5 text-sm text-[#092b5a] file:mr-3 file:rounded-md file:border-0 file:bg-[#eaf6f0] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-[#15966a] hover:file:bg-[#d8efe3]"
                  onChange={(e) => setFotoArquivo(e.target.files[0])}
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-md border border-[#e8edf2] py-2.5 text-sm font-semibold text-[#46566b] hover:bg-[#f6f8fa]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-md bg-[#15966a] py-2.5 text-sm font-semibold text-white hover:bg-[#117a56] disabled:opacity-70"
                >
                  {isSubmitting ? 'Atualizando...' : 'Atualizar Imóvel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092b5a]/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-[#092b5a]">Excluir Imóvel?</h3>
            <p className="mt-2 text-xs text-[#748196]">
              Tem certeza que deseja remover o imóvel <strong>#{selectedImovel?.idImovel}</strong>? Esta ação não pode ser desfeita.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 rounded-md border border-[#e8edf2] py-2 text-sm font-semibold text-[#46566b] hover:bg-[#f6f8fa]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="flex-1 rounded-md bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-70"
              >
                {isSubmitting ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}