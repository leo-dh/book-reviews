import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import CssBaseline from '@material-ui/core/CssBaseline';
import NavigationBar from './Components/NavigationBar';
import Home from './Views/Home';
import Book from './Views/Book';

function App() {
  return (
    <>
      <CssBaseline />
      <Router>
        <div className="App">
          <NavigationBar />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/book/:asin" component={Book} />
          </Switch>
        </div>
      </Router>
    </>
  );
}

export default App;
