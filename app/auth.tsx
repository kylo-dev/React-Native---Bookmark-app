import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { signInWithEmail, signUpWithEmail } from '@/lib/auth';

type Mode = 'login' | 'signup';

export default function AuthScreen() {
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const isLogin = mode === 'login';

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('입력 오류', '이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!isLogin && password.length < 6) {
            Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await signInWithEmail(email, password);
                if (error) {
                    Alert.alert('로그인 실패', error.message);
                }
            } else {
                const { error } = await signUpWithEmail(email, password);
                if (error) {
                    Alert.alert('회원가입 실패', error.message);
                } else {
                    Alert.alert('회원가입 완료', '이메일 인증 후 로그인해주세요.', [
                        { text: '확인', onPress: () => setMode('login') },
                    ]);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setMode(isLogin ? 'signup' : 'login');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Branding */}
                    <View style={styles.brandingSection}>
                        <View style={styles.logoContainer}>
                            <MaterialIcons name="menu-book" size={40} color="#ffffff" />
                        </View>
                        <Text style={styles.appName}>Bookmark</Text>
                        <Text style={styles.appDesc}>나만의 독서 기록을 시작하세요</Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>{isLogin ? '로그인' : '회원가입'}</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>이메일</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="email@example.com"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>비밀번호</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialIcons name="lock-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder="6자 이상 입력"
                                    placeholderTextColor="#94a3b8"
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    <MaterialIcons
                                        name={showPassword ? 'visibility' : 'visibility-off'}
                                        size={20}
                                        color="#94a3b8"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {!isLogin && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>비밀번호 확인</Text>
                                <View style={styles.inputWrapper}>
                                    <MaterialIcons
                                        name="lock-outline"
                                        size={20}
                                        color="#94a3b8"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        placeholder="비밀번호를 다시 입력"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry={!showPassword}
                                        autoCapitalize="none"
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                            onPress={handleSubmit}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.submitBtnText}>{isLogin ? '로그인' : '회원가입'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Switch Mode */}
                    <View style={styles.switchSection}>
                        <Text style={styles.switchText}>
                            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                        </Text>
                        <TouchableOpacity onPress={switchMode}>
                            <Text style={styles.switchLink}>{isLogin ? '회원가입' : '로그인'}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f6f8',
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    brandingSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: '#306ee8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        ...Platform.select({
            ios: {
                shadowColor: '#306ee8',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    appDesc: {
        fontSize: 15,
        color: '#64748b',
        marginTop: 6,
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: '#0f172a',
    },
    eyeBtn: {
        padding: 4,
    },
    submitBtn: {
        backgroundColor: '#306ee8',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#306ee8',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    submitBtnDisabled: {
        opacity: 0.7,
    },
    submitBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    switchSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        gap: 6,
    },
    switchText: {
        fontSize: 14,
        color: '#64748b',
    },
    switchLink: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#306ee8',
    },
});
