import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import AppIntroSlider from 'react-native-app-intro-slider';
import { COLORS, SIZES } from '@/constants/onboardingTheme.jsx';

const slides = [
  {
    id: 1,
    title: 'In-Built DRS System',
    description: 'Make Accurate decisions using our in-built Drs System.',
    Image: require('@/assets/images/ump1.webp')
  },
  {
    id: 2,
    title: 'Add Player Feature',
    description: 'Players can join upcoming matches according to their schedules.',
    Image: require('@/assets/images/ump2.webp')
  },
  {
    id: 3,
    title: 'Player/Match Highlights',
    description: 'Player and Match highlights generated to track performances.',
    Image: require('@/assets/images/ump3.webp')
  },
];

export default function Onboarding() {
  const [showHomePage, setShowHomePage] = useState(false);
  const router = useRouter();
  const buttonLabel = (label: string) => {
    return (
      <View style={styles.buttonLabelContainer}>
        <Text style={styles.buttonLabel}>
          {label}
        </Text>
      </View>
    );
  }

  if (!showHomePage) {
    return (
      <AppIntroSlider
        data={slides}
        renderItem={({ item }) => {
          return (
            <View style={styles.slideContainer}>
              <Image
                source={item.Image}
                style={styles.slideImage}
                resizeMode="contain"
              />
              <Text style={styles.slideTitle}>
                {item.title}
              </Text>
              <Text style={styles.slideDescription}>
                {item.description}
              </Text>
            </View>
          );
        }}
        activeDotStyle={styles.activeDot}
        showSkipButton
        renderNextButton={() => buttonLabel("Next")}
        renderSkipButton={() => buttonLabel("Skip")}
        renderDoneButton={() => buttonLabel("Done")}
        onDone={() => {
          router.push('/Login');
        }}
      />
    );
  }

  return (
    <View style={styles.homeScreen}>
      <Text>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slideContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    paddingTop: 100,
    backgroundColor: "#121212", // Set background color here
  },
  slideImage: {
    width: SIZES.width - 80,
    height: 400,
  },
  slideTitle: {
    fontWeight: 'bold',
    color: 'darkgrey',
    fontSize: SIZES.h1,
  },
  slideDescription: {
    textAlign: 'center',
    paddingTop: 5,
    color: COLORS.title,
  },
  buttonLabelContainer: {
    padding: 12,
  },
  buttonLabel: {
    color: COLORS.title,
    fontWeight: '600',
    fontSize: SIZES.h4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 30,
  },
  homeScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#121212", // Set background color here
  },
});
