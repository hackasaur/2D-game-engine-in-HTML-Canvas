import * as canvasTools from './modules/canvas.js';
import * as gameEngine from './modules/game engine.js';

function main() {
    const canvas = document.getElementById('scene')
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = window.innerWidth - 20
        ctx.canvas.height = window.innerHeight - 20
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
            let props = obj.getProperties()
            props.color = colors[Math.floor(3 * Math.random())]
            props.width = Math.round(10 + 60 * Math.random())
            props.height = Math.round(10 + 60 * Math.random())
            allObjects.push(obj)
        }

        const cursors = []

        canvas.addEventListener('click', (event) => {
            let mouseCoords = canvasTools.createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
            theHero.moveTo(mouseCoords)
            theHero2.moveTo(mouseCoords)
            cursors.push(gameEngine.spawnMoveHereCursor(ctx, mouseCoords, 'GreenYellow'))
        })

        canvas.addEventListener('mousemove', (event) => {
            currentMouseCoords = canvasTools.createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
        })

        let secondsPassed
        let oldTimeStamp
        let fps;
        let frame = 1

        function gameLoop(timeStamp) {
            canvasTools.paintBackground(ctx, '#3a2081')
            gameEngine.updateAndPaintScene(allObjects, cursors)

            //FPS
            // Calculate the number of seconds passed since the last frame
            secondsPassed = (timeStamp - oldTimeStamp) / 1000;
            oldTimeStamp = timeStamp
            // Calculate fps
            fps = Math.round(1 / secondsPassed);
            //show fps
            ctx.shadowColor = 'rgba(0, 0, 0, 0)'
            ctx.fillStyle = 'black'
            canvasTools.setCanvasFont(ctx, { font: 'Arial', size: '25px', color: 'white' })
            ctx.fillText("FPS: " + fps, 10, 10)

            //mouse coordinates
            if (isDebugging && currentMouseCoords) {
                canvasTools.setCanvasFont(ctx, { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '15' })
                ctx.fillText(`x:${currentMouseCoords[0]}, y:${currentMouseCoords[1]}`, currentMouseCoords[0], currentMouseCoords[1])
            }

            frame++
            console.log('frame #')

            if (frame <= 5000) {
                window.requestAnimationFrame(gameLoop)
            }
        }
        gameLoop()

        // setInterval(paintScene, 500)
    }
}

window.addEventListener('load', main)