import api from './api';
import type {
  PedidoRequestDTO,
  PedidoResponseDTO,
  FinalizacaoRequestDTO,
} from '../types/pdv';

export const vendasService = {
  criarPedido: async (payload: PedidoRequestDTO): Promise<PedidoResponseDTO> => {
    const response = await api.post<PedidoResponseDTO>('/pedidos', payload);
    return response.data;
  },

  buscarPedidoPorId: async (id: number): Promise<PedidoResponseDTO> => {
    const response = await api.get<PedidoResponseDTO>(`/pedidos/${id}`);
    return response.data;
  },

  listarOrcamentos: async (): Promise<PedidoResponseDTO[]> => {
    const response = await api.get<PedidoResponseDTO[]>('/pedidos/orcamentos');
    return response.data;
  },

  finalizarOrcamento: async (
    id: number,
    payload: FinalizacaoRequestDTO,
  ): Promise<PedidoResponseDTO> => {
    const response = await api.patch<PedidoResponseDTO>(
      `/pedidos/${id}/finalizar`,
      payload,
    );
    return response.data;
  },

  cancelarPedido: async (id: number): Promise<void> => {
    await api.patch(`/pedidos/${id}/cancelar`);
  },
};