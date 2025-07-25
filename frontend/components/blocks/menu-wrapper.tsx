"use client";

import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-request";
import { reactQueryStaleTime } from "@/utils/staticUtils";
import { useQuery } from "@tanstack/react-query";
import React, { ReactNode, createContext, useContext, useState } from "react";

type MenuContextType = {
  isMenuExpanded: boolean;
  setIsMenuExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  currentUserRole: string | undefined;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const useMenuContext = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error(
      "useMenuContext must be used within the scope of MenuWrapper"
    );
  }
  return context;
};

type MenuWrapperProps = {
  children: ReactNode;
};

export default function MenuWrapper({ children }: MenuWrapperProps) {
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);

  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    staleTime: reactQueryStaleTime,
  });

  const currentUserRole = currentUser.data?.data?.userType as
    | string
    | undefined;

  return (
    <MenuContext.Provider
      value={{ isMenuExpanded, setIsMenuExpanded, currentUserRole }}
    >
      {children}
    </MenuContext.Provider>
  );
}
