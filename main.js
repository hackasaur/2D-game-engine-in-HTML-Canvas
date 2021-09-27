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
                speed: 1.5
            }

            let slope, x0, y0, cosTheta, horizontalIncrement;
            let reached = false
            let done = false
            let imageDataBehind

            const getObjectImageData = () => {
                return ctx.getImageData(properties.coords[0], properties.coords[1], properties.width + 1, properties.height + 1);
            }

            return {
                draw() {
                    if (imageDataBehind && reached === false) {
                        ctx.putImageData(imageDataBehind, properties.coords[0], properties.coords[1])
                    }

                    if (properties.coordsToReach !== properties.coords) {
                        if (reached === false) {
                            let deltaX = properties.coordsToReach[0] - properties.coords[0]
                            let deltaY = properties.coordsToReach[1] - properties.coords[1]
                            x0 = properties.coords[0]
                            y0 = properties.coords[1]
                            slope = deltaY / deltaX
                            let distanceFromCoordsTillCoordsToReach = Math.sqrt(deltaX ** 2 + deltaY ** 2)
                            cosTheta = deltaX / distanceFromCoordsTillCoordsToReach
                            horizontalIncrement = properties.speed * cosTheta
                        }
                        /* we can simply add a shift in the coords along the slope but the destination point will get missed and the object 
                        will not stop  at that point...to avoid this, in the case when the horizontal shift will go ahead of the destination 
                        point i move the object to the destination directly and stop. */
                        if (properties.coordsToReach[0] - (properties.coords[0] + horizontalIncrement) > 0) {
                            if (cosTheta >= 0) {
                                //moving towards right
                                properties.coords[0] = properties.coords[0] + horizontalIncrement
                                properties.coords[1] = slope * (properties.coords[0] - x0) + y0
                            }
                            else if (cosTheta <= 0) {
                                //moving towards left
                                properties.coords = properties.coordsToReach
                                done = true
                            }
                        }
                        else if (properties.coordsToReach[0] - (properties.coords[0] + horizontalIncrement) <= 0) {
                            if (cosTheta >= 0) {
                                properties.coords = properties.coordsToReach
                                done = true
                            }
                            else if (cosTheta < 0) {
                                properties.coords[0] = properties.coords[0] + horizontalIncrement
                                properties.coords[1] = slope * (properties.coords[0] - x0) + y0
                            }
                        }
                    }

                    if (reached === false) {
                        //reached === false ensures that it does not get self's image data when putImageData() is not called.
                        //gets the image data behind at shifted coords
                        imageDataBehind = getObjectImageData()

                        ctx.fillStyle = 'blue'
                        ctx.fillRect(properties.coords[0], properties.coords[1], properties.width, properties.height)
                        if (done) {
                            reached = true
                            done = false
                        }
                    }
                },

                moveTo(coords) {
                    properties.coordsToReach = coords
                    reached = false
                },

                getProperties() {
                    return properties
                }
            }
        }

        let isDebugging = true
        let heroInitialCoords = createPoint(100, 100)
        let currentMouseCoords

        const theHero = playerObject(ctx, heroInitialCoords)
        const theHero2 = playerObject(ctx, createPoint(200,200))
        const theHeroProps = theHero.getProperties()
        const theCursor = moveHereCursor(ctx, 'lightgreen')
        const theCursorProps = theCursor.getProperties()

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

        paintBackground(ctx, '#3a2081')
        paintScene()

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