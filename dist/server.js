'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

require('./promisify-all');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SessionServer = function () {
	function SessionServer() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
		(0, _classCallCheck3.default)(this, SessionServer);

		this.options = (0, _assign2.default)({

			readyTimeout: 10000,
			manualStart: false,
			sessionKey: 'session',
			userKey: 'user',
			tokenSize: 64,
			token: null,
			redisHost: 'localhost',
			redisPort: 6379,
			redisIndex: 0

		}, options);

		this.data = data;

		this.initRedis();

		if (!options.manualStart) {
			this.start();
		}
	}

	(0, _createClass3.default)(SessionServer, [{
		key: 'initRedis',
		value: function initRedis() {
			this.redis = _redis2.default.createClient({
				host: this.options.redisHost,
				port: this.options.redisPort
			});
			this.redis.select(this.options.redisIndex);
		}
	}, {
		key: 'start',
		value: function start() {
			var _this = this;

			this.ready = new _promise2.default(function (resolve, reject) {
				var timeout = setTimeout(function () {
					reject({ error: 'timeout' });
				}, _this.options.readyTimeout);

				_this.readyResolve = function () {
					clearTimeout(timeout);
					resolve.apply(undefined, arguments);
				};

				_this.readyReject = function () {
					clearTimeout(timeout);
					reject.apply(undefined, arguments);
				};
			});
			this.ready.catch(function () {
				//console.log('waiting openSession timeout');
			});
		}
	}, {
		key: 'open',
		value: function open(token, userCallback) {
			var _this2 = this;

			if (!token && this.options.token) {
				token = this.options.token;
			}
			var callback = function callback(err, token) {
				_this2.token = token;
				_this2.readyResolve(token);
				if (userCallback) {
					userCallback(err, token);
				}
			};
			if (token) {
				this.exists(token, function (err, exists) {
					if (!exists) {
						_this2.registerNewToken(callback);
					} else {
						_this2.storeSession(token, callback);
					}
				});
			} else {
				this.registerNewToken(callback);
			}
		}
	}, {
		key: 'setData',
		value: function setData(k, v, callback, transaction) {
			var _this3 = this;

			if ((typeof k === 'undefined' ? 'undefined' : (0, _typeof3.default)(k)) == 'object') {

				transaction = callback;
				callback = v;
				if (typeof callback != 'function') {
					transaction = callback;
					callback = null;
				}

				var multi = transaction || this.redis.multi();
				(0, _keys2.default)(k).forEach(function (key) {
					var val = v[key];
					multi.hset(_this3.options.sessionKey + ':' + _this3.token, k, (0, _stringify2.default)(val));
					_this3.data[key] = val;
				});
				multi.exec(callback);
				return;
			} else {
				var redisKey = this.options.sessionKey + ':' + this.token;
				var val = (0, _stringify2.default)(v);
				if (transaction) {
					transaction.hset(redisKey, k, val);
					if (callback) {
						transaction.exec(callback);
					}
				} else {
					this.redis.hset(redisKey, k, val, callback);
				}
				this.data[k] = v;
			}
		}
	}, {
		key: 'getData',
		value: function getData(k) {
			return this.data[k];
		}
	}, {
		key: 'exists',
		value: function exists(token, callback) {
			this.redis.sismember(this.options.sessionKey, token, function (err, exists) {
				callback(err, exists);
			});
		}
	}, {
		key: 'registerNewToken',
		value: function registerNewToken(callback) {
			var token = this.generateToken();
			var transaction = this.redis.multi();
			transaction.sadd('session', token);
			this.storeSession(token, callback, transaction);
		}
	}, {
		key: 'storeSession',
		value: function storeSession(token, callback, transaction) {

			if (!transaction) {
				transaction = this.redis.multi();
			}

			var data = this.data;

			(0, _keys2.default)(data).forEach(function (k) {
				transaction.hset('session:' + token, k, data[k]);
			});

			transaction.exec(function (err, replies) {
				callback(err, token);
			});
		}
	}, {
		key: 'generateToken',
		value: function generateToken() {
			return _crypto2.default.randomBytes(this.options.tokenSize).toString('base64');
		}
	}, {
		key: 'login',
		value: function () {
			var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(data) {
				var _this4 = this;

				var id, redisUserKey, transaction;
				return _regenerator2.default.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
								id = data.user_id;
								redisUserKey = this.options.userKey + ':' + id;
								transaction = this.redis.multi();
								_context2.next = 5;
								return this.redis.getAsync(redisUserKey, function () {
									var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(token) {
										var userSession;
										return _regenerator2.default.wrap(function _callee$(_context) {
											while (1) {
												switch (_context.prev = _context.next) {
													case 0:
														if (token) {
															_context.next = 5;
															break;
														}

														transaction.set(redisUserKey, _this4.token);
														_this4.setData(data, transaction);
														_context.next = 9;
														break;

													case 5:
														_context.next = 7;
														return _this4.redis.hgetAllAsync(redisUserKey, function (err, results) {
															return results;
														});

													case 7:
														userSession = _context.sent;

														console.log(userSession);

													case 9:
														_context.next = 11;
														return transaction.execAsync(function (err, results) {
															return results;
														});

													case 11:
														return _context.abrupt('return', _context.sent);

													case 12:
													case 'end':
														return _context.stop();
												}
											}
										}, _callee, _this4);
									}));

									return function (_x4) {
										return _ref2.apply(this, arguments);
									};
								}());

							case 5:
								return _context2.abrupt('return', _context2.sent);

							case 6:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, this);
			}));

			function login(_x3) {
				return _ref.apply(this, arguments);
			}

			return login;
		}()
	}]);
	return SessionServer;
}();

