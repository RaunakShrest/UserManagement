import React from "react";

import { AddUserFormTemplate } from "@/components/templates/add-user-form-template";
import AddUserFormProvider from "@/contexts/add-user-form-context";
import RequireRole from "@/contexts/require-auth/require-role";

const AddUsersPage: React.FC = () => {
  return (
    <div>
      <RequireRole
        roles={[process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN as string]}
      >
        <AddUserFormProvider>
          <div>
            <AddUserFormTemplate />
          </div>
        </AddUserFormProvider>
      </RequireRole>
    </div>
  );
};

export default AddUsersPage;
