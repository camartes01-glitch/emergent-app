import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupportScreen() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const faqItems = [
    {
      question: 'How do I add services to my profile?',
      answer: 'Go to My Profile → Edit Services button to add or remove services from your portfolio.',
    },
    {
      question: 'How do I manage equipment inventory?',
      answer: 'Navigate to Dashboard → Inventory tab to add, edit, or track your camera rental equipment.',
    },
    {
      question: 'How do bookings work?',
      answer: 'Clients can send you booking requests through the app. You will receive notifications and can manage them in the Dashboard.',
    },
    {
      question: 'How do I update pricing?',
      answer: 'Go to your service profile and tap on the service to edit pricing and other details.',
    },
  ];

  const handleAskAI = async () => {
    if (!question.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    setLoading(true);
    // Simulate AI response (in production, call actual AI API)
    setTimeout(() => {
      setAiResponse(
        `Thank you for your question: "${question}"

I'm here to help! Based on your query, here are some suggestions:

1. Check the FAQ section below for common questions
2. Visit your Dashboard to manage your profile and services
3. Contact our support team at 9505 139 369 for personalized assistance

Is there anything specific you'd like help with regarding bookings, equipment, or profile management?`
      );
      setLoading(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* AI Assistant Section */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Ionicons name="chatbot" size={32} color={Colors.primary} />
            <View style={styles.aiHeaderText}>
              <Text style={styles.aiTitle}>AI Assistant</Text>
              <Text style={styles.aiSubtitle}>Ask me anything!</Text>
            </View>
          </View>

          <TextInput
            style={styles.questionInput}
            placeholder="Type your question here..."
            placeholderTextColor={Colors.placeholder}
            value={question}
            onChangeText={setQuestion}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={styles.askButton}
            onPress={handleAskAI}
            disabled={loading}
          >
            <Ionicons name="send" size={20} color={Colors.background} />
            <Text style={styles.askButtonText}>
              {loading ? 'Processing...' : 'Ask AI'}
            </Text>
          </TouchableOpacity>

          {aiResponse ? (
            <View style={styles.responseContainer}>
              <Text style={styles.responseText}>{aiResponse}</Text>
            </View>
          ) : null}
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqQuestion}>
                <Ionicons name="help-circle" size={20} color={Colors.primary} />
                <Text style={styles.faqQuestionText}>{item.question}</Text>
              </View>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="book" size={20} color={Colors.primary} />
            <Text style={styles.linkText}>User Guide</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="document-text" size={20} color={Colors.primary} />
            <Text style={styles.linkText}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkItem}>
            <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  aiSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiHeaderText: {
    marginLeft: 12,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  aiSubtitle: {
    fontSize: 14,
    color: Colors.secondary,
  },
  questionInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  askButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  askButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  responseText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  faqSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginLeft: 28,
  },
  quickLinks: {
    marginBottom: 32,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    marginLeft: 12,
  },
});
