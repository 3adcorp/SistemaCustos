import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ItemBoloDia, Receita, MovimentacaoEstoque } from '../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

function formatarData(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function getDataString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function BolosDoDia() {
  const userId = useStore((s) => s.userId);
  const boloDia = useStore((s) => s.boloDia);
  const loading = useStore((s) => s.loading);
  const carregarBolosDoDia = useStore((s) => s.carregarBolosDoDia);
  const salvarBolosDoDia = useStore((s) => s.salvarBolosDoDia);

  const [itens, setItens] = useState<ItemBoloDia[]>([]);
  const [historico, setHistorico] = useState<MovimentacaoEstoque[]>([]);
  const [todasReceitas, setTodasReceitas] = useState<Receita[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [salvando, setSalvando] = useState(false);

  const hoje = new Date();
  const dataString = getDataString(hoje);

  const pendingItensRef = useRef<ItemBoloDia[] | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const historicoRef = useRef<MovimentacaoEstoque[]>([]);

  const salvarAgora = useCallback(async (novosItens: ItemBoloDia[]) => {
    if (!userId) return;
    setSalvando(true);
    await salvarBolosDoDia({
      id: dataString,
      data: hoje,
      userId,
      itens: novosItens,
      historico: historicoRef.current,
    });
    pendingItensRef.current = null;
    setSalvando(false);
  }, [userId, dataString]);

  useEffect(() => {
    if (userId) {
      carregarBolosDoDia(dataString);
      // Carregar todas as receitas de todos os usuarios (compartilhado)
      getDocs(collection(db, 'receitas')).then((snapshot) => {
        const receitas: Receita[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || new Date(),
          updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
        })) as Receita[];
        setTodasReceitas(receitas);
      });
    }
  }, [userId, dataString]);

  useEffect(() => {
    if (boloDia) {
      setItens(boloDia.itens);
      setHistorico(boloDia.historico || []);
      historicoRef.current = boloDia.historico || [];
    }
  }, [boloDia]);

  // Salvar ao desmontar (navegar para outra página)
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (pendingItensRef.current) {
        salvarAgora(pendingItensRef.current);
      }
    };
  }, [salvarAgora]);

  const salvarDebounced = useCallback(
    (novosItens: ItemBoloDia[]) => {
      pendingItensRef.current = novosItens;
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => salvarAgora(novosItens), 800);
    },
    [salvarAgora]
  );

  const registrarMovimentacao = (mov: MovimentacaoEstoque) => {
    const novoHist = [...historicoRef.current, mov];
    historicoRef.current = novoHist;
    setHistorico(novoHist);
  };

  const atualizarItens = (novosItens: ItemBoloDia[]) => {
    setItens(novosItens);
    salvarDebounced(novosItens);
  };

  const alterarQuantidade = (index: number, delta: number) => {
    const novos = [...itens];
    const novaQtd = Math.max(0, novos[index].quantidade + delta);
    const mudou = novaQtd !== novos[index].quantidade;
    novos[index] = { ...novos[index], quantidade: novaQtd };
    if (mudou) {
      registrarMovimentacao({
        tipo: delta > 0 ? 'entrada' : 'saida_manual',
        bolo: novos[index].nome,
        quantidade: Math.abs(delta),
        horario: new Date().toISOString(),
      });
    }
    atualizarItens(novos);
  };

  const alterarPreco = (index: number, preco: number) => {
    const novos = [...itens];
    novos[index] = { ...novos[index], preco };
    atualizarItens(novos);
  };

  const removerItem = (index: number) => {
    const novos = itens.filter((_, i) => i !== index);
    atualizarItens(novos);
  };

  const adicionarItem = () => {
    if (!novoNome.trim() || !novoPreco) return;
    const nome = novoNome.trim();
    const novo: ItemBoloDia = {
      nome,
      preco: parseFloat(novoPreco),
      quantidade: 1,
    };
    registrarMovimentacao({ tipo: 'entrada', bolo: nome, quantidade: 1, horario: new Date().toISOString() });
    const novos = [...itens, novo];
    atualizarItens(novos);
    setNovoNome('');
    setNovoPreco('');
    setMostrarForm(false);
  };

  const adicionarDeReceita = (receita: { id: string; nome: string; custoTotal: number; margemLucro?: number }) => {
    const preco = receita.custoTotal * ((receita.margemLucro || 250) / 100);
    const novo: ItemBoloDia = {
      nome: receita.nome,
      preco: Math.ceil(preco * 100) / 100,
      quantidade: 1,
      receitaId: receita.id,
    };
    registrarMovimentacao({ tipo: 'entrada', bolo: receita.nome, quantidade: 1, horario: new Date().toISOString() });
    const novos = [...itens, novo];
    atualizarItens(novos);
  };

  const bolosReceitas = todasReceitas.filter(
    (r) => (r.tipo === 'bolo' || !r.tipo) && !itens.some((i) => i.receitaId === r.id)
  );

  if (loading && !boloDia) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              Bolos do Dia
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1 capitalize">
              {formatarData(hoje)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {salvando && (
              <span className="text-xs text-emerald-600 font-medium animate-pulse">
                Salvando...
              </span>
            )}
            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1 rounded-full">
              {itens.filter((i) => i.quantidade > 0).length} disponivel(is)
            </span>
          </div>
        </div>
      </div>

      {/* Lista de bolos */}
      <div className="space-y-3">
        {itens.length === 0 && (
          <div className="text-center py-12 bg-white/90 backdrop-blur-sm rounded-2xl border border-rose-100 shadow-sm">
            <span className="text-4xl">🎂</span>
            <p className="text-gray-500 mt-3">Nenhum bolo cadastrado para hoje</p>
            <p className="text-gray-400 text-sm">Adicione sabores usando o botao abaixo</p>
          </div>
        )}

        {itens.map((item, index) => (
          <div
            key={index}
            className={`bg-white/90 backdrop-blur-sm rounded-xl border shadow-sm p-4 transition-all duration-200 ${
              item.quantidade === 0
                ? 'border-gray-200 opacity-60'
                : 'border-rose-100 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Nome e Preco */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-800 truncate">{item.nome}</h3>
                  {item.quantidade === 0 && (
                    <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Esgotado
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.preco}
                    onChange={(e) => alterarPreco(index, parseFloat(e.target.value) || 0)}
                    className="w-24 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Controle de quantidade */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => alterarQuantidade(index, -1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-rose-100 text-rose-600 font-bold text-lg hover:bg-rose-200 transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-lg text-gray-800">
                  {item.quantidade}
                </span>
                <button
                  onClick={() => alterarQuantidade(index, 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 font-bold text-lg hover:bg-emerald-200 transition-colors"
                >
                  +
                </button>
              </div>

              {/* Remover */}
              <button
                onClick={() => removerItem(index)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Remover"
              >
                <span className="text-lg">x</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Adicionar novo */}
      <div className="mt-6 space-y-3">
        {/* Bolos das receitas */}
        {bolosReceitas.length > 0 && (
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Adicionar das Receitas
            </p>
            <div className="flex flex-wrap gap-2">
              {bolosReceitas.map((r) => (
                <button
                  key={r.id}
                  onClick={() => adicionarDeReceita(r)}
                  className="bg-white/80 border border-rose-200 text-rose-700 text-sm font-medium px-3 py-2 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200"
                >
                  + {r.nome}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form manual */}
        {mostrarForm ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-rose-100 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Novo Sabor Personalizado</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Nome do bolo"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                className="flex-1 px-4 py-2.5 min-h-[44px] rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Preco (R$)"
                value={novoPreco}
                onChange={(e) => setNovoPreco(e.target.value)}
                className="w-full sm:w-32 px-4 py-2.5 min-h-[44px] rounded-xl border border-rose-200 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={adicionarItem}
                  disabled={!novoNome.trim() || !novoPreco}
                  className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-200/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => { setMostrarForm(false); setNovoNome(''); setNovoPreco(''); }}
                  className="px-4 py-2.5 min-h-[44px] bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMostrarForm(true)}
            className="w-full py-3 min-h-[48px] bg-white/80 border-2 border-dashed border-rose-300 text-rose-500 font-semibold rounded-xl hover:bg-rose-50 hover:border-rose-400 transition-all duration-200 text-sm"
          >
            + Adicionar Sabor Personalizado
          </button>
        )}
      </div>

      {/* Historico de Movimentacoes */}
      <div className="mt-8">
        <button
          onClick={() => setMostrarHistorico(!mostrarHistorico)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-rose-600 transition-colors"
        >
          <span>{mostrarHistorico ? '▼' : '▶'}</span>
          Historico de Movimentacoes ({historico.length})
        </button>

        {mostrarHistorico && (
          <div className="mt-3 space-y-2">
            {historico.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Nenhuma movimentacao registrada hoje</p>
            ) : (
              [...historico].reverse().map((mov, i) => {
                const hora = new Date(mov.horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const config = {
                  entrada: { icon: '+', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Entrada' },
                  saida_manual: { icon: '-', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', label: 'Saida Manual' },
                  saida_pedido: { icon: '📋', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'Pedido' },
                }[mov.tipo] || { icon: '?', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', label: mov.tipo };

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${config.bg} ${config.border}`}
                  >
                    <span className={`text-sm font-bold ${config.text} w-6 text-center`}>{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800">{mov.bolo}</span>
                      <span className={`ml-2 text-xs font-semibold ${config.text}`}>
                        {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade} un
                      </span>
                      {mov.pedidoId && (
                        <span className="ml-2 text-[10px] text-gray-400">Pedido #{mov.pedidoId.slice(-6)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-400">{hora}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
