import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "../icons/icons";
import { signInUser } from "@/contexts/query-provider/api-request-functions/api-request";
import ImgWithWrapper from "../elements/image-with-wrapper";

interface LoginFormData {
  email: string;
  password: string;
}

interface SignInResponse {
  statusCode: number;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
  success: boolean;
}

interface LoginError {
  data: {
    message: string;
    statusCode?: number;
  };
}

const emailRule = {
  required: "Email is required",
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "Invalid email address",
  },
};

const passwordRule = {
  required: "Password is required",
  minLength: {
    value: 6,
    message: "Password must be at least 6 characters",
  },
};

interface ButtonProps {
  type?: "button" | "submit";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  className,
  onClick,
  disabled,
  children,
}) => (
  <button
    type={type}
    className={className}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export default function LoginTemplate() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => signInUser(data),
    onSuccess: (data: SignInResponse) => {
      toast.success(data.message || "Login successful!");
      router.push("/user-management");
      return;
    },
    onError: (error: LoginError) => {
      toast.error(error.data?.message || "Login failed. Please try again.");
    },
  });

  const submitFn = (formData: LoginFormData) => {
    loginMutation.mutate({
      email: formData.email,
      password: formData.password,
    });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Form Section */}
      <div className="flex min-h-screen w-full items-center justify-center p-4">
        <div className="flex w-[min(480px,90%)] rounded-2xl bg-white shadow-2xl border border-gray-100 backdrop-blur-sm">
          <div className="w-full space-y-8 p-12">
            <div className="text-center space-y-2">
              <ImgWithWrapper
                wrapperClassName="mx-auto w-[120px] h-[40px] mb-4"
                imageAttributes={{
                  src: "/assets/shrig.jpg",
                  alt: "logo",
                  className:
                    "w-full h-full object-contain filter brightness-110 contrast-110",
                }}
              />
              <h1 className="text-3xl font-bold text-[#02235E] tracking-tight">
                Welcome
              </h1>
              <p className="text-gray-600 text-sm">
                Sign in to continue to your account
              </p>
            </div>

            <form onSubmit={handleSubmit(submitFn)} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl hover:border-[#02235E] focus-within:border-[#02235E] focus-within:ring-2 focus-within:ring-[#02235E]/10 transition-all duration-200">
                    <div className="pl-4 text-gray-400">
                      <UserIcon />
                    </div>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      {...register("email", emailRule)}
                      className="flex-1 px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400 bg-transparent rounded-xl"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  Password
                </label>
                <div className="relative">
                  <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl hover:border-[#02235E] focus-within:border-[#02235E] focus-within:ring-2 focus-within:ring-[#02235E]/10 transition-all duration-200">
                    <div className="pl-4 text-gray-400">
                      <LockIcon />
                    </div>
                    <input
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password", passwordRule)}
                      className="flex-1 px-4 py-3 pr-12 outline-none text-gray-900 placeholder:text-gray-400 bg-transparent rounded-xl"
                    />
                    <Button
                      type="button"
                      className="absolute right-4 text-gray-400 hover:text-[#02235E] transition-colors"
                      onClick={togglePasswordVisibility}
                    >
                      {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                      <span className="w-4 h-4 text-red-500">⚠</span>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Forgot Password link */}
                <div className="text-right mt-3">
                  <Button
                    type="button"
                    className="text-sm text-[#02235E] hover:text-[#012D61] hover:underline font-medium transition-colors"
                    onClick={() => router.push("/forgetPassword")}
                  >
                    Forgot Password?
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className={`w-full rounded-xl bg-gradient-to-r from-[#02235E] to-[#1e40af] px-8 py-4 text-white font-semibold text-base transition-all duration-200 transform ${
                    loginMutation.isPending
                      ? "cursor-not-allowed opacity-70 scale-95"
                      : "opacity-100 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  }`}
                  disabled={loginMutation.isPending}
                >
                  <span className="flex items-center justify-center">
                    {loginMutation.isPending ? (
                      <>
                        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-3" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </span>
                </Button>
              </div>
            </form>

            <div className="text-center pt-4 border-t border-gray-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
