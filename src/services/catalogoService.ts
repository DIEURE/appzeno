import api from './api';
import type { Produto } from '../types/pdv';

export const catalogoService = {
  listarProdutos: async (): Promise<Produto[]> => {
    const response = await api.get<Produto[]>('/produtos');
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Produto> => {
    const response = await api.get<Produto>(`/produtos/${id}`);
    return response.data;
  },

  buscarPorCodigoBarras: async (codigo: string): Promise<Produto | null> => {
    try {
      const response = await api.get<Produto>(
        `/produtos/codigo-barras/${encodeURIComponent(codigo)}`
      );
      return response.data;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  buscarPorDescricao: async (termo: string): Promise<Produto[]> => {
    const response = await api.get<Produto[]>(
      `/produtos/buscar?termo=${encodeURIComponent(termo)}`
    );
    return response.data;
  },
};