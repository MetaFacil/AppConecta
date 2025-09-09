import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { MapPin } from 'lucide-react-native';
import SearchBar from '../../components/SearchBar';
import FreelancerCard from '../../components/FreelancerCard';
import { useFreelancers } from '../../hooks/useFreelancers';
import { useChats } from '../../hooks/useChats';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  
  const { freelancers, categories, loading } = useFreelancers();
  const { createChat } = useChats();
  const { profile } = useAuth();

  const freelancersFiltrados = useMemo(() => {
    let resultado = freelancers;

    if (searchQuery) {
      resultado = resultado.filter(freelancer => 
        freelancer.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (freelancer.descricao && freelancer.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoriaSelecionada) {
      const categoria = categories.find(c => c.id === categoriaSelecionada);
      if (categoria) {
        resultado = resultado.filter(freelancer => 
          freelancer.descricao && freelancer.descricao.toLowerCase().includes(categoria.nome.toLowerCase())
        );
      }
    }

    return resultado;
  }, [freelancers, searchQuery, categoriaSelecionada, categories]);

  const handleFreelancerPress = (freelancer: Profile) => {
    Alert.alert(
      freelancer.nome,
      `${freelancer.descricao || 'Freelancer disponível'}\n\nCidade: ${freelancer.cidade}\n\nAvaliação: ${freelancer.avaliacao_media} (${freelancer.total_avaliacoes} avaliações)`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar Conversa', onPress: () => handleMessage(freelancer) }
      ]
    );
  };

  const handleMessage = async (freelancer: Profile) => {
    try {
      await createChat(freelancer.id);
      Alert.alert(
        'Conversa Iniciada',
        `Você iniciou uma conversa com ${freelancer.nome}. Acesse a aba Conversas para continuar.`
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  const renderCategoria = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoriaChip,
        categoriaSelecionada === item.id && styles.categoriaSelecionada
      ]}
      onPress={() => setCategoriaSelecionada(
        categoriaSelecionada === item.id ? null : item.id
      )}
    >
      <Text style={[
        styles.categoriaTexto,
        categoriaSelecionada === item.id && styles.categoriaTextoSelecionado
      ]}>
        {item.nome}
      </Text>
    </TouchableOpacity>
  );

  const renderFreelancer = ({ item }: { item: Profile }) => (
    <FreelancerCard
      freelancer={{
        id: item.id,
        nome: item.nome,
        email: item.email,
        telefone: item.telefone,
        foto: item.foto_url,
        cidade: item.cidade,
        tipo: item.tipo as 'freelancer',
        criadoEm: new Date(item.created_at),
        descricao: item.descricao || '',
        servicos: [item.descricao || 'Serviços Gerais'],
        avaliacaoMedia: item.avaliacao_media,
        totalAvaliacoes: item.total_avaliacoes,
        preco: {
          minimo: item.preco_minimo || 50,
          maximo: item.preco_maximo || 500
        },
        disponivel: item.disponivel,
        categoria: 'Serviços Gerais'
      }}
      onPress={() => handleFreelancerPress(item)}
      onMessage={() => handleMessage(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.localizacao}>
          <MapPin size={20} color="#007AFF" />
          <Text style={styles.cidadeTexto}>{profile?.cidade || 'São Paulo'}</Text>
        </View>
        <Text style={styles.titulo}>Encontre Profissionais</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar por serviço ou profissional..."
      />

      <View style={styles.categoriasContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriasList}
        />
      </View>

      <View style={styles.resultados}>
        <Text style={styles.resultadosTexto}>
          {freelancersFiltrados.length} profissionais encontrados
        </Text>
      </View>

      <FlatList
        data={freelancersFiltrados}
        renderItem={renderFreelancer}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lista}
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
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  localizacao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cidadeTexto: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  categoriasContainer: {
    backgroundColor: '#fff',
    paddingBottom: 8,
  },
  categoriasList: {
    paddingHorizontal: 16,
  },
  categoriaChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoriaSelecionada: {
    backgroundColor: '#007AFF',
  },
  categoriaTexto: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoriaTextoSelecionado: {
    color: '#fff',
  },
  resultados: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultadosTexto: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  lista: {
    paddingBottom: 20,
  },
});
