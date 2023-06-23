export const setCanvasFont = (ctx, font) => {
    ctx.fillStyle = `${font.color}`
    ctx.font = `${font.size}px ${font.font}`
}

export const getFontHeight = (ctx) => {
    return ctx.measureText('l').fontBoundingBoxAscent
}

export const getCharacterWidth = (ctx, character) => {
    return ctx.measureText(character).width
}

export const paintBackground = (ctx, color, width, height) => {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}