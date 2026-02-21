import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function LogScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.emptyStateContainer}>
        <MaterialIcons name="history" size={64} color="#cbd5e1" />
        <Text style={styles.emptyStateTitle}>아직 활동 기록이 없습니다</Text>
        <Text style={styles.emptyStateDesc}>
          책을 읽고 문장을 남기면 이곳에 활동이 기록됩니다.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f6f6f8'
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});
