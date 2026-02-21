import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.emptyStateContainer}>
        <MaterialIcons name="bar-chart" size={64} color="#cbd5e1" />
        <Text style={styles.emptyStateTitle}>아직 통계 데이터가 없습니다</Text>
        <Text style={styles.emptyStateDesc}>
          더 많은 책을 읽고 기록을 남겨 나만의 독서 통계를 확인해보세요!
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
