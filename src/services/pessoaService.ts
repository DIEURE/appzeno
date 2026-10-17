import api from "./api";
import type { Pessoa, PessoaRequest, TipoPessoa } from "../types/cliente";

export const pessoaService = {
  listar: async (): Promise<Pessoa[]> => {
    const response = await api.get<Pessoa[]>("/pessoas");
    return response.data;
  },

  listarPorTipo: async (tipo: TipoPessoa): Promise<Pessoa[]> => {
    const response = await api.get<Pessoa[]>("/pessoas", {
      params: { tipo },
    });
    return response.data;
  },

  buscarPorId: async (id: number): Promise<Pessoa> => {
    const response = await api.get<Pessoa>(`/pessoas/${id}`);
    return response.data;
  },

  buscar: async (termo: string): Promise<Pessoa[]> => {
    const response = await api.get<Pessoa[]>("/pessoas/buscar", {
      params: { termo },
    });
    return response.data;
  },

  criar: async (dados: PessoaRequest): Promise<Pessoa> => {
    const response = await api.post<Pessoa>("/pessoas", dados);
    return response.data;
  },

  atualizar: async (id: number, dados: PessoaRequest): Promise<Pessoa> => {
    const response = await api.put<Pessoa>(`/pessoas/${id}`, dados);
    return response.data;
  },

  inativar: async (id: number): Promise<void> => {
    await api.delete(`/pessoas/${id}`);
  },
};