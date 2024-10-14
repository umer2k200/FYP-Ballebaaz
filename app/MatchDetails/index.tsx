import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const imageSliderHeight = 250;

const matchImages = [
  require('@/assets/images/ground1.jpeg'),
  require('@/assets/images/ground2.jpg'),
];

// Match Tab Content
const MatchScreen = () => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.detailText}>KRL Cricket Stadium</Text>
    <Text style={styles.detailText}>24 Sep 2024</Text>
    <Text style={styles.detailText}>10:45 PM - 12:15 AM</Text>
    <Text style={styles.detailText}>5000 (manual payment)</Text>
    <Text style={styles.detailText}>11v11 format</Text>
  </ScrollView>
);

// Lineup Tab Content
const LineupScreen = () => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.detailText}>Information will be here...</Text>
  </ScrollView>
);

// Ground Tab Content
const GroundScreen = () => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.detailText}>Ground rules and details...</Text>
  </ScrollView>
);

// Wall Tab Content
const WallScreen = () => (
  <ScrollView style={styles.tabContent}>
    <Text style={styles.detailText}>Wall updates and messages...</Text>
  </ScrollView>
);

const Tab = createMaterialTopTabNavigator();

const MatchDetailsScreen = () => {
  // Image slider component using react-native-reanimated-carousel
  const renderSliderItem = ({ item }: { item: any }) => (
    <Image source={item} style={styles.imageSlider} />
  );

  const router = useRouter();

  const handleArrowPress = () => {
    router.push('/UmpireHome');
  };

  return (
    <View style={styles.container}>
      {/* Image Slider */}
      <Carousel
        data={matchImages}
        renderItem={renderSliderItem}
        width={width}
        height={imageSliderHeight}
        loop={true}
      />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBarButton}
        onPress={handleArrowPress}
        >
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topBarButton}>
          <Icon name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Tab View for Match/Lineup/Ground/Wall */}
      <View style={styles.tabContainer}>
        <NavigationContainer independent={true}>
          <Tab.Navigator
            screenOptions={{
              tabBarLabelStyle: { color: '#fff' },
              tabBarStyle: { backgroundColor: '#000' },
              tabBarIndicatorStyle: { backgroundColor: '#005B41' },
            }}
          >
            <Tab.Screen name="Match" component={MatchScreen} />
            <Tab.Screen name="Lineup" component={LineupScreen} />
            <Tab.Screen name="Ground" component={GroundScreen} />
            <Tab.Screen name="Wall" component={WallScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </View>

      {/* Floating Button for Joining the Match */}
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join Match</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageSlider: {
    width,
    height: imageSliderHeight,
    resizeMode: 'cover',
  },
  topBar: {
    position: 'absolute',
    top: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 1,
  },
  topBarButton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 50,
  },
  tabContainer: {
    flex: 1,
    marginTop: -400, // Push the tab navigator below the slider
  },
  tabContent: {
    padding: 20,
    flex: 1,
    backgroundColor: '#000'
  },
  detailText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#005B41',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MatchDetailsScreen;
