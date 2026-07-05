import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CartProvider} from './src/contexts/CartContext';
import {ProductProvider} from './src/contexts/ProductContext';
import {OrderProvider} from './src/contexts/OrderContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import ProductsScreen from './src/screens/ProductsScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <ErrorBoundary>
    <ProductProvider>
      <CartProvider>
        <OrderProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{headerShown: false}}>
              <Stack.Screen name="Home" component={ProductsScreen} />
              <Stack.Screen name="Cart" component={CartScreen} />
              <Stack.Screen name="Orders" component={OrdersScreen} />
              <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </OrderProvider>
      </CartProvider>
    </ProductProvider>
    </ErrorBoundary>
  );
}

export default App;
