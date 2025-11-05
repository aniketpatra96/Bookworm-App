import axios, { AxiosResponse } from "axios";

interface BookData {
  title: string;
  caption: string;
  rating: string;
  image: string;
}

class BookService {
  private apiUrl: string | undefined;

  constructor() {
    this.apiUrl = process.env.EXPO_PUBLIC_API_URL;
  }

  async createBook(bookData: BookData, token: string) {
    try {
      const response: AxiosResponse<any, any, {}> = await axios.post(
        `${this.apiUrl}/api/books`,
        bookData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 201) {
        throw new Error("Failed to create book");
      }
      return { success: true };
    } catch (error) {
      console.error("Error creating book: ", error);
      return { success: false, error: error };
    }
  }

  async fetchBooks(pageNum: number, token: string) {
    try {
      const response: AxiosResponse<any, any, {}> = await axios.get(
        `${this.apiUrl}/api/books?page=${pageNum}&limit=3`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to fetch books");
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching books: ", error);
      return { success: false, error: error };
    }
  }

  async fetchRecommendedBooks(token: string) {
    try {
      const response: AxiosResponse<any, any, {}> = await axios.get(
        `${this.apiUrl}/api/books/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to fetch recommended books");
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching all books: ", error);
      return { success: false, error: error };
    }
  }

  async deleteBookRecommendation(bookId: string, token: string) {
    try {
      const response: AxiosResponse<any, any, {}> = await axios.delete(
        `${this.apiUrl}/api/books/${bookId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to delete book recommendation");
      }
      return { success: true };
    } catch (error) {
      console.error("Error deleting book recommendation: ", error);
      return { success: false, error: error };
    }
  }
}

export default new BookService();
