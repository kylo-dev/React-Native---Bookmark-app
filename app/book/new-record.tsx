import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Image,
    TouchableOpacity,
    Platform,
    Dimensions,
    Alert,
    Keyboard,
    ScrollView,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiBooks } from '../../features/book/api/api';
import { apiQuotes } from '../../features/quote/api/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function NewRecordScreen() {
    const router = useRouter();
    const { bookId } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const bookIdStr = Array.isArray(bookId) ? bookId[0] : (bookId as string);

    const [book, setBook] = useState<any>(null);
    const [text, setText] = useState('');
    const [pageNumber, setPageNumber] = useState('');
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [isOcrModalVisible, setIsOcrModalVisible] = useState(false);
    const [scannedFullText, setScannedFullText] = useState('');

    useEffect(() => {
        if (bookIdStr) {
            apiBooks
                .getBookById(Number(bookIdStr))
                .then((data) => setBook(data))
                .catch((e) => console.error('Failed to fetch book', e));
        }
    }, [bookIdStr]);

    const handleScanText = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Camera permission is needed to scan text.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
            });

            if (!result.canceled) {
                setIsScanning(true);
                // Simulate OCR API network delay (Expo Go Sandbox Friendly)
                setTimeout(() => {
                    setIsScanning(false);
                    const scannedText =
                        'This is a dummy text extracted via OCR.\n\n[Dummy Data]\nThe eternal return is a mysterious idea, and Nietzsche has often perplexed other philosophers with it. He is to be understood as having proposed that all things recur eternally exactly as they have before.\n\nPlease select and copy the sentences you want to remember from this full extracted text.';
                    setScannedFullText(scannedText);
                    setIsOcrModalVisible(true);
                }, 1500);
            }
        } catch (error) {
            setIsScanning(false);
            Alert.alert('Error', 'Failed to scan image for text.');
            console.log(error);
        }
    };

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

    const handleSave = async () => {
        if (!text.trim()) {
            Alert.alert('Required', 'Please enter a quote to remember.');
            return;
        }
        try {
            await apiQuotes.createQuote({
                book_id: Number(bookIdStr),
                text: text.trim(),
                page_number: pageNumber ? Number(pageNumber) : null,
                is_favorite: false,
            });
            Alert.alert('Success', `Quote recorded!`, [{ text: 'OK', onPress: () => router.back() }]);
        } catch (e) {
            console.error('Failed to save quote', e);
            Alert.alert('Error', 'Failed to save quote.');
        }
    };

    if (!book)
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Text>Loading...</Text>
            </View>
        );

    return (
        <View style={[styles.container, { paddingBottom: keyboardHeight }]}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                    <MaterialIcons name="close" size={24} color="#0f172a" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>New Quote</Text>

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
                        {book?.cover_url ? (
                            <Image
                                source={{ uri: book.cover_url }}
                                style={styles.thumbnail}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.thumbnailPlaceholder}>
                                <MaterialIcons name="menu-book" size={20} color="#94a3b8" />
                            </View>
                        )}
                    </View>
                    <View style={styles.bookDetails}>
                        <Text style={styles.bookTitle} numberOfLines={1}>
                            {book.title}
                        </Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>
                            {book.author}
                        </Text>
                    </View>
                </View>

                {/* Text Area */}
                <View style={styles.textAreaContainer}>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Type a quote you want to remember..."
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
                        value={pageNumber}
                        onChangeText={setPageNumber}
                    />
                </View>

            </ScrollView>

            {/* Bottom Tool Bar */}
            <View style={[styles.bottomToolbar, { paddingBottom: keyboardHeight > 0 ? 12 : insets.bottom || 24 }]}>
                <TouchableOpacity
                    style={styles.scanBtn}
                    activeOpacity={0.8}
                    onPress={handleScanText}
                    disabled={isScanning}
                >
                    {isScanning ? (
                        <ActivityIndicator size="small" color="#306ee8" />
                    ) : (
                        <MaterialIcons name="document-scanner" size={20} color="#306ee8" />
                    )}
                    <Text style={styles.scanBtnText}>{isScanning ? 'Scanning...' : 'Scan Text'}</Text>
                </TouchableOpacity>
            </View>

            {/* OCR Result Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isOcrModalVisible}
                onRequestClose={() => setIsOcrModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Scanned Text</Text>
                            <TouchableOpacity onPress={() => setIsOcrModalVisible(false)} style={styles.modalCloseBtn}>
                                <MaterialIcons name="close" size={24} color="#0f172a" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalNotice}>
                            <MaterialIcons name="info-outline" size={16} color="#306ee8" />
                            <Text style={styles.modalNoticeText}>Long press to select and copy the text you want.</Text>
                        </View>
                        <ScrollView style={styles.scannedTextContainer}>
                            <TextInput
                                style={styles.scannedText}
                                multiline={true}
                                editable={false}
                                value={scannedFullText}
                            />
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalDoneBtn}
                            activeOpacity={0.8}
                            onPress={() => setIsOcrModalVisible(false)}
                        >
                            <Text style={styles.modalDoneBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: '#e2e8f0',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        padding: 4,
    },
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e2e8f0',
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
        marginTop: 12,
        gap: 8,
    },
    pageIcon: {
        marginTop: 2,
    },
    pageInput: {
        flex: 1,
        fontSize: 14,
        color: '#334155',
        paddingVertical: 4,
        paddingHorizontal: 0,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    modalCloseBtn: {
        padding: 4,
    },
    modalNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 8,
    },
    modalNoticeText: {
        color: '#1e3a8a',
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    scannedTextContainer: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        maxHeight: 300,
        marginBottom: 24,
    },
    scannedText: {
        fontSize: 16,
        lineHeight: 26,
        color: '#334155',
    },
    modalDoneBtn: {
        backgroundColor: '#1754cf',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalDoneBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
