import * as canvasTools from './modules/canvas tools.js';
import * as gameEngine from './modules/game engine.js';

function main() {
	const canvas = document.getElementById('scene')
	if (canvas.getContext) {
		let yPadding = 140
		let xPadding = 300
		const ctx = canvas.getContext('2d')
		ctx.canvas.width = window.innerWidth - xPadding
		ctx.canvas.height = window.innerHeight - yPadding
		// ctx.imageSmoothingEnabled = false
		// ctx.translate(0.5, 0.5)

		let isDebugging = true
		let currentMouseCoords
		const allObjects = []

		let heroInitialCoords = canvasTools.createPoint(100, 100)
		const theHero = gameEngine.createObject(ctx, 'hero', heroInitialCoords, allObjects)
		const theHero2 = gameEngine.createObject(ctx, 'hero2', canvasTools.createPoint(200, 200), allObjects)
		allObjects.push(theHero, theHero2)


		let colors = ['blue', 'yellow', 'orange', 'grey']
		// create random objects
		for (let i = 0; i < 8; i++) {
			let obj
			obj = gameEngine.createObject(ctx, `obj${i}`, canvasTools.createPoint(ctx.canvas.width * Math.random(), ctx.canvas.height * Math.random()))
			obj.properties.color = colors[Math.floor(3 * Math.random())]
			obj.properties.width = Math.round(10 + 60 * Math.random())
			obj.properties.height = Math.round(10 + 60 * Math.random())
			allObjects.push(obj)
		}

		const cursors = []

		canvas.addEventListener('click', (event) => {
			let mouseCoords = canvasTools.createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
			theHero.moveTo(mouseCoords)
			theHero2.moveTo(mouseCoords)
			// cursors.push(gameEngine.spawnMoveHereCursor(ctx, mouseCoords, 'GreenYellow'))
		})

		// canvas.addEventListener('mousemove', (event) => {
		// 	currentMouseCoords = canvasTools.createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
		// })

		gameEngine.startGameLoop(canvas, allObjects, cursors, true)
	}
}
window.addEventListener('load', main)
