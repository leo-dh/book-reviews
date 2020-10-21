import React, { useState } from 'react';
import {
  createStyles,
  fade,
  makeStyles,
  Theme,
} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import { InputBase } from '@material-ui/core';
import { Link } from 'react-router-dom';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuButton: {
      marginRight: theme.spacing(2),
    },
    toolbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    search: {
      position: 'relative',
      display: 'flex',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25),
      },
      marginRight: theme.spacing(4),
      marginLeft: theme.spacing(2),
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'unset',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 0, 1, 2),
      transition: theme.transitions.create('width'),
      width: '40ch',
    },
    searchResultsContainer: {
      position: 'absolute',
      top: '100%',
      left: 0,
    },
  }),
);

export default function NavigationBar() {
  const classes = useStyles();
  const [searchText, setSearchText] = useState('');
  const [focus, setFocus] = useState(false);

  return (
    <AppBar position="static">
      <Toolbar className={classes.toolbar}>
        <Box display="flex" alignItems="center">
          {/* <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton> */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            style={{ textDecoration: 'none', color: 'unset' }}
          >
            Book Reviews
          </Typography>
        </Box>
        <Box display="flex">
          <div className={classes.search}>
            <InputBase
              placeholder="Search Books…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
            <IconButton className={classes.searchIcon}>
              <SearchIcon />
            </IconButton>
            <span
              className={classes.searchResultsContainer}
              style={
                focus && searchText ? { display: 'block' } : { display: 'none' }
              }
            >
              <div>Search Results</div>
            </span>
          </div>
          {/* <Button color="inherit">Login</Button> */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
