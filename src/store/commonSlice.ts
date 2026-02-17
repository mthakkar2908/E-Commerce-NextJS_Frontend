/* eslint-disable @typescript-eslint/no-explicit-any */

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  addPrivacyText,
  addTermsText,
  addToCart,
  createEmailSubscribe,
  deleteList,
  EmailSignupApiResponse,
  getCartData,
  getPrivacyText,
  getSubScribeList,
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
  { email: string; userId: string },
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

export const AddPrivacy = createAsyncThunk(
  "common/AddPrivacy",
  async (PrivacyPolicyText: string, { rejectWithValue }) => {
    try {
      const res = await addPrivacyText(PrivacyPolicyText);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "failed to add privacy data",
      );
    }
  },
);

export const AddTerms = createAsyncThunk(
  "common/AddTerms",
  async (TermsConditionsText: string, { rejectWithValue }) => {
    try {
      const res = await addTermsText(TermsConditionsText);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "failed to add terms data",
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

export const GetCartData = createAsyncThunk(
  "common/GetCartData",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await getCartData();
      return resp;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Error fetching cart data",
      );
    }
  },
);

export const getSubscribeList = createAsyncThunk(
  "common/getSubscribeList",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await getSubScribeList(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "No data availabel",
      );
    }
  },
);

export const deleteSubscribeChannel = createAsyncThunk(
  "common/deleteSubscribeChannel",
  async (payload: { userId: string; email: string }, { rejectWithValue }) => {
    try {
      const response = await deleteList(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ?? "No data available",
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
