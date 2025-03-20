import React, { useState,useEffect } from "react";
import { 
  View,
   StyleSheet, 
   ScrollView, 
   Text, 
   Image, 
   TouchableOpacity, 
   TextInput, Button, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { db, storage } from "@/firebaseConfig";
import { ref, uploadBytes,getDownloadURL } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { Buffer } from "buffer";
import OpenAI from "openai";
import fs from "fs";

export default function PlayerHighlightsScreen() {
  const router = useRouter();

  const [prompt, setPrompt] = useState(""); // Stores user input
  const [imageUri, setImageUri] = useState(""); // Explicitly type imageUri as string | null
  const [loading, setLoading] = useState(false); // Loading state
  const [invalidPrompt, setInvalidPrompt] = useState(false);
  const [teamExists, setTeamExists] = useState(true);
  const [selectedImage,setSelectedImage]= useState<string | null>(null);
  
  const [teamOwnerData,setTeamOwnerData] = useState({
    teamOwner_id: "",
    player_id: "",
    team_id:"",
    username:  "",
    password: "",

  });
  const [teamData, setTeamData] = useState({
       captain_id:"",
      captain_name:"",
      coach_id:"",
      highest_score: '',
      highlights:"",
      matches_lost: 0,
      matches_played: 0,
      matches_won: 0,
      players:"",
      ranking:"",
      team_id:"",
      team_name: "",
      wl_ratio: 0,
      profile_pic: "",
      kit_pic: "",
    });

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
            else{
              console.log("Team exists");
              await fetchTeamData();
            }
            
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        } finally{
          setLoading(false);
        }
      };
  
      fetchUserData();
    }, []);

    const fetchTeamData = async () => {
      try {
        const storedTeamOwnerData = await AsyncStorage.getItem("userData");
        if (storedTeamOwnerData) {
          const parsedTeamOwnerData = JSON.parse(storedTeamOwnerData);
          const teamOwnerTeamId = parsedTeamOwnerData.team_id;
          const teamCollectionRef = collection(db, "team");
    
          const q = query(teamCollectionRef, where("team_id", "==", teamOwnerTeamId));
          const querySnapshot = await getDocs(q);
    
          if (!querySnapshot.empty) {
            const teamDoc = querySnapshot.docs[0];
            const teamDocId = teamDoc.id;
            const teamData2 = teamDoc.data(); // Explicitly cast the data to TeamData type
    
            console.log("Fetched Team Data:", teamData2);
            setTeamData(teamData2 as any); // Assuming you have setTeamData to update your state
    
          } else {
            console.log("No team found with this team ID");
          }
        } else {
          console.log("Team owner data not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching team data: ", error);
      } finally {
        // setLoading(false);
      }
    };


  const regenerateImage = () => {
    const modifiedPrompt = prompt + " with slight variations";
    setPrompt(modifiedPrompt);
    generateImage();
  };

  const validatePrompt = (text: string) => {
    
    const lowerCaseText = text.toLowerCase();
    const validKeywords = ["cricket", "jersey", "shirt", "kit", "design", "sports", "team", "pattern", "logo", "collar", "color", "stripes", "sleeves"];
    const isValid = validKeywords.some((keyword) => lowerCaseText.includes(keyword));
    setInvalidPrompt(!isValid);
    return isValid;
  };
  const openai = new OpenAI({
    baseURL: "https://api.deepinfra.com/v1/openai",
    apiKey: "63xDLUG2OnRmYcqYFvURkRuOsxcp8V7P",
    dangerouslyAllowBrowser: true,
  });

  // Function to call Hugging Face API
  const generateImage = async () => {
    if (!prompt.trim()) return alert("Please enter a prompt!"); // Validate input

    setLoading(true);
    setImageUri(""); // Reset image

    try {
      console.log("Sending request with prompt:", prompt);

      // OpenAI API call
      const response = await openai.images.generate({
        prompt: prompt,
        model: "black-forest-labs/FLUX-1-schnell",
        n: 1,
        size: "1024x1024",
      });

      const base64Data = response.data[0].b64_json;
      const imageUri = `data:image/png;base64,${base64Data}`;
      setImageUri(imageUri);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error generating image. Please try again.");
    }

    setLoading(false);
  };

  const saveImage = async () => {
    if (!imageUri) {
      alert("No image to save!");
      return;
    }

    try{
      setLoading(true);
      const url = await uploadImageToFirebase(imageUri);
      console.log("Image uploaded. URL:", url);
      //update link to teamdata
      const teamId = teamData.team_id;
      const teamCollectionRef = collection(db, "team");
      const q = query(teamCollectionRef, where("team_id","==",teamId));
      const querySnapshot = await getDocs(q);
      if(!querySnapshot.empty){
        const teamDoc = querySnapshot.docs[0];
        const teamDocId = teamDoc.id;
        const teamDocRef = doc(db, "team", teamDocId);
        await updateDoc(teamDocRef,{
          kit_pic: url || teamData.kit_pic,
        });
        const updatedTeamData = {
          ...teamData,
          kit_pic: url || teamData.kit_pic,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedTeamData));
        setTeamData(updatedTeamData);
        setLoading(false);
      }
      else{
        console.log('Team not found to update');
      }
    } catch( e){
      console.log("Error updating: ", e);
    }
    
  };

  const uploadImageToFirebase = async (uri:string) => {
      try {
        setLoading(true);
        if (!uri || (typeof uri !== "string")) {
          throw new Error("Invalid image URI");
        }
        let blob;
        if(uri.startsWith("data:image")){
          const base64Data =uri.split(",")[1];
          blob = await fetch(`data:image/png;base64,${base64Data}`).then((r) => r.blob());
        }
        else{
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
          }
          blob = await response.blob();
        }
        const teamId = teamData.team_id;
          const storageRef = ref(storage, `team_kits/${teamId}`); // Create a storage reference with the player ID
          console.log("Uploading to Firebase Storage...");
          const snapshot = await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log("Image uploaded successfully. Download URL:", downloadURL);
          return downloadURL; // Return the image download URL
        
        // else{
        //   const response = await fetch(uri);
        //   if (!response.ok) {
        //     throw new Error(`Failed to fetch image: ${response.statusText}`);
        //   }
        //   const blob = await response.blob();
        //   console.log("Blob created:", blob); // Debugging
        //   const teamId = teamData.team_id;
        //   const storageRef = ref(storage, `team_kits/${teamId}`); // Create a storage reference with the player ID
        //   console.log("Uploading to Firebase Storage...");
        //   const snapshot = await uploadBytes(storageRef, blob);
        //   const downloadURL = await getDownloadURL(snapshot.ref);
        //   console.log("Image uploaded successfully. Download URL:", downloadURL);
        //   return downloadURL; // Return the image download URL
        // }


        // console.log("Fetching image from URI:", uri); // Debugging
        // const response = await fetch(uri);
        // if (!response.ok) {
        //   throw new Error(`Failed to fetch image: ${response.statusText}`);
        // }
        // const blob = await response.blob();
        // console.log("Blob created:", blob); // Debugging
        // const teamId = teamData.team_id;
        // const storageRef = ref(storage, `team_kits/${teamId}`); // Create a storage reference with the player ID
        // console.log("Uploading to Firebase Storage...");
        // const snapshot = await uploadBytes(storageRef, blob);
        // const downloadURL = await getDownloadURL(snapshot.ref);
        // console.log("Image uploaded successfully. Download URL:", downloadURL);
        // return downloadURL; // Return the image download URL
      } catch (error) {
        
        console.error("Error uploading image: ", error);
        throw error;
      }
      finally{
        setLoading(false);
      }
    };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity onPress={() => router.back()}>
          <Image source={require("@/assets/images/back_arrow.png")} style={styles.backIcon} />
        </TouchableOpacity> */}
        <Text style={styles.headerText}>Kit Design</Text>
      </View>
      {invalidPrompt? (
        <Text >Please include keywords like "cricket", "jersey", or "design".</Text>
      ): (<>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.imagePicker}>
                      { teamData.kit_pic ? (
                        <Image
                          source={{ uri: teamData.kit_pic }}
                          style={styles.profileImage}
                        />
                      ) : (
                        <Text style={styles.imagePickerText}>Select Profile Picture</Text>
                      )}
                    </TouchableOpacity>
        {/* Prompt Input */}
        <Text style={styles.label}>Enter Your Kit Design Prompt:</Text>
        <Text style={styles.label2}>(Please enter a detailed prompt for best results):</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Describe the kit you want..." placeholderTextColor="#ccc" value={prompt} onChangeText={setPrompt} multiline={true} numberOfLines={4} textAlignVertical="top" />

          {/* Clear Button */}
          {prompt.length > 0 && (
            <TouchableOpacity onPress={() => setPrompt("")} style={styles.clearButton}>
              <Text style={styles.clearText}>x</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* Generate Button */}
        <TouchableOpacity style={styles.button} onPress={generateImage} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Generating..." : "Generate Image"}</Text>
        </TouchableOpacity>
        {/* Loading Indicator */}
        {loading && <ActivityIndicator size="large" color="#00e676" style={{ marginTop: 20 }} />}
        {/* Display Generated Image */}
        {imageUri && <Image source={{ uri: imageUri }} style={styles.generatedImage} resizeMode="contain" />}

        {imageUri && (<>
          <TouchableOpacity style={styles.regenerateButton} onPress={regenerateImage}>
          <Text style={styles.regenerateButtonText}>Try Again 🔄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={saveImage}>
            <Text style={styles.saveButtonText}>Save Image 📷</Text>
          </TouchableOpacity></>
        )}

        {/* Example Prompts */}
        {/* Example Prompts Section */}
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesHeader}>Example Prompts:</Text>

          <Text style={styles.exampleText}>
            1) A fiery and intense cricket jersey with a deep orange and black combination. The design should include flame-like streaks across the shirt, with a mischievous fox mascot subtly blending into the background. Place a king cobra logo on the top right and add gold piping around the collar for a premium touch.{"\n\n"}
            2) A vibrant and energetic cricket shirt design featuring a bold red color scheme with a dynamic geometric pattern. Incorporate a playful panda mascot peeking out from behind the pattern and a logo of a lion on the top right. Add subtle white accents for contrast and consider a V-neck collar.
          </Text>
        </View>
      </ScrollView>
      </>)}

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  header: {
     flexDirection: "row",
      alignItems: "center",
       paddingTop: 35, 
       paddingLeft: 35,
       paddingBottom: 20,},
  backIcon: { width: 24, height: 24, marginLeft: 15, tintColor: "#fff" },
  headerText: { flex: 1, fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center", marginRight: 30 },
  scrollContainer: { alignItems: "center", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  label: { fontSize: 18, color: "white", marginBottom: 10 },
  label2: { fontSize: 18, color: "white", marginBottom: 10, alignContent: "center" ,alignItems: "center", justifyContent: "center", textAlign: "center"},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    position: "relative",
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 150, // Optional: Limits max expansion
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: "#000",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 5,
  },
  clearText: {
    fontSize: 18,
    color: "#888",
  },
  examplesContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    width: "90%",
    alignSelf: "center",
  },

  examplesHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#005b41",
    marginBottom: 5,
    textAlign: "center",
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

  exampleText: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 8,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#005b41",
    padding: 12,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
    alignSelf: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  button: { backgroundColor: "#005b41", padding: 12, borderRadius: 5, width: "100%", alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  regenerateButton: { backgroundColor: "#005b41", padding: 12, borderRadius: 5, width: "100%", alignItems: "center", marginTop: 10 },
  regenerateButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  generatedImage: { width: 300, height: 300, marginTop: 20, borderRadius: 10 },
  navbar: { flexDirection: "row", justifyContent: "space-around", position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#1e1e1e", paddingVertical: 7, borderTopLeftRadius: 50, borderTopRightRadius: 50, elevation: 20, paddingHorizontal: 20 },
  navItem: { alignItems: "center", padding: 10 },
  navIcon: { width: 25, height: 25, tintColor: "#fff" },
  highlight: { position: "absolute", bottom: 30, backgroundColor: "#005B41", borderRadius: 50, width: 70, height: 70, justifyContent: "center", alignItems: "center", borderColor: "#1e1e1e", borderWidth: 5 },
});
