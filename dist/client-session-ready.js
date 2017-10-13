'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _cookiesJs = require('cookies-js');

var _cookiesJs2 = _interopRequireDefault(_cookiesJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ClientSessionReady(socket) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQtc2Vzc2lvbi1yZWFkeS5qcyJdLCJuYW1lcyI6WyJDbGllbnRTZXNzaW9uUmVhZHkiLCJzb2NrZXQiLCJyZXNvbHZlIiwicmVqZWN0Iiwib24iLCJlbWl0IiwiYW5zd2VyIiwic2V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7OztBQUNBLFNBQVNBLGtCQUFULENBQTRCQyxNQUE1QixFQUFtQztBQUNsQyxRQUFPLHNCQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFtQjtBQUNyQ0YsU0FBT0csRUFBUCxDQUFVLFNBQVYsRUFBb0IsWUFBSTtBQUN2QkgsVUFBT0ksSUFBUCxDQUFZLGFBQVosRUFBMkIsSUFBM0IsRUFBaUMsa0JBQVU7QUFDMUMsUUFBR0MsV0FBUyxJQUFaLEVBQWlCO0FBQ2hCLHlCQUFRQyxHQUFSLENBQVksT0FBWixFQUFvQkQsTUFBcEI7QUFDQTtBQUNESixZQUFRSSxNQUFSO0FBQ0EsSUFMRDtBQU1BLEdBUEQ7QUFRQSxFQVRNLENBQVA7QUFVQTtrQkFDY04sa0IiLCJmaWxlIjoiY2xpZW50LXNlc3Npb24tcmVhZHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29va2llcyBmcm9tICdjb29raWVzLWpzJ1xuZnVuY3Rpb24gQ2xpZW50U2Vzc2lvblJlYWR5KHNvY2tldCl7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuXHRcdHNvY2tldC5vbignY29ubmVjdCcsKCk9Pntcblx0XHRcdHNvY2tldC5lbWl0KCdvcGVuU2Vzc2lvbicsIG51bGwsIGFuc3dlciA9PiB7XG5cdFx0XHRcdGlmKGFuc3dlciE9PXRydWUpe1xuXHRcdFx0XHRcdENvb2tpZXMuc2V0KCd0b2tlbicsYW5zd2VyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXNvbHZlKGFuc3dlcik7XG5cdFx0XHR9KTtcdFx0XHRcblx0XHR9KTtcblx0fSk7XG59XG5leHBvcnQgZGVmYXVsdCBDbGllbnRTZXNzaW9uUmVhZHk7XG4iXX0=