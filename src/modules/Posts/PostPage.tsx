"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DeleteDialog } from "@/src/common/DeleteDialog";
import { useAppDispatch } from "@/src/store";
import { CreatePost, DeletePost, GetPosts, Post } from "@/src/store/postSlice";
import { Edit2, Plus, Trash2, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const PostPage = () => {
  const dispatch = useAppDispatch();
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [postData, setPostData] = React.useState<Post[]>([]);
  const [selectedImages, setSelectedImages] = React.useState<File[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);

  const [mode, setMode] = React.useState<"Create" | "Edit">("Create");

  const [openConfirmDialog, setOpenConfirmDialog] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const userId = user?.userId;

  const initialValues = {
    userId: userId,
    name: "",
    post_description: "",
    email: "",
    image: ""
  };
  const [formData, setFormData] = React.useState(initialValues);
  
  const fetchPosts = async () => {
    try {
      console.log("Fetching posts...");
      const response = await dispatch(GetPosts());

      if (GetPosts.fulfilled.match(response)) {
        const posts = (response.payload as Post[]) || [];
        setPostData(posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    if (files.length + selectedImages.length > 5) {
      toast.error("You can upload a maximum of 5 images.", {
        position: "top-center",
        style: { borderRadius: "8px", background: "#333", color: "#fff" }
      });
      return;
    }

    const loadingToast = toast.loading(
      `Uploading ${files.length} ${files.length === 1 ? "memory" : "memories"}...`,
      {
        position: "top-center",
        style: { borderRadius: "8px", background: "#333", color: "#fff" }
      }
    );

    const results = {
      success: 0,
      failed: 0,
      skipped: 0
    };

    const uploadPromises = files.map(async (file) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const fileType = file.type.startsWith("image") ? "image" : "video";

      const imageExtensions = ["jpeg", "jpg", "png", "gif"];

      if (fileType === "image" && !imageExtensions.includes(fileExtension!)) {
        results.skipped++;
        toast.error(
          `Invalid image format for ${file.name}. Supported formats: ${imageExtensions.join(
            ", "
          )}`,
          {
            position: "top-center",
            style: { borderRadius: "8px", background: "#333", color: "#fff" }
          }
        );
        return null;
      }

      if (fileType === "image" && file.size > 30 * 1024 * 1024) {
        results.skipped++;
        toast.error(
          `Image size exceeds 30MB for ${file.name}. Please select a smaller image.`,
          {
            position: "top-center",
            style: { borderRadius: "8px", background: "#333", color: "#fff" }
          }
        );
        return null;
      }

      try {
        const combined = [...selectedImages, ...files].slice(0, 5);

        setSelectedImages(combined);
        results.success++;
      } catch {
        results.failed++;
      }
    });

    try {
      await Promise.all(uploadPromises);
      toast.dismiss(loadingToast);

      const message =
        files.length === 1
          ? results.success > 0
            ? "Memory uploaded successfully"
            : results.failed > 0
              ? "Memory failed to upload"
              : results.skipped > 0
                ? "Memory skipped due to validation"
                : ""
          : [
              results.success > 0
                ? `${results.success} memories uploaded successfully`
                : "",
              results.failed > 0 ? `${results.failed} memories failed` : "",
              results.skipped > 0
                ? `${results.skipped} memories skipped due to validation`
                : ""
            ]
              .filter(Boolean)
              .join(", ");

      if (results.success > 0) {
        toast.success(message, {
          position: "top-center",
          duration: 3000,
          style: { borderRadius: "8px", background: "#333", color: "#fff" }
        });
      } else if (results.failed > 0 || results.skipped > 0) {
        toast.error(message, {
          position: "top-center",
          duration: 3000,
          style: { borderRadius: "8px", background: "#333", color: "#fff" }
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error((error as string) ?? "Upload process failed", {
        position: "top-center",
        style: { borderRadius: "8px", background: "#333", color: "#fff" }
      });
    }

    event.target.value = "";
  };

  const gridCols =
    selectedImages.length <= 1
      ? "grid-cols-1"
      : selectedImages.length <= 4
        ? "grid-cols-2"
        : "grid-cols-3";

  const handleAddPost = async () => {
    try {
      const apiFormData = new FormData();

      apiFormData.append("userId", userId);
      apiFormData.append("name", formData.name);
      apiFormData.append("post_description", formData.post_description);
      apiFormData.append("email", formData.email);

      if (selectedImages[0]) {
        apiFormData.append("image", selectedImages[0]);
      }

      await dispatch(CreatePost(apiFormData))
        .unwrap()
        .then(() => {
          setFormData(initialValues);
          setSelectedImages([]);
          setAddDialogOpen(false);
          fetchPosts();
          toast.success("Post created successfully!", {
            position: "top-center",
            style: { borderRadius: "8px", background: "#333", color: "#fff" }
          });
        });
    } catch (error) {
      toast.error((error as string) ?? "Failed to create Post");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeletePost = async (postId: string) => {
    setDeleteLoading(true);
    try {
      await dispatch(DeletePost(postId))
        .unwrap()
        .then(() => {
          fetchPosts();
          setOpenConfirmDialog(false);
          toast.success("Post Deleted Successfully", {
            position: "top-center",
            style: {
              borderRadius: "8px",
              background: "#333",
              color: "#fff"
            }
          });
        })
        .catch((err) => {
          toast.error((err as string) ?? "Failed to delete the post");
        });
    } catch (error) {
      toast.error((error as string) ?? "Internal Server Error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteDialogue = () => {
    setOpenConfirmDialog(true);
  };

  return (
    <div className='mx-10 my-10 bg-white px-10 py-10 overflow-auto max-w-500px'>
      <Toaster />
      <div className='flex justify-end'>
        <Button
          onClick={() => {
            setAddDialogOpen(true);
            setMode("Create");
          }}
        >
          <Plus className='h-4 w-4' />
          Add Post
        </Button>
      </div>
      <div className='flex items-center justify-center'>
        <div className='grid grid-cols-2 gap-4'>
          {postData.map((post) => (
            <Card
              key={post._id}
              className='w-full max-w-xl shadow-[0_-4px_10px_-2px_gray,0_4px_10px_-2px_orange]'
            >
              <CardHeader>
                <CardTitle>{post.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {post?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`${process.env.NEXT_PUBLIC_FRONTEND_URL}${post?.imageUrl}`}
                    alt='Uploaded Post'
                    className='max-w-sm rounded-md'
                  />
                ) : (
                  <div>No Image Available</div>
                )}

                <CardDescription>{post?.post_description}</CardDescription>
              </CardContent>
              <CardFooter className='flex justify-between'>
                {" "}
                <p> {post?.email} </p>
                <div className='flex gap-2'>
                  <Button
                    onClick={() => {
                      setAddDialogOpen(true);
                      setMode("Edit");
                    }}
                    className='cursor-pointer max-w-10 w-full'
                  >
                    <Edit2 />
                  </Button>
                  <Button
                    onClick={() => {
                      openDeleteDialogue();
                    }}
                    className='cursor-pointer max-w-10 w-full'
                  >
                    <Trash2 />
                  </Button>
                </div>
                <DeleteDialog
                  open={openConfirmDialog}
                  onOpenChange={setOpenConfirmDialog}
                  onConfirm={() => handleDeletePost(post?._id)}
                  title='Delete Post'
                  description='Are you sure you want to delete this post? This action cannot be undone.'
                  confirmText='Delete post'
                  cancelText='Cancel'
                  isLoading={deleteLoading}
                  isDangerous={true}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className='max-h-[80vh] overflow-y-auto'>
          <DialogTitle className='text-2xl'>Post Dialog</DialogTitle>

          {/* Upload Button */}
          <div className='h-full flex items-center justify-center rounded-lg'>
            <input
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
              id='file-upload'
              multiple
            />

            <label
              htmlFor='file-upload'
              className='flex items-center gap-2.5 cursor-pointer transition-all text-sm py-2 px-5 border group rounded-[7px] bg-primary text-white'
            >
              <Upload className='text-base max-w-4' />
              Upload Images (Max 5)
            </label>
          </div>

          {selectedImages.length > 0 && (
            <div className={`mt-4 grid gap-3 ${gridCols}`}>
              {selectedImages.map((file, index) => (
                <div
                  key={index}
                  className='relative rounded-lg overflow-hidden border'
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt='preview'
                    className='h-32 w-full object-cover'
                  />

                  {/* Remove button */}
                  <button
                    type='button'
                    onClick={() =>
                      setSelectedImages((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className='absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded'
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Inputs */}
          <div className='mt-4'>
            <Label>Post Name</Label>
            <Input
              name='name'
              value={
                mode === "Edit"
                  ? postData.map((post) => post?.name)
                  : formData?.name
              }
              onChange={handleInputChange}
              className='mt-2'
              placeholder='Post Name'
            />
          </div>

          <div className='mt-4'>
            <Label>Post Description</Label>
            <Input
              name='post_description'
              value={
                mode === "Edit"
                  ? postData.map((post) => post?.post_description)
                  : formData.post_description
              }
              onChange={handleInputChange}
              className='mt-2'
              placeholder='Post Description'
            />
          </div>

          <div className='mt-4'>
            <Label>Email</Label>
            <Input
              name='email'
              value={
                mode === "Edit"
                  ? postData.map((post) => post?.email)
                  : formData?.email
              }
              onChange={handleInputChange}
              className='mt-2'
              type='email'
              placeholder='Enter your email'
            />
          </div>

          <Button
            className='mt-6'
            onClick={() => {
              handleAddPost();
            }}
          >
            {mode === "Edit" ? "Edit Post" : "Add Post"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PostPage;
