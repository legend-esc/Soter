import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { AidItem, fetchAidList, getMockAidList } from '../services/aidApi';
import { cacheAidList, loadCachedAidList, getCacheTimestamp } from '../services/aidCache';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OfflineBanner } from '../components/OfflineBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'AidOverview'>;

const STATUS_COLORS: Record<AidItem['status'], string> = {
  active: '#16A34A',
  pending: '#D97706',
  closed: '#6B7280',
};

export const AidOverviewScreen: React.FC<Props> = ({ navigation }) => {
  const [aidList, setAidList] = useState<AidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const fresh = await fetchAidList();
      setAidList(fresh);
      setIsCached(false);
      await cacheAidList(fresh);
      setCachedAt(null);
    } catch {
      // Network failed — try cache, then fall back to mock
      const cached = await loadCachedAidList();
      if (cached && cached.length > 0) {
        setAidList(cached);
        setIsCached(true);
        const ts = await getCacheTimestamp();
        setCachedAt(ts);
      } else {
        setAidList(getMockAidList());
        setIsCached(true);
        setCachedAt(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Sync when connectivity is restored
  const handleReconnect = useCallback(async () => {
    if (!isCached) return;
    setSyncing(true);
    await loadData(false);
    setSyncing(false);
  }, [isCached, loadData]);

  const { isConnected } = useNetworkStatus(handleReconnect);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderItem = ({ item }: { item: AidItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AidDetails', { aidId: item.id })}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${item.title}`}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <Text style={styles.cardLocation}>📍 {item.location}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0F172A" />
        <Text style={styles.loadingText}>Loading aid operations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <OfflineBanner visible={!isConnected} cachedAt={cachedAt} />

      {syncing && (
        <View style={styles.syncBanner}>
          <ActivityIndicator size="small" color="#1D4ED8" />
          <Text style={styles.syncText}>Syncing latest data...</Text>
        </View>
      )}

      <FlatList
        data={aidList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor="#0F172A"
          />
        }
        ListHeaderComponent={
          isCached && isConnected ? (
            <View style={styles.staleNotice}>
              <Text style={styles.staleText}>
                ⚠️ Showing cached data. Pull to refresh.
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No aid operations found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardLocation: {
    fontSize: 12,
    color: '#94A3B8',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  syncText: {
    fontSize: 13,
    color: '#1D4ED8',
  },
  staleNotice: {
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  staleText: {
    fontSize: 13,
    color: '#C2410C',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
  },
});
