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
                radius: 0,
            }

            let speed = 1
            let clicked = false
            return {
                draw: () => {
                    if (clicked) {
                        let path = new Path2D
                        let radius = properties.radius
                        if (radius > 0) {
                            ctx.beginPath(path)
                            path.arc(properties.coords[0], properties.coords[1], radius, 0, 2 * Math.PI)
                            path.lineWidth = 3
                            ctx.closePath(path)
                            ctx.strokeStyle = color
                            ctx.stroke(path)
                            properties.radius -= speed
                        }
                        else if (radius <= 0) {
                            clicked = false
                        }
                    }
                },

                clickedNow: () => {
                    clicked = true
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
                height: 170,
                coordsToReach: initialCoords,
                speed: 1.5
            }

            let slope, x0, y0, cosTheta, horizontalIncrement;
            let coordsToReachChangedFlag = true
            let path = new Path2D

            return {
                draw() {
                    if (properties.coordsToReach !== properties.coords) {
                        if (coordsToReachChangedFlag) {
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
                        will not stop  at that point...to avoid this in the case when horizontal shift will go ahead of the destination 
                        point i move the object to the destination immediately and stop. */
                        if (properties.coordsToReach[0] - (properties.coords[0] + horizontalIncrement) > 0) {
                            if (cosTheta >= 0) {
                                //moving towards right
                                properties.coords[0] = properties.coords[0] + horizontalIncrement
                                properties.coords[1] = slope * (properties.coords[0] - x0) + y0
                            }
                            else if (cosTheta <= 0) {
                                //moving towards left
                                properties.coords = properties.coordsToReach
                                coordsToReachChangedFlag = false
                            }
                        }
                        else if (properties.coordsToReach[0] - (properties.coords[0] + horizontalIncrement) <= 0) {
                            if (cosTheta >= 0) {
                                properties.coords = properties.coordsToReach
                                coordsToReachChangedFlag = false
                            }
                            else if (cosTheta < 0) {
                                properties.coords[0] = properties.coords[0] + horizontalIncrement
                                properties.coords[1] = slope * (properties.coords[0] - x0) + y0
                            }
                        }
                    }
                    ctx.fillStyle = 'white'
                    ctx.fillRect(properties.coords[0], properties.coords[1], properties.width, properties.height)
                },

                moveTo(coords) {
                    properties.coordsToReach = coords
                    coordsToReachChangedFlag = true
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
        const theHeroProps = theHero.getProperties()
        const theCursor = moveHereCursor(ctx, 'lightgreen')
        const theCursorProps = theCursor.getProperties()

        function paintScene() {
            paintBackground(ctx, '#3a2081')
            theCursor.draw()
            // if (theHeroProps.coords !== theHeroProps.coordsToReach) {
                theHero.draw()
            // }
            if (isDebugging && currentMouseCoords) {
                setCanvasFont(ctx, { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '15' })
                ctx.fillText(`x:${currentMouseCoords[0]}, y:${currentMouseCoords[1]}`, currentMouseCoords[0], currentMouseCoords[1])
            }
        }

        paintScene()

        canvas.addEventListener('click', (event) => {
            let mouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
            theHero.moveTo(mouseCoords)
            theCursorProps.coords = mouseCoords
            theCursorProps.radius = 20
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