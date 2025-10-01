// src/sections/Logs/utils.tsx
export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

export function applyFilter({
  inputData,
  comparator,
  filterName,
  probabilityFilter,
  logType,
}: {
  inputData: any[];
  comparator: (a: any, b: any) => number;
  filterName: string;
  probabilityFilter?: string;
  logType?: 'phishing' | 'ransomware' | 'dos' | 'codeSafety';
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as [any, number]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  // Apply text search filter
  if (filterName) {
    inputData = inputData.filter(
      (log) =>
        log.url.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        (log.prediction && log.prediction.toLowerCase().indexOf(filterName.toLowerCase()) !== -1) ||
        (log.walletAddress && log.walletAddress.toLowerCase().indexOf(filterName.toLowerCase()) !== -1)
    );
  }


  // Apply probability/anomaly score filter
  if (probabilityFilter) {
    inputData = inputData.filter((log) => {
      const score = logType === 'codeSafety' ? log.anomalyScore : log.probability;
      
      if (probabilityFilter === 'high') {
        return logType === 'codeSafety' ? score >= 8 : score >= 0.8; // 80% = 0.8
      }
      if (probabilityFilter === 'medium') {
        return logType === 'codeSafety' ? score >= 5 && score < 8 : score >= 0.5 && score < 0.8; // 50-79% = 0.5-0.79
      }
      if (probabilityFilter === 'low') {
        return logType === 'codeSafety' ? score < 5 : score < 0.5; // <50% = <0.5
      }
      return true;
    });
  }

  return inputData;
}

export function getComparator(order: 'asc' | 'desc', orderBy: string) {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

export function getEnhancedComparator(sortBy: string) {
  if (!sortBy) return getComparator('desc', 'timestamp');
  
  const [field, direction] = sortBy.split('-');
  const order = direction as 'asc' | 'desc';
  
  return getComparator(order, field);
}

function descendingComparator(a: any, b: any, orderBy: string) {
  // Handle timestamp comparison
  if (orderBy === 'timestamp') {
    const dateA = new Date(a[orderBy]);
    const dateB = new Date(b[orderBy]);
    return dateB.getTime() - dateA.getTime();
  }
  
  // Handle numeric comparisons
  if (typeof a[orderBy] === 'number' && typeof b[orderBy] === 'number') {
    return b[orderBy] - a[orderBy];
  }
  
  // Handle string comparisons
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}