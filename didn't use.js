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
