function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const createPoint = (x, y) => {
    let point = new Int8Array(2)
    point = [x, y]
    return point
}

const setCanvasFont = (ctx, font) => {
    ctx.fillStyle = `${font.fontColor}`
    ctx.font = `${font.fontSize}px ${font.fontStyle}`
}

const getFontHeight = (ctx) => {
    return ctx.measureText('l').fontBoundingBoxAscent
}

const getCharacterWidth = (ctx, character) => {
    return ctx.measureText(character).width
}

const isXYInsideBox = (x, y, X1, Y1, X2, Y2) => {
            return (x > X1 && x <= X2 && y >= Y1 && y <= Y2)
        }

const paintBackground = (ctx, color, width, height) => {
    ctx.fillStyle = color
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height)
}
export {sleep, createPoint, setCanvasFont, getFontHeight, getCharacterWidth, isXYInsideBox, paintBackground}