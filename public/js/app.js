"use strict";
{
    const trees = [
        {
            name: "poplar",
            height: 7,
            width: 5,
            scheme: [
                ["", "", "l", "", ""],
                ["", "l", "l", "l", ""],
                ["l", "l", "l", "l", "l"],
                ["", "l", "w", "l", ""],
                ["", "", "w", "", ""],
                ["", "", "w", "", ""],
                ["", "", "w", "", ""],
            ],
        },
        {
            name: "spruce",
            height: 7,
            width: 7,
            scheme: [
                ["", "", "", "l", "", "", ""],
                ["", "", "l", "l", "l", "", ""],
                ["", "l", "l", "l", "l", "l", ""],
                ["l", "l", "l", "l", "l", "l", "l"],
                ["", "", "", "w", "", "", ""],
                ["", "", "", "w", "", "", ""],
                ["", "", "", "w", "", "", ""],
            ],
        },
    ];
    const introPage = document.getElementById("intro-page");
    const startBtn = introPage.querySelector("#start");
    const gamePage = document.getElementById("game-page");
    const board = gamePage.querySelector("#board");
    const toolCtrl = gamePage.querySelector("#tools");
    const inventoryCtrl = gamePage.querySelector("#inventory");
    const SOIL_HEIGHT = 2;
    const STONE_HEIGHT = 2;
    const GRASS_HEIGHT = 1;
    class App {
        constructor() {
            this.maxInventory = 12;
            this.direction = "right";
            this.coords = {
                row: 16,
                col: 2,
            };
            const numOfRows = getComputedStyle(board)
                .getPropertyValue("grid-template-rows")
                .split(" ").length;
            this.fillGrid(STONE_HEIGHT, numOfRows, "stones");
            this.fillGrid(SOIL_HEIGHT, numOfRows - STONE_HEIGHT, "soil");
            this.fillGrid(GRASS_HEIGHT, numOfRows - STONE_HEIGHT - SOIL_HEIGHT, "grass");
            startBtn.addEventListener("click", () => this.start());
            board.addEventListener("click", function (e) {
                //2 modes: take item to inventory, and put item from inventory.
                //need addeventlistener instead!
                const el = e.target;
                const item = el.dataset?.item ?? "";
                if (item in App.inventory && el.dataset.tool === App.currentTool) {
                    //take to inventory:
                    App.inventory[item]++;
                    //update number on the screen:
                    //find element to update by data-item
                    const toUpdate = [...inventoryCtrl.children].find((el) => el.firstElementChild.getAttribute("data-item") === item);
                    toUpdate.querySelector(".quantity").textContent = `${App.inventory[item]}`;
                    el.remove();
                }
            });
            toolCtrl.addEventListener("click", function (e) {
                const tool = e.target;
                if (App.tools.includes(tool.id)) {
                    App.currentTool = tool.id;
                    const activeTool = toolCtrl.querySelector(".active");
                    const newToolIndex = App.tools.indexOf(App.currentTool);
                    activeTool?.classList.remove("active");
                    toolCtrl.children[newToolIndex].classList.add("active");
                }
            });
        }
        resetState() {
            App.currentTool = "";
            for (const key in App.inventory) {
                App.inventory[key] = 0;
            }
        }
        start() {
            console.log("start");
            introPage.classList.toggle("hidden");
            gamePage.classList.toggle("hidden");
            const cells = [...board.children];
            const cell = cells.find((el) => {
                const crds = el.style.gridArea.split(" ").filter((el) => !isNaN(+el));
                return +crds[0] === this.coords.row && +crds[1] === this.coords.col;
            });
            console.log(cell);
        }
        plantTree(row, col, treeName) {
            //check if cell[row][col] is grass
            //check if there are free rectangle with height 7 and width 5 for tree or 7 for spruce:
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
                    block.classList.add("block");
                    let tool = "scythe";
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
                    block.setAttribute("data-item", material);
                    block.setAttribute("data-tool", tool);
                    block.style.gridArea = `${i} / ${j}`;
                    board.appendChild(block);
                }
            }
        }
    }
    App.tools = ["axe", "pickaxe", "shovel", "scythe"];
    App.currentTool = "";
    App.inventory = { stones: 0, soil: 0, wood: 0, grass: 0 };
    new App();
}
