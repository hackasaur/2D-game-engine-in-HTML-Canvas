import { createPoint, setCanvasFont, getFontHeight, getCharacterWidth, isXYInsideBox, paintBackground } from './modules/canvas.js';

function main() {
    const canvas = document.getElementById('scene')
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = window.innerWidth / 2
        ctx.canvas.height = window.innerHeight - 20

        const moveHereCursor = (ctx, coords, color) => {
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
                getProperties: () => {
                    return properties
                }
            }
        }

        const playerObject = (ctx, initialCoords, allObjects = []) => {
            const properties = {
                coords: initialCoords,
                width: 40,
                height: 60,
                coordsToReach: initialCoords,
                speed: 1,
                inMotion: false
            }

            let slope, x0, y0, cosTheta, horizontalIncrement;
            let prevCoords
            let calculated = false

            function isColliding(allObjects) {
                let bottomRightCoords = createPoint(properties.coords[0] + properties.width, properties.coords[1] + properties.height)
                allObjects.forEach((obj) => {
                    let props = obj.getProperties()
                    let objBottomLeftCoords = createPoint(props.coords[0], props.coords[1] + props.Hight)
                    let objBottomRightCoords = createPoint(props.coords[0] + props.width, props.coords[1] + props.height)
                    let objTopRightCoords = createPoint(props.coords[0] + props.width, props.coords[1])
                    if (isXYInsideBox(props.coords, properties.coords, bottomRightCoords)) {
                        return true
                    }
                    if (isXYInsideBox(objTopRightCoords, properties.coords, bottomRightCoords)) {
                        return true
                    }
                    if (isXYInsideBox(objBottomRightCoords, properties.coords, bottomRightCoords)) {
                        return true
                    }
                    if (isXYInsideBox(objBottomLeftCoords, properties.coords, bottomRightCoords)) {
                        return true
                    }
                })
                return false
            }
            //initial draw
            ctx.fillStyle = 'blue'
            ctx.fillRect(properties.coords[0], properties.coords[1], properties.width, properties.height)


            return {
                draw() {
                    if (properties.inMotion === true) {
                        if (properties.coordsToReach !== properties.coords) {
                            prevCoords = properties.coords
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
                            point i move the object to the destination directly and stop. */
                            if (properties.coordsToReach[0] - (properties.coords[0] + horizontalIncrement) > 0) {
                                if (cosTheta >= 0) {
                                    //moving towards right
                                    properties.coords = createPoint(
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
                                    properties.coords = createPoint(
                                        properties.coords[0] + horizontalIncrement,
                                        slope * (properties.coords[0] - x0) + y0
                                    )
                                }
                            }
                        }
                        if(isColliding(allObjects)){
                            properties.coors = prevCoords
                        }
                    }
                    //draw object at new incremented coords
                    ctx.fillStyle = 'blue'
                    ctx.fillRect(properties.coords[0], properties.coords[1], properties.width, properties.height)
                },

                moveTo(coords) {
                    properties.coordsToReach = coords
                    calculated = false
                    properties.inMotion = true
                },

                getProperties() {
                    return properties
                }
            }
        }

        paintBackground(ctx, '#3a2081')

        let isDebugging = true
        let heroInitialCoords = createPoint(100, 100)

        let currentMouseCoords
        const backgroundImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
        // paintBackground(ctx, 'black')
        const allObjects = []
        const theHero = playerObject(ctx, heroInitialCoords, allObjects)
        const theHero2 = playerObject(ctx, createPoint(200, 200), allObjects)
        allObjects.push(theHero, theHero2)
        const cursors = []

        const clearMovedObjects = (objects, backgroundImageData) => {
            objects.forEach(obj => {
                let properties = obj.getProperties()
                if (properties.inMotion) {
                    ctx.putImageData(
                        backgroundImageData,
                        properties.coords[0],
                        properties.coords[1],
                        0,
                        0,
                        properties.width + 1,
                        properties.height + 1)
                }
            })
        }

        const clearCursor = (cursors) => {
            cursors.forEach((cursor) => {
                let properties = cursor.getProperties()
                if (properties.isAnimating) {
                    ctx.putImageData(
                        backgroundImageData,
                        properties.coords[0] - properties.radius - properties.lineWidth,
                        properties.coords[1] - properties.radius - properties.lineWidth,
                        0,
                        0,
                        2 * (properties.radius + properties.lineWidth),
                        2 * (properties.radius + properties.lineWidth)
                    )
                }
                else if (properties.isAnimation === false) {
                    cursors.pop(cursor)
                }
            })
        }

        function paintScene() {
            // paintBackground(ctx, '#3a2081')
            clearMovedObjects(allObjects, backgroundImageData)
            clearCursor(cursors)
            theHero.draw()
            theHero2.draw()
            cursors.forEach((cursor) => { cursor.draw() })

            // if (isDebugging && currentMouseCoords) {
            //     setCanvasFont(ctx, { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '15' })
            //     ctx.fillText(`x:${currentMouseCoords[0]}, y:${currentMouseCoords[1]}`, currentMouseCoords[0], currentMouseCoords[1])
            // }
        }

        canvas.addEventListener('click', (event) => {
            let mouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
            theHero.moveTo(mouseCoords)
            theHero2.moveTo(mouseCoords)
            cursors.push(moveHereCursor(ctx, mouseCoords, 'lightgreen'))
        })

        canvas.addEventListener('mousemove', (event) => {
            currentMouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
        })

        let frame = 1
        function gameLoop() {
            paintScene()

            if (frame <= 5000) {
                window.requestAnimationFrame(gameLoop)
            }

            frame++
            console.log('frame #')
        }
        gameLoop()

        // setInterval(paintScene, 100)
    }
}

window.addEventListener('load', main)