/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import LoadingWrapper from "@/src/common/LoadingWrapper";
import { useAppDispatch } from "@/src/store";
import { AddPrivacy, GetPrivacyText } from "@/src/store/commonSlice";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false
});
export interface PrivacyResponse {
  _id: string;
  PrivacyPolicyText: string;
}
const PrivacyPolicy = () => {
  const dispatch = useAppDispatch();
  const [privacyData, setPrivacyData] = useState("");
  const [privacyLoading, setPrivacyLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacyData = async () => {
      try {
        setPrivacyLoading(true);
        const response = await dispatch(GetPrivacyText()).unwrap();
        setPrivacyData(response?.[0]?.PrivacyPolicyText || "");
      } catch (error: any) {
        toast.error(error ?? "Failed to fetch privacy policy.");
      } finally {
        setPrivacyLoading(false);
      }
    };

    fetchPrivacyData();
  }, [dispatch]);

  const handleAddPrivacyText = async () => {
    try {
      const response = await dispatch(AddPrivacy(privacyData)).unwrap();
      toast.success(response.message ?? "Privacy data added.");
    } catch (error: any) {
      toast.error(error ?? "Failed to add privacy data");
    }
  };

  if (privacyLoading) {
    return <LoadingWrapper />;
  }

  return (
    <div className='max-w-5xl mx-auto my-10 px-6'>
      <h1 className='text-3xl font-bold mb-6'>Privacy Policy</h1>

      <div className='bg-gray-500 p-6 rounded-lg shadow-md'>
        <ReactQuill
          theme='snow'
          value={privacyData}
          onChange={setPrivacyData}
        />

        <button
          onClick={handleAddPrivacyText}
          className='mt-6 bg-black text-white px-6 py-2 rounded-md hover:opacity-90'
        >
          Save Privacy Policy
        </button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
