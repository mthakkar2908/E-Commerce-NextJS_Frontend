import { PrivacyResponse } from "../modules/Privacy/PrivacyPolicy";
import { TermsResponse } from "../modules/Terms/TermsCondition";
import api from "./client";

export interface EmailSignupApiResponse {
  message: string;
  data: {
    _id: string;
    email: string;
  };
}

export interface ContactResponse {
  message: string;
  data: {
    name: string;
    email: string;
    title: string;
    mobile_no: string;
    description: string;
    _id: string;
  };
  error: string;
  statusCode: number;
}

export interface cartResponse {
  statusCode: number;
  message: string;
  data: {
    userId: string;
    items: [
      {
        productId: string;
        quantity: string;
        _id: string;
      }
    ];
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface getCartResponse {
  _id: string;
  userId: string;
  items: [
    {
      productId: string;
      quantity: number;
      _id: string;
    }
  ];
  createdAt: string;
  updatedAt: string;
}

export function login(credentials: { email: string; password: string }) {
  return api.post("/users/signIn", credentials);
}

export function getProducts() {
  return api.get("/products");
}

export function updateFav(id: string | undefined) {
  return api.patch(`/products/${id}`);
}

export function getProductById(productId: string | undefined) {
  return api.get(`/products/${productId}`);
}

export function searchProducts(query: string) {
  return api.get(`/products/searchProducts?q=${query}`);
}

export function getPosts() {
  return api.get("/posts");
}

export function createPost(formData: FormData) {
  return api.post("/posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export function updateUser(formData: FormData, userId: string) {
  return api.post(`/users/updateProdile/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export function getUserById(userId: string) {
  return api.get(`/users/${userId}`);
}

export function UpdatePostForId(formData: FormData, postId: string) {
  return api.post(`/posts/update/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

export function deletePost(postId: string) {
  return api.delete(`posts/deletePost/${postId}`);
}

export function getOrders() {
  return api.get("/orders");
}

export function getOrdersById(orderId: string) {
  return api.get(`/orders/${orderId}`);
}

export function deleteOrderById(orderId: string) {
  return api.delete(`/orders/deleteOrder/${orderId}`);
}

export function searchOrdersByString(orderSearchString: string) {
  return api.get(`/orders/searchOrders?o=${orderSearchString}`);
}

export function createEmailSubscribe(credentials: {
  email: string;
}): Promise<EmailSignupApiResponse> {
  return api.post<EmailSignupApiResponse>("/email-signup", credentials);
}

export function getPrivacyText(): Promise<PrivacyResponse[]> {
  return api.get<PrivacyResponse[]>("/privacy-policy/getText");
}

export function getTermsText(): Promise<TermsResponse[]> {
  return api.get<TermsResponse[]>("/terms-conditions/getText");
}

export function submitContactform(credentials: {
  name: string;
  email: string;
  mobile_no: string;
  title: string;
  description: string;
}) {
  return api.post<ContactResponse>("/contact/form", credentials);
}

export function addToCart(
  credentials: {
    items: {
      productId: string;
      quantity: number;
    }[];
  },
  userId: string
): Promise<cartResponse> {
  return api.post<cartResponse>(`/cart/${userId}/add`, credentials);
}

export function getCartData():Promise<getCartResponse>{
  return api.get<getCartResponse>("/cart");

}
export const authApi = {
  login: (creds: { email: string; password: string }) => login(creds),
  me: () => api.get("/auth/me")
};

export default authApi;
