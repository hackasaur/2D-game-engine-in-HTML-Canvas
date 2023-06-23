import * as txtTools from './text tools.js';
import * as physics from './physics.js';

export const createObject = (ctx, name, coords) => {
    const properties = {
        name: name,
        coords: physics.vector2D(coords[0], coords[1]),
        color: 'white',
        width: 30,
        height: 60,
        // coordsToReach: physics.vector2D(coords[0], coords[1]),
        velocity: physics.vector2D(0, 0),
        shadowOffset: physics.vector2D(0, 0),
        animations: [],
        sidesColliding: [],
    }

    let slope, cosTheta, prevCoords, coordsToReach
    let Speed = 0
    let calculated = false
    let moveTo = false

    return {
        properties,
        draw(debug = false) {
            console.assert(!isNaN(properties.coords[0]) && !isNaN(properties.coords[1]), `${properties.coords}`)
            // if (debug) {
                let path = new Path2D
                ctx.beginPath(path)
                path.rect(properties.coords[0] - properties.width / 2, properties.coords[1] - properties.height / 2, properties.width, properties.height)
                ctx.strokeStyle = properties.color
                ctx.stroke(path)
                ctx.closePath(path)
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
                ctx.shadowOffsetX = properties.shadowOffset[0];
                ctx.shadowOffsetY = properties.shadowOffset[1];
            // }
            properties.animations.forEach((animation) => {
                if (animation['play']) {
                    console.assert(animation['sprite'] != undefined, `${animation}`)
                    if (animation['sprite']) {
                        ctx.drawImage(animation['sprite'], animation.startCoords[0] + (animation.offset * Math.round(animation.frameNo)), animation.startCoords[1], animation.size[0], animation.size[1], properties.coords[0] - properties.width / 2, properties.coords[1] - properties.height / 2, animation.size[0], animation.size[1])
                        if (animation.frameNo < (animation.noOfFrames - 1)) {
                            animation.frameNo += animation.playbackSpeed
                        }
                        else {
                            animation.frameNo = 0
                        }
                    }
                }
            })

            //reset shadowColor
            ctx.shadowColor = 'rgba(0,0,0,0)'
        },

        update() {

            prevCoords = physics.vector2D(properties.coords[0], properties.coords[1])
            let threshold = 2


            if (moveTo && (coordsToReach[0] !== properties.coords[0]
                || coordsToReach[1] !== properties.coords[1])) {

                if (calculated === false) {
                    let deltaX = coordsToReach[0] - properties.coords[0]
                    let deltaY = coordsToReach[1] - properties.coords[1]
                    if (deltaX !== 0) {
                        slope = deltaY / deltaX
                        let distanceFromCoordsTillCoordsToReach = Math.sqrt(deltaX ** 2 + deltaY ** 2)
                        cosTheta = deltaX / distanceFromCoordsTillCoordsToReach
                        properties.velocity = physics.vector2D(Speed * cosTheta, Speed * slope * cosTheta)
                    }
                    else if (deltaY !== 0) {
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

                if (Math.abs(coordsToReach[0] - (properties.coords[0] + properties.velocity[0])) <= threshold &&
                    Math.abs(coordsToReach[1] - (properties.coords[1] + properties.velocity[1])) <= threshold) {
                    //moving towards left and coordsToReach will have passed to the right
                    properties.coords = physics.vector2D(coordsToReach[0], coordsToReach[1])
                    properties.velocity = physics.vector2D(0, 0)
                    moveTo = false
                }
            }

            properties.coords[0] += properties.velocity[0]
            properties.coords[1] += properties.velocity[1]

            console.assert(!isNaN(properties.coords[0]) && !isNaN(properties.coords[1]), `${properties.coords}`)
            console.assert(!isNaN(prevCoords[0]) && !isNaN(prevCoords[1]), `${prevCoords}`)
        },

        moveTo(coords, speed) {
            coordsToReach = coords
            Speed = speed
            calculated = false
            moveTo = true
        },

        // undoUpdate() {
        //     properties.coords = prevCoords //prevCoords is used for collision resolution
        // },

        coordsBeforeUpdate() {
            return prevCoords
        },

        addAnimationFromSprite(name, sprite, startCoords, offset, noOfFrames, size, playbackSpeed) {
            properties.animations.push({
                "name": name,
                "sprite": sprite,
                "startCoords": startCoords,
                "offset": offset,
                "noOfFrames": noOfFrames,
                "frameNo": 0,
                "size": size,
                "playbackSpeed": playbackSpeed,
                "play": false
            })
        },

        playAnimation(name){
            properties.animations.forEach((animation) => {
                if(animation.name === name){
                    animation.play = true
                }
                else if(animation.name !== name){
                    animation.play = false
                }
            })
        },

        stopAnimation(){
            properties.animations.forEach((animation) => {
                    animation.play = false
            })
        }
    }
}

export const controlsBuffer = () => {
    let buffer = []

    return {
        buffer,
        push(key){
            buffer.push(key)
        },
        shift(){
            let key = buffer.shift()
            return key
        }
    }
}

const updateCollidingObjectPairs = (collidingObjectPairs) => {

    for (let pair of collidingObjectPairs) {
        let object1 = pair.pair[0]
        let object2 = pair.pair[1]
        let coordsWhenCollide = physics.coordsAtCollision(object1, object2, object1.coordsBeforeUpdate(), object2.coordsBeforeUpdate())

        if (coordsWhenCollide[2]) { //colliding horizontally
            object1.properties.coords[0] = coordsWhenCollide[0][0]
            object2.properties.coords[0] = coordsWhenCollide[1][0]
            object1.properties.velocity[0] = 0

            if(pair.object == 1){
                if(pair.coords[0] == 0){
                    object1.properties.sidesColliding.push("LEFT")
                    object2.properties.sidesColliding.push("RIGHT")
                }
                else if(pair.coords[0] == 1){
                    object1.properties.sidesColliding.push("RIGHT")
                    object2.properties.sidesColliding.push("LEFT")
                }
            }
            else if(pair.object == 2){
                if(pair.coords[0] == 0){
                    object2.properties.sidesColliding.push("LEFT")
                    object1.properties.sidesColliding.push("RIGHT")
                }
                else if(pair.coords[0] == 1){
                    object2.properties.sidesColliding.push("RIGHT")
                    object1.properties.sidesColliding.push("LEFT")
                }
            }
            
        }
        else { //colliding vertically
            object1.properties.coords[1] = coordsWhenCollide[0][1]
            object2.properties.coords[1] = coordsWhenCollide[1][1]
            object1.properties.velocity[1] = 0

            if(pair.object == 1){
                if(pair.coords[1] == 0){
                    object1.properties.sidesColliding.push("TOP")
                    object2.properties.sidesColliding.push("BOTTOM")
                }
                else if(pair.coords[1] == 1){
                    object1.properties.sidesColliding.push("BOTTOM")
                    object2.properties.sidesColliding.push("TOP")
                }
            }
            else if(pair.object == 2){
                if(pair.coords[1] == 0){
                    object2.properties.sidesColliding.push("TOP")
                    object1.properties.sidesColliding.push("BOTTOM")
                }
                else if(pair.coords[1] == 1){
                    object2.properties.sidesColliding.push("BOTTOM")
                    object1.properties.sidesColliding.push("TOP")
                }
            }
        }

        // console.log(`${object1.properties.name}: ${object1.properties.sidesColliding}`)
        // console.log(`${object2.properties.name}: ${object2.properties.sidesColliding}`)

        console.assert(!isNaN(object1.properties.coords[0]) && !isNaN(object1.properties.coords[1]), `${object1.properties.coords}`)
        console.assert(!isNaN(object2.properties.coords[0]) && !isNaN(object2.properties.coords[1]), `${object2.properties.coords}`)
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
            else if (physics.areColliding(object1, object2).overlap) {
                let collisionInfo = physics.areColliding(object1, object2)     
                collidingObjectPairs.push({pair:[object1, object2], object:collisionInfo.object, coords: collisionInfo.coords})
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
        obj.properties.sidesColliding = []
    })

    updateCollidingObjectPairs(collidingObjectPairs(sceneObjects))

    sceneObjects.forEach((obj) => {
        obj.properties.shadowOffset = shadowOffsetForObject(obj, lightSource)
    })

    sceneCursors.forEach((cursor) => {
        cursor.update()
    })
}

export const paintScene = (sceneObjects, sceneCursors, lightSource, debug = false) => {
    lightSource.draw()

    sceneObjects.forEach((obj) => {
        obj.draw(debug)
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

export const startGameLoop = (canvas, allObjects, cursors, lightSource, debug = false, code = () => { return 0 }) => {
    //allObjects is an array containing all the collidable objects of the scene. 
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

        if (keyPressed === ' ') {
            if (running == false) {
                running = true
            }
            else if (running == true) {
                running = false
            }
        }
    })

    function gameLoop(timeStamp) {
        code()

        if (running) {
            txtTools.paintBackground(ctx, '#353347')
            updateScene(allObjects, cursors, lightSource)
            paintScene(allObjects, cursors, lightSource, debug)

            //FPS
            // Calculate the number of seconds passed since the last frame
            secondsPassed = (timeStamp - oldTimeStamp) / 1000;
            oldTimeStamp = timeStamp
            // Calculate fps
            fps = Math.round(1 / secondsPassed);

            //show fps
            ctx.fillStyle = 'black'
            txtTools.setCanvasFont(ctx, { font: 'Arial', size: '25px', color: 'white' })
            ctx.fillText("FPS: " + fps, 50, 20)

            if (debug) {
                if (mouseCoords) {
                    txtTools.setCanvasFont(ctx, { font: 'Fira Mono', color: 'black', size: '10' })
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
                    txtTools.setCanvasFont(ctx, { font: 'Fira Mono', color: 'black', size: '10' })
                    ctx.fillText(`${Math.round(Math.sqrt(object.properties.velocity[0] ** 2 + object.properties.velocity[1] ** 2))}`, object.properties.coords[0], object.properties.coords[1])
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