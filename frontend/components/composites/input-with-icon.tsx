"use client";

import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import Input from "@/components/elements/input";
import { FieldErrors, UseFormReturn } from "react-hook-form";

type InputWithIconProps = {
  useFormContext: () => UseFormReturn<any>;
  iconElement?: ReactNode;
  inputType?: "input" | "select";
  wrapperClassName?: string;
  inputClassName?: string;
  takesFullWidth?: boolean;
  className?: string;
  label?: string;
  children?: ReactNode;
  wrapperAttributes?: React.HTMLAttributes<HTMLDivElement>;
  inputAttributes: React.InputHTMLAttributes<HTMLInputElement> &
    React.SelectHTMLAttributes<HTMLSelectElement> & {
      name: string;
      required?: boolean;
      multiple?: boolean;
    };
};

export default function InputWithIcon({
  useFormContext,
  iconElement,
  inputType = "input",
  wrapperClassName,
  inputClassName,
  takesFullWidth,
  className,
  label,
  children,
  ...props
}: InputWithIconProps) {
  const formContextValues = useFormContext();
  const errors: FieldErrors = formContextValues?.formState?.errors || {};

  const hasError = !!errors?.[props.inputAttributes.name];

  return (
    <div
      className={`space-y-2 ${takesFullWidth ? "col-start-1 col-end-1" : ""}`}
    >
      {label && (
        <div>
          <label>
            {label}
            {props.inputAttributes.required && (
              <span className="text-red-600">*</span>
            )}
          </label>
        </div>
      )}

      <div>
        <div
          className={twMerge(
            "flex items-center rounded-md border-2 border-[#bbbbbb]",
            wrapperClassName,
            hasError ? "border-red-600" : ""
          )}
          {...props.wrapperAttributes}
        >
          {iconElement}

          {inputType === "select" ? (
            <select
              className={twMerge(
                "w-full rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none",
                inputClassName
              )}
              multiple={props.inputAttributes.multiple}
              {...props.inputAttributes}
            >
              {children}
            </select>
          ) : (
            <Input
              className={twMerge(
                "w-full px-3 py-2 text-gray-900 bg-white border-none focus:ring-0",
                inputClassName
              )}
              {...props.inputAttributes}
            />
          )}
        </div>

        {hasError && (
          <div>
            <span className="text-[0.75rem] text-red-600">
              {errors?.[props.inputAttributes.name]?.message as string}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
