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
  Divider
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';

// A component that renders either a standard table or card-based list depending on screen size
const ResponsiveTable = ({ 
  columns, 
  data, 
  loading, 
  emptyMessage = 'No data found', 
  onRowClick,
  actions,
  primaryKey = 'id'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography variant="body1" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  // Render as cards on mobile
  if (isMobile) {
    return (
      <Box>
        {data.map((row) => (
          <Card 
            key={row[primaryKey]} 
            sx={{ mb: 2, cursor: onRowClick ? 'pointer' : 'default' }}
            onClick={() => onRowClick && onRowClick(row)}
          >
            <CardContent sx={{ p: 2 }}>
              {columns.map((column, index) => {
                // Skip hidden columns or action column (we'll handle actions separately)
                if (column.hidden || column.key === 'actions') return null;
                
                // Get the display value
                let value = column.render 
                  ? column.render(row[column.key], row) 
                  : row[column.key];
                
                return (
                  <Box key={column.key} sx={{ mb: index === columns.length - 1 ? 0 : 1 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>
                      {column.label}:
                    </Typography>
                    {typeof value === 'object' ? (
                      <Box mt={0.5}>{value}</Box>
                    ) : (
                      <Typography variant="body2">{value || '-'}</Typography>
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
      </Box>
    );
  }

  // Render as a standard table on larger screens
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              !column.hidden && (
                <TableCell key={column.key} align={column.align || 'left'}>
                  {column.label}
                </TableCell>
              )
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow 
              key={row[primaryKey]}
              onClick={() => onRowClick && onRowClick(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
              hover={!!onRowClick}
            >
              {columns.map((column) => (
                !column.hidden && (
                  <TableCell key={column.key} align={column.align || 'left'}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </TableCell>
                )
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ResponsiveTable;