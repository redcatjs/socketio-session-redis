import cookieParserIO from 'socket.io-cookie-parser'

import SessionServer from './server'

export default function(options){
	const cookieParserIOCaller = cookieParserIO();
	return function(socket, next){

		options = Object.assign({
			
			useCookie: true,
			cookieName: 'token',
			sessionOptions: {},
			
		},options);
		
		const req = socket.request;
		let session;
		let token;
		
		
		socket.on('openSession',(clientToken, answer)=>{
			socket.request.session.open(clientToken, (err, tokenReady)=>{
				if(answer){
					answer( token == tokenReady ? true : tokenReady );
				}
			});
		});
		
		cookieParserIOCaller(socket, function(){
			
			
			if(options.useCookie && req.cookies[options.cookieName]){
				token = req.cookies[options.cookieName];
			}
			options.sessionOptions.token = token;
			session = new SessionServer(options.sessionOptions, options.sessionData);
			req.session = session;
			next();
			
		});
		
	};
};
