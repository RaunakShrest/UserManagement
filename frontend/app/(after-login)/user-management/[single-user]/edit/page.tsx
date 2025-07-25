import React from "react";
import EditSingleUserProvider from "@/contexts/edit-single-user-form-context";
import { EditUserFormTemplate } from "@/components/templates/edit-user-form-template";

interface SingleUserEditProps {
  params: Promise<{
    "single-user": string;
  }>;
}

const SingleUserEdit: React.FC<SingleUserEditProps> = async ({ params }) => {
  const resolvedParams = await params;

  const userId = resolvedParams?.["single-user"];

  if (!userId) {
    console.error(" No userId found in resolved params!");
    return <div className="space-y-6"></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Edit User</h2>
        <p className="text-sm text-gray-600 mt-1">User ID: {userId}</p>
      </div>

      <div>
        <EditSingleUserProvider>
          <EditUserFormTemplate userId={userId} />
        </EditSingleUserProvider>
      </div>
    </div>
  );
};

export default SingleUserEdit;
