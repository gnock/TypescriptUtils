export default class Repository{
	public static GET='GET';
	public static POST='POST';
	public static PUT='PUT';
	public static DELETE='DELETE';

	constructor(){
	}

	private _handleError : (xhr:any, status:any, error:any) => any = function(xhr:any, status:any, error:any){};

	set handleError(value: (xhr: any, status: any, error: any) => any) {
		this._handleError = value;
	}

	public request(url:string, data:any=null, method:'GET'|'POST'|'PUT'|'DELETE'='GET', requireAuth = true, specificParameters:any={}):any{
		let self = this;
		let request:any = {
			url:url,
			method:method,
			headers:{}
		};

		if(method == 'GET'){
			request.data = undefined;
		} else {
			request.data = JSON.stringify(data);
			request.contentType="application/json; charset=utf-8";
			request.dataType="json";
		}

		for(let key in specificParameters){
			request[key] = specificParameters[key];
		}
		return new Promise(function(resolve, reject){
			$.ajax(request).done(function(returnData:any){
				resolve(returnData);
			}).fail(function(xhr:any, status:any, error:any){
				console.log('fail', xhr, status, error);
				if(self._handleError(xhr, status, error))
					reject();
				else
					reject(xhr);
			});
		});
	};
}