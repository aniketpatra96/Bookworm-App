import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import styles from "@/assets/styles/home.styles";
import { Image } from "expo-image";
import bookService from "@/services/book.service";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import { formatPublishDate } from "@/lib/utils";
import { usePathname } from "expo-router";
import Loader from "@/components/Loader";

interface ResponseProps {
  success: boolean;
  data?: any;
  error?: any;
}

const Home = () => {
  const { token } = useAuthStore();
  const [books, setBooks] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchBooks: (
    pageNum?: number,
    refresh?: boolean
  ) => Promise<void> = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else if (pageNum === 1) setLoading(true);
      const response: ResponseProps = await bookService.fetchBooks(pageNum, token!);
      if (response.success) {
        const uniqueBooks =
          refresh || pageNum === 1
            ? response.data.books
            : Array.from(
                new Set(
                  [...books, ...response.data.books].map(
                    (book: any) => book._id
                  )
                )
              ).map((id: string) =>
                [...books, ...response.data.books].find(
                  (book) => book._id === id
                )
              );
        setBooks(uniqueBooks);
        setHasMore(pageNum < response.data.totalPages);
        setPage(pageNum);
      } else {
        if (refresh) setRefreshing(false);
        else setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching books", error);
      setLoading(false);
      setRefreshing(false);
    } finally {
      if (refresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  const pathname: string = usePathname();

  useEffect(() => {
    fetchBooks(1, false);
  }, [pathname]);

  const handleLoadMore = async (): Promise<void> => {
    if (hasMore && !loading && !refreshing) {
      await fetchBooks(page + 1);
    }
  };

  const renderItem: ({ item }: { item: any }) => React.JSX.Element = ({
    item,
  }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookHeader}>
        <View style={styles.userInfo}>
          {/* User Avatar and Name can go here */}
          <Image
            source={{ uri: item.user.profileImage }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{item.user.username}</Text>
        </View>
      </View>
      {/* Book Image */}
      <View style={styles.bookImageContainer}>
        <Image source={item.image} style={styles.bookImage} contentFit="fill" />
      </View>
      {/* Book Details */}
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.caption}>{item.caption}</Text>
        <Text style={styles.date}>
          Shared on {formatPublishDate(item.createdAt)}
        </Text>
      </View>
    </View>
  );

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

  if (loading) return <Loader size="large" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              fetchBooks(1, true);
            }}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>BookWorm 🐛</Text>
            <Text style={styles.headerSubtitle}>
              Discover great reads from the community👇
            </Text>
          </View>
        }
        ListFooterComponent={
          hasMore && books.length > 0 ? (
            <ActivityIndicator
              style={styles.footerLoader}
              size="small"
              color={COLORS.primary}
            />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share a book!
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Home;
