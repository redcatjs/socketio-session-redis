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
			this.redisClient = _redis2.default.createClient({
				host: this.options.redisHost,
				port: this.options.redisPort
			});
			this.redisClient.select(this.options.redisIndex);
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

				var multi = transaction || this.redisClient.multi();
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
					this.redisClient.hset(redisKey, k, val, callback);
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
			this.redisClient.sismember(this.options.sessionKey, token, function (err, exists) {
				callback(err, exists);
			});
		}
	}, {
		key: 'registerNewToken',
		value: function registerNewToken(callback) {
			var token = this.generateToken();
			var transaction = this.redisClient.multi();
			transaction.sadd('session', token);
			this.storeSession(token, callback, transaction);
		}
	}, {
		key: 'storeSession',
		value: function storeSession(token, callback, transaction) {

			if (!transaction) {
				transaction = this.redisClient.multi();
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
								transaction = this.redisClient.multi();
								_context2.next = 5;
								return this.redisClient.getAsync(redisUserKey, function () {
									var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(token) {
										return _regenerator2.default.wrap(function _callee$(_context) {
											while (1) {
												switch (_context.prev = _context.next) {
													case 0:

														if (!token) {
															transaction.set(redisUserKey, _this4.token);
															_this4.setData(data, transaction);
														} else {
															//TODO Merge current session with allready existing session for user
															//...

														}
														_context.next = 3;
														return transaction.execAsync(function (err, results) {
															return results;
														});

													case 3:
														return _context.abrupt('return', _context.sent);

													case 4:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiU2Vzc2lvblNlcnZlciIsIm9wdGlvbnMiLCJkYXRhIiwicmVhZHlUaW1lb3V0IiwibWFudWFsU3RhcnQiLCJzZXNzaW9uS2V5IiwidXNlcktleSIsInRva2VuU2l6ZSIsInRva2VuIiwicmVkaXNIb3N0IiwicmVkaXNQb3J0IiwicmVkaXNJbmRleCIsImluaXRSZWRpcyIsInN0YXJ0IiwicmVkaXNDbGllbnQiLCJjcmVhdGVDbGllbnQiLCJob3N0IiwicG9ydCIsInNlbGVjdCIsInJlYWR5IiwicmVzb2x2ZSIsInJlamVjdCIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiZXJyb3IiLCJyZWFkeVJlc29sdmUiLCJjbGVhclRpbWVvdXQiLCJyZWFkeVJlamVjdCIsImNhdGNoIiwidXNlckNhbGxiYWNrIiwiY2FsbGJhY2siLCJlcnIiLCJleGlzdHMiLCJyZWdpc3Rlck5ld1Rva2VuIiwic3RvcmVTZXNzaW9uIiwiayIsInYiLCJ0cmFuc2FjdGlvbiIsIm11bHRpIiwiZm9yRWFjaCIsImtleSIsInZhbCIsImhzZXQiLCJleGVjIiwicmVkaXNLZXkiLCJzaXNtZW1iZXIiLCJnZW5lcmF0ZVRva2VuIiwic2FkZCIsInJlcGxpZXMiLCJyYW5kb21CeXRlcyIsInRvU3RyaW5nIiwiaWQiLCJ1c2VyX2lkIiwicmVkaXNVc2VyS2V5IiwiZ2V0QXN5bmMiLCJzZXQiLCJzZXREYXRhIiwiZXhlY0FzeW5jIiwicmVzdWx0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7Ozs7O0lBS3FCQSxhO0FBQ3BCLDBCQUdDO0FBQUEsTUFGQUMsT0FFQSx1RUFGVSxFQUVWO0FBQUEsTUFEQUMsSUFDQSx1RUFESyxFQUNMO0FBQUE7O0FBQ0EsT0FBS0QsT0FBTCxHQUFlLHNCQUFjOztBQUU1QkUsaUJBQWMsS0FGYztBQUc1QkMsZ0JBQWEsS0FIZTtBQUk1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QW5DO0FBQ0Esc0JBQUtnRCxPQUFMLENBQWF0RCxJQUFiLEVBQW1CbUMsV0FBbkI7QUFDQSxlQUhELE1BSUk7QUFDSDtBQUNBOztBQUVBO0FBVm1EO0FBQUEscUJBV3ZDQSxZQUFZb0IsU0FBWixDQUFzQixVQUFDMUIsR0FBRCxFQUFNMkIsT0FBTixFQUFnQjtBQUNsRCxzQkFBT0EsT0FBUDtBQUNBLGVBRlksQ0FYdUM7O0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUF4Qzs7QUFBQTtBQUFBO0FBQUE7QUFBQSxZOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkE5Sk0xRCxhIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCByZWRpcyBmcm9tICdyZWRpcydcbmltcG9ydCBjcnlwdG8gZnJvbSAnY3J5cHRvJ1xuXG5cblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZXNzaW9uU2VydmVyIHtcdFxuXHRjb25zdHJ1Y3Rvcihcblx0XHRvcHRpb25zID0ge30sXG5cdFx0ZGF0YT17fVxuXHQpe1x0XHRcblx0XHR0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdFxuXHRcdFx0cmVhZHlUaW1lb3V0OiAxMDAwMCxcblx0XHRcdG1hbnVhbFN0YXJ0OiBmYWxzZSxcblx0XHRcdHNlc3Npb25LZXk6ICdzZXNzaW9uJyxcblx0XHRcdHVzZXJLZXk6ICd1c2VyJyxcblx0XHRcdHRva2VuU2l6ZTogNjQsXG5cdFx0XHR0b2tlbjogbnVsbCxcblx0XHRcdHJlZGlzSG9zdDogJ2xvY2FsaG9zdCcsXG5cdFx0XHRyZWRpc1BvcnQ6IDYzNzksXG5cdFx0XHRyZWRpc0luZGV4OiAwLFxuXHRcdFx0XG5cdFx0fSxvcHRpb25zKTtcblx0XHRcblx0XHRcblx0XHR0aGlzLmRhdGEgPSBkYXRhO1xuXHRcdFxuXHRcdHRoaXMuaW5pdFJlZGlzKCk7XG5cdFx0XG5cdFx0aWYoIW9wdGlvbnMubWFudWFsU3RhcnQpe1xuXHRcdFx0dGhpcy5zdGFydCgpO1x0XHRcdFxuXHRcdH1cblx0XHRcblx0fVxuXHRpbml0UmVkaXMoKXtcblx0XHR0aGlzLnJlZGlzQ2xpZW50ID0gcmVkaXMuY3JlYXRlQ2xpZW50KHtcblx0XHRcdGhvc3Q6dGhpcy5vcHRpb25zLnJlZGlzSG9zdCxcblx0XHRcdHBvcnQ6dGhpcy5vcHRpb25zLnJlZGlzUG9ydCxcblx0XHR9KTtcblx0XHR0aGlzLnJlZGlzQ2xpZW50LnNlbGVjdCh0aGlzLm9wdGlvbnMucmVkaXNJbmRleCk7XG5cdH1cblx0c3RhcnQoKXtcblx0XHR0aGlzLnJlYWR5ID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0bGV0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT57XG5cdFx0XHRcdHJlamVjdCh7ZXJyb3I6J3RpbWVvdXQnfSk7XG5cdFx0XHR9LHRoaXMub3B0aW9ucy5yZWFkeVRpbWVvdXQpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLnJlYWR5UmVzb2x2ZSA9ICguLi5hcmdzKT0+e1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGltZW91dCk7XG5cdFx0XHRcdHJlc29sdmUoLi4uYXJncyk7XG5cdFx0XHR9O1xuXHRcdFx0XG5cdFx0XHR0aGlzLnJlYWR5UmVqZWN0ID0gKC4uLmFyZ3MpPT57XG5cdFx0XHRcdGNsZWFyVGltZW91dCh0aW1lb3V0KTtcblx0XHRcdFx0cmVqZWN0KC4uLmFyZ3MpO1xuXHRcdFx0fTtcblx0XHR9KTtcblx0XHR0aGlzLnJlYWR5LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdCAvL2NvbnNvbGUubG9nKCd3YWl0aW5nIG9wZW5TZXNzaW9uIHRpbWVvdXQnKTtcblx0XHR9KVxuXHR9XG5cdG9wZW4odG9rZW4sIHVzZXJDYWxsYmFjayl7XG5cdFx0aWYoIXRva2VuICYmIHRoaXMub3B0aW9ucy50b2tlbil7XG5cdFx0XHR0b2tlbiA9IHRoaXMub3B0aW9ucy50b2tlbjtcblx0XHR9XG5cdFx0Y29uc3QgY2FsbGJhY2sgPSAoZXJyLCB0b2tlbik9Pntcblx0XHRcdHRoaXMudG9rZW4gPSB0b2tlbjtcblx0XHRcdHRoaXMucmVhZHlSZXNvbHZlKHRva2VuKTtcblx0XHRcdGlmKHVzZXJDYWxsYmFjayl7XG5cdFx0XHRcdHVzZXJDYWxsYmFjayhlcnIsIHRva2VuKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGlmKHRva2VuKXtcblx0XHRcdHRoaXMuZXhpc3RzKHRva2VuLCAoZXJyLCBleGlzdHMpPT57XG5cdFx0XHRcdGlmKCFleGlzdHMpe1xuXHRcdFx0XHRcdHRoaXMucmVnaXN0ZXJOZXdUb2tlbihjYWxsYmFjayk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHR0aGlzLnN0b3JlU2Vzc2lvbih0b2tlbiwgY2FsbGJhY2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0dGhpcy5yZWdpc3Rlck5ld1Rva2VuKGNhbGxiYWNrKTtcblx0XHR9XG5cdH1cblx0c2V0RGF0YShrLCB2LCBjYWxsYmFjaywgdHJhbnNhY3Rpb24pe1xuXHRcdGlmKHR5cGVvZiBrID09ICdvYmplY3QnKXtcblx0XHRcdFxuXHRcdFx0dHJhbnNhY3Rpb24gPSBjYWxsYmFjaztcblx0XHRcdGNhbGxiYWNrID0gdjtcblx0XHRcdGlmKHR5cGVvZihjYWxsYmFjaykhPSdmdW5jdGlvbicpe1xuXHRcdFx0XHR0cmFuc2FjdGlvbiA9IGNhbGxiYWNrO1xuXHRcdFx0XHRjYWxsYmFjayA9IG51bGw7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGNvbnN0IG11bHRpID0gdHJhbnNhY3Rpb24gfHwgdGhpcy5yZWRpc0NsaWVudC5tdWx0aSgpO1xuXHRcdFx0T2JqZWN0LmtleXMoaykuZm9yRWFjaCgoa2V5KT0+e1xuXHRcdFx0XHRjb25zdCB2YWwgPSB2W2tleV07XG5cdFx0XHRcdG11bHRpLmhzZXQodGhpcy5vcHRpb25zLnNlc3Npb25LZXkrJzonK3RoaXMudG9rZW4sIGssIEpTT04uc3RyaW5naWZ5KHZhbCkpO1xuXHRcdFx0XHR0aGlzLmRhdGFba2V5XSA9IHZhbDtcblx0XHRcdH0pO1xuXHRcdFx0bXVsdGkuZXhlYyhjYWxsYmFjayk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHRsZXQgcmVkaXNLZXkgPSB0aGlzLm9wdGlvbnMuc2Vzc2lvbktleSsnOicrdGhpcy50b2tlbjtcblx0XHRcdGxldCB2YWwgPSBKU09OLnN0cmluZ2lmeSh2KTtcblx0XHRcdGlmKHRyYW5zYWN0aW9uKXtcblx0XHRcdFx0dHJhbnNhY3Rpb24uaHNldChyZWRpc0tleSwgaywgdmFsKTtcblx0XHRcdFx0aWYoY2FsbGJhY2spe1xuXHRcdFx0XHRcdHRyYW5zYWN0aW9uLmV4ZWMoY2FsbGJhY2spO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNle1xuXHRcdFx0XHR0aGlzLnJlZGlzQ2xpZW50LmhzZXQocmVkaXNLZXksIGssIHZhbCwgY2FsbGJhY2spO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5kYXRhW2tdID0gdjtcblx0XHR9XG5cdH1cblx0Z2V0RGF0YShrKXtcblx0XHRyZXR1cm4gdGhpcy5kYXRhW2tdO1xuXHR9XG5cdGV4aXN0cyh0b2tlbiwgY2FsbGJhY2spe1xuXHRcdHRoaXMucmVkaXNDbGllbnQuc2lzbWVtYmVyKHRoaXMub3B0aW9ucy5zZXNzaW9uS2V5LHRva2VuLChlcnIsZXhpc3RzKT0+e1xuXHRcdFx0Y2FsbGJhY2soZXJyLGV4aXN0cyk7XG5cdFx0fSk7XG5cdH1cblx0XG5cdHJlZ2lzdGVyTmV3VG9rZW4oY2FsbGJhY2spe1xuXHRcdGNvbnN0IHRva2VuID0gdGhpcy5nZW5lcmF0ZVRva2VuKCk7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb24gPSB0aGlzLnJlZGlzQ2xpZW50Lm11bHRpKCk7XG5cdFx0dHJhbnNhY3Rpb24uc2FkZCgnc2Vzc2lvbicsIHRva2VuKTtcblx0XHR0aGlzLnN0b3JlU2Vzc2lvbih0b2tlbiwgY2FsbGJhY2ssIHRyYW5zYWN0aW9uKTtcblx0fVxuXHRzdG9yZVNlc3Npb24odG9rZW4sIGNhbGxiYWNrLCB0cmFuc2FjdGlvbil7XG5cdFx0XG5cdFx0aWYoIXRyYW5zYWN0aW9uKXtcblx0XHRcdHRyYW5zYWN0aW9uID0gdGhpcy5yZWRpc0NsaWVudC5tdWx0aSgpO1xuXHRcdH1cblx0XHRcblx0XHRjb25zdCBkYXRhID0gdGhpcy5kYXRhO1xuXHRcdFxuXHRcdE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGspPT57XG5cdFx0XHR0cmFuc2FjdGlvbi5oc2V0KCdzZXNzaW9uOicrdG9rZW4sIGssIGRhdGFba10pXG5cdFx0fSk7XG5cdFx0XG5cdFx0dHJhbnNhY3Rpb24uZXhlYyhmdW5jdGlvbihlcnIsIHJlcGxpZXMpe1xuXHRcdFx0Y2FsbGJhY2soZXJyLCB0b2tlbik7XG5cdFx0fSk7XG5cdFx0XG5cdH1cblx0XG5cdGdlbmVyYXRlVG9rZW4oKXtcblx0XHRyZXR1cm4gY3J5cHRvLnJhbmRvbUJ5dGVzKHRoaXMub3B0aW9ucy50b2tlblNpemUpLnRvU3RyaW5nKCdiYXNlNjQnKTtcblx0fVxuXHRcblx0YXN5bmMgbG9naW4oZGF0YSl7XG5cdFx0Y29uc3QgaWQgPSBkYXRhLnVzZXJfaWQ7XG5cdFx0Y29uc3QgcmVkaXNVc2VyS2V5ID0gdGhpcy5vcHRpb25zLnVzZXJLZXkrJzonK2lkO1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uID0gdGhpcy5yZWRpc0NsaWVudC5tdWx0aSgpO1xuXHRcdFxuXHRcdHJldHVybiBhd2FpdCB0aGlzLnJlZGlzQ2xpZW50LmdldEFzeW5jKHJlZGlzVXNlcktleSwgYXN5bmMgKHRva2VuKT0+e1xuXHRcdFx0XG5cdFx0XHRpZighdG9rZW4pe1xuXHRcdFx0XHR0cmFuc2FjdGlvbi5zZXQocmVkaXNVc2VyS2V5LCB0aGlzLnRva2VuKTtcblx0XHRcdFx0dGhpcy5zZXREYXRhKGRhdGEsIHRyYW5zYWN0aW9uKTtcblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdC8vVE9ETyBNZXJnZSBjdXJyZW50IHNlc3Npb24gd2l0aCBhbGxyZWFkeSBleGlzdGluZyBzZXNzaW9uIGZvciB1c2VyXG5cdFx0XHRcdC8vLi4uXG5cdFx0XHRcdFxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGF3YWl0IHRyYW5zYWN0aW9uLmV4ZWNBc3luYygoZXJyLCByZXN1bHRzKT0+e1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0cztcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0fSk7XG5cdFx0XG5cdH1cbn1cbiJdfQ==