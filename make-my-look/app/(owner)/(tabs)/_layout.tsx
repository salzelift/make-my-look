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
            name="dashboard"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color }) => <ChartBar size={28} color={color} />,
              headerTitle: 'Dashboard',
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="stores"
            options={{
              title: 'Stores',
              tabBarIcon: ({ color }) => <Building2 size={28} color={color} />,
              headerTitle: 'Stores',
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="bookings"
            options={{
              title: 'Bookings',
              tabBarIcon: ({ color }) => <Calendar size={28} color={color} />,
              headerTitle: 'Bookings',
              headerShown: false
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <User size={28} color={color} />,
              headerTitle: 'Profile',
              headerShown: false
            }}
          />
      </Tabs>
  );
}
