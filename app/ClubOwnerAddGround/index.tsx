import React, { useState,useEffect } from "react";
import { View, Text, TextInput,ScrollView, StyleSheet,Image, TouchableOpacity,  ActivityIndicator } from "react-native";
import { db,storage } from "@/firebaseConfig";
import { doc, updateDoc, getDocs, query, where, collection, addDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CustomAlert from "@/components/CustomAlert";
import { useRouter } from "expo-router";
export default function AddGroundScreen() {
  // State for ground details
  const [groundName, setGroundName] = useState("");
  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [capacity, setCapacity] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

  const router = useRouter();
  const groundData = {
    ground_id: "G" + Math.floor(Math.random() * 1000),
    name: groundName,
    location: location,
    revenue: hourlyRate,
    capacity: capacity,
    availibility: true,
    pic:selectedImage,
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

  const handleImagePicker = async () => {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access the media library is required!");
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri); // Set selected image URI from the assets array
    }
  };

  const uploadImageToFirebase = async (uri:string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const playerId = groundData.ground_id;
      const storageRef = ref(storage, `profile_pictures/${playerId}`); // Create a storage reference with the player ID

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL; // Return the image download URL
    } catch (error) {
      
      console.error("Error uploading image: ", error);
      throw error;
    }
  };

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
    
    if (groundName && location && capacity && hourlyRate && selectedImage) {
      try {
        setLoading(true);

        let imageUrl = groundData.pic;
      if (selectedImage) {
        imageUrl = await uploadImageToFirebase(selectedImage);
      }
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
         setLoading(false);
         router.push("/ClubOwnerHomePage");
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
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <Text style={styles.title}>Add New Ground</Text>
        {/* Image Picker */}
      <TouchableOpacity onPress={handleImagePicker} style={styles.imagePicker}>
              {selectedImage || groundData.pic ? (
                <Image
                  source={selectedImage? { uri: selectedImage } :  groundData.pic ? { uri: groundData.pic } : require("@/assets/images/assignedplayer.png")}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.imagePickerText}>Select Profile Picture</Text>
              )}
            </TouchableOpacity>
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
      </ScrollView>
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
  imagePicker: {
    marginBottom: 30,
    borderRadius: 100,
    width: 250,
    height: 250,
    justifyContent: "center",
    alignContent: "center",
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  imagePickerText: {
    color: "#999",
  },
  profileImage: {
    width: 250,
    height: 250,
    borderRadius: 100,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
});