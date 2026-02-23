import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from './store/auth';

// Auth Screens
import WelcomeScreen from './screens/auth/WelcomeScreen';
import LoginScreen from './screens/auth/LoginScreen';
import LocationPermissionScreen from './screens/auth/LocationPermissionScreen';

// Main Tab Screens
import HomeScreen from './screens/tabs/HomeScreen';
import RestaurantsScreen from './screens/tabs/RestaurantsScreen';
import OrdersScreen from './screens/tabs/OrdersScreen';
import ProfileScreen from './screens/tabs/ProfileScreen';

// Restaurant Stack Screens
import RestaurantDetailScreen from './screens/restaurant/RestaurantDetailScreen';
import ItemDetailScreen from './screens/restaurant/ItemDetailScreen';

// Cart Stack Screens
import CartScreen from './screens/cart/CartScreen';

// Checkout Stack Screens
import AddressSelectScreen from './screens/checkout/AddressSelectScreen';
import PaymentScreen from './screens/checkout/PaymentScreen';
import OrderConfirmationScreen from './screens/checkout/OrderConfirmationScreen';
import OrderPlacedScreen from './screens/checkout/OrderPlacedScreen';

// Tracking Stack Screens
import LiveTrackingScreen from './screens/tracking/LiveTrackingScreen';

// Types
import { RootStackParamList, MainTabParamList } from './types/navigation';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#14B8A6',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Restaurants" component={RestaurantsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen 
            name="RestaurantDetail" 
            component={RestaurantDetailScreen}
            options={{ headerShown: true, title: 'Restaurant' }}
          />
          <Stack.Screen 
            name="ItemDetail" 
            component={ItemDetailScreen}
            options={{ headerShown: true, title: 'Item' }}
          />
          <Stack.Screen 
            name="Cart" 
            component={CartScreen}
            options={{ headerShown: true, title: 'Cart' }}
          />
          <Stack.Screen 
            name="AddressSelect" 
            component={AddressSelectScreen}
            options={{ headerShown: true, title: 'Delivery Address' }}
          />
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen}
            options={{ headerShown: true, title: 'Payment' }}
          />
          <Stack.Screen 
            name="OrderConfirmation" 
            component={OrderConfirmationScreen}
            options={{ headerShown: true, title: 'Confirm Order' }}
          />
          <Stack.Screen 
            name="OrderPlaced" 
            component={OrderPlacedScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="LiveTracking" 
            component={LiveTrackingScreen}
            options={{ headerShown: true, title: 'Track Order' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}