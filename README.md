# xstream-connect

higher order component to plug [xstream](https://github.com/staltz/xstream) as a store with React components

[![Build Status](https://travis-ci.org/seracio/xstream-connect.svg?branch=master)](https://travis-ci.org/seracio/xstream-connect)

## Install

```bash
yarn add react react-dom prop-types xstream @seracio/xstream-connect
```

## Disclaimer

This package feets well the way we work and the problems we face 
(small size stores but complex async workflow on derived data). 
It's mostly intended to our own developments and is not well tested, the paradigm it relies on is....

The purpose here is not to provide an async middleware to a redux store with Streams, 
as [redux-cycle-middleware](https://github.com/cyclejs-community/redux-cycle-middleware) 
and [redux-observable](https://github.com/redux-observable/redux-observable) do 
but to replace *redux* and its different slices (*async middlewares*, *reducers* and *derived data*) with *(Memory)Streams*.
As this, we can express each variable of the store as a function of other variables, in a clean and async way.

[xstream](https://github.com/staltz/xstream)'s Streams are the perfect tool to achieve this goal, as they are hot
and can easily be transformed into *MemoryStreams* (via the *remember* method).
[xstream](https://github.com/staltz/xstream) is also light and fast, with a simple and comprehensive API compared to other FRP libs.

This library only exposes a component *Provider* and an higher order function *connect* to connect your store to 
the React layer in a *react-redux* fashion.  

## Basic example

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import xs from 'xstream';
import {connect, Provider} from '@seracio/xstream-connect';

// A store is just a dictionary of exposed Streams
const store = {
  count$: xs.periodic(1000).startWith(0),
  hello$: xs.of('hello')
};

const App = ({count, hello}) => { 
  return <div>{this.props.count} --- {this.props.hello}</div>;
}

// the combinator defines which part of your store 
// will be exposed and realised the mapping from Streams to props
const combinator = state => {
  const {count$, hello$} = state;
  return xs.combine(count$, hello$).map([count, hello] => ({count, hello}));
}

// We use a Higher order function connect to wrap our component and plug its props to the store values
const Connected = connect(combinator)(App);

ReactDOM.render(
  <Provider store={store}>
    <Connected />
  </Provider>,
  document.querySelector('#root')
);
```

## Principles

### Store and the Provider component

With this architecture, all the logic resides in *Streams*, 
the store props of the Provide component is just a hash/dictionary of *Streams* (or static values) you want to expose to the React layer.  
   
```javascript
// main.js
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from '@seracio/xstream-connect';
import * as store from './store'; // <---- your store is just a dictionnary of exposed Streams

ReactDOM.render(
  <Provider store={store}> {/* <-- plugged your store to the React layer */}
    <Connected />
  </Provider>,
  document.querySelector('#root')
);

```

### The connect function

In the previous versions of this lib (<3.x.x), the `connect` function was less complicated but also far less powerful and more "magical" (in the wrong way of the term).

The `connect` function takes a single function as param.
This function, called the `combinator`, expressed two things: 
* what part of the store our component will subscribe to
* and when will it receive props updates 

To put it another way, the `combinator` receives the Provider's store and will return a new Stream that combine the part of the store we want our component to be aware of.

For example: 

```javascript
state => {
  const {list$, selected$} = state;
  return xs
    .combine(list$, selected$)
    .map([list, selected] => ({list, selected}));
}
```

or if you only want props to update when selected$ changes, you can use a [`sampleCombine`](https://github.com/staltz/xstream/blob/master/EXTRA_DOCS.md#-samplecombinestreams)

```javascript
state => {
  const {list$, selected$} = state;
  return selected$
    .compose(sampleCombine(list$))
    .map([selected, list] => ({selected, list}));
}
```

or if you only want props to update when selected$'s id changes

```javascript
state => {
  const {list$, selected$} = state;
  return selected$
    .compose(dropRepeats(isIdEqual))
    .compose(sampleCombine(list$))
    .map([selected, list] => ({selected, list}));
}
```

What matters is to return a Stream that has a dictionary as value. This dictionary will be merged with the props of the enhanced component.

### How to dispatch actions from the React layer to the store?

There is no canonical way to achieve this. 
For instance, you can do as this:
* in your store, expose a *dispatcher$* Stream of Stream, as this the React layer will have a Stream to send actions through.
* in your store, create an *actions$* Stream that flatten *dispatcher$*    

```javascript
// store index.js
import _ from 'lodash/fp';
import xs from 'xstream';

// Our dispatcher is exposed 
export const dispatcher$ = xs.of(xs.create());
// actions are not
const actions$ = dispatcher$.flatten();

// little helper
// to check if an action is of a certain type
const isType = type => _.flow(_.get('type'), _.isEqual(type));

// an exposed Stream that depends on an action
export const counter$ = actions$
  .filter(isType('increment'))
  .fold(acc => acc + 1, 0)
  .startWith(0);
```

* expose your store into the React layer context 

```javascript
// main.js
import {Provider} from '@seracio/xstream-connect';
import * as store from './store'; // dispatcher$ is exposed 

// ...
```

* via the *connect* method to *actionsProvider$*, retrieve a Stream into your component's props:

```javascript
// components/MyComponent.js
import xs from 'xstream';
import sampleCombine from 'xstream/extra/sampleCombine';
import {connect} from '@seracio/xstream-connect';

const MyComponent = ({counter, dispatcher}) => {
  // here, the dispatcher's value is a Stream, so we can, shamefully, send actions through it
  const increment = () => dispatcher.shamefullySendNext({type: 'increment'}); 
  return (
    <div onClick={increment}>{counter}</div>;
  );
};

// create a combinator function
const combinator = (state) => state.counter$
  .compose(sampleCombine(state.dispatcher$))
  .map(([counter, dispatcher]) => ({counter, dispatcher}));

// plug the component with the store
export default connect(combinator)(MyComponent);
```

### Caveats

* Be aware that the HOC will wait for the first value of the combinator's Stream before rendering its wrapped component. 
Its render method will return `null` before or a default component if defined (not yet documented).
* Because of this... specificity, you should not hesitate to use default values with your Streams (at least in the combinator).
* Remember the `remember` method, it will transform your Stream into a MemoryStream, an RxJS BehaviorSubject, kind of.

## Why don't you use [cycle.js](https://cycle.js.org)?

[cycle.js](https://cycle.js.org) is neat, but we kinda like the React ecosystem... 
and are also tired of the growing complexity of the redux layer when you want to manage asynchronicity.

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
