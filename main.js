import * as gameEngine from './modules/game engine.js';
import * as physics from './modules/physics.js'

function main() {
	const canvas = document.getElementById('scene')
	if (canvas.getContext) {
		let yPadding = 140
		let xPadding = 300
		const ctx = canvas.getContext('2d')
		canvas.width = window.screen.width - xPadding
		canvas.height = window.screen.height - yPadding
		// ctx.imageSmoothingEnabled = false
		// ctx.translate(0.5, 0.5)

		//create objects for the game
		const allObjects = []
		let buffer = gameEngine.controlsBuffer()

		let sprite = new Image()
		sprite.src = "img/mario_sprite.png"	

		let sprite_flipped = new Image()
		sprite_flipped.src = "img/mario_sprite_flipped.png"	

		let heroInitialCoords = physics.vector2D(100, 100)
		const theHero = gameEngine.createObject(ctx, 'hero', heroInitialCoords)
		theHero.properties.width = 32
		theHero.properties.height = 65
		theHero.addAnimationFromSprite("idle", sprite, physics.vector2D(0,0), 30, 1,physics.vector2D(30,65), 1)
		theHero.properties.animations[0].play = "true"
		theHero.addAnimationFromSprite("walkRight", sprite, physics.vector2D(35,0), 30, 3,physics.vector2D(30,65), 0.1)
		theHero.addAnimationFromSprite("walkLeft", sprite_flipped, physics.vector2D(608,0),-30, 3,physics.vector2D(30,65), 0.1)

		allObjects.push(theHero)

		let colors = ['blue', 'yellow', 'orange', 'grey']

		for (let i = 0; i < 8; i++) {
			let obj
			let radius = 400
			obj = gameEngine.createObject(ctx, `obj${i}`,
				physics.vector2D(radius * Math.sin(2*Math.PI/8 * i) + canvas.width/2 , radius *  Math.cos(2*Math.PI/8 * i) + canvas.height/2)
			)
			obj.properties.color = colors[Math.floor(3 * Math.random())]
			obj.properties.width = Math.round(10 + 100 * Math.random())
			obj.properties.height = Math.round(10 + 100 * Math.random())
			allObjects.push(obj)
		}

		let light = gameEngine.createObject(ctx, 'point-light', physics.vector2D(500,100))
		light.properties.width = 20
		light.properties.height = 20

		const cursors = []

		canvas.addEventListener('click', (event) => {
			let mouseCoords = physics.vector2D(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
			theHero.moveTo(mouseCoords, 2)
			light.moveTo(mouseCoords, 1)
		})

		window.addEventListener('keydown', (event) => {
			let keyPressed = event.key
				buffer.push(keyPressed)
		})
		
		window.addEventListener('keyup', (event) => {
			let keyReleased = event.key
			if(keyReleased == 'ArrowRight'){
				buffer.push("ArrowRight^")
			}
			else if(keyReleased == 'ArrowLeft'){
				buffer.push("ArrowLeft^")
			}
		})

		let state = "idle"

		gameEngine.startGameLoop(canvas, allObjects, cursors, light, false, () => {
			theHero.properties.velocity[1] += 0.04
			// console.log(allObjects[0].properties)
			let key = "blank"

			if(buffer.buffer.length !== 0){
				key = buffer.shift()
			}
			if(key === "ArrowRight"){
				state = "right"
			}
			else if(key === "ArrowLeft"){
				state = "left"
			}
			else if(key === "ArrowUp"){
				state = "jump"
			}
			else if(key === "ArrowRight^" && state === "right"){
				state = "idle"
			}
			else if(key === "ArrowLeft^" && state === "left"){
				state = "idle"
			}
			
			if(state === "idle"){
				theHero.stopAnimation()
				theHero.playAnimation("idle")
				console.log("idle")
			}
			else if(state === "right" && theHero.properties.sidesColliding.includes("BOTTOM")){
				theHero.stopAnimation()
				theHero.playAnimation("walkRight")
				theHero.properties.velocity[0] = 1
				console.log("walkRight")
			}
			else if(state === "left"){
				theHero.stopAnimation()
				theHero.playAnimation("walkLeft")
				theHero.properties.velocity[0] = -1
				console.log("walkLeft")
			}
			else if(state === "jump"){
				// theHero.stopAnimation()
				// theHero.playAnimation("jump")
				theHero.properties.velocity[1] = -2
				state = "in_air"
			}
		})
	}
}
window.addEventListener('load', main)