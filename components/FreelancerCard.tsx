import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Star, MapPin, MessageCircle } from 'lucide-react-native';
import { Freelancer } from '../types';

interface FreelancerCardProps {
  freelancer: Freelancer;
  onPress: () => void;
  onMessage: () => void;
}

export default function FreelancerCard({ freelancer, onPress, onMessage }: FreelancerCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Image source={{ uri: freelancer.foto }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.nome}>{freelancer.nome}</Text>
          <Text style={styles.servicos}>{freelancer.servicos.join(', ')}</Text>
          <View style={styles.localizacao}>
            <MapPin size={16} color="#666" />
            <Text style={styles.cidade}>{freelancer.cidade}</Text>
          </View>
        </View>
        <View style={styles.preco}>
          <Text style={styles.precoTexto}>R$ {freelancer.preco.minimo}-{freelancer.preco.maximo}</Text>
        </View>
      </View>
      
      <Text style={styles.descricao} numberOfLines={2}>
        {freelancer.descricao}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.avaliacao}>
          <Star size={16} color="#FFD700" fill="#FFD700" />
          <Text style={styles.nota}>{freelancer.avaliacaoMedia}</Text>
          <Text style={styles.avaliacoes}>({freelancer.totalAvaliacoes})</Text>
        </View>
        
        <View style={styles.acoes}>
          <View style={[styles.status, freelancer.disponivel ? styles.disponivel : styles.ocupado]}>
            <Text style={[styles.statusTexto, freelancer.disponivel ? styles.disponivelTexto : styles.ocupadoTexto]}>
              {freelancer.disponivel ? 'Disponível' : 'Ocupado'}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.botaoMensagem} onPress={onMessage}>
            <MessageCircle size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  servicos: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  localizacao: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cidade: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  preco: {
    alignItems: 'flex-end',
  },
  precoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  descricao: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nota: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  avaliacoes: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  disponivel: {
    backgroundColor: '#E8F5E8',
  },
  ocupado: {
    backgroundColor: '#FFF0F0',
  },
  statusTexto: {
    fontSize: 12,
    fontWeight: '500',
  },
  disponivelTexto: {
    color: '#22C55E',
  },
  ocupadoTexto: {
    color: '#EF4444',
  },
  botaoMensagem: {
    padding: 8,
  },
});
