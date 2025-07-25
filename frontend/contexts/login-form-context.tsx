"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useForm,
  UseFormRegister,
  UseFormHandleSubmit,
  FieldErrors,
} from "react-hook-form";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormContextValue {
  register: UseFormRegister<LoginFormData>;
  handleSubmit: UseFormHandleSubmit<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
}

interface LoginFormContextProviderProps {
  children: ReactNode;
}

const LoginFormContext = createContext<LoginFormContextValue | undefined>(
  undefined
);

export const useLoginFormContext = (): LoginFormContextValue => {
  const context = useContext(LoginFormContext);

  if (!context) {
    throw new Error(
      "use useLoginFormContext within the context of LoginFormContextProvider"
    );
  }

  return context;
};
export default function LoginFormContextProvider({
  children,
}: LoginFormContextProviderProps): React.ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  return (
    <LoginFormContext.Provider value={{ register, handleSubmit, errors }}>
      {children}
    </LoginFormContext.Provider>
  );
}
