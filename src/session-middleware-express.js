import cookieParser from 'cookie-parser'

import SessionServer from './server'

export default function(options = {}){
	const cookieParserCaller = cookieParser();
	return function(req, res, next){
			
		options = Object.assign({
			
			useCookie: true,
			
			setCookie: true,
			cookieName: 'token',
			cookieOptions: {},
			
			sessionOptions: {},
			
		},options);

		cookieParserCaller(req, res, function(){
			
			let token;
			if(options.useCookie && req.cookies[options.cookieName]){
				token = req.cookies[options.cookieName];
			}
			const session = new SessionServer(options.sessionOptions, options.sessionData);
			req.session = session;
			session.open(token, (err, readyToken)=>{
				if(options.setCookie && token!= readyToken){
					res.cookie(options.cookieName, readyToken, options.cookieOptions);
				}
				next();
			});
			
		});
	};
};
