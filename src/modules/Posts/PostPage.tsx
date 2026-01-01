"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppDispatch } from "@/src/store";
import { GetPosts, Post } from "@/src/store/postSlice";
import React, { useEffect } from "react";

const PostPage = () => {
  const dispatch = useAppDispatch();

  const [postData, setPostData] = React.useState<Post[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const response = await dispatch(GetPosts());
      setPostData(response.payload as Post[]);
    }

    fetchPosts();
  }, [dispatch]);

  return (
    <div className="mx-10 my-10 bg-white h-screen max-w-500px flex items-center justify-center">
      <div className="grid grid-cols-4 gap-4">
        {postData.map((post) => (
          <Card
            key={post._id}
            className="w-full max-w-sm shadow-[0_-4px_10px_-2px_gray,0_4px_10px_-2px_orange]"
          >
            <CardHeader>
              <CardTitle>{post.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{post?.post_description}</CardDescription>
            </CardContent>
            <CardFooter>{post?.email}</CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostPage;
