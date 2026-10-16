export interface Produto {
  id: number;
  codigoBarras: string;
  descricao: string;
  unidade: string;
  precoCusto: number;
  precoVenda: number;
  estoqueSaldo: number;
  ativo: boolean;
}

export type FormaPagamento =
  | 'DINHEIRO'
  | 'PIX'
  | 'CARTAO_DEBITO'
  | 'CARTAO_CREDITO'
  | 'FATURADO';

export type StatusPedido = 'ORCAMENTO' | 'FINALIZADO' | 'CANCELADO';

export interface ItemCarrinho {
  produtoId: number;
  descricao: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface ItemPedidoRequest {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
}

export interface PedidoRequestDTO {
  clienteId?: number | null;
  status: StatusPedido;
  formaPagamento: FormaPagamento;
  valorDesconto: number;
  senhaAutorizacao?: string;
  itens: ItemPedidoRequest[];
}

export interface FinalizacaoRequestDTO {
  valorDesconto: number;
  senhaAutorizacao?: string;
}

export interface ItemPedidoResponse {
  produtoId: number;
  descricaoProduto: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface PedidoResponseDTO {
  id: number;
  numero: string;
  numeroOrcamento?: string | null;
  numeroVenda?: string | null;
  numeroOrcamentoOrigem?: string | null;
  clienteId?: number;
  status: StatusPedido;
  formaPagamento: FormaPagamento;
  valorTotal: number;
  valorDesconto: number;
  descontoAutorizadoPor?: string | null;
  descontoAutorizadoEm?: string | null;
  createdAt: string;
  finalizadoAt?: string | null;
  itens: ItemPedidoResponse[];
}