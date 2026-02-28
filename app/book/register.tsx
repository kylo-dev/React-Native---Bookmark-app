import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
    ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetBackdrop,
    type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { apiBooks } from '../../features/book/api/api';
import { uploadBookCover } from '@/lib/storage';
import {
    BOOK_STATUS_OPTIONS,
    getStatusLabel,
    getStatusOptionsForCreate,
} from '@/constants/book-status';

export default function RegisterBookScreen() {
    const router = useRouter();
    const { bookId } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const bookIdStr = Array.isArray(bookId) ? bookId[0] : bookId;
    const isEditMode = !!bookIdStr;

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [status, setStatus] = useState<any>('TO_READ');

    useEffect(() => {
        if (isEditMode && bookIdStr) {
            apiBooks
                .getBookById(Number(bookIdStr))
                .then((data) => {
                    setTitle(data.title);
                    setAuthor(data.author);
                    setCoverImage(data.cover_url || null);
                    setStatus(data.status);
                })
                .catch((e) => console.error('Fetch book for edit failed:', e));
        }
    }, [bookIdStr, isEditMode]);

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

    const [saving, setSaving] = useState(false);
    const imageSheetRef = useRef<BottomSheetModal>(null);
    const statusSheetRef = useRef<BottomSheetModal>(null);

    const IMAGE_OPTIONS: { type: 'camera' | 'gallery'; label: string }[] = [
        { type: 'camera', label: '사진 촬영' },
        { type: 'gallery', label: '갤러리에서 선택' },
    ];

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop {...props} disappearsOnIndex={-1} opacity={0.5} pressBehavior="close" />
        ),
        [],
    );

    const showImageOptions = () => imageSheetRef.current?.present();

    const statusOptionsToShow = isEditMode ? BOOK_STATUS_OPTIONS : getStatusOptionsForCreate();

    const handleSave = async () => {
        if (!title.trim() || !author.trim()) {
            Alert.alert('필수 입력', '책 제목과 저자를 모두 입력해주세요.');
            return;
        }

        setSaving(true);
        try {
            let finalCoverUrl: string | null = null;

            if (coverImage) {
                const isExistingUrl = coverImage.startsWith('http://') || coverImage.startsWith('https://');
                if (isExistingUrl) {
                    finalCoverUrl = coverImage;
                } else {
                    const uploadedUrl = await uploadBookCover(coverImage);
                    if (!uploadedUrl) {
                        Alert.alert('오류', '이미지 업로드에 실패했습니다.');
                        return;
                    }
                    finalCoverUrl = uploadedUrl;
                }
            }

            const payload = {
                title: title.trim(),
                author: author.trim(),
                cover_url: finalCoverUrl,
                status: status,
            };

            if (isEditMode) {
                await apiBooks.updateBook(Number(bookIdStr), payload);
                Alert.alert('성공', '책 정보가 업데이트되었습니다.', [{ text: 'OK', onPress: () => router.back() }]);
            } else {
                await apiBooks.createBook(payload);
                Alert.alert('성공', '책 정보가 등록되었습니다.', [{ text: 'OK', onPress: () => router.back() }]);
            }
        } catch (e) {
            console.error('Save failed:', e);
            Alert.alert('오류', '책 정보 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const showStatusOptions = () => statusSheetRef.current?.present();

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: (insets?.top ?? 0) + 16 }]}>
                <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
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
                                <Image
                                    source={{ uri: coverImage }}
                                    style={{ width: '100%', height: '100%', borderRadius: 10 }}
                                />
                            ) : (
                                <>
                                    <MaterialIcons name="add-a-photo" size={32} color="#94a3b8" />
                                    <Text style={styles.coverUploadText}>Upload Cover</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.coverUploadHint}>
                            Tap to {isEditMode ? 'change' : 'add'} a book cover image
                        </Text>
                    </View>

                    {/* Image Options Bottom Sheet */}
                    <BottomSheetModal ref={imageSheetRef} enableDynamicSizing backdropComponent={renderBackdrop}>
                        <BottomSheetView
                            style={[styles.bottomSheetContent, { paddingBottom: (insets?.bottom ?? 0) + 32 }]}
                        >
                            <View style={styles.bottomSheetHeader}>
                                <Text style={styles.bottomSheetTitle}>커버 업로드</Text>
                                <TouchableOpacity
                                    onPress={() => imageSheetRef.current?.dismiss()}
                                    style={styles.bottomSheetCloseBtn}
                                >
                                    <MaterialIcons name="close" size={24} color="#0f172a" />
                                </TouchableOpacity>
                            </View>
                            {IMAGE_OPTIONS.map((opt) => (
                                <TouchableOpacity
                                    key={opt.type}
                                    style={styles.bottomSheetOption}
                                    onPress={() => {
                                        imageSheetRef.current?.dismiss();
                                        handleImageSelection(opt.type);
                                    }}
                                >
                                    <Text style={styles.bottomSheetOptionText}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </BottomSheetView>
                    </BottomSheetModal>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Book Title */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>책 제목</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. The Midnight Library"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        {/* Author */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>저자</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="e.g. Matt Haig"
                                value={author}
                                onChangeText={setAuthor}
                            />
                        </View>

                        {/* Status */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>상태</Text>
                            {/* Simulated Select Dropdown */}
                            <TouchableOpacity
                                style={styles.selectInput}
                                activeOpacity={0.8}
                                onPress={showStatusOptions}
                            >
                                <Text style={styles.selectText}>
                                    {getStatusLabel(status)}
                                </Text>
                                <MaterialIcons name="expand-more" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        {/* Status Bottom Sheet */}
                        <BottomSheetModal ref={statusSheetRef} enableDynamicSizing backdropComponent={renderBackdrop}>
                            <BottomSheetView
                                style={[styles.bottomSheetContent, { paddingBottom: (insets?.bottom ?? 0) + 32 }]}
                            >
                                <View style={styles.bottomSheetHeader}>
                                    <Text style={styles.bottomSheetTitle}>상태 선택</Text>
                                    <TouchableOpacity
                                        onPress={() => statusSheetRef.current?.dismiss()}
                                        style={styles.bottomSheetCloseBtn}
                                    >
                                        <MaterialIcons name="close" size={24} color="#0f172a" />
                                    </TouchableOpacity>
                                </View>
                                {statusOptionsToShow.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[
                                            styles.bottomSheetOption,
                                            status === opt.value && styles.bottomSheetOptionActive,
                                        ]}
                                        onPress={() => {
                                            setStatus(opt.value);
                                            statusSheetRef.current?.dismiss();
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.bottomSheetOptionText,
                                                status === opt.value && styles.bottomSheetOptionTextActive,
                                            ]}
                                        >
                                            {opt.label}
                                        </Text>
                                        {status === opt.value && (
                                            <MaterialIcons name="check" size={20} color="#306ee8" />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </BottomSheetView>
                        </BottomSheetModal>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.bottomContainer, { paddingBottom: (insets?.bottom ?? 0) || 24 }]}>
                <TouchableOpacity
                    style={[styles.saveButton, saving && { opacity: 0.7 }]}
                    activeOpacity={0.8}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <>
                            <MaterialIcons name="save" size={20} color="#ffffff" />
                            <Text style={styles.saveButtonText}>{isEditMode ? 'Save Changes' : 'Save to Library'}</Text>
                        </>
                    )}
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
    },
    bottomSheetContent: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    bottomSheetTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
    },
    bottomSheetCloseBtn: {
        padding: 4,
    },
    bottomSheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 4,
    },
    bottomSheetOptionActive: {
        backgroundColor: 'rgba(48, 110, 232, 0.1)',
    },
    bottomSheetOptionText: {
        fontSize: 16,
        color: '#475569',
    },
    bottomSheetOptionTextActive: {
        color: '#306ee8',
        fontWeight: '600',
    },
});
