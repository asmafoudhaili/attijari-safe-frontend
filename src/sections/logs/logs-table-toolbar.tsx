import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type LogsTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // New filter props
  probabilityFilter: string;
  onProbabilityFilter: (value: string) => void;
  sortBy: string;
  onSortBy: (value: string) => void;
  logType: 'phishing' | 'ransomware' | 'dos' | 'codeSafety';
};

export function LogsTableToolbar({ 
  numSelected, 
  filterName, 
  onFilterName,
  probabilityFilter,
  onProbabilityFilter,
  sortBy,
  onSortBy,
  logType
}: LogsTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 'auto',
        minHeight: 96,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: (theme) => theme.spacing(2, 1, 2, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {/* First row: Search and selected count */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        {numSelected > 0 ? (
          <Typography component="div" variant="subtitle1">
            {numSelected} selected
          </Typography>
        ) : (
          <OutlinedInput
            value={filterName}
            onChange={onFilterName}
            placeholder="Search Logs..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            sx={{ maxWidth: 320 }}
          />
        )}

        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Second row: Filters */}
      {numSelected === 0 && (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>

          {/* Probability Filter (only for phishing, ransomware, dos) */}
          {(logType === 'phishing' || logType === 'ransomware' || logType === 'dos') && (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={probabilityFilter}
                onChange={(e) => onProbabilityFilter(e.target.value)}
                displayEmpty
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:chart-bold" width={16} />
                    {selected || 'All Probability'}
                  </Box>
                )}
              >
                <MenuItem value="">All Probability</MenuItem>
                <MenuItem value="high">High (80-100%)</MenuItem>
                <MenuItem value="medium">Medium (50-79%)</MenuItem>
                <MenuItem value="low">Low (0-49%)</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Anomaly Score Filter (only for codeSafety) */}
          {logType === 'codeSafety' && (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={probabilityFilter}
                onChange={(e) => onProbabilityFilter(e.target.value)}
                displayEmpty
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconify icon="solar:chart-bold" width={16} />
                    {selected || 'All Scores'}
                  </Box>
                )}
              >
                <MenuItem value="">All Scores</MenuItem>
                <MenuItem value="high">High (8-10)</MenuItem>
                <MenuItem value="medium">Medium (5-7)</MenuItem>
                <MenuItem value="low">Low (0-4)</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Sort By */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => onSortBy(e.target.value)}
              displayEmpty
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="solar:sort-by-time-bold" width={16} />
                  {selected || 'Sort By'}
                </Box>
              )}
            >
              <MenuItem value="timestamp-desc">Newest First</MenuItem>
              <MenuItem value="timestamp-asc">Oldest First</MenuItem>
            </Select>
          </FormControl>

          {/* Active filters chips */}
          {(probabilityFilter || sortBy) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {probabilityFilter && (
                <Chip
                  label={`${logType === 'codeSafety' ? 'Score' : 'Probability'}: ${probabilityFilter}`}
                  size="small"
                  onDelete={() => onProbabilityFilter('')}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {sortBy && (
                <Chip
                  label={`Sort: ${sortBy.replace('timestamp', 'time').replace('-', ' ')}`}
                  size="small"
                  onDelete={() => onSortBy('')}
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>
      )}
    </Toolbar>
  );
}
