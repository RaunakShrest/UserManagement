"use client";

import { useQuery } from "@tanstack/react-query";
import React, { ReactNode, useEffect } from "react";
import { getCurrentUser } from "../query-provider/api-request-functions/api-request";
import { reactQueryStaleTime } from "@/utils/staticUtils";
import LoadingAnimation from "@/components/composites/loading-animation";
import { redirect } from "next/navigation";

interface RequireRoleProps {
  roles?: string[];
  children: ReactNode;
}

export default function RequireRole({
  roles = [],
  children,
}: RequireRoleProps) {
  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: getCurrentUser,
    staleTime: reactQueryStaleTime,
    retry: false,
    gcTime: 1000 * 60 * 10,
  });

  if (currentUser.isPending) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    );
  }

  if (!currentUser.isPending && !currentUser.data?.success) {
    redirect("/login");
  }

  const userType = currentUser.data?.data.userType;

  if (roles.length > 0 && !roles.includes(userType)) {
    redirect("/no-permission");
  }

  return <>{children}</>;
}
