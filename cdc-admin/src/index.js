import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from './App';
import './index.css';
import Home from './Home';
import AutorAdmin from './Autor';
import LivroAdmin from './Livro';

ReactDOM.render((
    <Router>
        <App>
            <Switch>
                <Route exact path="/" component={App} />
                <Route path="/autor" component={AutorAdmin}/>
                <Route path="/livro" component={LivroAdmin} />
                <Route component={Home}/>
            </Switch>
        </App>
    </Router>

), document.getElementById('root'));