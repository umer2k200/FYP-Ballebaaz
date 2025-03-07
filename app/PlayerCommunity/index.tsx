import { useState,useEffect } from 'react';
import React from 'react';
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput , ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, query, orderBy,getDocs, serverTimestamp } from "firebase/firestore"; 
import { db } from '@/firebaseConfig'; 

type Message = {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
};
export default function CommunityScreen() {
  const [messages, setMessages] = useState<Message[]>([]); // Store community messages
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
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
    training_sessions: [],
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

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          console.log("Fetched User Data:", parsedUserData); // Debugging
          setUserData(parsedUserData);
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
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const communityRef = collection(db, 'community'); // Reference to the community collection
        const q = query(communityRef, orderBy('timestamp', 'asc')); // Create a query with the orderBy clause
  
        const snapshot = await getDocs(q); // Execute the query and get the documents
  
        const messagesArray: Message[] = snapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
          message: doc.data().message,
          timestamp: doc.data().timestamp.toDate(),
        }));
  
        setMessages(messagesArray); // Update the state with the fetched messages
      } catch (error) {
        console.log('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchMessages();
  }, []);

  const sendMessage = async () => {
    if (newMessage.trim() !== '') {
      setLoading(true);
      await addDoc(collection(db, "community"), {
        username: userData.username,
        message: newMessage,
        timestamp: serverTimestamp(), // Use serverTimestamp instead of new Date()
      });
      setNewMessage('');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={require('@/assets/images/back_arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Community</Text>
      </View>
      {loading? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size='large' color='#005B41' />
       </View>
      ):(<>

      {/* Community msgs */}
      <ScrollView style={styles.messageContainer}>
        {messages.map((msg) => (
          <View key={msg.id} style={styles.messageBox}>
            <Text style={styles.username}>{msg.username}</Text>
            <Text style={styles.message}>{msg.message}</Text>
          </View>
        ))}
      </ScrollView>
      </>)}

      {/* Message Input Button */}
      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#b0b0b0"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Image source={require('@/assets/images/send.png')} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1e1e1e', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex:1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 20,
    backgroundColor: '#005B41', // Header background color
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
    marginRight:30,
  },
  messageContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageBox: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#1c1c1c', // Dark message box background
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    color: '#b0b0b0', // Light grey text color
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#121212', // Dark background to blend with the main screen
    borderTopWidth: 1,
    borderColor: '#333333', // Border for the top
  },
  messageInput: {
    flex: 1,
    color: '#fff',
    backgroundColor: '#444444',
    borderRadius: 30,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444444', // Slightly lighter dark color for the button
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  messageIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
    tintColor: '#fff',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444444',
    borderRadius: 30,
    padding: 10,
  },
  sendIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  
  messageButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});