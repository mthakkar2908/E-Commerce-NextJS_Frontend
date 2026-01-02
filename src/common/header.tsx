"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { Menu } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import DropdownHeader from "./DropdownHeader";
import {
  DropdownMenu,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const isMobileView = useMediaQuery("(max-width: 767px)");

  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);
  if (!user?.token) return null;

  return (
    <header className='sticky top-0 z-50 bg-white shadow-md'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
        <h1 className='text-xl font-bold text-indigo-600'>Next Js App</h1>

        {!isMobileView && (
          <nav className='hidden gap-6 md:flex'>
            <Link
              className='font-medium text-gray-600 hover:text-indigo-600'
              href='/'
            >
              Home
            </Link>
            <Link
              className='font-medium text-gray-600 hover:text-indigo-600'
              href='/posts'
            >
              Posts
            </Link>
            <Link
              className='font-medium text-gray-600 hover:text-indigo-600'
              href='/orders'
            >
              Orders
            </Link>
          </nav>
        )}

        <div className='flex justify-center items-center gap-2'>
          {isMobileView && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='flex h-9 w-9 items-center justify-center rounded-md'>
                  <Menu className='h-5 w-5 text-black dark:text-white' />
                </button>
              </DropdownMenuTrigger>

              <DropdownHeader />
            </DropdownMenu>
          )}
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-gray-700 bg-amber-500 px-1.5 py-1.5 rounded-xl'>
              {user?.name || "User"}
            </span>

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
