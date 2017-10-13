'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _cookiesJs = require('cookies-js');

var _cookiesJs2 = _interopRequireDefault(_cookiesJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ClientSessionReady() {
	return new _promise2.default(function (resolve, reject) {
		socket.on('connect', function () {
			socket.emit('openSession', null, function (answer) {
				if (answer !== true) {
					_cookiesJs2.default.set('token', answer);
				}
				resolve(answer);
			});
		});
	});
}
exports.default = ClientSessionReady;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQtc2Vzc2lvbi1yZWFkeS5qcyJdLCJuYW1lcyI6WyJDbGllbnRTZXNzaW9uUmVhZHkiLCJyZXNvbHZlIiwicmVqZWN0Iiwic29ja2V0Iiwib24iLCJlbWl0IiwiYW5zd2VyIiwic2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7OztBQUNBLFNBQVNBLGtCQUFULEdBQTZCO0FBQzVCLFFBQU8sc0JBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQW1CO0FBQ3JDQyxTQUFPQyxFQUFQLENBQVUsU0FBVixFQUFvQixZQUFJO0FBQ3ZCRCxVQUFPRSxJQUFQLENBQVksYUFBWixFQUEyQixJQUEzQixFQUFpQyxrQkFBVTtBQUMxQyxRQUFHQyxXQUFTLElBQVosRUFBaUI7QUFDaEIseUJBQVFDLEdBQVIsQ0FBWSxPQUFaLEVBQW9CRCxNQUFwQjtBQUNBO0FBQ0RMLFlBQVFLLE1BQVI7QUFDQSxJQUxEO0FBTUEsR0FQRDtBQVFBLEVBVE0sQ0FBUDtBQVVBO2tCQUNjTixrQiIsImZpbGUiOiJjbGllbnQtc2Vzc2lvbi1yZWFkeS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb29raWVzIGZyb20gJ2Nvb2tpZXMtanMnXG5mdW5jdGlvbiBDbGllbnRTZXNzaW9uUmVhZHkoKXtcblx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT57XG5cdFx0c29ja2V0Lm9uKCdjb25uZWN0JywoKT0+e1xuXHRcdFx0c29ja2V0LmVtaXQoJ29wZW5TZXNzaW9uJywgbnVsbCwgYW5zd2VyID0+IHtcblx0XHRcdFx0aWYoYW5zd2VyIT09dHJ1ZSl7XG5cdFx0XHRcdFx0Q29va2llcy5zZXQoJ3Rva2VuJyxhbnN3ZXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJlc29sdmUoYW5zd2VyKTtcblx0XHRcdH0pO1x0XHRcdFxuXHRcdH0pO1xuXHR9KTtcbn1cbmV4cG9ydCBkZWZhdWx0IENsaWVudFNlc3Npb25SZWFkeTtcbiJdfQ==