
import Collisions from "./Collisions";

export class BetterCanvas{

	canvasContext : CanvasRenderingContext2D;
	canvas : HTMLCanvasElement;

	currentZoom = 1;
	zoomAtStart = 1;
	zoomFingersDistancesStart = 1;

	offset : {x:number, y:number} = {x:0,y:0};

	allowZooming = true;
	mouseWheelZoomFactor = 0.5;

	allowMoving = true;
	offsetOnClick : {x:number, y:number} = {x:-1,y:-1};
	offsetMousePos : {x:number, y:number} = {x:-1,y:-1};

	redrawCallback : ((context : CanvasRenderingContext2D)=>void)|null = null;
	clickCallback : ((mouseRelativeCoordinates : Point2D, canvasCoords:Point2D)=>void)|null = null;
	mouseDownCallback : ((mouseRelativeCoordinates : Point2D, canvasCoords:Point2D)=>void)|null = null;
	mouseUpCallback : ((mouseRelativeCoordinates : Point2D, canvasCoords:Point2D)=>void)|null = null;
	mouseMoveCallback : ((mouseRelativeCoordinates : Point2D, canvasCoords:Point2D)=>void)|null = null;



	get canvasCenter() : Point2D{
		return {
			x:-this.offset.x+this.canvas.width/2,
			y:-this.offset.y+this.canvas.height/2
		}
	}

	constructor(selector : string, width=-1, height=-1){
		let self = this;
		if($(selector).length > 0 && $(selector)[0])
			this.canvas = <HTMLCanvasElement>$(selector)[0];

		let parent = $(selector).parent();

		if(this.canvas !== null) {
			if(width !== -1) {
				this.canvas.width = width;
			}else{
				this.canvas.width = parent.width();
			}
			if(height !== -1){
				this.canvas.height = height;
			}else{
				this.canvas.height = parent.height();
			}

			let context = this.canvas.getContext("2d");

			if(context === null)
				throw '2D context missing on canvas';

			this.canvasContext = context;

			this.canvas.addEventListener('mousedown', function(event : MouseEvent){self.mouseDown(event);});
			this.canvas.addEventListener('mouseup', function(event : MouseEvent){self.mouseUp(event);});
			this.canvas.addEventListener('mousemove', function(event : MouseEvent){self.mouseMove(event);});
			this.canvas.addEventListener('wheel', function(event : MouseWheelEvent){self.mouseWheel(event);});
			this.canvas.addEventListener('mouseout', function(event : MouseEvent){self.mouseOut(event);});

			this.canvas.addEventListener('touchstart', function(event : TouchEvent){self.touchStart(event);});
			this.canvas.addEventListener('touchend', function(event : TouchEvent){self.touchEnd(event);});
			this.canvas.addEventListener('touchcancel', function(event : TouchEvent){self.touchEnd(event);});
			this.canvas.addEventListener('touchmove', function(event : TouchEvent){self.touchMove(event);});
		}

	}


