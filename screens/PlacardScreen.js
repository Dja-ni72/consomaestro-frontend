import React from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal,ScrollView} from "react-native";
import { useState, useEffect } from "react"; // Importation de useState et useEffect pour gérer l'état et les effets
import moment from "moment"; // Utilisation de moment.js pour manipuler les dates
import { useSelector } from "react-redux";

const PlacardScreen = () => {
   // Utilisation du hook de navigation pour gérer la navigation entre les écrans
  const navigation = useNavigation();
  const [shortDlcModalVisible, setShortDlcModalVisible] = useState(false); // État pour la modal de DLC courte
  const [longDlcModalVisible, setLongDlcModalVisible] = useState(false); // État pour la modal de DLC longue
  const [productsInfo, setProductsInfo] = useState(); // État pour les produits enregistrer par le user
  const userId = useSelector((state) => state.user.id);
  
  useEffect(() => {
    const fetchProducts = async () => {
        // const token = await AsyncStorage.getItem("userToken"); // Récupérer le token stocké
        
        fetch(`https://conso-maestro-backend.vercel.app/frigo/${userId}`, {
            method: "GET",
            headers: {
                // Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.result) {
                console.log("data from ", data);
                setProductsInfo(data.data); // Met à jour l'état avec les infos des produits
            } else {
                console.error("Erreur lors de la récupération des produits:", data.message);
            }
        })
        .catch((error) => {
            console.error("Erreur lors de la récupération des produits:", error);
        });
    };

    fetchProducts();
}, [navigation]);

  const handleCongeloPress = () => {
    navigation.navigate("CongeloScreen"); // Permet d'aller vers la page Congelo
  };

  const handleFridgePress = () => {
    navigation.navigate("FridgeScreen"); // Naviguer vers la page frigo
  };
  // Fonction pour déterminer la couleur du conteneur en fonction de la date de DLC
  const handleDlcColor = (dlcDate) => {
    const today = moment(); // Date actuelle
    const expirationDate = moment(dlcDate, "DD/MM/YYYY"); // Date de limite de consommation

    const daysRemaining = expirationDate.diff(today, "days"); // Différence en jours entre la date d'aujourd'hui et la DLC

    // Logique de couleur : Rouge si la DLC est à 2 jours ou moins, Orange si entre 2 et 4 jours, Vert sinon
    if (daysRemaining <= 2) {
      return styles.redDlcContainer;
    } else if (daysRemaining <= 4) {
      return styles.orangeDlcContainer;
    } else {
      return styles.greenDlcContainer;
    }
  };

  // Fonction pour afficher la modal si la couleur de DLC est rouge ou orange
  const handleDlcPress = (dlcDate) => { // Nouvelle fonction ajoutée
    const today = moment();             // Date actuelle
    const expirationDate = moment(dlcDate, "DD/MM/YYYY"); // Date de limite de consommation
    const daysRemaining = expirationDate.diff(today, "days");

    if (daysRemaining <= 4) {
      setShortDlcModalVisible(true);
    } else {
      setLongDlcModalVisible(true);
    }
  };

  const products = productsInfo ? productsInfo.map((data, i) => {
    console.log('productsInfo', productsInfo)
  return ( 
    <View style={styles.ProductLineContainer} key = {i} >
          <Text style={styles.ProductTitle}>{data.name}</Text>
          
          {/* Conteneur pour la date limite de consommation avec couleur dynamique */}
          <TouchableOpacity onPress={() => handleDlcPress(data.dlc)}> 
          <View style={[styles.DlcContainer, handleDlcColor(data.dlc)]}>
            <Text style={styles.DlcText}>{data.dlc}</Text>
          </View>
          </TouchableOpacity>

          {/* Bouton pour ajouter le produit au congélateur */}
          <View style={styles.buttonFreezer}>
            <TouchableOpacity onPress={handleCongeloPress}>
              <Image
                source={require("../assets/congelo.png")} // Icône de congélateur
                style={styles.freezerLogo}
              />
            </TouchableOpacity>
          </View>
        </View>
  )
}) : null;


  return (
    // Conteneur principal
    <View style={styles.container}>
      {/* Image d'un écureuil, positionnée en haut à gauche */}
      <Image
        source={require("../assets/Squirrel/Heureux.png")}
        style={styles.squirrel}
      />
      {/* Titre de la page */}
      <Text style={styles.PageTitle}>Mes Placards</Text>

      {/* Conteneur des produits dans le Placard */}
      <View  style={styles.productContainer}>
        {/* Affichage des produits */}
        <ScrollView Style={{ flexGrow: 1 }}>
        {products}
        </ScrollView>
      </View >

      {/* Boutons d'accès au congélateur */}
      <View style={styles.stocksButtonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCongeloPress}>
          <Text style={styles.buttonText}>Mon Congélo</Text>
        </TouchableOpacity>
        {/* Boutons d'accès aux placards */}
        <TouchableOpacity style={styles.button} onPress={handleFridgePress}>
          <Text style={styles.buttonText}>Mon Frigo</Text>
        </TouchableOpacity>
      </View>

      {/* DLC courte Modal */}
      <Modal
        transparent={true}
        visible={shortDlcModalVisible}
        animationType="slide"
        onRequestClose={() => setShortDlcModalVisible(false)}
      >
        <View style={styles.modalContainer}>
        <Image
        source={require("../assets/Squirrel/Triste.png")} // Chemin de l'image de l'écureuil
        style={styles.squirrelModal}
      />
          <Text style={styles.modalTitle}>
            Oh non, ton produit va bientôt périmer, cuisine-le vite ! Ton
            porte-monnaie et la Planète te diront MERCI ! !
          </Text>
          {/* Display rewards here */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShortDlcModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
     {/* DLC Longue Modal */}
     <Modal
        transparent={true}
        visible={longDlcModalVisible}
        animationType="slide"
        onRequestClose={() => setLongDlcModalVisible(false)}
      >
        <View style={styles.modalContainer}>
        <Image
        source={require("../assets/Squirrel/Heureux.png")} // Chemin de l'image de l'écureuil
        style={styles.squirrelModal}
      />
          <Text style={styles.modalTitle}>
            Tout va bien, il te reste encore quelques temps avant que ton produit ne se périme. Privilégie les produits ayant des dates plus courtes !
          </Text>
          {/* Display rewards here */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setLongDlcModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

// Styles pour les différents éléments du composant
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFE5D8",
    alignItems: "center",

  },
  squirrel: {
    width: 50,
    height: 50,
    marginTop: 65,
    marginBottom: 10,
  },
  PageTitle: {
    color: "#E56400",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  productContainer: {
    flex: 1,
    width: "85%",
    backgroundColor: "#A77B5A",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  
  ProductLineContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Pour espacer les éléments
    backgroundColor: "#FAF9F3",
    borderColor: "#A77B5A",
    borderWidth: 2,
    width: '100%',
    height: 52,
    borderRadius: 10,
    padding: 10,
    alignItems: "center", // Centrer verticalement
    marginTop: 5,
    marginBottom: 5,
  },
  ProductTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: "#E56400",
  },
  DlcButtonContainer: {
    flexDirection: "row", // Aligne les deux éléments horizontalement
    alignItems: "center",
  },
  DlcContainer: {
    justifyContent: "center",
    width: 94,
    height: 47,
    borderRadius: 10,
    padding: 10,
    marginRight: 2, // Espace entre DlcContainer et buttonFreezer
    right: -7,
  },
  DlcText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  buttonFreezer: {
    justifyContent: "center",
    backgroundColor: "#FAF9F3",
    borderColor: "#A77B5A",
    borderWidth: 1,
    width: 50,
    height: 47,
    borderRadius: 10,
    alignItems: "center",
    right: -7,
  },
  freezerLogo: {
    width: 30,
    height: 30,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  squirrelModal:{
    justifyContent: 'center',
    width: 95,
    height: 90,
    marginBottom: 30,
    padding: 10,
    
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#A77B5A",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  
  stocksButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "85%",
    paddingVertical: 10,
    backgroundColor: "#EFE5D8",
    
   
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF9F3",
    borderColor: "#A77B5A",
    borderWidth: 1,
    width: 150,
    height: 60,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#E56400",
  },
  //couleurs DLC dynamiques
  redDlcContainer: {
    backgroundColor: "#FF6347", // Rouge
  },
  orangeDlcContainer: {
    backgroundColor: "#FFA500", // Orange
  },
  greenDlcContainer: {
    backgroundColor: "#69914a", // Vert
  },
});




export default PlacardScreen;
