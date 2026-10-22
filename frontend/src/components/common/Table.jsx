export default function Table({
  columns = [],
  data = [],
  emptyMessage = "No records found.",
  loading = false,
  onRowClick,
}) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-white shadow-card">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-border-light bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-5
                    py-3.5
                    text-left
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-text-secondary
                    ${column.headerClassName || ""}
                  `}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border-light">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm text-text-secondary"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm text-text-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() =>
                    onRowClick && onRowClick(row)
                  }
                  className={`
                    transition
                    hover:bg-gray-50
                    ${
                      onRowClick
                        ? "cursor-pointer"
                        : ""
                    }
                  `}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`
                        px-5
                        py-4
                        text-sm
                        text-text-primary
                        ${column.className || ""}
                      `}
                    >
                      {column.render
                        ? column.render(
                            row,
                            index
                          )
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}