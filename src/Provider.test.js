import React from 'react';
import renderer from 'react-test-renderer';
import Provider from './Provider';

test('only child is rendered', () => {
  const component = renderer.create(
    <Provider store={{test: 'test'}}>
      <div>hello</div>
    </Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test.skip('store props is mandatory', () => {
  expect(() =>
    renderer.create(<Provider><div>hello</div></Provider>)
  ).toThrow();
});

test('store should be present in child\'s context', () => {
  class Child extends React.Component {
    render(){
      return (
        <div>
          {this.context.store.test}
        </div>
      );
    }
  }
  Child.contextTypes = {
    store: React.PropTypes.object.isRequired
  };
  const component = renderer.create(
    <Provider store={{test: 'toto'}}><Child /></Provider>
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
