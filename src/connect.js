// @flow
import PropTypes from 'prop-types';
import React from 'react';

type State = { [key: string]: any };

const connect = (combinator: Function) => (WrappedComponent: any) => {
    if (typeof combinator !== 'function') {
        throw new Error('xstream-connect: connect needs a combinator function as parameter');
    }

    class Connect extends React.Component {
        // flag to launch the first
        // rendering of the encapsulated component
        go: boolean;
        // state declaration for flow
        state: State;
        // listener
        listener: { [key: string]: Function };
        // stream
        stream: Function;

        constructor(props: Object, context: Object) {
            super(props, context);
            // there will be no rendering of
            // the encapsulated component
            // before the first tick
            this.go = false;
            // empty state
            this.state = {};
        }

        componentDidMount() {
            this.stream = combinator(this.context.store);
            if (
                typeof this.stream === 'undefined' ||
                typeof this.stream.addListener !== 'function'
            ) {
                throw new Error('xstream-connect: combinator should return a Stream');
            }
            this.listener = {
                next: state => {
                    if (!(state instanceof Object) || Object.keys(state) === 0) {
                        throw new Error(
                            'xstream-connect: combinator should return a Stream of key => values'
                        );
                    }
                    this.go = true;
                    this.setState(state);
                }
            };
            this.listener = this.stream.addListener(this.listener);
        }

        componentWillUnmount() {
            this.stream.removeListener(this.listener);
        }

        render() {
            // we pass the applicative props and inject the HOC state
            // too bad if there are conflicts
            const propsToTransfer = { ...this.props, ...this.state };
            return this.go ? <WrappedComponent {...propsToTransfer} /> : null;
        }
    }

    Connect.contextTypes = {
        store: PropTypes.object.isRequired
    };

    return Connect;
};

export default connect;
