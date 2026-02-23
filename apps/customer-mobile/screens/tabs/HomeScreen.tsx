import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, typography, shadows } from '../../utils/theme';
import { Restaurant, MainTabParamList } from '../../types/navigation';
import { restaurantsApi } from '../../api';
import { useLocationStore } from '../../store/auth';

type HomeScreenProps = {
  navigation: StackNavigationProp<MainTabParamList, 'Home'>;
};

const categories = [
  { id: '1', name: 'Mexican', icon: '🌮' },
  { id: '2', name: 'Pizza', icon: '🍕' },
  { id: '3', name: 'Breakfast', icon: '🍳' },
  { id: '4', name: 'Burgers', icon: '🍔' },
  { id: '5', name: 'Sushi', icon: '🍣' },
  { id: '6', name: 'Chinese', icon: '🥡' },
  { id: '7', name: 'Indian', icon: '🍛' },
  { id: '8', name: 'Thai', icon: '🍜' },
];

const orderAgainItems = [
  { id: '1', name: 'California Roll', restaurant: 'Sushi Palace', price: 12.99, image: '' },
  { id: '2', name: 'Breakfast Burrito', restaurant: 'Sunrise Cafe', price: 9.99, image: '' },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const currentLocation = useLocationStore((state) => state.currentLocation);

  const { data: featuredRestaurants } = useQuery({
    queryKey: ['featured-restaurants'],
    queryFn: () =>
      restaurantsApi.getAll({
        lat: currentLocation?.latitude,
        lng: currentLocation?.longitude,
      }),
  });

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{item.icon}</Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFeaturedRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: item.id })}
    >
      <View style={styles.featuredImage}>
        <Text style={styles.placeholderText}>🍽️</Text>
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.featuredMeta}>
          ⭐ {item.rating} • {item.deliveryTime} • ${item.deliveryFee.toFixed(2)} delivery
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderOrderAgainItem = ({ item }: { item: typeof orderAgainItems[0] }) => (
    <TouchableOpacity style={styles.orderAgainCard}>
      <View style={styles.orderAgainImage}>
        <Text style={styles.placeholderText}>🍽️</Text>
      </View>
      <Text style={styles.orderAgainName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.orderAgainRestaurant}>{item.restaurant}</Text>
      <Text style={styles.orderAgainPrice}>${item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Deliver to</Text>
            <TouchableOpacity style={styles.locationButton}>
              <Text style={styles.locationText}>📍 Current Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search restaurants, cuisines..."
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Restaurants</Text>
          <FlatList
            data={featuredRestaurants?.slice(0, 5) || []}
            renderItem={renderFeaturedRestaurant}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </View>

        {/* Order Again */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Again</Text>
          <FlatList
            data={orderAgainItems}
            renderItem={renderOrderAgainItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.orderAgainList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locationButton: {
    marginTop: spacing.xs,
  },
  locationText: {
    ...typography.h4,
    color: colors.text,
  },
  searchContainer: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    paddingLeft: spacing.xl,
    borderRadius: 12,
    fontSize: 16,
    color: colors.text,
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.md,
    top: 14,
    fontSize: 16,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  categoriesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryIconText: {
    fontSize: 28,
  },
  categoryName: {
    ...typography.bodySmall,
    color: colors.text,
  },
  featuredList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  featuredCard: {
    width: 280,
    marginRight: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.md,
    overflow: 'hidden',
  },
  featuredImage: {
    height: 150,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  featuredInfo: {
    padding: spacing.md,
  },
  featuredName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featuredMeta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  orderAgainList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  orderAgainCard: {
    width: 140,
    marginRight: spacing.md,
  },
  orderAgainImage: {
    width: 140,
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  orderAgainName: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  orderAgainRestaurant: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  orderAgainPrice: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});