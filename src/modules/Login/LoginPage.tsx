"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../store";
import { login } from "../../store/authSlice";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (auth?.user) {
      router.push("/");
      return;
    }
  }, [auth?.user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (err) {
      console.error("Login error", err);
    }
  };

  return (
    <div className='mx-auto my-auto grid grid-cols-1 items-center justify-center gap-4  p-20 !dark:bg-zinc-800 max-w-200px w-full'>
      <form onSubmit={handleSubmit} className='grid gap-4 w-full max-w-sm'>
        <label className='text-2xl' htmlFor='email'>
          Email
        </label>
        <input
          id='email'
          type='text'
          placeholder='Enter your Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='p-2 rounded'
        />
        <label className='text-2xl' htmlFor='password'>
          Password
        </label>
        <div className='relative'>
          <input
            id='password'
            type={showPassword ? "text" : "password"}
            placeholder='Enter your Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='p-2 rounded'
          />
          <button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button type='submit' className='bg-blue-600 text-white p-2 rounded'>
          <span className='text-lg cursor-pointer'>
            {auth.status === "loading" ? "Logging in..." : "Login"}
          </span>
        </button>

        {auth.error && <div className='text-red-600'>{auth.error}</div>}
      </form>
    </div>
  );
};

export default LoginPage;
