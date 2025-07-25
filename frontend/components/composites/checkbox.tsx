import React from "react";
import { twMerge } from "tailwind-merge";
import { UseFormRegister, RegisterOptions } from "react-hook-form";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: "checkbox" | "radio";
  register?: UseFormRegister<any>;
  name?: string;
  fieldRule?: RegisterOptions;
  className?: string;
}

export default function Checkbox({
  type = "checkbox",
  register,
  name = "",
  fieldRule = {},
  className,
  ...props
}: CheckboxProps) {
  const registerProp = register && name ? register(name, fieldRule) : {};

  return (
    <input
      type={type}
      {...registerProp}
      className={twMerge("rounded-md outline-none", className)}
      {...props}
    />
  );
}
