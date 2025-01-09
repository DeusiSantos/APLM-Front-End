import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  pontos: number; // Adiciona a propriedade 'pontos'
  distancia: string; // Adiciona a propriedade 'distancia'
  tempo: string; // Adiciona a propriedade 'tempo' (hora:minuto)
}


interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticating: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  register: (
    nome: string,
    email: string,
    senha: string,
    telefone: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData | null>(null); // Define corretamente o tipo inicial

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const setApiAuthorizationHeader = (token: string | null) => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.Authorization;
    }
  };

  const isTokenExpired = (token: string): boolean => {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  };

  const login = async (email: string, senha: string): Promise<boolean> => {
    setIsAuthenticating(true);
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { usuario, token } = response.data;
  
      if (!usuario || !token) {
        throw new Error('Resposta inválida da API');
      }
  
      // Agora 'usuario' contém as propriedades adicionais, como pontos, distancia e tempo
      await AsyncStorage.setItem('user', JSON.stringify(usuario));
      await AsyncStorage.setItem('token', token);
  
      setUser(usuario);
      setToken(token);
      setApiAuthorizationHeader(token);
  
      return true;
    } catch (error: any) {
      console.error('Erro no login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.mensagem || 'Erro ao fazer login');
    } finally {
      setIsAuthenticating(false);
    }
  };
  

  const register = async (
    nome: string,
    email: string,
    senha: string,
    telefone: string
  ): Promise<boolean> => {
    setIsAuthenticating(true);
    try {
      const response = await api.post('/auth/register', {
        nome,
        email,
        senha,
        telefone,
      });
      const { token } = response.data;

      if (!token) {
        throw new Error('Token não recebido');
      }

      // Fazer uma requisição adicional para obter os dados do usuário
      const userResponse = await api.get('/cyclists/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const usuario = userResponse.data;

      await AsyncStorage.setItem('user', JSON.stringify(usuario));
      await AsyncStorage.setItem('token', token);

      setUser(usuario);
      setToken(token);
      setApiAuthorizationHeader(token);

      return true;
    } catch (error: any) {
      console.error('Erro no registro:', error.response?.data || error.message);
      throw new Error(error.response?.data?.mensagem || 'Erro ao registrar');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setApiAuthorizationHeader(null);
  };

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');

        if (storedUser && storedToken && !isTokenExpired(storedToken)) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          setApiAuthorizationHeader(storedToken);
        } else {
          await logout();
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const contextValue: AuthContextData = {
    user,
    token,
    loading,
    isAuthenticating,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
