"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";

import { useQuery } from "@tanstack/react-query";
import { reactQueryStaleTime } from "@/utils/staticUtils";
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-request";

interface Column {
  id: string;
  text: string;
  dataKey: string;
  width: string;
  isSortable?: boolean;
}

interface User {
  userName: string;
  phone: string;
  email: string;
  status: string;
  userType: string;
  createdAt: string;
  [key: string]: any;
}

interface CurrentUser {
  userType: string;
  [key: string]: any;
}

interface Pagination {
  page?: number;
  limit?: number;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}

interface Data {
  data: User[];
  columns: Column[];
  pagination?: Pagination;
}

interface Filters {
  page: number;
  limit: number;
  userName?: string;
  userType?: string;
  [key: string]: any;
}

interface UserManagementContextType {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  sortData: (basis: string) => void;
  selectedData: User[];
  setSelectedData: React.Dispatch<React.SetStateAction<User[]>>;
  fetchUsers: () => Promise<void>;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: CurrentUser | null;
  isCurrentUserLoading: boolean;
}

interface UserManagementProviderProps {
  children: ReactNode;
}

const UserManagementContext = createContext<
  UserManagementContextType | undefined
>(undefined);

export const useUserManagement = (): UserManagementContextType => {
  const context = useContext(UserManagementContext);

  if (!context) {
    throw new Error(
      "use useUserManagement within the context of UserManagementProvider"
    );
  }

  return context;
};

export default function UserManagementProvider({
  children,
}: UserManagementProviderProps) {
  const [isAsc, setIsAsc] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 5,
  });

  const { data: currentUserResponse, isLoading: isCurrentUserLoading } =
    useQuery({
      queryKey: ["signedInUser"],
      queryFn: () => getCurrentUser(),
      staleTime: reactQueryStaleTime,
    });

  const currentUser = currentUserResponse?.data || null;

  const [data, setData] = useState<Data>({
    data: [],
    columns: [
      {
        id: "userName",
        text: "Username",
        dataKey: "userName",
        width: "150px",
      },
      {
        id: "phone",
        text: "Phone",
        dataKey: "phoneNumber",
        isSortable: false,
        width: "150px",
      },
      {
        id: "email",
        text: "Email",
        dataKey: "email",
        width: "300px",
      },
      {
        id: "userStatus",
        text: "Status",
        dataKey: "status",
        isSortable: true,
        width: "100px",
      },
      {
        id: "userType",
        text: "Role",
        dataKey: "userType",
        isSortable: true,
        width: "100px",
      },
      {
        id: "createdAt",
        text: "Created Date",
        dataKey: "createdAt",
        isSortable: true,
        width: "190px",
      },
    ],
  });
  const [selectedData, setSelectedData] = useState<User[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const sortData = (basis: string): void => {
    setIsAsc((prev) => !prev);
    const dataCopy = [...data.data];
    const sortedData = dataCopy?.sort((a, b) =>
      isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1
    );

    setData((prev) => ({ ...prev, data: sortedData }));
  };

  const fetchUsers = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("Access token not found in localStorage");
        return;
      }

      const query = new URLSearchParams(
        filters as Record<string, string>
      ).toString();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/user/getUsers?${query}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setData((prev) => ({
        ...prev,
        data: response.data?.message?.users || [],
        pagination: response.data?.message?.pagination || {},
      }));
    } catch (error) {
      console.error("Error fetching users data:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounceFetch = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceFetch);
  }, [filters]);

  return (
    <UserManagementContext.Provider
      value={{
        data,
        setData,
        sortData,
        selectedData,
        setSelectedData,
        fetchUsers,
        filters,
        setFilters,
        loading,
        setLoading,
        currentUser,
        isCurrentUserLoading,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  );
}
