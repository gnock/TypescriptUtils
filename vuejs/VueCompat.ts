type VueConstructObject = {el:string,data:any, watch?:any, computed?:any, updated?:any, mounted?:any};
// declare var Vue : any;
class Vue{
	constructor(any : VueConstructObject|string|null){}

	$nextTick(callback : Function){}
	$forceUpdate(){}
}