import _ from 'lodash/fp';
import React from 'react';
import xs from 'xstream';

//      
var mapWithIndex = _.map.convert({cap: false});

var connect = function (storeToPropsFunc) { return function (WrappedComponent) {

  if(typeof(storeToPropsFunc) !== 'function'){
    throw new Error('xstream-connect: connect needs a function storeToPropsFunc as parameter');
  }

  var Connect = (function (superclass) {
    function Connect(props, context) {
      superclass.call(this, props, context);
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

    if ( superclass ) Connect.__proto__ = superclass;
    Connect.prototype = Object.create( superclass && superclass.prototype );
    Connect.prototype.constructor = Connect;

    Connect.prototype.componentDidMount = function componentDidMount (){
      this.listen();
    };

    Connect.prototype.listen = function listen () {
      var this$1 = this;

      xs.combine.apply(xs, _.map(function (key) { return this$1.fragment[key]; }, this.order))
        .addListener({
          next: function (values) {
            this$1.go = true;
            var state = _.flow(
              mapWithIndex(function (value, index) { return ({ key: this$1.order[index], value: value }); }),
              _.keyBy(_.get('key')),
              _.mapValues(_.get('value'))
            )(values);
            this$1.setState(state);
          }
        });
    };

    Connect.prototype.render = function render () {
      var propsToTransfer = Object.assign({}, this.props, this.state);
      return this.go && React.createElement( WrappedComponent, propsToTransfer);
    };

    return Connect;
  }(React.Component));
  Connect.contextTypes = {
    store: React.PropTypes.object.isRequired,
  };

  return Connect;
}; };

//      
var Provider = (function (superclass) {
  function Provider(props, context) {
    superclass.call(this, props, context);
    this.store = props.store;
  }

  if ( superclass ) Provider.__proto__ = superclass;
  Provider.prototype = Object.create( superclass && superclass.prototype );
  Provider.prototype.constructor = Provider;

  Provider.prototype.getChildContext = function getChildContext () {
    return { store: this.store };
  };

  Provider.prototype.render = function render (){
    return React.Children.only(this.props.children);
  };

  return Provider;
}(React.Component));

Provider.propTypes = {
  store: React.PropTypes.object.isRequired,
};

Provider.childContextTypes = {
  store: React.PropTypes.object.isRequired,
};

export { connect, Provider };
