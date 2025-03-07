import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Button, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons

export default function UpcomingMatchesScreen() {
  const router = useRouter();
  
  // State for modal visibility and selected match data
  const [modalVisible, setModalVisible] = useState(false);
  const [playing11, setPlaying11] = useState<{ team1: string[], team2: string[] }>({ team1: [], team2: [] });
  const [matchTitle, setMatchTitle] = useState<string>('');
  const [currentTeamIndex, setCurrentTeamIndex] = useState<number>(0); // Track which team to show

  // Matches data with playing 11 for both teams
  const matches: { [key: string]: { team1: string[], team2: string[] } } = {
    "United vs Markhors": {
      team1: ["Player1", "Player2", "Player3", "Player4", "Player5", "Player6", "Player7", "Player8", "Player9", "Player10", "Player11"],
      team2: ["PlayerA", "PlayerB", "PlayerC", "PlayerD", "PlayerE", "PlayerF", "PlayerG", "PlayerH", "PlayerI", "PlayerJ", "PlayerK"],
    },
    "United vs Qalandars": {
      team1: ["Player12", "Player13", "Player14", "Player15", "Player16", "Player17", "Player18", "Player19", "Player20", "Player21", "Player22"],
      team2: ["PlayerL", "PlayerM", "PlayerN", "PlayerO", "PlayerP", "PlayerQ", "PlayerR", "PlayerS", "PlayerT", "PlayerU", "PlayerV"],
    },
  };

  // Function to handle when a match container is clicked
  const handleMatchPress = (matchTitle: string) => {
    const selectedMatch = matches[matchTitle]; // Fetch the match data using the title
    if (selectedMatch) {
      setPlaying11(selectedMatch); // Set playing 11 for both teams
      setMatchTitle(matchTitle); // Set match title
      setModalVisible(true); // Open the modal
    }
  };

  // Function to render the playing XI for each team
  const renderPlaying11 = ({ item }: { item: { team: string[]; title: string } }) => (
    <View style={styles.teamContainer}>
      <Text style={styles.teamTitle}>{item.title}</Text>
      {item.team.map((player, index) => (
        <Text key={index} style={styles.playerName}>{player}</Text>
      ))}
    </View>
  );

  // Data for the FlatList showing each team's playing XI
  const teamData = [
    { team: playing11.team1, title: "Team 1" },
    { team: playing11.team2, title: "Team 2" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/TeamOwnerHomeScreen')}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Upcoming Matches</Text>
      </View>

      {/* Ongoing Match Container */}
      <View style={styles.matchContainer}>
        <Text style={styles.matchTitle}>United:</Text>
        <Text style={styles.matchDetail2}>20/1 (4/20)</Text>
        <Text style={styles.matchTitle2}>vs</Text>
        <Text style={styles.matchTitle2}>Kings</Text>
        <Text style={styles.matchDetail}>Venue: Pasban Cricket Complex</Text>
      </View>

      {/* Match Container 1 - Clickable for modal */}
      <TouchableOpacity style={styles.matchContainer} onPress={() => handleMatchPress("United vs Markhors")}>
        <Text style={styles.matchTitle}>United vs Markhors</Text>
        <Text style={styles.matchDetail}>Date: 25th September, 2024</Text>
        <Text style={styles.matchDetail}>Time: 11:00 AM</Text>
        <Text style={styles.matchDetail}>Venue: Pasban Cricket Complex</Text>
      </TouchableOpacity>

      {/* Match Container 2 - Clickable for modal */}
      <TouchableOpacity style={styles.matchContainer} onPress={() => handleMatchPress("United vs Qalandars")}>
        <Text style={styles.matchTitle}>United vs Qalandars</Text>
        <Text style={styles.matchDetail}>Date: 26th September, 2024</Text>
        <Text style={styles.matchDetail}>Time: 7:00 AM</Text>
        <Text style={styles.matchDetail}>Venue: E9 Cricket Ground</Text>
      </TouchableOpacity>

      {/* Modal to display playing 11 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Playing 11 for {matchTitle}</Text>
            <FlatList
              data={teamData}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderPlaying11}
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.floor(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                setCurrentTeamIndex(index);
              }}
              style={styles.flatList}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
  <Text style={styles.closeButtonText}>Close</Text>
</TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background color
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff', // Light text color for dark mode
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 15,
    marginRight: 23,
  },
  matchContainer: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // Light text color for dark mode
    marginBottom: 0,
  },
  flatList: { // Add this style
    height: 250, // Adjust the height as needed
  },
  matchTitle2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // Light text color for dark mode
    marginBottom: 2,
    bottom: 30,
  },
  matchDetail: {
    fontSize: 16,
    color: '#bbb', // Softer color for the detail text
    marginBottom: 5,
  },
  matchDetail2: {
    fontSize: 16,
    marginLeft: 210,
    bottom: 27,
    color: '#bbb', // Softer color for the detail text
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark semi-transparent background
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#121212',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color:'white',
  },
  teamContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color:'white',
  },
  playerName: {
    fontSize: 16,
    color: 'grey',
    marginBottom: 5,

  },
  closeButton: {
    backgroundColor: "#005B41", // Teal color for the button
    padding: 15,
    borderRadius: 20, // Rounded buttons for aesthetic appeal
    alignItems: "center",
    marginBottom: 10,
    marginTop:15,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
});
