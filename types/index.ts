export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  foto?: string;
  cidade: string;
  tipo: 'cliente' | 'freelancer';
  criadoEm: Date;
}

export interface Freelancer extends Usuario {
  tipo: 'freelancer';
  descricao: string;
  servicos: string[];
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  preco: {
    minimo: number;
    maximo: number;
  };
  disponivel: boolean;
  categoria: string;
}

export interface Cliente extends Usuario {
  tipo: 'cliente';
}

export interface Projeto {
  id: string;
  clienteId: string;
  freelancerId: string;
  titulo: string;
  descricao: string;
  valor: number;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  criadoEm: Date;
  prazo?: Date;
}

export interface Mensagem {
  id: string;
  remetenteId: string;
  destinatarioId: string;
  conteudo: string;
  enviadaEm: Date;
  lida: boolean;
  message_type: 'text' | 'image';
  media_url?: string;
}

export interface Chat {
  id: string;
  participantes: string[];
  ultimaMensagem?: Mensagem;
  mensagens: Mensagem[];
}

export interface Avaliacao {
  id: string;
  projetoId: string;
  avaliadore: string;
  avaliado: string;
  nota: number;
  comentario?: string;
  criadaEm: Date;
}

export interface Transacao {
  id: string;
  projetoId: string;
  valor: number;
  comissao: number;
  status: 'pendente' | 'processando' | 'concluida' | 'falhou';
  criadaEm: Date;
}
