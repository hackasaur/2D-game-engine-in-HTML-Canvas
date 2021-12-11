import * as canvasTools from './canvas tools.js';

export const createObject = (ctx, name, coords) => {
    const properties = {
        name: name,
        coords: canvasTools.createPoint(coords[0], coords[1]),
        color: 'white',
        width: 30,
        height: 60,
        coordsToReach: canvasTools.createPoint(coords[0], coords[1]),
        speed: 1.5,
        selectable: false,
        velocity: canvasTools.createPoint(0, 0), //unit vector
        shadowOffset: canvasTools.createPoint(0, 0)
    }

    let slope, cosTheta, prevCoords
    let calculated = false

    return {
        properties,
        draw() {
            let path = new Path2D
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
            ctx.shadowOffsetX = properties.shadowOffset[0];
            ctx.shadowOffsetY = properties.shadowOffset[1];
            ctx.beginPath(path)
            path.rect(properties.coords[0] - properties.width / 2, properties.coords[1] - properties.height / 2, properties.width, properties.height)
            ctx.fillStyle = properties.color
            ctx.fill(path)
            ctx.closePath(path)
            //reset shadowColor
            ctx.shadowColor = 'rgba(0,0,0,0)'
        },

        update() {
            prevCoords = canvasTools.createPoint(properties.coords[0], properties.coords[1])

            if (properties.coordsToReach[0] !== properties.coords[0]
                && properties.coordsToReach[1] !== properties.coords[0]) {
                if (calculated === false) {
                    let deltaX = properties.coordsToReach[0] - properties.coords[0]
                    let deltaY = properties.coordsToReach[1] - properties.coords[1]
                    slope = deltaY / deltaX
                    let distanceFromCoordsTillCoordsToReach = Math.sqrt(deltaX ** 2 + deltaY ** 2)
                    cosTheta = deltaX / distanceFromCoordsTillCoordsToReach
                    // let horizontalIncrement = properties.speed * cosTheta
                    // properties.velocity = canvasTools.createPoint(horizontalIncrement, slope * horizontalIncrement)
                    properties.velocity = canvasTools.createPoint(cosTheta, slope * cosTheta)
                    calculated = true
                }

                //logic for moving in a line towards the target coords
                /* we can simply add a shift in the coords along the slope but the destination point will get missed and the object 
                will not stop  at that point...to avoid this, in the case when the horizontal shift will go ahead of the destination 
                point it will move the object to the destination directly and stop. */
                if (properties.coordsToReach[0] - (properties.coords[0] + properties.speed * properties.velocity[0]) > 0) {
                    if (cosTheta >= 0) {
                        //moving towards right and the coordsToReach will still be on the right
                        properties.coords[0] += properties.speed * properties.velocity[0]
                        properties.coords[1] += properties.speed * properties.velocity[1]
                    }
                    else if (cosTheta < 0) {
                        //moving towards left and coordsToReach will have passed to the right
                        properties.coords = canvasTools.createPoint(properties.coordsToReach[0], properties.coordsToReach[0])
                        properties.velocity = canvasTools.createPoint(0, 0)
                    }
                }

                else if (properties.coordsToReach[0] - (properties.coords[0] + properties.speed * properties.velocity[0]) <= 0) {
                    if (cosTheta >= 0) {
                        //moving towards right and the coordsToReach will have passed to the left
                        properties.coords = properties.coordsToReach
                        properties.velocity = canvasTools.createPoint(0, 0)
                    }
                    else if (cosTheta < 0) {
                        //moving towards left and the coordsToReach will still be on the left
                        properties.coords[0] += properties.speed * properties.velocity[0]
                        properties.coords[1] += properties.speed * properties.velocity[1]
                    }
                }
            }

            // if (isColliding(this, allObjects)) {
            //     properties.coords = prevCoords
            // }
        },

        moveTo(coords, speed) {
            properties.coordsToReach = coords
            properties.speed = speed
            calculated = false
        },

        undoUpdate() {
            properties.coords = prevCoords
        }
    }
}

