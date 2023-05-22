import * as canvasTools from './canvas tools.js';
import * as physics from './physics.js';

export const createObject = (ctx, name, coords, sprite) => {
    const properties = {
        name: name,
        coords: physics.vector2D(coords[0], coords[1]),
        color: 'white',
        width: 30,
        height: 60,
        coordsToReach: physics.vector2D(coords[0], coords[1]),
        selectable: false,
        velocity: physics.vector2D(0, 0), //unit vector
        shadowOffset: physics.vector2D(0, 0)
    }

    let slope, cosTheta, prevCoords
    let Speed = 0
    let calculated = false
    let moveTo = false

    return {
        properties,
        draw() {
            console.assert(!isNaN(properties.coords[0]) && !isNaN(properties.coords[1]), `${properties.coords}`)
            let path = new Path2D
            ctx.beginPath(path)
            path.rect(properties.coords[0] - properties.width / 2, properties.coords[1] - properties.height / 2, properties.width, properties.height)
            ctx.strokeStyle = properties.color
            ctx.stroke(path)
            ctx.closePath(path)
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
            ctx.shadowOffsetX = properties.shadowOffset[0];
            ctx.shadowOffsetY = properties.shadowOffset[1];
            if(sprite){
                ctx.drawImage(sprite, 0, 0, 30, 60, properties.coords[0] - properties.width / 2, properties.coords[1] - properties.height / 2, 40,40)
            }
            //reset shadowColor
            ctx.shadowColor = 'rgba(0,0,0,0)'
        },

        update() {

            prevCoords = physics.vector2D(properties.coords[0], properties.coords[1])
            let threshold = 2


            if (moveTo && (properties.coordsToReach[0] !== properties.coords[0]
                || properties.coordsToReach[1] !== properties.coords[1])) {

                if (calculated === false) {
                    let deltaX = properties.coordsToReach[0] - properties.coords[0]
                    let deltaY = properties.coordsToReach[1] - properties.coords[1]
                    if(deltaX !== 0){
                        slope = deltaY / deltaX
                        let distanceFromCoordsTillCoordsToReach = Math.sqrt(deltaX ** 2 + deltaY ** 2)
                        cosTheta = deltaX / distanceFromCoordsTillCoordsToReach
                        properties.velocity = physics.vector2D(Speed * cosTheta, Speed * slope * cosTheta)
                    }
                    else if (deltaY !== 0){
                        properties.velocity = physics.vector2D(0, Speed * Math.sign(deltaY))
                    }

                    // let horizontalIncrement = properties.speed * cosTheta
                    // properties.velocity = physics.vector2D(horizontalIncrement, slope * horizontalIncrement)
                    calculated = true
                }
                
                //logic for moving in a line towards the target coords
                /* we can simply add a shift in the coords along the slope but the destination point will get missed and the object 
                will not stop  at that point...to avoid this, in the case when the horizontal shift will go ahead of the destination 
                point it will move the object to the destination directly and stop. */

                if (Math.abs(properties.coordsToReach[0] - (properties.coords[0] + properties.velocity[0])) <= threshold && 
                    Math.abs(properties.coordsToReach[1] - (properties.coords[1] + properties.velocity[1])) <= threshold) 
                {
                        //moving towards left and coordsToReach will have passed to the right
                        properties.coords = physics.vector2D(properties.coordsToReach[0], properties.coordsToReach[1])
                        properties.velocity = physics.vector2D(0,0)
                        moveTo = false
                }
            }
            
            properties.coords[0] +=  properties.velocity[0]
            properties.coords[1] +=  properties.velocity[1]

            console.assert(!isNaN(properties.coords[0]) && !isNaN(properties.coords[1]), `${properties.coords}`)
            console.assert(!isNaN(prevCoords[0]) && !isNaN(prevCoords[1]), `${prevCoords}`)
        },

        moveTo(coords, speed) {
            properties.coordsToReach = coords
            Speed = speed
            calculated = false
            moveTo = true
        },

        undoUpdate() {
            properties.coords = prevCoords
        }
    }
}

const updateCollidingObjectPairs = (collidingObjectPairs) => {
    for (let pair of collidingObjectPairs) {
        let object1 = pair[0]
        let object2 = pair[1]
        object1.undoUpdate()
        object2.undoUpdate()
        let coordsWhenCollide = physics.coordsAtCollision(object1, object2)
        // console.log(coordsWhenCollide)
        object1.properties.coords = coordsWhenCollide[0]
        object2.properties.coords = coordsWhenCollide[1]
        object1.properties.velocity = physics.vector2D(0,0)
        object2.properties.velocity = physics.vector2D(0,0)
    }
}

const collidingObjectPairs = (objects) => {
    let objectsDone = []
    let objectsColliding = []
    let collidingObjectPairs = []

    for (let object1 of objects) {
        for (let object2 of objects) {
            if (objectsDone.includes(object2) || object1 === object2) {
                continue
            }
            else if (physics.areColliding(object1, object2)) {
                collidingObjectPairs.push([object1, object2])
            }
        }
        objectsDone.push(object1)
    }
    return collidingObjectPairs
}

const shadowOffsetForObject = (object, lightSource) => {
    let deltaX = object.properties.coords[0] - lightSource.properties.coords[0]
    let deltaY = object.properties.coords[1] - lightSource.properties.coords[1]
    let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)
    let shadowOffsetX = deltaX / (0.05 * distance)
    let shadowOffsetY = deltaY / (0.05 * distance)
    return physics.vector2D(shadowOffsetX, shadowOffsetY)
}

