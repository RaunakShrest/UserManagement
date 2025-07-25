import React from "react";

interface PaginationProps {
  numberOfDataPerPage?: number;
  totalNumberOfData: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  numberOfDataPerPage = 2,
  totalNumberOfData,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalNumberOfData / numberOfDataPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  return (
    <>
      {totalPages > 1 ? (
        <div className="flex items-center justify-center space-x-2">
          {/* Previous Arrow */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`rounded-md border px-2 py-2 transition ${
              currentPage === 1
                ? "cursor-not-allowed border-gray-300 text-gray-400"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            &#8592;
          </button>

          <button
            onClick={() => onPageChange(1)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              currentPage === 1
                ? "bg-[#02235E] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            1
          </button>

          {currentPage > 3 && <span className="px-2 text-gray-500">...</span>}

          {pageNumbers
            .filter(
              (pageNumber) =>
                pageNumber !== 1 &&
                pageNumber !== totalPages &&
                Math.abs(pageNumber - currentPage) <= 1
            )
            .map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  currentPage === pageNumber
                    ? "bg-[#02235E] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {pageNumber}
              </button>
            ))}

          {currentPage < totalPages - 2 && (
            <span className="px-2 text-gray-500">...</span>
          )}

          <button
            onClick={() => onPageChange(totalPages)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${
              currentPage === totalPages
                ? "bg-[#02235E] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {totalPages}
          </button>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`rounded-md border px-2 py-2 transition ${
              currentPage === totalPages
                ? "cursor-not-allowed border-gray-300 text-gray-400"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            &#8594;
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <button
            className="cursor-default rounded-md bg-[#02235E] px-3 py-2 text-sm font-medium text-white"
            disabled
          >
            1
          </button>
        </div>
      )}
    </>
  );
};

export default Pagination;
