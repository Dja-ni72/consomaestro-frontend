import React, { useState, useEffect } from "react";
import {Text,View,Button,StyleSheet,TextInput,TouchableOpacity,ImageBackground,Modal,Alert,Image,KeyboardAvoidingView,TouchableWithoutFeedback,Keyboard,Platform,} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

export default function ScanScreen() {
  // États pour la gestion des permissions, du scanner, des données et du modal
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [barcodeData, setBarcodeData] = useState(null);
  const [product, setProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dlc, setDlc] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [storagePlace, setStoragePlace] = useState("");
  const [productId, setProductId] = useState(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const userId = useSelector((state) => state.user.id);
  const navigation = useNavigation();

  // Images pour les lieux de stockage
  const fridgeImage = require("../assets/FRIGO.png");
  const freezerImage = require("../assets/congelo.png");
  const cupboardImage = require("../assets/Placard.png");

  // Demande de permissions pour accéder à la caméra
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getBarCodeScannerPermissions();
  }, []);

  // Gestion de la visibilité du clavier
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Fonction appelée lors du scan d'un code-barres
  const handleBarCodeScanned = ({ data }) => {
    console.log("Code-barres scanné : ", data);
    setScanned(true);
    setBarcodeData(data);
    fetchProductData(userId, data);
  };

  // Fonction appelée lors de la saisie manuelle d'un code-barres
  const handleBarCodeWrite = () => {
    setScanned(true);
    fetchProductData(userId, barcodeData);
  };

  // Fonction pour récupérer les données du produit via l'UPC
  const fetchProductData = async (userId, data) => {
    console.log("Recherche du produit avec l'UPC : ", data);
    try {
      const response = await fetch(`https://consomaestro-backend.vercel.app/products/${userId}/${data}`);
      const result = await response.json();
      console.log("Données récupérées : ", result);

      if (result.result === false) {
        Alert.alert("Erreur", result.message);
        setScanned(false);
      } else {
        setProduct(result.product);
        setShowModal(true);
        setProductId(result.product._id);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données : ", error);
    }
  };

  // Gestion de la visibilité du sélecteur de date
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // Confirmation de la date sélectionnée
  const handleConfirm = (date) => {
    setDlc(date);
    hideDatePicker();
  };

  // Fonction pour sauvegarder le produit avec la DLC et le lieu de stockage
  const saveProduct = async () => {
    if (!dlc || !storagePlace) {
      Alert.alert("Erreur", "Veuillez sélectionner une DLC et un lieu de stockage");
      return;
    }

    const formattedDlc = dlc.toISOString().split("T")[0];
    try {
      const response = await fetch(`https://consomaestro-backend.vercel.app/products/${formattedDlc}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          upc: barcodeData,
          dlc: formattedDlc,
          user: userId,
          _id: productId,
          storagePlace,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Succès", data.message);
        setShowModal(false);
        setBarcodeData(null);
        setProductId(null);
        setScanned(false);
      } else {
        Alert.alert("Erreur", data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Erreur de connexion au serveur");
    }
  };

  // Gestion des permissions de la caméra
  if (hasPermission === null) {
    return <Text>Demande de permission de la caméra...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Pas d'accès à la caméra</Text>;
  }

  // Navigation vers l'écran Menu
  const handleFinish = () => {
    navigation.navigate('Menu');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "height" : "height"}
      >
        <ImageBackground source={require('../assets/backgroundScanne.png')} style={styles.background}>
          <View style={styles.container}>
            <View style={styles.textScan}>
            <Text style={styles.text}>Scannez votre produit</Text>
            </View>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={[styles.camera, isKeyboardVisible && styles.cameraKeyboardVisible]}
            />

            <Text style={styles.ou}>OU</Text>
            {/* Champ de saisie pour le code-barres */}
            <TextInput
              style={styles.input}
              placeholder="Je saisis mon code-barre..."
              placeholderTextColor="#664C25"
              keyboardType="numeric"
              value={barcodeData}
              onChangeText={setBarcodeData}
            />
            <TouchableOpacity onPress={handleBarCodeWrite} style={styles.valider}>
              <Text style={styles.buttonFinish}>Valider mon code-barre</Text>
            </TouchableOpacity>

            {/* Bouton pour valider les produits */}
            <View style={styles.enregistrement}>
            <TouchableOpacity style={styles.fin} onPress={handleFinish}>
              <Image style={styles.buttonCheck} source={require("../assets/buttonCheck.png")}/>
            </TouchableOpacity>
            </View>

            {/* Modal pour ajouter la DLC et l'endroit où stocker le produit */}
            <Modal style={styles.modal} visible={showModal} animationType="slide">
              <ImageBackground source={require('../assets/backgroundScanne.png')} style={styles.background}>
                <View style={styles.modalContainer}>
                  <View style={styles.productNameContainer}>
                    <Text style={styles.productName}>{product?.name}</Text>
                  </View>

                  {/* Sélecteur pour le lieu de stockage */}
                  <View style={styles.storageOption}>
                  <Text style={styles.textStockage}>Choisissez votre lieu de stockage:</Text>
                  </View>
                  <View style={styles.storageOptions}>
                    {[{ label: 'Frigo', image: fridgeImage },
                      { label: 'Congelo', image: freezerImage },
                      { label: 'Placard', image: cupboardImage }
                    ].map((place) => (
                      <TouchableOpacity
                        key={place.label}
                        onPress={() => setStoragePlace(place.label)}
                      >
                        <View style={storagePlace === place.label ? styles.selectedOptionImage : styles.noSelectedImage}>
                          <Image source={place.image} style={styles.optionImage} />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.date} onPress={showDatePicker}>
                    <Text style={styles.inputDate}>
                      {dlc ? dlc.toLocaleDateString() : "Sélectionner la DLC"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.enregistrerButtun} onPress={saveProduct}>
                    <Text style={styles.buttonText}>Enregistrer</Text>
                  </TouchableOpacity>

                  {/* Calendrier pour choisir la date */}
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                  />
                </View>
              </ImageBackground>
            </Modal>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: 300,
    height: 350,
    borderRadius: 10,
    marginBottom: 20,
  },
  cameraKeyboardVisible: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  
    color: "#fff",
  },
  textScan: {
    marginTop: 30,
    width: 300,
    height: 40,
    paddingTop: 5,
    borderRadius: 10,
    marginBottom: 40,
    backgroundColor: "#B19276",
  },
  ou: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E56400",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FAF9F3",
    borderWidth: 1,
    width: "85%",
    height: "8%",
    borderRadius: 10,
    borderColor: "#A77B5A",
    padding: 10,
    marginTop: 10,
    color: "#E56400",
  },
  fin: {
    marginTop: 20,
    marginBottom: 20,
    width: "40%",
    height: "5%",
    borderRadius: 10,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  productNameContainer: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#69914a",
    top: -80,
    borderColor: "#FFF",
    borderWidth: 1,
  },
  storageOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "80%",
    marginBottom: 20,
  },
  textStockage: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E56400",
    textAlign: "center",
  },
  storageOption: {
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    height: "5%",
    justifyContent: "center",
    borderColor: "#E56400",
    borderWidth: 1,
  },
  selectedOptionImage: {
    backgroundColor: '#E56400',
    padding: 5,                 
    borderRadius: 10,           
    alignItems: 'center',      
    justifyContent: 'center',   
    marginBottom: 5,           
    borderWidth: 2,             
    borderColor: '#FAF9F3', 
    width: 80,
    height: 80,    
  },
  noSelectedImage: {
    backgroundColor: '#A77B5A',
    padding: 5,                 
    borderRadius: 10,           
    alignItems: 'center',      
    justifyContent: 'center',   
    marginBottom: 5,           
    borderWidth: 2,             
    borderColor: '#FAF9F3',     
    width: 80,
    height: 80,
  },
  inputDate: {   
    fontSize: 20,
    color: "#E56400",
  },
  enregistrerButtun: {
    backgroundColor: "#E56400",
    width: 150,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  
  optionImage: {
    width: 50,
    height: 50,
    marginTop: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  date: {
    backgroundColor: "#FFFFFF",
    width: 200,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    marginTop: 50,  
    borderColor: "#E56400",
    borderWidth: 1,
  },
  buttonFinish: {
    color: "#fff",
    fontWeight: "bold",
  },
  valider: {
    backgroundColor: "#B19276",
    width: 200,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  enregistrement: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonCheck:{
    width: 80,
    height: 80, 
    zIndex: 1,
  },
  textCkeck:{
    zIndex: 50,
    color: "#fff",
  },
});
