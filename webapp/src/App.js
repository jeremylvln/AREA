import React from 'react';
import './App.css';

import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';

import Header from './components/Header';
import Home from './pages/Home';
import LoginPage from './pages/Login';
import Services from './pages/Services';
import {HomeProvider} from "./context/HomeContext";
  
function App() {
  return (
    <>
      <Router>
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#303030', display: 'block' }}>
          {/* <Header/> */}
            <div className="App">
              <Switch>
                <Route exact path="/" component={LoginPage}/>
                <Route path="/home" component={() => (
                    <HomeProvider>
                      <Header/>
                      <Home/>
                    </HomeProvider>
                  )}
                />
                <Route path="/services" component={Services}/>
                <Route component={ () => <Redirect to='/'/> }/>
              </Switch>
            </div>
        </div>
      </Router>
    </>
  );
}

export default App;