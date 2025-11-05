import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Router, useRouter } from "expo-router";
import styles from "@/assets/styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/colors";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { readAsStringAsync, EncodingType } from "expo-file-system/legacy";
import useAuthStore from "@/store/authStore";
import bookService from "@/services/book.service";
import ResponseProps from "@/services/ResponseProps";

interface BookData {
  title: string;
  caption: string;
  rating: string;
  image: string;
}

const Create = () => {
  const [title, setTitle] = useState<string>("");
  const [caption, setCaption] = useState<string>("");
  const [rating, setRating] = useState<number>(3);
  const [image, setImage] = useState<any>(null);
  const [imageBase64, setImageBase64] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { token }: { token: string | null } = useAuthStore();

  const router: Router = useRouter();

  const pickImage = async (): Promise<void> => {
    try {
      // request permission if needed
      if (Platform.OS !== "web") {
        const { status }: { status: ImagePicker.PermissionStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Denied",
            "Sorry, we need camera roll permissions to upload an image!"
          );
          return;
        }
      }

      // launch image library
      const result: ImagePicker.ImagePickerResult =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5, //lower the quality for smaller base64 size
          base64: true,
        });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        // if base64 is provided, use it
        if (result.assets[0].base64) setImageBase64(result.assets[0].base64);
        else {
          // otherwise, convert to base64
          const base64: string = await readAsStringAsync(result.assets[0].uri, {
            encoding: EncodingType.Base64,
          });
          setImageBase64(base64);
        }
      }
    } catch (error) {
      console.error("Error in picking image: ", error);
      Alert.alert("Error", "An error occurred while picking the image.");
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!title || !caption || !imageBase64 || !rating) {
      Alert.alert(
        "Missing Fields",
        "Please fill in all fields before submitting."
      );
      return;
    }
    try {
      setLoading(true);
      // get file extension from URI or default to jpeg
      const uriParts: any = image.split(".");
      const fileType: any = uriParts[uriParts.length - 1];
      const imageType: string = fileType
        ? `image/${fileType.toLowerCase()}`
        : "image/jpeg";
      const imageDataUrl: string = `data:${imageType};base64,${imageBase64}`;
      const bookData: BookData = {
        title,
        caption,
        rating: rating.toString(),
        image: imageDataUrl,
      };
      const response: ResponseProps = await bookService.createBook(
        bookData,
        token!
      );
      if (response.success) {
        Alert.alert(
          "Success",
          "Your Book recommendation has been posted successfully!"
        );
        setTitle("");
        setCaption("");
        setRating(3);
        setImage(null);
        setImageBase64(null);
        router.push("/");
      } else {
        Alert.alert(
          "Unable to Add Book",
          `An error occurred while creating the book recommendation. Reason: ${response?.error}`
        );
      }
    } catch (error) {
      console.error("Error creating post: ", error);
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = (): React.JSX.Element => {
    const stars: any[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Book Recommendation</Text>
            <Text style={styles.subtitle}>
              Share your favorite reads with others
            </Text>
          </View>
          {/* FORM */}
          <View style={styles.form}>
            {/* BOOK TITLE */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Book Title</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="book-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
              {/* RATING */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Your Rating</Text>
                {renderRatingPicker()}
              </View>
              {/* IMAGE */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Book Image</Text>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={pickImage}
                >
                  {image ? (
                    <Image
                      source={{ uri: image }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons
                        name="image-outline"
                        size={40}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.placeholderText}>
                        Tap to select image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              {/* CAPTION */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Caption</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Write your review or thoughts about this book..."
                  placeholderTextColor={COLORS.placeholderText}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                />
              </View>
            </View>
            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Share</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Create;
