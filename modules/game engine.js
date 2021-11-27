import * as canvasTools from './canvas tools.js';

const areBoxesOverlapping = (topLeftCoords1, width1, height1, topLeftCoords2, width2, height2) => {
    let topRightCoords1 = canvasTools.createPoint(topLeftCoords1[0] + width1, topLeftCoords1[1])
    let bottomRightCoords1 = canvasTools.createPoint(topLeftCoords1[0] + width1, topLeftCoords1[1] + height1)
    let bottomLeftCoords1 = canvasTools.createPoint(topLeftCoords1[0], topLeftCoords1[1] + height1)

    if (canvasTools.isPointInsideBox(topLeftCoords1, topLeftCoords2, width2, height2) ||
        canvasTools.isPointInsideBox(topRightCoords1, topLeftCoords2, width2, height2) ||
        canvasTools.isPointInsideBox(bottomRightCoords1, topLeftCoords2, width2, height2) ||
        canvasTools.isPointInsideBox(bottomLeftCoords1, topLeftCoords2, width2, height2)
    ) {
        return true
    }

    let topRightCoords2 = canvasTools.createPoint(topLeftCoords2[0] + width2, topLeftCoords2[1])
    let bottomRightCoords2 = canvasTools.createPoint(topLeftCoords2[0] + width2, topLeftCoords2[1] + height2)
    let bottomLeftCoords2 = canvasTools.createPoint(topLeftCoords2[0], topLeftCoords2[1] + height2)

    if (canvasTools.isPointInsideBox(topLeftCoords2, topLeftCoords1, width1, height1) ||
        canvasTools.isPointInsideBox(topRightCoords2, topLeftCoords1, width1, height1) ||
        canvasTools.isPointInsideBox(bottomRightCoords2, topLeftCoords1, width1, height1) ||
        canvasTools.isPointInsideBox(bottomLeftCoords2, topLeftCoords1, width1, height1)
    ) {
        return true
    }
    return false
}

const checkCollisionAndUpdate = (objects) => {
    let objectsDone = []
    let objectsColliding = []
    function areColliding(object1, object2) {
        let colliding = false

        colliding = areBoxesOverlapping(object2.properties.coords, object2.properties.width, object2.properties.height, object1.properties.coords, object1.properties.width, object1.properties.height)

        if (colliding) {
            console.log(object1.properties.name, ' collided with ', object2.properties.name)
        }
        return colliding
    }

    for (let object1 of objects) {
        for (let object2 of objects) {
            if (objectsDone.includes(object2) || object1 === object2) {
                continue
            }
            else {
                if (areColliding(object1, object2)) {
                    object1.undoUpdate()
                    object2.undoUpdate()
                    break
                }
            }
        }
        objectsDone.push(object1)
    }
}

export const createObject = (ctx, name, initialCoords, allObjects = []) => {
    const properties = {
        name: name,
        coords: initialCoords,
        color: 'white',
        width: 30,
        height: 60,
        coordsToReach: initialCoords,
        speed: 1.5,
        inMotion: false,
        selectable: false
    }

    let slope, x0, y0, cosTheta, horizontalIncrement, prevCoords
    let calculated = false

    function isColliding(self, allObjects) {
        //returns true/false if the object is colliding with other objects
        let colliding = false
        let objectName
        for (let object of allObjects) {
            if (self === object) {
                continue
            }

            if (areBoxesOverlapping(properties.coords, properties.width, properties.height, object.properties.coords, object.properties.width, object.properties.height)) {
                colliding = true
                objectName = object.properties.name
                break
            }
        }

        if (colliding) {
            console.log('collided with: ', objectName)
        }
        return colliding
    }

    return {
        properties,
        draw() {
            let path = new Path2D
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
            ctx.shadowOffsetX = -5;
            ctx.shadowOffsetY = 5;
            ctx.beginPath(path)
            path.rect(properties.coords[0], properties.coords[1], properties.width, properties.height)
            ctx.fillStyle = properties.color
            ctx.fill(path)
            ctx.closePath(path)
            //reset shadowColor
            ctx.shadowColor = 'rgba(0,0,0,0)'
        },

        update() {
            // if (properties.inMotion === true) {
            prevCoords = properties.coords
            if (properties.coordsToReach !== properties.coords) {
                if (calculated === false) {
                    let deltaX = properties.coordsToReach[0] - properties.coords[0]
                    let deltaY = properties.coordsToReach[1] - properties.coords[1]
                    x0 = properties.coords[0]
                    y0 = properties.coords[1]
                    slope = deltaY / deltaX
                    let distanceFromCoordsTillCoordsToReach = Math.sqrt(deltaX ** 2 + deltaY ** 2)
                    cosTheta = deltaX / distanceFromCoordsTillCoordsToReach
                    horizontalIncrement = properties.speed * cosTheta
                    calculated = true
                }

                //logic for moving in a line towards the target coords
                /* we can simply add a shift in the coords along the slope but the destination point will get missed and the object 
                will not stop  at that point...to avoid this, in the case when the horizontal shift will go ahead of the destination 
                point it will move the object to the destination directly and stop. */
                if (properties.coordsToReach[0] - (properties.coords[0] + horizontalIncrement) > 0) {
                    if (cosTheta >= 0) {
                        //moving towards right
                        properties.coords = canvasTools.createPoint(
                            properties.coords[0] + horizontalIncrement,
                            slope * (properties.coords[0] - x0) + y0
                        )
                    }
                    else if (cosTheta < 0) {
                        //moving towards left
                        properties.coords = properties.coordsToReach
                        properties.inMotion = false
                    }
                }

                else if (properties.coordsToReach[0] - (properties.coords[0] + horizontalIncrement) <= 0) {
                    if (cosTheta >= 0) {
                        properties.coords = properties.coordsToReach
                        properties.inMotion = false
                    }
                    else if (cosTheta < 0) {
                        properties.coords = canvasTools.createPoint(
                            properties.coords[0] + horizontalIncrement,
                            slope * (properties.coords[0] - x0) + y0
                        )
                    }
                }
            }

            // if (isColliding(this, allObjects)) {
            //     properties.coords = prevCoords
            // }
        },

        moveTo(coords) {
            properties.coordsToReach = coords
            calculated = false
            properties.inMotion = true
        },

        undoUpdate() {
            properties.coords = prevCoords
        }
    }
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

export const updateAndPaintScene = (sceneObjects, sceneCursors) => {
    sceneObjects.forEach((obj) => {
        obj.update()
    })

    checkCollisionAndUpdate(sceneObjects)

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

export const startGameLoop = (canvas, allObjects, cursors, isDebugging = false, code = () => { return 0 }) => {
    //allObjects is a array containing all the objects of the scene. 
    //cursors is a array used to store the all the current moveHereCursors
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
        canvasTools.paintBackground(ctx, '#353347')
        code()
        updateAndPaintScene(allObjects, cursors)

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
        ctx.fillText("FPS: " + fps, 50, 20)

        //mouse coordinates
        if (isDebugging && mouseCoords) {
            canvasTools.setCanvasFont(ctx, { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '15' })
            ctx.fillText(`x:${mouseCoords[0]}, y:${mouseCoords[1]}`, mouseCoords[0], mouseCoords[1])
        }

        frame++
        console.log('frame #')

        if (frame <= 5000) {
            window.requestAnimationFrame(gameLoop)
        }
    }
    gameLoop()
}