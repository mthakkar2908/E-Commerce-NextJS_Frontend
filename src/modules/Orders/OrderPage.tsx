"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import LoadingWrapper from "@/src/common/LoadingWrapper";
import useDebounce from "@/src/common/useDebounce";
import { useAppDispatch } from "@/src/store";
import { GetOrders, OrderResponse, searchOrders } from "@/src/store/orderSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const OrderPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const debounce = useDebounce(searchValue, 500);

  useEffect(() => {
    const fecthFiltredOrders = async () => {
      const filtredData = await dispatch(searchOrders(debounce)).unwrap();
      setOrders(filtredData as OrderResponse[]);
    };

    fecthFiltredOrders();
  }, [dispatch, debounce]);

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const response = await dispatch(GetOrders()).unwrap();
        setOrders(response as OrderResponse[]);
      } catch (error) {
        console.error("Error while fetching the Order Data : ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [dispatch]);

  const navigateOrder = (orderId: string) => {
    router.push("orders/" + `${orderId}`);
  };

  if (loading) {
    return <LoadingWrapper />;
  }

  return (
    <div className="mx-10 my-10 bg-white px-10 py-10 overflow-auto max-w-500px">
      <div className="flex justify-center">
        <p className="text-black text-3xl font-bold">Your Orders</p>
      </div>

      <div className="mt-3">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search Product here.."
          className="h-6 text-[#212121] px-2 py-6 w-full mb-4 flex justify-center items-center border border-black rounded-xl"
        />
      </div>
      <div>
        {orders.map((order) => (
          <div key={order._id}>
            <Card
              key={order._id}
              className="bg-black mt-2 px-0! py-0! rounded-xl overflow-hidden"
            >
              <div className="mt-4">
                <CardHeader className="text-white">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <p>{order.product_name}</p>
                    <p>{order._id}</p>
                  </div>
                </CardHeader>
                <CardDescription className="text-gray-500">
                  <div className="flex flex-col md:flex-row md:justify-between mx-5">
                    <span>{order?.product_id?.about_product}</span>
                    <span>
                      Quantity: {order?.product_quan} {"  "} Price:{" "}
                      {order?.total_price}
                    </span>
                  </div>
                </CardDescription>
              </div>

              <div className="bg-gray-500">
                <CardContent className="rounded-b-xl">
                  <div className="w-full max-w-500 flex flex-col md:flex-row md:justify-between">
                    <span>
                      User name : {order?.user_first_name}{" "}
                      {order?.user_last_name}
                    </span>
                    <span>email : {order.email}</span>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-between mb-4">
                    <div className="flex flex-col">
                      <span> Address : {order?.address}</span>
                      <span> Mobile No : {order?.mobile_no}</span>
                    </div>
                    <div className="mt-2">
                      <Button
                        className="cursor-pointer"
                        onClick={() => {
                          navigateOrder(order._id);
                        }}
                      >
                        Go to Your Order
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderPage;
