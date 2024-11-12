import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ImageBackground,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

export default function ProfileScreen() {
  const navigation = useNavigation(); // Hook to navigate between screens
  const [userInfo, setUserInfo] = useState({
    email: "",
    username: "",
    password: "",
  }); // State to store user info
  const [isRewardsModalVisible, setRewardsModalVisible] = useState(false); // State to control Rewards modal visibility
  const [isSponsorshipsModalVisible, setSponsorshipsModalVisible] =
    useState(false); // State to control Sponsorships modal visibility
  const [isEditModalVisible, setEditModalVisible] = useState(false); // State to control Edit modal visibility
  // States to store edited user info
  const [editedEmail, setEditedEmail] = useState("");
  const [editedUsername, setEditedUsername] = useState("");
  // State to display a success message once the update's successful
  const [successMessage, setSuccessMessage] = useState("");
  // State to display a message when there are no changes
  const [noChangesMessage, setNoChangesMessage] = useState("");
  // State to control Account Deletion modal visibility
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  // State to display a success message once the delete's successful
  const [isAccountDeleted, setIsAccountDeleted] = useState(false);

  // useEffect hook to fetch user data when the component loads
  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = await AsyncStorage.getItem("userToken"); // Retrieve the stored token

      // Fetch user data from the backend
      fetch("https://consomaestro-backend.vercel.app/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          contentType: "application/json",
        }, // Send token in Authorization header
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("data from fetch", data);
          // Update state with user info if response is successful
          setUserInfo({
            email: data.user.email || "Non disponible",
            username: data.user.username || "Non disponible",
          });
        })
        .catch((error) => {
          console.error(error);
        });
    };

    fetchUserInfo(); // Calls fetchUserInfo function
  }, []);

  // Function to handle account deletion
  const handleDeleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        "https://consomaestro-backend.vercel.app/users/delete",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setIsAccountDeleted(true);
        await AsyncStorage.removeItem("userToken");
        setTimeout(() => {
          setDeleteModalVisible(false);
          navigation.navigate("AuthScreen");
        }, 3000);
      } else {
        console.error("Erreur lors de la suppression du compte");
      }
    } catch (error) {
      console.error("Erreur de suppression du compte:", error);
    }
  };

  const handleUpdateUserInfo = async () => {
    const token = await AsyncStorage.getItem("userToken"); // Retrieve the stored token
    console.log("Email à mettre à jour:", editedEmail);
    console.log("Nom d'utilisateur à mettre à jour:", editedUsername);

    const updateData = {};
    if (editedEmail && editedEmail !== userInfo.email) {
      updateData.email = editedEmail;
    }
    if (editedUsername && editedUsername !== userInfo.username) {
      updateData.username = editedUsername;
    }

    // Check if there are fields to update
    if (Object.keys(updateData).length === 0) {
      setNoChangesMessage("Aucune modification détectée.");
      setTimeout(() => setNoChangesMessage(""), 3000);
      return;
    }

    // Fetch user data from the backend
    fetch("https://consomaestro-backend.vercel.app/users/update", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Réponse de l'API:", data);

        // Update only the fields that were modified
        setUserInfo((prevInfo) => ({
          ...prevInfo,
          ...updateData, // Merge updated fields with existing state
        }));

        setEditModalVisible(false);
        setSuccessMessage("Informations mises à jour avec succès !");
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((error) => {
        console.error("Erreur de mise à jour :", error);
        setSuccessMessage("Erreur de mise à jour.");
        setTimeout(() => setSuccessMessage(""), 3000);
      });
  };

  // Function to handle user sign-out
  const handleSignOut = async () => {
    await AsyncStorage.removeItem("userToken"); // Clear token from local storage
    navigation.navigate("AuthScreen"); // Navigate to Auth screen
  };

  return (
    <ImageBackground
      source={require("../assets/backgroundProfile.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Section des informations utilisateur */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Mes informations personnelles</Text>
          <View style={styles.infoRow}>
            <Text style={styles.persoSectionTitle}>E-mail:</Text>
            <Text style={styles.infoText}>{userInfo.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.persoSectionTitle}>Nom d'utilisateur:</Text>
            <Text style={styles.infoText}>{userInfo.username}</Text>
          </View>

          {/* Affiche un message de succès en cas de mise à jour réussie */}
          {successMessage ? (
            <Text style={styles.successMessage}>{successMessage}</Text>
          ) : null}

          {/* Bouton pour ouvrir la modal d'édition */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditedEmail(userInfo.email);
              setEditedUsername(userInfo.username);
              setEditModalVisible(true);
            }}
          >
            <Text style={styles.editButtonText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        {/* Section Options pour afficher les récompenses et les parrainages */}
        <View style={styles.optionsContainer}>
          <View style={styles.titleWithIcon}>
            <Text style={styles.sectionTitle}>Options</Text>
            <FontAwesome
              name="cog"
              size={27}
              color="#FFF"
              style={styles.icon}
            />
          </View>

          {/* Bouton pour afficher la modal des récompenses */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setRewardsModalVisible(true)}
          >
            <Text style={styles.optionButtonText}>Mes Récompenses</Text>
          </TouchableOpacity>

          {/* Bouton pour afficher la modal des parrainages */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => setSponsorshipsModalVisible(true)}
          >
            <Text style={styles.optionButtonText}>Mes Parrainages</Text>
          </TouchableOpacity>
        </View>

        {/* Modal pour afficher les récompenses */}
        <Modal
          transparent={true}
          visible={isRewardsModalVisible}
          animationType="slide"
          onRequestClose={() => setRewardsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Mes Récompenses</Text>
            <Text style={styles.modalContent}>
              Page en cours de construction... 👷🏻‍♀️
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setRewardsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal pour afficher les parrainages */}
        <Modal
          transparent={true}
          visible={isSponsorshipsModalVisible}
          animationType="slide"
          onRequestClose={() => setSponsorshipsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Mes Parrainages</Text>
            <Text style={styles.modalContent}>
              Page en cours de construction... 👷🏿‍♂️
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSponsorshipsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal pour modifier l'email et le nom d'utilisateur */}
        <Modal
          transparent={true}
          visible={isEditModalVisible}
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Modifier les informations</Text>

            {/* Display the no changes message in red */}
            {noChangesMessage ? (
              <Text style={styles.noChangesMessage}>{noChangesMessage}</Text>
            ) : null}

            {/* Champ de saisie pour l'email */}
            <TextInput
              style={styles.input}
              value={editedEmail}
              onChangeText={setEditedEmail}
              placeholder="Nouvel e-mail"
              keyboardType="email-address"
            />

            {/* Champ de saisie pour le nom d'utilisateur */}
            <TextInput
              style={styles.input}
              value={editedUsername}
              onChangeText={setEditedUsername}
              placeholder="Nouveau nom d'utilisateur"
            />

            {/* Bouton pour sauvegarder les modifications */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateUserInfo}
            >
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            </TouchableOpacity>

            {/* Bouton pour fermer la modal d'édition sans sauvegarder */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Bouton de déconnexion */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Déconnexion</Text>
          <Ionicons
            name="exit-outline"
            size={24}
            color="#FFF"
            style={styles.signOutIcon}
          />
        </TouchableOpacity>

        {/* Bouton suppression compte */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setDeleteModalVisible(true)}
        >
          <Text style={styles.deleteButtonText}>Supprimer mon compte</Text>
        </TouchableOpacity>

        {/* Modale de confirmation de suppression */}
        <Modal
          transparent={true}
          visible={isDeleteModalVisible}
          animationType="slide"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            {isAccountDeleted ? (
              <Text style={styles.modalContent}>
                Votre compte a bien été supprimé.
              </Text>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  Êtes-vous certain de votre choix ?
                </Text>
                <Text style={styles.modalContent}>
                  Cette action est irréversible.
                </Text>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.confirmButtonText}>
                    Oui, je supprime mon compte
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>
                    Non, je conserve mon compte
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 20, paddingVertical: 40 },
  infoContainer: {
    backgroundColor: "#69914a",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 100,
  },
  sectionTitle: {
    fontFamily: "Hitchcut-Regular",
    fontSize: 17,

    color: "#FFF",
    marginBottom: 10,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5, // Ajustez l'espacement vertical entre chaque ligne si nécessaire
  },
  persoSectionTitle: {
    flexDirection: 'row',
    fontSize: 16,
    color: "#FFF",
    fontWeight: "bold",
    marginRight: 20,
    marginBottom: 5, 
  },

  infoText: { fontSize: 16, marginBottom: 5, color: "#FFF" },
  successMessage: {
    fontSize: 16,
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
  editButton: {
    backgroundColor: "#A77B5A",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  editButtonText: { color: "#FFF", fontSize: 16, textAlign: "center" },
  optionsContainer: {
    backgroundColor: "#69914a",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 30,
  },
  optionButton: {
    backgroundColor: "#A77B5A",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  optionButtonText: { color: "#FFF", fontSize: 16, textAlign: "center" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
  },
  noChangesMessage: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    backgroundColor: "#FFF",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#69914a",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  saveButtonText: { color: "#FFF", fontSize: 16, textAlign: "center" },
  closeButton: {
    backgroundColor: "#A77B5A",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: { color: "#FFF", fontSize: 16, textAlign: "center" },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { marginLeft: 17, marginBottom: 10 },
  signOutButton: {
    flexDirection: "row",
    backgroundColor: "#F0672D",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  signOutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  signOutIcon: { marginBottom: -2 },
  deleteButton: {
    backgroundColor: "#FF4C4C",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  confirmButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  confirmButtonText: { color: "#FFF", fontSize: 16, textAlign: "center" },
  cancelButton: {
    backgroundColor: "red",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  cancelButtonText: { color: "#FFF", fontSize: 16, textAlign: "center" },
  successMessage: {
    fontSize: 16,
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
});
