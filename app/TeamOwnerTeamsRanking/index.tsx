import React, { useState, useEffect } from 'react';
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Image } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/firebaseConfig';

interface TeamData {
  captain_id: string;
  captain_name: string;
  coach_id: string;
  highest_score: number;
  highlights: string;
  matches_lost: number;
  matches_played: number;
  matches_won: number;
  players: string;
  ranking: string;
  team_id: string;
  team_name: string;
  wl_ratio: number;
}

const TeamRanking = () => {
  const router = useRouter();
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null); // Manage expanded state
  const [teamData, setTeamData] = useState<TeamData[]>([]); // Initialize as an array
  const [isModalVisible, setModalVisible] = useState(false);


  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Toggle expand/collapse for each team
  const toggleExpand = (team_id: string) => {
    setExpandedTeamId(expandedTeamId === team_id ? null : team_id);
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "team"));
        const teams: TeamData[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as TeamData;
          teams.push(data);
        });

        teams.sort((a, b) => b.wl_ratio - a.wl_ratio);
        setTeamData(teams);
      } catch (error) {
        console.error("Error fetching team data:", error);
      }
    };

    fetchTeamData();
  }, []);

  // Handle match request
  const sendMatchRequest = () => {
    Alert.alert('Match Request Sent!', 'Your match request has been sent successfully.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageName}>Team Rankings</Text>
      <ScrollView>
        {teamData.map((team) => (
          <View key={team.team_id} style={styles.teamContainer}>
            <TouchableOpacity onPress={() => toggleExpand(team.team_id)}>
              <Text style={styles.teamName}>
                {team.team_name} {/* Add ranking number here */}
              </Text>
              <Text style={styles.winLossRatio}>
                W/L Ratio: {team.wl_ratio} %
              </Text>
            </TouchableOpacity>
            {expandedTeamId === team.team_id && (
              <View style={styles.expandedContainer}>
                <TouchableOpacity style={styles.requestButton} onPress={sendMatchRequest}>
                  <Text style={styles.requestButtonText}>Send Match Request</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerDrills')}>
          <Image source={require('@/assets/images/drills.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerBookGround-2')}>
          <Image source={require('@/assets/images/stadium.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerHomeScreen')}>
          <Image source={require('@/assets/images/home.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image source={require('@/assets/images/ranking.png')} style={styles.navIcon} />
          </View>
        </View>
        <TouchableOpacity style={styles.navItem} onPress={toggleModal}>
          <Image source={require('@/assets/images/more.png')} style={styles.navIcon} />
        </TouchableOpacity>
      </View>

      {/* Modal for Additional Navigation Options */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.expandedNavbar}>
            <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerGenerateKit'); }}>
              <Image source={require('@/assets/images/kit.png')} style={styles.navIcon} />
              <Text style={styles.expandedNavText}>AI Kit Generation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerCommunity'); }}>
              <Image source={require('@/assets/images/community.png')} style={styles.navIcon} />
              <Text style={styles.expandedNavText}>Community</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerHighlightsPage'); }}>
              <Image source={require('@/assets/images/cloud.png')} style={styles.navIcon} />
              <Text style={styles.expandedNavText}>Highlights</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerSettings'); }}>
              <Image source={require('@/assets/images/settings.png')} style={styles.navIcon} />
              <Text style={styles.expandedNavText}>Settings</Text>
            </TouchableOpacity>

            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  pageName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 50,
  },
  teamContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  teamName: {
    fontSize: 20,
    color: '#fff',
  },
  winLossRatio: {
    fontSize: 16,
    color: '#00e676',
  },
  expandedContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  requestButton: {
    backgroundColor: '#005B41',
    padding: 10,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e', // Dark navbar background
    paddingVertical: 7,
    borderTopLeftRadius: 50, // Extra rounded top corners for a sleek look
    borderTopRightRadius: 50,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  navItem: {
    alignItems: 'center',
    padding: 10,
  },
  highlight: {
    position: 'absolute',
    bottom: 35, // Slightly raised pop-up effect
    backgroundColor: '#005B41', // Teal highlight
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e676', // Bright shadow effect for the highlight
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderColor: '#1e1e1e',  // Darker border color for contrast
    borderWidth: 5,
  },
  navIcon: {
    width: 35,
    height: 35,
    tintColor: '#fff', // Make icons white
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
  },
  expandedNavbar: {
    width: '50%',
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  navItemExpanded: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  expandedNavText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#005B41',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TeamRanking;
