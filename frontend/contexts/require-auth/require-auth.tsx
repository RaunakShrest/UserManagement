"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../query-provider/api-request-functions/api-request";
import { reactQueryStaleTime } from "@/utils/staticUtils";
import { redirect } from "next/navigation";
import LoadingAnimation from "@/components/composites/loading-animation";
import { ReactNode } from "react";

interface RequireAuthProps {
  roles?: string[];
  children: ReactNode;
}

export default function RequireAuth({
  roles = [],
  children,
}: RequireAuthProps) {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["signedInUser"],
    queryFn: getCurrentUser,
    staleTime: reactQueryStaleTime,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!data || !data.success) {
    redirect("/login");
  }

  if (roles.length > 0 && data.data) {
    const user = data.data; // data.data contains the CurrentUser object
    const hasRequiredRole = roles.includes(user.userType);

    if (!hasRequiredRole) {
      redirect("/unauthorized");
    }
  }

  return <>{children}</>;
}
