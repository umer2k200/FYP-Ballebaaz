import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Carousel from 'react-native-reanimated-carousel';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter,useLocalSearchParams } from 'expo-router';
import { db, storage } from '@/firebaseConfig';
import {ref, getDownloadURL} from 'firebase/storage';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface TeamData {
  captain_id: string;
  captain_name: string;
  coach_id: string;
  highest_score: number;
  highlights: string;
  matches_lost: number;
  matches_played: number;
  matches_won: number;
  players: string[];
  ranking: string;
  team_id: string;
  team_name: string;
  wl_ratio: number;
}

interface Player{
  name: string;
  role: string;
  player_id: string;
}

const { width } = Dimensions.get('window');
const imageSliderHeight = 250;
const Tab = createMaterialTopTabNavigator();

const MatchDetailsScreen = () => {

  const router = useRouter();
  const { matchData } = useLocalSearchParams();
  const match = JSON.parse(matchData as string);
  const [matchImages, setMatchImages] = useState<any[]>([
    require('@/assets/images/ground1.jpeg'), // Default image
  ]);
  const [team1Data, setTeam1Data] = useState<TeamData | null>(null);
  const [team2Data, setTeam2Data] = useState<TeamData | null>(null);
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);

  useEffect(() => {
    const fetchGroundPicture = async () => {
      try {
        const groundPictureRef = ref(storage, `profile_pictures/${match.ground_id2}.jpeg`);
        const groundPictureUrl = await getDownloadURL(groundPictureRef);

        // Add the fetched image URL to matchImages
        setMatchImages((prevImages) => [{ uri: groundPictureUrl }, ...prevImages]);
      } catch (error) {
        //console.error('Error fetching ground picture:', error);
      } 
    };
    fetchGroundPicture();
  }, [match.ground_id2]);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      const team1Data = await getTeamDetails(match.team1_id);
      const team2Data = await getTeamDetails(match.team2_id);
      setTeam1Data(team1Data as TeamData);
      setTeam2Data(team2Data as TeamData);

      if(team1Data){
        const team1PlayerDetails = await fetchPlayers(team1Data.players);
        setTeam1Players(team1PlayerDetails);
      }
      if(team2Data){
        const team2PlayerDetails = await fetchPlayers(team2Data.players);
        setTeam2Players(team2PlayerDetails);
      }
      console.log('Fetched Team Data: ', team1Data, team2Data);
    };
    fetchTeamDetails();
  }, [match.team1_id, match.team2_id]);

  const getTeamDetails = async (team_id: string) => {
    try{
      const teamCollectionRef = collection(db, 'team');
      const q = query(teamCollectionRef, where('team_id', '==', team_id));
      const querySnapshot = await getDocs(q);
      if(!querySnapshot.empty){
        const teamDoc = querySnapshot.docs[0];
        const teamData = teamDoc.data() as TeamData;
        return teamData;
      }
      else{
        return null;
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
    }
  }

  const fetchPlayers = async (playerIds: string[]): Promise<Player[]> => {
    const playerDetails = await Promise.all(
      playerIds.map(async (player_id) => {
        const player = await getPlayerDetails(player_id);
        return player;
      })
    );
    return playerDetails.filter((player): player is Player => player !== null);
  };

  const getPlayerDetails = async (player_id: string): Promise<Player | null> => {
    try {
      const playerCollectionRef = collection(db, 'player');
      const q = query(playerCollectionRef, where('player_id', '==', player_id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const playerDoc = querySnapshot.docs[0];
        const playerData = playerDoc.data() as Player;
        return playerData;
      } else {
        console.log('Player not found:', player_id);
        return null;
      }
    } catch (error) {
      console.error('Error fetching player details:', error);
      return null;
    }
  };


  // Match Tab Content
  const MatchScreen = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.detailText}>Match ID: {match.match_id}</Text>
      <Text style={styles.detailText}>Ground: {match.ground_id}</Text>
      <Text style={styles.detailText}>Date: {match.dateTime}</Text>
      <Text style={styles.detailText}>Team 1: {match.team1}</Text>
      <Text style={styles.detailText}>Team 2: {match.team2}</Text>
      <Text style={styles.detailText}>Umpire ID: {match.umpire_id}</Text>
    </ScrollView>
  );

  // Lineup Tab Content
  const LineupScreen = () => {
    if (!team1Data || !team2Data) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.detailText}>Loading team data...</Text>
        </View>
      );
    }

    return (
      <View style={styles.lineupContainer}>
        {/* Team 1 Section */}
        <View style={styles.teamSection}>
          <Text style={styles.teamTitle}>{team1Data.team_name}</Text>
          <Text style={styles.captainText}>C: {team1Data.captain_name}</Text>
          <ScrollView contentContainerStyle={styles.playerList}>
            {team1Players.map((player, index) => (
              <View key={index} style={styles.playerCard}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerRole}>({player.role})</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Divider Line */}
        <View style={styles.divider} />

        {/* Team 2 Section */}
        <View style={styles.teamSection}>
          <Text style={styles.teamTitle}>{team2Data.team_name}</Text>
          <Text style={styles.captainText}>C: {team2Data.captain_name}</Text>
          <ScrollView contentContainerStyle={styles.playerList}>
            {team2Players.map((player, index) => (
              <View key={index} style={styles.playerCard}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerRole}>({player.role})</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };
  // Ground Tab Content
  const GroundScreen = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.detailText}>Ground rules and details...</Text>
    </ScrollView>
  );

  // Wall Tab Content
  const WallScreen = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.detailText}>Wall updates and messages...</Text>
    </ScrollView>
  );

  const renderSliderItem = ({ item }: { item: any }) => (
    <Image source={item} style={styles.imageSlider} />
  );

  const handleArrowPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Image Slider */}
      <Carousel
        data={matchImages}
        renderItem={renderSliderItem}
        width={width}
        height={imageSliderHeight}
        loop={true}
      />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarButton}
        onPress={handleArrowPress}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBarButton}>
          <Icon name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab View for Match/Lineup/Ground/Wall */}
      <View style={styles.tabContainer}>
        
          <Tab.Navigator
            screenOptions={{
              tabBarLabelStyle: { color: '#fff' },
              tabBarStyle: { backgroundColor: '#000' },
              tabBarIndicatorStyle: { backgroundColor: '#005B41' },
            }}
          >
            <Tab.Screen name="Match" component={MatchScreen} />
            <Tab.Screen name="Lineup" component={LineupScreen} />
            {/* <Tab.Screen name="Ground" component={GroundScreen} />
            <Tab.Screen name="Wall" component={WallScreen} /> */}
          </Tab.Navigator>
        
      </View>

      {/* Floating Button for Joining the Match */}
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join Match</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageSlider: {
    width,
    height: imageSliderHeight,
    resizeMode: 'cover',
  },
  topBar: {
    position: 'absolute',
    top: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 1,
  },
  topBarButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 50,
  },
  tabContainer: {
    flex: 1,
    marginTop: 0, // Push the tab navigator below the slider
  },
  tabContent: {
    padding: 20,
    flex: 1,
    backgroundColor: '#000'
  },
  detailText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#005B41',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  lineupContainer: {
    flex: 1,
    flexDirection: 'row', // Display teams side by side
    padding: 10,
    paddingBottom: 100,
    backgroundColor: '#000',
  },
  teamSection: {
    flex: 1, // Each team section takes equal space
    marginHorizontal: 5, // Add some spacing between the teams
    
  },
  teamTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  playerText: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  captainText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  playerList: {
    alignItems: 'center',
  },
  playerCard: {
    backgroundColor: '#005B41',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    width: '95%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  playerName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  playerRole: {
    color: '#fff',
    fontSize: 12,
    fontStyle: 'italic',
  },
  divider: {
    width: 1,
    height: '90%',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 20,
  },
});

export default MatchDetailsScreen;
