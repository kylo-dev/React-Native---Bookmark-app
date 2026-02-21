import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const SENTENCES = [
  {
    id: '1',
    text: '"Only the dead stay seventeen forever. The rest of us keep getting older."',
    date: '2023.10.27',
    commentsCount: 3,
  },
  {
    id: '2',
    text: '"If you only read the books that everyone else is reading, you can only think what everyone else is thinking."',
    date: '2023.10.15',
    commentsCount: 1,
  },
  {
    id: '3',
    text: '"Don\'t feel sorry for yourself. Only assholes do that."',
    date: '2023.09.22',
    commentsCount: 5,
  },
  {
    id: '4',
    text: '"What happens when people open their hearts? They get better."',
    date: '2023.09.10',
    commentsCount: 0,
  }
];

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="more-horiz" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.coverShadow}>
            <View style={styles.coverWrapper}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs4kV2WT8u8ThnSzJbZBqv7YySGBabsumipKS1XIn6aJWv8iu3lNS1xV5hf0vUJw07wJEhWUzRYtVbFfDUDzJ5PMai4NS5Ydaz2NYe8KW51eLDiCMaFRUpCYCZifeDB-zKTUdbynkVUHHtlE2JyMQZcf75VOW18iRnR_QUhJf1WB7aJXvbesdBwAxOociYzOKjV24ZzC1DN2ZmSDRLLbt1jB5-FoF6-OtjF5qQxcpAxM_UkbaLiFi8JToIOj7GiaLP3YemSA8Fulg' }} 
                style={styles.coverImage} 
              />
              <View style={styles.coverGradient} />
            </View>
          </View>
          
          <Text style={styles.title}>상실의 시대</Text>
          <Text style={styles.author}>무라카미 하루키</Text>
          
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Reading</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Section Title */}
        <View style={styles.sentencesHeader}>
          <Text style={styles.sentencesTitle}>Memorable Sentences</Text>
          <Text style={styles.sentencesCount}>Total {SENTENCES.length}</Text>
        </View>

        {/* Sentences List */}
        <View style={styles.sentencesList}>
          {SENTENCES.map((sentence) => (
            <TouchableOpacity key={sentence.id} style={styles.sentenceCard} activeOpacity={0.9}>
              <Text style={styles.sentenceText} numberOfLines={3}>
                {sentence.text}
              </Text>
              
              <View style={styles.sentenceFooter}>
                <Text style={styles.dateText}>{sentence.date}</Text>
                
                <View style={styles.commentBadge}>
                  <MaterialIcons name="chat-bubble-outline" size={16} color="#94a3b8" />
                  <Text style={styles.commentCount}>{sentence.commentsCount}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          {/* Spacer for bottom action button */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View style={[styles.bottomActionContainer, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity 
          style={styles.recordButton} 
          activeOpacity={0.8}
          onPress={() => router.push('/book/new-record')}
        >
          <MaterialIcons name="edit-note" size={24} color="#ffffff" />
          <Text style={styles.recordButtonText}>Record New Sentence</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingVertical: 12,
    zIndex: 20,
    backgroundColor: '#f6f6f8',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  coverShadow: {
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  coverWrapper: {
    width: 160,
    height: 240,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(48, 110, 232, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(48, 110, 232, 0.2)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#306ee8',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#306ee8',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  sentencesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sentencesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sentencesCount: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  sentencesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sentenceCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sentenceText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  sentenceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCount: {
    fontSize: 12,
    color: '#94a3b8',
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(246, 246, 248, 0.95)',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: '#306ee8',
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#306ee8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  recordButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
