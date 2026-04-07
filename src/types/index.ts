export type UnidadeMedida = 'g' | 'kg' | 'ml' | 'L' | 'un';

export interface Ingrediente {
  id: string;
  nome: string;
  precoTotal: number;
  medidaTotal: number;
  unidadeBase: UnidadeMedida;
  precoPorUnidade: number; // Calculado automaticamente
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IngredienteReceita {
  ingredienteId: string;
  quantidade: number;
  unidade: UnidadeMedida;
}

export interface RecheioReceita {
  recheioId: string;
  quantidade: number; // peso utilizado
  unidade: UnidadeMedida;
}

export type TipoReceita = 'recheio' | 'bolo' | 'sobremesa';

export const ROTA_PARA_TIPO_RECEITA: Record<TipoReceita, string> = {
  recheio: 'recheios',
  bolo: 'bolos',
  sobremesa: 'sobremesas',
};

export interface Receita {
  id: string;
  nome: string;
  tipo?: TipoReceita; // recheio, bolo ou sobremesa (padrão: bolo para compatibilidade)
  ingredientes: IngredienteReceita[];
  recheios?: RecheioReceita[]; // recheios/caldas do bolo (cada um com peso) — entra no custo total
  descricao?: string;
  custoTotal: number; // Calculado automaticamente (ingredientes + recheios quando for bolo)
  custoPorPorcao?: number; // Opcional
  porcoes?: number; // Número de porções (opcional)
  imagemUrl?: string; // URL da imagem da receita
  margemLucro?: number; // Porcentagem de margem de lucro (padrão 150%)
  unidadePadrao?: UnidadeMedida; // para recheios: unidade sugerida ao usar em bolos (ex: g)
  rendimentoGramas?: number; // para recheios: rendimento total em gramas (para custo por peso)
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HistoricoIngrediente {
  id: string;
  nome: string;
  precoTotal: number;
  medidaTotal: number;
  unidadeBase: UnidadeMedida;
  precoPorUnidade: number;
  data: Date;
  userId: string;
}

export interface HistoricoReceita {
  id: string;
  nome: string;
  custoTotal: number;
  precoSugerido: number;
  margemLucro?: number;
  data: Date;
  userId: string;
}

// === WhatsApp Pedidos ===

export interface ItemBoloDia {
  nome: string;
  preco: number;
  quantidade: number;
  receitaId?: string;
}

export interface BoloDia {
  id: string; // "YYYY-MM-DD"
  data: Date;
  userId: string;
  itens: ItemBoloDia[];
  historico: MovimentacaoEstoque[];
}

export type TipoMovimentacao = 'entrada' | 'saida_manual' | 'saida_pedido';

export interface MovimentacaoEstoque {
  tipo: TipoMovimentacao;
  bolo: string;
  quantidade: number;
  horario: string; // ISO string
  usuario?: string;
  pedidoId?: string;
}

export type StatusPedido = 'pendente' | 'aprovado' | 'recusado';

export interface ItemPedido {
  nome: string;
  quantidade: number;
  preco: number;
}

export interface Pedido {
  id: string;
  telefone: string;
  nomeCliente: string;
  whatsappNome: string;
  itens: ItemPedido[];
  // Campos legados (compatibilidade com pedidos antigos)
  bolo?: string;
  quantidade?: number;
  preco?: number;
  total: number;
  endereco: string;
  comprovanteUrl: string;
  status: StatusPedido;
  motivoRecusa?: string;
  userId: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

