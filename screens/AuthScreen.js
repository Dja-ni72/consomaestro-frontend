import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome, AntDesign, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { addUserIdToStore, addUsernameToStore } from '../reducers/userReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function AuthScreen() {
  const dispatch = useDispatch();
  // États pour gérer la modale de connexion et d'inscription
  const navigation = useNavigation();
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [isSignupModalVisible, setSignupModalVisible] = useState(false);

  // États pour stocker les informations de connexion
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // États pour stocker les informations d'inscription
  const [signupEmail, setSignupEmail] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // logique de connexion
  const handleSignIn = async () => {
     console.log('In signIn')
    try {
      const response = await fetch('https://consomaestro-backend.vercel.app/users/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          //.trim() retire les espaces en trop mis par inadvertance
          username: loginUsername.trim(),
          password: loginPassword.trim(),
        }),
      });
      const data = await response.json();
      console.log(data)
      if (data.result) {
        dispatch(addUserIdToStore(data.userId));
        dispatch(addUsernameToStore(data.username));
        await AsyncStorage.setItem('userToken', data.token);
        console.log(data.token)
        setLoginModalVisible(false); // Fermer la modale après connexion
        navigation.navigate('TabNavigator'); // Rediriger vers la page d'accueil
      } else {
        Alert.alert('Erreur', data.error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur de connexion', 'Veuillez réessayer.');
    }
  };
  
  // logique d'inscription
  const handleSignUp = async () => {
    console.log('handleSignUp')

     // Vérification du format de l'email avec une regex simple
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(signupEmail.trim())) {
    Alert.alert('Erreur', 'Veuillez entrer un email valide.');
    return;
  }

  // Vérification que le mot de passe fait au moins 5 caractères
  if (signupPassword.trim().length < 5) {
    Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 5 caractères.');
    return;
  }
  
    try {
      const response = await fetch('https://consomaestro-backend.vercel.app/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail.trim(),
          username: signupUsername.trim(),
          password: signupPassword.trim(),
        }),
      });
      
      const data = await response.json();
      if (data.result) {
        dispatch(addUsernameToStore(data.username));
        Alert.alert('Succès', data.message);
        await AsyncStorage.setItem('userToken', data.token);
        dispatch(addUserIdToStore(data.userId)); // Save user ID
        setSignupModalVisible(false); // Fermer la modale après inscription
        navigation.navigate('TabNavigator');
      } else {
        Alert.alert('Erreur', data.error);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur de création de compte', 'Veuillez réessayer.');
    }
  };

  return (
    <ImageBackground source={require('../assets/backgroundAuth.png')} style={styles.background}>
      <View style={styles.container}>

        <View style={styles.buttonContainer}>
          {/* Bouton Connexion */}
          <TouchableOpacity style={styles.button} onPress={() => setLoginModalVisible(true)}>
            <Text style={styles.buttonText}>Connexion</Text>
          </TouchableOpacity>

          {/* Bouton Inscription */}
          <TouchableOpacity style={styles.button} onPress={() => setSignupModalVisible(true)}>
          <Text style={styles.buttonText}>Créer mon compte</Text>
          <MaterialIcons name="eco" size={16} color="#faf9f3" style={styles.iconRight} />
          </TouchableOpacity>
        </View>

        {/* Modale de Connexion */}
        <Modal visible={isLoginModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Connexion</Text>
              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                placeholderTextColor="black"
                value={loginUsername}
                onChangeText={setLoginUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="black"
                value={loginPassword}
                onChangeText={setLoginPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Se connecter</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLoginModalVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modale d'Inscription */}
        <Modal visible={isSignupModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Créer un compte</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="black"
                value={signupEmail}
                onChangeText={setSignupEmail}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Nom d'utilisateur"
                 placeholderTextColor="black"
                value={signupUsername}
                onChangeText={setSignupUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="black"
                value={signupPassword}
                onChangeText={setSignupPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>S'inscrire</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSignupModalVisible(false)}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Boutons SSO */}
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <AntDesign name="google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <MaterialCommunityIcons name="apple" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E7734B',
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 112, 
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 5,
    borderColor: '#A77B5A',
    borderWidth: 1,
    borderRadius: 10,
  },
  button: {
  flexDirection: 'row',
  backgroundColor: '#A77B5A',
  paddingVertical: 10,
  paddingHorizontal: 20,
  width: 250, 
  borderRadius: 20,
  marginVertical: 10,
  alignItems: 'center',
  justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  iconRight: {
    marginLeft: 10, 
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E7734B',
    marginBottom: 10,
  },
  cancelText: {
    color: '#E7734B',
    fontSize: 16,
    marginTop: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '50%',
    position: 'absolute',
    bottom: 40, 
  },
  socialButton: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
});