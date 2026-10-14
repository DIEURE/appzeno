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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-4 text-white">
          <h2 className="text-xl font-bold tracking-tight">Finalizar Venda</h2>
          <button
            type="button"
            onClick={onFechar}
            className="text-slate-400 transition hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-500">
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
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
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
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Desconto (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={desconto || ''}
                onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-right font-medium focus:border-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Total Líquido
              </label>
              <div className="rounded-lg bg-slate-100 p-2.5 text-right text-lg font-bold text-slate-900">
                R$ {totalComDesconto.toFixed(2)}
              </div>
            </div>
          </div>

          {forma === 'DINHEIRO' && (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Valor Recebido (R$)
                </label>
                <input
                  ref={inputRecebidoRef}
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorRecebido || ''}
                  onChange={(e) => setValorRecebido(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-right text-xl font-bold text-slate-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-sm font-semibold text-slate-600">Troco:</span>
                <span className="text-2xl font-black text-emerald-600">
                  R$ {troco.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="w-1/3 rounded-lg border border-slate-300 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex w-2/3 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700"
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