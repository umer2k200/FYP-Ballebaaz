import {  CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [audioPermission,requestAudioPermission] = useMicrophonePermissions();
  const cameraRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasAllPermissions, setHasAllPermissions] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  // Request permissions and update the unified state
  useEffect(() => {
    const requestPermissions = async () => {
      const cameraGranted = cameraPermission?.granted ?? false;
      const mediaGranted = mediaPermission?.granted ?? false;
      const audioGranted = audioPermission?.granted ?? false;

      // Request permissions if not granted
      if (!cameraGranted) await requestCameraPermission();
      if (!mediaGranted) await requestMediaPermission();
      if (!audioGranted) await requestAudioPermission();

      console.log('Camera Permission:', cameraGranted);
        console.log('Media Permission:', mediaGranted);
        console.log('Audio Permission:', audioGranted);

      setHasAllPermissions(cameraGranted && mediaGranted && audioGranted);
    };

    requestPermissions();
  }, [cameraPermission, mediaPermission, audioPermission]);

  const startRecording = async () => {
    console.log('Start recording triggered');
    if (cameraRef.current && cameraReady && !isRecording) {
      
      try {
        setIsRecording(true);
        console.log('Recording started');
        await new Promise(resolve => setTimeout(resolve, 500));
        const video = await cameraRef.current.recordAsync({ quality: '720p', mute: false ,  orientation: 'portrait', deviceOrientation: 'portrait', videoBitrate: 4000000, fps: 60, codec: 'h264' }); //10mb , maxFileSize: 10000000, maxDuration: 10
        console.log('Video recorded',video)
        if (video.uri){
            console.log('Video recorded to:', video.uri);
            const asset = await MediaLibrary.createAssetAsync(video.uri);
            console.log('Asset created:', asset.uri);
        }
        else{
            console.log('No video recorded');
        }
      } catch (error) {
        console.error('Error during recording:', error);
      } finally {
        setIsRecording(false);
      }
    }
    else{
        console.log('Camera not ready or already recording');
    }
  };

  const stopRecording = () => {
    console.log('Stop recording triggered');
    if (cameraRef.current && isRecording) {
        // setTimeout(() => {
        //     cameraRef.current.stopRecording();
        //     console.log('Stopped recording');
        //   }, 3000); // Delay of 3 seconds
      console.log('Stopped recording');
      cameraRef.current.stopRecording();
    }
    else{
        console.log('No recording to stop');
    }
  };

  if (!hasAllPermissions) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
            We need permissions to access the camera, media library, and microphone
            </Text>
        <Button title="Retry Permissions" onPress={() => setHasAllPermissions(false)} />
      </View>
    );
  }
//   if ( hasAllPermissions){
//     startRecording();
//   }

  return (
    <View style={styles.container}>
      <CameraView 
        mode='video'
        ref={cameraRef} 
        style={styles.camera} 
        facing={facing} 
        onCameraReady={() => setCameraReady(true)}
        > 
        <View style={styles.overlay}>
        <TouchableOpacity style={styles.scoreButton} onPress={startRecording}>
            <Text style={styles.scoreText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.scoreButton}>
            <Text style={styles.scoreText}>6</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.endButton} onPress={stopRecording}>
            <Text style={styles.endText}>End</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scoreButton: {
    padding: 20,
    backgroundColor: 'green',
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  endButton: {
    padding: 20,
    backgroundColor: 'red',
    borderRadius: 10,
  },
  endText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});
