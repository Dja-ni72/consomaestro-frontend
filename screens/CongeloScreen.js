import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const CongeloScreen = () => {
  
    const navigation = useNavigation();
    
    const handlePlacardPress = () => {                     
        navigation.navigate('PlacardScreen')  // Permet d'aller vers la page Placard
    };
    const handleFridgePress = () => {             
        navigation.navigate('FridgeScreen'); // Naviguer vers la page frigo
    };
   
  
    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/Squirrel/Heureux.png")}
          style={styles.squirrel}
        />
  
        <Text style={styles.PageTitle}>Mon Congélo</Text>
        <View style={styles.productContainer}>
          {/* Affichage des produits */}
          <View style={styles.ProductLineContainer}>
            <Text style={styles.ProductTitle}>Produit 1</Text>
            <View style={styles.DlcContainer}>
            <Text style={styles.DlcText}>DLC</Text>
            </View>
            <View style={styles.buttonFreezer}>
            <TouchableOpacity onPress={handleFridgePress}>
            <Image
              source={require("../assets/FRIGO.png")}
              style={styles.freezerLogo}
            />
            </TouchableOpacity>
          </View>
          </View>
          <View style={styles.ProductLineContainer}>
            <Text style={styles.ProductTitle}>Produit 2</Text>
            <View style={styles.DlcContainer}>
            <Text style={styles.DlcText}>DLC</Text>
            </View>
            <View style={styles.buttonFreezer}>
            <TouchableOpacity onPress={handleFridgePress}>
            <Image
              source={require("../assets/FRIGO.png")}
              style={styles.freezerLogo}
            />
            </TouchableOpacity>
          </View>
          </View>
          <View style={styles.ProductLineContainer}>
            <Text style={styles.ProductTitle}>Produit 3</Text>
            <View style={styles.DlcContainer}>
            <Text style={styles.DlcText}>DLC</Text>
            </View>
            <View style={styles.buttonFreezer}>
            <TouchableOpacity onPress={handleFridgePress}>
            <Image
              source={require("../assets/FRIGO.png")}
              style={styles.freezerLogo}
            />
            </TouchableOpacity>
          </View>
          </View>
        </View>
  
        {/* Boutons d'accès au congélateur */}
        <View style={styles.stocksButtonsContainer}>
          <TouchableOpacity style={styles.button} onPress={handlePlacardPress }>
            <Text style={styles.buttonText}>Mes Placards</Text>
          </TouchableOpacity>
          {/* Boutons d'accès aux placards */}
          <TouchableOpacity style={styles.button} onPress={handleFridgePress}>
            <Text style={styles.buttonText}>Mon Frigo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#EFE5D8",
      alignItems: "center",
      justifyContent: "center",
    },
    squirrel: {
      position: "absolute",
      width: 50,
      height: 50,
      top: 65,
      left: 30,
    },
    PageTitle: {
      color: "#E56400",
      fontWeight: "bold",
      fontSize: 20,
      textAlign: "center",
      marginBottom: 20,
    },
    productContainer: {
      borderWidth: 1,
      backgroundColor: '#A77B5A',
      borderColor: "#A77B5A",
      width: "85%",
      height: "65%",
      borderRadius: 10,
      padding: 10,
      marginBottom: 20,
    },
    ProductLineContainer: {
      flexDirection:'row',
      backgroundColor: "#FAF9F3",
      borderColor: "#A77B5A",
      borderWidth: 2,
      width: 200,
      height: 50,
      borderRadius: 10,
      padding: 10,
      fontSize: 16,
      alignContent: 'space-between',
      marginTop: 5,
      marginBottom: 5,
      
    },
    ProductTitle: {
      justifyContent: "center",
      fontSize: 15,
      textAlign: "center",
      fontWeight: "bold",
      color: "#E56400",
    },
    DlcContainer:{
      justifyContent: "center",
      backgroundColor: "#FAF9F3",
      borderColor: "#A77B5A",
      borderWidth: 2,
      width: 50,
      height: 50,
      top:-11,
      borderRadius: 10,
      padding: 10,
      fontSize: 16,
      marginLeft: 125,
      
    },
    DlcText: {
  
    },
    buttonFreezer:{
      justifyContent: "center",
      backgroundColor: "#FAF9F3",
      borderColor: "#A77B5A",
      borderWidth: 2,
      width: 50,
      height: 50,
      top:-11,
      borderRadius: 10,
      padding: 10,
      fontSize: 16,
      marginLeft: 5,
    },
    freezerLogo: {
      width: 30,
      height: 30,
    },
    stocksButtonsContainer: {
      flexDirection: "row",
    },
    button: {
      justifyContent: "center",
      backgroundColor: "#FAF9F3",
      borderColor: "#A77B5A",
      borderWidth: 2,
      width: 150,
      height: 70,
      borderRadius: 10,
      padding: 10,
      marginRight: 16,
      marginLeft: 16,
      fontSize: 16,
    },
    buttonText: {
      fontWeight: "bold",
      textAlign: "center",
      color: "#E56400",
    },
  });

export default CongeloScreen;
