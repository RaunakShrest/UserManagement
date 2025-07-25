import React from "react";
import { twMerge } from "tailwind-merge";
import Img, { ImgProps } from "./img";

export interface ImgWithWrapperProps {
  wrapperClassName?: string;
  imageClassName?: string;
  imageAttributes: ImgProps;
  className?: string;
}

export default function ImgWithWrapper({
  wrapperClassName,
  imageClassName,
  imageAttributes,
  className,
}: ImgWithWrapperProps) {
  return (
    <div className={twMerge("relative", wrapperClassName)}>
      <Img className={imageClassName} {...imageAttributes} />
    </div>
  );
}
