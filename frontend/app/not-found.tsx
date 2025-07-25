import Link from "next/link";
import React from "react";

const NotFound: React.FC = () => {
  return (
    <div className="py-20">
      <p className="text-center text-white">
        <span className="text-3xl font-bold">Sorry!!!</span> <br />
        <span>the page you're trying to access doesn't exist</span>
      </p>

      <p className="text-center">
        Return to{" "}
        <Link href="/user-management" className="text-blue-800 underline">
          Home
        </Link>
      </p>
    </div>
  );
};

export default NotFound;
