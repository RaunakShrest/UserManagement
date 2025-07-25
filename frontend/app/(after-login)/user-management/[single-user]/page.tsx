import React from "react";
interface Params {
  userId: string;
}

interface EditUserManagementProps {
  params: Params;
}

const EditUserManagement: React.FC<EditUserManagementProps> = ({ params }) => {
  return <div>Edit User Management Page</div>;
};

export default EditUserManagement;
