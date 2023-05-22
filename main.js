import * as canvasTools from './modules/canvas tools.js';
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

		let debug = true
		let currentMouseCoords
		const allObjects = []

		let sprite = new Image()
		sprite.src = "img/mario_sprite.png"	

		let heroInitialCoords = physics.vector2D(100, 100)
		const theHero = gameEngine.createObject(ctx, 'hero', heroInitialCoords, sprite)
		theHero.properties.height = 40
		theHero.properties.width = 40
		theHero.properties.velocity = physics.vector2D(2,2)
		// const theHero2 = gameEngine.createObject(ctx, 'hero2', physics.vector2D(200, 200), allObjects)
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


		gameEngine.startGameLoop(canvas, allObjects, cursors, light, true, () => {
			allObjects[0].properties.velocity[1] += 0.04
			// console.log(allObjects[0].properties)
		})
	}
}
window.addEventListener('load', main)