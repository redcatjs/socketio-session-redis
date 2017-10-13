import Cookies from 'cookies-js'
function ClientSessionReady(socket, openSessionCallback){
	let resolved = false;
	let socketConnected = null;
	return new Promise((resolve, reject)=>{
		socket.on('connect',()=>{
			socket.emit('openSession', null, answer => {
				if(answer!==true){
					Cookies.set('token',answer);
				}
				let reconnecting = socketConnected===false;
				socketConnected = true;
				if(openSessionCallback){
					openSessionCallback(answer, reconnecting);
				}
				if(!resolved){					
					resolved = true;
					resolve(answer);
				}
			});			
		});
		socket.on('disconnect',()=>{
			socketConnected = false;
		});
	});
}
export default ClientSessionReady;
