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

    // Remove the given cell from the frontier and
    // mark it as in the maze
    frontier.splice(frontierNdx, 1);
    maze[r][c] = "IN";

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
    var startRow = 0; //Math.floor(Math.random() * maze.length);
    var startCol = 1; //Math.floor(Math.random() * maze[0].length);

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
        console.log("Frontier length = " + frontier.length);
        nextFrontier = Math.floor(Math.random() * frontier.length);

        frontierRow = frontier[nextFrontier][0];
        frontierCol = frontier[nextFrontier][1];

        // Returns neighbors "IN" the maze of the marked cell, need to connect the marked cell
        // to one of these neighbors
        neighbors = getNeighbors(maze, frontierRow, frontierCol);

        // Pick a random neighbor of the frontier cell
        // >= 1 neighbor
        randNdx = Math.floor(Math.random() * neighbors.length);
        inNeighRow = neighbors[randNdx][0];
        inNeighCol = neighbors[randNdx][1];

        for (var i = 0; i < neighbors.length; i++) {
            oRow = neighbors[i][0];
            oCol = neighbors[i][1];
            var rDiff = (oRow - frontierRow) / 2;
            var cDiff = (oCol - frontierCol) / 2;
            if (i === randNdx) {
                // Connect this cell and the nextCell together in the graph
                // Say the frontier cell is "IN"
                maze[frontierRow][frontierCol] = "IN";
                // Say the cell connecting the IN neighbor and the frontier is also "IN"
                maze[inNeighRow - rDiff][inNeighCol - cDiff] = "IN";
            }
            else {
                // Put a wall between nextCell and this cell
                maze[inNeighRow - rDiff][inNeighCol - cDiff] = "WALL";
            }
        }
        printMaze();

    }

}

function solveMaze(maze) {
    // Solve and show solution (in browser)
    console.log("Solving");
    // TODO solve


    console.log("Solved");
}

function start() {
    console.log("Starting");
    // Keeps track of where walls and non-walls are
    // 0: a wall
    // 1: a valid walk place... carpet?
    // Could prompt user for size of map
    var maze = [];
    var rows = 4;
    var cols = 4;

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

    // Djikstra?
    solveMaze(maze);

    // Remove this when implemented
    console.log("Done!");
    console.log(maze);
}

start();
