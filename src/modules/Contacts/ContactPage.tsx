/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/src/store";
import { ContactFormSubmit } from "@/src/store/commonSlice";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const ContactPage = () => {
  const initialValues = {
    name: "",
    email: "",
    mobile_no: "",
    title: "",
    description: "",
  };
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.mobile_no.trim())
      newErrors.mobile_no = "Mobile number is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitLoading(true);
    try {
      const response = await dispatch(
        ContactFormSubmit({
          name: formData.name,
          email: formData.email,
          mobile_no: formData.mobile_no,
          title: formData.title,
          description: formData.description,
        }),
      ).unwrap();

      console.log(response.statusCode);

      toast.success(response?.message);
      setFormData({
        name: "",
        email: "",
        mobile_no: "",
        title: "",
        description: "",
      });
    } catch (error) {
      toast.error((error as string) ?? "Failed to submit the contact form");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mx-10 my-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
      <Toaster />
      <div className="flex-1 flex h-143 w-full justify-center">
        <img src="/images/transition.jpg" alt="transition" />
      </div>
      <div className="flex-1 flex justify-center">
        <form onSubmit={handleSubmit} className="w-full mx-10">
          <h1 className="flex justify-start ml-26 text-3xl">Contact Form</h1>
          <div className="w-full flex flex-col mt-5">
            <label htmlFor="name" className="text-xl">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData?.name}
              onChange={handleInputChange}
              className="w-100 mt-1.5 px-3 py-1 h-9 border text-white border-gray-600 rounded-3xl"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div className="w-full flex flex-col mt-5">
            <label htmlFor="email" className="text-xl">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleInputChange}
              className="w-100 mt-1.5 px-3 py-1 h-9 border border-gray-600 rounded-3xl"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div className="w-full flex flex-col mt-5">
            <label htmlFor="mobile_no" className="text-xl">
              Mobile No <span className="text-red-500">*</span>
            </label>
            <input
              type="mobile_no"
              name="mobile_no"
              value={formData?.mobile_no}
              onChange={handleInputChange}
              className="w-100 mt-1.5 px-3 py-1 h-9 border border-gray-600 rounded-3xl"
            />
            {errors.mobile_no && (
              <p className="text-red-500 text-sm mt-1">{errors.mobile_no}</p>
            )}
          </div>
          <div className="w-full flex flex-col mt-5">
            <label htmlFor="title" className="text-xl">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="title"
              name="title"
              value={formData?.title}
              onChange={handleInputChange}
              className="w-100 mt-1.5 px-3 py-1 h-9 border border-gray-600 rounded-3xl"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          <div className="w-full flex flex-col mt-5">
            <label htmlFor="description" className="text-xl">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="description"
              name="description"
              value={formData?.description}
              onChange={handleInputChange}
              className="w-100 mt-1.5 px-3 py-1 h-9 border border-gray-600 rounded-3xl"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="mt-7">
            <Button
              disabled={submitLoading}
              className="w-100 h-12 text-lg cursor-pointer"
            >
              {submitLoading ? "Submitting.." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
