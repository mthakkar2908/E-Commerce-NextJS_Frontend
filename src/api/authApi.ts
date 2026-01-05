import api from "./client";

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
      "Content-Type": "multipart/form-data",
    },
  });
}

export function updateUser(formData: FormData, userId: string) {
  return api.post(`/users/updateProdile/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getUserById(userId: string) {
  return api.get(`/users/${userId}`);
}

export function UpdatePostForId(formData: FormData, postId: string) {
  return api.post(`/posts/update/${postId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function deletePost(postId: string) {
  return api.delete(`posts/deletePost/${postId}`);
}

export function getOrders() {
  return api.get("/orders");
}

export function getOrdersById(orderId : string){
  return api.get(`/orders/${orderId}`);
}

export function deleteOrderById(orderId : string){
  return api.delete(`/orders/deleteOrder/${orderId}`);
}

export const authApi = {
  login: (creds: { email: string; password: string }) => login(creds),
  me: () => api.get("/auth/me"),
};

export default authApi;
