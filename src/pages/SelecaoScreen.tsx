import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Settings2, ChevronRight } from "lucide-react";
import logoDx14 from "../assets/logo-dx14.png";

type Ambiente = "pdv" | "retaguarda";

export const SelecaoScreen: React.FC = () => {
  const navigate = useNavigate();
  const [foco, setFoco] = useState<Ambiente>("pdv");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tecla = e.key.toLowerCase();

      if (tecla === "p") {
        e.preventDefault();
        navigate("/pdv");
        return;
      }

      if (tecla === "r") {
        e.preventDefault();
        navigate("/retaguarda");
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setFoco("pdv");
        return;
      }

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setFoco("retaguarda");
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        navigate(foco === "pdv" ? "/pdv" : "/retaguarda");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [foco, navigate]);

   return (
    <div className="flex h-screen w-screen select-none flex-col items-center justify-center bg-ink-800 p-8">
      <img
        src={logoDx14}
        alt="DX14 Soluções Inteligentes"
        className="mb-12 h-16 w-auto"
        draggable={false}
      />

      <h1 className="mb-2 text-2xl font-bold tracking-tight text-ink-100">
        Selecione o ambiente
      </h1>
      <p className="mb-10 text-sm text-ink-300">
        Use as setas para navegar,{" "}
        <kbd className="rounded border border-ink-600 bg-ink-900 px-1.5 py-0.5 text-xs font-semibold text-ink-100">
          Enter
        </kbd>{" "}
        para entrar, ou as teclas{" "}
        <kbd className="rounded border border-ink-600 bg-ink-900 px-1.5 py-0.5 text-xs font-semibold text-ink-100">
          P
        </kbd>{" "}
        e{" "}
        <kbd className="rounded border border-ink-600 bg-ink-900 px-1.5 py-0.5 text-xs font-semibold text-ink-100">
          R
        </kbd>
        .
      </p>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/pdv")}
          onMouseEnter={() => setFoco("pdv")}
          className={`group flex h-64 flex-col items-start justify-between rounded-2xl border-2 p-8 text-left shadow-lg transition ${
            foco === "pdv"
              ? "border-accent bg-ink-900 shadow-2xl ring-2 ring-accent/50"
              : "border-ink-600 bg-ink-900 hover:border-accent/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2 text-ink-950">
              <ShoppingCart size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              Operação
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-black tracking-tight text-ink-50">
              PDV
            </h2>
            <p className="mt-1 text-sm text-ink-300">
              Balcão &amp; Caixa — frente de venda
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-accent">
            Entrar no caixa <ChevronRight size={16} />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("/retaguarda")}
          onMouseEnter={() => setFoco("retaguarda")}
          className={`group flex h-64 flex-col items-start justify-between rounded-2xl border-2 p-8 text-left shadow-lg transition ${
            foco === "retaguarda"
              ? "border-white bg-white shadow-2xl ring-2 ring-ink-400"
              : "border-ink-600 bg-white hover:border-ink-400"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-zinc-900 p-2 text-white">
              <Settings2 size={24} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Administração
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-black tracking-tight text-zinc-900">
              Retaguarda
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Cadastros, relatórios e configurações
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
            Acessar gestão <ChevronRight size={16} />
          </div>
        </button>
      </div>
    </div>
  );

};