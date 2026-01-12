"use client";

import { useAppDispatch } from "@/src/store";
import { GetCartData } from "@/src/store/commonSlice";
import { useEffect } from "react";
import toast from "react-hot-toast";

const CartPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        await dispatch(GetCartData()).unwrap();
      } catch (error) {
        toast.error((error as string) ?? "Failed to fetch the cart Data");
      }
    };

    fetchCartData();
  }, [dispatch]);

  return (
    <div>
      <h1>Your cart items</h1>
      <p>Below your cart items</p>
    </div>
  );
};

export default CartPage;
