import React, { useRef, useEffect, useState } from "react";
import { CurrentUser } from "@/contexts/query-provider/api-request-functions/api-request";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { signOutUser } from "@/contexts/query-provider/api-request-functions/api-request";
import { toast } from "react-hot-toast";
interface HeaderProps {
  userData?: CurrentUser;
}

export default function Header({ userData }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const getInitial = () => {
    if (userData?.email) return userData.email.charAt(0).toUpperCase();
    return "U";
  };

  const getDisplayName = () => {
    if (userData?.email) return userData.email;
    return "User";
  };

  const logoutMutation = useMutation({
    mutationFn: () => signOutUser(),
    onSuccess: (response) => {
      toast.success(response.message || "Logged out successfully");
      queryClient.clear();
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error.data?.message || "Logout failed");
      queryClient.clear();
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutMutation.mutate();
  };

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-900">Shrig Solutions</h1>
      </div>

      <div className="flex items-center gap-4">
        {userData && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {getDisplayName()}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userData.userType}
              </p>
            </div>
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="w-8 h-8 bg-[#02235E] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getInitial()}
              </span>
            </div>
            <FontAwesomeIcon
              icon={faCaretDown}
              className={`text-gray-600 text-sm transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-white shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <FontAwesomeIcon
                    icon={faSignOutAlt}
                    className="text-gray-500"
                  />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
