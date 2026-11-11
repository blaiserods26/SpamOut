"use client";
import React, { useEffect, useState } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase"; // Import the initialized Firebase app
import { Button, Card } from "flowbite-react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Lock, LogIn } from 'lucide-react';

const provider = new GoogleAuthProvider();

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userAuth, setUserAuth] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setUserAuth(user);
        router.push("/home"); // Redirect to /home if already logged in
      } else {
        setUserAuth(null);
      }
    });
    return () => {
      listen();
    };
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Handle successful login
      console.log(result.user);
      sessionStorage.setItem("token", "1");
      router.push("/home");
    } catch (error) {
      // Handle Errors here.
      console.error(error);
    }
  };

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Login attempted:', { selectedRole, email, password });
      router.push("/home");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-6xl flex bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Left Side - Hero Section */}
        <div className="hidden md:flex md:w-1/2 bg-[#0074c6] dark:bg-gray-700 p-12 flex-col justify-between relative">
          <div className="w-full">
            <h1 className="text-3xl font-bold text-white mb-2"></h1>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Knowledge<br />From Home
            </h2>
            <p className="text-blue-100 dark:text-gray-300">
              It is a long established fact that a reader,<br />
              will be distracted by the readable content<br />
              of a page when looking at its layout.
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/50 dark:from-gray-700/50 to-transparent pointer-events-none" />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          <div className="w-full max-w-md mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-8">Sign In</h3>

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please select your role</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('guest')}
                    className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${
                      selectedRole === 'guest'
                        ? 'border-[#0074c6] bg-blue-50 text-[#0074c6] dark:border-gray-500 dark:bg-gray-700 dark:text-gray-200'
                        : 'border-gray-200 hover:border-blue-200 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                  >
                    <UserIcon className="w-6 h-6 mb-2" />
                    <span>Guest</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all ${
                      selectedRole === 'admin'
                        ? 'border-[#0074c6] bg-blue-50 text-[#0074c6] dark:border-gray-500 dark:bg-gray-700 dark:text-gray-200'
                        : 'border-gray-200 hover:border-blue-200 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                  >
                    <Lock className="w-6 h-6 mb-2" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">EMAIL</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Type your Email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-[#0074c6] focus:ring-2 focus:ring-blue-200 dark:focus:ring-gray-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">PASSWORD</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Type your password"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-[#0074c6] focus:ring-2 focus:ring-blue-200 dark:focus:ring-gray-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0074c6] hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white py-4 rounded-lg 
                            font-semibold text-lg transition-all transform hover:scale-[1.02] 
                            active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed
                            shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Login</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            <Button
              className="w-full bg-[#003459] hover:bg-[#003459]/90 text-[#FFFFFF] dark:bg-[#ADEBFF] dark:hover:bg-[#ADEBFF]/90 dark:text-[#003459] px-8 py-4 text-lg mt-4"
              onClick={handleGoogleLogin}
            >
              Login with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
