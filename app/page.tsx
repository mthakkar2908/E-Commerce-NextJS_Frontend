"use client";

import MainDashboard from "@/src/modules/Dashboard/MainDashboard";
import { useEffect } from "react";
import { getSession } from "@/src/utils/session";
import { setSessionFromStorage } from "@/src/store/authSlice";
import { useAppDispatch } from "@/src/store";

export default function Home() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const session = getSession();
    if (session) {
      dispatch(setSessionFromStorage(session));
    }
  }, [dispatch]);
  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <MainDashboard />
    </div>
  );
}
