// @flow
import PropTypes from 'prop-types';
import React from 'react';
import xs from 'xstream';

const connect = (storeToPropsFunc, combinator) => WrappedComponent => {

  if (typeof(storeToPropsFunc) !== 'function') {
    throw new Error('xstream-connect: connect needs a function storeToPropsFunc as parameter');
  }

  class Connect extends React.Component {
    constructor(props, context) {
      super(props, context);
      // flag
      this.go = false;
      // the fragment of the store we'll listen
      this.fragment = storeToPropsFunc(this.context.store);
      // order
      // needed for the listen method
      this.order = Object.keys(this.fragment);
      // initiate the state
      // to null
      this.state = this
        .order
        .reduce(
          (acc, key) => ({
            ...acc,
            [key]: null
          }),
          {}
        );
    }

    componentDidMount() {
      this.listen();
    }

    listen() {
      // a combine on all streams
      xs.combine(...this.order.map(key => this.fragment[key]))
        .addListener({
          next: values => {
            // render is OK
            this.go = true;
            // update the state
            const state = values.reduce(
              (acc, value, index) => ({ ...acc, [this.order[index]]: value }),
              {}
            );
            this.setState(state);
          }
        });
    }

    render() {
      const propsToTransfer = { ...this.props, ...this.state };
      return this.go && <WrappedComponent {...propsToTransfer}/>;
    }
  }

  Connect.contextTypes = {
    store: PropTypes.object.isRequired,
  };

  return Connect;
};

export default connect;
