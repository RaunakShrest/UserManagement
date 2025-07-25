"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useForm,
  UseFormHandleSubmit,
  FieldErrors,
  UseFormRegister,
  Control,
  UseFormWatch,
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";

type AddUserFormValues = {
  [key: string]: any;
};

interface AddUserFormContextType {
  handleSubmit: UseFormHandleSubmit<AddUserFormValues>;
  errors: FieldErrors<AddUserFormValues>;
  register: UseFormRegister<AddUserFormValues>;
  control: Control<AddUserFormValues>;
  watch: UseFormWatch<AddUserFormValues>;
  setValue: UseFormSetValue<AddUserFormValues>;
  getValues: UseFormGetValues<AddUserFormValues>;
}

const AddUserFormContext = createContext<AddUserFormContextType | undefined>(
  undefined
);

export const useAddUserForm = () => {
  const context = useContext(AddUserFormContext);

  if (!context) {
    throw new Error(
      "useAddUserForm must be used within the AddUserFormProvider"
    );
  }

  return context;
};

interface AddUserFormProviderProps {
  children: ReactNode;
}

export default function AddUserFormProvider({
  children,
}: AddUserFormProviderProps) {
  const {
    handleSubmit,
    formState: { errors },
    register,
    control,
    watch,
    setValue,
    getValues,
  } = useForm<AddUserFormValues>({});

  return (
    <AddUserFormContext.Provider
      value={{
        handleSubmit,
        errors,
        register,
        control,
        watch,
        setValue,
        getValues,
      }}
    >
      {children}
    </AddUserFormContext.Provider>
  );
}
