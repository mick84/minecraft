"use strict";
{
    const introPage = document.getElementById("intro-page");
    const gamePage = document.getElementById("game-page");
    const board = gamePage.querySelector("#board");
    const startBtn = introPage.querySelector("#start");
    const SOIL_HEIGHT = 2;
    const STONE_HEIGHT = 3;
    class App {
        constructor() {
            this.tools = ["axe", "pickaxe", "shovel", "scythe"];
            this.currentTool = this.tools[0];
            this.inventory = { stones: 0, soil: 0, wood: 0, grass: 0 };
            this.maxInventory = 12;
            this.start();
            const numOfRows = getComputedStyle(board)
                .getPropertyValue("grid-template-rows")
                .split(" ").length;
            console.log(numOfRows);
            this.fillGrid(STONE_HEIGHT, numOfRows, "stones");
            this.fillGrid(SOIL_HEIGHT, numOfRows - STONE_HEIGHT, "soil");
        }
        resetState() {
            this.currentTool = this.tools[0];
            for (const key in this.inventory) {
                this.inventory[key] = 0;
            }
        }
        start() {
            console.log("start");
            introPage.classList.toggle("hidden");
            gamePage.classList.toggle("hidden");
        }
        fillGrid(depth, bottom, material) {
            const boardWidth = getComputedStyle(board)
                .getPropertyValue("grid-template-columns")
                .split(" ").length;
            const boardHeight = getComputedStyle(board)
                .getPropertyValue("grid-template-rows")
                .split(" ").length;
            //fill from the bottom upwards
            for (let i = bottom; i > bottom - depth; i--) {
                for (let j = 1; j <= boardWidth; j++) {
                    //create element:
                    const block = document.createElement("div");
                    block.classList.add("block", material);
                    let tool;
                    switch (material) {
                        case "soil":
                            tool = "shovel";
                            break;
                        case "stones":
                            tool = "pickaxe";
                            break;
                        case "wood":
                            tool = "axe";
                            break;
                        case "grass":
                            tool = "scythe";
                            break;
                    }
                    block.setAttribute("data-tool", tool);
                    block.style.gridArea = `${i} /${j} / span 1/ span 1`;
                    board.appendChild(block);
                }
            }
        }
    }
    const app = new App();
    startBtn.onclick = () => app.start();
    board.onclick = function (e) {
        const el = e.target;
        const classes = [...el.classList];
        if (classes.some((cls) => cls in app.inventory)) {
            console.log("ok");
        }
    };
}
