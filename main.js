import {sleep, createPoint, setCanvasFont, getFontHeight, getCharacterWidth, isXYInsideBox} from './modules/canvas.js';

function draw() {
    const canvas = document.createElement('canvas')
    canvas.setAttribute('id', 'screen')
    canvas.innerHTML = 'canvas element did not load.'

    if (canvas.getContext) {
        const ctx = canvas.getContext('2d')
        ctx.canvas.width = window.innerWidth
        ctx.canvas.height = window.innerHeight

      
        async function main() {
            if (frameNumber <= 5000) {
                window.requestAnimationFrame(main)
            }
        
        frameNumber++
        console.log('frame #')
        }
    }
}

window.addEventListener('load', draw)
