import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  createPost,
  deletePost,
  getPosts,
  UpdatePostForId
} from "../api/authApi";

export interface Post {
  _id: string;
  name: string;
  post_description: string;
  imageUrl: string;
  email: string;
  user: string;
}

export interface PostState {
  Post: Post | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PostState = {
  Post: null,
  token: null,
  status: "idle",
  error: null
};

export const GetPosts = createAsyncThunk(
  "post/getPosts",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await getPosts();
      return resp;
    } catch {
      return rejectWithValue("Posts not fetched.");
    }
  }
);

export const CreatePost = createAsyncThunk(
  "post/CreatePost",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const resp = await createPost(formData);
      return resp;
    } catch {
      return rejectWithValue("failed to create Post.");
    }
  }
);

export const UpdatePost = createAsyncThunk(
  "post/UpdatePost",
  async (params: { formData: FormData; postId: string }, { rejectWithValue }) => {
    try {
      const resp = await UpdatePostForId(params?.formData , params?.postId);
      return resp;
    } catch {
      return rejectWithValue("failed to Update a Post.");
    }
  }
);

export const DeletePost = createAsyncThunk(
  "post/DeletePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const resp = await deletePost(postId);
      return resp;
    } catch {
      return rejectWithValue("failed to delete Post.");
    }
  }
);

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(GetPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .addCase(GetPosts.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "succeeded";
        const payload = action.payload?.data ?? action.payload;
        state.Post = payload?.Post ?? null;
      })
      .addCase(GetPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  }
});

export default postSlice.reducer;
