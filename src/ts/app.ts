{
  type Inventory = {
    stones: number;
    soil: number;
    wood: number;
    leaves: number;
    grass: number;
  };
  type Figure = {
    name: string;
    scheme: string[][];
  };
  const trees: Figure[] = [
    {
      name: "poplar",
      scheme: [
        ["", "", "l", "", ""],
        ["", "l", "l", "l", ""],
        ["", "l", "l", "l", ""],
        ["l", "l", "w", "l", "l"],
        ["l", "l", "w", "l", "l"],
        ["", "l", "w", "l", ""],
        ["", "l", "w", "l", ""],
        ["", "", "w", "", ""],
        ["", "", "w", "", ""],
      ],
    },
    {
      name: "spruce",
      scheme: [
        ["", "", "l", "", ""],
        ["", "", "l", "", ""],
        ["", "l", "l", "l", ""],
        ["", "l", "w", "l", ""],
        ["l", "l", "w", "l", "l"],
        ["l", "l", "w", "l", "l"],
        ["", "", "w", "", ""],
        ["", "", "w", "", ""],
      ],
    },
    {
      name: "baobab",
      scheme: [
        ["", "", "", "l", "", "", ""],
        ["", "", "l", "l", "l", "", ""],
        ["", "l", "l", "l", "l", "l", ""],
        ["", "l", "l", "w", "l", "l", ""],
        ["", "l", "l", "w", "l", "l", ""],
        ["l", "l", "w", "w", "w", "l", "l"],
        ["l", "l", "w", "w", "w", "l", "l"],
        ["l", "l", "w", "w", "w", "l", "l"],
        ["", "", "w", "w", "w", "", ""],
        ["", "", "w", "w", "w", "", ""],
      ],
    },
  ];

  const introPage = document.getElementById("intro-page")! as HTMLDivElement;
  const startBtn = introPage.querySelector("#start")! as HTMLButtonElement;
  const gamePage = document.getElementById("game-page")! as HTMLDivElement;
  const board = gamePage.querySelector("#board")! as HTMLDivElement;
  const toolCtrl = gamePage.querySelector("#tools")! as HTMLDivElement;
  const inventoryCtrl = gamePage.querySelector("#inventory")! as HTMLDivElement;
  const SOIL_HEIGHT = 2;
  const STONE_HEIGHT = 2;
  const GRASS_HEIGHT = 1;
  class App {
    static tools = ["axe", "pickaxe", "shovel", "scythe"];
    static currentTool = "";
    static inventory: Inventory = {
      stones: 0,
      soil: 0,
      wood: 0,
      leaves: 0,
      grass: 0,
    };
    public maxInventory = 12;
    static itemPickedToBuild: HTMLDivElement | null = null;
    constructor() {
      const numOfRows = getComputedStyle(board)
        .getPropertyValue("grid-template-rows")
        .split(" ").length;
      this.fillGrid(STONE_HEIGHT, numOfRows, "stones");
      this.fillGrid(SOIL_HEIGHT, numOfRows - STONE_HEIGHT, "soil");
      this.fillGrid(
        GRASS_HEIGHT,
        numOfRows - STONE_HEIGHT - SOIL_HEIGHT,
        "grass"
      );

      startBtn.addEventListener("click", () => this.start());
      board.addEventListener("click", function (e) {
        //2 modes: take item to inventory, and put item from inventory.

        const el = e.target as HTMLDivElement;
        const item = el.dataset?.item ?? "";

        if (item in App.inventory && el.dataset.tool === App.currentTool) {
          //check if you can reach this item: one of its neighbor cells must not be block!
          const st = getComputedStyle(el);
          const [gridRowStart, gridColumnStart] = [
            st.gridRowStart,
            st.gridColumnStart,
          ];
          console.log(gridRowStart, gridColumnStart);

          const neighbors = [...board.children].filter((el) => {
            const style = getComputedStyle(el);
            const [r, c] = [+style.gridRowStart, +style.gridColumnStart];

            return (
              ((r === +gridRowStart - 1 || r === +gridRowStart + 1) &&
                c === +gridColumnStart) ||
              ((c === +gridColumnStart - 1 || c === +gridColumnStart + 1) &&
                r === +gridRowStart)
            );
          });
          console.log(neighbors);

          if (neighbors.length === 4) {
            throw new Error(`Can't reach this item!`);
          }
          //take to inventory:
          App.inventory[item as keyof Inventory]++;
          //update number on the screen:
          //find element to update by data-item
          const toUpdate = [...inventoryCtrl.children].find(
            (el) => el.firstElementChild!.getAttribute("data-item") === item
          );
          toUpdate!.querySelector(".quantity")!.textContent = `${
            App.inventory[item as keyof Inventory]
          }`;
          el.remove();
        }
      });
      toolCtrl.addEventListener("click", function (e) {
        const tool = e.target as HTMLDivElement;
        if (App.tools.includes(tool.id)) {
          App.currentTool = tool.id;
          const activeTool = toolCtrl.querySelector(".active");
          const newToolIndex = App.tools.indexOf(App.currentTool);
          activeTool?.classList.remove("active");
          toolCtrl.children[newToolIndex].classList.add("active");
        }
      });
      inventoryCtrl.addEventListener("click", function (e) {
        const target = e.target as HTMLDivElement;
        if (!target.classList.contains("inventory-item")) {
          return;
        }
        const item = target
          .querySelector(".item-picture")!
          .getAttribute("data-item")!;
        //get qty of item from state:
        const quantity = App.inventory[item as keyof Inventory];
        if (quantity === 0) {
          throw new Error("Nothing to take!");
        }
        App.inventory[item as keyof Inventory]--;
        //now we should put it to the free grid cell:
        const el = document.createElement("div");
        el.classList.add("block");
        el.setAttribute("data-item", item);
        let tool = "axe";
        switch (item) {
          case "grass":
            tool = "scythe";
            break;
          case "stones":
            tool = "pickaxe";
            break;
          case "soil":
            tool = "shovel";
            break;
        }
        el.setAttribute("data-tool", tool);
        App.itemPickedToBuild = el;
      });
      if (App.itemPickedToBuild) {
        board.addEventListener("click", function (e) {
          const target = e.target as HTMLDivElement;
          if (target.classList.contains("block")) {
            return;
          }
        });
      }
    }

    resetState() {
      App.currentTool = "";
      for (const key in App.inventory) {
        App.inventory[key as keyof Inventory] = 0;
      }
    }
    start() {
      introPage.classList.toggle("hidden");
      gamePage.classList.toggle("hidden");
      const randomTree = () => trees[Math.floor(Math.random() * trees.length)];
      const [tree1, tree2] = [randomTree(), randomTree()];
      const place1 = Math.floor(4 * Math.random() + tree1.scheme[0].length / 2);
      const place2 = Math.floor(
        20 - 4 * Math.random() - tree2.scheme[0].length / 2
      );
      this.putFigure(place1, tree1.name);
      this.putFigure(place2, tree2.name);
    }
    putFigure(col: number, treeName: string) {
      const cells = [...board.children] as HTMLDivElement[];
      const cellToPlant = cells.filter((el) => el.dataset.item === "grass")[
        col
      ];
      const level = parseInt(cellToPlant.style.gridRow);

      //check if there is enough width to plant:
      const tree = trees.find((t) => t.name === treeName);
      if (!tree) {
        throw new Error(`Tree with name ${treeName} does not exist!`);
      }
      const [treeHeight, treeWidth] = [
        tree.scheme.length,
        tree.scheme[0].length,
      ];
      //check if tree will be inside the borders
      const hw = Math.floor(treeWidth / 2);
      const cols =
        getComputedStyle(board).gridTemplateColumns.split(" ").length;

      if (col - hw < 0 || col + hw > cols) {
        throw new Error("Out of the borders!");
      }
      //check if there are no blocks in needed area:
      const blocks = cells.filter((cell) => {
        const area = getComputedStyle(cell).gridArea;
        const [r, c] = area
          .split(" ")
          .map((el) => +el)
          .filter((el) => !isNaN(el));
        //   console.log(r, c);
        //needed area: [col-hw,col+hw] X [level-treeHeight,level]
        return (
          col - hw <= c &&
          c <= col + hw &&
          level - treeHeight <= r &&
          r <= level
        );
      });
      //console.log(blocks);
      for (let i = 0; i < treeHeight; i++) {
        for (let j = 0; j < treeWidth; j++) {
          if (!tree.scheme[i][j]) {
            continue;
          }
          const seg = document.createElement("div");
          seg.classList.add("block");
          seg.setAttribute("data-tool", "axe");
          seg.style.gridArea = `${level - treeHeight + i + 1} / ${
            col - hw + j + 1
          }`;
          switch (tree.scheme[i][j]) {
            case "w":
              seg.setAttribute("data-item", "wood");
              break;
            case "l":
              seg.setAttribute("data-item", "leaves");
              break;
          }

          board.appendChild(seg);
        }
      }
    }

    fillGrid(depth: number, bottom: number, material: keyof Inventory) {
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
              //  block.classList.remove("block");
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
  new App();
}
