"use client";

import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Footer = () => {
  const [valueEmail, setValueEmail] = useState("");
  const router = useRouter();

  return (
    <div className="bottom-0 z-50 bg-gray-300 shadow-md text-primary px-10 pt-10 pb-3">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h1 className="text-indigo-600 font-bold">Next js APP</h1>
          <p className="">
            Discover quality products with a smooth, reliable shopping <br />
            experience.
          </p>
          <div className="flex gap-5 mt-2">
            <a href="" className="w-4 h-4 ">
              <Instagram className="cursor-pointer hover:text-[#E1306C] transition-colors duration-200" />
            </a>
            <a href="" className="w-4 h-4 ">
              <Facebook className="cursor-pointer hover:text-[#1877F2]" />
            </a>
            <a href="" className="w-4 h-4 ">
              <Twitter className="cursor-pointer hover:text-[#1DA1F2]" />
            </a>
            <a href="" className="w-4 h-4 ">
              <Youtube className="cursor-pointer hover:text-[#FF0000]" />
            </a>
          </div>
          <div className="mt-10">
            <p>
              Copyright © 2026{" "}
              <span
                onClick={() => router.push("/privacy-policy")}
                className="font-bold cursor-pointer hover:text-red-600"
              >
                Privacy Policy
              </span>
            </p>
            <p>
              <span
                onClick={() => router.push("/terms-conditions")}
                className="font-bold cursor-pointer hover:text-red-600"
              >
                Terms & Conditions
              </span>
            </p>
          </div>
        </div>
        <div>
          <ul className="flex flex-col gap-3">
            <li className="hover:text-red-600 cursor-pointer">Blogs</li>
            <li
              onClick={() => router.push("/contact-us")}
              className="hover:text-red-600 cursor-pointer"
            >
              FAQ
            </li>
            <li
              onClick={() => router.push("/contact-us")}
              className="hover:text-red-600 cursor-pointer"
            >
              Contact
            </li>
          </ul>
        </div>
        <div>
          {" "}
          <ul className="flex flex-col gap-3">
            <li
              onClick={() => router.push("orders")}
              className="hover:text-red-600 cursor-pointer"
            >
              Order Status
            </li>
            <li className="hover:text-red-600 cursor-pointer">Wholesale</li>
            <li className="hover:text-red-600 cursor-pointer">Career</li>
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-indigo-600 font-bold">For More type your email</p>
          <p>
            Get first list on new arrivals & advance notice <br /> on
            everything.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={valueEmail}
              onChange={(e) => setValueEmail(e.target.value)}
              className="h-9 text-primary border border-indigo-600 rounded-3xl px-2 text-[16px]"
              placeholder="Enter your email here..."
            />
            <Button
              disabled={!valueEmail}
              className="h-9 cursor-pointer rounded-3xl text-[16px]"
            >
              Get Mail
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
