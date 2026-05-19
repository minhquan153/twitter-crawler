function Pagination({ page, totalPages, onPageChange, disabled }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="pagination">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        Next
      </button>
    </nav>
  );
}

export default Pagination;
