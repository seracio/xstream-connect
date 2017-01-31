# xstream-connect

higher order component to plug [xstream](https://github.com/staltz/xstream) as a store with React components

[![Build Status](https://travis-ci.org/seracio/xstream-connect.svg?branch=master)](https://travis-ci.org/seracio/xstream-connect)

## Disclaimer

You should probably not use this module.

The goal here is not to provide an async middleware to redux with Observables, as [redux-cycle-middleware](https://github.com/cyclejs-community/redux-cycle-middleware) 
and [redux-observable](https://github.com/redux-observable/redux-observable) 
but to substitute async middlewares, reducers and derived data (typically computed with reselect) by Observables.    

## Install

```
yarn add xstream-connect
```

## Usage

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import xs from 'xstream';
import {connect, Provider} from 'xstream-connect';

const store = {
  count$: xs.periodic(1000).startWith(0),
  hello$: xs.of('hello')
};

class App extends React.Component { 
  render(){
    return <div>{this.props.count} --- {this.props.hello}</div>;
  }
}

const Connected = connect(
  state => ({
    count: state.count$,
    hello: state.hello$
  })
)(App);

ReactDOM.render(
  <Provider store={store}>
    <Connected />
  </Provider>,
  document.querySelector('#root')
);
```

### How to catch actions from the user?
 
At this very moment, you have to expose a Subject $actions...

Something like that:
    
```javascript
// store/index.js
import _ from 'lodash/fp';
import xs from 'xstream';

// 
export const actions$ = xs.create().remember();

export const myCounter$ = actions$
  .filter(_.flow(_.get('type'),_.isEqual('increment')))
  .fold((acc, ping) => acc + 1, 0)
  .startWith(0)
  .remember();
```    

```javascript
// components/App.js
import React from 'react';
import {connect} from 'xstream-connect';
import {actions$} from '../store'; // Crappy

class App extends React.Component {
  
  handleClick = () => actions$.shamefullySendNext({type: 'increment'});
 
  render(){
    return (
      <div onClick={this.handleClick}>
        {this.props.counter}      
      </div>      
    );   
  }
  
}

export default connect(
  state => ({
    counter: state.myCounter$
  })  
)(App);

```

## License

MIT License

Copyright (c) 2017 serac.io 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
