function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const createPoint = (x, y) => {
    let point = new Int8Array(2)
    point = [x, y]
    return point
}

const setCanvasFont = (ctx, font) => {
    ctx.fillStyle = `${font.color}`
    ctx.font = `${font.size}px ${font.font}`
}

const getFontHeight = (ctx) => {
    return ctx.measureText('l').fontBoundingBoxAscent
}

const getCharacterWidth = (ctx, character) => {
    return ctx.measureText(character).width
}

const isXYInsideBox = (point, topLeftCoords, bottomRightCoords) => {
            return (
                point[0] >= topLeftCoords[0] && 
                point[0] <= bottomRightCoords[0] && 
                point[1] >= topLeftCoords[1] && 
                point[1] <= bottomRightCoords[1])
        }

const paintBackground = (ctx, color, width, height) => {
    ctx.fillStyle = color
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height)
}
export {sleep, createPoint, setCanvasFont, getFontHeight, getCharacterWidth, isXYInsideBox, paintBackground}