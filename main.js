import * as canvasTools from './modules/canvas tools.js';
import * as gameEngine from './modules/game engine.js';

function main() {
	const canvas = document.getElementById('scene')
	if (canvas.getContext) {
		let yPadding = 140
		let xPadding = 300
		const ctx = canvas.getContext('2d')
		ctx.canvas.width = window.screen.width - xPadding
		ctx.canvas.height = window.screen.height - yPadding
		// ctx.imageSmoothingEnabled = false
		// ctx.translate(0.5, 0.5)

		let debug = true
		let currentMouseCoords
		const allObjects = []

		let heroInitialCoords = canvasTools.createPoint(100, 100)
		const theHero = gameEngine.createObject(ctx, 'hero', heroInitialCoords)
		// const theHero2 = gameEngine.createObject(ctx, 'hero2', canvasTools.createPoint(200, 200), allObjects)
		allObjects.push(theHero)
		// allObjects.push(theHero2)

		let colors = ['blue', 'yellow', 'orange', 'grey']

		for (let i = 0; i < 8; i++) {
			let obj
			let radius = 250
			obj = gameEngine.createObject(ctx, `obj${i}`,
				canvasTools.createPoint(radius * Math.sin(2*Math.PI/8 * i) + 400 , radius *  Math.cos(2*Math.PI/8 * i) + 300)
			)
			obj.properties.color = colors[Math.floor(3 * Math.random())]
			obj.properties.width = Math.round(10 + 60 * Math.random())
			obj.properties.height = Math.round(10 + 60 * Math.random())
			allObjects.push(obj)
		}

		let light = gameEngine.createObject(ctx, 'point-light', canvasTools.createPoint(500,100))
		light.properties.width = 20
		light.properties.height = 20

		const cursors = []

		canvas.addEventListener('click', (event) => {
			let mouseCoords = canvasTools.createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
			theHero.moveTo(mouseCoords, 1.5)
			light.moveTo(mouseCoords, 1.5)
			// theHero2.moveTo(mouseCoords)
			// cursors.push(gameEngine.spawnMoveHereCursor(ctx, mouseCoords, 'GreenYellow'))
		})

		// canvas.addEventListener('mousemove', (event) => {
		// 	currentMouseCoords = canvasTools.createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
		// })

		gameEngine.startGameLoop(canvas, allObjects, cursors, light, debug)
	}
}
window.addEventListener('load', main)