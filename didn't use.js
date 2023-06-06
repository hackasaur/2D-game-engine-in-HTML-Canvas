const backgroundImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)

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

const clearCursor = (cursors, backgroundImageData) => {
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
clearMovedObjects(allObjects, backgroundImageData)
clearCursor(cursors, backgroundImageData)


function isColliding(self, allObjects) {
    //returns true/false if the object is colliding with other objects
    let colliding = false
    let objectName
    for (let object of allObjects) {
        if (self === object) {
            continue
        }

        if (canvasTools.areBoxesOverlapping(properties.coords, properties.width, properties.height, object.properties.coords, object.properties.width, object.properties.height)) {
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


// create random objects
for (let i = 0; i < 8; i++) {
	let obj
	obj = gameEngine.createObject(ctx, `obj${i}`,
		canvasTools.createPoint(ctx.canvas.width * Math.random(), ctx.canvas.height * Math.random())
	)
	obj.properties.color = colors[Math.floor(3 * Math.random())]
	obj.properties.width = Math.round(10 + 60 * Math.random())
	obj.properties.height = Math.round(10 + 60 * Math.random())
	allObjects.push(obj)
}



prevCoords = canvasTools.createPoint(properties.coords[0], properties.coords[1])

if (properties.coordsToReach[0] !== properties.coords[0]
    || properties.coordsToReach[1] !== properties.coords[1]) {
    if (calculated === false) {
        let deltaX = properties.coordsToReach[0] - properties.coords[0]
        let deltaY = properties.coordsToReach[1] - properties.coords[1]
        slope = deltaY / deltaX
        let distanceFromCoordsTillCoordsToReach = Math.sqrt(deltaX ** 2 + deltaY ** 2)
        cosTheta = deltaX / distanceFromCoordsTillCoordsToReach
        // let horizontalIncrement = properties.speed * cosTheta
        // properties.velocity = canvasTools.createPoint(horizontalIncrement, slope * horizontalIncrement)
        properties.velocity = canvasTools.createPoint(Speed * cosTheta, Speed * slope * cosTheta)
        calculated = true
    }

    //logic for moving in a line towards the target coords
    /* we can simply add a shift in the coords along the slope but the destination point will get missed and the object 
    will not stop  at that point...to avoid this, in the case when the horizontal shift will go ahead of the destination 
    point it will move the object to the destination directly and stop. */
    if (properties.coordsToReach[0] - (properties.coords[0] + properties.velocity[0]) > 0) {
        // if (cosTheta >= 0) {
        //     //moving towards right and the coordsToReach will still be on the right
        //     properties.coords[0] += properties.speed * properties.velocity[0]
        //     properties.coords[1] += properties.speed * properties.velocity[1]
        // }
        if (cosTheta < 0) {
            //moving towards left and coordsToReach will have passed to the right
            properties.coords = canvasTools.createPoint(properties.coordsToReach[0], properties.coordsToReach[1])
            properties.velocity = canvasTools.createPoint(0, 0)
        }
    }

    else if (properties.coordsToReach[0] - (properties.coords[0] + properties.velocity[0]) <= 0) {
        if (cosTheta >= 0) {
            //moving towards right and the coordsToReach will have passed to the left
            properties.coords = canvasTools.createPoint(properties.coordsToReach[0], properties.coordsToReach[1])
            properties.velocity = canvasTools.createPoint(0, 0)
        }
        // else if (cosTheta < 0) {
        //     //moving towards left and the coordsToReach will still be on the left
        //     properties.coords[0] += properties.speed * properties.velocity[0]
        //     properties.coords[1] += properties.speed * properties.velocity[1]
        // }
    }
}


export const whereTwoRectsOverlap = (topLeftCoords1, width1, height1, topLeftCoords2, width2, height2) => {
    let topRightCoords1 = createPoint(topLeftCoords1[0] + width1, topLeftCoords1[1])
    let bottomRightCoords1 = createPoint(topLeftCoords1[0] + width1, topLeftCoords1[1] + height1)
    let bottomLeftCoords1 = createPoint(topLeftCoords1[0], topLeftCoords1[1] + height1)

    let cornerCoords1 = [topLeftCoords1, topRightCoords1, bottomRightCoords1, bottomLeftCoords1]

    for (let coord of cornerCoords1) {
        if (isPointInsideBox(coord, topLeftCoords2, width2, height2)) {
            return coord
        }
    }
    // if (isPointInsideBox(topLeftCoords1, topLeftCoords2, width2, height2)) {
    //     return topLeftCoords1
    // }
    // else if (isPointInsideBox(topRightCoords1, topLeftCoords2, width2, height2)) {
    //     return topRightCoords1
    // }
    // else if (isPointInsideBox(bottomRightCoords1, topLeftCoords2, width2, height2)) {
    //     return bottomRightCoords1
    // }
    // else if (isPointInsideBox(bottomLeftCoords1, topLeftCoords2, width2, height2){
    //     return bottomLeftCoords1
    // }

    let topRightCoords2 = createPoint(topLeftCoords2[0] + width2, topLeftCoords2[1])
    let bottomRightCoords2 = createPoint(topLeftCoords2[0] + width2, topLeftCoords2[1] + height2)
    let bottomLeftCoords2 = createPoint(topLeftCoords2[0], topLeftCoords2[1] + height2)

    let cornerCoords2 = [topLeftCoords2, topRightCoords2, bottomRightCoords2, bottomLeftCoords2]

    for (let coord of cornerCoords2) {
        if (isPointInsideBox(coord, topLeftCoords1, width1, height1)) {
            return coord
        }
    }

    // if (isPointInsideBox(topLeftCoords2, topLeftCoords1, width1, height1)) {
    //     return topLeftCoords2
    // }
    // else if (isPointInsideBox(topRightCoords2, topLeftCoords1, width1, height1)) {
    //     return topRightCoords2
    // }
    // else if (isPointInsideBox(bottomRightCoords2, topLeftCoords1, width1, height1)) {
    //     return bottomRightCoords2
    // }
    // else if (isPointInsideBox(bottomLeftCoords2, topLeftCoords1, width1, height1)) {
    //     return bottomLeftCoords2
    // }
    return undefined
}


export const areBoxesOverlapping = (topLeftCoords1, width1, height1, topLeftCoords2, width2, height2) => {
    let topRightCoords1 = vector2D(topLeftCoords1[0] + width1, topLeftCoords1[1])
    let bottomRightCoords1 = vector2D(topLeftCoords1[0] + width1, topLeftCoords1[1] + height1)
    let bottomLeftCoords1 = vector2D(topLeftCoords1[0], topLeftCoords1[1] + height1)

    if (isPointInsideBox(topLeftCoords1, topLeftCoords2, width2, height2) ||
        isPointInsideBox(topRightCoords1, topLeftCoords2, width2, height2) ||
        isPointInsideBox(bottomRightCoords1, topLeftCoords2, width2, height2) ||
        isPointInsideBox(bottomLeftCoords1, topLeftCoords2, width2, height2)
    ) {
        return true
    }

    let topRightCoords2 = vector2D(topLeftCoords2[0] + width2, topLeftCoords2[1])
    let bottomRightCoords2 = vector2D(topLeftCoords2[0] + width2, topLeftCoords2[1] + height2)
    let bottomLeftCoords2 = vector2D(topLeftCoords2[0], topLeftCoords2[1] + height2)

    if (isPointInsideBox(topLeftCoords2, topLeftCoords1, width1, height1) ||
        isPointInsideBox(topRightCoords2, topLeftCoords1, width1, height1) ||
        isPointInsideBox(bottomRightCoords2, topLeftCoords1, width1, height1) ||
        isPointInsideBox(bottomLeftCoords2, topLeftCoords1, width1, height1)
    ) {
        return true
    }
    return false
}
