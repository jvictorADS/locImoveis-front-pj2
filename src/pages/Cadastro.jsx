import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Phone, FileText, AlertCircle, Home, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    senha: ''
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  
  const { registrar, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    
    const nomeLimpo = formData.nome.trim();
    if (!nomeLimpo.includes(' ')) {
      setErro('Por favor, insira seu nome e sobrenome.');
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    const result = await registrar(formData);
    if (result.success) {
      setSucesso(true);
      setTimeout(() => navigate('/login'), 3000);
    } else {
      setErro(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative">
      <div className="w-2 bg-[#092b5a] hidden md:block absolute left-0 top-0 bottom-0"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 my-8">
        <div className="w-full max-w-md space-y-6">
          
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="relative flex items-center">
              <Home className="w-8 h-8 text-emerald-600" />
              <span className="absolute -bottom-1 -right-1 text-blue-900 font-bold text-lg">✔</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-[#092b5a]">Loc Imóveis</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-[#092b5a]">Crie sua conta</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Preencha os dados abaixo para se cadastrar como Proprietário.
            </p>
          </div>

          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 text-sm border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Cadastro realizado com sucesso!</p>
                <p>Redirecionando para o login...</p>
              </div>
            </div>
          )}

          {!sucesso && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#092b5a] mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" name="nome" required value={formData.nome} onChange={handleChange} placeholder="João da Silva" className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#092b5a] transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#092b5a] mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="joao@email.com" className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#092b5a] transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#092b5a] mb-1">CPF</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" name="cpf" required value={formData.cpf} onChange={handleChange} placeholder="Apenas números" maxLength="11" className="w-full pl-9 pr-3 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#092b5a] transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#092b5a] mb-1">Telefone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" name="telefone" required value={formData.telefone} onChange={handleChange} placeholder="(11) 99999-9999" className="w-full pl-9 pr-3 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#092b5a] transition" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#092b5a] mb-1">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="password" name="senha" required value={formData.senha} onChange={handleChange} placeholder="••••••••" className="w-full pl-11 pr-4 py-2.5 bg-[#f8fafc] border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#092b5a] transition" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3 mt-2 bg-[#092b5a] hover:bg-[#071f42] text-white font-semibold rounded-xl shadow-lg transition duration-200 disabled:opacity-70">
                {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </button>
            </form>
          )}

          <div className="text-center mt-6">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#092b5a] transition">
              <ArrowLeft className="w-4 h-4" /> Voltar para o Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}