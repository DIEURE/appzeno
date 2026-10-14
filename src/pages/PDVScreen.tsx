import React, { useState, useEffect, useRef } from 'react';
import {
  Barcode,
  Search,
  Trash2,
  ShoppingCart,
  FileSpreadsheet,
  CheckCircle,
  RotateCcw,
  Package,
} from 'lucide-react';

import type { ItemCarrinho, Produto, FormaPagamento } from '../types/pdv';

import { catalogoService, vendasService } from '../services/api';
import { ModalFinalizarVenda } from '../components/ModalFinalizarVenda';

export const PDVScreen: React.FC = () => {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>('1');
  const [mensagemStatus, setMensagemStatus] = useState<string>('Pronto para venda');
  const [ultimoItem, setUltimoItem] = useState<Produto | null>(null);
  const [modalAberto, setModalAberto] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const inputBuscaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputBuscaRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F4') {
        e.preventDefault();
        if (carrinho.length > 0) setModalAberto(true);
      } else if (e.key === 'F2') {
        e.preventDefault();
        salvarComoOrcamento();
      } else if (e.key === 'F8') {
        e.preventDefault();
        limparVenda();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carrinho]);

  const totalGeral = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  const parseQuantidade = (valor: string): number => {
    const n = parseFloat(valor.replace(',', '.'));
    return Number.isFinite(n) && n > 0 ? n : 1;
  };

  const adicionarAoCarrinho = (produto: Produto, qtd: number) => {
    setCarrinho((prev) => {
      const index = prev.findIndex((i) => i.produtoId === produto.id);
      if (index >= 0) {
        const novo = [...prev];
        const novaQtd = novo[index].quantidade + qtd;
        novo[index] = {
          ...novo[index],
          quantidade: novaQtd,
          subtotal: novaQtd * novo[index].precoUnitario,
        };
        return novo;
      }

      const novoItem: ItemCarrinho = {
        produtoId: produto.id,
        descricao: produto.descricao,
        unidade: produto.unidade,
        quantidade: qtd,
        precoUnitario: produto.precoVenda,
        subtotal: qtd * produto.precoVenda,
      };
      return [...prev, novoItem];
    });
  };

  const processarBusca = async (e: React.FormEvent) => {
    e.preventDefault();
    const termo = busca.trim();
    if (!termo) return;

    const qtd = parseQuantidade(quantidade);

    setLoading(true);
    try {
      let produto: Produto | null = null;

      try {
        produto = await catalogoService.buscarPorCodigoBarras(termo);
      } catch {
        const resultados = await catalogoService.buscarPorDescricao(termo);
        if (resultados.length > 0) {
          produto = resultados[0];
        }
      }

      if (produto) {
        adicionarAoCarrinho(produto, qtd);
        setUltimoItem(produto);
        setMensagemStatus(`Adicionado: ${produto.descricao}`);
        setBusca('');
        setQuantidade('1');
      } else {
        setMensagemStatus(`Produto "${termo}" não localizado`);
      }
    } catch (err) {
      console.error(err);
      setMensagemStatus('Erro ao consultar produto no servidor');
    } finally {
      setLoading(false);
      inputBuscaRef.current?.focus();
    }
  };

  const removerItem = (index: number) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index));
    inputBuscaRef.current?.focus();
  };

  const limparVenda = () => {
    if (carrinho.length === 0 || window.confirm('Deseja limpar todos os itens da venda?')) {
      setCarrinho([]);
      setUltimoItem(null);
      setMensagemStatus('Caixa livre');
      inputBuscaRef.current?.focus();
    }
  };

  const salvarComoOrcamento = async () => {
    if (carrinho.length === 0) {
      alert('Adicione itens antes de gerar o orçamento.');
      return;
    }

    setLoading(true);
    try {
      const pedido = await vendasService.criarPedido({
        status: 'ORCAMENTO',
        formaPagamento: 'DINHEIRO',
        valorDesconto: 0,
        itens: carrinho.map((i) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
        })),
      });

      alert(`Orçamento gerado com sucesso! Número: ${pedido.numero}`);
      setCarrinho([]);
      setUltimoItem(null);
      setMensagemStatus(`Orçamento ${pedido.numero} salvo`);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar orçamento.');
    } finally {
      setLoading(false);
      inputBuscaRef.current?.focus();
    }
  };

  const confirmarFinalizacao = async (
    forma: FormaPagamento,
    _valorRecebido: number,
    desconto: number
  ) => {
    setLoading(true);
    try {
      const pedido = await vendasService.criarPedido({
        status: 'FINALIZADO',
        formaPagamento: forma,
        valorDesconto: desconto,
        itens: carrinho.map((i) => ({
          produtoId: i.produtoId,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
        })),
      });

      setModalAberto(false);
      alert(`Venda finalizada com sucesso! Pedido ${pedido.numero}`);
      setCarrinho([]);
      setUltimoItem(null);
      setMensagemStatus(`Venda ${pedido.numero} concluída`);
    } catch (err) {
      console.error(err);
      alert('Falha ao concluir venda no servidor.');
    } finally {
      setLoading(false);
      inputBuscaRef.current?.focus();
    }
  };

  return (
    <div className="flex h-screen w-screen select-none flex-col bg-slate-100 font-sans text-slate-800">
      <header className="flex h-14 items-center justify-between bg-slate-900 px-6 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded bg-emerald-600 p-1.5 text-xs font-black tracking-wider">
            PDV
          </div>
          <h1 className="text-lg font-bold tracking-tight">FERRAGISTA 2 IRMÃOS - BALCÃO & CAIXA</h1>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-300">
          <div>
            <span className="font-bold text-white">[F2]</span> ORÇAMENTO
          </div>
          <div>
            <span className="font-bold text-white">[F4]</span> FINALIZAR
          </div>
          <div>
            <span className="font-bold text-white">[F8]</span> LIMPAR
          </div>
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 font-semibold text-emerald-400">
            ONLINE
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        <div className="flex w-5/12 flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <form onSubmit={processarBusca} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Qtd
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={quantidade}
                    onChange={(e) =>
                      setQuantidade(
                        e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.')
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-center text-lg font-bold text-slate-900 focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div className="col-span-3">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Código de Barras ou Descrição
                  </label>
                  <div className="relative">
                    <input
                      ref={inputBuscaRef}
                      type="text"
                      placeholder="Passe o leitor ou digite o nome..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          processarBusca(e as unknown as React.FormEvent);
                        }
                      }}
                      className="w-full rounded-lg border border-slate-300 p-2.5 pl-10 text-lg font-medium text-slate-900 focus:border-slate-800 focus:outline-none"
                    />
                    <Barcode className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>
              </div>
              <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
            </form>
          </div>

          <div className="flex flex-1 flex-col justify-between rounded-xl border border-slate-200 bg-white p-5">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Package size={16} /> Último Produto Bipado
              </div>
              {ultimoItem ? (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold leading-snug text-slate-800">
                    {ultimoItem.descricao}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                    <div>
                      Unidade:{' '}
                      <span className="font-semibold text-slate-900">{ultimoItem.unidade}</span>
                    </div>
                    <div>
                      Estoque:{' '}
                      <span className="font-semibold text-slate-900">
                        {ultimoItem.estoqueSaldo}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
                    <span className="text-xs font-semibold text-emerald-800">
                      Preço Unitário
                    </span>
                    <div className="text-3xl font-black text-emerald-700">
                      R$ {ultimoItem.precoVenda.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <Search size={48} strokeWidth={1.5} />
                  <p className="mt-2 text-sm">Aguardando leitura de item</p>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-slate-800 px-4 py-2 text-center text-xs font-semibold text-slate-200">
              {mensagemStatus}
            </div>
          </div>
        </div>

        <div className="flex w-7/12 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <ShoppingCart size={18} />
              <span>Itens da Venda ({carrinho.length})</span>
            </div>
            <button
              onClick={limparVenda}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 transition hover:text-rose-800"
            >
              <RotateCcw size={14} /> Cancelar [F8]
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {carrinho.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-300">
                <ShoppingCart size={56} strokeWidth={1.2} />
                <p className="mt-3 text-sm font-medium">
                  Nenhum item adicionado ao carrinho
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-100 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="w-12 px-4 py-2.5 text-center">#</th>
                    <th className="px-4 py-2.5">Descrição</th>
                    <th className="w-24 px-4 py-2.5 text-center">Qtd / UN</th>
                    <th className="w-28 px-4 py-2.5 text-right">Unitário</th>
                    <th className="w-32 px-4 py-2.5 text-right">Total</th>
                    <th className="w-12 px-4 py-2.5 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {carrinho.map((item, idx) => (
                    <tr key={idx} className="transition hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">
                        {item.descricao}
                      </td>
                      <td className="px-4 py-2.5 text-center font-medium text-slate-700">
                        {item.quantidade} {item.unidade}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-600">
                        R$ {item.precoUnitario.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                        R$ {item.subtotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removerItem(idx)}
                          className="text-slate-300 transition hover:text-rose-600"
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

          <div className="border-t border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Total a Pagar
              </span>
              <div className="text-4xl font-black text-slate-900">
                R$ {totalGeral.toFixed(2)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={salvarComoOrcamento}
                disabled={carrinho.length === 0 || loading}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                <FileSpreadsheet size={18} />
                Gerar Orçamento [F2]
              </button>
              <button
                type="button"
                onClick={() => setModalAberto(true)}
                disabled={carrinho.length === 0 || loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-base font-extrabold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle size={20} />
                Finalizar Venda [F4]
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModalFinalizarVenda
        aberto={modalAberto}
        totalVenda={totalGeral}
        onConfirmar={confirmarFinalizacao}
        onFechar={() => {
          setModalAberto(false);
          inputBuscaRef.current?.focus();
        }}
      />
    </div>
  );
};