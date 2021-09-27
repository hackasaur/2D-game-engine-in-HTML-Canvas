import { sleep, createPoint, setCanvasFont, getFontHeight, getCharacterWidth, isXYInsideBox, paintBackground } from './modules/canvas.js';

function main() {
    const canvas = document.getElementById('scene')
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = window.innerWidth / 2
        ctx.canvas.height = window.innerHeight - 20

        const moveHereCursor = (ctx, color) => {
            const properties = {
                coords: undefined,
                color: color,
                radius: 20,
                speed: 1,
                lineWidth: 3,
            }

            let clicked = false
            let animationRadius = properties.radius
            let imageDataBehind

            const getObjectImageData = () => {
                return ctx.getImageData(properties.coords[0] - properties.radius - properties.lineWidth,
                    properties.coords[1] - properties.radius - properties.lineWidth,
                    2 * (properties.radius + properties.lineWidth),
                    2 * (properties.radius + properties.lineWidth));
            }

            return {
                draw: () => {
                    if (clicked) {
                        let path = new Path2D
                        if (imageDataBehind) {
                            ctx.putImageData(imageDataBehind,
                                properties.coords[0] - properties.lineWidth - properties.radius,
                                properties.coords[1] - properties.radius - properties.lineWidth)
                        }
                        imageDataBehind = getObjectImageData()
                        if (animationRadius > 0) {
                            ctx.beginPath(path)
                            path.arc(properties.coords[0], properties.coords[1], animationRadius, 0, 2 * Math.PI)
                            path.lineWidth = 3
                            ctx.closePath(path)
                            ctx.strokeStyle = color
                            ctx.stroke(path)
                            animationRadius -= properties.speed
                            if (animationRadius <= 0) {
                                clicked = false
                                ctx.putImageData(imageDataBehind, properties.coords[0] - properties.radius, properties.coords[1] - properties.radius)
                                imageDataBehind = undefined
                            }
                        }
                        // else if (animationRadius <= 0) {
                        //     clicked = false
                        //     animationRadius = properties.radius
                        // }
                    }
                },

                clickedAt: (coords) => {
                    properties.coords = coords
                    clicked = true
                    animationRadius = properties.radius

                },

                getProperties: () => {
                    return properties
                }
            }
        }

        const playerObject = (ctx, initialCoords) => {
            const properties = {
                coords: initialCoords,
                width: 40,
                height: 60,
                coordsToReach: initialCoords,
                speed: 1.5,
                inMotion: false
            }

            let slope, x0, y0, cosTheta, horizontalIncrement;
            // let reached = false
            let calculated = false
            let imageDataBehind
            let previousCoords

            const getObjectImageData = () => {
                return ctx.getImageData(properties.coords[0], properties.coords[1], properties.width + 1, properties.height + 1);
            }

            imageDataBehind = getObjectImageData()
            //initial draw
            ctx.fillStyle = 'blue'
            ctx.fillRect(properties.coords[0], properties.coords[1], properties.width, properties.height)

            return {
                draw() {
                    if (properties.coordsToReach !== properties.coords) {
                        ctx.putImageData(imageDataBehind, properties.coords[0], properties.coords[1])

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
                                properties.inMotion = false
                            }
                            else if (cosTheta < 0) {
                                //moving towards left
                                properties.coords = properties.coordsToReach
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

                        //get the image data behind for the current coords
                        imageDataBehind = getObjectImageData()

                        //draw object at new incremented coords
                        ctx.fillStyle = 'blue'
                        ctx.fillRect(properties.coords[0], properties.coords[1], properties.width, properties.height)
                    }
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

        let isDebugging = true
        let heroInitialCoords = createPoint(100, 100)
        let currentMouseCoords

        paintBackground(ctx, '#3a2081')
        const backgroundImageData = getImageData(0,0, ctx.canvas.width, ctx.canvas.height)
        const theHero = playerObject(ctx, heroInitialCoords)
        const theHero2 = playerObject(ctx, createPoint(200, 200))
        const theHeroProps = theHero.getProperties()
        const theCursor = moveHereCursor(ctx, 'lightgreen')
        const theCursorProps = theCursor.getProperties()

        const clearMovedObjects = () => {

        }

        function paintScene() {
            // paintBackground(ctx, '#3a2081')
            theHero.draw()
            theHero2.draw()
            // theCursor.draw()
            // if (theHeroProps.coords !== theHeroProps.coordsToReach) {
            // }
            // if (isDebugging && currentMouseCoords) {
            //     setCanvasFont(ctx, { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '15' })
            //     ctx.fillText(`x:${currentMouseCoords[0]}, y:${currentMouseCoords[1]}`, currentMouseCoords[0], currentMouseCoords[1])
            // }
        }

        canvas.addEventListener('click', (event) => {
            let mouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
            theHero.moveTo(mouseCoords)
            theHero2.moveTo(mouseCoords)
            theCursor.clickedAt(mouseCoords)
        })

        canvas.addEventListener('mousemove', (event) => {
            currentMouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
        })

        let frame = 1
        function gameLoop() {
            if (frame <= 5000) {
                window.requestAnimationFrame(gameLoop)
            }

            paintScene()

            frame++
            console.log('frame #')

        }
        gameLoop()
    }
}

window.addEventListener('load', main)