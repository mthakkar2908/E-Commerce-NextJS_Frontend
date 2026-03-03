/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  deleteOrderById,
  getOrders,
  getOrdersById,
  searchOrdersByString,
} from "../api/authApi";

export interface OrderResponse {
  _id: string;
  product_id: {
    _id: string;
    name: string;
    about_product: string;
    price: number;
    quan: number;
    is_fav: boolean;
  };
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  product_name: string;
  email: string;
  status: string;
  address: string;
  mobile_no: number;
  total_price: number;
  product_quan: number;
}

export interface OrderState {
  order: OrderResponse | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: OrderState = {
  order: null,
  token: null,

  status: "idle",
  error: null,
};

export const GetOrders = createAsyncThunk(
  "order/GetOrders",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await getOrders();
      return resp;
    } catch {
      return rejectWithValue("Orders not fetched.");
    }
  },
);

export const GetOrdersByID = createAsyncThunk(
  "order/GetOrdersByID",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const resp = await getOrdersById(orderId);
      return resp;
    } catch {
      return rejectWithValue("Order not fetched.");
    }
  },
);

export const DeleteOrderById = createAsyncThunk(
  "order/DeleteOrderById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const resp = await deleteOrderById(orderId);
      return resp;
    } catch {
      return rejectWithValue("failed to remove the order");
    }
  },
);

export const searchOrders = createAsyncThunk(
  "order/searchOrders",
  async (orderSearchString: string, { rejectWithValue }) => {
    try {
      const resp = await searchOrdersByString(orderSearchString);
      return resp;
    } catch {
      return rejectWithValue("failed to filter the order data.");
    }
  },
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetOrders.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(GetOrders.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "succeeded";
        const payload = action.payload?.data ?? action.payload;
        state.order = payload?.product ?? null;
      })
      .addCase(GetOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default orderSlice.reducer;
