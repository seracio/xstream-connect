// @flow
import PropTypes from 'prop-types';
import React from 'react';

class Provider extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.store = props.store;
  }

  getChildContext() {
    return { store: this.store };
  }

  render(){
    return React.Children.only(this.props.children);
  }
}

Provider.propTypes = {
  store: PropTypes.object.isRequired,
};

Provider.childContextTypes = {
  store: PropTypes.object.isRequired,
};

export default Provider;
