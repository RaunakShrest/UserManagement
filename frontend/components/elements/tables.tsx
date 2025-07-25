"use client";

import React, { ReactNode, Ref } from "react";
import {
  faArrowDownLong,
  faArrowUpLong,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";

type TableProps = React.ComponentPropsWithoutRef<"table"> & {
  children: ReactNode;
  tableRef?: Ref<HTMLTableElement>;
};

type SectionProps = React.ComponentPropsWithoutRef<"thead" | "tbody"> & {
  children: ReactNode;
};

type HeadingProps = React.HTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
  className?: string;
  sortData?: (key: string) => void;
  isSortable?: boolean;
  dataKey?: string;
};

type RowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  children: ReactNode;
  className?: string;
};

type ColumnProps = React.HTMLAttributes<HTMLTableCellElement> & {
  children: ReactNode;
  colSpan?: number;
};

export default function Table({ children, tableRef, ...props }: TableProps) {
  return (
    <table
      ref={tableRef}
      {...props}
      className="w-full table-fixed border-collapse rounded-lg border"
    >
      {children}
    </table>
  );
}

Table.Head = function TableHead({ children, ...props }: SectionProps) {
  return <thead {...props}>{children}</thead>;
};

Table.Body = function TableBody({ children, ...props }: SectionProps) {
  return <tbody {...props}>{children}</tbody>;
};

Table.Heading = function TableHeading({
  children,
  className,
  sortData,
  isSortable,
  dataKey,
  ...props
}: HeadingProps) {
  if (isSortable && !dataKey) {
    throw new Error(
      "sortable heading requires dataKey to connect to the data to sort"
    );
  }

  return (
    <th
      className={twMerge("bg-[#f1f7fa] text-black", className)}
      onClick={isSortable ? () => sortData?.(dataKey!) : undefined}
      {...props}
    >
      <div
        className={twMerge(
          "flex w-full items-center gap-2",
          isSortable ? "cursor-pointer" : ""
        )}
      >
        {children}

        {isSortable && (
          <span>
            <FontAwesomeIcon icon={faArrowUpLong} className="-mr-0.5" />
            <FontAwesomeIcon icon={faArrowDownLong} className="-ml-0.5" />
          </span>
        )}
      </div>
    </th>
  );
};

Table.Row = function TableRow({ children, className, ...props }: RowProps) {
  return (
    <tr
      {...props}
      className={twMerge("border-b-2 border-[#eee] bg-white", className)}
    >
      {children}
    </tr>
  );
};

Table.Column = function TableColumn({ children, ...props }: ColumnProps) {
  return <td {...props}>{children}</td>;
};
