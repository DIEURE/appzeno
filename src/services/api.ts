import axios from 'axios';
import type { Produto, PedidoRequestDTO, PedidoResponseDTO } from '../types/pdv';
 


const api = axios.create({
  baseURL: 'http://localhost:8090/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const catalogoService = {
  buscarPorCodigoBarras: async (codigo: string): Promise<Produto> => {
    const response = await api.get<Produto>(
      `/produtos/codigo-barras/${encodeURIComponent(codigo)}`
    );
    return response.data;
  },

  buscarPorDescricao: async (termo: string): Promise<Produto[]> => {
    const response = await api.get<Produto[]>(
      `/produtos/buscar?termo=${encodeURIComponent(termo)}`
    );
    return response.data;
  },
};

export const vendasService = {
  criarPedido: async (payload: PedidoRequestDTO): Promise<PedidoResponseDTO> => {
    const response = await api.post<PedidoResponseDTO>('/pedidos', payload);
    return response.data;
  },

  listarOrcamentos: async (): Promise<PedidoResponseDTO[]> => {
    const response = await api.get<PedidoResponseDTO[]>('/pedidos/orcamentos');
    return response.data;
  },

  finalizarOrcamento: async (id: number): Promise<PedidoResponseDTO> => {
    const response = await api.patch<PedidoResponseDTO>(`/pedidos/${id}/finalizar`);
    return response.data;
  },

  cancelarPedido: async (id: number): Promise<void> => {
    await api.patch(`/pedidos/${id}/cancelar`);
  },
};

export default api;