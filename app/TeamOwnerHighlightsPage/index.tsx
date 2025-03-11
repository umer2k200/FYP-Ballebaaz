import React, {useState, useEffect} from 'react';
import { View, StyleSheet, ScrollView, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Modal } from 'react-native';

interface match {
  dateTime: string;
  ground_id: string;
  match_id: string;
  highlights: string[];
  team1: string;
  team2: string;
  result: string;
  umpire_id: string;
}

export default function TeamHighlightsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [matchesList, setMatchesList] = useState<match[]>([]);
  const [teamExists, setTeamExists] = useState(true);
  const [teamOwnerData,setTeamOwnerData] = useState({
      teamOwner_id: "",
      player_id: "",
      team_id:"",
      username:  "",
      password: "",
    })

    useEffect(() => {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const storedUserData = await AsyncStorage.getItem("userData");
          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            console.log("Fetched User Data:", parsedUserData); // Debugging
            setTeamOwnerData(parsedUserData);
            //await fetchTeamData();
            if (parsedUserData.team_id === '') {
              setTeamExists(false);
              console.log("Team does not exist");
            }
            // else{
            //   console.log("Team exists");
            //   await fetchMatchesID();
            // }
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        } finally{
          setLoading(false);
        }
      };
      fetchUserData();
    }, []);

    useEffect(() => {
      if(teamOwnerData.team_id !== ''){
        fetchMatchesID();
      }
    }
    , [teamOwnerData]);

    const fetchMatchesID = async () => {
      setLoading(true);
      try{
        const teamID = teamOwnerData.team_id;
        const matchCollectionRef = collection(db, 'match');
        const q1 = query(matchCollectionRef, where('team1', '==', teamID),where('result', '==', 'completed'));
        const q2 = query(matchCollectionRef, where('team2', '==', teamID),where('result', '==', 'completed'));
        const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        const matches: match[] = [];
        querySnapshot1.forEach((doc) => {
          matches.push(doc.data() as match);
        });
        querySnapshot2.forEach((doc) => {
          matches.push(doc.data() as match);
        });
        console.log("Fetched Matches:", matches); 
        setMatchesList(matches);
      } catch(e){
        console.error('Error fetching matches:', e);
      }
      finally{
        setLoading(false);
      }
    };

    const [isModalVisible, setModalVisible] = useState(false);
    const toggleModal = () => {
      setModalVisible(!isModalVisible);
    };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require('@/assets/images/back_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Team Highlights</Text>
      </View>

      { loading? (
        <View style={styles.loaderContainer}>
                          <ActivityIndicator size='large' color='#005B41' />
                      </View>
      ):(<>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {matchesList.length === 0 ? (
                  <Text style={styles.videoTitle}>No matches found.</Text>
                ) : (
                  matchesList.map((match, index) => (
                    <TouchableOpacity 
                      style={styles.videoContainer} 
                      key={index} 
                    >
                      <Text style={styles.videoTitle}>Match {index + 1}</Text>
                      <Text style={styles.videoTitle2}>Match ID: {match.match_id}</Text>
                      <Text style={styles.videoTitle2}>vs: {match.team1 === teamOwnerData.team_id? match.team2: match.team1}</Text>
                      <Text style={styles.videoTitle2}>Location: {match.ground_id !== ''? match.ground_id: 'Not found'}</Text>
                      <Text style={styles.videoTitle2}>Date: {match.dateTime}</Text>
                      <TouchableOpacity
                              style={styles.matchesButton}
                              onPress={() => router.push({ pathname: '/TeamOwnerHighlightsPage2', params: { match_id: match.match_id, team_id : teamOwnerData.team_id } })}
                            >
                              <Text style={styles.matchesButtonText}>View Highlights</Text>
                            </TouchableOpacity>
                    </TouchableOpacity>
                  ))
              )}
      </ScrollView>
      </>)}

      {/* Fancy Navbar */}
            <View style={styles.navbar}>
              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerDrills')}>
                <Image
                  source={require('@/assets/images/drills.png')}
                  style={styles.navIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerBookGround-2')}>
                <Image
                  source={require('@/assets/images/stadium.png')}
                  style={styles.navIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerHomeScreen')}>
                <Image
                  source={require('@/assets/images/home.png')}
                  style={styles.navIcon}
                />
              </TouchableOpacity>
      
              <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerTeamsRanking')}>
                <Image
                  source={require('@/assets/images/ranking.png')}
                  style={styles.navIcon}
                />
              </TouchableOpacity>
      
              <TouchableOpacity style={styles.navItem} onPress={toggleModal}>
                <View style={styles.highlight}>
                  <Image
                    source={require('@/assets/images/more.png')}
                    style={styles.navIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Modal for expanded navigation */}
                  <Modal
                    visible={isModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={toggleModal}
                  >
                    <View style={styles.modalContainer}>
                      <View style={styles.expandedNavbar}>
                        <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerGenerateKit'); }}>
                          <Image
                            source={require('@/assets/images/kit.png')}
                            style={styles.navIcon}
                          />
                          <Text style={styles.expandedNavText}>AI Kit Generation</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerCommunity'); }}>
                          <Image
                            source={require('@/assets/images/community.png')}
                            style={styles.navIcon}
                          />
                          <Text style={styles.expandedNavText}>Community</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerHighlightsPage'); }}>
                          <Image
                            source={require('@/assets/images/cloud.png')}
                            style={styles.navIcon}
                          />
                          <Text style={styles.expandedNavText}>Highlights</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItemExpanded} onPress={() => { toggleModal(); router.push('/TeamOwnerSettings'); }}>
                          <Image
                            source={require('@/assets/images/settings.png')}
                            style={styles.navIcon}
                          />
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Light grayish background for a professional look
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 20,
  },
  backIcon: {
    width: 24,
    height: 24,
    marginLeft: 15,
    tintColor: '#fff',
  },
  headerText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginRight: 30,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100, // Add extra padding to avoid content being hidden behind the navbar
  },
  videoContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // Adds shadow for Android
    width: '100%', // Ensures video container covers 100% of the screen width
    height: 250, // Set a fixed height for consistency (adjust as needed)
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  videoTitle2: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingLeft: 10,
    marginBottom: 10,
    color: 'white',
  },
  matchesButton: {
    backgroundColor: "#005B41", // Blue color for the Attributes button
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    marginVertical: 5,
    width: "85%",
    alignSelf: "center",
  },
  matchesButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "bold",
  },
  video: {
    width: '100%',
    aspectRatio: 16 / 9, // Set a 16:9 aspect ratio for responsive video scaling
    borderRadius: 10,
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
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingRight: 30,
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
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
