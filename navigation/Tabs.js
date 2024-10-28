// navigation/Tabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Tuodaan näytöt
import HomeScreen from '../screens/HomeScreen';
import GameboardScreen from '../screens/GameboardScreen';
import ScoreboardScreen from '../screens/ScoreboardScreen';

const Tab = createBottomTabNavigator(); 

const Tabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Gameboard') {
            iconName = focused ? 'dice-multiple' : 'dice-multiple-outline';
          } else if (route.name === 'Scoreboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          }

          // Palautetaan ikoni
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Gameboard" component={GameboardScreen} />
      <Tab.Screen name="Scoreboard" component={ScoreboardScreen} />
    </Tab.Navigator>
  );
};

export default Tabs;
