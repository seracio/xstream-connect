'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _get2 = require('lodash/fp/get');

var _get3 = _interopRequireDefault(_get2);

var _keyBy2 = require('lodash/fp/keyBy');

var _keyBy3 = _interopRequireDefault(_keyBy2);

var _flow2 = require('lodash/fp/flow');

var _flow3 = _interopRequireDefault(_flow2);

var _constant2 = require('lodash/fp/constant');

var _constant3 = _interopRequireDefault(_constant2);

var _mapValues2 = require('lodash/fp/mapValues');

var _mapValues3 = _interopRequireDefault(_mapValues2);

var _keys2 = require('lodash/fp/keys');

var _keys3 = _interopRequireDefault(_keys2);

var _map2 = require('lodash/fp/map');

var _map3 = _interopRequireDefault(_map2);

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mapWithIndex = _map3.default.convert({ cap: false });

var connect = function connect(storeToPropsFunc) {
  return function (WrappedComponent) {
    var Connect = function (_React$Component) {
      _inherits(Connect, _React$Component);

      function Connect(props, context) {
        _classCallCheck(this, Connect);

        // flag
        var _this = _possibleConstructorReturn(this, (Connect.__proto__ || Object.getPrototypeOf(Connect)).call(this, props, context));

        _this.go = false;
        // the fragment of the store we'll listen
        _this.fragment = storeToPropsFunc(_this.context.store);
        // order
        // needed for the listen method
        _this.order = (0, _keys3.default)(_this.fragment);
        // initiate the state
        // to null
        _this.state = (0, _mapValues3.default)((0, _constant3.default)(null), _this.fragment);
        return _this;
      }

      _createClass(Connect, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
          this.listen();
        }
      }, {
        key: 'listen',
        value: function listen() {
          var _this2 = this;

          _xstream2.default.combine.apply(_xstream2.default, _toConsumableArray((0, _map3.default)(function (key) {
            return _this2.fragment[key];
          }, this.order))).addListener({
            next: function next(values) {
              _this2.go = true;
              var state = (0, _flow3.default)(mapWithIndex(function (value, index) {
                return { key: _this2.order[index], value: value };
              }), (0, _keyBy3.default)((0, _get3.default)('key')), (0, _mapValues3.default)((0, _get3.default)('value')))(values);
              _this2.setState(state);
            }
          });
        }
      }, {
        key: 'render',
        value: function render() {
          var propsToTransfer = _extends({}, this.props, this.state);
          return this.go ? _react2.default.createElement(WrappedComponent, propsToTransfer) : _react2.default.createElement(
            'div',
            null,
            'waiting'
          );
        }
      }]);

      return Connect;
    }(_react2.default.Component);

    Connect.contextTypes = {
      store: _react2.default.PropTypes.object.isRequired
    };

    return Connect;
  };
};

exports.default = connect;