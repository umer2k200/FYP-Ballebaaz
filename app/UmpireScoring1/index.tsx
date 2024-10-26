import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";

import { useRouter } from "expo-router";
const matches = [
  {
    matchId: "M001",
    teamA: "Team Alpha",
    teamB: "Team Beta",
    date: "2024-11-10",
    time: "15:00",
    location: "Cricket Ground A",
  },
  {
    matchId: "M002",
    teamA: "Team Gamma",
    teamB: "Team Delta",
    date: "2024-11-11",
    time: "18:30",
    location: "Stadium B",
  },
  // Add more matches as needed
];

export default function MatchDetails() {

  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Upcoming Matches</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {matches.map((match) => (
          <View key={match.matchId} style={styles.matchCard}>
            <View style={styles.matchInfoContainer}>
              <Image
                source={require("@/assets/images/assign.png")}
                style={styles.matchImage}
              />
              <View style={styles.matchDetails}>
                <Text style={styles.matchTitle}>
                  {match.teamA} vs {match.teamB}
                </Text>
                <Text style={styles.matchInfo}>Match ID: {match.matchId}</Text>
                <Text style={styles.matchInfo}>Date: {match.date}</Text>
                <Text style={styles.matchInfo}>Time: {match.time}</Text>
                <Text style={styles.matchInfo}>Location: {match.location}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.startMatchButton} onPress={() => router.push("/UmpireScoring")}>
              <Text style={styles.buttonText}>Start Match</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/UmpireHome")}
      >
        <Image
          source={require("@/assets/images/home.png")}
          style={styles.navIcon}
        />
      </TouchableOpacity> *

      <View style={styles.navItem}>
        <View style={styles.highlight}>
          <Image
            source={require("@/assets/images/cric.png")}
            style={styles.navIcon}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/UmpireSettings")}
      >
        <Image
          source={require("@/assets/images/settings.png")}
          style={styles.navIcon}
        />
      </TouchableOpacity>
    </View>
</View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 100,
  },
  matchCard: {
    backgroundColor: "#005B41",
    borderRadius: 20,
    marginBottom: 25,
    padding: 15,
    width: "95%",
    alignSelf: "center",
  },
  matchInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  matchImage: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  matchDetails: {
    flex: 1,
  },
  matchTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  matchInfo: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 4,
  },
  startMatchButton: {
    backgroundColor: "#005B41",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1e1e1e", // Dark navbar background
    paddingVertical: 7,
    borderTopLeftRadius: 50, // Extra rounded top corners for a sleek look
    borderTopRightRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: "center",
    paddingLeft:0,
    padding: 5,
  },
  navIcon: {
    width: 25,
    height: 25,
    tintColor: "#fff",
  },
  highlight: {
    position: "absolute",
    bottom: 30, // Slightly raised pop-up effect
    backgroundColor: "#005B41", // Teal highlight
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00e676", // Bright shadow effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#1e1e1e",
    borderWidth: 5,
  },
});


