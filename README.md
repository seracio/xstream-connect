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

The purpose here is not to provide an async middleware to a redux store with Streams, 
as [redux-cycle-middleware](https://github.com/cyclejs-community/redux-cycle-middleware) 
and [redux-observable](https://github.com/redux-observable/redux-observable) do 
but to replace *redux* and its different slices (*async middlewares*, *reducers* and *derived data*) with *MemoryStreams*.
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
  count$: xs.periodic(1000).startWith(0)
};

const App = ({count}) => { 
  return <div>{this.props.count}</div>;
};

// the combinator defines which part of your store 
// will be exposed and realised the mapping from Streams to props
const combinator = state => {
  const {count$, hello$} = state;
  return xs.combine(count$).map(count => ({count}));
};

// We use a Higher order function connect to wrap our component and plug its props to the store values
const ConnectedApp = connect(combinator)(App);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.querySelector('#root')
);
```

## Principles

### Store and the Provider component

Within this architecture, all the logic resides in *Streams*.  
The store props of the Provide component is just a hash/dictionary of *Streams* (or static values) you want to expose to the React layer.  
   
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

The `connect` function takes a single function as param.
This function, called the `combinator`, expressed two things: 

* what parts of the store our component will subscribe to
* and when will it receive props updates 

To put it another way, the `combinator` receives the Provider's store as param and will return **a unique Stream** that combine the parts of the store we want our component to be aware of.
The value of this Stream will be **a plain object** {key => value} (as React's components are expected props).

For instance: 

```javascript
const combinator = state => {
  const {list$, selected$} = state;
  return xs
    .combine(list$, selected$)
    .map([list, selected] => ({list, selected}));
}
```

or if you only want props to update when selected$ changes, you can use a [`sampleCombine`](https://github.com/staltz/xstream/blob/master/EXTRA_DOCS.md#-samplecombinestreams)

```javascript
const combinator = state => {
  const {list$, selected$} = state;
  return selected$
    .compose(sampleCombine(list$))
    .map([selected, list] => ({selected, list}));
}
```

or if you only want props to update when selected$'s id changes

```javascript
const combinator = state => {
  const {list$, selected$} = state;
  return selected$
    .compose(dropRepeats(isIdEqual))
    .compose(sampleCombine(list$))
    .map([selected, list] => ({selected, list}));
}
```

### Waiting component

Be aware that the HOC will wait for the first value of the combinator's Stream before rendering its component. 
Its render method will return `null` before or a default component if defined.

You can specify a Waiting component as this:

```javascript
connect(combinator)(MyComponent, WaitingComponent);
```

The waiting component will receive all props of MyComponent that are not provided by the combinator.

Of course, you can also compose the combinator's Stream with a `startWith` operator:

```javascript
const combinatr = state => {
  const {myStream$} = state;
  return myStream$
    .startWith(null)
    .map(data => ({data}));
}
```

## Common patterns and caveats

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
  .startWith(0)
  .remember(); 
// note that startWith() already returns a MemoryStream, remember() is not needed here 
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

### How to manage Promises Streams and other Streams that complete?

`fromPromise` Streams can be tricky as they will complete as soon as their inner Promise is resolved:

```javascript
import {getAsyncData} from '../services';

const data$ = xs.fromPromise(getAsyncData()).remember();
```

This is problematic with complex async flow, especially if you use `sampleCombine` or `combine` operators.
I advise you to transform `fromPromise` Streams as this:

```javascript
const data$ = xs
  .merge(
    xs.create(), 
    xs.fromPromise(getAsyncData())
  ).remember();
```

We can generalize this rule with all `completable` Streams.

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
