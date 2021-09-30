import * as canvasTools from './canvas tools.js';

export const createObject = (ctx, name, initialCoords, allObjects = []) => {
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

    let slope, x0, y0, cosTheta, horizontalIncrement, prevCoords
    let calculated = false

    function isColliding(self, allObjects) {
        let colliding = false
        let objectName
        for (let obj of allObjects) {
            if (self === obj) {
                continue
            }

            let bottomRightCoords = canvasTools.createPoint(properties.coords[0] + properties.width, properties.coords[1] + properties.height)
            let props = obj.getProperties()
            let objBottomLeftCoords = canvasTools.createPoint(props.coords[0], props.coords[1] + props.height)
            let objBottomRightCoords = canvasTools.createPoint(props.coords[0] + props.width, props.coords[1] + props.height)
            let objTopRightCoords = canvasTools.createPoint(props.coords[0] + props.width, props.coords[1])

            if (canvasTools.isPointInsideBox(props.coords, properties.coords, bottomRightCoords) ||
                canvasTools.isPointInsideBox(objTopRightCoords, properties.coords, bottomRightCoords) ||
                canvasTools.isPointInsideBox(objBottomRightCoords, properties.coords, bottomRightCoords) ||
                canvasTools.isPointInsideBox(objBottomLeftCoords, properties.coords, bottomRightCoords)
            ) {
                colliding = true
                objectName = props.name
                break
            }

            bottomRightCoords = canvasTools.createPoint(props.coords[0] + props.width, props.coords[1] + props.height)
            objBottomLeftCoords = canvasTools.createPoint(properties.coords[0], properties.coords[1] + properties.height)
            objBottomRightCoords = canvasTools.createPoint(properties.coords[0] + properties.width, properties.coords[1] + properties.height)
            objTopRightCoords = canvasTools.createPoint(properties.coords[0] + properties.width, properties.coords[1])

            if (canvasTools.isPointInsideBox(properties.coords, props.coords, bottomRightCoords) ||
                canvasTools.isPointInsideBox(objTopRightCoords, props.coords, bottomRightCoords) ||
                canvasTools.isPointInsideBox(objBottomRightCoords, props.coords, bottomRightCoords) ||
                canvasTools.isPointInsideBox(objBottomLeftCoords, props.coords, bottomRightCoords)
            ) {
                colliding = true
                objectName = props.name
                break
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

            if (isColliding(this, allObjects)) {
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

export const updateAndPaintScene = (sceneObjects, sceneCursors) => {
    sceneObjects.forEach((obj) => { obj.update(); obj.draw() })

    for (let i = 0; i < sceneCursors.length; i++) {
        let cursor = sceneCursors[i]
        let isAnimating = cursor.getProperties().isAnimating
        if (isAnimating) {
            cursor.draw()
        }
        else if (isAnimating === false) {
            sceneCursors.splice(i, 1)
        }
    }
}