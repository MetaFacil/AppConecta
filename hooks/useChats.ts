import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/supabase';

type Message = Database['public']['Tables']['messages']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export type Chat = Database['public']['Tables']['chats']['Row'] & {
  messages: Message[];
  otherProfile: Profile;
};

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadChats = useCallback(async () => {
    if (!user) return;

    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          messages (
            *,
            message_type,
            media_url
          )
        `)
        .or(`cliente_id.eq.${user.id},freelancer_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;

      const chatsWithProfiles = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const otherId = chat.cliente_id === user.id ? chat.freelancer_id : chat.cliente_id;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .single();

          return {
            ...chat,
            otherProfile: profile,
            messages: chat.messages.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            ),
          };
        })
      );

      setChats(chatsWithProfiles as Chat[]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createChat = async (freelancerId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    try {
      // Check if chat already exists
      const { data: existingChat, error: existingError } = await supabase
        .from('chats')
        .select('id')
        .or(`(cliente_id.eq.${user.id},and(freelancer_id.eq.${freelancerId})),(cliente_id.eq.${freelancerId},and(freelancer_id.eq.${user.id}))`)
        .single();
      
      if (existingError && existingError.code !== 'PGRST116') { // 'PGRST116' is "exact one row not found"
        throw existingError;
      }
      
      if (existingChat) {
        return existingChat;
      }

      const { data, error } = await supabase
        .from('chats')
        .insert({
          cliente_id: user.id,
          freelancer_id: freelancerId,
        })
        .select()
        .single();

      if (error) throw error;
      await loadChats();
      return data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  useEffect(() => {
    if (user) {
      loadChats();

      const subscription = supabase
        .channel('public-tables-change')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          () => loadChats()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'chats' },
          () => loadChats()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, loadChats]);

  return {
    chats,
    loading,
    error,
    createChat,
    refreshChats: loadChats,
  };
}
