import { Tabs } from 'expo-router';
import React from 'react';

import { Home, Calendar, Search, User, Building2, ChartBar } from 'lucide-react-native'
import TabBarBackground from '@/components/ui/TabBarBackground';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{        
        tabBarBackground: TabBarBackground,        
      }}>
        
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <Home size={28} color={color} />,
              headerTitle: 'Home',
            }}
          />
          <Tabs.Screen
            name="bookings"
            options={{
              title: 'Bookings',
              tabBarIcon: ({ color }) => <Calendar size={28} color={color} />,
              headerTitle: 'Bookings',
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ color }) => <Search size={28} color={color} />,
              headerTitle: 'Search',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <User size={28} color={color} />,
              headerTitle: 'Profile',
            }}
          />
      </Tabs>
  );
}
