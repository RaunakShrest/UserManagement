"use client";

import React, { ReactNode, useEffect } from "react";
import Header from "@/components/blocks/header";
import SideMenu from "@/components/blocks/sidemenu";
import RequireAuth from "@/contexts/require-auth/require-auth";
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-request";
import { useQuery } from "@tanstack/react-query";
import { reactQueryStaleTime } from "@/utils/staticUtils";
import MenuWrapper from "@/components/blocks/menu-wrapper";
import Footer from "@/components/blocks/footer";

interface AfterLoginLayoutProps {
  children: ReactNode;
}

export default function AfterLoginLayout({ children }: AfterLoginLayoutProps) {
  const { data: currentUser } = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    staleTime: reactQueryStaleTime,
  });

  return (
    <RequireAuth>
      <div className="z-50 flex h-screen min-h-screen">
        <div className="border-l-1 h-[125%] border bg-white py-2">
          <MenuWrapper>
            <div className="sticky top-0 rounded-md bg-white px-2 text-white">
              <SideMenu userData={currentUser?.data} />
            </div>
          </MenuWrapper>
        </div>
        <div className="relative h-full w-full px-2 sm:px-1">
          <div className="mb-5">
            <Header userData={currentUser?.data} />
          </div>
          <div className="p-4">{children}</div>
          <div className="bottom-0 mt-2 flex w-full justify-center p-2">
            <Footer />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
