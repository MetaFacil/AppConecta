import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';

type Message = Database['public']['Tables']['messages']['Row'];

export function useChat(chatId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const markMessagesAsRead = useCallback(async () => {
    if (!chatId || !user) return;
    try {
      const { error } = await supabase
        .from('messages')
        .update({ lida: true })
        .eq('chat_id', chatId)
        .eq('lida', false)
        .not('sender_id', 'eq', user.id);
      if (error) console.error('Erro ao marcar mensagens como lidas:', error.message);
    } catch (err: any) {
      console.error('Erro ao marcar mensagens como lidas:', err.message);
    }
  }, [chatId, user]);

  const sendMessage = async (content: string, image?: { uri: string; base64: string }) => {
    if (!user || !chatId) throw new Error('Usuário ou chat inválido');

    let messageData: Database['public']['Tables']['messages']['Insert'] = {
      chat_id: chatId,
      sender_id: user.id,
      conteudo: content,
      message_type: 'text',
    };

    if (image) {
      const fileExt = image.uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${new Date().getTime()}.${fileExt}`;
      const filePath = `${user.id}/${chatId}/${fileName}`;
      const contentType = `image/${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_media')
        .upload(filePath, decode(image.base64), { contentType });
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_media')
        .getPublicUrl(filePath);

      messageData = {
        ...messageData,
        conteudo: 'Imagem',
        message_type: 'image',
        media_url: publicUrl,
      };
    }
    
    const { error } = await supabase.from('messages').insert(messageData);
    if (error) throw error;
  };

  const sendTypingEvent = (isTyping: boolean) => {
    if (!chatId || !user) return;
    const channel = supabase.channel(`chat:${chatId}`);
    channel.track({
      event: 'typing',
      payload: { user_id: user.id, is_typing: isTyping },
    });
  };

  useEffect(() => {
    if (chatId && user) {
      loadMessages();
      markMessagesAsRead();

      const channel = supabase.channel(`chat:${chatId}`);

      const messageSubscription = channel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [newMessage, ...prev.filter(m => m.id !== newMessage.id)]);
          if (newMessage.sender_id !== user.id) {
            markMessagesAsRead();
          }
        }
      );
      
      let typingTimeout: NodeJS.Timeout;
      const typingSubscription = channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== user.id) {
          setOtherUserTyping(payload.is_typing);
          if (payload.is_typing) {
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => setOtherUserTyping(false), 3000);
          }
        }
      });
      
      channel.subscribe();

      return () => {
        supabase.removeChannel(channel);
        clearTimeout(typingTimeout);
      };
    }
  }, [chatId, user, loadMessages, markMessagesAsRead]);

  return { messages, loading, otherUserTyping, sendMessage, sendTypingEvent, markMessagesAsRead };
}
