export type TipoPessoa = "FISICA" | "JURIDICA";

export interface Pessoa {
  id: number;
  tipo: TipoPessoa;
  nome: string;
  nomeFantasia?: string | null;
  documento: string;
  inscricaoEstadual?: string | null;
  rg?: string | null;
  dataNascimento?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PessoaRequest {
  tipo: TipoPessoa;
  nome: string;
  nomeFantasia?: string | null;
  documento: string;
  inscricaoEstadual?: string | null;
  rg?: string | null;
  dataNascimento?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  ativo: boolean;
}