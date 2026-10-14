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
  itens: ItemPedidoRequest[];
}

export interface ItemPedidoResponse {
  produtoId: number;
  descricaoProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface PedidoResponseDTO {
  id: number;
  numero: string;
  clienteId?: number;
  status: StatusPedido;
  formaPagamento: FormaPagamento;
  valorTotal: number;
  valorDesconto: number;
  createdAt: string;
  finalizadoAt?: string;
  itens: ItemPedidoResponse[];
}