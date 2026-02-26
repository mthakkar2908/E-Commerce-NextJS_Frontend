/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { useAppDispatch } from "../store";
import { deleteSubscribeChannel, getSubscribeList } from "../store/commonSlice";
import { useSelector } from "react-redux";
import { SubscribeItem } from "../api/authApi";
import toast, { Toaster } from "react-hot-toast";

interface SubscribeListProps {
  openSubscribeList: boolean;
  setOpenSubscribeList: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubscribeList: React.FC<SubscribeListProps> = ({
  openSubscribeList,
  setOpenSubscribeList,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: any) => state.auth);
  const userId = user?.userId;
  const [emailData, setEmailData] = useState<SubscribeItem[]>([]);

  const fetchSubscribeData = async () => {
    try {
      if (!userId) return;
      const response = await dispatch(getSubscribeList(userId)).unwrap();
      setEmailData(response.data);
    } catch (error) {
      toast.error((error as string) ?? "No data found");
    }
  };

  useEffect(() => {
    fetchSubscribeData();
  }, [dispatch, openSubscribeList, userId]);

  const handleDelete = async (id: string, email: string) => {
    const promise = dispatch(
      deleteSubscribeChannel({ userId: id, email }),
    ).unwrap();

    toast.promise(promise, {
      loading: "Unsubscribing...",
      success: (response) => {
        fetchSubscribeData();
        return response?.message ?? "Unsubscribed Successfully";
      },
      error: (error) => error ?? "Error to delete the subscribe channel",
    });
  };

  return (
    <Dialog open={openSubscribeList} onOpenChange={setOpenSubscribeList}>
      <Toaster />
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogTitle className="text-2xl">Subscribe List</DialogTitle>

        {emailData.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-lg font-semibold">No subscribed emails found</p>
            <p className="text-sm text-gray-500 mt-2">
              Subscribe with your email to receive the latest arrivals and
              updates.
            </p>
          </div>
        ) : (
          emailData.map((item) => (
            <div key={item.email} className="p-2 border-b flex justify-between">
              <p>{item.email}</p>
              <span
                onClick={() => handleDelete(item._id, item.email)}
                className="cursor-pointer hover:text-gray-400"
              >
                UnSubscirbe
              </span>
            </div>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscribeList;
