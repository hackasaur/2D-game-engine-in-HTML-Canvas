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
