// @flow
import _ from 'lodash/fp';
import React from 'react';
import xs from 'xstream';

const keyByWithIndex = _.keyBy.convert({cap: false});

const connect = storeToPropsFunc => WrappedComponent => {
  class Connect extends React.Component {
    constructor(props, context) {
      super(props, context);
      // flag
      this.go = false;
      // the fragment of the store we'll listen
      this.fragment = storeToPropsFunc(this.context.store);
      // order
      // needed for the listen method
      this.order = _.keys(this.fragment);
      // initiate the state
      // to null
      this.state = _.mapValues(
        _.constant(null),
        this.fragment
      );
      this.listen();
    }

    listen() {
      xs.combine(..._.map(key => this.fragment[key], this.order))
        .addListener(values => {
          this.go = true;
          this.setState(keyByWithIndex((value, index) => this.order[index], values));
        });
    }

    render() {
      return this.go
        ? <WrappedComponent {{...this.props, ...this.state}}/>
        : <div>waiting</div>;
    }

  }
  Connect.contextTypes = {
    store: React.PropTypes.object.isRequired,
  };
  return WrappedComponent;
};

export default connect;
