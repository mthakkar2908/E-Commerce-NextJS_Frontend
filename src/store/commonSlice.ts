import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { createEmailSubscribe, EmailSignupApiResponse } from "../api/authApi";

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
  error: null
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Email already subscribed"
      );
    }
  }
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state, action: PayloadAction<any>) => {
          state.status = "succeeded";
          const payload = action.payload?.data ?? action.payload;
          console.log("Payload is : ", payload);
          console.log("Message is :", action?.payload?.message);
          state.email = payload?.email ?? null;
          state.message = action?.payload?.message;
        }
      )
      .addCase(
        CreateEmailSubScription.rejected,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (state, action: PayloadAction<any>) => {
          console.log("Message is in error :", action?.payload?.message);
          state.status = "failed";
          state.error = action.payload as string;
        }
      );
  }
});

export default commonSlice.reducer;
