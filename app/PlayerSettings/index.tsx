import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, updateDoc, getDocs, query, where, collection ,} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import CustomAlert from "@/components/CustomAlert";


export default function PlayerSettingsScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  
  const [userData, setUserData] = useState({
    name: "",
    username: "",
    phone_no: 0,
    role: "",
    password: "",
    player_id: "",
    strike_rate: 0,
    fitness_status: "",
    matches_played: 0,
    best_bowling: "",
    economy: 0,
    highlights: [],
    team_id: "",
    preferred_hand: "",
    bowling_hand: "",
    average: 0,
    training_sessions: [],
    assigned_drills: "",
    wickets_taken: 0,
    weight: 0,
    height: 0,
    age: 0,
    email: "",
    fiveWickets: 0,
    requestAccepted: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

    

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem("userData"); // Clear user data
      
      setTimeout(() => {
        router.push("/Login");
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error logging out:", error);
      setAlertMessage("Error logging out");
      setAlertVisible(true);
      
    }
  };

  const handleUpdate = async () => {
    const phoneRegex = /^03[0-9]{9}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{5,}$/;
    const passwordRegex = /^(?=.[A-Za-z])(?=.\d)[A-Za-z\d]{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Validation for Username
  if (username && !usernameRegex.test(username)) {
    setAlertMessage("Username must be at least 5 characters and contain only letters, numbers, and underscores");
    setAlertVisible(true);
    return;
  }

  // Validation for Phone Number
  if (phoneNumber && !phoneRegex.test(phoneNumber)) {
    setAlertMessage("Invalid phone number. It should start with '03' and contain 11 digits.");
    setAlertVisible(true);
    return;
  }

  // Validation for Password
  if (password && !passwordRegex.test(password)) {
    setAlertMessage("Password must be at least 8 characters and contain at least one letter and one number.");
    setAlertVisible(true);
    return;
  }
  if (email && !emailRegex.test(email)) {
    setAlertMessage("Invalid email format.");
    setAlertVisible(true);
    return;
  }
    try {
      setLoading(true);
      // Get the current user data from AsyncStorage
      const storedUserData = await AsyncStorage.getItem("userData");
      
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
  
        // Assuming player_id is unique and exists in the user data
        const userPlayerId = parsedUserData.player_id;
  
        // Create a reference to the "player" collection
        const playerCollectionRef = collection(db, "player");
  
        // Query Firestore for the document with this player_id
        const q = query(playerCollectionRef, where("player_id", "==", userPlayerId));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          // Assuming there's only one matching document
          const userDoc = querySnapshot.docs[0];
          const userDocId = userDoc.id; // Get the document ID dynamically
  
          // Create the reference to the Firestore document using the fetched userDocId
          const userDocRef = doc(db, "player", userDocId);
  
          // Update Firestore with the new data (username, phoneNumber, password)
          await updateDoc(userDocRef, {
            username: username || parsedUserData.username,
            phone_no: phoneNumber || parsedUserData.phone_no,
            password: password || parsedUserData.password,
            email : email || parsedUserData.email,
          });
  
          // Update the local user data in AsyncStorage
          const updatedUserData = {
            ...parsedUserData,
            username: username || parsedUserData.username,
            phone_no: phoneNumber || parsedUserData.phone_no,
            password: password || parsedUserData.password,
            email: email || parsedUserData.email,
          };
  
          await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
          setLoading(false);
          setAlertMessage("Profile updated successfully!");
          setAlertVisible(true);
        } else {
      
          setAlertMessage("User document not found in Firestore.");
          setAlertVisible(true);
        }
      } else {
        setAlertMessage("User data not found");
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Error updating user data: ", error);
      setAlertMessage("Update failed");
      setAlertVisible(true);
    }finally {
      setLoading(false);
    }
  };
  
  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };
  

  return (
    <View style={styles.container}>
      { loading? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color='#005B41' />
      </View>
      ): (
        <>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.title}>Settings</Text>

      {/* Username Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder={userData.username}
          placeholderTextColor="#999"
        />
      </View>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={userData.email}
          placeholderTextColor="#999"
        />
      </View>

      {/* Phone Number Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder={userData.phone_no.toString()}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your new password"
          secureTextEntry={true}
          placeholderTextColor="#999"
        />
      </View>

      {/* Update Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
        <Text style={styles.updateButtonText}>Update Profile</Text>
      </TouchableOpacity>

      {/* New Attributes Button */}
      <TouchableOpacity
        style={styles.attributesButton2}
        onPress={() => router.push("/PlayerSettingsAttributes")}
      >
        <Text style={styles.attributesButtonText}>Attributes</Text>
      </TouchableOpacity>

      {/* Hire Coach Button */}
      <TouchableOpacity
        style={styles.attributesButton}
        onPress={() => router.push("/PlayerHireCoach")}
      >
        <Text style={styles.attributesButtonText}>Hire Coach</Text>
      </TouchableOpacity>

        {/* View Teams Button */}
        {userData.team_id !==''? (<TouchableOpacity
        style={styles.attributesButton}
        onPress={() => router.push("/PlayerViewMyTeam")}
      >
        <Text style={styles.attributesButtonText}>My Team</Text>
      </TouchableOpacity>) : (<TouchableOpacity
        style={styles.attributesButton}
        onPress={() => router.push("/PlayerReqTeam")}
      >
        <Text style={styles.attributesButtonText}>View Teams</Text>
      </TouchableOpacity>)}
      

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      </ScrollView>
      </>
      )}

      
      {/* Aesthetic Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerDrills")}
        >
          <Image
            source={require("@/assets/images/drills.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerFitness")}
        >
          <Image
            source={require("@/assets/images/fitness.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerHomePage")}
        >
          <Image
            source={require("@/assets/images/home.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerCommunity")}
        >
          <Image
            source={require("@/assets/images/group.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/PlayerHighlightsPage")}
        >
          <Image
            source={require("@/assets/images/cloud.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/settings.png")}
              style={styles.navIcon}
            />
          </View>
        </View>
      </View>
      
      <CustomAlert 
        visible={alertVisible} 
        message={alertMessage} 
        onConfirm={handleAlertConfirm} 
        onCancel={handleAlertConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background color
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingTop: 80,
    paddingBottom: 100,
  },
  
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff", // Light text color for dark mode
    textAlign: "center",
    marginBottom: 20,
    marginTop:15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#bbb", // Softer color for labels
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#fff", // Light text color for dark mode
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  updateButton: {
    backgroundColor: "#005B41", // Teal color for the button
    padding: 15,
    borderRadius: 50, // Rounded buttons for aesthetic appeal
    alignItems: "center",
    //marginBottom: 20,
  },
  updateButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
  },
  logoutButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  attributesButton: {
    backgroundColor: "#3498db", // Blue color for the Attributes button
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 15,
  },
  attributesButton2: {
    backgroundColor: "#3498db", // Blue color for the Attributes button
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 15,
    marginTop:15,
  },
  attributesButtonText: {
    fontSize: 18,
    color: "#fff",
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
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  navItem: {
    alignItems: "center",
    padding: 10,
  },
  navIcon: {
    width: 25, // Slightly larger icons
    height: 25,
    tintColor: "#fff", // Light icon color
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
    shadowColor: "#00e676", // Bright shadow effect for the highlight
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#1e1e1e", // Darker border color for contrast
    borderWidth: 5,
  },
});