import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useMediaQuery,
  useTheme,
  CircularProgress,
  IconButton,
  Divider,
  TablePagination
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';

/**
 * ResponsiveTable - Renders data in either table or card format based on screen size
 * 
 * @param {Object} props - Component props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Data items to display
 * @param {boolean} props.loading - Indicates if data is loading
 * @param {string} props.emptyMessage - Message to show when there's no data
 * @param {Function} props.onRowClick - Handler for row click events
 * @param {Function} props.actions - Function to render action buttons
 * @param {string} props.primaryKey - Key field for unique row identification
 * @param {boolean} props.hasPagination - Whether to show pagination controls
 * @param {number} props.page - Current page (0-indexed)
 * @param {number} props.totalCount - Total number of items
 * @param {number} props.rowsPerPage - Number of items per page
 * @param {Function} props.onPageChange - Handler for page changes
 * @param {Function} props.onRowsPerPageChange - Handler for rows per page changes
 */
const ResponsiveTable = ({ 
  columns, 
  data, 
  loading, 
  emptyMessage = 'No data found', 
  onRowClick,
  actions,
  primaryKey = 'id',
  hasPagination = false,
  page = 0,
  totalCount = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  // Render pagination component if pagination is enabled and handlers are provided
  const renderPagination = () => {
    if (!hasPagination || !onPageChange || !onRowsPerPageChange) return null;
    
    return (
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    );
  };

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        {data.map((row) => (
          <Card 
            key={row[primaryKey] || Math.random().toString(36).substr(2, 9)} 
            sx={{ mb: 2, cursor: onRowClick ? 'pointer' : 'default' }}
            onClick={() => onRowClick && onRowClick(row)}
          >
            <CardContent sx={{ p: 2 }}>
              {columns.map((column, index) => {
                // Skip hidden columns or action columns
                if (column.hidden || column.key === 'actions') return null;
                
                // Get the display value
                let value = column.render 
                  ? column.render(row[column.key], row) 
                  : row[column.key];
                
                return (
                  <Box key={column.key || index} sx={{ mb: index === columns.length - 1 ? 0 : 1 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                      {column.label}:
                    </Typography>
                    {typeof value === 'object' ? (
                      <Box mt={0.5}>{value}</Box>
                    ) : (
                      <Typography variant="body2">{value !== undefined && value !== null ? value : '-'}</Typography>
                    )}
                  </Box>
                );
              })}
              
              {actions && (
                <Box mt={2} display="flex" justifyContent="flex-end">
                  {actions(row)}
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
        
        {renderPagination()}
      </Box>
    );
  }

  // Desktop table view
  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                !column.hidden && (
                  <TableCell key={column.key || index} align={column.align || 'left'}>
                    {column.label}
                  </TableCell>
                )
              ))}
              {actions && <TableCell align="center">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow 
                key={row[primaryKey] || Math.random().toString(36).substr(2, 9)}
                onClick={() => onRowClick && onRowClick(row)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                hover={!!onRowClick}
              >
                {columns.map((column, index) => (
                  !column.hidden && (
                    <TableCell key={column.key || index} align={column.align || 'left'}>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  )
                ))}
                {actions && (
                  <TableCell align="center">
                    {actions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {renderPagination()}
    </>
  );
};

export default ResponsiveTable;