// app/messages/[id].js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

const Chat = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [message, setMessage] = useState('');

  // Em uma aplicação real, você buscaria os dados do contato e mensagens usando o ID
  const contact = {
    id: id,
    name: 'João Silva',
    avatar: 'https://via.placeholder.com/100',
    online: true,
  };

  // Dados mockados de mensagens
  const messages = [
    {
      id: '1',
      text: 'Oi, a bike ainda está disponível?',
      time: '14:30',
      sender: 'them',
    },
    {
      id: '2',
      text: 'Sim, está disponível para aluguel!',
      time: '14:31',
      sender: 'me',
    },
    {
      id: '3',
      text: 'Ótimo! Posso reservar para amanhã?',
      time: '14:32',
      sender: 'them',
    },
    {
      id: '4',
      text: 'Claro! Qual horário você prefere?',
      time: '14:33',
      sender: 'me',
    },
  ];

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'me' ? styles.myMessage : styles.theirMessage
    ]}>
      <Text style={[
        styles.messageText,
        item.sender === 'me' && styles.myMessageText
      ]}>{item.text}</Text>
      <Text style={[
        styles.messageTime,
        item.sender === 'me' && styles.myMessageTime
      ]}>{item.time}</Text>
    </View>
  );

  const sendMessage = () => {
    if (message.trim().length > 0) {
      // Aqui você implementaria a lógica para enviar a mensagem
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        <Image source={{ uri: contact.avatar }} style={styles.avatar} />
        
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.status}>
            {contact.online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        inverted={false}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <Feather name="send" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 12,
    color: '#666',
  },
  messagesList: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    backgroundColor: '#2196F3',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    padding: 8,
  },
});

export default Chat;