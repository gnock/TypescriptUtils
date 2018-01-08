export default class Collisions{

	public static distanceBetween2Points(point1 : {x:number, y:number}, point2 : {x:number, y:number}) : number{
		return Math.sqrt(
			Math.pow(point1.x-point2.x, 2) +
			Math.pow(point1.y-point2.y, 2)
		)
	}

	public static isPointInRadius(point1 : {x:number, y:number}, point2 : {x:number, y:number}, radius:number, deltaIn:number=0){
		return Collisions.distanceBetween2Points(point1, point2) <= radius+deltaIn;
	}

	public static pointOnLine(point1 : {x:number, y:number}, point2 : {x:number, y:number}, searchPoint : {x:number, y:number}, delta=0.1) : boolean{
		// get distance from the point to the two ends of the line
		let d1 = Collisions.distanceBetween2Points(searchPoint, point1);
		let d2 = Collisions.distanceBetween2Points(searchPoint, point2);

		// get the length of the line
		let lineLen = Collisions.distanceBetween2Points(point1, point2);
		return (d1+d2 >= lineLen-delta && d1+d2 <= lineLen+delta);
	}

	public static pointInRectangleCentered(center : {x:number, y:number}, width : number, height: number, searchPoint : {x:number, y:number}){
		return 	searchPoint.x >= center.x-width/2 && searchPoint.x <= center.x-width/2 &&
				searchPoint.y >= center.y-height/2 && searchPoint.y <= center.y-height/2;
	}

	public static pointInRectangle(pointTopLeft : {x:number, y:number}, pointBottomRight : {x:number, y:number}, searchPoint : {x:number, y:number}){
		return 	searchPoint.x >= pointTopLeft.x && searchPoint.x <= pointBottomRight.x &&
				searchPoint.y >= pointTopLeft.y && searchPoint.y <= pointBottomRight.y;
	}


}