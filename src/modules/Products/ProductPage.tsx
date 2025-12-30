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
import { Heart } from "lucide-react";
import React, { useEffect } from "react";
import { ProductItem } from "../Dashboard/MainDashboard";
import { useParams } from "next/navigation";
import { GetFavourite, GetProductsById } from "@/src/store/productSlice";
import { useAppDispatch } from "@/src/store";
import LoadingWrapper from "@/src/common/LoadingWrapper";

const ProductPage = () => {
  const { productId } = useParams<{ productId: string }>();

  const dispatch = useAppDispatch();

  const [loading, setLoading] = React.useState<boolean>(true);
  const [product, setProduct] = React.useState<ProductItem>({});

  useEffect(() => {
    const fetchProductById = async () => {
      try {
        setLoading(true);
        const response = await dispatch(GetProductsById(productId)).unwrap();
        setProduct(response as ProductItem);
      } catch (error) {
        console.error("Failed to fetch product by ID:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductById();
  }, [productId, dispatch]);

  const updateFavourite = async (id?: string) => {
    if (!id) return;

    try {
      await dispatch(GetFavourite(id)).unwrap();

      setProduct((prev) => (prev ? { ...prev, is_fav: !prev.is_fav } : prev));
    } catch (error) {
      console.error("Failed to update favourite:", error);
    }
  };

  if (loading) {
    return <LoadingWrapper />;
  }

  return (
    <div className='mx-10 my-10 bg-white h-screen max-w-500px flex items-center justify-center'>
      <Card
        key={product?._id}
        className='w-full max-w-sm shadow-[0_-4px_10px_-2px_gray,0_4px_10px_-2px_orange]'
      >
        <CardHeader>
          <CardTitle>{product?.name}</CardTitle>
          <CardDescription>{product?.about_product}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex justify-between'>
            <div>
              <p className='mb-4 text-sm text-gray-600'>
                Price : ${product?.price}
              </p>
              <p className='text-sm text-gray-600'>In Stock: {product?.quan}</p>
            </div>
            <div>
              {product?.is_fav === false || !product?.is_fav ? (
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
          <Button type='submit' className='w-full'>
            Add to cart
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProductPage;
