"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { DeleteDialog } from "@/src/common/DeleteDialog";
import { useAppDispatch } from "@/src/store";
import { DeleteOrderById, GetOrdersByID } from "@/src/store/orderSlice";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface Product {
  _id: string;
  name: string;
  about_product: string;
  price: number;
  quan: number;
  is_fav: boolean;
  __v: number;
}

export interface Order {
  _id: string;
  product_id: Product;
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  product_name: string;
  email: string;
  status: "pending" | "completed" | "cancelled";
  address: string;
  mobile_no: number;
  total_price: number;
  product_quan: number;
}

const Order = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState<Order>();
  const [handleOpen, setHandleOpen] = useState(false);
  const [delOrderLoading, setDelOrderLoading] = useState(false);

  useEffect(() => {
    const getOrderDataById = async () => {
      const orderData = await dispatch(GetOrdersByID(id));
      setOrder(orderData?.payload as Order);
    };
    getOrderDataById();
  }, [dispatch, id]);

  const handleDeleteOrder = async (orderId: string) => {
    setDelOrderLoading(true);
    try {
      await dispatch(DeleteOrderById(orderId))
        .unwrap()
        .then(() => {
          toast.success("Order Deleted Successfully.");
          setHandleOpen(false);
          router.push("/orders");
        });
    } catch (error) {
      console.error("Failed to Delete the Order", error);
    } finally {
      setDelOrderLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="max-w-90 w-full">
        <CardHeader>
          <div className="flex justify-between">
            <span>{order?.product_name}</span>
            <span className="bg-green-200 border border-green-600 px-1.5 py-1.5 rounded-2xl text-sm">
              {order?.status}
            </span>
          </div>
        </CardHeader>
        <CardDescription>{order?.product_id?.about_product}</CardDescription>

        <CardContent>
          <div className="flex flex-col">
            <span>
              <b> UserName:</b> {order?.user_first_name} {order?.user_last_name}
            </span>
            <span>
              {" "}
              <b> email:</b> {order?.email}
            </span>
            <span>
              {" "}
              <b> Address: </b> {order?.address}
            </span>
            <span>
              {" "}
              <b> Mobile no: </b> {order?.mobile_no}
            </span>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                setHandleOpen(true);
              }}
              className="text-white hover:border border-black cursor-pointer"
              variant={"outline"}
            >
              <Trash2 />
            </Button>
            <DeleteDialog
              open={handleOpen}
              onOpenChange={setHandleOpen}
              onConfirm={() => handleDeleteOrder(String(order?._id))}
              title="Remove Order"
              description="Are you sure you want to remove this order ? This action cannot be undone."
              confirmText="Remove order"
              cancelText="Cancel"
              isLoading={delOrderLoading}
              isDangerous={true}
            />{" "}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Order;
