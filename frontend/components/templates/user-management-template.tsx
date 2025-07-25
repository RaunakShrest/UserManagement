import React from "react";
import DataTable from "../data-tables/data-table-usermanagement";
import UserManagementProvider from "@/contexts/user-management-context";

export default function UserManagementTemplate() {
  const title = "User Management";

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black">{title}</h2>
      </div>

      <UserManagementProvider>
        <div className="flex items-center gap-2"></div>
        <div>
          <DataTable />
        </div>
      </UserManagementProvider>
    </div>
  );
}
