import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { pessoaService } from "../../../services/pessoaService";
import type { PessoaRequest, TipoPessoa } from "../../../types/cliente";

const VAZIO: PessoaRequest = {
  tipo: "FISICA",
  nome: "",
  nomeFantasia: "",
  documento: "",
  inscricaoEstadual: "",
  rg: "",
  dataNascimento: "",
  telefone: "",
  email: "",
  endereco: "",
  cidade: "",
  uf: "",
  cep: "",
  ativo: true,
};

export const PessoaFormScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const editando = Boolean(id);

  const [form, setForm] = useState<PessoaRequest>(VAZIO);
  const [carregando, setCarregando] = useState(editando);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setCarregando(true);
    pessoaService
      .buscarPorId(Number(id))
      .then((p) => {
        setForm({
          tipo: p.tipo,
          nome: p.nome,
          nomeFantasia: p.nomeFantasia ?? "",
          documento: p.documento,
          inscricaoEstadual: p.inscricaoEstadual ?? "",
          rg: p.rg ?? "",
          dataNascimento: p.dataNascimento ?? "",
          telefone: p.telefone ?? "",
          email: p.email ?? "",
          endereco: p.endereco ?? "",
          cidade: p.cidade ?? "",
          uf: p.uf ?? "",
          cep: p.cep ?? "",
          ativo: p.ativo,
        });
      })
      .catch((e) => {
        console.error(e);
        setErro("Não foi possível carregar a pessoa.");
      })
      .finally(() => setCarregando(false));
  }, [id]);

  const atualizar = (campo: keyof PessoaRequest, valor: unknown) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim() || !form.documento.trim()) {
      setErro("Nome e documento são obrigatórios.");
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const payload: PessoaRequest = {
        ...form,
        nomeFantasia: form.tipo === "JURIDICA" ? form.nomeFantasia : null,
        inscricaoEstadual:
          form.tipo === "JURIDICA" ? form.inscricaoEstadual : null,
        rg: form.tipo === "FISICA" ? form.rg : null,
        dataNascimento:
          form.tipo === "FISICA" ? form.dataNascimento : null,
      };

      if (editando && id) {
        await pessoaService.atualizar(Number(id), payload);
      } else {
        await pessoaService.criar(payload);
      }
      navigate("/retaguarda/pessoas");
    } catch (e) {
      console.error(e);
      setErro("Erro ao salvar. Verifique os dados e tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan";
  const labelCls =
    "mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-400";

  if (carregando) {
    return (
      <div className="mx-auto max-w-3xl p-12 text-center text-sm text-ink-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/retaguarda/pessoas")}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-ink-300 transition hover:border-brand-cyan/60 hover:text-brand-cyan"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-50">
            {editando ? "Editar pessoa" : "Nova pessoa"}
          </h1>
          <p className="mt-0.5 text-sm text-ink-400">
            {editando
              ? "Atualize os dados abaixo"
              : "Preencha os dados para cadastrar"}
          </p>
        </div>
      </div>

      {erro && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-500">
            Dados gerais
          </h2>

          <div className="mb-4 flex overflow-hidden rounded-lg border border-white/10">
            {(["FISICA", "JURIDICA"] as TipoPessoa[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => atualizar("tipo", t)}
                className={`flex-1 px-4 py-2 text-sm font-semibold transition ${
                  form.tipo === t
                    ? "bg-brand-cyan/15 text-brand-cyan ring-1 ring-inset ring-brand-cyan/40"
                    : "bg-white/5 text-ink-300 hover:bg-white/10 hover:text-ink-100"
                }`}
              >
                {t === "FISICA" ? "Pessoa Física" : "Pessoa Jurídica"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelCls}>
                {form.tipo === "FISICA" ? "Nome completo" : "Razão social"}{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => atualizar("nome", e.target.value)}
                className={inputCls}
                required
              />
            </div>

            {form.tipo === "JURIDICA" && (
              <div className="md:col-span-2">
                <label className={labelCls}>Nome fantasia</label>
                <input
                  type="text"
                  value={form.nomeFantasia ?? ""}
                  onChange={(e) => atualizar("nomeFantasia", e.target.value)}
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <label className={labelCls}>
                {form.tipo === "FISICA" ? "CPF" : "CNPJ"}{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.documento}
                onChange={(e) => atualizar("documento", e.target.value)}
                className={inputCls}
                required
              />
            </div>

            {form.tipo === "FISICA" ? (
              <>
                <div>
                  <label className={labelCls}>RG</label>
                  <input
                    type="text"
                    value={form.rg ?? ""}
                    onChange={(e) => atualizar("rg", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Data de nascimento</label>
                  <input
                    type="date"
                    value={form.dataNascimento ?? ""}
                    onChange={(e) =>
                      atualizar("dataNascimento", e.target.value)
                    }
                    className={inputCls}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className={labelCls}>Inscrição estadual</label>
                <input
                  type="text"
                  value={form.inscricaoEstadual ?? ""}
                  onChange={(e) =>
                    atualizar("inscricaoEstadual", e.target.value)
                  }
                  className={inputCls}
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                id="ativo"
                type="checkbox"
                checked={form.ativo}
                onChange={(e) => atualizar("ativo", e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-brand-cyan focus:ring-brand-cyan"
              />
              <label htmlFor="ativo" className="text-sm text-ink-200">
                Cadastro ativo
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-500">
            Contato
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Telefone</label>
              <input
                type="text"
                value={form.telefone ?? ""}
                onChange={(e) => atualizar("telefone", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>E-mail</label>
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => atualizar("email", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-ink-500">
            Endereço
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            <div className="md:col-span-4">
              <label className={labelCls}>Endereço</label>
              <input
                type="text"
                value={form.endereco ?? ""}
                onChange={(e) => atualizar("endereco", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>CEP</label>
              <input
                type="text"
                value={form.cep ?? ""}
                onChange={(e) => atualizar("cep", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="md:col-span-4">
              <label className={labelCls}>Cidade</label>
              <input
                type="text"
                value={form.cidade ?? ""}
                onChange={(e) => atualizar("cidade", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>UF</label>
              <input
                type="text"
                maxLength={2}
                value={form.uf ?? ""}
                onChange={(e) =>
                  atualizar("uf", e.target.value.toUpperCase())
                }
                className={inputCls}
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/retaguarda/pessoas")}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-ink-300 transition hover:border-white/20 hover:text-ink-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="flex items-center gap-2 rounded-lg bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-ink-950 shadow-md transition hover:brightness-110 disabled:opacity-50"
          >
            <Save size={16} />
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
};