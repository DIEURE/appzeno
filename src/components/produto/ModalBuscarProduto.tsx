import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Package } from 'lucide-react';

import type { Produto } from '../types/pdv';

interface ModalBuscarProdutoProps {
  aberto: boolean;
  produtos: Produto[];
  carregando: boolean;
  onSelecionar: (produto: Produto) => void;
  onFechar: () => void;
}

export const ModalBuscarProduto: React.FC<ModalBuscarProdutoProps> = ({
  aberto,
  produtos,
  carregando,
  onSelecionar,
  onFechar,
}) => {
  const [filtro, setFiltro] = useState<string>('');
  const inputFiltroRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setFiltro('');
      setTimeout(() => inputFiltroRef.current?.focus(), 100);
    }
  }, [aberto]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!aberto) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onFechar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, onFechar]);

  const produtosFiltrados = useMemo(() => {
    const termo = filtro.trim().toLowerCase();
    if (!termo) return produtos;
    return produtos.filter((p) => {
      const desc = p.descricao?.toLowerCase() ?? '';
      const codigo = p.codigoBarras?.toLowerCase() ?? '';
      return desc.includes(termo) || codigo.includes(termo);
    });
  }, [filtro, produtos]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-800 bg-ink-950 px-6 py-4">
          <div className="flex items-center gap-2">
            <Package size={20} className="text-accent" />
            <h2 className="text-xl font-bold tracking-tight text-ink-100">
              Selecionar Produto
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
              ref={inputFiltroRef}
              type="text"
              placeholder="Filtrar por descrição ou código de barras..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full rounded-lg border border-ink-700 bg-ink-950 py-2.5 pl-10 pr-3 text-sm font-medium text-ink-100 placeholder-ink-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <Search className="absolute left-3 top-3 text-ink-400" size={16} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {carregando ? (
            <div className="flex h-full items-center justify-center text-ink-400">
              <p className="text-sm font-medium">Carregando produtos...</p>
            </div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-ink-500">
              <Package size={56} strokeWidth={1.2} />
              <p className="mt-3 text-sm font-medium">
                {filtro
                  ? 'Nenhum produto encontrado para esse filtro'
                  : 'Nenhum produto cadastrado'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-ink-800 bg-ink-950 text-xs font-bold uppercase text-ink-300">
                <tr>
                  <th className="px-6 py-2.5">Código</th>
                  <th className="px-6 py-2.5">Descrição</th>
                  <th className="w-24 px-4 py-2.5 text-center">UN</th>
                  <th className="w-32 px-4 py-2.5 text-right">Preço</th>
                  <th className="w-28 px-4 py-2.5 text-right">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {produtosFiltrados.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onSelecionar(p)}
                    className="cursor-pointer transition hover:bg-accent/10"
                  >
                    <td className="px-6 py-2.5 font-mono text-xs text-ink-300">
                      {p.codigoBarras ?? '—'}
                    </td>
                    <td className="px-6 py-2.5 font-semibold text-ink-100">
                      {p.descricao}
                    </td>
                    <td className="px-4 py-2.5 text-center text-ink-200">{p.unidade}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-accent">
                      R$ {p.precoVenda.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-ink-300">
                      {p.estoqueSaldo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-ink-800 bg-ink-950 px-6 py-3 text-xs text-ink-400">
          Clique em um produto para adicionar ao carrinho · ESC para fechar
        </div>
      </div>
    </div>
  );
};