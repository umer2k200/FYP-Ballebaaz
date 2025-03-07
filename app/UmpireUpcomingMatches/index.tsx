import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';

// Define the Match type
type Match = {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  participants: string;
  paymentType: string;
  organizer: string;
};

// Dummy data for upcoming matches
const matchesData = [
  {
    id: '1',
    title: 'KKR vs Kings X1',
    date: '24 Sep 2024 10:45 PM',
    location: 'Murghzar Cricket Ground',
    price: 'Rs. 360',
    participants: '18/22',
    paymentType: 'Manual Payment',
    organizer: 'Sami Azizi',
  },
  {
    id: '2',
    title: 'Thunder X1 vs Man City',
    date: '28 Sep 2024 11:00 PM',
    location: 'KRL Cricket Ground',
    price: 'Rs. 400',
    participants: '19/22',
    paymentType: 'Manual Payment',
    organizer: 'Umer Z',
  },
];

const UpcomingMatchesScreen = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleMatchPress = () => {
    router.push('/MatchDetails');
  };

  const renderMatchItem = ({ item }: { item: Match }) => (
    <TouchableOpacity style={styles.matchCard} onPress={handleMatchPress}>
      <View style={styles.matchHeader}>
        <Image
          style={styles.matchImage}
          source={require('@/assets/images/upcomingMatchBoxpic.jpg')}
        />
        <View style={styles.matchDetails}>
          <Text style={styles.matchTitle}>{item.title}</Text>
          <Text style={styles.matchOrganizer}>by {item.organizer}</Text>
        </View>
        <Text style={styles.matchParticipants}>{item.participants}</Text>
      </View>
      <Text style={styles.matchDate}>{item.date}</Text>
      <Text style={styles.matchLocation}>{item.location}</Text>
      <Text style={styles.matchPrice}>
        {item.price} <Text style={styles.paymentType}>per person ({item.paymentType})</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Title */}
      <Text style={styles.upcomingMatchesTitle}>Upcoming Matches</Text>

      {/* Search by Date */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchLabel}>Search by Date</Text>
        <TouchableOpacity style={styles.datePicker}>
          <Icon name="calendar" size={20} color="white" />
          <Text style={styles.selectDateText}>{selectedDate || 'Select'}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.clearFilter}>Clear Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Match Cards */}
      <FlatList
        data={matchesData}
        renderItem={renderMatchItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.matchList}
      />

      {/* Bottom Navigation */}
      <View style={styles.navbar}>
        
      <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/UmpireHome")}
        >
          <Image
            source={require("@/assets/images/home.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <View style={styles.navItem}>
          <View style={styles.highlight}>
            <Image
              source={require("@/assets/images/upcomingmatches.png")}
              style={styles.navIcon}
            />
          </View>
        </View>

        

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/UmpireScoring")}
        >
          <Image
            source={require("@/assets/images/cric.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/UmpireSettings")}
        >
          <Image
            source={require("@/assets/images/settings.png")}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingBottom: 70, // Prevent content from hiding behind navbar
  },
  upcomingMatchesTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    marginTop:55,
  },
  searchContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchLabel: {
    color: 'white',
    fontSize: 16,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
  },
  selectDateText: {
    color: 'white',
    marginLeft: 8,
  },
  clearFilter: {
    color: '#f00',
    fontSize: 14,
  },
  matchList: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  matchCard: {
    backgroundColor: '#111',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 0.3,
    borderColor: '#fff',
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchDetails: {
    flex: 1,
    marginLeft: 8,
  },
  matchTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchOrganizer: {
    color: 'grey',
    fontSize: 14,
  },
  matchParticipants: {
    color: '#00ff00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchDate: {
    color: 'white',
    marginTop: 8,
  },
  matchLocation: {
    color: 'grey',
  },
  matchPrice: {
    color: 'white',
    marginTop: 8,
  },
  paymentType: {
    color: 'green',
    fontSize: 12,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    padding: 10,
  },
  navIcon: {
    width: 25,
    height: 25,
    tintColor: '#fff',
  },
  highlight: {
    position: 'absolute',
    bottom: 30,
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
});

export default UpcomingMatchesScreen;
