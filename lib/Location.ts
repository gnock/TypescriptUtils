export default class Location{
	static transformSearchParametersToAssocArray(prmstr:any) {
		let params : any = {};
		let prmarr = prmstr.split("&");
		for (let i = 0; i < prmarr.length; i++) {
			let tmparr = prmarr[i].split("=");
			if(typeof params[tmparr[0]] !== 'undefined' && !Array.isArray(params[tmparr[0]]))
				params[tmparr[0]] = [params[tmparr[0]]];

			if(Array.isArray(params[tmparr[0]]))
				params[tmparr[0]].push(tmparr[1]);
			else
				params[tmparr[0]] = tmparr[1];
		}
		return params;
	};

	static getSearchParameters() {
		let paramsStart = window.location.href.indexOf('?');
		if (paramsStart != -1) {
			let paramsEnd = window.location.href.indexOf('#', paramsStart);
			paramsEnd = paramsEnd == -1 ? window.location.href.length : paramsEnd;
			return Location.transformSearchParametersToAssocArray(window.location.href.substring(paramsStart + 1, paramsEnd));
		}
		return {};
	}

	static getSearchParametersWithName(paramterName:string, defaultVal=null) : string|null{
		let param = Location.getSearchParameters();
		if(typeof param[paramterName] !== 'undefined')
			return param[paramterName];
		return defaultVal;
	}

	static getHashSearchParameters() {
		var paramsStart = window.location.hash.indexOf('?');
		if (paramsStart != -1) {
			return Location.transformSearchParametersToAssocArray(window.location.href.substring(paramsStart + 1, window.location.href.length));
		}
		return {};
	}
}