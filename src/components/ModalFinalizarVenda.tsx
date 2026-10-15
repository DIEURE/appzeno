import React, { useState, useEffect, useRef } from 'react';
import type { FormaPagamento } from '../types/pdv';

import { DollarSign, QrCode, CreditCard, FileText, CheckCircle2, X } from 'lucide-react';

interface ModalFinalizarVendaProps {
  aberto: boolean;
  totalVenda: number;
  onConfirmar: (forma: FormaPagamento, valorRecebido: number, desconto: number) => void;
  onFechar: () => void;
}

export const ModalFinalizarVenda: React.FC<ModalFinalizarVendaProps> = ({
  aberto,
  totalVenda,
  onConfirmar,
  onFechar,
}) => {
  const [forma, setForma] = useState<FormaPagamento>('DINHEIRO');
  const [desconto, setDesconto] = useState<number>(0);
  const [valorRecebido, setValorRecebido] = useState<number>(totalVenda);
  const inputRecebidoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aberto) {
      setDesconto(0);
      setValorRecebido(totalVenda);
      setTimeout(() => inputRecebidoRef.current?.focus(), 100);
    }
  }, [aberto, totalVenda]);

  if (!aberto) return null;

  const totalComDesconto = Math.max(0, totalVenda - (desconto || 0));
  const troco = Math.max(0, (valorRecebido || 0) - totalComDesconto);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forma === 'DINHEIRO' && valorRecebido < totalComDesconto) {
      alert('Valor recebido é menor que o total a pagar');
      return;
    }
    onConfirmar(forma, valorRecebido, desconto);
  };

  const opcoes = [
    { id: 'DINHEIRO', label: 'Dinheiro', icon: DollarSign },
    { id: 'PIX', label: 'PIX', icon: QrCode },
    { id: 'CARTAO_DEBITO', label: 'Débito', icon: CreditCard },
    { id: 'CARTAO_CREDITO', label: 'Crédito', icon: CreditCard },
    { id: 'FATURADO', label: 'Faturado', icon: FileText },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-800 bg-ink-950 px-6 py-4">
          <h2 className="text-xl font-bold tracking-tight text-ink-100">Finalizar Venda</h2>
          <button
            type="button"
            onClick={onFechar}
            className="text-ink-400 transition hover:text-accent"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-300">
              Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {opcoes.map((opt) => {
                const Icon = opt.icon;
                const selecionado = forma === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForma(opt.id)}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold transition-all ${
                      selecionado
                        ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/20'
                        : 'border-ink-700 bg-ink-800 text-ink-200 hover:border-ink-600 hover:bg-ink-700'
                    }`}
                  >
                    <Icon size={16} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-300">
                Desconto (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={desconto || ''}
                onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-ink-700 bg-ink-950 p-2.5 text-right font-medium text-ink-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-300">
                Total Líquido
              </label>
              <div className="rounded-lg border border-ink-700 bg-ink-950 p-2.5 text-right text-lg font-bold text-accent">
                R$ {totalComDesconto.toFixed(2)}
              </div>
            </div>
          </div>

          {forma === 'DINHEIRO' && (
            <div className="space-y-3 rounded-lg border border-ink-700 bg-ink-950 p-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-300">
                  Valor Recebido (R$)
                </label>
                <input
                  ref={inputRecebidoRef}
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorRecebido || ''}
                  onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-ink-700 bg-ink-900 p-2 text-right text-xl font-bold text-ink-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="flex items-center justify-between border-t border-ink-800 pt-2">
                <span className="text-sm font-semibold text-ink-300">Troco:</span>
                <span className="text-2xl font-black text-accent">
                  R$ {troco.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="w-1/3 rounded-lg border border-ink-700 py-3 text-sm font-semibold text-ink-200 transition hover:bg-ink-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex w-2/3 items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-bold text-ink-950 shadow-md transition hover:bg-accent-light"
            >
              <CheckCircle2 size={18} />
              Confirmar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};