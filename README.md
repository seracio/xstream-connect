# xstream-connect

higher order component to plug [xstream](https://github.com/staltz/xstream) as a store with React components

[![Build Status](https://travis-ci.org/seracio/xstream-connect.svg?branch=master)](https://travis-ci.org/seracio/xstream-connect)

## Install

```
yarn add xstream-connect
```

## Principle

The goal here is not to provide an async middleware to redux with Observables, as [redux-cycle-middleware](https://github.com/cyclejs-community/redux-cycle-middleware) 
and [redux-observable](https://github.com/redux-observable/redux-observable) do 
but to replace *async middlewares*, *reducers* and *derived data* (typically computed with reselect) with *Observables*.
As this, we can express each variable of the store as a function of other variables, in a clean and async way.

[xstream](https://github.com/staltz/xstream)'s Observables are the perfect tool to achieve this purpose, as they are hot
and can be easily transformed into BehaviorSubject (via the *render* method).

This library only exposes a component *Provider* and an higher order function *connect* to connect your store to the React layer in a *react-redux* fashion.  

## Basic example

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

## Architecture

### Store and the Provider component

With this architecture, all the logic resides in Observables, the store is just a hash/dictionary of Obserables you want to expose to React.
So the Provider component only adds this store/dictionary into the React context.  
   
```javascript
// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'xstream-connect';
import * as store from './store'; // <---- your store is just a dictionnary of exposed Observables

ReactDOM.render(
  <Provider store={store}> {/* <-- plugged your store to the React layer */}
    <Connected />
  </Provider>,
  document.querySelector('#root')
);

```

### The connect function

The *connect* function is far more basic than its *react-redux* counterpart, currently it just takes a *mapStateToProps* function as parameter.
The *connect* function will listen to all Observables provided in the *mapStateToProps* and deliver their values into the props with the right key. 
 
```javascript
// components/MyComp.js
import React from 'react';
import {connect} from 'xstream-connect'; 

class MyComp extends React.Component {   
  render(){
    return <div>{this.props.counter}</div>
  }
}

export default connect(
  // mapStateToProps parameter
  // in  this example, we map the value of the Observable *counter$* in a *counter* props 
  state => ({   
    counter: state.counter$  
  })
)(MyComp);

```

### How to dispatch actions from the React layer to the store ?

There is no canonical way to achieve this. This is your choice... 
For instance, you can do as this:
* in your store, expose a *dispatcher$* Observable of Observable, as this the React layer could have a Subject to inject actions  
* in your store, create an *actions$* Observable that flatten *dispatcher$*    

```javascript
// store index.js
import _ from 'lodash/fp';
import xs from 'xstream';

export const dispatcher$ = xs.of(xs.create()).remember();
const actions$ = dispatcher$.flatten().remember();

// little helper
// to check if an action is of a certain type
const isType = type => _.flow(_.get('type'), _.isEqual(type));

// an exposed Observable that depends on an action
export const counter$ = actions$
  .filter(isType('increment'))
  .fold(acc => acc + 1, 0)
  .startWith(0)
  .remember();
```

* expose your store into the React layer context 

```javascript
// main.js
import {Provider} from 'xstream-connect';
import * as store from './store'; // dispatcher$ is exposed 

// ...
```

* via the *connect* method to *actionsProvider$*, retrieve an Observable into your component's props:

```javascript
// components/MyComponent.js
import {connect} from 'xstream-connect';

class MyComponent extends React.Component {
  
  handleClick = () => this.props.dispatcher.shamefullySendNext({type: 'increment'})
  
  render(){
    return <div onClick={this.handleClick}>{this.props.counter}</div>;
  }
}

export default connect(
  state => ({
    // The trick is here
    // the value of state.actionsProvider$ is an Observable that can trigger side effects
    dispatcher: state.dispatcher$,
    counter: state.counter$,
  })
)(MyComponent);
// ...
```

## Why don't you use [cycle.js](https://cycle.js.org)?

[cycle.js](https://cycle.js.org) is neat, but we kinda like the React/redux architecture and the React ecosystem... and are also tired of the growing complexity of the redux layer when you want to manage asynchronicity.

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
