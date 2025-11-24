const PaginationControls = ({ page, setPage, totalResults, pageSize, setPageSize, pageInput, setPageInput, pageInputRef, showPageSizeSelector = false }) => {
    const maxPage = Math.ceil(totalResults / pageSize);
    const handlePageKeyDown = (e) => {
        if (e.key === 'Enter') {
            const value = parseInt(pageInput, 10);
            if (!isNaN(value) && value >= 1 && value <= maxPage) {
                setPage(value);
            }
            e.target.blur();
        }
    };
    const handlePageChange = (e) => {
        setPageInput(e.target.value);
    };
    const handleFocus = (e) => {
        e.target.select();
    };
    const handlePageSizeChange = (e) => {
        if (setPageSize) {
            setPageSize(parseInt(e.target.value, 10));
            setPage(1);
            setPageInput('1');
        }
    };
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-2">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="cursor-pointer px-2 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Previous
                </button>
                <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-700 dark:text-gray-300">Page</span>
                    <input
                        ref={pageInputRef}
                        type="number"
                        min="1"
                        max={maxPage}
                        value={pageInput}
                        onChange={handlePageChange}
                        onKeyDown={handlePageKeyDown}
                        onFocus={handleFocus}
                        className="w-8 px-1 py-0 text-xs text-center border border-gray-200 rounded-md bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-number-buttons]:hidden"
                    />
                    <span className="text-xs text-gray-700 dark:text-gray-300">of {maxPage}</span>
                </div>
                <button
                    onClick={() => {
                        setPage((p) => Math.min(maxPage, p + 1));
                    }}
                    disabled={page >= maxPage}
                    className="cursor-pointer px-2 py-1 text-sm border border-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    Next
                </button>
            </div>
            {showPageSizeSelector && (
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-700 dark:text-gray-300">Results per page:</label>
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default PaginationControls;
