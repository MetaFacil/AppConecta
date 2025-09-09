import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff, Plus, Minus } from 'lucide-react-native';

export default function CarteiraScreen() {
  const [saldoVisivel, setSaldoVisivel] = React.useState(true);
  
  const saldoDisponivel = 1250.50;
  const saldoPendente = 320.00;
  const comissaoTotal = 180.75;

  const transacoes = [
    { id: '1', tipo: 'entrada', valor: 450.00, descricao: 'Serviço de Design - João M.', data: '2025-01-10' },
    { id: '2', tipo: 'saida', valor: 67.50, descricao: 'Comissão da plataforma', data: '2025-01-10' },
    { id: '3', tipo: 'entrada', valor: 320.00, descricao: 'Consultoria Marketing - Ana S.', data: '2025-01-09' },
    { id: '4', tipo: 'saida', valor: 48.00, descricao: 'Comissão da plataforma', data: '2025-01-09' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Carteira</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card do Saldo */}
        <View style={styles.saldoCard}>
          <View style={styles.saldoHeader}>
            <View style={styles.saldoIcon}>
              <Wallet size={24} color="#007AFF" />
            </View>
            <TouchableOpacity onPress={() => setSaldoVisivel(!saldoVisivel)}>
              {saldoVisivel ? (
                <EyeOff size={20} color="#666" />
              ) : (
                <Eye size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.saldoLabel}>Saldo Disponível</Text>
          <Text style={styles.saldoValor}>
            {saldoVisivel ? `R$ ${saldoDisponivel.toFixed(2)}` : '••••••'}
          </Text>
          
          <TouchableOpacity style={styles.botaoSaque}>
            <Text style={styles.botaoSaqueTexto}>Solicitar Saque</Text>
          </TouchableOpacity>
        </View>

        {/* Resumo */}
        <View style={styles.resumoContainer}>
          <View style={styles.resumoItem}>
            <View style={styles.resumoIcon}>
              <TrendingUp size={20} color="#22C55E" />
            </View>
            <View style={styles.resumoTextos}>
              <Text style={styles.resumoLabel}>Pendente</Text>
              <Text style={styles.resumoValor}>R$ {saldoPendente.toFixed(2)}</Text>
            </View>
          </View>
          
          <View style={styles.resumoItem}>
            <View style={[styles.resumoIcon, { backgroundColor: '#FFF0F0' }]}>
              <TrendingDown size={20} color="#EF4444" />
            </View>
            <View style={styles.resumoTextos}>
              <Text style={styles.resumoLabel}>Comissões</Text>
              <Text style={styles.resumoValor}>R$ {comissaoTotal.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Histórico de Transações */}
        <View style={styles.historicoContainer}>
          <Text style={styles.historicoTitulo}>Histórico de Transações</Text>
          
          {transacoes.map((transacao) => (
            <View key={transacao.id} style={styles.transacaoItem}>
              <View style={[
                styles.transacaoIcon,
                transacao.tipo === 'entrada' ? styles.entradaIcon : styles.saidaIcon
              ]}>
                {transacao.tipo === 'entrada' ? (
                  <Plus size={16} color="#22C55E" />
                ) : (
                  <Minus size={16} color="#EF4444" />
                )}
              </View>
              
              <View style={styles.transacaoInfo}>
                <Text style={styles.transacaoDescricao}>{transacao.descricao}</Text>
                <Text style={styles.transacaoData}>{transacao.data}</Text>
              </View>
              
              <Text style={[
                styles.transacaoValor,
                transacao.tipo === 'entrada' ? styles.entradaValor : styles.saidaValor
              ]}>
                {transacao.tipo === 'entrada' ? '+' : '-'}R$ {transacao.valor.toFixed(2)}
              </Text>
            </View>
          ))}
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
  saldoCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  saldoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saldoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saldoLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  saldoValor: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  botaoSaque: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  botaoSaqueTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resumoContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  resumoItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resumoTextos: {
    flex: 1,
  },
  resumoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resumoValor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  historicoContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  historicoTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  transacaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transacaoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  entradaIcon: {
    backgroundColor: '#E8F5E8',
  },
  saidaIcon: {
    backgroundColor: '#FFF0F0',
  },
  transacaoInfo: {
    flex: 1,
  },
  transacaoDescricao: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  transacaoData: {
    fontSize: 14,
    color: '#666',
  },
  transacaoValor: {
    fontSize: 16,
    fontWeight: '600',
  },
  entradaValor: {
    color: '#22C55E',
  },
  saidaValor: {
    color: '#EF4444',
  },
});