exports.default = SessionServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiU2Vzc2lvblNlcnZlciIsIm9wdGlvbnMiLCJkYXRhIiwicmVhZHlUaW1lb3V0IiwibWFudWFsU3RhcnQiLCJzZXNzaW9uS2V5IiwidXNlcktleSIsInRva2VuU2l6ZSIsInRva2VuIiwicmVkaXNIb3N0IiwicmVkaXNQb3J0IiwicmVkaXNJbmRleCIsImluaXRSZWRpcyIsInN0YXJ0IiwicmVkaXMiLCJjcmVhdGVDbGllbnQiLCJob3N0IiwicG9ydCIsInNlbGVjdCIsInJlYWR5IiwicmVzb2x2ZSIsInJlamVjdCIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiZXJyb3IiLCJyZWFkeVJlc29sdmUiLCJjbGVhclRpbWVvdXQiLCJyZWFkeVJlamVjdCIsImNhdGNoIiwidXNlckNhbGxiYWNrIiwiY2FsbGJhY2siLCJlcnIiLCJleGlzdHMiLCJyZWdpc3Rlck5ld1Rva2VuIiwic3RvcmVTZXNzaW9uIiwiayIsInYiLCJ0cmFuc2FjdGlvbiIsIm11bHRpIiwiZm9yRWFjaCIsImtleSIsInZhbCIsImhzZXQiLCJleGVjIiwicmVkaXNLZXkiLCJzaXNtZW1iZXIiLCJnZW5lcmF0ZVRva2VuIiwic2FkZCIsInJlcGxpZXMiLCJyYW5kb21CeXRlcyIsInRvU3RyaW5nIiwiaWQiLCJ1c2VyX2lkIiwicmVkaXNVc2VyS2V5IiwiZ2V0QXN5bmMiLCJzZXQiLCJzZXREYXRhIiwiaGdldEFsbEFzeW5jIiwicmVzdWx0cyIsInVzZXJTZXNzaW9uIiwiY29uc29sZSIsImxvZyIsImV4ZWNBc3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUVBOzs7O0lBRXFCQSxhO0FBQ3BCLDBCQUdDO0FBQUEsTUFGQUMsT0FFQSx1RUFGVSxFQUVWO0FBQUEsTUFEQUMsSUFDQSx1RUFESyxFQUNMO0FBQUE7O0FBQ0EsT0FBS0QsT0FBTCxHQUFlLHNCQUFjOztBQUU1QkUsaUJBQWMsS0FGYztBQUc1QkMsZ0JBQWEsS0FIZTtBQUk1QkMsZUFBWSxTQUpnQjtBQUs1QkMsWUFBUyxNQUxtQjtBQU01QkMsY0FBVyxFQU5pQjtBQU81QkMsVUFBTyxJQVBxQjtBQVE1QkMsY0FBVyxXQVJpQjtBQVM1QkMsY0FBVyxJQVRpQjtBQVU1QkMsZUFBWTs7QUFWZ0IsR0FBZCxFQVliVixPQVphLENBQWY7O0FBZUEsT0FBS0MsSUFBTCxHQUFZQSxJQUFaOztBQUVBLE9BQUtVLFNBQUw7O0FBRUEsTUFBRyxDQUFDWCxRQUFRRyxXQUFaLEVBQXdCO0FBQ3ZCLFFBQUtTLEtBQUw7QUFDQTtBQUVEOzs7OzhCQUNVO0FBQ1YsUUFBS0MsS0FBTCxHQUFhLGdCQUFNQyxZQUFOLENBQW1CO0FBQy9CQyxVQUFLLEtBQUtmLE9BQUwsQ0FBYVEsU0FEYTtBQUUvQlEsVUFBSyxLQUFLaEIsT0FBTCxDQUFhUztBQUZhLElBQW5CLENBQWI7QUFJQSxRQUFLSSxLQUFMLENBQVdJLE1BQVgsQ0FBa0IsS0FBS2pCLE9BQUwsQ0FBYVUsVUFBL0I7QUFDQTs7OzBCQUNNO0FBQUE7O0FBQ04sUUFBS1EsS0FBTCxHQUFhLHNCQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUM3QyxRQUFJQyxVQUFVQyxXQUFXLFlBQUk7QUFDNUJGLFlBQU8sRUFBQ0csT0FBTSxTQUFQLEVBQVA7QUFDQSxLQUZhLEVBRVosTUFBS3ZCLE9BQUwsQ0FBYUUsWUFGRCxDQUFkOztBQUlBLFVBQUtzQixZQUFMLEdBQW9CLFlBQVc7QUFDOUJDLGtCQUFhSixPQUFiO0FBQ0FGO0FBQ0EsS0FIRDs7QUFLQSxVQUFLTyxXQUFMLEdBQW1CLFlBQVc7QUFDN0JELGtCQUFhSixPQUFiO0FBQ0FEO0FBQ0EsS0FIRDtBQUlBLElBZFksQ0FBYjtBQWVBLFFBQUtGLEtBQUwsQ0FBV1MsS0FBWCxDQUFpQixZQUFZO0FBQzNCO0FBQ0QsSUFGRDtBQUdBOzs7dUJBQ0lwQixLLEVBQU9xQixZLEVBQWE7QUFBQTs7QUFDeEIsT0FBRyxDQUFDckIsS0FBRCxJQUFVLEtBQUtQLE9BQUwsQ0FBYU8sS0FBMUIsRUFBZ0M7QUFDL0JBLFlBQVEsS0FBS1AsT0FBTCxDQUFhTyxLQUFyQjtBQUNBO0FBQ0QsT0FBTXNCLFdBQVcsU0FBWEEsUUFBVyxDQUFDQyxHQUFELEVBQU12QixLQUFOLEVBQWM7QUFDOUIsV0FBS0EsS0FBTCxHQUFhQSxLQUFiO0FBQ0EsV0FBS2lCLFlBQUwsQ0FBa0JqQixLQUFsQjtBQUNBLFFBQUdxQixZQUFILEVBQWdCO0FBQ2ZBLGtCQUFhRSxHQUFiLEVBQWtCdkIsS0FBbEI7QUFDQTtBQUNELElBTkQ7QUFPQSxPQUFHQSxLQUFILEVBQVM7QUFDUixTQUFLd0IsTUFBTCxDQUFZeEIsS0FBWixFQUFtQixVQUFDdUIsR0FBRCxFQUFNQyxNQUFOLEVBQWU7QUFDakMsU0FBRyxDQUFDQSxNQUFKLEVBQVc7QUFDVixhQUFLQyxnQkFBTCxDQUFzQkgsUUFBdEI7QUFDQSxNQUZELE1BR0k7QUFDSCxhQUFLSSxZQUFMLENBQWtCMUIsS0FBbEIsRUFBeUJzQixRQUF6QjtBQUNBO0FBQ0QsS0FQRDtBQVNBLElBVkQsTUFXSTtBQUNILFNBQUtHLGdCQUFMLENBQXNCSCxRQUF0QjtBQUNBO0FBQ0Q7OzswQkFDT0ssQyxFQUFHQyxDLEVBQUdOLFEsRUFBVU8sVyxFQUFZO0FBQUE7O0FBQ25DLE9BQUcsUUFBT0YsQ0FBUCx1REFBT0EsQ0FBUCxNQUFZLFFBQWYsRUFBd0I7O0FBRXZCRSxrQkFBY1AsUUFBZDtBQUNBQSxlQUFXTSxDQUFYO0FBQ0EsUUFBRyxPQUFPTixRQUFQLElBQWtCLFVBQXJCLEVBQWdDO0FBQy9CTyxtQkFBY1AsUUFBZDtBQUNBQSxnQkFBVyxJQUFYO0FBQ0E7O0FBRUQsUUFBTVEsUUFBUUQsZUFBZSxLQUFLdkIsS0FBTCxDQUFXd0IsS0FBWCxFQUE3QjtBQUNBLHdCQUFZSCxDQUFaLEVBQWVJLE9BQWYsQ0FBdUIsVUFBQ0MsR0FBRCxFQUFPO0FBQzdCLFNBQU1DLE1BQU1MLEVBQUVJLEdBQUYsQ0FBWjtBQUNBRixXQUFNSSxJQUFOLENBQVcsT0FBS3pDLE9BQUwsQ0FBYUksVUFBYixHQUF3QixHQUF4QixHQUE0QixPQUFLRyxLQUE1QyxFQUFtRDJCLENBQW5ELEVBQXNELHlCQUFlTSxHQUFmLENBQXREO0FBQ0EsWUFBS3ZDLElBQUwsQ0FBVXNDLEdBQVYsSUFBaUJDLEdBQWpCO0FBQ0EsS0FKRDtBQUtBSCxVQUFNSyxJQUFOLENBQVdiLFFBQVg7QUFDQTtBQUNBLElBakJELE1Ba0JJO0FBQ0gsUUFBSWMsV0FBVyxLQUFLM0MsT0FBTCxDQUFhSSxVQUFiLEdBQXdCLEdBQXhCLEdBQTRCLEtBQUtHLEtBQWhEO0FBQ0EsUUFBSWlDLE1BQU0seUJBQWVMLENBQWYsQ0FBVjtBQUNBLFFBQUdDLFdBQUgsRUFBZTtBQUNkQSxpQkFBWUssSUFBWixDQUFpQkUsUUFBakIsRUFBMkJULENBQTNCLEVBQThCTSxHQUE5QjtBQUNBLFNBQUdYLFFBQUgsRUFBWTtBQUNYTyxrQkFBWU0sSUFBWixDQUFpQmIsUUFBakI7QUFDQTtBQUNELEtBTEQsTUFNSTtBQUNILFVBQUtoQixLQUFMLENBQVc0QixJQUFYLENBQWdCRSxRQUFoQixFQUEwQlQsQ0FBMUIsRUFBNkJNLEdBQTdCLEVBQWtDWCxRQUFsQztBQUNBO0FBQ0QsU0FBSzVCLElBQUwsQ0FBVWlDLENBQVYsSUFBZUMsQ0FBZjtBQUNBO0FBQ0Q7OzswQkFDT0QsQyxFQUFFO0FBQ1QsVUFBTyxLQUFLakMsSUFBTCxDQUFVaUMsQ0FBVixDQUFQO0FBQ0E7Ozt5QkFDTTNCLEssRUFBT3NCLFEsRUFBUztBQUN0QixRQUFLaEIsS0FBTCxDQUFXK0IsU0FBWCxDQUFxQixLQUFLNUMsT0FBTCxDQUFhSSxVQUFsQyxFQUE2Q0csS0FBN0MsRUFBbUQsVUFBQ3VCLEdBQUQsRUFBS0MsTUFBTCxFQUFjO0FBQ2hFRixhQUFTQyxHQUFULEVBQWFDLE1BQWI7QUFDQSxJQUZEO0FBR0E7OzttQ0FFZ0JGLFEsRUFBUztBQUN6QixPQUFNdEIsUUFBUSxLQUFLc0MsYUFBTCxFQUFkO0FBQ0EsT0FBTVQsY0FBYyxLQUFLdkIsS0FBTCxDQUFXd0IsS0FBWCxFQUFwQjtBQUNBRCxlQUFZVSxJQUFaLENBQWlCLFNBQWpCLEVBQTRCdkMsS0FBNUI7QUFDQSxRQUFLMEIsWUFBTCxDQUFrQjFCLEtBQWxCLEVBQXlCc0IsUUFBekIsRUFBbUNPLFdBQW5DO0FBQ0E7OzsrQkFDWTdCLEssRUFBT3NCLFEsRUFBVU8sVyxFQUFZOztBQUV6QyxPQUFHLENBQUNBLFdBQUosRUFBZ0I7QUFDZkEsa0JBQWMsS0FBS3ZCLEtBQUwsQ0FBV3dCLEtBQVgsRUFBZDtBQUNBOztBQUVELE9BQU1wQyxPQUFPLEtBQUtBLElBQWxCOztBQUVBLHVCQUFZQSxJQUFaLEVBQWtCcUMsT0FBbEIsQ0FBMEIsVUFBQ0osQ0FBRCxFQUFLO0FBQzlCRSxnQkFBWUssSUFBWixDQUFpQixhQUFXbEMsS0FBNUIsRUFBbUMyQixDQUFuQyxFQUFzQ2pDLEtBQUtpQyxDQUFMLENBQXRDO0FBQ0EsSUFGRDs7QUFJQUUsZUFBWU0sSUFBWixDQUFpQixVQUFTWixHQUFULEVBQWNpQixPQUFkLEVBQXNCO0FBQ3RDbEIsYUFBU0MsR0FBVCxFQUFjdkIsS0FBZDtBQUNBLElBRkQ7QUFJQTs7O2tDQUVjO0FBQ2QsVUFBTyxpQkFBT3lDLFdBQVAsQ0FBbUIsS0FBS2hELE9BQUwsQ0FBYU0sU0FBaEMsRUFBMkMyQyxRQUEzQyxDQUFvRCxRQUFwRCxDQUFQO0FBQ0E7Ozs7eUdBRVdoRCxJOzs7Ozs7OztBQUNMaUQsVSxHQUFLakQsS0FBS2tELE87QUFDVkMsb0IsR0FBZSxLQUFLcEQsT0FBTCxDQUFhSyxPQUFiLEdBQXFCLEdBQXJCLEdBQXlCNkMsRTtBQUN4Q2QsbUIsR0FBYyxLQUFLdkIsS0FBTCxDQUFXd0IsS0FBWCxFOztlQUVQLEtBQUt4QixLQUFMLENBQVd3QyxRQUFYLENBQW9CRCxZQUFwQjtBQUFBLDhGQUFrQyxpQkFBTzdDLEtBQVA7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBRTFDQSxLQUYwQztBQUFBO0FBQUE7QUFBQTs7QUFHN0M2QiwwQkFBWWtCLEdBQVosQ0FBZ0JGLFlBQWhCLEVBQThCLE9BQUs3QyxLQUFuQztBQUNBLHFCQUFLZ0QsT0FBTCxDQUFhdEQsSUFBYixFQUFtQm1DLFdBQW5CO0FBSjZDO0FBQUE7O0FBQUE7QUFBQTtBQUFBLHFCQVFyQixPQUFLdkIsS0FBTCxDQUFXMkMsWUFBWCxDQUF3QkosWUFBeEIsRUFBc0MsVUFBQ3RCLEdBQUQsRUFBTTJCLE9BQU47QUFBQSxzQkFBa0JBLE9BQWxCO0FBQUEsZUFBdEMsQ0FScUI7O0FBQUE7QUFRekNDLHlCQVJ5Qzs7QUFTN0NDLHNCQUFRQyxHQUFSLENBQVlGLFdBQVo7O0FBVDZDO0FBQUE7QUFBQSxxQkFhakN0QixZQUFZeUIsU0FBWixDQUFzQixVQUFDL0IsR0FBRCxFQUFNMkIsT0FBTixFQUFnQjtBQUNsRCxzQkFBT0EsT0FBUDtBQUNBLGVBRlksQ0FiaUM7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUFsQzs7QUFBQTtBQUFBO0FBQUE7QUFBQSxZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkE5Sk0xRCxhIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZWRpcyBmcm9tICdyZWRpcydcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJ1xuXG5pbXBvcnQgJy4vcHJvbWlzaWZ5LWFsbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2Vzc2lvblNlcnZlciB7XHRcblx0Y29uc3RydWN0b3IoXG5cdFx0b3B0aW9ucyA9IHt9LFxuXHRcdGRhdGE9e31cblx0KXtcdFx0XG5cdFx0dGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRcblx0XHRcdHJlYWR5VGltZW91dDogMTAwMDAsXG5cdFx0XHRtYW51YWxTdGFydDogZmFsc2UsXG5cdFx0XHRzZXNzaW9uS2V5OiAnc2Vzc2lvbicsXG5cdFx0XHR1c2VyS2V5OiAndXNlcicsXG5cdFx0XHR0b2tlblNpemU6IDY0LFxuXHRcdFx0dG9rZW46IG51bGwsXG5cdFx0XHRyZWRpc0hvc3Q6ICdsb2NhbGhvc3QnLFxuXHRcdFx0cmVkaXNQb3J0OiA2Mzc5LFxuXHRcdFx0cmVkaXNJbmRleDogMCxcblx0XHRcdFxuXHRcdH0sb3B0aW9ucyk7XG5cdFx0XG5cdFx0XG5cdFx0dGhpcy5kYXRhID0gZGF0YTtcblx0XHRcblx0XHR0aGlzLmluaXRSZWRpcygpO1xuXHRcdFxuXHRcdGlmKCFvcHRpb25zLm1hbnVhbFN0YXJ0KXtcblx0XHRcdHRoaXMuc3RhcnQoKTtcdFx0XHRcblx0XHR9XG5cdFx0XG5cdH1cblx0aW5pdFJlZGlzKCl7XG5cdFx0dGhpcy5yZWRpcyA9IHJlZGlzLmNyZWF0ZUNsaWVudCh7XG5cdFx0XHRob3N0OnRoaXMub3B0aW9ucy5yZWRpc0hvc3QsXG5cdFx0XHRwb3J0OnRoaXMub3B0aW9ucy5yZWRpc1BvcnQsXG5cdFx0fSk7XG5cdFx0dGhpcy5yZWRpcy5zZWxlY3QodGhpcy5vcHRpb25zLnJlZGlzSW5kZXgpO1xuXHR9XG5cdHN0YXJ0KCl7XG5cdFx0dGhpcy5yZWFkeSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGxldCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xuXHRcdFx0XHRyZWplY3Qoe2Vycm9yOid0aW1lb3V0J30pO1xuXHRcdFx0fSx0aGlzLm9wdGlvbnMucmVhZHlUaW1lb3V0KTtcblx0XHRcdFxuXHRcdFx0dGhpcy5yZWFkeVJlc29sdmUgPSAoLi4uYXJncyk9Pntcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdFx0XHRyZXNvbHZlKC4uLmFyZ3MpO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0dGhpcy5yZWFkeVJlamVjdCA9ICguLi5hcmdzKT0+e1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGltZW91dCk7XG5cdFx0XHRcdHJlamVjdCguLi5hcmdzKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cdFx0dGhpcy5yZWFkeS5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHQgLy9jb25zb2xlLmxvZygnd2FpdGluZyBvcGVuU2Vzc2lvbiB0aW1lb3V0Jyk7XG5cdFx0fSlcblx0fVxuXHRvcGVuKHRva2VuLCB1c2VyQ2FsbGJhY2spe1xuXHRcdGlmKCF0b2tlbiAmJiB0aGlzLm9wdGlvbnMudG9rZW4pe1xuXHRcdFx0dG9rZW4gPSB0aGlzLm9wdGlvbnMudG9rZW47XG5cdFx0fVxuXHRcdGNvbnN0IGNhbGxiYWNrID0gKGVyciwgdG9rZW4pPT57XG5cdFx0XHR0aGlzLnRva2VuID0gdG9rZW47XG5cdFx0XHR0aGlzLnJlYWR5UmVzb2x2ZSh0b2tlbik7XG5cdFx0XHRpZih1c2VyQ2FsbGJhY2spe1xuXHRcdFx0XHR1c2VyQ2FsbGJhY2soZXJyLCB0b2tlbik7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpZih0b2tlbil7XG5cdFx0XHR0aGlzLmV4aXN0cyh0b2tlbiwgKGVyciwgZXhpc3RzKT0+e1xuXHRcdFx0XHRpZighZXhpc3RzKXtcblx0XHRcdFx0XHR0aGlzLnJlZ2lzdGVyTmV3VG9rZW4oY2FsbGJhY2spO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2V7XG5cdFx0XHRcdFx0dGhpcy5zdG9yZVNlc3Npb24odG9rZW4sIGNhbGxiYWNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdHRoaXMucmVnaXN0ZXJOZXdUb2tlbihjYWxsYmFjayk7XG5cdFx0fVxuXHR9XG5cdHNldERhdGEoaywgdiwgY2FsbGJhY2ssIHRyYW5zYWN0aW9uKXtcblx0XHRpZih0eXBlb2YgayA9PSAnb2JqZWN0Jyl7XG5cdFx0XHRcblx0XHRcdHRyYW5zYWN0aW9uID0gY2FsbGJhY2s7XG5cdFx0XHRjYWxsYmFjayA9IHY7XG5cdFx0XHRpZih0eXBlb2YoY2FsbGJhY2spIT0nZnVuY3Rpb24nKXtcblx0XHRcdFx0dHJhbnNhY3Rpb24gPSBjYWxsYmFjaztcblx0XHRcdFx0Y2FsbGJhY2sgPSBudWxsO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb25zdCBtdWx0aSA9IHRyYW5zYWN0aW9uIHx8IHRoaXMucmVkaXMubXVsdGkoKTtcblx0XHRcdE9iamVjdC5rZXlzKGspLmZvckVhY2goKGtleSk9Pntcblx0XHRcdFx0Y29uc3QgdmFsID0gdltrZXldO1xuXHRcdFx0XHRtdWx0aS5oc2V0KHRoaXMub3B0aW9ucy5zZXNzaW9uS2V5Kyc6Jyt0aGlzLnRva2VuLCBrLCBKU09OLnN0cmluZ2lmeSh2YWwpKTtcblx0XHRcdFx0dGhpcy5kYXRhW2tleV0gPSB2YWw7XG5cdFx0XHR9KTtcblx0XHRcdG11bHRpLmV4ZWMoY2FsbGJhY2spO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0bGV0IHJlZGlzS2V5ID0gdGhpcy5vcHRpb25zLnNlc3Npb25LZXkrJzonK3RoaXMudG9rZW47XG5cdFx0XHRsZXQgdmFsID0gSlNPTi5zdHJpbmdpZnkodik7XG5cdFx0XHRpZih0cmFuc2FjdGlvbil7XG5cdFx0XHRcdHRyYW5zYWN0aW9uLmhzZXQocmVkaXNLZXksIGssIHZhbCk7XG5cdFx0XHRcdGlmKGNhbGxiYWNrKXtcblx0XHRcdFx0XHR0cmFuc2FjdGlvbi5leGVjKGNhbGxiYWNrKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0dGhpcy5yZWRpcy5oc2V0KHJlZGlzS2V5LCBrLCB2YWwsIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZGF0YVtrXSA9IHY7XG5cdFx0fVxuXHR9XG5cdGdldERhdGEoayl7XG5cdFx0cmV0dXJuIHRoaXMuZGF0YVtrXTtcblx0fVxuXHRleGlzdHModG9rZW4sIGNhbGxiYWNrKXtcblx0XHR0aGlzLnJlZGlzLnNpc21lbWJlcih0aGlzLm9wdGlvbnMuc2Vzc2lvbktleSx0b2tlbiwoZXJyLGV4aXN0cyk9Pntcblx0XHRcdGNhbGxiYWNrKGVycixleGlzdHMpO1xuXHRcdH0pO1xuXHR9XG5cdFxuXHRyZWdpc3Rlck5ld1Rva2VuKGNhbGxiYWNrKXtcblx0XHRjb25zdCB0b2tlbiA9IHRoaXMuZ2VuZXJhdGVUb2tlbigpO1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uID0gdGhpcy5yZWRpcy5tdWx0aSgpO1xuXHRcdHRyYW5zYWN0aW9uLnNhZGQoJ3Nlc3Npb24nLCB0b2tlbik7XG5cdFx0dGhpcy5zdG9yZVNlc3Npb24odG9rZW4sIGNhbGxiYWNrLCB0cmFuc2FjdGlvbik7XG5cdH1cblx0c3RvcmVTZXNzaW9uKHRva2VuLCBjYWxsYmFjaywgdHJhbnNhY3Rpb24pe1xuXHRcdFxuXHRcdGlmKCF0cmFuc2FjdGlvbil7XG5cdFx0XHR0cmFuc2FjdGlvbiA9IHRoaXMucmVkaXMubXVsdGkoKTtcblx0XHR9XG5cdFx0XG5cdFx0Y29uc3QgZGF0YSA9IHRoaXMuZGF0YTtcblx0XHRcblx0XHRPYmplY3Qua2V5cyhkYXRhKS5mb3JFYWNoKChrKT0+e1xuXHRcdFx0dHJhbnNhY3Rpb24uaHNldCgnc2Vzc2lvbjonK3Rva2VuLCBrLCBkYXRhW2tdKVxuXHRcdH0pO1xuXHRcdFxuXHRcdHRyYW5zYWN0aW9uLmV4ZWMoZnVuY3Rpb24oZXJyLCByZXBsaWVzKXtcblx0XHRcdGNhbGxiYWNrKGVyciwgdG9rZW4pO1xuXHRcdH0pO1xuXHRcdFxuXHR9XG5cdFxuXHRnZW5lcmF0ZVRva2VuKCl7XG5cdFx0cmV0dXJuIGNyeXB0by5yYW5kb21CeXRlcyh0aGlzLm9wdGlvbnMudG9rZW5TaXplKS50b1N0cmluZygnYmFzZTY0Jyk7XG5cdH1cblx0XG5cdGFzeW5jIGxvZ2luKGRhdGEpe1xuXHRcdGNvbnN0IGlkID0gZGF0YS51c2VyX2lkO1xuXHRcdGNvbnN0IHJlZGlzVXNlcktleSA9IHRoaXMub3B0aW9ucy51c2VyS2V5Kyc6JytpZDtcblx0XHRjb25zdCB0cmFuc2FjdGlvbiA9IHRoaXMucmVkaXMubXVsdGkoKTtcblx0XHRcblx0XHRyZXR1cm4gYXdhaXQgdGhpcy5yZWRpcy5nZXRBc3luYyhyZWRpc1VzZXJLZXksIGFzeW5jICh0b2tlbik9Pntcblx0XHRcdFxuXHRcdFx0aWYoIXRva2VuKXtcblx0XHRcdFx0dHJhbnNhY3Rpb24uc2V0KHJlZGlzVXNlcktleSwgdGhpcy50b2tlbik7XG5cdFx0XHRcdHRoaXMuc2V0RGF0YShkYXRhLCB0cmFuc2FjdGlvbik7XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHRcblx0XHRcdFx0bGV0IHVzZXJTZXNzaW9uID0gYXdhaXQgdGhpcy5yZWRpcy5oZ2V0QWxsQXN5bmMocmVkaXNVc2VyS2V5LCAoZXJyLCByZXN1bHRzKSA9PiByZXN1bHRzKTtcblx0XHRcdFx0Y29uc29sZS5sb2codXNlclNlc3Npb24pO1xuXHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYXdhaXQgdHJhbnNhY3Rpb24uZXhlY0FzeW5jKChlcnIsIHJlc3VsdHMpPT57XG5cdFx0XHRcdHJldHVybiByZXN1bHRzO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0XG5cdFx0fSk7XG5cdFx0XG5cdH1cbn1cbiJdfQ==