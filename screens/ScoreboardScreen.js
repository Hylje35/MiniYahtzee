import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';  // Tämä hook

const ScoreboardScreen = () => {
  const [scores, setScores] = useState([]);

  // Hae scoreboard-tiedot AsyncStoragesta
  const loadScores = async () => {
    try {
      const storedScores = await AsyncStorage.getItem('scoreboard');
      const parsedScores = storedScores ? JSON.parse(storedScores) : [];
      
      // Järjestä tulokset pisteiden mukaan laskevassa järjestyksessä
      const sortedScores = parsedScores.sort((a, b) => b.points - a.points);
      setScores(sortedScores);
    } catch (error) {
      console.error('Error loading scores', error);
    }
  };

  // Käytä useFocusEffectiä, jotta scoreboard päivittyy aina, kun käyttäjä navigoi takaisin tähän näyttöön
  useFocusEffect(
    React.useCallback(() => {
      loadScores();  // Lataa scoreboard, kun näyttö avataan
    }, []) 
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scoreboard</Text>
      <FlatList
        data={scores}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.scoreItem}>
            <Text style={styles.playerText}>{item.playerName}</Text>
            <Text style={styles.pointsText}>{item.points} pts</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  playerText: {
    fontSize: 18,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
});

export default ScoreboardScreen;
