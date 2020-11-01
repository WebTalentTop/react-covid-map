import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import Button from '@material-ui/core/Button';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import DeleteDialog from './DeleteDialog';

const columns = [
  { id: 'date', label: 'Last Update', minWidth: 170, format: (value) => value.toLocaleString('en-US') },
  { id: 'location', label: 'Location', minWidth: 170, format: (value) => value.toLocaleString('en-US') },
  { id: 'count', label: 'Cases', minWidth: 170, format: (value) => value.toLocaleString('en-US') },
  { id: 'actions', label: 'Actions', minWidth: 170 },
];

const useStyles = makeStyles({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 440,
  },
});

export default function StickyHeadTable({ casesData, onDelete }) {
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = React.useState(false);
  const [currentId, setCurrentId] = useState(null);

  const handleClickOpen = (id) => {
    setOpen(true);
    setCurrentId(id);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete(currentId);
  }

  return (
    <Paper className={classes.root}>
      <DeleteDialog
        open={open}
        handleClose={handleClose}
        handleDelete={handleDelete}
      />
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {casesData && casesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    if (column.id !== 'actions') {
                      return (
                        <TableCell key={`${column.id}-${row._id}`} align={column.align}>
                          {column.format && typeof value === 'number' ? column.format(value) : value}
                        </TableCell>
                      );
                    }
                    else {
                      return (
                        <TableCell key={`action-${row._id}`}>
                          <Button onClick={() => handleClickOpen(row._id)} color="primary">
                            Delete
                          </Button>
                        </TableCell>
                      )
                    }
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={casesData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  );
}