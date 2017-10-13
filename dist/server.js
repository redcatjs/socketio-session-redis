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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiU2Vzc2lvblNlcnZlciIsIm9wdGlvbnMiLCJkYXRhIiwicmVhZHlUaW1lb3V0IiwibWFudWFsU3RhcnQiLCJzZXNzaW9uS2V5IiwidXNlcktleSIsInRva2VuU2l6ZSIsInRva2VuIiwicmVkaXNIb3N0IiwicmVkaXNQb3J0IiwicmVkaXNJbmRleCIsImluaXRSZWRpcyIsInN0YXJ0IiwicmVkaXNDbGllbnQiLCJjcmVhdGVDbGllbnQiLCJob3N0IiwicG9ydCIsInNlbGVjdCIsInJlYWR5IiwicmVzb2x2ZSIsInJlamVjdCIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiZXJyb3IiLCJyZWFkeVJlc29sdmUiLCJjbGVhclRpbWVvdXQiLCJyZWFkeVJlamVjdCIsInVzZXJDYWxsYmFjayIsImNhbGxiYWNrIiwiZXJyIiwiZXhpc3RzIiwicmVnaXN0ZXJOZXdUb2tlbiIsInN0b3JlU2Vzc2lvbiIsImsiLCJ2IiwidHJhbnNhY3Rpb24iLCJtdWx0aSIsImZvckVhY2giLCJrZXkiLCJ2YWwiLCJoc2V0IiwiZXhlYyIsInJlZGlzS2V5Iiwic2lzbWVtYmVyIiwiZ2VuZXJhdGVUb2tlbiIsInNhZGQiLCJyZXBsaWVzIiwicmFuZG9tQnl0ZXMiLCJ0b1N0cmluZyIsImlkIiwidXNlcl9pZCIsInJlZGlzVXNlcktleSIsImdldEFzeW5jIiwic2V0Iiwic2V0RGF0YSIsImV4ZWNBc3luYyIsInJlc3VsdHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7OztJQUtxQkEsYTtBQUNwQiwwQkFHQztBQUFBLE1BRkFDLE9BRUEsdUVBRlUsRUFFVjtBQUFBLE1BREFDLElBQ0EsdUVBREssRUFDTDtBQUFBOztBQUNBLE9BQUtELE9BQUwsR0FBZSxzQkFBYzs7QUFFNUJFLGlCQUFjLEtBRmM7QUFHNUJDLGdCQUFhLEtBSGU7QUFJNUJDLGVBQVks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Q0g7QUFDQTs7QUFFQTtBQVZtRDtBQUFBLHFCQVd2Q0EsWUFBWW9CLFNBQVosQ0FBc0IsVUFBQzFCLEdBQUQsRUFBTTJCLE9BQU4sRUFBZ0I7QUFDbEQsc0JBQU9BLE9BQVA7QUFDQSxlQUZZLENBWHVDOztBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsVUFBeEM7O0FBQUE7QUFBQTtBQUFBO0FBQUEsWTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBM0pNekQsYSIsImZpbGUiOiJzZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcmVkaXMgZnJvbSAncmVkaXMnXG5pbXBvcnQgY3J5cHRvIGZyb20gJ2NyeXB0bydcblxuXG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2Vzc2lvblNlcnZlciB7XHRcblx0Y29uc3RydWN0b3IoXG5cdFx0b3B0aW9ucyA9IHt9LFxuXHRcdGRhdGE9e31cblx0KXtcdFx0XG5cdFx0dGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRcblx0XHRcdHJlYWR5VGltZW91dDogMTAwMDAsXG5cdFx0XHRtYW51YWxTdGFydDogZmFsc2UsXG5cdFx0XHRzZXNzaW9uS2V5OiAnc2Vzc2lvbicsXG5cdFx0XHR1c2VyS2V5OiAndXNlcicsXG5cdFx0XHR0b2tlblNpemU6IDY0LFxuXHRcdFx0dG9rZW46IG51bGwsXG5cdFx0XHRyZWRpc0hvc3Q6ICdsb2NhbGhvc3QnLFxuXHRcdFx0cmVkaXNQb3J0OiA2Mzc5LFxuXHRcdFx0cmVkaXNJbmRleDogMCxcblx0XHRcdFxuXHRcdH0sb3B0aW9ucyk7XG5cdFx0XG5cdFx0XG5cdFx0dGhpcy5kYXRhID0gZGF0YTtcblx0XHRcblx0XHR0aGlzLmluaXRSZWRpcygpO1xuXHRcdFxuXHRcdGlmKCFvcHRpb25zLm1hbnVhbFN0YXJ0KXtcblx0XHRcdHRoaXMuc3RhcnQoKTtcdFx0XHRcblx0XHR9XG5cdFx0XG5cdH1cblx0aW5pdFJlZGlzKCl7XG5cdFx0dGhpcy5yZWRpc0NsaWVudCA9IHJlZGlzLmNyZWF0ZUNsaWVudCh7XG5cdFx0XHRob3N0OnRoaXMub3B0aW9ucy5yZWRpc0hvc3QsXG5cdFx0XHRwb3J0OnRoaXMub3B0aW9ucy5yZWRpc1BvcnQsXG5cdFx0fSk7XG5cdFx0dGhpcy5yZWRpc0NsaWVudC5zZWxlY3QodGhpcy5vcHRpb25zLnJlZGlzSW5kZXgpO1xuXHR9XG5cdHN0YXJ0KCl7XG5cdFx0dGhpcy5yZWFkeSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGxldCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xuXHRcdFx0XHRyZWplY3Qoe2Vycm9yOid0aW1lb3V0J30pO1xuXHRcdFx0fSx0aGlzLm9wdGlvbnMucmVhZHlUaW1lb3V0KTtcblx0XHRcdFxuXHRcdFx0dGhpcy5yZWFkeVJlc29sdmUgPSAoLi4uYXJncyk9Pntcblx0XHRcdFx0Y2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuXHRcdFx0XHRyZXNvbHZlKC4uLmFyZ3MpO1xuXHRcdFx0fTtcblx0XHRcdFxuXHRcdFx0dGhpcy5yZWFkeVJlamVjdCA9ICguLi5hcmdzKT0+e1xuXHRcdFx0XHRjbGVhclRpbWVvdXQodGltZW91dCk7XG5cdFx0XHRcdHJlamVjdCguLi5hcmdzKTtcblx0XHRcdH07XG5cdFx0fSk7XG5cdH1cblx0b3Blbih0b2tlbiwgdXNlckNhbGxiYWNrKXtcblx0XHRpZighdG9rZW4gJiYgdGhpcy5vcHRpb25zLnRva2VuKXtcblx0XHRcdHRva2VuID0gdGhpcy5vcHRpb25zLnRva2VuO1xuXHRcdH1cblx0XHRjb25zdCBjYWxsYmFjayA9IChlcnIsIHRva2VuKT0+e1xuXHRcdFx0dGhpcy50b2tlbiA9IHRva2VuO1xuXHRcdFx0dGhpcy5yZWFkeVJlc29sdmUodG9rZW4pO1xuXHRcdFx0aWYodXNlckNhbGxiYWNrKXtcblx0XHRcdFx0dXNlckNhbGxiYWNrKGVyciwgdG9rZW4pO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0aWYodG9rZW4pe1xuXHRcdFx0dGhpcy5leGlzdHModG9rZW4sIChlcnIsIGV4aXN0cyk9Pntcblx0XHRcdFx0aWYoIWV4aXN0cyl7XG5cdFx0XHRcdFx0dGhpcy5yZWdpc3Rlck5ld1Rva2VuKGNhbGxiYWNrKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNle1xuXHRcdFx0XHRcdHRoaXMuc3RvcmVTZXNzaW9uKHRva2VuLCBjYWxsYmFjayk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0fVxuXHRcdGVsc2V7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyTmV3VG9rZW4oY2FsbGJhY2spO1xuXHRcdH1cblx0fVxuXHRzZXREYXRhKGssIHYsIGNhbGxiYWNrLCB0cmFuc2FjdGlvbil7XG5cdFx0aWYodHlwZW9mIGsgPT0gJ29iamVjdCcpe1xuXHRcdFx0XG5cdFx0XHR0cmFuc2FjdGlvbiA9IGNhbGxiYWNrO1xuXHRcdFx0Y2FsbGJhY2sgPSB2O1xuXHRcdFx0aWYodHlwZW9mKGNhbGxiYWNrKSE9J2Z1bmN0aW9uJyl7XG5cdFx0XHRcdHRyYW5zYWN0aW9uID0gY2FsbGJhY2s7XG5cdFx0XHRcdGNhbGxiYWNrID0gbnVsbDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Y29uc3QgbXVsdGkgPSB0cmFuc2FjdGlvbiB8fCB0aGlzLnJlZGlzQ2xpZW50Lm11bHRpKCk7XG5cdFx0XHRPYmplY3Qua2V5cyhrKS5mb3JFYWNoKChrZXkpPT57XG5cdFx0XHRcdGNvbnN0IHZhbCA9IHZba2V5XTtcblx0XHRcdFx0bXVsdGkuaHNldCh0aGlzLm9wdGlvbnMuc2Vzc2lvbktleSsnOicrdGhpcy50b2tlbiwgaywgSlNPTi5zdHJpbmdpZnkodmFsKSk7XG5cdFx0XHRcdHRoaXMuZGF0YVtrZXldID0gdmFsO1xuXHRcdFx0fSk7XG5cdFx0XHRtdWx0aS5leGVjKGNhbGxiYWNrKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0ZWxzZXtcblx0XHRcdGxldCByZWRpc0tleSA9IHRoaXMub3B0aW9ucy5zZXNzaW9uS2V5Kyc6Jyt0aGlzLnRva2VuO1xuXHRcdFx0bGV0IHZhbCA9IEpTT04uc3RyaW5naWZ5KHYpO1xuXHRcdFx0aWYodHJhbnNhY3Rpb24pe1xuXHRcdFx0XHR0cmFuc2FjdGlvbi5oc2V0KHJlZGlzS2V5LCBrLCB2YWwpO1xuXHRcdFx0XHRpZihjYWxsYmFjayl7XG5cdFx0XHRcdFx0dHJhbnNhY3Rpb24uZXhlYyhjYWxsYmFjayk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdHRoaXMucmVkaXNDbGllbnQuaHNldChyZWRpc0tleSwgaywgdmFsLCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmRhdGFba10gPSB2O1xuXHRcdH1cblx0fVxuXHRnZXREYXRhKGspe1xuXHRcdHJldHVybiB0aGlzLmRhdGFba107XG5cdH1cblx0ZXhpc3RzKHRva2VuLCBjYWxsYmFjayl7XG5cdFx0dGhpcy5yZWRpc0NsaWVudC5zaXNtZW1iZXIodGhpcy5vcHRpb25zLnNlc3Npb25LZXksdG9rZW4sKGVycixleGlzdHMpPT57XG5cdFx0XHRjYWxsYmFjayhlcnIsZXhpc3RzKTtcblx0XHR9KTtcblx0fVxuXHRcblx0cmVnaXN0ZXJOZXdUb2tlbihjYWxsYmFjayl7XG5cdFx0Y29uc3QgdG9rZW4gPSB0aGlzLmdlbmVyYXRlVG9rZW4oKTtcblx0XHRjb25zdCB0cmFuc2FjdGlvbiA9IHRoaXMucmVkaXNDbGllbnQubXVsdGkoKTtcblx0XHR0cmFuc2FjdGlvbi5zYWRkKCdzZXNzaW9uJywgdG9rZW4pO1xuXHRcdHRoaXMuc3RvcmVTZXNzaW9uKHRva2VuLCBjYWxsYmFjaywgdHJhbnNhY3Rpb24pO1xuXHR9XG5cdHN0b3JlU2Vzc2lvbih0b2tlbiwgY2FsbGJhY2ssIHRyYW5zYWN0aW9uKXtcblx0XHRcblx0XHRpZighdHJhbnNhY3Rpb24pe1xuXHRcdFx0dHJhbnNhY3Rpb24gPSB0aGlzLnJlZGlzQ2xpZW50Lm11bHRpKCk7XG5cdFx0fVxuXHRcdFxuXHRcdGNvbnN0IGRhdGEgPSB0aGlzLmRhdGE7XG5cdFx0XG5cdFx0T2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoayk9Pntcblx0XHRcdHRyYW5zYWN0aW9uLmhzZXQoJ3Nlc3Npb246Jyt0b2tlbiwgaywgZGF0YVtrXSlcblx0XHR9KTtcblx0XHRcblx0XHR0cmFuc2FjdGlvbi5leGVjKGZ1bmN0aW9uKGVyciwgcmVwbGllcyl7XG5cdFx0XHRjYWxsYmFjayhlcnIsIHRva2VuKTtcblx0XHR9KTtcblx0XHRcblx0fVxuXHRcblx0Z2VuZXJhdGVUb2tlbigpe1xuXHRcdHJldHVybiBjcnlwdG8ucmFuZG9tQnl0ZXModGhpcy5vcHRpb25zLnRva2VuU2l6ZSkudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuXHR9XG5cdFxuXHRhc3luYyBsb2dpbihkYXRhKXtcblx0XHRjb25zdCBpZCA9IGRhdGEudXNlcl9pZDtcblx0XHRjb25zdCByZWRpc1VzZXJLZXkgPSB0aGlzLm9wdGlvbnMudXNlcktleSsnOicraWQ7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb24gPSB0aGlzLnJlZGlzQ2xpZW50Lm11bHRpKCk7XG5cdFx0XG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMucmVkaXNDbGllbnQuZ2V0QXN5bmMocmVkaXNVc2VyS2V5LCBhc3luYyAodG9rZW4pPT57XG5cdFx0XHRcblx0XHRcdGlmKCF0b2tlbil7XG5cdFx0XHRcdHRyYW5zYWN0aW9uLnNldChyZWRpc1VzZXJLZXksIHRoaXMudG9rZW4pO1xuXHRcdFx0XHR0aGlzLnNldERhdGEoZGF0YSwgdHJhbnNhY3Rpb24pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblx0XHRcdFx0Ly9UT0RPIE1lcmdlIGN1cnJlbnQgc2Vzc2lvbiB3aXRoIGFsbHJlYWR5IGV4aXN0aW5nIHNlc3Npb24gZm9yIHVzZXJcblx0XHRcdFx0Ly8uLi5cblx0XHRcdFx0XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYXdhaXQgdHJhbnNhY3Rpb24uZXhlY0FzeW5jKChlcnIsIHJlc3VsdHMpPT57XG5cdFx0XHRcdHJldHVybiByZXN1bHRzO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHR9KTtcblx0XHRcblx0fVxufVxuIl19