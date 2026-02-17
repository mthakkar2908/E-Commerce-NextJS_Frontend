"use client";

import LoadingWrapper from "@/src/common/LoadingWrapper";
import { useAppDispatch } from "@/src/store";
import dynamic from "next/dynamic";

import { AddTerms, GetTermsText } from "@/src/store/commonSlice";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false
});
export interface TermsResponse {
  _id: string;
  TermsConditionsText: string;
}

const TermsCondition = () => {
  const dispatch = useAppDispatch();
  const [termsData, setTermsData] = useState("");
  const [termsLoading, setTermsLoading] = useState(false);

  useEffect(() => {
    const fetchTermsData = async () => {
      setTermsLoading(true);
      try {
        const response = await dispatch(GetTermsText()).unwrap();
        setTermsData(response?.[0]?.TermsConditionsText);
      } catch (error) {
        toast.error((error as string) ?? "Failed to fetch the terms data");
      } finally {
        setTermsLoading(false);
      }
    };

    fetchTermsData();
  }, [dispatch]);

  const handleTermsAdded = async () => {
    try {
      const response = await dispatch(AddTerms(termsData)).unwrap();
      toast.success(response?.message ?? "Terms Data added.");
    } catch (error) {
      toast.error((error as string) ?? "Failed to add terms data");
    }
  };

  if (termsLoading) {
    return <LoadingWrapper />;
  }

  return (
    <div className='mx-10 my-10'>
      <Toaster />
      <h1 className='font-bold text-2xl'>Terms & Conditions</h1>
      <div className='bg-gray-500 p-6 rounded-lg shadow-md'>
        <ReactQuill theme='snow' value={termsData} onChange={setTermsData} />

        <button
          onClick={handleTermsAdded}
          className='mt-6 bg-black text-white px-6 py-2 rounded-md hover:opacity-90'
        >
          Save Terms & Conditions
        </button>
      </div>{" "}
    </div>
  );
};

export default TermsCondition;
