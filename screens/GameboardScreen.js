import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const DICE_SIZE = width / 7;

const NUMBER_OF_DICE = 5;
const MAX_ROLLS = 3;
const BONUS_POINTS_LIMIT = 63;
const BONUS_POINTS = 50;
const SPOT_COUNTS = [1, 2, 3, 4, 5, 6];  // Silmäluvut

const GameboardScreen = ({ route }) => {
  const { playerName } = route.params;
  const [dice, setDice] = useState(Array(NUMBER_OF_DICE).fill(1));
  const [locked, setLocked] = useState(Array(NUMBER_OF_DICE).fill(false));
  const [rollsLeft, setRollsLeft] = useState(MAX_ROLLS);
  const [points, setPoints] = useState(0);  // Kokonaispisteet
  const [bonusProgress, setBonusProgress] = useState(BONUS_POINTS_LIMIT);
  const [selectedSpots, setSelectedSpots] = useState([]);  // Valitut spot count -arvot ja pisteet
  const [diceThrown, setDiceThrown] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);  // Pidetään kirjaa, onko peli päättynyt

  // Heitä nopat
  const rollDice = () => {
    if (rollsLeft > 0) {
      const newDice = dice.map((die, index) => (locked[index] ? die : Math.floor(Math.random() * 6) + 1));
      setDice(newDice);
      setDiceThrown(true);
      setRollsLeft(rollsLeft - 1);
    }
  };

  // Lukitse tai vapauta noppa
  const toggleLock = (index) => {
    const newLocked = [...locked];
    newLocked[index] = !newLocked[index];
    setLocked(newLocked);
  };

  const selectSpot = (spot) => {
    const selectedDice = dice.filter((_, index) => locked[index]);  // Lukitut nopat
    const diceValues = selectedDice.map((die) => die);
    const matchingDice = diceValues.filter((die) => die === spot);
  
    // Salli 0 pisteen valinta, jos yhtään noppaa ei ole valitulla spot countilla
    if (matchingDice.length === 0) {
      Alert.alert(
        'No dice for this spot count',
        `You can select 0 points for spot count ${spot}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedSpots([...selectedSpots, { spot, points: 0 }]);  // Lisää 0 pistettä
              resetTurn();
            },
          },
          {
          text: 'Back',  // Lisää back-nappula
          style: 'cancel',  // Tämä tyyli tekee siitä "peruuta"-tyylisen nappulan
        },
        ]
      );
      return;
    }
  
    // Jos pelaaja on valinnut spot countin, pisteet lasketaan normaalisti
    if (selectedSpots.some((s) => s.spot === spot)) {
      Alert.alert('Spot Already Selected', 'You have already selected this spot count.');
      return;
    }
  
    const spotPoints = matchingDice.reduce((acc, curr) => acc + curr, 0);
    const newPoints = points + spotPoints;
  
    setPoints(newPoints);
    setSelectedSpots([...selectedSpots, { spot, points: spotPoints }]);
  
    if (newPoints >= BONUS_POINTS_LIMIT) {
      setBonusProgress(0);
    } else {
      setBonusProgress(BONUS_POINTS_LIMIT - newPoints);
    }
  
    // Jos kaikki spot countit on valittu, peli päättyy
    if (selectedSpots.length + 1 === SPOT_COUNTS.length) {
      setGameEnded(true);
      saveScore(playerName, newPoints);
    }
  
    resetTurn();
  };
  

  // Nollaa vuoro uuden heiton jälkeen
  const resetTurn = () => {
    setDice(Array(NUMBER_OF_DICE).fill(1));
    setLocked(Array(NUMBER_OF_DICE).fill(false));
    setRollsLeft(MAX_ROLLS);
    setDiceThrown(false);
  };

  // Pisteiden tallentaminen
  const saveScore = async (playerName, points) => {
    try {
      // Lisää bonuspisteet, jos pelaajan pisteet ylittävät bonusrajan
      let finalPoints = points;
      if (points >= BONUS_POINTS_LIMIT) {
        finalPoints += BONUS_POINTS;  // Lisää 50 bonuspistettä
      }  
  
      const date = new Date().toLocaleDateString();
      const newScore = { playerName, points: finalPoints, date };
  
      // Hae tallennetut scoreboard-pisteet AsyncStoragesta
      const storedScores = await AsyncStorage.getItem('scoreboard');
      const scores = storedScores ? JSON.parse(storedScores) : [];
  
      // Päivitä scoreboard ja tallenna uudet tulokset
      const updatedScores = [...scores, newScore];
      await AsyncStorage.setItem('scoreboard', JSON.stringify(updatedScores));
  
      console.log(`Score saved: ${JSON.stringify(newScore)}`);
    } catch (error) {
      console.error('Error saving score', error);
    }
  };
  

  // Resetoi meneillään oleva peli
  const resetGame = () => {
    setDice(Array(NUMBER_OF_DICE).fill(1));
    setLocked(Array(NUMBER_OF_DICE).fill(false));
    setRollsLeft(MAX_ROLLS);
    setPoints(0);
    setBonusProgress(BONUS_POINTS_LIMIT);
    setSelectedSpots([]);
    setDiceThrown(false);
    setGameEnded(false);  // Nollaa pelin tila
  };

  // Aloita uusi peli
  const newGame = () => {
    resetGame();  // Kutsu resetGame-funktiota uuden pelin aloittamiseksi
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Player, {playerName}.</Text>

      {!diceThrown ? (
        <MaterialCommunityIcons
          name="dice-5"
          size={150}
          color="black"
          style={styles.placeholderIcon}
        />
      ) : (
        <View style={styles.diceContainer}>
          {dice.map((die, index) => (
            <TouchableOpacity key={index} onPress={() => toggleLock(index)} style={[styles.dieContainer, locked[index] && styles.locked]}>
              <MaterialCommunityIcons
                name={`numeric-${die}-circle`}
                size={DICE_SIZE - 20}
                color={locked[index] ? 'gray' : 'black'}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.pointsText}>Total Points: {points}</Text>
        {bonusProgress > 0 ? (
          <Text style={styles.statusText}>{bonusProgress} points to bonus!</Text>
        ) : (
          <Text style={styles.bonusText}>Bonus achieved: {BONUS_POINTS} points!</Text>
        )}
      </View>

      <View style={styles.spotsContainer}>
        <Text style={styles.spotsTitle}>Select points for spot count:</Text>
        <View style={styles.spotButtons}>
          {SPOT_COUNTS.map((spot) => {
            const selectedSpot = selectedSpots.find((s) => s.spot === spot);
            return (
              <View key={spot} style={styles.spotButtonContainer}>
                <TouchableOpacity
                  onPress={() => selectSpot(spot)}
                  style={[styles.spotButton, selectedSpot && styles.disabledSpot]}
                  disabled={!!selectedSpot}
                >
                  <Text style={styles.spotText}>{spot}</Text>
                </TouchableOpacity>
                {selectedSpot && <Text style={styles.spotPoints}>{selectedSpot.points} pts</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {/* Heitto-painike */}
      <TouchableOpacity style={styles.button} onPress={rollDice} disabled={rollsLeft === 0 || gameEnded}>
        <Text style={styles.buttonText}>Roll Dice</Text>
      </TouchableOpacity>

      {/* Reset- ja New Game -painikkeet */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.buttonText}>Reset Game</Text>
        </TouchableOpacity>
        {gameEnded && (
          <TouchableOpacity style={styles.newGameButton} onPress={newGame}>
            <Text style={styles.buttonText}>New Game</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 20,
  },
  placeholderIcon: {
    marginBottom: 20,
  },
  diceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  dieContainer: {
    width: DICE_SIZE,
    height: DICE_SIZE,
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locked: {
    backgroundColor: '#ddd',
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusText: {
    fontSize: 16,
  },
  spotsContainer: {
    alignItems: 'center',
    marginBottom: 20
},
spotsTitle: {
  fontSize: 18,
  marginBottom: 10,
},
spotButtons: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '100%',
},
spotButtonContainer: {
  alignItems: 'center',
},
spotButton: {
  padding: 15,
  backgroundColor: '#eee',
  borderRadius: 50,
  marginHorizontal: 10,
},
spotText: {
  fontSize: 18,
},
spotPoints: {
  marginTop: 5,
  fontSize: 16,
  color: 'green',
},
disabledSpot: {
  backgroundColor: '#ccc',
},
pointsText: {
    fontSize: 28,
    fontFamily: 'Roboto_700Bold',
    color: '#ff5722',  // Korostettu väri pisteille
    marginBottom: 10,
},
bonusText: {
    fontSize: 24,
    fontFamily: 'Roboto_400Regular',
    color: '#4caf50',  // Korostettu väri bonuspisteille
},
buttonContainer: {
  marginTop: 20,
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-around',
},
button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
},
buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Roboto_400Regular',
},
resetButton: {
    backgroundColor: '#f44336', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
  },
  newGameButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
  },

});

export default GameboardScreen;
