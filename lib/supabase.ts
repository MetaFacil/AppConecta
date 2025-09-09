import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          nome: string;
          telefone?: string;
          foto_url?: string;
          cidade: string;
          tipo: 'cliente' | 'freelancer';
          descricao?: string;
          preco_minimo?: number;
          preco_maximo?: number;
          disponivel: boolean;
          avaliacao_media: number;
          total_avaliacoes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nome: string;
          telefone?: string;
          foto_url?: string;
          cidade: string;
          tipo?: 'cliente' | 'freelancer';
          descricao?: string;
          preco_minimo?: number;
          preco_maximo?: number;
          disponivel?: boolean;
          avaliacao_media?: number;
          total_avaliacoes?: number;
        };
        Update: {
          email?: string;
          nome?: string;
          telefone?: string;
          foto_url?: string;
          cidade?: string;
          tipo?: 'cliente' | 'freelancer';
          descricao?: string;
          preco_minimo?: number;
          preco_maximo?: number;
          disponivel?: boolean;
          avaliacao_media?: number;
          total_avaliacoes?: number;
        };
      };
      categories: {
        Row: {
          id: string;
          nome: string;
          descricao?: string;
          icone?: string;
          created_at: string;
        };
      };
      services: {
        Row: {
          id: string;
          freelancer_id: string;
          category_id?: string;
          nome: string;
          descricao?: string;
          preco?: number;
          ativo: boolean;
          created_at: string;
        };
      };
      projects: {
        Row: {
          id: string;
          cliente_id: string;
          freelancer_id: string;
          service_id?: string;
          titulo: string;
          descricao: string;
          valor: number;
          comissao: number;
          status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
          prazo?: string;
          created_at: string;
          updated_at: string;
        };
      };
      chats: {
        Row: {
          id: string;
          cliente_id: string;
          freelancer_id: string;
          project_id?: string;
          created_at: string;
          updated_at: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          conteudo: string;
          lida: boolean;
          created_at: string;
          message_type: 'text' | 'image';
          media_url: string | null;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          conteudo: string;
          lida?: boolean;
          created_at?: string;
          message_type?: 'text' | 'image';
          media_url?: string | null;
        };
        Update: {
          lida?: boolean;
        };
      };
      reviews: {
        Row: {
          id: string;
          project_id: string;
          avaliador_id: string;
          avaliado_id: string;
          nota: number;
          comentario?: string;
          created_at: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          project_id: string;
          cliente_id: string;
          freelancer_id: string;
          valor_total: number;
          valor_freelancer: number;
          comissao: number;
          status: 'pendente' | 'processando' | 'concluida' | 'falhou';
          payment_method?: string;
          external_payment_id?: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
