import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../services/Auth';
import logoImg from '../assets/Logo 2.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      let errorMessage = '';

      switch (err.message) {
        case 'Invalid login credentials':
          errorMessage = 'Credenciais invalidas';

          break;

        default:
          errorMessage = err.message;

          break;
      }

      setError(errorMessage);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-b from-primary-dark to-primary-light">
        <img
          src={logoImg}
          alt="Marlei Reis Logo"
          className="mx-auto h-24 w-auto mb-6"
        />
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-8">
              Entrar
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Usuário
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-light focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-light focus:border-primary"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary hover:text-primary-light"
                  >
                    Esqueceu sua senha?
                  </a>
                </div>
              </div>
              {error && (
                <p className="mt-2 text-center text-sm text-red-600">{error}</p>
              )}
              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primtext-primary-light"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 sm:px-8">
            <p className="text-xs leading-5 text-gray-500">
              Não tem uma conta?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary hover:text-primary"
              >
                Cadastrar novo usuário
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
