import Cookies from 'cookies-js'
function ClientSessionReady(socket){
	return new Promise((resolve, reject)=>{
		socket.on('connect',()=>{
			socket.emit('openSession', null, answer => {
				if(answer!==true){
					Cookies.set('token',answer);
				}
				resolve(answer);
			});			
		});
	});
}
export default ClientSessionReady;
