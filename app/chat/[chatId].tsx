import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useChats } from '../../hooks/useChats';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { Send, Paperclip, X } from 'lucide-react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as ImagePicker from 'expo-image-picker';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user } = useAuth();
  const { chats } = useChats();

  const chatInfo = useMemo(() => chats.find(c => c.id === chatId), [chats, chatId]);

  const { messages, loading, otherUserTyping, sendMessage, sendTypingEvent, markMessagesAsRead } = useChat(chatId);

  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ uri: string; base64: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      markMessagesAsRead();
    }, [markMessagesAsRead])
  );

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    if (isTyping) {
      sendTypingEvent(true);
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        sendTypingEvent(false);
      }, 2000);
    }
    return () => clearTimeout(typingTimeout);
  }, [newMessage, isTyping, sendTypingEvent]);

  const handleTextChange = (text: string) => {
    setNewMessage(text);
    if (!isTyping) setIsTyping(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && !selectedImage) return;
    try {
      await sendMessage(newMessage.trim(), selectedImage || undefined);
      setNewMessage('');
      setSelectedImage(null);
      if (isTyping) {
        setIsTyping(false);
        sendTypingEvent(false);
      }
    } catch (error: any) {
      Alert.alert('Erro', `Falha ao enviar mensagem: ${error.message}`);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para enviar imagens.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0].base64) {
      setSelectedImage({ uri: result.assets[0].uri, base64: result.assets[0].base64 });
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMyMessage = item.sender_id === user?.id;
    return (
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
        <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble]}>
          {item.message_type === 'image' && item.media_url ? (
            <Image source={{ uri: item.media_url }} style={styles.chatImage} />
          ) : (
            <Text style={isMyMessage ? styles.myMessageText : styles.otherMessageText}>{item.conteudo}</Text>
          )}
          <Text style={isMyMessage ? styles.myMessageTime : styles.otherMessageTime}>
            {format(new Date(item.created_at), 'HH:mm', { locale: ptBR })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading && messages.length === 0) {
    return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color="#007AFF" /></SafeAreaView>;
  }

  if (!chatInfo) {
    return <SafeAreaView style={styles.loadingContainer}><Text>Chat não encontrado.</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: chatInfo.otherProfile?.nome || 'Conversa',
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>{chatInfo.otherProfile?.nome}</Text>
              {otherUserTyping && <Text style={styles.headerSubtitle}>digitando...</Text>}
            </View>
          ),
          headerBackTitleVisible: false,
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={{ paddingVertical: 10 }}
          inverted
        />
        <View style={styles.inputContainer}>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={() => setSelectedImage(null)}>
                <X size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <Paperclip size={22} color="#666" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={handleTextChange}
            placeholder="Digite uma mensagem..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#000' },
  headerSubtitle: { fontSize: 13, color: '#666' },
  messageList: { flex: 1, paddingHorizontal: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  attachButton: { padding: 8 },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginHorizontal: 8,
  },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
  messageContainer: { marginVertical: 5, flexDirection: 'row' },
  myMessageContainer: { justifyContent: 'flex-end' },
  otherMessageContainer: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 20 },
  myMessageBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 5 },
  otherMessageBubble: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E5E5', borderBottomLeftRadius: 5 },
  myMessageText: { color: '#fff', fontSize: 16 },
  otherMessageText: { color: '#333', fontSize: 16 },
  myMessageTime: { fontSize: 10, color: '#E0E0E0', alignSelf: 'flex-end', marginTop: 4, marginLeft: 8 },
  otherMessageTime: { fontSize: 10, color: '#999', alignSelf: 'flex-end', marginTop: 4, marginLeft: 8 },
  chatImage: { width: 200, height: 200, borderRadius: 15, resizeMode: 'cover' },
  imagePreviewContainer: { position: 'absolute', bottom: 60, left: 10, backgroundColor: '#fff', padding: 5, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3 },
  imagePreview: { width: 60, height: 60, borderRadius: 8 },
  removeImageButton: { position: 'absolute', top: -5, right: -5, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 10, padding: 2 },
});
