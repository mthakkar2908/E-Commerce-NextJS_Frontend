/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  addToCart,
  createEmailSubscribe,
  EmailSignupApiResponse,
  getPrivacyText,
  getTermsText,
  submitContactform,
} from "../api/authApi";

export interface EmailSubscribeResponse {
  _id: string;
  email: string;
}

export interface commonState {
  email: EmailSubscribeResponse | null;
  message: string;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: commonState = {
  email: null,
  message: "",
  token: null,
  status: "idle",
  error: null,
};

type AddToCartPayload = {
  userId: string;
  credentials: {
    items: {
      productId: string;
      quantity: number; // 👈 IMPORTANT
    }[];
  };
};

export const CreateEmailSubScription = createAsyncThunk<
  EmailSignupApiResponse,
  { email: string },
  { rejectValue: string }
>(
  "common/CreateEmailSubScription",
  async (credentials, { rejectWithValue }) => {
    try {
      return await createEmailSubscribe(credentials);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Email already subscribed",
      );
    }
  },
);

export const GetPrivacyText = createAsyncThunk(
  "common/GetPrivacyText",
  async (_, { rejectWithValue }) => {
    try {
      return await getPrivacyText();
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "failed to fetch the privacy data",
      );
    }
  },
);

export const GetTermsText = createAsyncThunk(
  "common/GetTermsText",
  async (_, { rejectWithValue }) => {
    try {
      return await getTermsText();
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to Fetch Terms Data.",
      );
    }
  },
);

export const ContactFormSubmit = createAsyncThunk(
  "common/ContactFormSubmit",
  async (
    credentials: {
      name: string;
      email: string;
      mobile_no: string;
      title: string;
      description: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const resp = await submitContactform(credentials);
      return resp;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Error to submit contact form",
      );
    }
  },
);

export const AddToCart = createAsyncThunk(
  "common/AddToCart",
  async ({ userId, credentials }: AddToCartPayload, { rejectWithValue }) => {
    try {
      const resp = await addToCart(credentials, userId);
      return resp;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Error adding to cart",
      );
    }
  },
);

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(CreateEmailSubScription.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        CreateEmailSubScription.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.status = "succeeded";
          const payload = action.payload?.data ?? action.payload;
          state.email = payload?.email ?? null;
          state.message = action?.payload?.message;
        },
      )
      .addCase(
        CreateEmailSubScription.rejected,
        (state, action: PayloadAction<any>) => {
          console.log("Message is in error :", action?.payload?.message);
          state.status = "failed";
          state.error = action.payload as string;
        },
      );
  },
});

export default commonSlice.reducer;
