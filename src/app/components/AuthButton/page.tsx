'use client';
import { signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  return (
    <div className="bg-white text-black p-6 rounded-xl shadow-md flex flex-col gap-4">
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
      >
        Sign in with Google
      </button>
        {/* <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
            Sign Out
        </button> */}
    </div>
  );
}
