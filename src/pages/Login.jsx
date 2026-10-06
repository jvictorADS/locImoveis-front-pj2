import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, LogIn, Key, AlertCircle, Home } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState('');

  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    const result = await login(email, senha);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErro(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex relative">
      <div className="w-2 bg-[#092b5a] hidden md:block absolute left-0 top-0 bottom-0"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">

          {/* Logo */}
          <div className="flex justify-center items-center gap-2 mb-8">
            <div className="relative flex items-center">
              <Home className="w-8 h-8 text-emerald-600" />
              <span className="absolute -bottom-1 -right-1 text-blue-900 font-bold text-lg">✔</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold text-[#092b5a]">Loc Imóveis</span>
              <span className="text-[10px] text-emerald-500 font-semibold self-end">App</span>
            </div>
          </div>

          {/* Cabeçalho */}
          <div>
            <h1 className="text-3xl font-extrabold text-[#092b5a] flex items-center gap-2">
              Acesse sua conta <span className="text-2xl">👋</span>
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Insira suas credenciais para acessar o painel de controle.
            </p>
          </div>

          {/* Alerta de Erro */}
          {erro && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input E-mail / CPF */}
            <div>
              <label className="block text-sm font-bold text-[#092b5a] mb-1.5">
                E-mail ou CPF
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#092b5a] focus:ring-1 focus:ring-[#092b5a] transition"
                />
              </div>
            </div>

            {/* Input Senha */}
            <div>
              <label className="block text-sm font-bold text-[#092b5a] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-[#f8fafc] border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#092b5a] focus:ring-1 focus:ring-[#092b5a] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-[#092b5a] focus:ring-[#092b5a]"
                />
                <span className="text-slate-500 font-medium">Lembrar de mim</span>
              </label>
              <a href="#" className="font-bold text-[#092b5a] hover:underline">
                Esqueceu a senha?
              </a>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#092b5a] hover:bg-[#071f42] text-white font-semibold rounded-xl shadow-lg shadow-blue-900/20 transition duration-200 disabled:opacity-70"
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
              {!loading && <LogIn className="w-5 h-5" />}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              Novo por aqui?
            </span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Criar Conta */}
          <div className="text-center text-sm font-medium text-slate-500">
            Não possui cadastro?{' '}
            <Link to="/cadastro" className="font-bold text-emerald-600 hover:underline">
              Criar conta de Proprietário
            </Link>
          </div>

          {/* Portal do Inquilino */}
          <div className="mt-8 bg-[#f8fafc] border border-slate-100 rounded-2xl p-5 text-center space-y-3">
            <p className="text-sm font-medium text-slate-500">
              É um inquilino e deseja acessar seus boletos?
            </p>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-[#092b5a] font-bold rounded-xl transition duration-200 shadow-sm">
              <Key className="w-4 h-4" />
              Acessar Portal do Inquilino
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}