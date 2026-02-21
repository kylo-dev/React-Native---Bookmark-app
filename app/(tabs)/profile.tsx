import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [editName, setEditName] = useState('Guest User');
  const [editEmail, setEditEmail] = useState('user@example.com');

  const handleLinkPress = (title: string) => {
    Alert.alert(title, `This will open the ${title} page in a web browser. (Dummy)`);
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'This will open the email client to contact support. (Dummy)');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account and all associated data? This action cannot be undone. (Required by Apple App Store)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deleted', 'Your data has been cleared. (Dummy)') }
      ]
    );
  };

  const handleSaveProfile = () => {
    setIsEditProfileVisible(false);
    Alert.alert('Profile Saved', '(Dummy)');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => Alert.alert('Logged out! (Dummy)') }
    ]);
  };

  const MenuItem = ({ icon, title, onPress, color = '#0f172a', showArrow = true }: { icon: any, title: string, onPress: () => void, color?: string, showArrow?: boolean }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.menuItemText, { color }]}>{title}</Text>
      </View>
      {showArrow && <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userInfoCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>G</Text>
          </View>
          <View style={styles.userInfoText}>
            <Text style={styles.userName}>{editName}</Text>
            <Text style={styles.userEmail}>{editEmail}</Text>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => setIsEditProfileVisible(true)}>
            <Text style={styles.editProfileText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Support & Legal (Required for App Stores) */}
        <Text style={styles.sectionTitle}>Information & Legal</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="mail-outline" title="Contact Support" onPress={handleContactSupport} />
          <View style={styles.divider} />
          <MenuItem icon="privacy-tip" title="Privacy Policy" onPress={() => handleLinkPress('Privacy Policy')} />
          <View style={styles.divider} />
          <MenuItem icon="description" title="Terms of Service" onPress={() => handleLinkPress('Terms of Service')} />
        </View>

        {/* Account Actions */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="logout" title="Log Out" onPress={handleLogout} color="#e3342f" showArrow={false} />
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Bookmark App v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={isEditProfileVisible}
        onRequestClose={() => setIsEditProfileVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === 'ios' ? 0 : insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditProfileVisible(false)} style={styles.modalHeaderBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} style={styles.modalHeaderBtn}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.editAvatarContainer}>
              <View style={[styles.avatar, styles.editAvatar]}>
                <Text style={styles.avatarText}>{editName.charAt(0)}</Text>
              </View>
              <TouchableOpacity style={styles.changePhotoBtn}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
              <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleDeleteAccount} activeOpacity={0.7}>
                <MaterialIcons name="delete-forever" size={20} color="#e3342f" />
                <Text style={styles.deleteAccountText}>Delete Account</Text>
              </TouchableOpacity>
              <Text style={styles.dangerZoneDesc}>Permanently delete your account and all data. This cannot be recovered.</Text>
            </View>
          </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#f6f6f8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#306ee8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfoText: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  editProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  editProfileText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginLeft: 64,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  versionText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f6f6f8',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalHeaderBtn: {
    minWidth: 60,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#306ee8',
    textAlign: 'right',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  editAvatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  editAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  changePhotoBtn: {
    paddingVertical: 4,
  },
  changePhotoText: {
    color: '#306ee8',
    fontWeight: '600',
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0f172a',
  },
  dangerZone: {
    marginTop: 40,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    padding: 16,
  },
  dangerZoneTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ef4444',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteAccountText: {
    color: '#e3342f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerZoneDesc: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.8,
  }
});
