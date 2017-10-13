'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.default = function () {
	var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	var cookieParserCaller = (0, _cookieParser2.default)();
	return function (req, res, next) {

		options = (0, _assign2.default)({

			useCookie: true,

			setCookie: true,
			cookieName: 'token',
			cookieOptions: {},

			sessionOptions: {}

		}, options);

		cookieParserCaller(req, res, function () {

			var token = void 0;
			if (options.useCookie && req.cookies[options.cookieName]) {
				token = req.cookies[options.cookieName];
			}
			var session = new _server2.default(options.sessionOptions, options.sessionData);
			req.session = session;
			session.open(token, function (err, readyToken) {
				if (options.setCookie && token != readyToken) {
					res.cookie(options.cookieName, readyToken, options.cookieOptions);
				}
				next();
			});
		});
	};
};

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXNzaW9uLW1pZGRsZXdhcmUtZXhwcmVzcy5qcyJdLCJuYW1lcyI6WyJvcHRpb25zIiwiY29va2llUGFyc2VyQ2FsbGVyIiwicmVxIiwicmVzIiwibmV4dCIsInVzZUNvb2tpZSIsInNldENvb2tpZSIsImNvb2tpZU5hbWUiLCJjb29raWVPcHRpb25zIiwic2Vzc2lvbk9wdGlvbnMiLCJ0b2tlbiIsImNvb2tpZXMiLCJzZXNzaW9uIiwic2Vzc2lvbkRhdGEiLCJvcGVuIiwiZXJyIiwicmVhZHlUb2tlbiIsImNvb2tpZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztrQkFJZSxZQUFzQjtBQUFBLEtBQWJBLE9BQWEsdUVBQUgsRUFBRzs7QUFDcEMsS0FBTUMscUJBQXFCLDZCQUEzQjtBQUNBLFFBQU8sVUFBU0MsR0FBVCxFQUFjQyxHQUFkLEVBQW1CQyxJQUFuQixFQUF3Qjs7QUFFOUJKLFlBQVUsc0JBQWM7O0FBRXZCSyxjQUFXLElBRlk7O0FBSXZCQyxjQUFXLElBSlk7QUFLdkJDLGVBQVksT0FMVztBQU12QkMsa0JBQWUsRUFOUTs7QUFRdkJDLG1CQUFnQjs7QUFSTyxHQUFkLEVBVVJULE9BVlEsQ0FBVjs7QUFZQUMscUJBQW1CQyxHQUFuQixFQUF3QkMsR0FBeEIsRUFBNkIsWUFBVTs7QUFFdEMsT0FBSU8sY0FBSjtBQUNBLE9BQUdWLFFBQVFLLFNBQVIsSUFBcUJILElBQUlTLE9BQUosQ0FBWVgsUUFBUU8sVUFBcEIsQ0FBeEIsRUFBd0Q7QUFDdkRHLFlBQVFSLElBQUlTLE9BQUosQ0FBWVgsUUFBUU8sVUFBcEIsQ0FBUjtBQUNBO0FBQ0QsT0FBTUssVUFBVSxxQkFBa0JaLFFBQVFTLGNBQTFCLEVBQTBDVCxRQUFRYSxXQUFsRCxDQUFoQjtBQUNBWCxPQUFJVSxPQUFKLEdBQWNBLE9BQWQ7QUFDQUEsV0FBUUUsSUFBUixDQUFhSixLQUFiLEVBQW9CLFVBQUNLLEdBQUQsRUFBTUMsVUFBTixFQUFtQjtBQUN0QyxRQUFHaEIsUUFBUU0sU0FBUixJQUFxQkksU0FBUU0sVUFBaEMsRUFBMkM7QUFDMUNiLFNBQUljLE1BQUosQ0FBV2pCLFFBQVFPLFVBQW5CLEVBQStCUyxVQUEvQixFQUEyQ2hCLFFBQVFRLGFBQW5EO0FBQ0E7QUFDREo7QUFDQSxJQUxEO0FBT0EsR0FmRDtBQWdCQSxFQTlCRDtBQStCQSxDOztBQXJDRDs7OztBQUVBOzs7Ozs7QUFtQ0MiLCJmaWxlIjoic2Vzc2lvbi1taWRkbGV3YXJlLWV4cHJlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY29va2llUGFyc2VyIGZyb20gJ2Nvb2tpZS1wYXJzZXInXG5cbmltcG9ydCBTZXNzaW9uU2VydmVyIGZyb20gJy4vc2VydmVyJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvcHRpb25zID0ge30pe1xuXHRjb25zdCBjb29raWVQYXJzZXJDYWxsZXIgPSBjb29raWVQYXJzZXIoKTtcblx0cmV0dXJuIGZ1bmN0aW9uKHJlcSwgcmVzLCBuZXh0KXtcblx0XHRcdFxuXHRcdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdFxuXHRcdFx0dXNlQ29va2llOiB0cnVlLFxuXHRcdFx0XG5cdFx0XHRzZXRDb29raWU6IHRydWUsXG5cdFx0XHRjb29raWVOYW1lOiAndG9rZW4nLFxuXHRcdFx0Y29va2llT3B0aW9uczoge30sXG5cdFx0XHRcblx0XHRcdHNlc3Npb25PcHRpb25zOiB7fSxcblx0XHRcdFxuXHRcdH0sb3B0aW9ucyk7XG5cblx0XHRjb29raWVQYXJzZXJDYWxsZXIocmVxLCByZXMsIGZ1bmN0aW9uKCl7XG5cdFx0XHRcblx0XHRcdGxldCB0b2tlbjtcblx0XHRcdGlmKG9wdGlvbnMudXNlQ29va2llICYmIHJlcS5jb29raWVzW29wdGlvbnMuY29va2llTmFtZV0pe1xuXHRcdFx0XHR0b2tlbiA9IHJlcS5jb29raWVzW29wdGlvbnMuY29va2llTmFtZV07XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzZXNzaW9uID0gbmV3IFNlc3Npb25TZXJ2ZXIob3B0aW9ucy5zZXNzaW9uT3B0aW9ucywgb3B0aW9ucy5zZXNzaW9uRGF0YSk7XG5cdFx0XHRyZXEuc2Vzc2lvbiA9IHNlc3Npb247XG5cdFx0XHRzZXNzaW9uLm9wZW4odG9rZW4sIChlcnIsIHJlYWR5VG9rZW4pPT57XG5cdFx0XHRcdGlmKG9wdGlvbnMuc2V0Q29va2llICYmIHRva2VuIT0gcmVhZHlUb2tlbil7XG5cdFx0XHRcdFx0cmVzLmNvb2tpZShvcHRpb25zLmNvb2tpZU5hbWUsIHJlYWR5VG9rZW4sIG9wdGlvbnMuY29va2llT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0fSk7XG5cdFx0XHRcblx0XHR9KTtcblx0fTtcbn07XG4iXX0=