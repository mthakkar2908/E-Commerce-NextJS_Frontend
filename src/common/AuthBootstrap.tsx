"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSession } from "../utils/session";
import { setSessionFromStorage } from "../store/authSlice";

export default function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    const session = getSession();
    if (session) {
      dispatch(setSessionFromStorage(session));
    }
  }, [dispatch]);

  return null;
}
