import React, { useState } from 'react';
import { useRouter } from "expo-router";
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import CustomAlert from '@/components/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function GroundBookingScreen() {
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<Date>(new Date());
  const [money, setMoney] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleAlertConfirm = () => {
    setAlertVisible(false);
  };
  const router = useRouter();

  // Date Change Handler
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  // Time Change Handler
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageName}>Ground Booking</Text>
      {/* Search bar */}
      {loading? (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size='large' color='#005B41' />
       </View>
    ):(<>
      <TextInput
        style={styles.input}
        placeholder="Search by ground name..."
        placeholderTextColor="#888"
      />

      {/* Date Filter */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text style={styles.inputText}>Date: {date.toDateString()}</Text>
      </TouchableOpacity>

      {/* Time Filter */}
      <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
        <Text style={styles.inputText}>Time: {time.toLocaleTimeString()}</Text>
      </TouchableOpacity>

      {/* Money Filter */}
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        placeholderTextColor="#888"
        value={money}
        onChangeText={setMoney}
      />

      {/* DateTimePickers */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}

      <TouchableOpacity style={styles.matchesButton} onPress={() => router.push('/TeamOwnerBookGround-2')}>
        <Text style={styles.matchesButtonText}>Search</Text>
      </TouchableOpacity>
      </>)}
    

      {/* Adjusted Navbar */}
      <View style={styles.navbar}>
        {/* Drills */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerDrills')}>
          <Image
            source={require('@/assets/images/drills.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        {/* Ground Booking (highlighted) */}
        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require('@/assets/images/stadium.png')}
              style={styles.navIcon}
            />
          </View>
        </View>

        {/* Home */}
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerHomeScreen')}>
          <Image
            source={require('@/assets/images/home.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/TeamOwnerTeamsRanking')}>
          <Image
            source={require('@/assets/images/ranking.png')} // Replace with your group icon URL
            style={styles.navIcon}
          />
        </TouchableOpacity>
        {/* More (Modal) */}
        <TouchableOpacity style={styles.navItem} onPress={toggleModal}>
          <Image
            source={require('@/assets/images/more.png')}
            style={styles.navIcon}
          />
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
            <TouchableOpacity
              style={styles.navItemExpanded}
              onPress={() => {
                toggleModal();
                router.push('/TeamOwnerGenerateKit');
              }}
            >
              <Image
                source={require('@/assets/images/kit.png')}
                style={styles.navIcon}
              />
              <Text style={styles.expandedNavText}>AI Kit Generation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItemExpanded}
              onPress={() => {
                toggleModal();
                router.push('/TeamOwnerCommunity');
              }}
            >
              <Image
                source={require('@/assets/images/community.png')}
                style={styles.navIcon}
              />
              <Text style={styles.expandedNavText}>Community</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItemExpanded}
              onPress={() => {
                toggleModal();
                router.push('/TeamOwnerHighlightsPage');
              }}
            >
              <Image
                source={require('@/assets/images/cloud.png')}
                style={styles.navIcon}
              />
              <Text style={styles.expandedNavText}>Highlights</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navItemExpanded}
              onPress={() => {
                toggleModal();
                router.push('/TeamOwnerSettings');
              }}
            >
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
  input: {
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 50,
    marginBottom: 20,
    color: '#fff',
  },
  inputText: {
    color: '#fff',
  },
  pageName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 50,
    marginTop: 50,
    textAlign: 'center',
  },
  matchesButton: {
    backgroundColor: '#005B41',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    marginVertical: 15,
  },
  matchesButtonText: {
    fontSize: 18,
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
    backgroundColor: '#1e1e1e',
    paddingVertical: 7,
    borderTopLeftRadius: 50,
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
    bottom: 35,
    backgroundColor: '#005B41',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderColor: '#1e1e1e',
    borderWidth: 5,
  },
  navIcon: {
    width: 35,
    height: 35,
    tintColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    marginTop: 5,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#005B41',
    borderRadius: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
