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

    let obj1Coords = [  [topLeftCoords1,  topRightCoords1], 
                        [bottomLeftCoords1, bottomRightCoords1]]
    
    for(let i=0; i <= 1; i++){
        for(let j=0; j <= 1; j++){
            if(isPointInsideBox(obj1Coords[i][j], topLeftCoords2, width2, height2)){
                return {overlap: true, object : 1, coords: [j, i]}
            }
        }
    }

    let topRightCoords2 = vector2D(topLeftCoords2[0] + width2, topLeftCoords2[1])
    let bottomRightCoords2 = vector2D(topLeftCoords2[0] + width2, topLeftCoords2[1] + height2)
    let bottomLeftCoords2 = vector2D(topLeftCoords2[0], topLeftCoords2[1] + height2)

    let obj2Coords = [  [topLeftCoords2,  topRightCoords2], 
                        [bottomLeftCoords2, bottomRightCoords2]]

    for(let i=0; i <= 1; i++){
        for(let j=0; j <= 1; j++){
            if(isPointInsideBox(obj2Coords[i][j], topLeftCoords1, width1, height1)){
                return {overlap: true, object : 2, coords: [j, i]}
            }
        }
    }
    
    return {overlap: false}
}

export function areColliding(object1, object2) {
    /*works only for straight rectangles*/
    let colliding

    let topLeftCoords1 = vector2D(
        object1.properties.coords[0] - object1.properties.width / 2,
        object1.properties.coords[1] - object1.properties.height / 2)

    let topLeftCoords2 = vector2D(
        object2.properties.coords[0] - object2.properties.width / 2,
        object2.properties.coords[1] - object2.properties.height / 2)

    colliding = areBoxesOverlapping(
        topLeftCoords1, object1.properties.width, object1.properties.height,
        topLeftCoords2, object2.properties.width, object2.properties.height
    )

    // if (colliding) {
    //     console.log(object1.properties.name, ' collided with ', object2.properties.name)
    // }
    return colliding
}


export function coordsAtCollision(object1, object2, object1CoordsBeforeHit, object2CoordsBeforeHit) {
    let object1Coords, object2Coords, horizontal

    console.assert(!isNaN(object1CoordsBeforeHit[0]) && !isNaN(object1CoordsBeforeHit[1]), `${object1CoordsBeforeHit}`)
    console.assert(!isNaN(object2CoordsBeforeHit[0]) && !isNaN(object2CoordsBeforeHit[1]), `${object2CoordsBeforeHit}`)

    // // console.assert(Math.abs(object2.properties.velocity[0] - object1.properties.velocity[0]) > 0 &&
    //     Math.abs(object2.properties.velocity[1] - object1.properties.velocity[1]) > 0 , `${object1.properties.velocity}, ${object2.properties.velocity}`)

    //timeOfCollisionFor2Rects = (X1 - X2 +- (l1 + l2)/2) / (Vx2 - Vx1) --symmetric for y
    // console.log(object1.properties.velocity, object2.properties.velocity)

    let timeOfHorizontalCollision = Math.min(
        (object1CoordsBeforeHit[0] - object2CoordsBeforeHit[0]
            + (object1.properties.width + object2.properties.width) / 2) / (object2.properties.velocity[0] - object1.properties.velocity[0]),
        (object1CoordsBeforeHit[0] - object2CoordsBeforeHit[0]
            - (object1.properties.width + object2.properties.width) / 2) / (object2.properties.velocity[0] - object1.properties.velocity[0])
    )

    let timeOfVerticalCollision = Math.min(
        (object1CoordsBeforeHit[1] - object2CoordsBeforeHit[1]
            + (object1.properties.height + object2.properties.height) / 2) / (object2.properties.velocity[1] - object1.properties.velocity[1]),
        (object1CoordsBeforeHit[1] - object2CoordsBeforeHit[1]
            - (object1.properties.height + object2.properties.height) / 2) / (object2.properties.velocity[1] - object1.properties.velocity[1])
    )
    // console.log('time of Horizontal', timeOfHorizontalCollision)
    // console.log('time of vertical', timeOfVerticalCollision)

    if (timeOfHorizontalCollision >= 0) {
        // if ((timeOfHorizontalCollision < timeOfVerticalCollision) || timeOfVerticalCollision < 0) {
        if ((timeOfVerticalCollision >= 0 && timeOfHorizontalCollision < timeOfVerticalCollision) || timeOfVerticalCollision < 0) {
            object1Coords = vector2D(
                object1CoordsBeforeHit[0] + object1.properties.velocity[0] * timeOfHorizontalCollision,
                object1CoordsBeforeHit[1] + object1.properties.velocity[1] * timeOfHorizontalCollision
            )
            object2Coords = vector2D(
                object2CoordsBeforeHit[0] + object2.properties.velocity[0] * timeOfHorizontalCollision,
                object2CoordsBeforeHit[1] + object2.properties.velocity[1] * timeOfHorizontalCollision
            )
            horizontal = true
        }

    }
    else if (timeOfVerticalCollision >= 0) {
        if ((timeOfHorizontalCollision >= 0 && timeOfVerticalCollision < timeOfHorizontalCollision) || timeOfHorizontalCollision < 0) {
            object1Coords = vector2D(
                object1CoordsBeforeHit[0] + object1.properties.velocity[0] * timeOfVerticalCollision,
                object1CoordsBeforeHit[1] + object1.properties.velocity[1] * timeOfVerticalCollision
            )
            object2Coords = vector2D(
                object2CoordsBeforeHit[0] + object2.properties.velocity[0] * timeOfVerticalCollision,
                object2CoordsBeforeHit[1] + object2.properties.velocity[1] * timeOfVerticalCollision
            )
            horizontal = false
        }
    }
    else {
        object1Coords = object1CoordsBeforeHit
        object2Coords = object2CoordsBeforeHit
    }
    return [object1Coords, object2Coords, horizontal]
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