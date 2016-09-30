/* Author: Kevin Costello
 * Date: 9/27/2016
 */

/* Need to confirm relation with structure of maze[][] to actual representation
 * on a web page; like are the rows really the rows?
 */

// arr is [r,c]
function getNeighbors(maze, r, c) {
    var row = r;
    var col = c;
    // Neighboring cells of the given one at (r, c)
    var neighbors = [];

    if (row + 2 >= 0 && row + 2 < maze.length && col >= 0 && col < maze[row].length &&
         maze[row + 2][col] === "IN") {
        neighbors.push([row + 2, col]);
    }
    if (row - 2 >= 0 && row - 2 < maze.length && col >= 0 && col < maze[row].length &&
         maze[row - 2][col] === "IN") {
        neighbors.push([row - 2, col]);
    }
    if (row >= 0 && row < maze.length && col + 2 >= 0 && col + 2 < maze[row].length &&
         maze[row][col + 2] === "IN") {
        neighbors.push([row, col + 2]);
    }
    if (row >= 0 && row < maze.length && col - 2 >= 0 && col - 2 < maze[row].length &&
         maze[row][col - 2] === "IN") {
        neighbors.push([row, col - 2]);
    }

    return neighbors;
}

// Checks if a row, col pair is already contained in the frontier
// Don't want duplicates in the frontier
function frontierContains(frontier, r, c) {
    for (var i = 0; i < frontier.length; i++) {
        if (r === frontier[i][0] && c === frontier[i][1]) {
            return true;
        }
    }
    return false;
}

// Add cells to the frontier that are neighbors to the given cell
// but are not already "IN" the maze
function addFrontier(r, c, maze, frontier) {
    var row = r;
    var col = c;
    // Get the frontier cells of the given one at (r, c)

    // For each possible neighbor of the given cell, see if it would be a valid location
    // ie within the bounds of the maze. Also check that the cell is not already in the maze
    // or the frontier.
    // Add the cell to the frontier if it satisfies these constraints
    // Note that frontier may contain many duplicates of cells at certain points in the code, making
    // some cells more likely to be chosen to be included in the maze.
    // Array.includes([1,1]) always returns false even if the frontier array has a
    // value of [5, 5]. It would be better to not have duplicates so each cell has a fair chance
    // of being chosen to be added to the maze next, but this will do.
    // frontierContains function prevents creating duplicate cells in the frontier.

    if (row + 2 >= 0 && row + 2 < maze.length && col >= 0 && col < maze[row].length &&
         maze[row + 2][col] === "NOT IN" && frontierContains(frontier, row + 2, col) === false) {
        frontier.push([row + 2, col]);
    }
    if (row - 2 >= 0 && row - 2 < maze.length && col >= 0 && col < maze[row].length &&
         maze[row - 2][col] === "NOT IN" && frontierContains(frontier, row - 2, col) === false) {
        frontier.push([row - 2, col]);
    }
    if (row >= 0 && row < maze.length && col + 2 >= 0 && col + 2 < maze[row].length &&
         maze[row][col + 2] === "NOT IN" && frontierContains(frontier, row, col + 2) === false) {
        frontier.push([row, col + 2]);
    }
    if (row >= 0 && row < maze.length && col - 2 >= 0 && col - 2 < maze[row].length &&
         maze[row][col - 2] === "NOT IN" && frontierContains(frontier, row, col - 2) === false) {
        frontier.push([row, col - 2]);
    }
}

function mark(frontier, maze, frontierNdx) {
    if (frontierNdx < 0) {
        alert("Yo negative index in frontier what's up?");
    }

    // Get the row and col of the frontier cell
    var r = frontier[frontierNdx][0];
    var c = frontier[frontierNdx][1];
    maze[r][c] = "IN";
    // Remove the given cell from the frontier and
    // mark it as in the maze
    frontier.splice(frontierNdx, 1);


    // Add the neighbors of the given cell to the frontier
    // If not already in the map
    addFrontier(r, c, maze, frontier);
}

