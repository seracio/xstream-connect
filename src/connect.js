// @flow
import _ from 'lodash/fp';
import React from 'react';
import xs from 'xstream';

const mapWithIndex = _.map.convert({cap: false});

const connect = storeToPropsFunc => WrappedComponent => {

  if(typeof(storeToPropsFunc) !== 'function'){
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
      this.order = _.keys(this.fragment);
      // initiate the state
      // to null
      this.state = _.mapValues(
        _.constant(null),
        this.fragment
      );
    }

    componentDidMount(){
      this.listen();
    }

    listen() {
      xs.combine(..._.map(key => this.fragment[key], this.order))
        .addListener({
          next: values => {
            this.go = true;
            const state = _.flow(
              mapWithIndex((value, index) => ({ key: this.order[index], value })),
              _.keyBy(_.get('key')),
              _.mapValues(_.get('value'))
            )(values);
            this.setState(state);
          }
        });
    }

    render() {
      const propsToTransfer = {...this.props, ...this.state};
      return this.go && <WrappedComponent {...propsToTransfer}/>;
    }
  }
  Connect.contextTypes = {
    store: React.PropTypes.object.isRequired,
  };

  return Connect;
};

export default connect;
