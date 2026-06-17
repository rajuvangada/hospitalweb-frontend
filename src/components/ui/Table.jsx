import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const Table = ({
  columns = [],
  data = [],
  searchPlaceholder = "Search records...",
  searchKeys = [],
  pageSize = 5,
  actions,
  filterElement,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Filter Data by Search Query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || searchKeys.length === 0) return data;
    return data.filter(item => {
      return searchKeys.some(key => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, searchKeys]);

  // 2. Sort Data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  // 3. Paginate Data
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {searchKeys.length > 0 && (
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-11 pl-10 pr-4 bg-muted/40 border border-border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all shadow-inner"
            />
          </div>
        )}
        
        {/* Custom filter dropdown placeholder */}
        {filterElement && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            {filterElement}
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => col.sortable && requestSort(col.key)}
                  className={`p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground select-none ${
                    col.sortable ? 'cursor-pointer hover:text-foreground' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && sortConfig.key === col.key && (
                      sortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="p-4 text-xs font-bold uppercase text-right tracking-wider text-muted-foreground">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="p-8 text-center text-sm text-muted-foreground">
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr key={row.id || rowIdx} className="hover:bg-muted/20 transition-colors duration-150">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-4 text-sm font-medium text-foreground">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1 text-sm text-muted-foreground">
          <div>
            Showing <span className="font-bold text-foreground">{(currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-bold text-foreground">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </span>{' '}
            of <span className="font-bold text-foreground">{sortedData.length}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-border/60 hover:bg-muted text-foreground rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              const isCurrent = currentPage === pageNum;
              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 text-xs font-bold rounded-lg border transition-all ${
                    isCurrent
                      ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/20'
                      : 'border-border/60 hover:bg-muted text-foreground'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 border border-border/60 hover:bg-muted text-foreground rounded-lg disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
