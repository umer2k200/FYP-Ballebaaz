import React, { useState , useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator, } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {db } from '@/firebaseConfig';
import { doc, updateDoc, getDocs, query, where, collection } from 'firebase/firestore';
import CustomAlert from '@/components/CustomAlert';

export default function PlayerAttributesScreen() {
  const [role, setRole] = useState<string>('');
  const [battingHand, setBattingHand] = useState<string>('');
  const [bowlingHand, setBowlingHand] = useState<string>('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [userData, setUserData] = useState({
    name: '',
    username: '',
    phone_no: '',
    role: "",
    password: '',
    player_id: '', 
    fitness_status: "",
    matches_played: 0,
    best_bowling: "",
    highlights: [],
    team_id: "",
    preferred_hand: "",
    bowling_hand: "",
    training_sessions: '',
    assigned_drills: "",
    weight: 0,
    height: 0,
    age: 0,
    email: "",
    fiveWickets: 0,
    requestAccepted: false,
    runsScored : 0,
    ballsFaced : 0,
    battingAverage : 0,
    battingStrikeRate : 0,
    noOfTimesOut : 0,
    centuries : 0,
    halfCenturies : 0,
    oversBowled : 0,
    ballsBowled : 0,
    runsConceded : 0,
    wicketsTaken : 0,
    bowlingAverage : 0,
    economyRate : 0,
    bowlingStrikeRate : 0,
  });

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
        const storedTeamOwnerData = await AsyncStorage.getItem("userData");

        if (storedTeamOwnerData) {
          const parsedUserData = JSON.parse(storedTeamOwnerData);
          console.log("Fetched User Datassss:", parsedUserData); // Debugging
          setUserData(parsedUserData);

          const teamOwnerPlayerId=parsedUserData.player_id;

          console.log("TeamoOwnerPlayerId: ",teamOwnerPlayerId);

           // Step 2: Query the "player" collection for the document with this player_id
           const teamCollectionRef = collection(db, "player");

           const q = query(teamCollectionRef, where("player_id", "==", teamOwnerPlayerId));
           const querySnapshot = await getDocs(q);

           if (!querySnapshot.empty) {
            // Assuming there's only one matching document
            const playerDoc = querySnapshot.docs[0];
            const playerDocId = playerDoc.id;
            const playerData2 = playerDoc.data(); // Explicitly cast the data to TeamData type
    
            // Step 3: Use teamData for rendering or updating state
            console.log("Fetched TeamOwner Player Data:", playerData2);

          // Set state based on the fetched user data
          setRole(playerData2.role || '');
          setBattingHand(playerData2.preferred_hand === 'Right' || playerData2.preferred_hand === 'Left' ? playerData2.preferred_hand.split(' ')[0] : '');
          setBowlingHand(playerData2.bowling_hand === 'Right' || playerData2.bowling_hand === 'Left' ? playerData2.bowling_hand.split(' ')[0] : '');
          setAge(playerData2.age.toString() || '');
          setWeight(playerData2.weight.toString() || '');
          setHeightFeet(playerData2.height.toString() || '');
           }

           else {
            console.log("No player found with this player ID");
          }
          
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
      finally{
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSaveAttributes = async () => {
    
    try {
      setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            const userPlayerId = parsedUserData.player_id;

            // Fetch player_id from teamOwner collection
            const teamOwnerCollectionRef = collection(db, "player");
            const teamOwnerQuery = query(teamOwnerCollectionRef, where("player_id", "==", userPlayerId));
            const teamOwnerSnapshot = await getDocs(teamOwnerQuery);

            if (!teamOwnerSnapshot.empty) {
                const teamOwnerDoc = teamOwnerSnapshot.docs[0];
                const teamOwnerDocId = teamOwnerDoc.id;
                const teamOwnerDocRef = doc(db, "teamOwner", teamOwnerDocId);

                // Now update both player and teamOwner attributes
                const playerCollectionRef = collection(db, "player");
                const q = query(playerCollectionRef, where("player_id", "==", userPlayerId));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const userDoc = querySnapshot.docs[0];
                    const userDocId = userDoc.id;
                    const userDocRef = doc(db, "player", userDocId);

                    const preferredHand = `${battingHand}`;
                    const bowlinghand = `${bowlingHand}`;
                    
                    // Update player document
                    await updateDoc(userDocRef, {
                        role: role || parsedUserData.role,
                        preferred_hand: preferredHand || parsedUserData.preferred_hand,
                        bowling_hand: bowlinghand || parsedUserData.bowling_hand,
                        age: parseInt(age) || parsedUserData.age,
                        weight: parseFloat(weight) || parsedUserData.weight,
                        height: parseFloat(heightFeet) || parsedUserData.height,
                    });

                    setAlertMessage("Attributes updated successfully!");
                    setAlertVisible(true);
                } else {
                    setAlertMessage("Player document not found in Firestore.");
                    setAlertVisible(true);
                }
            } else {
                setAlertMessage("Team owner document not found in Firestore.");
                setAlertVisible(true);
            }
        } else {
            setAlertMessage("User data not found.");
            setAlertVisible(true);
        }
    } catch (error) {
        console.error("Error updating user data: ", error);
        setAlertMessage("Update failed");
        setAlertVisible(true);
    } finally {
        setLoading(false);
    }
};


  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };


  return (
    <>
    
    <ScrollView style={styles.container}>
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image source={require('@/assets/images/back.png')} style={styles.navIcon} />
      </TouchableOpacity>

      <Text style={styles.title}>Attributes</Text>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color='#005B41' />
      </View>
      ) : (
        <>

      {/* Role Selection Container */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Role</Text>
        <View style={styles.buttonContainer}>
          {['Batsman', 'Bowler', 'Allrounder', 'Wicket Keeper'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.button, role === item && styles.selectedButton]}
              onPress={() => setRole(item)}
            >
              <Text style={styles.buttonText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Batting and Bowling Hand Selection Container */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred Hand</Text>
        <View style={styles.buttonContainer}>
          <Text style={styles.handLabel}>Batting Hand:</Text>
          {[ 'Left', 'Right'].map((hand) => (
            <TouchableOpacity
              key={hand}
              style={[styles.button, battingHand === hand && styles.selectedButton]}
              onPress={() => setBattingHand(hand)}
            >
              <Text style={styles.buttonText}>{hand}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Text style={styles.handLabel}>Bowling Hand:</Text>
          {[ 'Left','Right'].map((hand) => (
            <TouchableOpacity
              key={hand}
              style={[styles.button, bowlingHand === hand && styles.selectedButton]}
              onPress={() => setBowlingHand(hand)}
            >
              <Text style={styles.buttonText}>{hand}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Age, Weight, Height Container */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Age, Weight, Height</Text>
        
        {/* Age Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Age"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            placeholderTextColor="#999"
          />
          <Text style={styles.unit}>yrs</Text>
        </View>

        {/* Weight Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Weight"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            placeholderTextColor="#999"
          />
          <Text style={styles.unit}>kg</Text>
        </View>



        {/* Height Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Height"
            keyboardType="numeric"
            value={heightFeet}
            onChangeText={setHeightFeet}
            placeholderTextColor="#999"
          />
          <Text style={styles.unit}>ft</Text>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveAttributes}>
        <Text style={styles.saveButtonText}>Save Attributes</Text>
      </TouchableOpacity>
      </>
  )}
      
    </ScrollView>
    
  <CustomAlert 
    visible={alertVisible} 
    message={alertMessage} 
    onConfirm={handleAlertConfirm} 
    onCancel={handleAlertConfirm}
  />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background color
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1e1e1e', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff', // Light text color for dark mode
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 15,
    left:10,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    borderRadius: 30,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#005B41', // Highlight color for selected options
  },
  buttonText: {
    fontSize: 14,
    color: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
  },
  handLabel: {
    fontSize: 16,
    color: '#bbb',  // Softer color for the label text
    marginBottom: 5,
    fontWeight: 'bold',
    marginHorizontal: 10,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#1e1e1e',
    fontSize: 16,
    color: '#fff', // Light text color for dark mode
    width: 70,
    textAlign: 'center',
  },
  unit: {
    color: '#bbb',
    marginHorizontal: 5,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#005B41', // Save button color
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: -28,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 10,
    marginTop: 15,
  },
  navIcon: {
    width: 25, // Slightly larger icons
    height: 25,
    tintColor: '#fff', // Light icon color
  },
});