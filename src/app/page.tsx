'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LockClosedIcon } from '@heroicons/react/solid';

const APP_PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD || '1234';

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === APP_PASSWORD) {
      onLogin();
    } else {
      alert('Senha inválida. Por favor, tente novamente.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="max-w-sm w-full bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <LockClosedIcon className="h-12 w-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-4">Acesso Restrito</h2>
        <input
          type="password"
          placeholder="Senha"
          className="input rounded mb-4 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn py-2 rounded w-full" onClick={handleLogin}>
          Entrar
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/control');
    }
  }, [isAuthenticated, router]);

  return (
    <div>
      {!isAuthenticated && <LoginPage onLogin={() => setIsAuthenticated(true)} />}
    </div>
  );
}
