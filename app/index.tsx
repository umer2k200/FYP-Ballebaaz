import { useEffect } from "react"; // Import useEffect to handle side effects
import { useRouter } from "expo-router";
import { View, Image, StyleSheet } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    
    const timer = setTimeout(() => {
      router.push('/Onboarding');  
    }, 3000);

    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/logo.png')}  
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#121212',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
});
