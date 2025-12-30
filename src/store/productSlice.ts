import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getProductById, getProducts, searchProducts, updateFav} from "../api/authApi";

export interface Product {
  _id: number;
  name: string;
  price: number;
  about_product: string;
  quan: number;
  is_fave: boolean;
  // add other product fields as necessary
}

export interface ProductState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  product: Product | null;
    token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductState = {
  product: null,
    token: null,

  status: "idle",
  error: null
};

export const getProduct = createAsyncThunk(
  "product/getProducts",
  async (
    _,
    { rejectWithValue }
  ) => {
    try {
      const resp = await getProducts();
      return resp;
    } catch  {
      return rejectWithValue("Products not fetched.");
    }
  }
);


export const GetFavourite = createAsyncThunk(
  "product/GetFavourite",
  async (
    id: string | undefined,
    { rejectWithValue }
  ) => {
    try {
      const resp = await updateFav(id);
      return resp;
    } catch  {
      return rejectWithValue("failed to updated favourite.");
    }
  }
);

export const GetProductsById = createAsyncThunk(
  "product/GetProductsById",
  async (
    productId: string | undefined,
    { rejectWithValue }
  ) => {
    try {
      const resp = await getProductById(productId);
      return resp;
    } catch  {
      return rejectWithValue("failed to updated favourite.");
    }
  }
);

export const searchProductsByQuery = createAsyncThunk(
  "product/searchProductsByQuery",
  async (
    query: string,
    { rejectWithValue }
  ) => {
    try {
      const resp = await searchProducts(query);
      return resp;
    } catch  {
      return rejectWithValue("failed to search products.");
    }
  }
);



const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(getProduct.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "succeeded";
        const payload = action.payload?.data ?? action.payload;
        state.product = payload?.product ?? null;

      })
      .addCase(getProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  }
});

export default productSlice.reducer;