	mouseDown(event : MouseEvent){
		let mouseCoords : Point2D = {x:event.clientX, y:event.clientY};
		let canvasCoords : Point2D = BetterCanvas.multiplyPoint({x:event.offsetX, y:event.offsetY}, this.getTransformMatrix().inverse());

		if(this.allowMoving) {
			this.offsetOnClick.x = this.offset.x;
			this.offsetOnClick.y = this.offset.y;
			this.offsetMousePos.x = event.clientX;
			this.offsetMousePos.y = event.clientY;
			event.stopPropagation();
			event.preventDefault();
			this.draw();
		}else{
			if(this.mouseDownCallback !== null)
				this.mouseDownCallback(mouseCoords, canvasCoords);
		}
	}
	mouseUp(event : MouseEvent){
		let moved = false;
		let mouseCoords : Point2D = {x:event.clientX, y:event.clientY};
		let canvasCoords : Point2D = BetterCanvas.multiplyPoint({x:event.offsetX, y:event.offsetY}, this.getTransformMatrix().inverse());

		if(this.allowMoving){
			moved = Collisions.distanceBetween2Points(mouseCoords, this.offsetMousePos) >= 5;

			this.offsetMousePos.x = -1;
			event.stopPropagation();
			event.preventDefault();
			// this.draw();
		}

		if(!moved){
			if(this.mouseUpCallback !== null)
				this.mouseUpCallback(mouseCoords, canvasCoords);

			if(this.clickCallback !== null){
				this.clickCallback(mouseCoords, canvasCoords);
			}
		}
	}
	mouseMove(event : MouseEvent){
		let mouseCoords : Point2D = {x:event.clientX, y:event.clientY};
		let canvasCoords : Point2D = BetterCanvas.multiplyPoint({x:event.offsetX, y:event.offsetY}, this.getTransformMatrix().inverse());

		if(this.allowMoving) {
			if (this.offsetMousePos.x !== -1) {
				this.offset.x = (event.clientX - this.offsetMousePos.x) / this.currentZoom + this.offsetOnClick.x;
				this.offset.y = (event.clientY - this.offsetMousePos.y) / this.currentZoom + this.offsetOnClick.y;
				this.draw();
			}
		}else{
			if(this.mouseMoveCallback !== null)
				this.mouseMoveCallback(mouseCoords, canvasCoords);
		}
	}
	mouseWheel(event : MouseWheelEvent){
		if(this.allowZooming) {
			let zoomBefore = this.currentZoom;
			let zoomDelta = event.wheelDelta > 0 ? this.mouseWheelZoomFactor : -this.mouseWheelZoomFactor;
			if (this.currentZoom + zoomDelta < 0.1)
				zoomDelta = 0.1 - this.currentZoom;
			this.currentZoom += zoomDelta;

			// this.offset.x -= this.offset.x*this.currentZoom/zoomBefore;
			event.stopPropagation();
			event.preventDefault();
			this.draw();
		}
	}
	mouseOut(event : MouseEvent){}

