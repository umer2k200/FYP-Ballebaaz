import React, { useState, useEffect } from 'react';
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Modal, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { db } from '@/firebaseConfig'; // Adjust the import according to your structure
import { collection, getDocs, addDoc, query, where, updateDoc, arrayUnion } from 'firebase/firestore'; // Added 'addDoc'
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from '@/components/CustomAlert';


// Define the Ground interface
interface Ground {
  ground_id: string; // Firestore uses string IDs
  name: string;
  location: string;  // New field for location
  revenue: string;   // New field for revenue
  picture: any; // Use 'any' for local images
}

export default function GroundBooking() {
  const [grounds, setGrounds] = useState<Ground[]>([]); // State to hold ground data
  const [expanded, setExpanded] = useState<string | null>(null); // For managing expanded state
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // For managing selected time
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // For managing selected date
  const [modalVisible, setModalVisible] = useState(false); // For modal visibility
  const [TeamId, setTeamId] = useState(''); // For storing first team ID
  const [secondTeamId, setSecondTeamId] = useState(''); // For storing second team ID
  const [bookingDateTime, setBookingDateTime] = useState(''); // For storing booking date and time
  const [selectedGround, setSelectedGround] = useState<string | null>(null); // For storing selected ground id
  const [selectedGroundPrice, setSelectedGroundPrice] = useState<string | null>(null); // For storing selected ground id
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [teamOwnerId, setTeamOwnerId] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };


  const [teamOwnerData, setTeamOwnerData] = useState({
    teamOwner_id: "",
    player_id: "",
    team_id: "",
    username: "",
    password: "",

  })

  const [userData, setUserData] = useState({
    username: "",
    phone_no: 0,
    email: "",
    team_id: "",
    teamOwner_id: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          setUsername(parsedUserData.username);
          setPhoneNumber(parsedUserData.phone_no.toString());
          setTeamOwnerId(parsedUserData.teamOwner_id);
        }
      } catch (error) {
        console.log("Error fetching user data:", error);
      } finally{
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);


  // Fetch ground data on component mount
  useEffect(() => {
    const getGrounds = async () => {
      const querySnapshot = await getDocs(collection(db, 'ground')); // Fetch data from the 'ground' collection
      const fetchedGrounds: Ground[] = querySnapshot.docs.map(doc => ({
        ground_id: doc.id,
        ...doc.data(),
      })) as Ground[]; // Map documents to Ground interface

      setGrounds(fetchedGrounds); // Update state with fetched data
    };

    getGrounds(); // Call the async function
  }, []); // Empty dependency array to run only on mount

  // Toggle expand/collapse for each ground
  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id); // Toggle expansion for a particular ground
    setSelectedTime(null); // Reset selected time when changing ground
    setSelectedDate(null); // Reset selected date when changing ground
  };

  // Generate random booking ID
  const generateRandomId = () => {
    return `B${Math.floor(Math.random() * 1000)}`;
  };


  // Handle booking button press
  const handleBookPress = (groundId: string, revenue: string) => {
    setSelectedGround(groundId); // Set the selected ground id
    setSelectedGroundPrice(revenue);
    setModalVisible(true); // Show the modal
  };

  // Handle booking confirmation
  const confirmBooking = async () => {
    if (TeamId && secondTeamId && bookingDateTime && selectedGround) {
      try {
        setLoading(true);
        const randomBookingId = generateRandomId();
        // Add a new document in the 'booking' collection
        const bookingRef = await addDoc(collection(db, 'booking'), {
          booking_id: randomBookingId,
          dateTime: bookingDateTime,
          ground_id: selectedGround,
          payment_status: "pending",
          price: selectedGroundPrice,
          team1: TeamId,
          team2: secondTeamId,
          teamOwner_id: userData.teamOwner_id,
          umpire_id: "",
        });
        console.log(`Booking created with ID: ${bookingRef.id}`);

        // For appending booking_id in bookings section

        const clubOwnerQuery = query(collection(db, 'clubOwner'), where('ground_id', '==', selectedGround));
        const clubOwnerRef = await getDocs(clubOwnerQuery);

        if (!clubOwnerRef.empty) {
          const doc = clubOwnerRef.docs[0]; // Assuming there's only one document with that ground_id
          await updateDoc(doc.ref, {
            bookings: arrayUnion(randomBookingId), // Append booking_id to bookings array
          });
          console.log(`Booking ID ${randomBookingId} added to clubOwner document with ID: ${doc.id}`);
        } else {
          console.log(`No clubOwner found for ground ID: ${selectedGround}`);
        }


        // Close the modal and reset form after successful booking
        setModalVisible(false);
        setTeamId('');
        setSecondTeamId('');
        setBookingDateTime('');
        setSelectedGround(null);
      } catch (error) {
        console.error("Error creating booking: ", error);
      } finally{
        setLoading(false);
      }
    } else {
      setAlertMessage('Please fill in all the details.');
      setAlertVisible(true);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Back Button and Page Name */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/TeamOwnerHomeScreen')}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.pageName}>Ground Booking</Text>
        </View>
        {loading? (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size='large' color='#005B41' />
       </View>
    ):(<>

        {grounds.map((ground) => (
          <View key={ground.ground_id} style={styles.groundContainer}>
            <TouchableOpacity onPress={() => toggleExpand(ground.ground_id)}>
              <View style={styles.headerContainer}>
                <View>
                  <Text style={[styles.groundName, expanded === ground.ground_id && styles.groundNameExpanded]}>
                    {ground.name}
                  </Text>
                  <Text style={styles.groundPrice}>{ground.revenue}</Text>
                  <Text style={styles.groundLocation}>{ground.location}</Text>
                </View>
                <Image
                  source={ground.picture}
                  style={[styles.groundImage, expanded === ground.ground_id && styles.groundImageExpanded]}
                />
                <Icon
                  name={expanded === ground.ground_id ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={24}
                  color="#fff"
                />
              </View>
            </TouchableOpacity>
            {expanded === ground.ground_id && (
              <View style={styles.expandedContainer}>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookPress(ground.ground_id, ground.revenue)}
                >
                  <Text style={styles.bookButtonText}>Book Ground</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
        </>)}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Book Ground</Text>
              <TextInput
                style={styles.input}
                placeholder="Team ID"
                placeholderTextColor="lightgrey"
                value={TeamId}
                onChangeText={setTeamId}
              />
              <TextInput
                style={styles.input}
                placeholder="Second Team ID"
                placeholderTextColor="lightgrey"
                value={secondTeamId}
                onChangeText={setSecondTeamId}
              />
              <TextInput
                style={styles.input}
                placeholder="Date and Time"
                placeholderTextColor="lightgrey"
                value={bookingDateTime}
                onChangeText={setBookingDateTime}
              />
              <TouchableOpacity style={styles.confirmButton} onPress={confirmBooking}>
                <Text style={styles.cbuttonText}>Confirm Booking</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cbuttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
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
    justifyContent: 'space-between',
    marginTop: 50,
    marginBottom: 50,
  },
  pageName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1, // Makes sure the page name is centered

  },
  groundContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  groundLocation: {
    fontSize: 14,
    color: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groundName: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 10,
  },
  groundNameExpanded: {
    fontSize: 22,
  },
  groundPrice: {
    fontSize: 16,
    color: '#00e676',
  },
  groundImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  groundImageExpanded: {
    width: 150,
    height: 150,
  },
  expandedContainer: {
    marginTop: 10,
  },
  availableTimesLabel: {
    color: '#fff',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  time: {
    color: 'white',
    marginBottom: 5,
    padding: 10,
    borderRadius: 5,
  },
  selectedTime: {
    backgroundColor: '#005B41',
    color: '#fff',
  },
  selectedDate: {
    backgroundColor: '#005B41',
  },
  bookButton: {
    backgroundColor: '#005B41',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#005B41',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 5,
    padding: 5,
  },
  cancelButton: {
    backgroundColor: '#005B41',
    borderRadius: 10,
    alignItems: 'center',
    padding: 5,
  },
  cbuttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    color: 'white',
    borderRadius: 10,
  },
});
