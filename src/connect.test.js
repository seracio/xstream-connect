import _ from 'lodash/fp';
import PropTypes from 'prop-types';
import React from 'react';
import renderer from 'react-test-renderer';
import xs from 'xstream';
import connect from './connect';
import Provider from './Provider';

class MyComponent extends React.Component {
  render(){
    return <div>hello</div>;
  }
}

test('connect: should return a function', () => {
  expect(typeof connect(_.identity)).toBe('function');
});

test('connect: storeToPropsFunc param should be mandatory', () => {
  expect(connect()).toThrow();
});

test('connect: storeToPropsFunc param should be a function', () => {
  expect(connect('toto')).toThrow();
});

test('Connect component: should be a React component', () => {
  expect(typeof connect(_.identity)(MyComponent)).toBe('function');
});

test('Connect component: should render false when state.go === false', () => {
  const store = {none: xs.never()};
  const MyComponentWrapped = connect(_.identity)(MyComponent);
  class App extends React.Component {
    render(){
      return <MyComponentWrapped />;
    }
  }
  const component = renderer.create(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('Connect component: should only render the WrappedComponent when go === true', () => {
  const store = {once: xs.of(1)};
  const MyComponentWrapped = connect(_.identity)(MyComponent);
  class App extends React.Component {
    render(){
      return <MyComponentWrapped />;
    }
  }
  const component = renderer.create(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('Connect component: fragment attribute should contains keys specified by the storeToPropsFunc parameter', () => {
  const store = {hello$: xs.of('world')};
  class MyOtherComponent extends React.Component {
    render(){
      return <div>{this.props.hello}</div>;
    }
  }
  MyOtherComponent.propTypes = {
    hello: PropTypes.string.isRequired
  };
  const MyComponentWrapped = connect(state => ({
    hello: state.hello$
  }))(MyOtherComponent);
  class App extends React.Component {
    render(){
      return <MyComponentWrapped />;
    }
  }
  const component = renderer.create(
    <Provider store={store}>
      <App />
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('Connect component: should set state when store values changed', () => {

});
