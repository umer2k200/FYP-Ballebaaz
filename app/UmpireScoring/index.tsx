import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icon for back button

export default function MatchDetailsScreen() {
    const router = useRouter();
    const {matchId,Team1,Team2} =  useLocalSearchParams();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header with back button and match title */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back" size={24} color="#fff" onPress={() => router.push("/UmpireHome")}/>
        </TouchableOpacity>
        <Text style={styles.matchTitle}>{Team1} vs {Team2} {matchId}</Text>
      </View>

      {/* Match score details */}
      <View style={styles.scoreContainer}>
        <Text style={styles.teamName}>United</Text>
        <Text style={styles.scoreText}>152-0</Text>
        <Text style={styles.oversText}>Overs: 12.0/25 Run rate: 12.5</Text>

        {/* Batting details */}
        <View style={styles.statsHeader}>
          <Text style={styles.statsText}>Batter</Text>
          <Text style={styles.statsText}>R</Text>
          <Text style={styles.statsText}>B</Text>
          <Text style={styles.statsText}>4's</Text>
          <Text style={styles.statsText}>6's</Text>
          <Text style={styles.statsText}>S.R</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.batterText}>Babar *</Text>
          <Text style={styles.statsValue}>75</Text>
          <Text style={styles.statsValue}>30</Text>
          <Text style={styles.statsValue}>5</Text>
          <Text style={styles.statsValue}>3</Text>
          <Text style={styles.statsValue}>160.2</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.batterText}>Rizwan</Text>
          <Text style={styles.statsValue}>77</Text>
          <Text style={styles.statsValue}>42</Text>
          <Text style={styles.statsValue}>6</Text>
          <Text style={styles.statsValue}>2</Text>
          <Text style={styles.statsValue}>132.3</Text>
        </View>

        {/* Bowling details */}
        <Text style={styles.teamName}>Kings</Text>
        <View style={styles.statsHeader}>
          <Text style={styles.statsText}>Bowler</Text>
          <Text style={styles.statsText}>R</Text>
          <Text style={styles.statsText}>O</Text>
          <Text style={styles.statsText}>4's</Text>
          <Text style={styles.statsText}>6's</Text>
          <Text style={styles.statsText}>Eco</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.batterText}>Amir</Text>
          <Text style={styles.statsValue}>15</Text>
          <Text style={styles.statsValue}>2.0</Text>
          <Text style={styles.statsValue}>1</Text>
          <Text style={styles.statsValue}>0</Text>
          <Text style={styles.statsValue}>7.5</Text>
        </View>
      </View>

      {/* Record Video Button */}
      <TouchableOpacity style={styles.recordButton}>
        <Text style={styles.recordButtonText}>Record Video</Text>
        <View style={styles.recordIndicator}></View>
      </TouchableOpacity>

      {/* Scoring Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <Text style={styles.gridItem}>0</Text>
          <Text style={styles.gridItem}>1</Text>
          <Text style={styles.gridItem}>2</Text>
          <Text style={styles.gridItem}>3</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.gridItem}>4</Text>
          <Text style={styles.gridItem}>5</Text>
          <Text style={styles.gridItem}>6</Text>
          <Text style={styles.gridItem}>OUT</Text>
        </View>
        <View style={styles.gridRow}>
          <Text style={styles.gridItem}>Bye</Text>
          <Text style={styles.gridItem}>LB</Text>
          <Text style={styles.gridItem}>Wide</Text>
          <Text style={styles.gridItem}>DRS</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop:60,
    paddingBottom: 20,
  },
  matchTitle: {
    fontSize: 20,
    color: '#fff',
    marginLeft: 20,
    fontWeight: 'bold',
  },
  scoreContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 40,
    padding: 20,
    marginBottom: 20,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  oversText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  statsText: {
    color: '#bbb',
    fontSize: 12,
    textAlign: 'center',
    flex: 1,

  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#222',
    borderRadius: 5,
    marginBottom: 5,
  },
  batterText: {
    color: '#fff',
    flex: 2,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  statsValue: {
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: '#005B41',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 40,
    alignSelf: 'center',
    marginBottom: 30,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
  },
  recordIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
  },
  gridContainer: {
    backgroundColor: '#005B41',
    borderRadius: 50,
    padding: 15,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    width: '22%',
    textAlign: 'center',
    paddingVertical: 10,
 
  },
});