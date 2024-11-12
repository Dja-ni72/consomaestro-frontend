import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; 
import { 
  View, Text, StyleSheet, Image, ImageBackground, FlatList, ActivityIndicator, 
  TouchableOpacity, Modal, ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RecipesScreen = () => {
  const userId = useSelector((state) => state.user.id); // Récupération de l'userId depuis le store Redux

  const [recipes, setRecipes] = useState([]); // Stocke les recettes générées
  const [loading, setLoading] = useState(true); // Indicateur de chargement initial des recettes
  const [loadingMore, setLoadingMore] = useState(false); // Indicateur de chargement des recettes supplémentaires
  const [page, setPage] = useState(1); // Pagination des recettes
  const [favorites, setFavorites] = useState([]); // Stocke les IDs des recettes favorites de l'utilisateur
  const [showModal, setShowModal] = useState(false); // Contrôle de l'affichage de la modale
  //console.log(recipes[0]);

  
  // Fonction pour récupérer les recettes générées depuis l'API backend
  const fetchRecipes = async (newPage = 1) => {
    try {
      if (newPage === 1) setLoading(true); // Affichage de l'indicateur de chargement initial
      else setLoadingMore(true); // Affichage de l'indicateur de chargement supplémentaire

      const response = await fetch(`https://conso-maestro-backend.vercel.app/recipes/spoonacular?page=${newPage}`);
      const data = await response.json();
      setRecipes((prevRecipes) => [...prevRecipes, ...data.recipes]);

      setLoading(false);
      setLoadingMore(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des recettes:', error);
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fonction pour récupérer les recettes favorites de l'utilisateur
  const fetchFavorites = async () => {
    try {
      const response = await fetch(`https://conso-maestro-backend.vercel.app/recipes/favorites/${userId}`);
      const data = await response.json();
      setFavorites(data.favorites.map(fav => fav.id)); // Stocke uniquement les IDs des recettes favorites
    } catch (error) {
      console.error("Erreur lors de la récupération des recettes favorites de l'utilisateur:", error);
    }
  };

  // useEffect pour charger les recettes et les favoris lors du premier rendu
  useEffect(() => {
    fetchRecipes(); // Charge les recettes générées
    fetchFavorites(); // Charge les recettes favorites de l'utilisateur
  }, []);

  // Fonction pour charger la page suivante de recettes
  const loadMoreRecipes = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes(nextPage); // Charge la page suivante
  };

  // Fonction pour basculer l'état de favori d'une recette
  const toggleFavorite = async (recipe) => {
    const { id, title, image, description, products } = recipe;
    const isFavorite = favorites.includes(id);

    try {
      if (isFavorite) {
        // Requête DELETE pour retirer la recette des favoris
        const response = await fetch(`https://conso-maestro-backend.vercel.app/recipes/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        

        if (response.ok) {
          setFavorites((prevFavorites) => prevFavorites.filter(favId => favId !== id)); // Retire l'ID des favoris
          console.log('Recette retirée des favoris:', id);
        } else {
          const errorText = await response.text();
          console.error('Erreur lors de la suppression de la recette des favoris:', errorText);
        }
      } else {
          const products = recipe.extendedIngredients.map((ingredient) => ingredient.name);
          console.log('Données envoyées à l\'API:', { userId, recipeId: id, title, image, description: recipe.description, products });
        // Requête POST pour ajouter la recette aux favoris
        const response = await fetch('https://conso-maestro-backend.vercel.app/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, recipeId: id, title, image, description: recipe.description, products })
        });

        if (response.ok) {
          setFavorites((prevFavorites) => [...prevFavorites, id]); // Ajoute l'ID aux favoris
        } else {
          const errorText = await response.text();
          console.error('Erreur lors de la sauvegarde de la recette mise en favori');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion du favori:', error);
    }
  };

  // Fonctions pour gérer l'affichage de la modale
  const openFavoritesModal = () => setShowModal(true);
  const closeFavoritesModal = () => setShowModal(false);

  // Filtre les recettes pour obtenir uniquement celles qui sont favorites
  const favoriteRecipes = recipes.filter((recipe) => favorites.includes(recipe.id));

  return (
    <ImageBackground source={require('../assets/backgroundRecipe.png')} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          {/* Icône de cœur pour ouvrir la modale des favoris */}
          <TouchableOpacity onPress={openFavoritesModal}>
            <Ionicons name="heart" size={32} color="red" />
          </TouchableOpacity>
        </View>
        <Text style={styles.textfavories}>Mes favorites</Text>
        <Text style={styles.text}>Idées recettes</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#FFF" /> // Affichage de l'indicateur de chargement si `loading` est true
        ) : (
          <FlatList
            data={recipes} // Données de la liste
            keyExtractor={(item) => item.id.toString()} // Clé unique pour chaque élément
            renderItem={({ item }) => (
              <View style={styles.recipeCard}>
                {/* Image de la recette */}
                <Image source={{ uri: item.image }} style={styles.recipeImage} /> 
                {/* Titre de la recette */}
                <Text style={styles.recipeTitle}>{item.title}</Text> 
                <TouchableOpacity
                  style={styles.heartIcon}
                  onPress={() => toggleFavorite(item)} // Gestion des favoris
                >
                  <Ionicons
                    name={favorites.includes(item.id) ? 'heart' : 'heart-outline'} // Utilise `includes` pour vérifier le statut favori
                    size={24}
                    color={favorites.includes(item.id) ? 'red' : 'gray'} // Met à jour la couleur en fonction du statut de favori
                  />
                </TouchableOpacity>
              </View>
            )}
            onEndReached={loadMoreRecipes} // Chargement de plus de recettes en atteignant le bas
            onEndReachedThreshold={0.5} // Seuil pour déclencher le chargement supplémentaire
            ListFooterComponent={
              loadingMore ? <ActivityIndicator size="small" color="#FFF" /> : null // Affichage de l'indicateur de chargement additionnel
            }
          />
        )}

        {/* Modale pour afficher les recettes favorites */}
        <Modal
          visible={showModal} // Contrôle de visibilité de la modale
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Mes recettes favorites</Text>
              <ScrollView>
                {favoriteRecipes.length > 0 ? (
                  favoriteRecipes.map((recipe) => (
                    <View key={recipe.id} style={styles.favoriteCard}>
                      <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                      <Text style={styles.recipeTitle}>{recipe.title}</Text>
                      <TouchableOpacity
                        onPress={() => toggleFavorite(recipe)} // Permet de retirer la recette des favoris
                        style={styles.removeButton}
                      >
                        <Ionicons name="trash" size={24} color="red" />
                        <Text style={styles.removeButtonText}>Supprimer</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noFavoritesText}>Aucune recette en favori</Text>
                )}
              </ScrollView>
              <TouchableOpacity onPress={closeFavoritesModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};


export default RecipesScreen;

    
    const styles = StyleSheet.create({
      background: {
        flex: 1,
        resizeMode: 'cover',
      },
      container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 50,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        marginBottom: 20,
      },
      headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
      },
      text: {
        fontSize: 24,
        fontFamily: "Hitchcut-Regular",
        color: '#F0672D',
        marginTop: 40,
        top: -73,
      },
      textfavories: {
        fontSize: 19,
        fontFamily: "Hitchcut-Regular",
        color: '#F0672D',
        marginBottom: 20,
        marginTop: 19,
        top: -73,
        right: 58,
      },
      recipeCard: {
        backgroundColor: '#F0672D',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
        alignItems: 'center',
        width: '88%',
        alignSelf: 'center',
        position: 'relative',
      },
      heartIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
      },
      recipeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#FFF',
      },
      recipeImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        alignSelf: 'center',
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        backgroundColor: '#A77B5A',
        borderRadius: 10,
        padding: 20,
        width: '80%',
        maxHeight: '80%',
        alignItems: 'center',
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#FFF',
      },
      favoriteCard: {
        marginBottom: 15,
        alignItems: 'center',
      },
      noFavoritesText: {
        fontSize: 16,
        fontStyle: 'italic',
      },
      removeButton: {
        flexDirection: 'row',
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#F0672D', 
        marginTop: 10,
        alignSelf: 'center', 
      },
      removeButtonText: {
        fontSize: 16,
        color: '#FFF',
        marginLeft: 5,
      },
      closeButton: {
        marginTop: 20,
        alignSelf: 'center',
      },
      closeButtonText: {
        fontSize: 16,
        color: 'FFF',
      },
    });