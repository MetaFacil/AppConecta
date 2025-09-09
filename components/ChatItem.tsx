import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Chat } from '../types';
import { freelancers, clienteAtual } from '../data/mockData';

interface ChatItemProps {
  chat: Chat;
  onPress: () => void;
}

export default function ChatItem({ chat, onPress }: ChatItemProps) {
  const outroParticipante = chat.participantes.find(id => id !== clienteAtual.id);
  const freelancer = freelancers.find(f => f.id === outroParticipante);
  
  if (!freelancer || !chat.ultimaMensagem) return null;

  const isMinhaUltimaMensagem = chat.ultimaMensagem.remetenteId === clienteAtual.id;
  const tempoFormatado = format(chat.ultimaMensagem.enviadaEm, 'HH:mm', { locale: ptBR });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: freelancer.foto }} style={styles.avatar} />
      
      <View style={styles.conteudo}>
        <View style={styles.cabecalho}>
          <Text style={styles.nome}>{freelancer.nome}</Text>
          <Text style={styles.horario}>{tempoFormatado}</Text>
        </View>
        
        <View style={styles.mensagem}>
          <Text style={styles.ultimaMensagem} numberOfLines={1}>
            {isMinhaUltimaMensagem ? 'Você: ' : ''}{chat.ultimaMensagem.conteudo}
          </Text>
          
          {!chat.ultimaMensagem.lida && !isMinhaUltimaMensagem && (
            <View style={styles.naoLida} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  naoLida: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
});
