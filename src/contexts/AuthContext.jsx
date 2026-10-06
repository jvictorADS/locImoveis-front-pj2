import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import axios from 'axios';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

const registrar = async (dadosUsuario) => {
    setLoading(true);
    localStorage.removeItem('token');
    
    try {
      const response = await fetch('http://localhost:8081/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomeCompleto: dadosUsuario.nome, 
          cpf: dadosUsuario.cpf,
          telefone: dadosUsuario.telefone,
          email: dadosUsuario.email,
          senha: dadosUsuario.senha,
          tipoUsuario: 'LOCADOR'
        })
      });

      if (!response.ok) {
        const respostaErro = await response.json().catch(() => null);
        console.error("DEBUG DO ERRO:", respostaErro);
        
        let mensagem = 'Falha ao realizar cadastro. Verifique os dados.';
        if (respostaErro) {
          if (Array.isArray(respostaErro.errors)) {
            mensagem = respostaErro.errors.map(err => err.defaultMessage).join(' | ');
          } else if (respostaErro.mensagem) {
            mensagem = respostaErro.mensagem;
          } else if (respostaErro.message) {
            mensagem = respostaErro.message;
          }
        }

        return { success: false, error: mensagem };
      }

      return { success: true };
    } catch (error) {
      console.error("Erro na requisição:", error);
      return { success: false, error: 'Servidor indisponível. Tente novamente mais tarde.' };
    } finally {
      setLoading(false);
    }
  };
  const login = async (email, senha) => {
    setLoading(true);
    try {
      // chama o AuthController do Spring Boot
      const response = await api.post('/auth/login', { email, senha });
      const { token } = response.data;

      localStorage.setItem('token', token);
      setToken(token);
      return { success: true };
    } catch (error) {
      const mensagem = error.response?.data?.mensagem || 'Falha ao realizar login. Verifique suas credenciais.';
      return { success: false, error: mensagem };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout, registrar, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);