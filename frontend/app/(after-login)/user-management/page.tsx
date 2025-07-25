import React from "react";
import RequireRole from "@/contexts/require-auth/require-role";
import UserManagementTemplate from "@/components/templates/user-management-template";

const UserManagementPage: React.FC = () => {
  return (
    <RequireRole
      roles={[
        process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN as string,
        process.env.NEXT_PUBLIC_USER_TYPE_ADMIN as string,
      ]}
    >
      <UserManagementTemplate />
    </RequireRole>
  );
};

export default UserManagementPage;
