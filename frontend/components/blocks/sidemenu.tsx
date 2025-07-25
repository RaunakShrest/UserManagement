"use client";

import React, { useState } from "react";
import Link from "next/link";
import Tabs from "../elements/tabs";
import { usePathname } from "next/navigation";
import { useMenuContext } from "./menu-wrapper";

type SideMenuProps = {
  userData?: any;
};

export default function SideMenu({ userData }: SideMenuProps) {
  const { isMenuExpanded, setIsMenuExpanded } = useMenuContext();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsMenuExpanded(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsMenuExpanded(false);
  };

  return (
    <div className="relative flex h-full">
      <div
        className="flex h-full flex-col justify-between transition-all duration-700 ease-in-out"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Tabs>
          <Tabs.Item
            href="/user-management"
            accessableBy={["super-admin", "admin"]}
          >
            <Link
              href="/user-management"
              title="user-management"
              className={`group flex items-center space-x-4 ${
                usePathname() === "/user-management" ? "text-white" : ""
              }`}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginLeft: "3px" }}
              >
                <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <g id="User / Users">
                    <path
                      id="Vector"
                      className={`transition-all duration-300 ${
                        usePathname() === "/user-management"
                          ? "stroke-white"
                          : "stroke-black group-hover:stroke-white"
                      }`}
                      d="M21 19.9999C21 18.2583 19.3304 16.7767 17 16.2275M15 20C15 17.7909 12.3137 16 9 16C5.68629 16 3 17.7909 3 20M15 13C17.2091 13 19 11.2091 19 9C19 6.79086 17.2091 5 15 5M9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C11.2091 5 13 6.79086 13 9C13 11.2091 11.2091 13 9 13Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </g>
                </g>
              </svg>

              {isMenuExpanded && (
                <span
                  className={`inline-block ${
                    usePathname() === "/user-management"
                      ? "text-white"
                      : "text-black group-hover:text-white"
                  }`}
                >
                  User Management
                </span>
              )}
            </Link>
          </Tabs.Item>
        </Tabs>
      </div>
    </div>
  );
}
