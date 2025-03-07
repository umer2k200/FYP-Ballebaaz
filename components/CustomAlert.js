import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomAlert = ({ visible, message, onConfirm, onCancel }) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel} // Handle hardware back button
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.alertMessage}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onConfirm}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    width: '80%',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  alertMessage: {
    fontSize: 17,
    marginBottom: 20,
    textAlign: 'center',
    color: 'lightgrey',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '70%',
  },
  button: {
    backgroundColor: '#005B41',
    padding: 7,
    borderRadius: 5,
    width: '55%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'lightgrey',
    fontSize: 16,
  },
});

export default CustomAlert;
