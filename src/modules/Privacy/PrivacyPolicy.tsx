"use client";
import LoadingWrapper from "@/src/common/LoadingWrapper";
import { useAppDispatch } from "@/src/store";
import { GetPrivacyText } from "@/src/store/commonSlice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface PrivacyResponse {
  _id: string;
  PrivacyPolicyText: string;
}

const PrivacyPolicy = () => {
  const dispatch = useAppDispatch();
  const [privacyData, setPrivacyData] = useState("");
  const [privacyLoading, setPrivacyLoading] = useState(false);

  useEffect(() => {
    const fetchPrivacyData = async () => {
      setPrivacyLoading(false);
      try {
        const response = await dispatch(GetPrivacyText()).unwrap();
        setPrivacyData(response?.[0]?.PrivacyPolicyText);
      } catch (error) {
        toast.error((error as string) ?? "Failed to fetched the privacy data.");
      } finally {
        setPrivacyLoading(false);
      }
    };

    fetchPrivacyData();
  }, [dispatch]);

  if (privacyLoading) {
    return <LoadingWrapper />;
  }

  return (
    <div className="mx-10 my-10">
      <h1 className='font-bold text-2xl'>Privacy Policy</h1>
      <p className="font-medium mt-4 text-xl text-gray-500">
        {privacyData}
      </p>
    </div>
  );
};

export default PrivacyPolicy;
