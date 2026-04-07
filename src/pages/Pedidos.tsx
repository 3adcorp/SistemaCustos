import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Pedido, StatusPedido } from '../types';

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarTelefone(tel: string): string {
  if (tel.length === 13) {
    return `+${tel.slice(0, 2)} (${tel.slice(2, 4)}) ${tel.slice(4, 9)}-${tel.slice(9)}`;
  }
  return tel;
}

function formatarHora(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const STATUS_CONFIG: Record<StatusPedido, { label: string; bg: string; text: string }> = {
  pendente: { label: 'Pendente', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  aprovado: { label: 'Aprovado', bg: 'bg-green-100', text: 'text-green-800' },
  recusado: { label: 'Recusado', bg: 'bg-red-100', text: 'text-red-800' },
};

type FiltroStatus = 'todos' | StatusPedido;

export default function Pedidos() {
  const userId = useStore((s) => s.userId);
  const pedidos = useStore((s) => s.pedidos);
  const loading = useStore((s) => s.loading);
  const subscribePedidos = useStore((s) => s.subscribePedidos);
  const aprovarPedido = useStore((s) => s.aprovarPedido);
  const recusarPedido = useStore((s) => s.recusarPedido);

  const [filtro, setFiltro] = useState<FiltroStatus>('todos');
  const [recusandoId, setRecusandoId] = useState<string | null>(null);
  const [motivoRecusa, setMotivoRecusa] = useState('');
  const [imagemModal, setImagemModal] = useState<string | null>(null);
  const [processando, setProcessando] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribePedidos();
    return () => unsubscribe();
  }, [userId]);

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter((p) => p.status === filtro);

  const contadores = {
    todos: pedidos.length,
    pendente: pedidos.filter((p) => p.status === 'pendente').length,
    aprovado: pedidos.filter((p) => p.status === 'aprovado').length,
    recusado: pedidos.filter((p) => p.status === 'recusado').length,
  };

  const handleAprovar = async (pedido: Pedido) => {
    setProcessando(pedido.id);
    await aprovarPedido(pedido.id, pedido.telefone);
    setProcessando(null);
  };

  const handleRecusar = async (pedido: Pedido) => {
    if (!motivoRecusa.trim()) return;
    setProcessando(pedido.id);
    await recusarPedido(pedido.id, pedido.telefone, motivoRecusa.trim());
    setProcessando(null);
    setRecusandoId(null);
    setMotivoRecusa('');
  };

  const filtros: { key: FiltroStatus; label: string; cor: string }[] = [
    { key: 'todos', label: 'Todos', cor: 'rose' },
    { key: 'pendente', label: 'Pendentes', cor: 'yellow' },
    { key: 'aprovado', label: 'Aprovados', cor: 'green' },
    { key: 'recusado', label: 'Recusados', cor: 'red' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Pedidos do Dia
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          {' '}&middot; {contadores.pendente} pendente(s)
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {filtros.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`flex-shrink-0 px-4 py-2 min-h-[40px] rounded-xl text-sm font-semibold transition-all duration-200 ${
              filtro === f.key
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200/50'
                : 'bg-white/80 border border-rose-200 text-gray-600 hover:bg-rose-50'
            }`}
          >
            {f.label} ({contadores[f.key]})
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      {loading && pedidos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-rose-100 shadow-sm">
          <span className="text-4xl">📋</span>
          <p className="text-gray-500 mt-3">Nenhum pedido {filtro !== 'todos' ? STATUS_CONFIG[filtro as StatusPedido].label.toLowerCase() : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidosFiltrados.map((pedido) => {
            const config = STATUS_CONFIG[pedido.status];
            const estaProcessando = processando === pedido.id;

            return (
              <div
                key={pedido.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl border border-rose-100 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
              >
                <div className="p-4">
                  {/* Cabecalho do pedido */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(pedido.nomeCliente || pedido.whatsappNome || '?')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {pedido.nomeCliente || pedido.whatsappNome}
                        </h3>
                        <p className="text-xs text-gray-400">{formatarTelefone(pedido.telefone)} &middot; {formatarHora(pedido.criadoEm)}</p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 ${config.bg} ${config.text} text-xs font-bold px-3 py-1 rounded-full`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Detalhes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Bolo</p>
                      <p className="text-sm font-medium text-gray-800">{pedido.bolo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Qtd</p>
                      <p className="text-sm font-medium text-gray-800">{pedido.quantidade}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Preco Unit.</p>
                      <p className="text-sm font-medium text-gray-800">{formatarMoeda(pedido.preco)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Total</p>
                      <p className="text-sm font-bold text-emerald-700">{formatarMoeda(pedido.total)}</p>
                    </div>
                  </div>

                  {/* Endereco */}
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Endereco</p>
                    <p className="text-sm text-gray-700">{pedido.endereco || 'Nao informado'}</p>
                  </div>

                  {/* Comprovante */}
                  {pedido.comprovanteUrl && (
                    <div className="mb-3">
                      <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Comprovante PIX</p>
                      <button
                        onClick={() => setImagemModal(pedido.comprovanteUrl)}
                        className="rounded-lg overflow-hidden border border-gray-200 hover:border-rose-300 transition-colors"
                      >
                        <img
                          src={pedido.comprovanteUrl}
                          alt="Comprovante"
                          className="w-24 h-24 object-cover"
                        />
                      </button>
                    </div>
                  )}

                  {/* Motivo recusa */}
                  {pedido.status === 'recusado' && pedido.motivoRecusa && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <p className="text-[10px] text-red-500 uppercase font-bold">Motivo da Recusa</p>
                      <p className="text-sm text-red-700">{pedido.motivoRecusa}</p>
                    </div>
                  )}

                  {/* Acoes */}
                  {pedido.status === 'pendente' && (
                    <div className="pt-3 border-t border-gray-100">
                      {recusandoId === pedido.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={motivoRecusa}
                            onChange={(e) => setMotivoRecusa(e.target.value)}
                            placeholder="Motivo da recusa..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-xl border border-red-200 text-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRecusar(pedido)}
                              disabled={!motivoRecusa.trim() || estaProcessando}
                              className="flex-1 px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {estaProcessando ? 'Recusando...' : 'Confirmar Recusa'}
                            </button>
                            <button
                              onClick={() => { setRecusandoId(null); setMotivoRecusa(''); }}
                              className="px-4 py-2.5 min-h-[44px] bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAprovar(pedido)}
                            disabled={estaProcessando}
                            className="flex-1 px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-green-200/50 transition-all duration-200 disabled:opacity-50 text-sm"
                          >
                            {estaProcessando ? 'Aprovando...' : 'Aprovar'}
                          </button>
                          <button
                            onClick={() => setRecusandoId(pedido.id)}
                            disabled={estaProcessando}
                            className="flex-1 px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-200/50 transition-all duration-200 disabled:opacity-50 text-sm"
                          >
                            Recusar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de imagem */}
      {imagemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setImagemModal(null)}
        >
          <div className="relative max-w-lg w-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setImagemModal(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold z-10"
            >
              x
            </button>
            <img
              src={imagemModal}
              alt="Comprovante"
              className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}
