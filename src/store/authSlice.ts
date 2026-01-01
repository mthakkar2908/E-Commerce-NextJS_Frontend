import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getProducts, login as loginApi } from "../api/authApi";
import { saveSession, clearSession } from "../utils/session";

export interface AuthState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const resp = await loginApi(credentials);
      return resp;
    } catch {
      return rejectWithValue("Login failed");
    }
  },
);

export const getProduct = createAsyncThunk(
  "product/getProducts",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await getProducts();
      return resp;
    } catch {
      return rejectWithValue("Products not fetched.");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      clearSession();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSessionFromStorage(state, action: PayloadAction<any>) {
      state.user = action.payload?.user ?? null;
      state.token = action.payload?.token ?? null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "succeeded";

        const payload = action.payload?.data ?? action.payload;

        state.user = payload?.user ?? null;
        state.token = payload?.token ?? null;

        saveSession(payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout, setSessionFromStorage } = authSlice.actions;
export default authSlice.reducer;
