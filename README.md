# xstream-connect

higher order component to plug xstream streams to React components

[![Build Status](https://travis-ci.org/seracio/xstream-connect.svg?branch=master)](https://travis-ci.org/seracio/xstream-connect)

## Usage

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import xs from 'xstream';
import {connect, Provider} from 'xstream-connect';

const store = {
  count$: xs.periodic(1000).startWith(0),
  hello$: xs.of('hello'),
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