function printMaze(maze) {
    console.log("New Maze print YAY:");
    var currLine = "";
    for (var i = 0; i < maze.length; i++) {
        currLine = "";
        for (var j = 0; j < maze[i].length; j++) {
            currLine += maze[i][j] + " | ";
        }
        console.log(currLine);
    }
}

function buildMaze(maze) {
    //Make this a random location within the 'maze'
    var neighbors;
    var randNdx;
    var nextFrontier;
    var startRow = Math.floor(Math.random() * maze.length);
    var startCol = Math.floor(Math.random() * maze[0].length);

    //Cells to consider making part of the maze's path?
    var frontier = [];
    // Put the start cell in the frontier, guaranteed to be added as "IN" the maze
    // since only thing in the frontier
    frontier.push([startRow, startCol]);

    // Mark marks the first cell as being in the maze
    // and adds all its neighbors to the frontier
    mark(frontier, maze, 0);

    // Keep going until no more cells in the "Frontier"
    // Till every cell has been explored and added to the maze

    var frontierRow; // current row of cell connecting to the graph
    var frontierCol;
    var inNeighRow; // all frontier cells must have a neighbor in the maze
    var inNeighCol;

    while (frontier.length > 0) {
        // Presumably random index into the frontier
        // console.log("Frontier length = " + frontier.length);
        nextFrontier = Math.floor(Math.random() * frontier.length);

        frontierRow = frontier[nextFrontier][0];
        frontierCol = frontier[nextFrontier][1];

        // Returns neighbors "IN" the maze of this frontier cell
        neighbors = getNeighbors(maze, frontierRow, frontierCol);

        // Include this cell from the frontier as "IN" the maze
        mark(frontier, maze, nextFrontier);

        // Pick a random neighbor of the frontier cell
        // At least 1 neighbor "IN" the maze by definition
        randNdx = Math.floor(Math.random() * neighbors.length);
        inNeighRow = neighbors[randNdx][0];
        inNeighCol = neighbors[randNdx][1];
        // Mark the connecting cell between this neighbor and the frontier cell
        // also as "IN" (part of the maze)
        maze[frontierRow - (frontierRow - inNeighRow) / 2][frontierCol - (frontierCol - inNeighCol) / 2] = "IN";

        // Go through the neighbors and either add a path or a wall between them
        for (var i = 0; i < neighbors.length; i++) {
            // This is so ugly fix this up
            var nRow = neighbors[i][0];
            var nCol = neighbors[i][1];
            var rDiff = (frontierRow - nRow) / 2;
            var cDiff = (frontierCol - nCol) / 2;
            if (i !== randNdx) {
                // Place a "WALL" between the frontier cell and this neighbor
                // Probably doesn't work
                maze[nRow + rDiff][nCol + cDiff] = "WALL";
            }
        }
        //printMaze(maze);

    }

}

function solveMaze(maze) {
    // Solve and show solution (in browser)
    // TODO solve


    console.log("Solved");
}

// Create HTML elements and add them to Maze.html
function drawMaze(maze) {
    console.log("Drawing maze");
    //TODO Draw maze with jQuery

}

function start() {
    console.log("Starting");
    // Keeps track of where walls and non-walls are
    // 0: a wall
    // 1: a valid walk place... carpet?
    // Could prompt user for size of map
    var maze = [];
    var rows = 8;
    var cols = 8;

    for (var i = 0; i < rows; i++) {
        // Create arrays for each row/col
        maze.push([]);
    }

    for (var i = 0; i < maze.length; i++) {
        for (var j = 0; j < cols; j++) {
            // Init every cell to have value 0
            // ie. be a wall
            //NOT IN, IN, WALL
            maze[i].push("NOT IN");
        }
    }

    // Fill in the maze object with walls and what not
    buildMaze(maze);

    drawMaze(maze);

    // Djikstra?
    solveMaze(maze);

    // Remove this when implemented
    console.log("Done!");
    printMaze(maze);
}

start();
