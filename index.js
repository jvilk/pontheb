"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const PENIS_IMAGE = "img/penis.png";
const BABY_IMAGE = "img/baby.png";
const TARGET_IMAGE = "img/target.png";
const PENIS_SCALE_FACTOR = 15;
const BABY_SCALE_FACTOR = 10;
const TARGET_SCALE_FACTOR = 10;
const CRY_SOUND = new Audio("sound/crying.ogg");
const LAUGH_SOUND = new Audio("sound/laughing.ogg");
const COO_SOUND = new Audio("sound/cooing.mp3");
function playSound(a) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res) => {
            a.play();
            a.onended = function () {
                a.onended = null;
                res();
            };
        });
    });
}
function playSoundForScore(score) {
    return __awaiter(this, void 0, void 0, function* () {
        if (score > 98) {
            return playSound(LAUGH_SOUND);
        }
        if (score > 90) {
            return playSound(COO_SOUND);
        }
        return playSound(CRY_SOUND);
    });
}
function loadAsset(src) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res) => {
            const img = document.createElement("img");
            img.src = src;
            img.onload = function () {
                res(img);
            };
        });
    });
}
function loadAssets() {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            baby: yield loadAsset(BABY_IMAGE),
            penis: yield loadAsset(PENIS_IMAGE),
            target: yield loadAsset(TARGET_IMAGE),
        };
    });
}
function initCanvas(canvas) {
    canvas.height = 800;
    canvas.width = 1024;
}
function fillCanvas(ctx, color) {
    const { height, width } = ctx.canvas;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
}
function overlaps(a, b) {
    return (Math.abs(a.coords.x - b.coords.x) * 2 < a.width + b.width &&
        Math.abs(a.coords.y - b.coords.y) * 2 < a.height + b.height);
}
function randomCoords(ctx, imageHeight, imageWidth, exclusionBox) {
    const { width, height } = ctx.canvas;
    // Clamp random values to range baby can fit in.
    const maxWidth = width - imageWidth;
    const maxHeight = height - imageHeight;
    let maxLoop = 1000;
    while (maxLoop--) {
        const x = Math.ceil(Math.random() * maxWidth) + imageWidth / 2;
        const y = Math.ceil(Math.random() * maxHeight) + imageHeight / 2;
        const coords = { x, y };
        if (!overlaps(exclusionBox, {
            coords,
            height: imageHeight,
            width: imageWidth,
        })) {
            return { x: x, y };
        }
    }
    return { x: imageHeight, y: imageWidth };
}
function drawBaby(ctx, baby, coords) {
    let { x, y } = coords;
    const babyWidth = baby.width / BABY_SCALE_FACTOR;
    const babyHeight = baby.height / BABY_SCALE_FACTOR;
    x = x - babyWidth / 2;
    y = y - babyHeight / 2;
    ctx.drawImage(baby, x, y, babyWidth, babyHeight);
    // Calculate optimal penis coordinates
    return { x: x + 45, y: y + 100 };
}
function waitForMouseMovement(canvas) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res) => {
            canvas.onmousemove = function (e) {
                canvas.onmousemove = null;
                res({ x: e.offsetX, y: e.offsetY });
            };
        });
    });
}
function drawPenis(ctx, penis, coords) {
    const { x, y } = coords;
    const penisWidth = penis.width / PENIS_SCALE_FACTOR;
    const penisHeight = penis.height / PENIS_SCALE_FACTOR;
    ctx.drawImage(penis, x - penisWidth / 2, y - penisHeight / 2, penisWidth, penisHeight);
}
function drawTarget(ctx, target, coords) {
    const { x, y } = coords;
    const targetWidth = target.width / TARGET_SCALE_FACTOR;
    const targetHeight = target.height / TARGET_SCALE_FACTOR;
    ctx.drawImage(target, x - targetWidth / 2, y - targetHeight / 2, targetWidth, targetHeight);
}
function waitForMouseClick(canvas) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((res) => {
            canvas.onmouseup = function (e) {
                canvas.onmouseup = null;
                res({ x: e.offsetX, y: e.offsetY });
            };
        });
    });
}
function drawLine(ctx, from, to, color) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.lineWidth = 5;
    ctx.strokeStyle = color;
    ctx.stroke();
}
function drawText(ctx, coords, text) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(text, coords.x, coords.y);
}
function randomMovement(ctx, box, avoidBox, maxDistance) {
    let maxLoop = 1000;
    while (maxLoop--) {
        const d = Math.random() * maxDistance;
        const angle = Math.random() * 2 * Math.PI;
        const newCoords = {
            x: box.coords.x + Math.cos(angle) * d,
            y: box.coords.y + Math.sin(angle) * d,
        };
        if (newCoords.x < box.width / 2 || newCoords.y < box.height / 2) {
            continue;
        }
        if (newCoords.x > ctx.canvas.width - box.width ||
            newCoords.y > ctx.canvas.height - box.height) {
            continue;
        }
        if (overlaps({ coords: newCoords, height: box.height, width: box.width }, avoidBox)) {
            continue;
        }
        return newCoords;
    }
    return box.coords;
}
function drawBox(ctx, box) {
    ctx.beginPath();
    const startX = box.coords.x - Math.floor(box.width / 2) + 5;
    const startY = box.coords.y - Math.floor(box.height / 2) + 5;
    const endX = box.coords.x + Math.floor(box.width / 2) - 5;
    const endY = box.coords.y + Math.floor(box.height / 2) - 5;
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, endY);
    ctx.lineTo(endX, endY);
    ctx.lineTo(endX, startY);
    ctx.lineTo(startX, startY);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "black";
    ctx.stroke();
}
function blankBox(ctx, box) {
    const startX = box.coords.x - Math.floor(box.width / 2);
    const startY = box.coords.y - Math.floor(box.height / 2);
    ctx.fillStyle = "white";
    ctx.fillRect(startX, startY, box.width, box.height);
}
function distance(from, to) {
    const xDelta = from.x - to.x;
    const yDelta = from.y - to.y;
    return Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const canvas = document.getElementById("canvas");
        initCanvas(canvas);
        const ctx = canvas.getContext("2d");
        const images = yield loadAssets();
        // TODO: corral for pointer, baby cannot be where pointer is, ...
        // Game loop.
        while (true) {
            // Get mouse pointer location.
            drawText(ctx, { x: 100, y: canvas.height - 100 }, `Click to begin.`);
            const initialClickCoords = yield waitForMouseClick(canvas);
            fillCanvas(ctx, "white");
            const mousePrison = { coords: initialClickCoords, height: 100, width: 100 };
            drawBox(ctx, mousePrison);
            let babyCoords = randomCoords(ctx, images.baby.height / BABY_SCALE_FACTOR, images.baby.width / BABY_SCALE_FACTOR, mousePrison);
            let targetCoords = drawBaby(ctx, images.baby, babyCoords);
            let screenIsBlack = false;
            const difficulty = parseFloat(document.getElementById("difficulty").value);
            const babyMover = setInterval(() => {
                let babyBox = {
                    coords: babyCoords,
                    height: images.baby.height / BABY_SCALE_FACTOR,
                    width: images.baby.width / BABY_SCALE_FACTOR,
                };
                babyCoords = randomMovement(ctx, babyBox, mousePrison, difficulty);
                if (!screenIsBlack) {
                    blankBox(ctx, babyBox);
                    drawBaby(ctx, images.baby, babyCoords);
                }
            }, 0.4);
            while (true) {
                const coords = yield waitForMouseMovement(canvas);
                if (!overlaps(mousePrison, { coords, height: 1, width: 1 })) {
                    break;
                }
            }
            screenIsBlack = true;
            fillCanvas(ctx, "black");
            const clickCoords = yield waitForMouseClick(canvas);
            clearInterval(babyMover);
            fillCanvas(ctx, "white");
            targetCoords = drawBaby(ctx, images.baby, babyCoords);
            drawLine(ctx, clickCoords, targetCoords, "red");
            drawPenis(ctx, images.penis, clickCoords);
            drawTarget(ctx, images.target, targetCoords);
            const d = distance(clickCoords, targetCoords);
            const score = ((canvas.width - d) / canvas.width) * 100;
            drawText(ctx, { x: 100, y: 100 }, `Score: ${score.toFixed(2)}`);
            yield playSoundForScore(score);
        }
    });
}
main();
