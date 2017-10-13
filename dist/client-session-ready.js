'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _cookiesJs = require('cookies-js');

var _cookiesJs2 = _interopRequireDefault(_cookiesJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ClientSessionReady(socket, openSessionCallback) {
	var resolved = false;
	var socketConnected = null;
	return new _promise2.default(function (resolve, reject) {
		socket.on('connect', function () {
			socket.emit('openSession', null, function (answer) {
				if (answer !== true) {
					_cookiesJs2.default.set('token', answer);
				}
				var reconnecting = socketConnected === false;
				socketConnected = true;
				if (openSessionCallback) {
					openSessionCallback(answer, reconnecting);
				}
				if (!resolved) {
					resolved = true;
					resolve(answer);
				}
			});
		});
		socket.on('disconnect', function () {
			socketConnected = false;
		});
	});
}
exports.default = ClientSessionReady;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jbGllbnQtc2Vzc2lvbi1yZWFkeS5qcyJdLCJuYW1lcyI6WyJDbGllbnRTZXNzaW9uUmVhZHkiLCJzb2NrZXQiLCJvcGVuU2Vzc2lvbkNhbGxiYWNrIiwicmVzb2x2ZWQiLCJzb2NrZXRDb25uZWN0ZWQiLCJyZXNvbHZlIiwicmVqZWN0Iiwib24iLCJlbWl0IiwiYW5zd2VyIiwic2V0IiwicmVjb25uZWN0aW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7Ozs7OztBQUNBLFNBQVNBLGtCQUFULENBQTRCQyxNQUE1QixFQUFvQ0MsbUJBQXBDLEVBQXdEO0FBQ3ZELEtBQUlDLFdBQVcsS0FBZjtBQUNBLEtBQUlDLGtCQUFrQixJQUF0QjtBQUNBLFFBQU8sc0JBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQW1CO0FBQ3JDTCxTQUFPTSxFQUFQLENBQVUsU0FBVixFQUFvQixZQUFJO0FBQ3ZCTixVQUFPTyxJQUFQLENBQVksYUFBWixFQUEyQixJQUEzQixFQUFpQyxrQkFBVTtBQUMxQyxRQUFHQyxXQUFTLElBQVosRUFBaUI7QUFDaEIseUJBQVFDLEdBQVIsQ0FBWSxPQUFaLEVBQW9CRCxNQUFwQjtBQUNBO0FBQ0QsUUFBSUUsZUFBZVAsb0JBQWtCLEtBQXJDO0FBQ0FBLHNCQUFrQixJQUFsQjtBQUNBLFFBQUdGLG1CQUFILEVBQXVCO0FBQ3RCQSx5QkFBb0JPLE1BQXBCLEVBQTRCRSxZQUE1QjtBQUNBO0FBQ0QsUUFBRyxDQUFDUixRQUFKLEVBQWE7QUFDWkEsZ0JBQVcsSUFBWDtBQUNBRSxhQUFRSSxNQUFSO0FBQ0E7QUFDRCxJQWJEO0FBY0EsR0FmRDtBQWdCQVIsU0FBT00sRUFBUCxDQUFVLFlBQVYsRUFBdUIsWUFBSTtBQUMxQkgscUJBQWtCLEtBQWxCO0FBQ0EsR0FGRDtBQUdBLEVBcEJNLENBQVA7QUFxQkE7a0JBQ2NKLGtCIiwiZmlsZSI6ImNsaWVudC1zZXNzaW9uLXJlYWR5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvb2tpZXMgZnJvbSAnY29va2llcy1qcydcbmZ1bmN0aW9uIENsaWVudFNlc3Npb25SZWFkeShzb2NrZXQsIG9wZW5TZXNzaW9uQ2FsbGJhY2spe1xuXHRsZXQgcmVzb2x2ZWQgPSBmYWxzZTtcblx0bGV0IHNvY2tldENvbm5lY3RlZCA9IG51bGw7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuXHRcdHNvY2tldC5vbignY29ubmVjdCcsKCk9Pntcblx0XHRcdHNvY2tldC5lbWl0KCdvcGVuU2Vzc2lvbicsIG51bGwsIGFuc3dlciA9PiB7XG5cdFx0XHRcdGlmKGFuc3dlciE9PXRydWUpe1xuXHRcdFx0XHRcdENvb2tpZXMuc2V0KCd0b2tlbicsYW5zd2VyKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgcmVjb25uZWN0aW5nID0gc29ja2V0Q29ubmVjdGVkPT09ZmFsc2U7XG5cdFx0XHRcdHNvY2tldENvbm5lY3RlZCA9IHRydWU7XG5cdFx0XHRcdGlmKG9wZW5TZXNzaW9uQ2FsbGJhY2spe1xuXHRcdFx0XHRcdG9wZW5TZXNzaW9uQ2FsbGJhY2soYW5zd2VyLCByZWNvbm5lY3RpbmcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmKCFyZXNvbHZlZCl7XHRcdFx0XHRcdFxuXHRcdFx0XHRcdHJlc29sdmVkID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXNvbHZlKGFuc3dlcik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1x0XHRcdFxuXHRcdH0pO1xuXHRcdHNvY2tldC5vbignZGlzY29ubmVjdCcsKCk9Pntcblx0XHRcdHNvY2tldENvbm5lY3RlZCA9IGZhbHNlO1xuXHRcdH0pO1xuXHR9KTtcbn1cbmV4cG9ydCBkZWZhdWx0IENsaWVudFNlc3Npb25SZWFkeTtcbiJdfQ==