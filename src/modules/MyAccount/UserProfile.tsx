/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
/* eslint-disable @next/next/no-img-element */
import { Label } from "@/components/ui/label";
import LoadingWrapper from "@/src/common/LoadingWrapper";
import { useAppDispatch } from "@/src/store";
import { GetUserById, UpdateUser } from "@/src/store/authSlice";
import { Edit2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

interface Response {
  _id: string;
  name: string;
  email: string;
  token: string;
  profile_image: string;
}

const UserProfile = () => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const initialValues = {
    name: "",
    email: "",
    profile_image: "",
  };

  const [formData, setFormData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await dispatch(GetUserById(user.userId));
      setFormData(response?.payload as Response);
      setIsPreview(false);
    } catch (error) {
      toast.error(error as string);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!user?.userId) return;

    fetchUserData();
  }, [user?.userId, dispatch]);

  useEffect(() => {
    if (!user) return;

    setFormData({
      name: user.name ?? "",
      email: user.email ?? "",
      profile_image: user.image ?? "",
    });

    setIsPreview(false);
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    setIsPreview(true);
    const loadingToast = toast.loading(
      `Uploading ${files.length} ${files.length === 1 ? "memory" : "memories"}...`,
      {
        position: "top-center",
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
      },
    );

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
    };

    const uploadPromises = files.map(async (file) => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const fileType = file.type.startsWith("image") ? "image" : "video";

      const imageExtensions = ["jpeg", "jpg", "png", "gif"];

      if (fileType === "image" && !imageExtensions.includes(fileExtension!)) {
        results.skipped++;
        toast.error(
          `Invalid image format for ${file.name}. Supported formats: ${imageExtensions.join(
            ", ",
          )}`,
          {
            position: "top-center",
            style: { borderRadius: "8px", background: "#333", color: "#fff" },
          },
        );
        return null;
      }

      if (fileType === "image" && file.size > 30 * 1024 * 1024) {
        results.skipped++;
        toast.error(
          `Image size exceeds 30MB for ${file.name}. Please select a smaller image.`,
          {
            position: "top-center",
            style: { borderRadius: "8px", background: "#333", color: "#fff" },
          },
        );
        return null;
      }

      try {
        const previewUrl = URL.createObjectURL(file);
        setFile(file);

        setFormData((prev) => ({
          ...prev,
          profile_image: previewUrl,
        }));
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
                : "",
            ]
              .filter(Boolean)
              .join(", ");

      if (results.success > 0) {
        toast.success(message, {
          position: "top-center",
          duration: 3000,
          style: { borderRadius: "8px", background: "#333", color: "#fff" },
        });
      } else if (results.failed > 0 || results.skipped > 0) {
        toast.error(message, {
          position: "top-center",
          duration: 3000,
          style: { borderRadius: "8px", background: "#333", color: "#fff" },
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error((error as string) ?? "Upload process failed", {
        position: "top-center",
        style: { borderRadius: "8px", background: "#333", color: "#fff" },
      });
    }

    event.target.value = "";
  };

  const handleUpdateUser = async () => {
    try {
      const apiFormData = new FormData();

      apiFormData.append("name", formData.name);
      if (file) {
        apiFormData.append("image", file);
      }
      apiFormData.append("email", formData.email);

      await dispatch(
        UpdateUser({
          formData: apiFormData,
          userId: user.userId,
        }),
      )
        .unwrap()
        .then(() => {
          setIsPreview(false);
          setFile(null);
          toast.success("User Profile Updated..", {
            position: "top-center",
            duration: 3000,
            style: { borderRadius: "8px", background: "#333", color: "#fff" },
          });
        });
    } catch (error) {
      toast.error((error as string) ?? "failed to update a user");
    }
  };

  if (loading) {
    return <LoadingWrapper />;
  }

  if (!user?.token) return null;

  return (
    <div className="mx-10 my-10 h-auto bg-white text-black dark:text-white grid grid-cols-2">
      <Toaster />
      <div className="flex-1 bg-gray-300 flex justify-center">
        <div className="relative mt-4 mb-4">
          <img
            src={
              !isPreview
                ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}${formData?.profile_image}`
                : `${formData?.profile_image}`
            }
            alt="file"
            className="w-60 h-50 rounded-2xl"
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            id="file-upload"
            multiple
          />

          {!isPreview ? (
            <label
              htmlFor="file-upload"
              className="cursor-pointer absolute bottom-10 -right-4 bg-white dark:bg-black p-2 rounded-full shadow-lg"
            >
              <Edit2 className="w-5 h-5" />
            </label>
          ) : (
            <Button
              onClick={() => {
                setIsPreview(false);
                setFile(null);
                fetchUserData();
              }}
              className="cursor-pointer absolute bottom-10 -right-4 bg-white hover:bg-white p-2 rounded-full shadow-lg"
            >
              <X className="w-5 h-5 text-black " />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-400 flex flex-col justify-center items-center">
        <div>
          <h1 className="text-2xl mb-4 mt-4">Your Details</h1>
          <div>
            <Label className="mt-2 mb-2">
              Name <span className="text-red-600">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData?.name}
              onChange={handleInputChange}
              placeholder="Enter your Name"
              className="p-2 rounded-xl mt-2 mb-2 border"
            />

            <Label className="mt-2 mb-2">
              Email <span className="text-red-600">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData?.email}
              onChange={handleInputChange}
              placeholder="Enter your Email"
              className="p-2 rounded-xl mt-2 border"
            />
          </div>
          <div className="flex items-center justify-center  mt-4 mb-4 cursor-pointer">
            <Button className="cursor-pointer" onClick={handleUpdateUser}>
              Update Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
