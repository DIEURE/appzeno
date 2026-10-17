import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  FolderTree,
  BarChart3,
  Wallet,
  FileText,
  Settings,
  Users,
  Package,
  Building2,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import logoDx14 from "../assets/logo-dx14.png";

interface ItemMenu {
  rotulo: string;
  icone: React.ReactNode;
  para?: string;
  desabilitado?: boolean;
  filhos?: ItemMenu[];
}

const MENU: ItemMenu[] = [
  {
    rotulo: "Dashboard",
    icone: <LayoutDashboard size={18} />,
    desabilitado: true,
  },
  {
    rotulo: "PDV",
    icone: <ShoppingCart size={18} />,
    para: "/pdv",
  },
  {
    rotulo: "Cadastros",
    icone: <FolderTree size={18} />,
    filhos: [
      {
        rotulo: "Pessoas",
        icone: <Users size={16} />,
        para: "/retaguarda/pessoas",
      },
      {
        rotulo: "Produtos",
        icone: <Package size={16} />,
        desabilitado: true,
      },
      {
        rotulo: "Empresas",
        icone: <Building2 size={16} />,
        desabilitado: true,
      },
    ],
  },
  {
    rotulo: "Relatórios",
    icone: <BarChart3 size={18} />,
    filhos: [
      {
        rotulo: "Vendas",
        icone: <FileText size={16} />,
        desabilitado: true,
      },
    ],
  },
  {
    rotulo: "Financeiro",
    icone: <Wallet size={18} />,
    desabilitado: true,
  },
  {
    rotulo: "Fiscal / NF",
    icone: <FileText size={18} />,
    desabilitado: true,
  },
  {
    rotulo: "Configurações",
    icone: <Settings size={18} />,
    desabilitado: true,
  },
];

export const RetaguardaLayout: React.FC = () => {
  const [abertos, setAbertos] = useState<Record<string, boolean>>({
    Cadastros: true,
    Relatórios: true,
  });

  const alternar = (rotulo: string) => {
    setAbertos((prev) => ({ ...prev, [rotulo]: !prev[rotulo] }));
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-brand-dark text-ink-100">
      <header className="flex h-16 items-center justify-between border-b border-white/10 bg-brand-dark px-6 shadow-md">
        <div className="flex items-center gap-4">
          <img
            src={logoDx14}
            alt="DX14 Soluções Inteligentes"
            className="h-10 w-auto"
            draggable={false}
          />
          <div className="h-8 w-px bg-white/15" />
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-cyan/15 px-2 py-1 text-xs font-black tracking-wider text-brand-cyan ring-1 ring-inset ring-brand-cyan/40">
              RETAGUARDA
            </span>
            <h1 className="text-base font-semibold tracking-tight text-ink-100">
              DX14 Soluções Inteligentes
            </h1>
          </div>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-ink-200 transition hover:border-brand-cyan/60 hover:text-brand-cyan"
        >
          <LogOut size={14} />
          Trocar ambiente
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="flex w-64 flex-col overflow-y-auto border-r border-white/10 bg-brand-dark">
          <nav className="flex-1 p-3">
            {MENU.map((item) => {
              const temFilhos = item.filhos && item.filhos.length > 0;
              const grupoAberto = abertos[item.rotulo] ?? false;

              if (temFilhos) {
                return (
                  <div key={item.rotulo} className="mb-1">
                    <button
                      type="button"
                      onClick={() => alternar(item.rotulo)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-ink-200 transition hover:bg-white/5"
                    >
                      <span className="flex items-center gap-3">
                        {item.icone}
                        {item.rotulo}
                      </span>
                      {grupoAberto ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {grupoAberto && (
                      <div className="mt-1 ml-4 border-l border-white/10 pl-2">
                        {item.filhos!.map((filho) => (
                          <ItemFilho key={filho.rotulo} item={filho} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={item.rotulo} className="mb-1">
                  <ItemFolha item={item} />
                </div>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-3">
            <Link
              to="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink-400 transition hover:bg-white/5 hover:text-brand-cyan"
            >
              <LogOut size={16} />
              Tela inicial
            </Link>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-brand-dark p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const ItemFilho: React.FC<{ item: ItemMenu }> = ({ item }) => {
  if (item.desabilitado) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-600">
        {item.icone}
        {item.rotulo}
      </div>
    );
  }

  return (
    <NavLink
      to={item.para!}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-brand-cyan/15 text-brand-cyan ring-1 ring-inset ring-brand-cyan/40"
            : "text-ink-300 hover:bg-white/5 hover:text-ink-100"
        }`
      }
    >
      {item.icone}
      {item.rotulo}
    </NavLink>
  );
};

const ItemFolha: React.FC<{ item: ItemMenu }> = ({ item }) => {
  if (item.desabilitado) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-600">
        {item.icone}
        {item.rotulo}
      </div>
    );
  }

  return (
    <NavLink
      to={item.para!}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-brand-cyan/15 text-brand-cyan ring-1 ring-inset ring-brand-cyan/40"
            : "text-ink-200 hover:bg-white/5 hover:text-ink-50"
        }`
      }
    >
      {item.icone}
      {item.rotulo}
    </NavLink>
  );
};