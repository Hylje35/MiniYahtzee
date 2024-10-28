// screens/HomeScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TextInput, Button, Keyboard, StyleSheet } from 'react-native';

// Constants for the game rules
const NBR_OF_DICES = 5;
const NBR_OF_THROWS = 3;
const MIN_SPOT = 1;
const MAX_SPOT = 6;
const BONUS_POINTS_LIMIT = 63;
const BONUS_POINTS = 50;

const HomeScreen = ({ navigation }) => {
  const [playerName, setPlayerName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const inputRef = useRef(null);

  const submitName = () => {
    if (playerName.trim()) {
      Keyboard.dismiss();
      setNameSubmitted(true);
    } else {
      alert("Please enter a name!");
    }
  };

  const navigateToGameboard = () => {
    navigation.navigate('Gameboard', { playerName });
  };

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <View style={styles.container}>
      {!nameSubmitted ? (
        <>
          <Text style={styles.title}>Welcome to Mini-Yahtzee!</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Enter your name"
            value={playerName}
            onChangeText={setPlayerName}
          />
          <Button title="OK" onPress={submitName} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Game Rules</Text>
          <Text style={styles.rules}>
            THE GAME: Upper section of the classic Yahtzee dice game.{"\n"}
            You have {NBR_OF_DICES} dices and for each dice you have {NBR_OF_THROWS} throws.{"\n"}
            After each throw, you can keep dices to get the same spot counts as many as possible.{"\n"}
            At the end of the turn, you must select your points from {MIN_SPOT} to {MAX_SPOT}.{"\n"}
            The game ends when all points have been selected (order is free).{"\n"}
            {"\n"}
            POINTS: After each turn, the game calculates the sum of the dices you selected.{"\n"}
            Only the dices with the same spot count are calculated.{"\n"}
            You cannot select the same points again from {MIN_SPOT} to {MAX_SPOT}.{"\n"}
            {"\n"}
            GOAL: To get as many points as possible.{"\n"}
            {BONUS_POINTS_LIMIT} points is the limit for getting a bonus of {BONUS_POINTS} points.
          </Text>
          <Button title="Play" onPress={navigateToGameboard} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  rules: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default HomeScreen;

