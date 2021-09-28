import { createPoint, setCanvasFont, getFontHeight, getCharacterWidth, isXYInsideBox, paintBackground } from './modules/canvas.js';

function main() {
    const canvas = document.getElementById('scene')
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = window.innerWidth - 20
        ctx.canvas.height = window.innerHeight - 20
        ctx.imageSmoothingEnabled = false
        // ctx.translate(0.5, 0.5)

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

        const createObject = (ctx, name, initialCoords, allObjects = []) => {
            const properties = {
                name: name,
                coords: initialCoords,
                color: 'white',
                width: 30,
                height: 60,
                coordsToReach: initialCoords,
                speed: 1.5,
                inMotion: false
            }

            console.log('initial: ',properties)
            let slope, x0, y0, cosTheta, horizontalIncrement, prevCoords
            let calculated = false

            function isColliding(self, allObjects) {
                let colliding = false
                let objectName
                for (let obj of allObjects) {
                    if (self === obj) {
                        continue
                    }
                    
                    let bottomRightCoords = createPoint(properties.coords[0] + properties.width, properties.coords[1] + properties.height)
                    let props = obj.getProperties()
                    let objBottomLeftCoords = createPoint(props.coords[0], props.coords[1] + props.height)
                    let objBottomRightCoords = createPoint(props.coords[0] + props.width, props.coords[1] + props.height)
                    let objTopRightCoords = createPoint(props.coords[0] + props.width, props.coords[1])

                    if (isXYInsideBox(props.coords, properties.coords, bottomRightCoords) ||
                        isXYInsideBox(objTopRightCoords, properties.coords, bottomRightCoords) ||
                        isXYInsideBox(objBottomRightCoords, properties.coords, bottomRightCoords) ||
                        isXYInsideBox(objBottomLeftCoords, properties.coords, bottomRightCoords)
                    ) {
                        colliding = true
                        // // objectName = props.name
                        // // break
                    }
                    console.log(props, properties)


                    bottomRightCoords = createPoint(props.coords[0] + props.width, props.coords[1] + props.height)
                    objBottomLeftCoords = createPoint(properties.coords[0], properties.coords[1] + properties.height)
                    objBottomRightCoords = createPoint(properties.coords[0] + properties.width, properties.coords[1] + properties.height)
                    objTopRightCoords = createPoint(properties.coords[0] + properties.width, properties.coords[1])

                    console.log(props, properties)

                    if (isXYInsideBox(properties.coords, props.coords, bottomRightCoords) ||
                        isXYInsideBox(objTopRightCoords, props.coords, bottomRightCoords) ||
                        isXYInsideBox(objBottomRightCoords, props.coords, bottomRightCoords) ||
                        isXYInsideBox(objBottomLeftCoords, props.coords, bottomRightCoords)
                    ) {
                        colliding = true
                        // objectName = props.name
                        // break
                    }
                }

                if (colliding) {
                    console.log('collided with: ', objectName)
                }
                return colliding
            }

            return {
                draw() {
                    // console.log('drawing object ', properties)
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

                    if (isColliding(this, allObjects)) {
                        console.log('collided')
                        properties.coords = prevCoords
                    }
                },

                moveTo(coords) {
                    properties.coordsToReach = coords
                    calculated = false
                    // properties.inMotion = true
                },

                getProperties() {
                    return properties
                }
            }
        }


        let isDebugging = true
        let currentMouseCoords
        const allObjects = []

        let heroInitialCoords = createPoint(100, 100)
        const theHero = createObject(ctx, 'hero', heroInitialCoords, allObjects)
        const theHero2 = createObject(ctx, 'hero2', createPoint(200, 200), allObjects)
        console.log(theHero2.getProperties())
        allObjects.push(theHero, theHero2)

        let colors = ['blue', 'yellow', 'orange', 'grey']

        // create random objects
        for (let i = 0; i < 8; i++) {
            let obj
            obj = createObject(ctx, `obj${i}`, createPoint(ctx.canvas.width * Math.random(), ctx.canvas.height * Math.random()))
            let props = obj.getProperties()
            props.color = colors[Math.floor(3 * Math.random())]
            props.width = Math.round(70 * Math.random())
            props.height = Math.round(70 * Math.random())
            allObjects.push(obj)
        }

        const cursors = []

        function updateAndPaintScene(sceneObjects, sceneCursors) {
            allObjects.forEach((obj) => { obj.update(); obj.draw() })
            cursors.forEach((cursor) => { cursor.draw() })
        }

        canvas.addEventListener('click', (event) => {
            let mouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
            theHero.moveTo(mouseCoords)
            theHero2.moveTo(mouseCoords)
            cursors.push(moveHereCursor(ctx, mouseCoords, 'GreenYellow'))
        })

        canvas.addEventListener('mousemove', (event) => {
            currentMouseCoords = createPoint(event.x - canvas.offsetLeft, event.y - canvas.offsetTop)
        })

        let secondsPassed
        let oldTimeStamp
        let fps;
        let frame = 1

        function gameLoop(timeStamp) {
            paintBackground(ctx, '#3a2081')
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
            setCanvasFont(ctx, { font: 'Arial', size: '25px', color: 'white' })
            ctx.fillText("FPS: " + fps, 10, 10)

            //mouse coordinates
            if (isDebugging && currentMouseCoords) {
                setCanvasFont(ctx, { fontStyle: 'Fira Mono', fontColor: 'grey', fontSize: '15' })
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