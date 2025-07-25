"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../query-provider/api-request-functions/api-request";
import { reactQueryStaleTime } from "@/utils/staticUtils";
import { redirect } from "next/navigation";
import LoadingAnimation from "@/components/composites/loading-animation";
import { ReactNode } from "react";

interface NoAuthProps {
  children: ReactNode;
}

export default function NoAuth({ children }: NoAuthProps) {
  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: getCurrentUser,
    staleTime: reactQueryStaleTime,
  });

  if (currentUser.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!currentUser.isPending && currentUser.data?.success) {
    redirect("/login");
  }

  return <>{children}</>;
}
