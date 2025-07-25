import React from "react";
import Image, { ImageProps } from "next/image";
import { twMerge } from "tailwind-merge";

export interface ImgProps extends Omit<ImageProps, "src" | "alt"> {
  src: string;
  alt: string;
  className?: string;
}

export default function Img({ src, alt, className, ...props }: ImgProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={twMerge("object-cover object-center", className)}
      {...props}
    />
  );
}
