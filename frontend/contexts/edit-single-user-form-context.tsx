"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFormGetValues,
  Control,
  FieldErrors,
} from "react-hook-form";

type SingleUserFormValues = {
  [key: string]: any;
};

interface SingleUserEditContextType {
  handleSubmit: UseFormHandleSubmit<SingleUserFormValues>;
  register: UseFormRegister<SingleUserFormValues>;
  watch: UseFormWatch<SingleUserFormValues>;
  setValue: UseFormSetValue<SingleUserFormValues>;
  getValues: UseFormGetValues<SingleUserFormValues>;
  control: Control<SingleUserFormValues>;
  errors: FieldErrors<SingleUserFormValues>;
}

const SingleUserEditContext = createContext<
  SingleUserEditContextType | undefined
>(undefined);

export const useSingleUserEdit = (): SingleUserEditContextType => {
  const context = useContext(SingleUserEditContext);
  if (!context) {
    throw new Error(
      "useSingleUserEdit must be used within the scope of EditSingleUserProvider"
    );
  }
  return context;
};

interface EditSingleUserProviderProps {
  children: ReactNode;
}

export default function EditSingleUserProvider({
  children,
}: EditSingleUserProviderProps) {
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<SingleUserFormValues>();

  return (
    <SingleUserEditContext.Provider
      value={{
        handleSubmit,
        register,
        watch,
        setValue,
        getValues,
        control,
        errors,
      }}
    >
      {children}
    </SingleUserEditContext.Provider>
  );
}
