"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import LoadingAnimation from "@/components/composites/loading-animation";

const LoginFormContextProvider = dynamic(
  () => import("@/contexts/login-form-context"),
  { ssr: false }
);

const LoginTemplate = dynamic(
  () => import("@/components/templates/login-template"),
  { ssr: false }
);

export default function Page(): React.ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  return isLoading ? (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingAnimation />
    </div>
  ) : (
    <LoginFormContextProvider>
      <LoginTemplate />
    </LoginFormContextProvider>
  );
}
