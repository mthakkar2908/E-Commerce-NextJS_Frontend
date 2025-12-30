"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const Header = () => {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user } = useSelector((state: any) => state.auth);
  if (!user?.token) return null;

  return (
    <header className='sticky top-0 z-50 bg-white shadow-md'>
      <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
        {/* Logo */}
        <h1 className='text-xl font-bold text-indigo-600'>Next Js App</h1>

        {/* Navigation */}
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

        {/* User Section */}
        <div className='flex items-center gap-4'>
          <span className='hidden text-sm font-medium text-gray-700 sm:block'>
            {user?.name || "User"}
          </span>

          <button
            onClick={() => dispatch(logout())}
            className='rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600'
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
