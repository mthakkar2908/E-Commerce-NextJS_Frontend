/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import LoadingWrapper from "@/src/common/LoadingWrapper";
import QuantityCounter from "@/src/common/QuantityCounter";
import useDebounce from "@/src/common/useDebounce";

import { useAppDispatch, useAppSelector } from "@/src/store";
import { AddToCart } from "@/src/store/commonSlice";
import {
  GetFavourite,
  getProduct,
  searchProductsByQuery
} from "@/src/store/productSlice";
import { ChevronsLeft, ChevronsRight, Heart } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export interface ProductItem {
  _id?: string;
  name?: string;
  about_product?: string;
  price?: number;
  quan?: number;
  is_fav?: boolean;
  [key: string]: any;
}

export interface ResponseProduct {
  data: ProductItem[];
  total: number;
  page: number;
  pageSize: number;
}

interface AuthState {
  user: Record<string, any> | null;
  status: string;
}
const MainDashboard = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector((s: any) => s.auth) as AuthState;
  const [productData, setProductData] = useState<ProductItem[] | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [searchValue, setSearchValue] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [totalPages, setTotalPages] = useState<number>(0);

  const debounce = useDebounce(searchValue, 500);

  const handleQuantityChange = (productId: string, value: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value
    }));
  };

  useEffect(() => {
    if (auth.status === "idle" && auth.user === null) {
      router.push("/login");
    }
  }, [auth.user, auth.status, router]);

  useEffect(() => {
    async function fetchFiltredData() {
      try {
        const response = await dispatch(
          searchProductsByQuery(debounce)
        ).unwrap();
        setProductData(response as ProductItem[]);
      } catch (error) {
        toast.error((error as string) ?? "Failed to fetch filtered products");
      }
    }

    fetchFiltredData();
  }, [debounce, dispatch]);

  useEffect(() => {
    const fetchProduct = async (): Promise<void> => {
      try {
        const response: ResponseProduct = await dispatch(
          getProduct({ page, pageSize })
        ).unwrap();

        setProductData(response.data);

        const calculatedTotalPages = Math.ceil(response.total / pageSize);

        setTotalPages(calculatedTotalPages);
      } catch {
        toast.error("Failed to fetch product.");
      }
    };

    fetchProduct();
  }, [dispatch, page, pageSize]);

  const updateFavourite = async (id?: string) => {
    if (!id) return;

    try {
      await dispatch(GetFavourite(id)).unwrap();

      setProductData((prev) =>
        prev
          ? prev.map((product) =>
              product._id === id
                ? { ...product, is_fav: !product.is_fav }
                : product
            )
          : prev
      );
    } catch (error) {
      console.error("Failed to update favourite:", error);
    }
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      const cartData = await dispatch(
        AddToCart({
          credentials: {
            items: [
              {
                productId: productId,
                quantity: Number(quantity)
              }
            ]
          },
          userId: auth?.user?.userId
        })
      ).unwrap();

      if (cartData.statusCode == 201) {
        toast.success(cartData.message ?? "Cart Added Successfully.", {
          position: "top-center",
          duration: 3000,
          style: {
            background: "#101010",
            color: "#fff"
          }
        });
      }
    } catch (error) {
      console.error(error ?? "Faild to add the data in cart");
    }
  };

  return (
    <div className='w-full mx-10 my-10'>
      <Toaster />
      {auth?.user ? (
        <div>
          <h1 className='text-black dark:text-white text-2xl font-bold flex items-center justify-center my-5'>
            Your Products
          </h1>
          <div className='flex justify-between gap-5'>
            <input
              type='text'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder='Search Product here..'
              className='h-6 text-[#212121] dark:text-white px-2 py-6 w-full mb-4 flex justify-center items-center border border-black dark:border-white rounded-xl'
            />

            <div className='relative w-20'>
              <select
                className='
      appearance-none
      w-full
      h-12
      px-4
      pr-8
      rounded-full
      bg-white
      border
      border-gray-300
      text-gray-700
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
      cursor-pointer
    '
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3'>
            {productData ? (
              productData.map((product) => (
                <Card
                  key={product?._id}
                  className='w-full max-w-sm shadow-[0_-4px_10px_-2px_gray,0_4px_10px_-2px_orange]'
                >
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.about_product}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='flex justify-between'>
                      <div>
                        <p className='mb-4 text-sm text-gray-600 dark:text-gray-300'>
                          Price : ${product.price}
                        </p>
                        <p className='text-sm text-gray-600 dark:text-gray-300'>
                          In Stock: {product.quan}
                        </p>
                      </div>
                      <div>
                        {product.is_fav === false || !product.is_fav ? (
                          <Heart
                            onClick={() => updateFavourite(product?._id)}
                            className='text-red-500'
                          />
                        ) : (
                          <Heart
                            onClick={() => updateFavourite(product?._id)}
                            className='text-red-500 fill-red-500'
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='flex-col gap-2'>
                    <div className='flex justify-between gap-12'>
                      {product._id && (
                        <QuantityCounter
                          value={quantities[product._id] ?? 1}
                          max={Number(product.quan)}
                          onChange={(value) =>
                            handleQuantityChange(String(product._id), value)
                          }
                        />
                      )}

                      <Button
                        disabled={!product._id}
                        onClick={() => {
                          if (!product._id) return;

                          handleAddToCart(
                            product._id,
                            quantities[product._id] ?? 1
                          );
                        }}
                      >
                        Add to cart
                      </Button>
                    </div>
                    <Button
                      onClick={() => {
                        router.push("products/" + product?._id);
                      }}
                      variant='outline'
                      className='w-full text-white'
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
      <div className='mt-6 flex gap-10 items-center justify-center text-xl text-gray-700'>
        <button
          className={`${page === 1 ? "cursor-not-allowed" : "cursor-pointer"} bg-gray-700 px-2 py-2 w-24 text-white rounded-3xl flex justify-center items-center gap-1 text-lg`}
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          <ChevronsLeft /> Prev
        </button>

        <span className='text-black dark:text-white'>
          {" "}
          Page {page} of {totalPages}{" "}
        </span>

        <button
          className={`${page === totalPages ? "cursor-not-allowed" : "cursor-pointer"} bg-gray-700 px-2 py-2 w-24 text-white rounded-3xl flex justify-center items-center gap-1 text-lg`}
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next <ChevronsRight />
        </button>
      </div>
    </div>
  );
};

export default MainDashboard;
