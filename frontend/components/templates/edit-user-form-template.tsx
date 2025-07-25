"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Address {
  zip: string;
  city: string;
  country: string;
  addressLine: string;
}

interface UserData {
  userName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  status: string;
  address: Address;
}

interface FormData {
  userName: string;
  email: string;
  phoneNumber: string;
  userType: string;
  status: string;
  zip: string;
  city: string;
  country: string;
  addressLine: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

interface EditUserFormTemplateProps {
  userId: string;
}

export const EditUserFormTemplate: React.FC<EditUserFormTemplateProps> = ({
  userId,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    userName: "",
    email: "",
    phoneNumber: "",
    userType: "admin",
    status: "enabled",
    zip: "",
    city: "",
    country: "",
    addressLine: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    async function fetchUserDetails() {
      if (!userId) {
        setLoading(false);
        return;
      }

      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        toast.error("Unauthorized: Access token missing");
        setLoading(false);
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/user/getUserById/${userId}`;

      try {
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const userData = response.data.data;
        setUser(userData);

        const newFormData = {
          userName: userData.userName || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          userType: userData.userType || "admin",
          status: userData.status || "enabled",
          zip: userData.address?.zip || "",
          city: userData.address?.city || "",
          country: userData.address?.country || "",
          addressLine: userData.address?.addressLine || "",
        };

        setFormData(newFormData);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            toast.error("Unauthorized: Please login again");
            router.push("/login");
            return;
          } else if (err.response?.status === 404) {
            toast.error("User not found");
          } else {
            toast.error(
              `Failed to fetch user details: ${
                err.response?.data?.message || err.message
              }`
            );
          }
        } else {
          toast.error("Failed to fetch user details");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUserDetails();
  }, [userId, router]);

  const updateUser = async (userData: Partial<UserData>): Promise<any> => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("Access token not found. Please login again.");
    }

    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/user/editUser/${userId}`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  };

  const updateUserMutation = useMutation({
    mutationFn: (userData: Partial<UserData>) => updateUser(userData),
    onSuccess: (response) => {
      const successMessage = "User updated successfully!";
      toast.success(successMessage);
      queryClient.invalidateQueries({ queryKey: ["fetchUsers"] });
      router.push("/user-management");
    },
    onError: (error: any) => {
      let errorMessage = "An error occurred while updating the user.";

      if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.response?.data?.message) {
        errorMessage = String(error.response.data.message);
      } else if (error?.message) {
        errorMessage = String(error.message);
      }

      toast.error(errorMessage);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.userName.trim()) newErrors.userName = "Username is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.country.trim()) newErrors.country = "Country is required";
    if (!formData.zip.trim()) newErrors.zip = "ZIP code is required";
    if (!formData.addressLine.trim())
      newErrors.addressLine = "Address line is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getChangedFields = (): Partial<UserData> => {
    const updatedFields: any = {};

    if (formData.userName !== user?.userName && formData.userName.trim()) {
      updatedFields.userName = formData.userName;
    }
    if (formData.email !== user?.email && formData.email.trim()) {
      updatedFields.email = formData.email;
    }
    if (
      formData.phoneNumber !== user?.phoneNumber &&
      formData.phoneNumber.trim()
    ) {
      updatedFields.phoneNumber = formData.phoneNumber;
    }
    if (formData.userType !== user?.userType) {
      updatedFields.userType = formData.userType;
    }
    if (formData.status !== user?.status) {
      updatedFields.status = formData.status;
    }

    const addressChanged =
      formData.zip !== user?.address?.zip ||
      formData.city !== user?.address?.city ||
      formData.country !== user?.address?.country ||
      formData.addressLine !== user?.address?.addressLine;

    if (addressChanged) {
      updatedFields.address = {
        zip: formData.zip,
        city: formData.city,
        country: formData.country,
        addressLine: formData.addressLine,
      };
    }

    return updatedFields;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateForm()) {
        toast.error("Please fix the form errors before submitting.");
        return;
      }

      const updatedData = getChangedFields();

      if (Object.keys(updatedData).length === 0) {
        return;
      }

      updateUserMutation.mutate(updatedData);
    } catch (error) {
      toast.error("An error occurred during submission.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-3">
          <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-base font-medium text-gray-700">
            Loading user details...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-3">
            The user with ID "{userId}" could not be found.
          </p>
          <button
            onClick={() => router.push("/user-management")}
            className="px-4 py-2 bg-gradient-to-r from-[#02235E] to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            Back to User Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#02235E] to-indigo-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center">
              Edit User
            </h1>
            <p className="text-blue-100 mt-1 text-center text-sm">
              Update user account information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-blue-600 font-bold text-xs">1</span>
                  </div>
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                    />
                    {errors.userName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.userName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Type *
                    </label>
                    <select
                      name="userType"
                      value={formData.userType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                    >
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-indigo-600 font-bold text-xs">2</span>
                  </div>
                  Address Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      placeholder="Enter ZIP code"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                    />
                    {errors.zip && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.zip}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="Enter country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <span className="mr-1">⚠</span>
                        {errors.country}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line *
                  </label>
                  <input
                    type="text"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleInputChange}
                    placeholder="Enter complete address (Street, Building, etc.)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
                  />
                  {errors.addressLine && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.addressLine}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/user-management")}
                  className="px-6 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50 transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="px-8 py-2 bg-gradient-to-r from-[#02235E] to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                >
                  {updateUserMutation.isPending ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </span>
                  ) : (
                    <span>Update User</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
