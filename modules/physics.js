export const vector2D = (x, y) => {
    let point = [x,y]
    return point
}

export const isPointInsideBox = (point, topLeftCoords, width, height) => {
    return (
        point[0] > topLeftCoords[0] &&
        point[0] < topLeftCoords[0] + width &&
        point[1] > topLeftCoords[1] &&
        point[1] < topLeftCoords[1] + height)
}

export const isPointInsideBox2 = (point, topLeftCoords, bottomRightCoords) => {
    return (
        point[0] >= topLeftCoords[0] &&
        point[0] <= bottomRightCoords[0] &&
        point[1] >= topLeftCoords[1] &&
        point[1] <= bottomRightCoords[1])
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

export function areColliding(object1, object2) {
    /*works only for straight rectangles*/
    let colliding = false

    let topLeftCoords1 = vector2D(
        object1.properties.coords[0] - object1.properties.width / 2,
        object1.properties.coords[1] - object1.properties.height / 2)

    let topLeftCoords2 = vector2D(
        object2.properties.coords[0] - object2.properties.width / 2,
        object2.properties.coords[1] - object2.properties.height / 2)

    colliding = areBoxesOverlapping(
        topLeftCoords2, object2.properties.width, object2.properties.height,
        topLeftCoords1, object1.properties.width, object1.properties.height
    )

    // if (colliding) {
    //     console.log(object1.properties.name, ' collided with ', object2.properties.name)
    // }
    return colliding
}


export function coordsAtCollision(object1, object2) {
    let object1Coords, object2Coords

    //timeOfCollisionFor2Rects = (X1 - X2 +- (l1 + l2)/2) / (Vx2 - Vx1) --symmetric for y
    let timeOfHorizontalCollision = Math.min(
        (object1.properties.coords[0] - object2.properties.coords[0]
            + (object1.properties.width + object2.properties.width) / 2) / (object2.properties.velocity[0] - object1.properties.velocity[0]),
        (object1.properties.coords[0] - object2.properties.coords[0]
            - (object1.properties.width + object2.properties.width) / 2) / (object2.properties.velocity[0] - object1.properties.velocity[0])
    )
    let timeOfVerticalCollision = Math.min(
        (object1.properties.coords[1] - object2.properties.coords[1]
            + (object1.properties.height + object2.properties.height) / 2) / (object2.properties.velocity[1] - object1.properties.velocity[1]),
        (object1.properties.coords[1] - object2.properties.coords[1]
            - (object1.properties.height + object2.properties.height) / 2) / (object2.properties.velocity[1] - object1.properties.velocity[1])
    )
    // console.log('time of Horizontal', timeOfHorizontalCollision)
    // console.log('time of vertical', timeOfVerticalCollision)

    if (timeOfHorizontalCollision >= 0) {
        if ((timeOfVerticalCollision >= 0 && timeOfHorizontalCollision < timeOfVerticalCollision) || timeOfVerticalCollision < 0) {
            object1Coords = vector2D(
                object1.properties.coords[0] + object1.properties.velocity[0] * timeOfHorizontalCollision,
                object1.properties.coords[1] + object1.properties.velocity[1] * timeOfHorizontalCollision
            )
            object2Coords = vector2D(
                object2.properties.coords[0] + object2.properties.velocity[0] * timeOfHorizontalCollision,
                object2.properties.coords[1] + object2.properties.velocity[1] * timeOfHorizontalCollision
            )
        }

    }
    else if (timeOfVerticalCollision >= 0) {
        if ((timeOfHorizontalCollision >= 0 && timeOfVerticalCollision < timeOfHorizontalCollision) || timeOfHorizontalCollision < 0) {
            object1Coords = vector2D(
                object1.properties.coords[0] + object1.properties.velocity[0] * timeOfVerticalCollision,
                object1.properties.coords[1] + object1.properties.velocity[1] * timeOfVerticalCollision
            )
            object2Coords = vector2D(
                object2.properties.coords[0] + object2.properties.velocity[0] * timeOfVerticalCollision,
                object2.properties.coords[1] + object2.properties.velocity[1] * timeOfVerticalCollision
            )
        }
    }
    return [object1Coords, object2Coords]
}

export const distanceBetweenPoints = (coords1, coords2) => {
    let deltaX = coords2[0] - coords1[0]
    let deltaY = coords2[1] - coords1[1]
    // slope = deltaY / deltaX
    return Math.sqrt(deltaX ** 2 + deltaY ** 2)
}

export const getSlope2Points = (coords1, coords2) => {
    let deltaX = coords2[0] - coords1[0]
    let deltaY = coords2[1] - coords1[1]
    return deltaY/deltaX
}