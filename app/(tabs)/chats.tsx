import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useChats } from '../../hooks/useChats';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatsScreen() {
  const { chats, loading } = useChats();
  const { user } = useAuth();

  const handleChatPress = (chat: any) => {
    router.push(`/chat/${chat.id}`);
  };

  const renderChat = ({ item }: { item: any }) => {
    const ultimaMensagem = item.messages[item.messages.length - 1];
    const tempoFormatado = ultimaMensagem 
      ? format(new Date(ultimaMensagem.created_at), 'HH:mm', { locale: ptBR })
      : '';
    
    const isMinhaUltimaMensagem = ultimaMensagem?.sender_id === user?.id;
    const naoLida = ultimaMensagem && !ultimaMensagem.lida && !isMinhaUltimaMensagem;

    let conteudoUltimaMensagem = 'Conversa iniciada';
    if (ultimaMensagem) {
      if (ultimaMensagem.message_type === 'image') {
        conteudoUltimaMensagem = '📷 Imagem';
      } else {
        conteudoUltimaMensagem = ultimaMensagem.conteudo;
      }
      if (isMinhaUltimaMensagem) {
        conteudoUltimaMensagem = `Você: ${conteudoUltimaMensagem}`;
      }
    }

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
        <Image 
          source={{ 
            uri: item.otherProfile?.foto_url || `https://i.pravatar.cc/150?u=${item.otherProfile?.id}` 
          }} 
          style={styles.avatar} 
        />
        
        <View style={styles.conteudo}>
          <View style={styles.cabecalho}>
            <Text style={[styles.nome, naoLida && styles.nomeNaoLido]}>{item.otherProfile?.nome}</Text>
            <Text style={styles.horario}>{tempoFormatado}</Text>
          </View>
          
          <View style={styles.mensagem}>
            <Text style={[styles.ultimaMensagem, naoLida && styles.mensagemNaoLida]} numberOfLines={1}>
              {conteudoUltimaMensagem}
            </Text>
            
            {naoLida && (
              <View style={styles.naoLidaBadge} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (chats.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>Conversas</Text>
        </View>
        
        <View style={styles.emptyState}>
          <MessageCircle size={80} color="#DDD" />
          <Text style={styles.emptyTitle}>Nenhuma conversa ainda</Text>
          <Text style={styles.emptySubtitle}>
            Inicie uma conversa com profissionais na aba Buscar
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Conversas</Text>
        <Text style={styles.subtitulo}>{chats.length} conversas ativas</Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
  },
  lista: {
    backgroundColor: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  conteudo: {
    flex: 1,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nomeNaoLido: {
    fontWeight: 'bold',
  },
  horario: {
    fontSize: 12,
    color: '#666',
  },
  mensagem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ultimaMensagem: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  mensagemNaoLida: {
    color: '#333',
    fontWeight: '500',
  },
  naoLidaBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
