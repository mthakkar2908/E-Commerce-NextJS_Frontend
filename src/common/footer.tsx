"use client";

import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch } from "../store";
import { CreateEmailSubScription } from "../store/commonSlice";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const Footer = () => {
  const [valueEmail, setValueEmail] = useState("");
  const router = useRouter();
  const [sendEmailLoading, setSendEmailLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);

  const dispatch = useAppDispatch();

  if (!user?.token) return null;

  const handleEmailSignup = async () => {
    setSendEmailLoading(true);
    try {
      const response = await dispatch(
        CreateEmailSubScription({ email: valueEmail }),
      ).unwrap();

      toast.success(response?.message ?? "Mail Sent to your mail id", {
        position: "top-center",
        duration: 2000,
        style: {
          borderRadius: "8px",
          background: "#333",
          color: "#fff",
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (emailError: any) {
      toast.error(emailError ?? "Failed to send the mail", {
        position: "top-center",
        duration: 2000,
        style: {
          borderRadius: "8px",
          background: "#333",
          color: "#fff",
        },
      });
    } finally {
      setSendEmailLoading(false);
    }
  };

  return (
    <div className="bottom-0 z-50 bg-gray-300 shadow-md text-primary px-10 pt-10 pb-3">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 max-w-7xl mx-auto">
        <div className="flex flex-col gap-3">
          <h1 className="text-indigo-600 font-bold text-lg">Next js APP</h1>
          <p className="text-sm leading-relaxed">
            Discover quality products with a smooth, reliable shopping
            experience.
          </p>

          <div className="flex gap-4 mt-2">
            <Instagram className="cursor-pointer hover:text-[#E1306C]" />
            <Facebook className="cursor-pointer hover:text-[#1877F2]" />
            <Twitter className="cursor-pointer hover:text-[#1DA1F2]" />
            <Youtube className="cursor-pointer hover:text-[#FF0000]" />
          </div>

          <div className="text-sm mt-6 space-y-1">
            <p>
              © 2026{" "}
              <span
                onClick={() => router.push("/privacy-policy")}
                className="font-semibold cursor-pointer hover:text-red-600"
              >
                Privacy Policy
              </span>
            </p>
            <p
              onClick={() => router.push("/terms-conditions")}
              className="font-semibold cursor-pointer hover:text-red-600"
            >
              Terms & Conditions
            </p>
          </div>
        </div>

        <div>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="font-semibold">Company</li>
            <li className="hover:text-red-600 cursor-pointer">Blogs</li>
            <li
              onClick={() => router.push("/contact-us?section=faq")}
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
          <ul className="flex flex-col gap-3 text-sm">
            <li className="font-semibold">Support</li>
            <li
              onClick={() => router.push("/orders")}
              className="hover:text-red-600 cursor-pointer"
            >
              Order Status
            </li>
            <li className="hover:text-red-600 cursor-pointer">Wholesale</li>
            <li className="hover:text-red-600 cursor-pointer">Career</li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-indigo-600 font-bold">For more, type your email</p>
          <p className="text-sm leading-relaxed">
            Get first list on new arrivals & advance notice on everything.
          </p>

          <div className="flex flex-col gap-2">
            <input
              type="email"
              value={valueEmail}
              onChange={(e) => setValueEmail(e.target.value)}
              className="py-2 w-full sm:w-auto flex-1 border border-indigo-600 rounded-3xl px-4 text-sm"
              placeholder="Enter your email here..."
            />
            <Button
              onClick={handleEmailSignup}
              disabled={!valueEmail || sendEmailLoading}
              className="h-9 rounded-3xl px-5 text-sm"
            >
              {sendEmailLoading ? "Sending..." : "Get Mail"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
