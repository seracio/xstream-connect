import PropTypes from 'prop-types';
import React from 'react';

//      
var connect = function (combinator          ) { return function (WrappedComponent     , WaitingComponent) {
    if ( WaitingComponent === void 0 ) WaitingComponent      = null;

    if (typeof combinator !== 'function') {
        throw new Error('xstream-connect: connect needs a combinator function as parameter');
    }

    var Connect = (function (superclass) {
        function Connect(props        , context        ) {
            superclass.call(this, props, context);
            // there will be no rendering of
            // the encapsulated component
            // before the first tick
            this.go = false;
            // empty state
            this.state = {};
        }

        if ( superclass ) Connect.__proto__ = superclass;
        Connect.prototype = Object.create( superclass && superclass.prototype );
        Connect.prototype.constructor = Connect;

        Connect.prototype.componentDidMount = function componentDidMount () {
            var this$1 = this;

            this.stream = combinator(this.context.store);
            if (
                typeof this.stream === 'undefined' ||
                typeof this.stream.addListener !== 'function'
            ) {
                throw new Error('xstream-connect: combinator should return a Stream');
            }
            this.listener = {
                next: function (state) {
                    if (!(state instanceof Object) || Object.keys(state) === 0) {
                        throw new Error(
                            'xstream-connect: combinator should return a Stream of key => values'
                        );
                    }
                    this$1.go = true;
                    this$1.setState(state);
                }
            };
            this.stream.addListener(this.listener);
        };

        Connect.prototype.componentWillUnmount = function componentWillUnmount () {
            this.stream.removeListener(this.listener);
        };

        Connect.prototype.render = function render () {
            // we pass the applicative props and inject the HOC state
            // too bad if there are conflicts
            var propsToTransfer = Object.assign({}, this.props, this.state);
            if (this.go) {
                return React.createElement( WrappedComponent, propsToTransfer);
            } else {
                return !!WaitingComponent ? React.createElement( WaitingComponent, this.props) : null;
            }
        };

        return Connect;
    }(React.Component));

    Connect.contextTypes = {
        store: PropTypes.object.isRequired
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
  store: PropTypes.object.isRequired,
};

Provider.childContextTypes = {
  store: PropTypes.object.isRequired,
};

export { connect, Provider };
