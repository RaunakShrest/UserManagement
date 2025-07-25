"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from "react";

import Table from "../elements/tables";
import Pagination from "../composites/pagination";
import Checkbox from "../composites/checkbox";
import { twMerge } from "tailwind-merge";
import { useDebounce } from "@/utils/debounce";
import { useUserManagement } from "@/contexts/user-management-context";
import { Edit, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
export default function DataTable() {
  const tableRef = useRef<HTMLTableElement>(null);
  const router = useRouter();

  const {
    data,
    sortData,
    selectedData,
    setSelectedData,
    filters,
    setFilters,
    loading,
    currentUser,
    isCurrentUserLoading,
    fetchUsers,
  } = useUserManagement();

  const isSuperAdmin =
    currentUser?.userType === process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN;

  const [searchUserName, setSearchUserName] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  type User = {
    _id: string;
    userName: string;
    email: string;
    phoneNumber: string;
    status: string;
    userType: string;
    createdAt: string;
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  const filteredData = data?.data || [];

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: currentPage }));
  }, [currentPage, setFilters]);

  const debouncedSearchUserName = useDebounce({
    searchValue: searchUserName,
  });

  const debouncedUserTypeFilter = useDebounce({
    searchValue: userTypeFilter,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      userNameSearch: debouncedSearchUserName.trim(),
    }));
  }, [debouncedSearchUserName, setFilters]);

  useEffect(() => {
    setFilters((prev) => {
      const newFilters = { ...prev, page: 1 };

      if (debouncedSearchUserName.trim()) {
        newFilters.userName = debouncedSearchUserName.trim();
      } else {
        delete newFilters.userName;
      }

      if (debouncedUserTypeFilter.trim()) {
        newFilters.userType = debouncedUserTypeFilter.trim();
      } else {
        delete newFilters.userType;
      }

      return newFilters;
    });
    setCurrentPage(1);
  }, [debouncedSearchUserName, debouncedUserTypeFilter, setFilters]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleColor = (userType: string) => {
    const roleLower = userType?.toLowerCase();
    switch (roleLower) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "user":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "superadmin":
      case "super_admin":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "moderator":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleTableHeadingCheckboxChange = () => {
    setSelectedData((prev: any[]) =>
      prev.length > 0
        ? prev.length < (data?.data.length ?? 0)
          ? [...(data?.data ?? [])]
          : []
        : [...(data?.data ?? [])]
    );
  };

  const handleTableDataCheckboxChange = (
    clickedData: (typeof filteredData)[number]
  ) => {
    setSelectedData((prev: any[]) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev: any) => eachPrev.name !== clickedData.name)
        : [...prev, clickedData]
    );
  };

  const isTableHeadingSelected = (): boolean => {
    return selectedData.length === (data?.data?.length ?? 0);
  };

  const isTableDataSelected = (
    datum: (typeof filteredData)[number]
  ): boolean => {
    return selectedData.some((selected: any) => selected.name === datum.name);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const userId = userToDelete._id;

      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/user/deleteUser/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const result = response.data;

      showToast(
        `User "${userToDelete.userName}" has been deleted successfully!`,
        "success"
      );

      if (fetchUsers) {
        await fetchUsers();
      }

      setSelectedData((prev: any[]) =>
        prev.filter((selected: any) => selected._id !== userToDelete._id)
      );
    } catch (error: any) {
      console.error("Error deleting user:", error);

      const message =
        error?.response?.data?.message ||
        "Network error occurred while deleting user. Please try again.";

      showToast(`Failed to delete user: ${message}`, "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleClearFilters = () => {
    setSearchUserName("");
    setUserTypeFilter("");
    setCurrentPage(1);
  };

  if (isCurrentUserLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="inline-block size-8 animate-spin border-4 border-black" />
        <span className="ml-2">Loading user permissions...</span>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex w-full flex-wrap items-end justify-between">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by user name..."
                value={searchUserName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchUserName(e.target.value)
                }
                className="w-64 pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 placeholder-gray-400 bg-white shadow-sm"
              />
              {searchUserName && (
                <button
                  onClick={() => setSearchUserName("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    className="h-4 w-4 text-gray-400 hover:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {isSuperAdmin && (
              <div className="relative">
                <select
                  value={userTypeFilter}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    setUserTypeFilter(e.target.value)
                  }
                  className="w-44 pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none cursor-pointer transition-colors duration-200"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {(searchUserName || userTypeFilter) && (
              <div>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => router.push("/user-management/add-users")}
              className="inline-flex items-center gap-2 rounded-lg bg-[#02235E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#394964] transition-colors duration-200 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg">
          <Table
            className="w-full table-fixed border-collapse rounded-lg border"
            tableRef={tableRef}
          >
            <Table.Head className="bg-[#02235E] text-left text-white">
              <Table.Row className="h-[48px]">
                <Table.Heading className="pl-4" style={{ width: "50px" }}>
                  <Checkbox
                    onChange={handleTableHeadingCheckboxChange}
                    checked={isTableHeadingSelected()}
                  />
                </Table.Heading>

                {data?.columns?.map((column: any) => (
                  <Table.Heading
                    className={twMerge("px-2")}
                    key={column.id}
                    dataKey={column.dataKey}
                    isSortable={column.isSortable}
                    sortData={sortData}
                    style={{ width: column.width ?? "" }}
                  >
                    {column.text}
                  </Table.Heading>
                ))}

                {isSuperAdmin && (
                  <Table.Heading className="px-2" style={{ width: "100px" }}>
                    ACTIONS
                  </Table.Heading>
                )}
              </Table.Row>
            </Table.Head>

            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Column
                    colSpan={
                      (data?.columns?.length ?? 0) + (isSuperAdmin ? 2 : 1)
                    }
                    className="py-8 text-center"
                  >
                    <div className="inline-block size-8 animate-spin border-4 border-black" />
                  </Table.Column>
                </Table.Row>
              ) : filteredData.length === 0 ? (
                <Table.Row>
                  <Table.Column
                    colSpan={
                      (data?.columns?.length ?? 0) + (isSuperAdmin ? 2 : 1)
                    }
                    className="py-8 text-center"
                  >
                    No users available
                  </Table.Column>
                </Table.Row>
              ) : (
                filteredData.map((datum: any, idx: number) => (
                  <Table.Row key={idx} className="bg-white">
                    <Table.Column className="px-4 py-2">
                      <Checkbox
                        onChange={() => handleTableDataCheckboxChange(datum)}
                        checked={isTableDataSelected(datum)}
                      />
                    </Table.Column>

                    <Table.Column className="px-2 ">
                      <div className="inline-block align-top">
                        {datum.userName}
                      </div>
                    </Table.Column>
                    <Table.Column className="overflow-hidden p-2">
                      <span className="line-clamp-1">{datum.phoneNumber}</span>
                    </Table.Column>
                    <Table.Column className="px-2">{datum.email}</Table.Column>

                    <Table.Column className="overflow-hidden p-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          datum.status
                        )}`}
                      >
                        {datum.status}
                      </span>
                    </Table.Column>

                    <Table.Column className="overflow-hidden p-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                          datum.userType
                        )}`}
                      >
                        {datum.userType}
                      </span>
                    </Table.Column>

                    <Table.Column className="p-2">
                      {new Date(datum?.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                        hour12: false,
                      })}
                    </Table.Column>

                    {isSuperAdmin && (
                      <Table.Column className="p-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              router.push(`/user-management/${datum._id}/edit`)
                            }
                            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit user"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(datum)}
                            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete user"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </Table.Column>
                    )}
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </div>

        <div className="text-right">
          <Pagination
            totalNumberOfData={data?.pagination?.totalItems || 0}
            numberOfDataPerPage={filters.limit}
            currentPage={currentPage}
            onPageChange={(newPage) => setCurrentPage(newPage)}
          />
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200 pointer-events-auto">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>

            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Delete User
            </h3>

            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete{" "}
              <strong>"{userToDelete?.userName}"</strong>? This action cannot be
              undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="inline-block w-4 h-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    Deleting...
                  </>
                ) : (
                  "Delete User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <div
            className={`
            ${
              toast.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            } 
            border rounded-lg p-4 shadow-lg transition-all duration-300 transform
          `}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === "success" ? (
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                  className={`
                    inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      toast.type === "success"
                        ? "text-green-500 hover:bg-green-100 focus:ring-green-600"
                        : "text-red-500 hover:bg-red-100 focus:ring-red-600"
                    }
                  `}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
