import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const COLUMN_GAP = 16;
const PADDING_HORIZONTAL = 16;
const CARD_WIDTH = (width - PADDING_HORIZONTAL * 2 - COLUMN_GAP) / 2;

const FILTER_OPTIONS = ['All Books', 'Reading', 'To Read', 'Finished'];

const BOOKS = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    quotesCount: 12,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ40Z93YCVi1sWLknpXID6yLtSPGVpzynpzCqp8UxHPTPsLSJZGecX8U7NtPLsF3GSUrfP-L_oqm_8oyvIIDhC3s09-HOKUtcGTe5g6h-PEZfIJly1asiCMRdp_kNjC3XOQyKjT5il-QxMT7duOocr0AZa6TYOFAHXXGHYD6l993mB76-DmE6umls-rmhNJvZ3w-WzCzNHj33yzDVmJcMXOZ-yRnJBhFUO2R6rNesJECxcg9ifbSPpv_noJPEhwR4iMVIVALJuRXI',
    hasFavorite: true,
  },
  {
    id: '2',
    title: 'Cloud Cuckoo Land',
    author: 'Anthony Doerr',
    quotesCount: 8,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwlb9iIlKddOq9UfhALOyraN0OKHRoQUxfUpNgtsnVvpnW4WEdwAEAz4eLGNHUeFPM80W5_SfkTALcDMYxsja63S4eetzlRyHde0TaaL-UYffd9vUTDtdqQl0O01gI3Q7K5_tmAyvoDA0xulqzOwHHmpcxpKaiYJR8KTDZ-U93-XOD7ERgGD_qDTML83rM-321gNbxCuETQLOitSQjaFzwqSuHOQOXEd84xyxITPQ6tySDSwLBhtVoM42f8lB5jeIl1EyZ6DP7mKw',
    hasFavorite: false,
  },
  {
    id: '3',
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    quotesCount: 24,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWFJdEf65HU0_Lp__bjqXRUUYxal8dyjqjNh1Sj5fnpTLFyU2U63mpt7vNKkc8p6Relae2zJzNKOov4iTrW5wx5j6ShLhgZMKVc7-OXuuwpANMT-ia0_1g7HAj4pVKq1WFEhGwUiHeFb-nFNzLyfPqel7AGwO0gJagq16DDQzf3nWQtEHV6Ywb4-FR3l4V5LZ2qBe5T-q5JJfcfv323n-vq58bNxvFuPRM-eW2iUzUUQH2jbb6k-R7TUodpJnEHH2b5CXugzvoxGU',
    hasFavorite: true,
  },
  {
    id: '4',
    title: 'Klara and the Sun',
    author: 'Kazuo Ishiguro',
    quotesCount: 15,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGVrm0XaslsCVhmNYH4-Cythv_tO-1dLhlzDgkPx2JhJPxy2jPSFgKE2i1bNDOFF59gLmZvE1t6q-eGuaESY8MClBd3Wcp7XFJwHPHI4cZM2JoDprZAQH4ZVZCZHQX_BoxysusZxZL34F90gYd2OIN0Bl6CQxKZwH1Lm3u4zyjaEpXb1ggDqSxAdaGCuirwh2Hkj3hR4hL2L9bEoF35RUunlXbi1p8m9CIw7VyWHbo29j3eoe4v9X-vZ5SV8iDOitrg_7RTpWK2XI',
    hasFavorite: false,
  },
  {
    id: '5',
    title: 'The Song of Achilles',
    author: 'Madeline Miller',
    quotesCount: 31,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAEU3fLK2pAfa4eeEH0kLBGBFVsVnvVNq-n8F_Ilrrs-dA15zW3PABEy8-A2VaC_xh0Hv6rbt8aShI6m18jcBSV8w23Qkd8cgvCqLv_DWT-fPF8yqEuzRyGKAcYWhnUJvv459d7zPvP5XjDE6AUbMNUf1fqP7UsZdSyB9FwaMS9KIlYYuhYYyfy_mmaXMWnQ3v13GtctWzt2sjFdjt2pBZ_r0sDtgwbWFeMxUnEBsxHUR9yagOPwgr8eahbFXjaFvyLj4KGfjeqno',
    hasFavorite: false,
  },
  {
    id: '6',
    title: 'Circe',
    author: 'Madeline Miller',
    quotesCount: 5,
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnvBEFq-96f-eaeobaD6fMvJdUDqa4OXwby3vmEP6kUM06RdteJsIo2v6sJrPGoGkKiJCiQ6QqqTHoG9JhpZO0gOcqMZuPhK1wxK7exepWhOQvWm4Rzcx9aiduPELiI7ii7PtaHV9KG--A1Aq60vn5aPV5eZ6iADS4mjZMQrQSbjyD9iez-C9QlthOT3Hg_sYfvUKWm-QmBO8HuaHjq4Qsmb_PBY1hpnjR3xBEM5Szv03aSiLRNjoaFHmjSdW5LVm4FzMQcXu56-g',
    hasFavorite: false,
  }
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All Books');

  const renderBookItem = ({ item }: { item: typeof BOOKS[0] }) => (
    <View style={styles.cardContainer}>
      <View style={styles.coverWrapper}>
        <Image style={styles.coverImage} source={{ uri: item.coverUrl }} />
        <View style={styles.coverGradient} />
        {item.hasFavorite && (
          <View style={styles.favoriteBadge}>
            <MaterialIcons name="favorite" size={16} color="#306ee8" />
          </View>
        )}
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardAuthor} numberOfLines={1}>{item.author}</Text>
        
        <View style={[styles.quoteBadge, item.quotesCount >= 10 && styles.quoteBadgeActive]}>
          <MaterialIcons 
            name="format-quote" 
            size={14} 
            color={item.quotesCount >= 10 ? '#306ee8' : '#64748b'} 
          />
          <Text style={[styles.quoteText, item.quotesCount >= 10 && styles.quoteTextActive]}>
            {item.quotesCount} quotes
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>WELCOME BACK</Text>
          <Text style={styles.headerTitle}>My Library</Text>
        </View>
        <TouchableOpacity style={styles.searchBtn}>
          <MaterialIcons name="search" size={24} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.main}>
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollConfig}
            style={styles.filterScroll}
          >
            {FILTER_OPTIONS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity 
                  key={filter}
                  style={[styles.filterItem, isActive && styles.filterItemActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          data={BOOKS}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridParams}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.5)',
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#306ee8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    flex: 1,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 20,
  },
  filterScrollConfig: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 12,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  filterItemActive: {
    backgroundColor: '#306ee8',
    shadowColor: '#306ee8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  gridParams: {
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 100, // space for fab
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  coverWrapper: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5, // Aspect ratio 2/3
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardInfo: {
    paddingHorizontal: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardAuthor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  quoteBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e2e8f0',
    gap: 4,
  },
  quoteBadgeActive: {
    backgroundColor: 'rgba(48, 110, 232, 0.1)',
  },
  quoteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  quoteTextActive: {
    color: '#306ee8',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#306ee8',
    justifyContent: 'center',
    alignItems: 'center',
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
  }
});
