import redis from 'redis'
import crypto from 'crypto'




export default class SessionServer {	
	constructor(
		options = {},
		data={}
	){		
		this.options = Object.assign({
			
			readyTimeout: 10000,
			manualStart: false,
			sessionKey: 'session',
			userKey: 'user',
			tokenSize: 64,
			token: null,
			redisHost: 'localhost',
			redisPort: 6379,
			redisIndex: 0,
			
		},options);
		
		
		this.data = data;
		
		this.initRedis();
		
		if(!options.manualStart){
			this.start();			
		}
		
	}
	initRedis(){
		this.redisClient = redis.createClient({
			host:this.options.redisHost,
			port:this.options.redisPort,
		});
		this.redisClient.select(this.options.redisIndex);
	}
	start(){
		this.ready = new Promise((resolve, reject) => {
			let timeout = setTimeout(()=>{
				reject({error:'timeout'});
			},this.options.readyTimeout);
			
			this.readyResolve = (...args)=>{
				clearTimeout(timeout);
				resolve(...args);
			};
			
			this.readyReject = (...args)=>{
				clearTimeout(timeout);
				reject(...args);
			};
		});
	}
	open(token, userCallback){
		if(!token && this.options.token){
			token = this.options.token;
		}
		const callback = (err, token)=>{
			this.token = token;
			this.readyResolve(token);
			if(userCallback){
				userCallback(err, token);
			}
		};
		if(token){
			this.exists(token, (err, exists)=>{
				if(!exists){
					this.registerNewToken(callback);
				}
				else{
					this.storeSession(token, callback);
				}
			});
			
		}
		else{
			this.registerNewToken(callback);
		}
	}
	setData(k, v, callback, transaction){
		if(typeof k == 'object'){
			
			transaction = callback;
			callback = v;
			if(typeof(callback)!='function'){
				transaction = callback;
				callback = null;
			}
			
			const multi = transaction || this.redisClient.multi();
			Object.keys(k).forEach((key)=>{
				const val = v[key];
				multi.hset(this.options.sessionKey+':'+this.token, k, JSON.stringify(val));
				this.data[key] = val;
			});
			multi.exec(callback);
			return;
		}
		else{
			let redisKey = this.options.sessionKey+':'+this.token;
			let val = JSON.stringify(v);
			if(transaction){
				transaction.hset(redisKey, k, val);
				if(callback){
					transaction.exec(callback);
				}
			}
			else{
				this.redisClient.hset(redisKey, k, val, callback);
			}
			this.data[k] = v;
		}
	}
	getData(k){
		return this.data[k];
	}
	exists(token, callback){
		this.redisClient.sismember(this.options.sessionKey,token,(err,exists)=>{
			callback(err,exists);
		});
	}
	
	registerNewToken(callback){
		const token = this.generateToken();
		const transaction = this.redisClient.multi();
		transaction.sadd('session', token);
		this.storeSession(token, callback, transaction);
	}
	storeSession(token, callback, transaction){
		
		if(!transaction){
			transaction = this.redisClient.multi();
		}
		
		const data = this.data;
		
		Object.keys(data).forEach((k)=>{
			transaction.hset('session:'+token, k, data[k])
		});
		
		transaction.exec(function(err, replies){
			callback(err, token);
		});
		
	}
	
	generateToken(){
		return crypto.randomBytes(this.options.tokenSize).toString('base64');
	}
	
	async login(data){
		const id = data.user_id;
		const redisUserKey = this.options.userKey+':'+id;
		const transaction = this.redisClient.multi();
		
		return await this.redisClient.getAsync(redisUserKey, async (token)=>{
			
			if(!token){
				transaction.set(redisUserKey, this.token);
				this.setData(data, transaction);
			}
			else{
				//TODO Merge current session with allready existing session for user
				//...
				
			}
			return await transaction.execAsync((err, results)=>{
				return results;
			});
			
		});
		
	}
}
