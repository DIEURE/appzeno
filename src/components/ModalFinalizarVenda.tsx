import React, { useEffect, useMemo, useState } from 'react';
import { X, DollarSign, AlertCircle, KeyRound, Percent } from 'lucide-react';
import type { FormaPagamento } from '../types/pdv';

const LIMITE_PERCENTUAL_DESCONTO = 5;

interface ModalFinalizarVendaProps {
  aberto: boolean;
  totalVenda: number;
  onConfirmar: (
    forma: FormaPagamento,
    valorRecebido: number,
    desconto: number,
    senhaAutorizacao?: string,
  ) => Promise<void> | void;
  onFechar: () => void;
}

const formas: { id: FormaPagamento; label: string }[] = [
  { id: 'DINHEIRO', label: 'Dinheiro' },
  { id: 'PIX', label: 'PIX' },
  { id: 'CARTAO_DEBITO', label: 'Débito' },
  { id: 'CARTAO_CREDITO', label: 'Crédito' },
  { id: 'FATURADO', label: 'Faturado' },
];

const formatarMoeda = (valor: number): string => valor.toFixed(2).replace('.', ',');

export const ModalFinalizarVenda: React.FC<ModalFinalizarVendaProps> = ({
  aberto,
  totalVenda,
  onConfirmar,
  onFechar,
}) => {
  const [forma, setForma] = useState<FormaPagamento>('DINHEIRO');
  const [valorRecebidoStr, setValorRecebidoStr] = useState<string>('');
  const [valorRecebidoEditado, setValorRecebidoEditado] = useState<boolean>(false);
  const [descontoStr, setDescontoStr] = useState<string>('');
  const [senhaAutorizacao, setSenhaAutorizacao] = useState<string>('');
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<boolean>(false);

  const parseNumero = (s: string): number => {
    const n = parseFloat(s.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const desconto = parseNumero(descontoStr);
  const valorRecebido = parseNumero(valorRecebidoStr);

  const totalComDesconto = useMemo(
    () => Math.max(totalVenda - desconto, 0),
    [totalVenda, desconto],
  );

  useEffect(() => {
    if (!aberto) return;
    setForma('DINHEIRO');
    setDescontoStr('');
    setSenhaAutorizacao('');
    setErroServidor(null);
    setEnviando(false);
    setValorRecebidoEditado(false);
    setValorRecebidoStr(formatarMoeda(totalVenda));
  }, [aberto, totalVenda]);

  const percentualDesconto = useMemo(() => {
    if (totalVenda <= 0 || desconto <= 0) return 0;
    return (desconto / totalVenda) * 100;
  }, [desconto, totalVenda]);

  const exigeSenha = percentualDesconto > LIMITE_PERCENTUAL_DESCONTO;

  const troco = forma === 'DINHEIRO' ? Math.max(valorRecebido - totalComDesconto, 0) : 0;

  const descontoInvalido = desconto < 0 || desconto > totalVenda;

  const handleDescontoChange = (valor: string) => {
    const limpo = valor.replace(/[^0-9.,]/g, '');
    setDescontoStr(limpo);
    setErroServidor(null);

    if (forma === 'DINHEIRO' && !valorRecebidoEditado) {
      const novoDesconto = parseNumero(limpo);
      const novoTotal = Math.max(totalVenda - novoDesconto, 0);
      setValorRecebidoStr(formatarMoeda(novoTotal));
    }
  };

  const handleValorRecebidoChange = (valor: string) => {
    setValorRecebidoStr(valor.replace(/[^0-9.,]/g, ''));
    setValorRecebidoEditado(true);
    setErroServidor(null);
  };

  const handleFormaChange = (novaForma: FormaPagamento) => {
    setForma(novaForma);
    setErroServidor(null);

    if (novaForma === 'DINHEIRO' && !valorRecebidoEditado) {
      setValorRecebidoStr(formatarMoeda(totalComDesconto));
    }
  };

  const handleConfirmar = async () => {
    if (descontoInvalido) {
      setErroServidor('Desconto inválido.');
      return;
    }
    if (exigeSenha && !senhaAutorizacao.trim()) {
      setErroServidor('Informe a senha do gerente para liberar o desconto.');
      return;
    }
    if (forma === 'DINHEIRO' && valorRecebido < totalComDesconto) {
      setErroServidor('Valor recebido é menor que o total a pagar.');
      return;
    }

    setEnviando(true);
    setErroServidor(null);
    try {
      await onConfirmar(forma, valorRecebido, desconto, senhaAutorizacao || undefined);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (status === 401) {
        setErroServidor(msg ?? 'Senha do gerente incorreta.');
      } else {
        setErroServidor(msg ?? 'Falha ao finalizar venda.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-ink-700 bg-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink-800 bg-ink-950 px-6 py-4">
          <h2 className="text-xl font-bold tracking-tight text-ink-100">
            Finalizar Venda
          </h2>
          <button
            type="button"
            onClick={onFechar}
            disabled={enviando}
            className="text-ink-400 transition hover:text-accent disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-lg border border-accent/35 bg-accent/10 p-4 text-center">
            <span className="text-xs font-semibold text-accent">Total da Venda</span>
            <div className="text-3xl font-black text-accent">
              R$ {totalVenda.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {formas.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFormaChange(f.id)}
                className={`rounded-lg border py-2 text-sm font-semibold transition ${
                  forma === f.id
                    ? 'border-accent bg-accent text-ink-950'
                    : 'border-ink-700 bg-ink-800 text-ink-100 hover:border-accent hover:text-accent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-300">
              Desconto (R$)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={descontoStr}
                onChange={(e) => handleDescontoChange(e.target.value)}
                placeholder="0,00"
                disabled={enviando}
                className="w-full rounded-lg border border-ink-700 bg-ink-950 py-2.5 pl-10 pr-3 text-lg font-medium text-ink-100 placeholder-ink-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
              />
              <DollarSign className="absolute left-3 top-3.5 text-ink-400" size={16} />
            </div>
            {desconto > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs">
                <Percent size={12} className={exigeSenha ? 'text-amber-400' : 'text-ink-400'} />
                <span className={exigeSenha ? 'font-semibold text-amber-400' : 'text-ink-400'}>
                  {percentualDesconto.toFixed(2)}% do total
                  {exigeSenha && ` — excede ${LIMITE_PERCENTUAL_DESCONTO}% (autorização necessária)`}
                </span>
              </div>
            )}
          </div>

          {exigeSenha && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-400">
                <AlertCircle size={16} />
                Autorização do Gerente Obrigatória
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={senhaAutorizacao}
                  onChange={(e) => {
                    setSenhaAutorizacao(e.target.value);
                    setErroServidor(null);
                  }}
                  placeholder="Senha do gerente"
                  disabled={enviando}
                  className="w-full rounded-lg border border-amber-500/40 bg-ink-950 py-2.5 pl-10 pr-3 text-lg font-medium text-ink-100 placeholder-ink-400 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
                />
                <KeyRound className="absolute left-3 top-3.5 text-amber-400" size={16} />
              </div>
            </div>
          )}

          {forma === 'DINHEIRO' && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-300">
                Valor Recebido (R$)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={valorRecebidoStr}
                  onChange={(e) => handleValorRecebidoChange(e.target.value)}
                  disabled={enviando}
                  className="w-full rounded-lg border border-ink-700 bg-ink-950 py-2.5 pl-10 pr-3 text-lg font-medium text-ink-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
                />
                <DollarSign className="absolute left-3 top-3.5 text-ink-400" size={16} />
              </div>
              <div className="mt-2 flex items-center justify-between rounded-lg bg-ink-950 px-4 py-2">
                <span className="text-sm font-semibold text-ink-300">Troco</span>
                <span className="text-lg font-bold text-accent">
                  R$ {troco.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-ink-700 bg-ink-950 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-ink-300">
                Total a Pagar
              </span>
              <span className="text-2xl font-black text-accent">
                R$ {totalComDesconto.toFixed(2)}
              </span>
            </div>
          </div>

          {erroServidor && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400">
              {erroServidor}
            </div>
          )}
        </div>

        <div className="border-t border-ink-800 bg-ink-950 px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onFechar}
              disabled={enviando}
              className="rounded-xl border border-ink-700 bg-ink-800 py-3 text-sm font-bold text-ink-100 transition hover:bg-ink-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={enviando || descontoInvalido}
              className="rounded-xl bg-accent py-3 text-base font-extrabold text-ink-950 shadow-md transition hover:bg-accent-light disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Confirmar [F4]'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};