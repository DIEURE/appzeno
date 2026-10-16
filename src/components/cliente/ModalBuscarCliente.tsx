import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, UserCircle, Building2, Phone, FileText } from 'lucide-react';

import { pessoaService } from '../../services/pessoaService';
import type { Pessoa } from '../../types/cliente';

interface ModalBuscarClienteProps {
  aberto: boolean;
  onSelecionar: (pessoa: Pessoa) => void;
  onFechar: () => void;
}

export const ModalBuscarCliente: React.FC<ModalBuscarClienteProps> = ({
  aberto,
  onSelecionar,
  onFechar,
}) => {
  const [termo, setTermo] = useState<string>('');
  const [resultados, setResultados] = useState<Pessoa[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [indiceSelecionado, setIndiceSelecionado] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!aberto) return;
    setTermo('');
    setResultados([]);
    setErro(null);
    setIndiceSelecionado(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;
    const t = termo.trim();

    if (t.length < 2) {
      setResultados([]);
      setErro(null);
      setCarregando(false);
      return;
    }

    const handle = setTimeout(() => {
      setCarregando(true);
      setErro(null);
      pessoaService
        .buscar(t)
        .then((lista) => {
          setResultados(lista);
          setIndiceSelecionado(0);
        })
        .catch((err) => {
          console.error(err);
          setErro('Erro ao buscar clientes.');
        })
        .finally(() => setCarregando(false));
    }, 300);

    return () => clearTimeout(handle);
  }, [termo, aberto]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!aberto) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onFechar();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndiceSelecionado((i) => Math.min(i + 1, resultados.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndiceSelecionado((i) => Math.max(i - 1, 0));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const escolhido = resultados[indiceSelecionado];
        if (escolhido) onSelecionar(escolhido);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, resultados, indiceSelecionado, onSelecionar, onFechar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-800 bg-ink-950 px-6 py-4">
          <div className="flex items-center gap-2">
            <User size={20} className="text-accent" />
            <h2 className="text-xl font-bold tracking-tight text-ink-100">
              Buscar Cliente
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            className="text-ink-400 transition hover:text-accent"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-ink-800 bg-ink-900/60 px-6 py-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Digite o nome ou CPF/CNPJ (mínimo 2 caracteres)..."
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-950 py-2.5 pl-10 pr-3 text-base font-medium text-ink-100 placeholder-ink-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <Search className="absolute left-3 top-3 text-ink-400" size={18} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {carregando ? (
            <div className="flex h-full items-center justify-center text-ink-400">
              <p className="text-sm font-medium">Buscando...</p>
            </div>
          ) : erro ? (
            <div className="flex h-full flex-col items-center justify-center text-red-400">
              <p className="text-sm font-medium">{erro}</p>
            </div>
          ) : termo.trim().length < 2 ? (
            <div className="flex h-full flex-col items-center justify-center text-ink-500">
              <User size={56} strokeWidth={1.2} />
              <p className="mt-3 text-sm font-medium">
                Digite ao menos 2 caracteres para buscar
              </p>
            </div>
          ) : resultados.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-ink-500">
              <UserCircle size={56} strokeWidth={1.2} />
              <p className="mt-3 text-sm font-medium">
                Nenhum cliente encontrado
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-ink-800">
              {resultados.map((p, idx) => (
                <li
                  key={p.id}
                  onMouseEnter={() => setIndiceSelecionado(idx)}
                  onClick={() => onSelecionar(p)}
                  className={`cursor-pointer px-6 py-3 transition ${
                    idx === indiceSelecionado
                      ? 'bg-accent/15'
                      : 'hover:bg-ink-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-ink-400">
                        {p.tipo === 'JURIDICA' ? (
                          <Building2 size={20} />
                        ) : (
                          <UserCircle size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-ink-100">
                          {p.nome}
                          {p.nomeFantasia && p.tipo === 'JURIDICA' && (
                            <span className="ml-2 text-xs font-normal text-ink-400">
                              ({p.nomeFantasia})
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-ink-400">
                          <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {p.documento}
                          </span>
                          {p.telefone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} />
                              {p.telefone}
                            </span>
                          )}
                          {p.cidade && (
                            <span>
                              {p.cidade}
                              {p.uf ? `/${p.uf}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                      {p.tipo === 'JURIDICA' ? 'Jurídica' : 'Física'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-ink-800 bg-ink-950 px-6 py-3 text-xs text-ink-400">
          ↑↓ navega · Enter seleciona · ESC fecha
        </div>
      </div>
    </div>
  );
};