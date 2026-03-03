/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { Menu, Moon, ShoppingCart, Sun } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import DropdownHeader from "./DropdownHeader";
import {
  DropdownMenu,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useTheme } from "@/src/providers/ThemeProvider";

const Header = () => {
  const isMobileView = useMediaQuery("(max-width: 767px)");
  const router = useRouter();

  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state: any) => state.auth);
  if (!user?.token) return null;
  const image = `${process.env.NEXT_PUBLIC_FRONTEND_URL}${user?.image}`;

  return (
    <header className='sticky top-0 z-50 bg-white dark:bg-slate-900 shadow-md'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
        <h1
          className='text-xl font-bold text-indigo-600 cursor-pointer dark:text-white'
          onClick={() => router.push("/")}
        >
          Next Js App
        </h1>

        {!isMobileView && (
          <nav className='hidden gap-6 md:flex'>
            <Link
              className='font-medium text-gray-600 dark:text-gray-200 hover:text-indigo-600'
              href='/'
            >
              Home
            </Link>
            <Link
              className='font-medium text-gray-600 dark:text-gray-200 hover:text-indigo-600'
              href='/posts'
            >
              Posts
            </Link>
            <Link
              className='font-medium text-gray-600 dark:text-gray-200 hover:text-indigo-600'
              href='/orders'
            >
              Orders
            </Link>
            <Link
              className='font-medium text-gray-600 dark:text-gray-200 hover:text-indigo-600'
              href='/chat'
            >
              Chats
            </Link>
          </nav>
        )}

        <div className='flex justify-center items-center gap-2'>
          {isMobileView && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='cursor-pointer flex h-9 w-9 items-center justify-center rounded-md'>
                  <Menu className='h-5 w-5 text-black dark:text-white' />
                </button>
              </DropdownMenuTrigger>

              <DropdownHeader />
            </DropdownMenu>
          )}
          <div className='flex items-center gap-2'>
            <button
              onClick={toggleTheme}
              className='flex h-9 w-9 items-center justify-center rounded-md cursor-pointer'
              aria-label='Toggle theme'
            >
              {theme === "dark" ? (
                <Sun className='h-5 w-5 text-black dark:text-white' />
              ) : (
                <Moon className='h-5 w-5 text-black dark:text-white' />
              )}
            </button>
            {!isMobileView && (
              <div
                onClick={() => router.push("/myAccount")}
                className='cursor-pointer inline-flex items-center gap-2 bg-amber-500 px-3 py-1.5 rounded-full shadow-sm'
              >
                {/* User Name */}
                <span className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {user?.name || "User"}
                </span>

                <span className='h-5 w-px bg-gray-900/30'></span>

                <img
                  src={image || "/images/default_avtar.jpeg"}
                  alt='user'
                  className='w-7 h-7 rounded-full object-cover border border-gray-900/20'
                />
              </div>
            )}

            <button
              onClick={() => router.push("/cart")}
              className='flex h-9 w-9 items-center justify-center rounded-md cursor-pointer'
            >
              <ShoppingCart className='h-5 w-5 text-black dark:text-white' />
            </button>
            <button
              onClick={() => dispatch(logout())}
              className='rounded-lg cursor-pointer bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600'
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
