import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, FileSpreadsheet, Calendar, Trash2 } from 'lucide-react';

import { vendasService } from '../../services/vendasService';
import type { PedidoResponseDTO } from '../../types/pdv';

interface ModalOrcamentosAbertosProps {
  aberto: boolean;
  onSelecionar: (pedido: PedidoResponseDTO) => void;
  onCancelar: (pedido: PedidoResponseDTO) => Promise<void> | void;
  onFechar: () => void;
}

export const ModalOrcamentosAbertos: React.FC<ModalOrcamentosAbertosProps> = ({
  aberto,
  onSelecionar,
  onCancelar,
  onFechar,
}) => {
  const [orcamentos, setOrcamentos] = useState<PedidoResponseDTO[]>([]);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string>('');
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const inputFiltroRef = useRef<HTMLInputElement>(null);

  const carregar = () => {
    setErro(null);
    setCarregando(true);
    vendasService
      .listarOrcamentos()
      .then((lista) => setOrcamentos(lista))
      .catch((err) => {
        console.error(err);
        setErro('Erro ao carregar orçamentos. Verifique o servidor.');
      })
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    if (!aberto) return;
    setFiltro('');
    carregar();
    setTimeout(() => inputFiltroRef.current?.focus(), 100);
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

  const filtrados = useMemo(() => {
    const t = filtro.trim().toLowerCase();
    if (!t) return orcamentos;
    return orcamentos.filter((o) => {
      const numero = (o.numero ?? '').toLowerCase();
      const cliente = o.clienteId != null ? String(o.clienteId) : '';
      return numero.includes(t) || cliente.includes(t);
    });
  }, [filtro, orcamentos]);

  const formatarData = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const handleCancelar = async (
    e: React.MouseEvent,
    pedido: PedidoResponseDTO,
  ) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Cancelar o orçamento ${pedido.numero}? Essa ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    setCancelandoId(pedido.id);
    try {
      await onCancelar(pedido);
      // remove da lista local — não precisa refetch
      setOrcamentos((prev) => prev.filter((o) => o.id !== pedido.id));
    } catch (err) {
      console.error(err);
      setErro('Falha ao cancelar orçamento.');
    } finally {
      setCancelandoId(null);
    }
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-800 bg-ink-950 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-accent" />
            <h2 className="text-xl font-bold tracking-tight text-ink-100">
              Orçamentos em Aberto
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
              placeholder="Filtrar por número do orçamento ou ID do cliente..."
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
              <p className="text-sm font-medium">Carregando orçamentos...</p>
            </div>
          ) : erro ? (
            <div className="flex h-full flex-col items-center justify-center text-red-400">
              <p className="text-sm font-medium">{erro}</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-ink-500">
              <FileSpreadsheet size={56} strokeWidth={1.2} />
              <p className="mt-3 text-sm font-medium">
                {filtro
                  ? 'Nenhum orçamento encontrado para esse filtro'
                  : 'Nenhum orçamento em aberto'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-ink-800 bg-ink-950 text-xs font-bold uppercase text-ink-300">
                <tr>
                  <th className="px-6 py-2.5">Número</th>
                  <th className="w-24 px-4 py-2.5 text-center">Itens</th>
                  <th className="w-32 px-4 py-2.5 text-center">Cliente</th>
                  <th className="w-40 px-4 py-2.5 text-right">Total</th>
                  <th className="w-56 px-4 py-2.5">Criado em</th>
                  <th className="w-16 px-4 py-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {filtrados.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => {
                      if (cancelandoId === o.id) return;
                      onSelecionar(o);
                    }}
                    className="cursor-pointer transition hover:bg-accent/10"
                  >
                    <td className="px-6 py-2.5 font-mono text-sm font-semibold text-accent">
                      {o.numero}
                    </td>
                    <td className="px-4 py-2.5 text-center text-ink-200">
                      {o.itens?.length ?? 0}
                    </td>
                    <td className="px-4 py-2.5 text-center text-ink-300">
                      {o.clienteId != null ? `#${o.clienteId}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-ink-100">
                      R$ {o.valorTotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-ink-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatarData(o.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={(e) => handleCancelar(e, o)}
                        disabled={cancelandoId === o.id}
                        title="Cancelar orçamento"
                        className="text-ink-500 transition hover:text-red-400 disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-ink-800 bg-ink-950 px-6 py-3 text-xs text-ink-400">
          Clique em um orçamento para carregá-lo no caixa · <Trash2 size={12} className="inline -mt-0.5" /> cancela · ESC fecha
        </div>
      </div>
    </div>
  );
};