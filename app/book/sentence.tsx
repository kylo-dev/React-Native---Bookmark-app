import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SENTENCES } from '../../constants/dummy';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const TIMELINE_EVENTS = [
  {
    id: '1',
    type: 'quote',
    content: "This reminds me of the concept of 'Eternal Return'. The way the author describes the cyclic nature of time here is profound.",
    date: 'Oct 12',
    time: '10:30 AM',
    icon: 'format-quote'
  },
  {
    id: '2',
    type: 'link',
    content: "Cross-reference with page 42. There seems to be a contradiction in how the character is portrayed.",
    date: 'Oct 14',
    time: '2:15 PM',
    icon: 'link'
  }
];

export default function SentenceDetailScreen() {
  const router = useRouter();
  const { sentenceId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const sentence = SENTENCES.find(s => s.id === sentenceId) || SENTENCES[0];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Passage Details</Text>
        
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="more-horiz" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} // extra space for bottom input
        showsVerticalScrollIndicator={false}
      >
        {/* Quote Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.pageNumberText}>PAGE 112</Text>
          
          <View style={styles.quoteWrapper}>
            <MaterialIcons name="format-quote" size={48} color="rgba(23, 84, 207, 0.2)" style={styles.quoteIconLeft} />
            <Text style={styles.quoteText}>
              {sentence.text}
            </Text>
            <MaterialIcons name="format-quote" size={48} color="rgba(23, 84, 207, 0.2)" style={styles.quoteIconRight} />
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineContainer}>
          {/* Timeline Line */}
          <View style={styles.timelineLine} />

          {/* Timeline Events */}
          {TIMELINE_EVENTS.map((event, index) => (
            <View key={event.id} style={styles.timelineRow}>
              {/* Timeline Node */}
              <View style={styles.timelineNodeContainer}>
                <View style={styles.timelineNode}>
                  <MaterialIcons name={event.icon as any} size={16} color="#64748b" />
                </View>
              </View>

              {/* Event Card */}
              <View style={styles.eventCardContainer}>
                {/* Pointer Arrow */}
                <View style={styles.eventCardPointer} />
                
                <View style={styles.eventCard}>
                  <Text style={styles.eventContent}>{event.content}</Text>
                  
                  <View style={styles.eventFooter}>
                    <Text style={styles.eventDate}>{event.date}</Text>
                    <View style={styles.eventDot} />
                    <Text style={styles.eventDate}>{event.time}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}

          {/* End Node */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineNodeContainer}>
              <View style={styles.timelineEndNode}>
                <MaterialIcons name="edit-note" size={18} color="#1754cf" />
              </View>
            </View>

            <View style={styles.eventCardContainer}>
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>Your thoughts continue here...</Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Fixed Bottom Input */}
      <View style={[styles.bottomInputContainer, { paddingBottom: insets.bottom || 24 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Add a thought..."
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity style={styles.sendButton} activeOpacity={0.8}>
            <MaterialIcons name="send" size={18} color="#ffffff" style={{ transform: [{ rotate: '-45deg' }, { translateX: 2 }, { translateY: -2 }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'rgba(246, 246, 248, 0.9)',
    zIndex: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 2,
    marginBottom: 16,
  },
  quoteWrapper: {
    paddingHorizontal: 16,
    position: 'relative',
    maxWidth: width * 0.85,
  },
  quoteIconLeft: {
    position: 'absolute',
    top: -32,
    left: -16,
  },
  quoteIconRight: {
    position: 'absolute',
    bottom: -32,
    right: -16,
    transform: [{ rotate: '180deg' }],
  },
  quoteText: {
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '500',
    color: '#1e293b',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  timelineContainer: {
    paddingHorizontal: 16,
    paddingTop: 32,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    top: 32,
    bottom: 0,
    left: 16 + 23, // container padding + relative center of icon col
    width: 2,
    backgroundColor: '#e2e8f0',
    zIndex: -1,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineNodeContainer: {
    width: 48,
    alignItems: 'center',
    paddingTop: 8,
  },
  timelineNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#f6f6f8',
  },
  timelineEndNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(23, 84, 207, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#f6f6f8',
  },
  eventCardContainer: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 32,
    paddingTop: 8,
    position: 'relative',
  },
  eventCardPointer: {
    position: 'absolute',
    top: 24,
    left: 9,
    width: 14,
    height: 14,
    backgroundColor: '#ffffff',
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  eventContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1e293b',
    fontWeight: '500',
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  eventDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
  },
  emptyCard: {
    height: 96,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  bottomInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f6f6f8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#0f172a',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1754cf',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#1754cf',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  }
});
