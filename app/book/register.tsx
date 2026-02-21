import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { BOOKS } from '../../constants/dummy';

export default function RegisterBookScreen() {
  const router = useRouter();
  const { bookId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  
  const existingBook = bookId ? BOOKS.find(b => b.id === bookId) : null;
  const isEditMode = !!existingBook;

  const [title, setTitle] = useState(existingBook?.title || '');
  const [author, setAuthor] = useState(existingBook?.author || '');
  const [coverImage, setCoverImage] = useState<string | null>(existingBook?.coverUrl || null);

  const handleImageSelection = async (type: 'camera' | 'gallery') => {
    try {
      let result;
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera permission is needed to take a photo.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [2, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Gallery permission is needed to select a photo.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [2, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick an image.');
      console.log(error);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Upload Cover',
      'Choose image source',
      [
        { text: 'Take Photo', onPress: () => handleImageSelection('camera') },
        { text: 'Choose from Gallery', onPress: () => handleImageSelection('gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert('Required Fields', 'Please enter both book title and author.');
      return;
    }
    Alert.alert('Success', isEditMode ? 'Book updated! (Dummy)' : 'Book registered! (Dummy)', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: (insets?.top ?? 0) + 16 }]}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#475569" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Book Info' : 'Manual Entry'}</Text>
        
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 150 }]} // Space for bottom button
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          
          {/* Cover Image Upload Area */}
          <View style={styles.coverUploadSection}>
            <TouchableOpacity style={styles.coverUploadBox} activeOpacity={0.8} onPress={showImageOptions}>
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
              ) : (
                <>
                  <MaterialIcons name="add-a-photo" size={32} color="#94a3b8" />
                  <Text style={styles.coverUploadText}>Upload Cover</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.coverUploadHint}>Tap to {isEditMode ? 'change' : 'add'} a book cover image</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            
            {/* Book Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Book Title</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="e.g. The Midnight Library"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Author */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Author</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="e.g. Matt Haig"
                value={author}
                onChangeText={setAuthor}
              />
            </View>

            {/* Status */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              {/* Simulated Select Dropdown */}
              <TouchableOpacity style={styles.selectInput} activeOpacity={0.8}>
                <Text style={styles.selectText}>{existingBook?.status || 'Reading'}</Text>
                <MaterialIcons name="expand-more" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Initial Thoughts */}
            <View style={[styles.inputGroup, { marginTop: 8 }]}>
              <Text style={styles.label}>Initial Thoughts (Optional)</Text>
              <TextInput 
                style={[styles.textInput, styles.textArea]}
                placeholder="Why do you want to read this?"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

          </View>

        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { paddingBottom: (insets?.bottom ?? 0) || 24 }]}>
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={handleSave}>
          <MaterialIcons name="save" size={20} color="#ffffff" />
          <Text style={styles.saveButtonText}>{isEditMode ? 'Save Changes' : 'Save to Library'}</Text>
        </TouchableOpacity>
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
    backgroundColor: '#f6f6f8',
    zIndex: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  content: {
    paddingHorizontal: 24,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  coverUploadSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  coverUploadBox: {
    width: 160,
    height: 240,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  coverUploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 8,
  },
  coverUploadHint: {
    fontSize: 12,
    color: '#64748b',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectText: {
    fontSize: 16,
    color: '#0f172a',
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(246, 246, 248, 0.95)',
    paddingHorizontal: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#306ee8',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#306ee8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  }
});
