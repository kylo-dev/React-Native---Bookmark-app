import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Platform, Dimensions, Alert, Keyboard, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BOOKS } from '../../constants/dummy';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function NewRecordScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const book = BOOKS.find(b => b.id === bookId) || BOOKS[0];
  const [text, setText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [isTagging, setIsTagging] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSave = () => {
    if (!text.trim()) {
      Alert.alert('Required', 'Please enter a sentence to remember.');
      return;
    }
    const tagString = tags.length > 0 ? `\nTags: ${tags.map(t => '#' + t).join(', ')}` : '';
    Alert.alert('Success', `Sentence recorded! (Dummy)${tagString}`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
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
        
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.7} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 24, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Book Info Card */}
        <View style={styles.bookInfoCard}>
          <View style={styles.thumbnailWrapper}>
            <Image 
              source={{ uri: book.coverUrl }} 
              style={styles.thumbnail} 
            />
          </View>
          <View style={styles.bookDetails}>
            <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
          </View>
        </View>

        {/* Text Area */}
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Type a sentence you want to remember..."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            value={text}
            onChangeText={setText}
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
            maxLength={4}
          />
        </View>

        {/* Tags List */}
        {(tags.length > 0 || isTagging) && (
          <View style={styles.tagsWrapper}>
            {tags.map((t, i) => (
              <View key={i} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{t}</Text>
                <TouchableOpacity onPress={() => setTags(tags.filter((_, index) => index !== i))}>
                  <MaterialIcons name="close" size={14} color="#64748b" />
                </TouchableOpacity>
              </View>
            ))}
            {isTagging && (
              <TextInput
                style={styles.tagInput}
                placeholder="tag..."
                placeholderTextColor="#94a3b8"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={() => {
                  if (tagInput.trim()) {
                    setTags([...tags, tagInput.trim()]);
                    setTagInput('');
                  } else {
                    setIsTagging(false);
                  }
                }}
                autoFocus
                returnKeyType="done"
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Tool Bar */}
      <View style={[styles.bottomToolbar, { paddingBottom: keyboardHeight > 0 ? 12 : (insets.bottom || 24) }]}>
        <TouchableOpacity style={styles.scanBtn} activeOpacity={0.8}>
          <MaterialIcons name="document-scanner" size={20} color="#306ee8" />
          <Text style={styles.scanBtnText}>Scan Text</Text>
        </TouchableOpacity>

        <View style={styles.toolbarIcons}>
          <TouchableOpacity 
            style={[styles.toolbarIconBtn, isTagging && { backgroundColor: '#e2e8f0' }]}
            onPress={() => setIsTagging(!isTagging)}
          >
            <MaterialIcons name="tag" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
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
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '500',
  },
  tagInput: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 14,
    minWidth: 80,
    color: '#0f172a',
  }
});