export const spawnMoveHereCursor = (ctx, coords, color) => {
    const properties = {
        coords: coords,
        color: color,
        radius: 20,
        speed: 1,
        lineWidth: 7,
        isAnimating: true
    }

    let animationRadius = properties.radius

    return {
        properties,
        draw: () => {
            if (properties.isAnimating) {
                let path = new Path2D

                ctx.beginPath(path)
                path.arc(properties.coords[0], properties.coords[1], animationRadius, 0, 2 * Math.PI)
                path.lineWidth = properties.lineWidth
                ctx.closePath(path)
                ctx.strokeStyle = color
                ctx.stroke(path)
            }
        },
        update: () => {
            if (animationRadius > 0) {
                animationRadius -= properties.speed
            }
            else if (animationRadius <= 0) {
                properties.isAnimating = false
            }
        }
    }
}

export const updateScene = (sceneObjects, sceneCursors, lightSource) => {
    lightSource.update()

    sceneObjects.forEach((obj) => {
        obj.update()
    })

    updateCollidingObjectPairs(collidingObjectPairs(sceneObjects))

    sceneObjects.forEach((obj) => {
        obj.properties.shadowOffset = shadowOffsetForObject(obj, lightSource)
    })

    sceneCursors.forEach((cursor) => {
        cursor.update()
    })
}

export const paintScene = (sceneObjects, sceneCursors, lightSource) => {
    lightSource.draw()

    sceneObjects.forEach((obj) => {
        obj.draw()
    })

    for (let i = 0; i < sceneCursors.length; i++) {
        let cursor = sceneCursors[i]
        let isAnimating = cursor.properties.isAnimating
        if (isAnimating) {
            cursor.draw()
        }
        else if (isAnimating === false) {
            sceneCursors.splice(i, 1)
        }
    }
}

export const startGameLoop = (canvas, allObjects, cursors, lightSource, isDebugging = false, code = () => { return 0 }) => {
    //allObjects is a array containing all the objects of the scene. 
    //cursors is a array used to store all the current moveHereCursors
    let mouseCoords
    let secondsPassed
    let oldTimeStamp
    let fps;
    let frame = 1
    let ctx = canvas.getContext('2d')
    let running = true

    canvas.addEventListener('click', (event) => {
        mouseCoords = physics.vector2D(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
        cursors.push(spawnMoveHereCursor(ctx, mouseCoords, 'GreenYellow'))
    })

    canvas.addEventListener('mousemove', (event) => {
        mouseCoords = physics.vector2D(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
    })


    window.addEventListener('keydown', (event) => {
        let keyPressed = event.key
        if (keyPressed === 'Escape') {
            running = false
        }
    })

    function gameLoop(timeStamp) {
        code()

        if (running) {
            canvasTools.paintBackground(ctx, '#353347')
            updateScene(allObjects, cursors, lightSource)
            paintScene(allObjects, cursors, lightSource)

            //FPS
            // Calculate the number of seconds passed since the last frame
            secondsPassed = (timeStamp - oldTimeStamp) / 1000;
            oldTimeStamp = timeStamp
            // Calculate fps
            fps = Math.round(1 / secondsPassed);

            //show fps
            ctx.fillStyle = 'black'
            canvasTools.setCanvasFont(ctx, { font: 'Arial', size: '25px', color: 'white' })
            ctx.fillText("FPS: " + fps, 50, 20)

            if (isDebugging) {
                if (mouseCoords) {
                    canvasTools.setCanvasFont(ctx, { font: 'Fira Mono', color: 'black', size: '10' })
                    ctx.fillText(`${mouseCoords[0]}, ${mouseCoords[1]}`, mouseCoords[0], mouseCoords[1] - 5)
                }

                let vectorScale = 20
                for (let object of allObjects) {
                    ctx.fillStyle = 'grey'
                    //center of rectangle
                    ctx.fillRect(object.properties.coords[0] - 1.5, object.properties.coords[1] - 1.5, 3, 3)
                    ctx.lineWidth = 2
                    // //vectorX
                    ctx.beginPath()
                    ctx.moveTo(object.properties.coords[0], object.properties.coords[1])
                    ctx.lineTo(object.properties.coords[0] + vectorScale * object.properties.velocity[0], object.properties.coords[1])
                    ctx.strokeStyle = 'red'
                    ctx.stroke()
                    ctx.closePath()
                    // //vectorY
                    ctx.beginPath()
                    ctx.strokeStyle = 'green'
                    ctx.moveTo(object.properties.coords[0], object.properties.coords[1])
                    ctx.lineTo(object.properties.coords[0], object.properties.coords[1] + vectorScale * object.properties.velocity[1])
                    ctx.stroke()
                    ctx.closePath()
                    canvasTools.setCanvasFont(ctx, { font: 'Fira Mono', color: 'black', size: '10' })
                    ctx.fillText(`${Math.round(Math.sqrt(object.properties.velocity[0]**2 + object.properties.velocity[1]**2))}`, object.properties.coords[0], object.properties.coords[1])
                    ctx.fillText(`${Math.round(object.properties.coords[0])}, ${Math.round(object.properties.coords[1])}`, object.properties.coords[0] + 5, object.properties.coords[1] + 10)
                }
            }
        }
        frame++
        // console.log('frame #')
        if (frame <= 5000) {
            window.requestAnimationFrame(gameLoop)
        }
    }
    gameLoop()
    // setInterval(gameLoop, 100)
}