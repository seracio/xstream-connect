import _ from 'lodash/fp';
import PropTypes from 'prop-types';
import React from 'react';
import renderer from 'react-test-renderer';
import xs from 'xstream';
import connect from './connect';
import Provider from './Provider';

class MyComponent extends React.Component {
    render() {
        return <div>hello</div>;
    }
}

test('connect: should return a function', () => {
    expect(typeof connect(_.identity)).toBe('function');
});

test('connect: combinator param should be mandatory', () => {
    expect(connect()).toThrow();
});

test('connect: combinator param should be a function', () => {
    expect(connect('toto')).toThrow();
});

test('connect: combinator param should return a valid stream', () => {
    // a simple store
    const store = { once: xs.of('tick') };

    // we do not return a stream
    expect(() => {
        const MyComponentWrapped = connect(_.noop)(MyComponent);
        renderer.create(
            <Provider store={store}>
                <MyComponentWrapped />
            </Provider>
        );
    }).toThrow();

    // we return a stream but not with a valid value
    expect(() => {
        const MyComponentWrapped = connect(_.get('once'))(MyComponent);
        renderer.create(
            <Provider store={store}>
                <MyComponentWrapped />
            </Provider>
        );
    }).toThrow();

    // stream with valid value
    expect(() => {
        const MyComponentWrapped = connect(state => state.once.map(val => ({ tick: val })))(
            MyComponent
        );
        renderer.create(
            <Provider store={store}>
                <MyComponentWrapped />
            </Provider>
        );
    }).not.toThrow();
});

test('Connect component: should be a React component', () => {
    expect(typeof connect(_.identity)(MyComponent)).toBe('function');
});

test('Connect component: should render false when state.go === false', () => {
    const store = { none: xs.never() };
    const MyComponentWrapped = connect(state => state.none.map(val => ({ none: val })))(
        MyComponent
    );
    class App extends React.Component {
        render() {
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
    const store = { once: xs.of(1) };
    const MyComponentWrapped = connect(state => state.once.map(once => ({ once })))(MyComponent);
    class App extends React.Component {
        render() {
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
    const store = { hello$: xs.of('world') };
    class MyOtherComponent extends React.Component {
        render() {
            return (
                <div>
                    {this.props.hello}
                </div>
            );
        }
    }
    MyOtherComponent.propTypes = {
        hello: PropTypes.string.isRequired
    };
    const MyComponentWrapped = connect(state => state.hello$.map(hello => ({ hello })))(
        MyOtherComponent
    );
    class App extends React.Component {
        render() {
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

test.skip('Connect component: should set state when store values changed', () => {});