function areColliding(object1, object2) {
    let colliding = false

    let topLeftCoords1 = canvasTools.createPoint(
        object1.properties.coords[0] - object1.properties.width / 2,
        object1.properties.coords[1] - object1.properties.height / 2)

    let topLeftCoords2 = canvasTools.createPoint(
        object2.properties.coords[0] - object2.properties.width / 2,
        object2.properties.coords[1] - object2.properties.height / 2)

    colliding = canvasTools.areBoxesOverlapping(
        topLeftCoords2, object2.properties.width, object2.properties.height,
        topLeftCoords1, object1.properties.width, object1.properties.height
    )

    // if (colliding) {
    //     console.log(object1.properties.name, ' collided with ', object2.properties.name)
    // }
    return colliding
}

function coordsAtCollision(object1, object2) {
    let object1Coords, object2Coords

    let timeOfHorizontalCollision = Math.min(
        (object1.properties.coords[0] - object2.properties.coords[0]
            + (object1.properties.width + object2.properties.width) / 2) / (object2.properties.velocity[0] - object1.properties.velocity[0]),
        (object1.properties.coords[0] - object2.properties.coords[0]
            - (object1.properties.width + object2.properties.width) / 2) / (object2.properties.velocity[0] - object1.properties.velocity[0])
    )
    let timeOfVerticalCollision = Math.min(
        (object1.properties.coords[1] - object2.properties.coords[1]
            + (object1.properties.height + object2.properties.height) / 2) / (object2.properties.velocity[1] - object1.properties.velocity[1]),
        (object1.properties.coords[1] - object2.properties.coords[1]
            - (object1.properties.height + object2.properties.height) / 2) / (object2.properties.velocity[1] - object1.properties.velocity[1])
    )
    console.log('time of Horizontal', timeOfHorizontalCollision)
    console.log('time of vertical', timeOfVerticalCollision)

    if (timeOfHorizontalCollision >= 0) {
        if ((timeOfVerticalCollision >= 0 && timeOfHorizontalCollision < timeOfVerticalCollision) || timeOfVerticalCollision < 0) {
            object1Coords = canvasTools.createPoint(
                object1.properties.coords[0] + object1.properties.velocity[0] * timeOfHorizontalCollision,
                object1.properties.coords[1] + object1.properties.velocity[1] * timeOfHorizontalCollision
            )
            object2Coords = canvasTools.createPoint(
                object2.properties.coords[0] + object2.properties.velocity[0] * timeOfHorizontalCollision,
                object2.properties.coords[1] + object2.properties.velocity[1] * timeOfHorizontalCollision
            )
        }

    }
    else if (timeOfVerticalCollision >= 0) {
        if ((timeOfHorizontalCollision >= 0 && timeOfVerticalCollision < timeOfHorizontalCollision) || timeOfHorizontalCollision < 0) {
            object1Coords = canvasTools.createPoint(
                object1.properties.coords[0] + object1.properties.velocity[0] * timeOfVerticalCollision,
                object1.properties.coords[1] + object1.properties.velocity[1] * timeOfVerticalCollision
            )
            object2Coords = canvasTools.createPoint(
                object2.properties.coords[0] + object2.properties.velocity[0] * timeOfVerticalCollision,
                object2.properties.coords[1] + object2.properties.velocity[1] * timeOfVerticalCollision
            )
        }
    }
    return [object1Coords, object2Coords]
}

const checkCollisionAndUpdate = (objects) => {
    let objectsDone = []
    let objectsColliding = []
    let collidingObjectPairs = []

    for (let object1 of objects) {
        for (let object2 of objects) {
            if (objectsDone.includes(object2) || object1 === object2) {
                continue
            }
            else {
                if (areColliding(object1, object2)) {
                    object1.undoUpdate()
                    object2.undoUpdate()
                    let coordsWhenCollide = coordsAtCollision(object1, object2)
                    console.log(coordsWhenCollide)
                    object1.properties.coords = coordsWhenCollide[0]
                    object2.properties.coords = coordsWhenCollide[1]
                    object1.properties.speed = 0
                    object2.properties.speed = 0

                    // object1.undoUpdate()
                    // object2.undoUpdate()
                    break
                }
            }
            // if (object1 !== object2) {
            //     if (canvasTools.whereTwoRectsOverlap(
            //         object2.properties.coords, object2.properties.width, object2.properties.height,
            //         object1.properties.coords, object1.properties.width, object1.properties.height)) {
            //         collidingObjectPairs.push([object1, object2])
            //     }
            // }
        }
        objectsDone.push(object1)
    }
}