	touchStart(event : TouchEvent){
		let eventHandled = false;
		if(this.allowMoving) {
			if (event.touches.length == 1) {
				eventHandled  =true;
				this.offsetOnClick.x = this.offset.x;
				this.offsetOnClick.y = this.offset.y;
				this.offsetMousePos.x = event.touches[0].clientX;
				this.offsetMousePos.y = event.touches[0].clientY;
				event.stopPropagation();
				event.preventDefault();
				// this.draw();
			}
		}
		if(this.allowZooming){
			if (event.touches.length == 2) {
				eventHandled = true;
				this.zoomAtStart = this.currentZoom;
				this.zoomFingersDistancesStart = Math.sqrt(
					Math.pow(event.touches[0].clientX - event.touches[1].clientX, 2) +
					Math.pow(event.touches[0].clientY - event.touches[1].clientY, 2)
				);
				event.stopPropagation();
				event.preventDefault();
			}
		}

		if(!eventHandled){
			if (event.touches.length == 1) {
				if(this.mouseDownCallback !== null){
					let rect = (<HTMLElement>event.target).getBoundingClientRect();
					let offsetX = event.targetTouches[0].pageX - rect.left;
					let offsetY = event.targetTouches[0].pageY - rect.top;

					let mouseCoords : Point2D = {x:event.touches[0].clientX, y:event.touches[0].clientY};
					let canvasCoords : Point2D = BetterCanvas.multiplyPoint({x:offsetX, y:offsetY}, this.getTransformMatrix().inverse());
					this.mouseDownCallback(mouseCoords, canvasCoords);
				}
			}
		}
	}
	touchEnd(event : TouchEvent){
		let eventHandled = false;
		let mouseCoords : Point2D = {x:event.changedTouches[0].clientX, y:event.changedTouches[0].clientY};

		if(this.allowMoving && Collisions.distanceBetween2Points(this.offsetMousePos, mouseCoords) >= 2) {
			eventHandled = true;
			this.offsetMousePos.x = -1;
			event.stopPropagation();
			event.preventDefault();
		}else
			this.offsetMousePos.x = -1;

		if(!eventHandled){
			if (event.changedTouches.length == 1) {
				if(this.mouseUpCallback !== null){
					console.log(event);

					let rect = (<HTMLElement>event.target).getBoundingClientRect();
					let offsetX = event.changedTouches[0].pageX - rect.left;
					let offsetY = event.changedTouches[0].pageY - rect.top;

					let mouseCoords : Point2D = {x:event.changedTouches[0].clientX, y:event.changedTouches[0].clientY};
					let canvasCoords : Point2D = BetterCanvas.multiplyPoint({x:offsetX, y:offsetY}, this.getTransformMatrix().inverse());
					this.mouseUpCallback(mouseCoords, canvasCoords);
				}
			}
		}
	}
	touchMove(event : TouchEvent){
		let eventHandled = false;
		if(this.allowMoving) {
			if (this.offsetMousePos.x !== -1 && event.touches.length == 1) {
				eventHandled = true;
				this.offset.x = (event.touches[0].clientX - this.offsetMousePos.x) / this.currentZoom + this.offsetOnClick.x;
				this.offset.y = (event.touches[0].clientY - this.offsetMousePos.y) / this.currentZoom + this.offsetOnClick.y;
				this.draw();
				event.stopPropagation();
				event.preventDefault();
			}
		}
		if(this.allowZooming) {
			if (event.touches.length == 2) {
				eventHandled = true;
				let newFingersDistance = Math.sqrt(
					Math.pow(event.touches[0].clientX - event.touches[1].clientX, 2) +
					Math.pow(event.touches[0].clientY - event.touches[1].clientY, 2)
				);
				this.currentZoom = (newFingersDistance / this.zoomFingersDistancesStart) * this.zoomAtStart;
				this.draw();
			}
		}
		if(!eventHandled){
			if (event.touches.length == 1) {
				if(this.mouseMoveCallback !== null){
					let rect = (<HTMLElement>event.target).getBoundingClientRect();
					let offsetX = event.targetTouches[0].pageX - rect.left;
					let offsetY = event.targetTouches[0].pageY - rect.top;

					let mouseCoords : Point2D = {x:event.touches[0].clientX, y:event.touches[0].clientY};
					let canvasCoords : Point2D = BetterCanvas.multiplyPoint({x:offsetX, y:offsetY}, this.getTransformMatrix().inverse());
					this.mouseMoveCallback(mouseCoords, canvasCoords);
				}
			}
		}
	}

	getTransformMatrix(){
		let svgNamespace = "http://www.w3.org/2000/svg";
		let element : SVGAElement = <SVGAElement>document.createElementNS(svgNamespace, "g");
		let matrix : SVGMatrix = element.getCTM();
		if(this.canvas === null)return matrix;
		// [a c e]
		// [b d f]
		matrix.a = this.currentZoom;
		matrix.b = 0;
		matrix.c = 0;
		matrix.d = this.currentZoom;
		matrix.e = -(this.currentZoom - 1) * (this.canvas.width/2);
		matrix.f = -(this.currentZoom - 1) * (this.canvas.height/2);

		matrix = matrix.translate(this.offset.x, this.offset.y);

		return matrix;
	}

	draw(){
		if(this.redrawCallback === null)return;

		this.canvasContext.save();
		this.canvasContext.fillStyle = '#eff0f1';
		this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// [a c e]
		// [b d f]
		let matrix = this.getTransformMatrix();
		this.canvasContext.setTransform(
			matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f
		);

		this.redrawCallback(this.canvasContext);

		this.canvasContext.restore();
	}

	static multiplyPoint(point : {x:number, y:number}, matrix:SVGMatrix) {
		// [a c e]
		// [b d f]
		return {
			x: point.x * matrix.a + point.y * matrix.c + matrix.e,
			y: point.x * matrix.b + point.y * matrix.d + matrix.f
		}
	}

}

