import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import axios from 'axios';
import API_URL from '../config/api';

type Msg = { id: string; role: 'user' | 'bot'; text: string };

export default function ChatScreen() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 'hello', role: 'bot', text: 'Chào bạn 👋 Mình có thể giúp:\n• "món rẻ nhất?"\n• "món dưới 30k"\n• "tìm món gà"\n• "còn hàng không?"' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => { scrollToEnd(); }, [messages, scrollToEnd]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Msg = { id: String(Date.now()), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { message: text });
      const replyText = res.data?.reply || 'Xin lỗi, mình chưa hiểu. Bạn thử câu khác nhé.';
      const botMsg: Msg = { id: `${userMsg.id}-bot`, role: 'bot', text: replyText };
      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      const botMsg: Msg = { id: `${userMsg.id}-err`, role: 'bot', text: 'Có lỗi kết nối server. Kiểm tra IP/API nhé.' };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setSending(false);
    }
  }, [API_URL, input, sending]);

  const renderItem = ({ item }: { item: Msg }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleRow, isUser ? styles.right : styles.left]}>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.msgText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={scrollToEnd}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Nhập câu hỏi… (vd: món rẻ nhất?)"
          placeholderTextColor="#9FB0D9"
          selectionColor="#FFC83A"
          returnKeyType="send"
          onSubmitEditing={send}
          editable={!sending}
        />
        <TouchableOpacity style={[styles.sendBtn, input.trim() ? styles.sendBtnActive : null]}
          onPress={send}
          disabled={!input.trim() || sending}
        >
          <Text style={styles.sendTxt}>{sending ? '...' : 'Gửi'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#0E1F4C',
        paddingTop: 60
    },
    listContent: {
        padding: 16,
        paddingBottom: 8 
    },
    bubbleRow: {
        marginVertical: 6, 
        flexDirection: 'row' 
    },
    left: { 
        justifyContent: 'flex-start'
    },
    right: { 
        justifyContent: 'flex-end' 
    },
    bubble: {
        maxWidth: '85%',
        paddingHorizontal: 14, 
        paddingVertical: 10,
        borderRadius: 16, 
        shadowColor: '#000',
        shadowOpacity: 0.1, 
        shadowOffset: { width: 0, height: 3 }, 
        shadowRadius: 6, 
        elevation: 2
    },
    userBubble: { 
        backgroundColor: '#2A4BA0', 
        borderTopRightRadius: 4 
    },
    botBubble: { 
        backgroundColor: '#F0F4FF', 
        borderTopLeftRadius: 4 },
    msgText: { 
        fontSize: 15, 
        lineHeight: 22 },
    userText: { 
        color: '#FFFFFF' 
    },
    botText: { 
        color: '#0E1F4C' 
    },
    inputBar: {
        flexDirection: 'row', 
        alignItems: 'center',
        padding: 10, 
        backgroundColor: '#132764', 
        gap: 8
    },
    input: {
        flex: 1, 
        backgroundColor: '#1B3377', 
        color: '#fff',
        borderRadius: 24, 
        paddingHorizontal: 14, 
        paddingVertical: 10, 
        fontSize: 15
    },
    sendBtn: {
        paddingHorizontal: 16, 
        paddingVertical: 10, 
        borderRadius: 24,
        backgroundColor: '#2D3E7A'
    },
    sendBtnActive: { 
        backgroundColor: '#FFC83A' 
    },
    sendTxt: { 
        color: '#0E1F4C', fontWeight: '700' 
    }
});