const shadowOffsetForObject = (object, lightSource) => {
    let deltaX = object.properties.coords[0] - lightSource.properties.coords[0]
    let deltaY = object.properties.coords[1] - lightSource.properties.coords[1]
    let distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)
    let shadowOffsetX = deltaX / (0.05 * distance)
    let shadowOffsetY = deltaY / (0.05 * distance)
    return canvasTools.createPoint(shadowOffsetX, shadowOffsetY)
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

                if (animationRadius > 0) {
                    ctx.beginPath(path)
                    path.arc(properties.coords[0], properties.coords[1], animationRadius, 0, 2 * Math.PI)
                    path.lineWidth = properties.lineWidth
                    ctx.closePath(path)
                    ctx.strokeStyle = color
                    ctx.stroke(path)
                    animationRadius -= properties.speed
                }
                else if (animationRadius <= 0) {
                    properties.isAnimating = false
                }
            }
        },
    }
}

export const updateAndPaintScene = (sceneObjects, sceneCursors, lightSource) => {
    // console.log('light', lightSource)
    lightSource.update()
    lightSource.draw()

    sceneObjects.forEach((obj) => {
        obj.update()
    })

    checkCollisionAndUpdate(sceneObjects)

    sceneObjects.forEach((obj) => {
        obj.properties.shadowOffset = shadowOffsetForObject(obj, lightSource)
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

    canvas.addEventListener('click', (event) => {
        mouseCoords = canvasTools.createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
        cursors.push(spawnMoveHereCursor(ctx, mouseCoords, 'GreenYellow'))
    })

    canvas.addEventListener('mousemove', (event) => {
        mouseCoords = canvasTools.createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
    })

    function gameLoop(timeStamp) {
        code()
        canvasTools.paintBackground(ctx, '#353347')
        updateAndPaintScene(allObjects, cursors, lightSource)

        //FPS
        // Calculate the number of seconds passed since the last frame
        secondsPassed = (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp
        // Calculate fps
        fps = Math.round(1 / secondsPassed);

        //show fps
        // ctx.shadowColor = 'rgba(0, 0, 0, 0)'
        ctx.fillStyle = 'black'
        canvasTools.setCanvasFont(ctx, { font: 'Arial', size: '25px', color: 'white' })
        ctx.fillText("FPS: " + fps, 50, 20)

        //mouse coordinates
        if (isDebugging) {
            if (mouseCoords) {
                canvasTools.setCanvasFont(ctx, { font: 'Fira Mono', color: 'grey', size: '10' })
                ctx.fillText(`x:${mouseCoords[0]}, y:${mouseCoords[1]}`, mouseCoords[0], mouseCoords[1])
            }
            let vectorScale = 20
            for (let object of allObjects) {
                ctx.fillStyle = 'grey'
                //center of rectangle
                ctx.fillRect(object.properties.coords[0] - 1.5, object.properties.coords[1] - 1.5, 3, 3)
                ctx.lineWidth = 2
                //vectorX
                ctx.beginPath()
                ctx.moveTo(object.properties.coords[0], object.properties.coords[1])
                ctx.lineTo(object.properties.coords[0] + vectorScale * object.properties.velocity[0], object.properties.coords[1])
                ctx.strokeStyle = 'red'
                ctx.stroke()
                ctx.closePath()
                //vectorY
                ctx.beginPath()
                ctx.strokeStyle = 'green'
                ctx.moveTo(object.properties.coords[0], object.properties.coords[1])
                ctx.lineTo(object.properties.coords[0], object.properties.coords[1] + vectorScale * object.properties.velocity[1])
                ctx.stroke()
                ctx.closePath()
            }
        }

        frame++
        console.log('frame #')

        if (frame <= 5000) {
            window.requestAnimationFrame(gameLoop)
        }
    }
    gameLoop()
    // setInterval(gameLoop, 1000)
}