import React, { useState,useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity,  ActivityIndicator } from "react-native";
import { db } from "@/firebaseConfig";
import { doc, updateDoc, getDocs, query, where, collection, addDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "@/components/CustomAlert";

export default function AddGroundScreen() {
  // State for ground details
  const [groundName, setGroundName] = useState("");
  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const [clubOwnerData, setclubOwnerData] = useState({
    clubOwner_id: "",
    clubOwner_name: "",
    username: "",
    email: "",
    ground_id: "",
    revenue: 0,
    bookings: [],
    phone_no: 0,
    password: "",
  });

  const groundData = {
    ground_id: "G" + Math.floor(Math.random() * 1000),
    name: groundName,
    location: location,
    revenue: hourlyRate,
    capacity: capacity,
    availibility: true,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setclubOwnerData(parsedUserData);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    //setLoading(true);
    try {
      setLoading(true);
      // Get the current user data from AsyncStorage
      const storedUserData = await AsyncStorage.getItem("userData");
      
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
  
        // Assuming player_id is unique and exists in the user data
        const userclubOwnerId = parsedUserData.clubOwner_id;
  
        // Create a reference to the "player" collection
        const userclubOwnerCollectionRef = collection(db, "clubOwner");
  
        // Query Firestore for the document with this player_id
        const q = query(userclubOwnerCollectionRef, where("clubOwner_id", "==", userclubOwnerId));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          // Assuming there's only one matching document
          const userDoc = querySnapshot.docs[0];
          const userDocId = userDoc.id; // Get the document ID dynamically
  
          // Create the reference to the Firestore document using the fetched userDocId
          const userDocRef = doc(db, "clubOwner", userDocId);
  
          // Update Firestore with the new data (username, phoneNumber, password)
          await updateDoc(userDocRef, {
            ground_id: groundData.ground_id,
          });
  
          // Update the local user data in AsyncStorage
          const updatedUserData = {
            ...parsedUserData,
            ground_id: groundData.ground_id,
          };
  
          await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
          // setLoading(false);
          // setAlertMessage("Ground add successfully!");
          // setAlertVisible(true);
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
  
  const handleAddGround = async () => {
    
    if (groundName && location && capacity && hourlyRate) {
      try {
        const docRef = await addDoc(collection(db, "ground"), groundData);
        console.log("Document written with ID: ", docRef.id); 
        handleUpdate();
        setAlertMessage("Ground added successfully!");
        setAlertVisible(true);
        
      } catch (error) {
        console.error("Error adding document: ", error);
        setAlertMessage("Failed to add ground");
      setAlertVisible(true);
      }finally {
        // setLoading(false);
      }

      // Clear the fields after adding
      setGroundName("");
      setLocation("");
      setCapacity("");
      setHourlyRate("");
    } else {
      setAlertMessage("Please fill all fields");
      setAlertVisible(true);
    }
  };

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };
  
  return (
    <View style={styles.container}>

      {loading? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color='#005B41' />
      </View>
      ): (
        <>
      <Text style={styles.title}>Add New Ground</Text>

      {/* Ground Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Ground Name"
        placeholderTextColor="#888"
        value={groundName}
        onChangeText={setGroundName}
      />

      {/* Ground Location Input */}
      <TextInput
        style={styles.input}
        placeholder="Location"
        placeholderTextColor="#888"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.input}
        placeholder="Capacity"
        placeholderTextColor="#888"
        value={capacity}
        onChangeText={setCapacity}
      />

      {/* Hourly Rate Input */}
      <TextInput
        style={styles.input}
        placeholder="Cost per Hour (in Rs)"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={hourlyRate}
        onChangeText={setHourlyRate}
      />

      {/* Add Ground Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddGround}>
        <Text style={styles.buttonText}>Add Ground</Text>
      </TouchableOpacity>
      </>
      )}
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
    backgroundColor: "#121212",
    padding: 25,
    justifyContent: "center",
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "lightgrey",
    textAlign: "center",
    marginBottom: 80,
    
  },
  input: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 10,
  },
  timingButton: {
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 10,
    marginBottom:10,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#005B41", // Highlight the selected button
  },
  timingText: {
    color: "#fff",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#005B41",
    padding: 15,
    width: "50%",
    alignSelf: "center",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});