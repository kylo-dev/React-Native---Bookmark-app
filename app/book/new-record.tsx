import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function NewRecordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="close" size={24} color="#0f172a" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>New Record</Text>
        
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.7}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        {/* Book Info Card */}
        <View style={styles.bookInfoCard}>
          <View style={styles.thumbnailWrapper}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs4kV2WT8u8ThnSzJbZBqv7YySGBabsumipKS1XIn6aJWv8iu3lNS1xV5hf0vUJw07wJEhWUzRYtVbFfDUDzJ5PMai4NS5Ydaz2NYe8KW51eLDiCMaFRUpCYCZifeDB-zKTUdbynkVUHHtlE2JyMQZcf75VOW18iRnR_QUhJf1WB7aJXvbesdBwAxOociYzOKjV24ZzC1DN2ZmSDRLLbt1jB5-FoF6-OtjF5qQxcpAxM_UkbaLiFi8JToIOj7GiaLP3YemSA8Fulg' }} 
              style={styles.thumbnail} 
            />
          </View>
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle} numberOfLines={1}>상실의 시대</Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>무라카미 하루키</Text>
          </View>
        </View>

        {/* Text Area */}
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Type a sentence you want to remember..."
            placeholderTextColor="#94a3b8"
            multiline
            autoFocus
            textAlignVertical="top"
          />
          <Text style={styles.todayText}>Today</Text>
        </View>

        {/* Page Number Input */}
        <View style={styles.pageInputContainer}>
          <MaterialIcons name="menu-book" size={18} color="#94a3b8" style={styles.pageIcon} />
          <TextInput
            style={styles.pageInput}
            placeholder="Page number (optional)"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Bottom Tool Bar */}
      <View style={[styles.bottomToolbar, { paddingBottom: insets.bottom || 24 }]}>
        <TouchableOpacity style={styles.scanBtn} activeOpacity={0.8}>
          <MaterialIcons name="document-scanner" size={20} color="#306ee8" />
          <Text style={styles.scanBtnText}>Scan Text</Text>
        </TouchableOpacity>

        <View style={styles.toolbarIcons}>
          <TouchableOpacity style={styles.toolbarIconBtn}>
            <MaterialIcons name="format-quote" size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarIconBtn}>
            <MaterialIcons name="tag" size={20} color="#64748b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarIconBtn}>
            <MaterialIcons name="mic" size={20} color="#64748b" />
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0)', // Transparent by default or update if scrolling
    zIndex: 20,
    backgroundColor: '#f6f6f8',
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
    position: 'absolute',
    left: width / 2 - 50,
    textAlign: 'center',
    width: 100,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    color: '#306ee8',
    fontSize: 14,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    padding: 24,
  },
  bookInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  thumbnailWrapper: {
    width: 40,
    height: 56,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  bookDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  bookAuthor: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  textAreaContainer: {
    flex: 1,
    position: 'relative',
  },
  textArea: {
    flex: 1,
    fontSize: 18,
    lineHeight: 28,
    color: '#1e293b',
    fontStyle: 'italic',
  },
  todayText: {
    position: 'absolute',
    bottom: 16,
    right: 0,
    fontSize: 12,
    color: '#94a3b8',
  },
  pageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  pageIcon: {
    marginTop: 2,
  },
  pageInput: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    padding: 0,
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#f6f6f8',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  scanBtnText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '500',
  },
  toolbarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolbarIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
