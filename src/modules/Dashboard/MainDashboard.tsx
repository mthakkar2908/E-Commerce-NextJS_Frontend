"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingWrapper from "@/src/common/LoadingWrapper";
import useDebounce from "@/src/common/useDebounce";

import { useAppDispatch, useAppSelector } from "@/src/store";
import {
  GetFavourite,
  getProduct,
  searchProductsByQuery,
} from "@/src/store/productSlice";
import { Heart } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

// Local interfaces for typing
export interface ProductItem {
  _id?: string;
  name?: string;
  about_product?: string;
  price?: number;
  quan?: number;
  is_fav?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AuthState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: Record<string, any> | null;
  status: string;
}
const MainDashboard = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const auth = useAppSelector((s: any) => s.auth) as AuthState;
  const [productData, setProductData] = useState<ProductItem[] | null>(null);

  const [searchValue, setSearchValue] = useState<string>("");

  const hasRefCurrent = useRef<boolean>(false);

  const debounce = useDebounce(searchValue, 500);

  useEffect(() => {
    if (auth.status === "idle" && auth.user === null) return;
    if (!auth.user) {
      router.push("/login");
    }
  }, [auth.user, auth.status, router]);

  useEffect(() => {
    async function fetchFiltredData() {
      try {
        const response = await dispatch(
          searchProductsByQuery(debounce),
        ).unwrap();
        setProductData(response as ProductItem[]);
      } catch (error) {
        toast.error((error as string) ?? "Failed to fetch filtered products");
        console.error("Failed to fetch filtered products:", error);
      }
    }

    fetchFiltredData();
  }, [debounce, dispatch]);

  useEffect(() => {
    const fetchProduct = async (): Promise<void> => {
      try {
        if (hasRefCurrent.current) return;

        hasRefCurrent.current = true;
        const response = await dispatch(getProduct()).unwrap();
        setProductData(response as ProductItem[]);
        toast.success("Produt Fetched Successfully.", {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#101010",
            color: "#fff",
          },
        });
      } catch (err) {
        toast.error("Failed to fetch product.");
        console.error("Failed to fetch product:", err);
      }
    };

    fetchProduct();
  }, [dispatch]);

  const updateFavourite = async (id?: string) => {
    if (!id) return;

    try {
      await dispatch(GetFavourite(id)).unwrap();

      setProductData((prev) =>
        prev
          ? prev.map((product) =>
              product._id === id
                ? { ...product, is_fav: !product.is_fav }
                : product,
            )
          : prev,
      );
    } catch (error) {
      console.error("Failed to update favourite:", error);
    }
  };

  return (
    <div className="w-full mx-10 my-10">
      <Toaster />
      {auth?.user ? (
        <div>
          <h1 className="text-black text-2xl font-bold flex items-center justify-center my-5">
            Your Products
          </h1>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search Product here.."
            className="h-6 text-[#212121] px-2 py-6 w-full mb-4 flex justify-center items-center border border-black rounded-xl"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {productData ? (
              productData.map((product) => (
                <Card
                  key={product?._id}
                  className="w-full max-w-sm shadow-[0_-4px_10px_-2px_gray,0_4px_10px_-2px_orange]"
                >
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.about_product}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <div>
                        <p className="mb-4 text-sm text-gray-600">
                          Price : ${product.price}
                        </p>
                        <p className="text-sm text-gray-600">
                          In Stock: {product.quan}
                        </p>
                      </div>
                      <div>
                        {product.is_fav === false || !product.is_fav ? (
                          <Heart
                            onClick={() => updateFavourite(product?._id)}
                            className="text-red-500"
                          />
                        ) : (
                          <Heart
                            onClick={() => updateFavourite(product?._id)}
                            className="text-red-500 fill-red-500"
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button type="submit" className="w-full">
                      Add to cart
                    </Button>
                    <Button
                      onClick={() => {
                        router.push("products/" + product?._id);
                      }}
                      variant="outline"
                      className="w-full text-white"
                    >
                      Go to the product
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p>No products available.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <LoadingWrapper />
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
