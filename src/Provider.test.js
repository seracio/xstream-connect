import React from 'react';
import renderer from 'react-test-renderer';
import Provider from './Provider';

test('Provider: only the child should be rendered', () => {
  const component = renderer.create(
    <Provider store={{test: 'test'}}>
      <div>hello world</div>
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('Provider: the child component should have a context with a key "store"', () => {
  class App extends React.Component {
    render(){
      return <div>{this.context.store.hello}</div>
    }
  }
  App.contextTypes = {
    store: React.PropTypes.object.isRequired
  };

  const component = renderer.create(
    <Provider store={{hello: 'hello world'}}>
      <App />
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('Provider: props store should be mandatory', () => {
  console.error = jest.fn();
  renderer.create(
    <Provider>
      <div>hello world</div>
    </Provider>
  );
  expect(console.error).toHaveBeenCalledTimes(2);
});


