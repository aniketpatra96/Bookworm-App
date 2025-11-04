import {
  View,
  Alert,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Router, usePathname, useRouter } from "expo-router";
import bookService from "@/services/book.service";
import useAuthStore from "@/store/authStore";
import styles from "@/assets/styles/profile.styles";
import ProfileHeader from "@/components/ProfileHeader";
import LogoutButton from "@/components/LogoutButton";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import { Image } from "expo-image";
import Loader from "@/components/Loader";

interface ResponseProps {
  success: boolean;
  data?: any;
  error?: any;
}

const Profile = () => {
  const [books, setBooks] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [deleteBookId, setDeleteBookId] = useState<any>(null);
  const { token } = useAuthStore();

  const router: Router = useRouter();

  const fetchData: () => Promise<void> = async () => {
    try {
      setIsLoading(true);
      const response: ResponseProps = await bookService.fetchRecommendedBooks(
        token!
      );
      if (response.success) {
        setBooks(response.data);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      Alert.alert(
        "Error",
        "Failed to load profile data. Pull down to refresh."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderBookItem = ({ item }: { item: any }): React.JSX.Element => (
    <View style={styles.bookItem}>
      <Image source={item.image} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.bookCaption} numberOfLines={2}>
          {item.caption}
        </Text>
        <Text style={styles.bookDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item._id)}
      >
        {deleteBookId === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  const confirmDelete = (bookId: string): void => {
    Alert.alert(
      "Delete Recommendation",
      "Are you sure you want to delete this book recommendation?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => handleDeleteBook(bookId),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteBook = async (bookId: string): Promise<void> => {
    try {
      setDeleteBookId(bookId);
      const response: ResponseProps =
        await bookService.deleteBookRecommendation(bookId, token!);
      if (response.success) {
        setBooks((prevBooks: any) =>
          prevBooks.filter((book: any) => book._id !== bookId)
        );
        Alert.alert("Success", "Book recommendation deleted successfully!");
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error("Error deleting book: ", error);
      Alert.alert(
        "Error",
        "Failed to delete book recommendation. Please try again."
      );
    } finally {
      setDeleteBookId(null);
    }
  };

  const renderRatingStars: (rating: number) => any[] = (rating) => {
    const stars: any[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const pathname: string = usePathname();

  useEffect(() => {
    fetchData();
  }, [pathname]);

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) return <Loader size="large" />;

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />
      {/* YOUR RECOMMENDATIONS */}
      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Recommendations 📚</Text>
        <Text style={styles.booksCount}>{books.length} books</Text>
      </View>
      {/* BOOKS LIST */}
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.booksList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={50}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Add Your First Book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

export default Profile;
