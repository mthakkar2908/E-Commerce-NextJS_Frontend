"use client";

import LoadingWrapper from "@/src/common/LoadingWrapper";
import { useAppDispatch } from "@/src/store";
import { GetTermsText } from "@/src/store/commonSlice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

  if (termsLoading) {
    return <LoadingWrapper />;
  }

  return (
    <div className='mx-10 my-10'>
      <h1 className='font-bold text-2xl'>Terms & Conditions</h1>
      <p className="mt-4 font-medium text-xl text-gray-500">{termsData}</p>
    </div>
  );
};

export default TermsCondition;
