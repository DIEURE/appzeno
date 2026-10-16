import api from './api';
import type { Pessoa, TipoPessoa } from '../types/cliente';

export const pessoaService = {
  listar: async (): Promise<Pessoa[]> => {
    const response = await api.get<Pessoa[]>('/pessoas');
    return response.data;
  },

  listarPorTipo: async (tipo: TipoPessoa): Promise<Pessoa[]> => {
    const response = await api.get<Pessoa[]>('/pessoas', {
      params: { tipo },
    });
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Pessoa> => {
    const response = await api.get<Pessoa>(`/pessoas/${id}`);
    return response.data;
  },

  buscar: async (termo: string): Promise<Pessoa[]> => {
    const response = await api.get<Pessoa[]>('/pessoas/buscar', {
      params: { termo },
    });
    return response.data;
  },
};