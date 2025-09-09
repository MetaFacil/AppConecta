import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Settings, 
  HelpCircle, 
  Shield, 
  LogOut,
  ChevronRight
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function PerfilScreen() {
  const { profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sair',
      'Deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Erro', error.message);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    { icon: Settings, title: 'Configurações', onPress: () => Alert.alert('Configurações', 'Em desenvolvimento') },
    { icon: Shield, title: 'Privacidade e Segurança', onPress: () => Alert.alert('Privacidade', 'Em desenvolvimento') },
    { icon: HelpCircle, title: 'Ajuda e Suporte', onPress: () => Alert.alert('Ajuda', 'Em desenvolvimento') },
    { icon: LogOut, title: 'Sair', onPress: handleSignOut },
  ];

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card do Usuário */}
        <View style={styles.userCard}>
          <Image 
            source={{ 
              uri: profile.foto_url || `https://i.pravatar.cc/150?u=${profile.id}` 
            }} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.nome}>{profile.nome}</Text>
            <Text style={styles.tipo}>{profile.tipo === 'cliente' ? 'Cliente' : 'Freelancer'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Informações de Contato */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações de Contato</Text>
          
          <View style={styles.infoItem}>
            <Mail size={20} color="#007AFF" />
            <Text style={styles.infoText}>{profile.email}</Text>
          </View>
          
          {profile.telefone && (
            <View style={styles.infoItem}>
              <Phone size={20} color="#007AFF" />
              <Text style={styles.infoText}>{profile.telefone}</Text>
            </View>
          )}
          
          <View style={styles.infoItem}>
            <MapPin size={20} color="#007AFF" />
            <Text style={styles.infoText}>{profile.cidade}</Text>
          </View>
        </View>

        {/* Estatísticas */}
        {profile.tipo === 'freelancer' && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.total_avaliacoes}</Text>
              <Text style={styles.statLabel}>Avaliações</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.avaliacao_media}</Text>
              <Text style={styles.statLabel}>Nota Média</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile.disponivel ? 'Sim' : 'Não'}</Text>
              <Text style={styles.statLabel}>Disponível</Text>
            </View>
          </View>
        )}

        {/* Menu */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <item.icon size={20} color="#333" />
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Versão */}
        <View style={styles.version}>
          <Text style={styles.versionText}>App Conecta v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tipo: {
    fontSize: 16,
    color: '#666',
  },
  editButton: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  version: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
});
