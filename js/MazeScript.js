/* Author: Kevin Costello
 * Date: 9/30/2016
 * Program: Maze Maker
 * Description: Program creates a maze by using Primm's modified algorithm
 * by largely referencing this blog:
 http://weblog.jamisbuck.org/2011/1/10/maze-generation-prim-s-algorithm
 * and this StackOverflow post:
 http://stackoverflow.com/questions/29739751/implementing-a-randomly-generated-maze-using-prims-algorithm
 * So general idea is to create a 2D array to represent the maze. Go through Prim's algorithm
 * to generate the maze. Then use Djikstra's algorithm to find a path from the start to the end.
 * Then backtrace from the end to the start to find the shortest path from the individual
 * and their coffee. Enjoy!
 *
 * Note: This is also my application to Rally Health. I hope you guys enjoy it!
 * This project can be found on my github at : https://github.com/kmcostel/Maze
 */

/* Future improvements:
 * 1. Take custom input for size of the maze, could do this as of now, but would have to limit to
 *    be less than a certain size to fit within the HTML div.
 * 2. Have the size of the cells on the webpage be dynamic in the sense that they are determined
 *    by the size of the maze. So if the div that contains the maze is 200px and the user
 *    desires 40 columns, then make each cell be the div width / # columns ie. (200 / 40) px in width
 *    and same idea applies to the height.
 */



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
// Could get duplicates when 2 cells are included in the maze
// that have the same frontier cell such as the middle cell of 2 cells
// in the same row and 4 columns apart, don't want the middle cell included
// twice, because it could be taken from the frontier and included in the maze,
// and then it would still have another representation in the frontier
// which doesn't make sense... This function prevents that scenario
function frontierContains(frontier, row, col) {
    for (var i = 0; i < frontier.length; i++) {
        if (row === frontier[i][0] && col === frontier[i][1]) {
            return true;
        }
    }
    return false;
}

// Add cells to the frontier that are neighbors of the given cell
// AND are not already "IN" the maze AND not already in the frontier
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
    // Get the row and col of the frontier cell
    var r = frontier[frontierNdx][0];
    var c = frontier[frontierNdx][1];

    // Mark it as in the maze
    maze[r][c] = "IN";
    // Remove the given cell from the frontier
    frontier.splice(frontierNdx, 1);

    // Add the neighbors of the given cell to the frontier
    addFrontier(r, c, maze, frontier);
}

function buildMaze(maze) {
    //Make this a random location within the 'maze'
    var neighbors;
    var randNdx;
    var nextFrontier;
    var endSpot;
    var startEnd = [];

    //Pick starting position to build maze from ie begin algorithm here this cell
    var startRow = Math.floor(Math.random() * maze.length);
    var startCol = Math.floor(Math.random() * maze[0].length);

    startEnd.push([startRow, startCol]);

    //Cells to consider making part of the maze's path?
    var frontier = [];
    // Put the start cell in the frontier, guaranteed to be added as "IN" the maze
    // since only thing in the frontier; needed to begin the 'while' loop below
    frontier.push([startRow, startCol]);

    // mark() marks this first cell as being in the maze
    // and adds all its neighbors to the frontier
    mark(frontier, maze, 0);

    // Keep going until no more cells in the "Frontier"
    // Till every cell has been explored and added to the maze

    var frontierRow; // current row of cell connecting to the graph
    var frontierCol;
    var inNeighRow; // all frontier cells must have a neighbor in the maze
    var inNeighCol;

    while (frontier.length > 0) {
        // Random index into the frontier
        nextFrontier = Math.floor(Math.random() * frontier.length);

        // Row and column of the frontier cell
        // (soon to be included as part of the maze)
        frontierRow = frontier[nextFrontier][0];
        frontierCol = frontier[nextFrontier][1];

        // Returns neighbors "IN" the maze of this frontier cell
        neighbors = getNeighbors(maze, frontierRow, frontierCol);

        // Include this cell from the frontier as "IN" the maze
        // Also adds its neighboring cells not already in the maze
        // to the frontier
        mark(frontier, maze, nextFrontier);

        // Pick a random neighbor of the frontier cell
        // At least 1 neighbor "IN" the maze by definition
        // This neighbor will be the connection from the frontier cell
        // to the rest of the maze, all other neighbors to the
        // frontier cell will have a wall in between them
        randNdx = Math.floor(Math.random() * neighbors.length);

        //Row and column of the neighbor (cell already included "IN" the maze
        // ie a place you can walk through to get the coffee)
        inNeighRow = neighbors[randNdx][0];
        inNeighCol = neighbors[randNdx][1];

        // Different ways to do the math (this is one),
        // but this gets and marks the cell connecting the
        // frontier cell to the maze as also in"IN" the maze.
        var frontRowNeigh = frontierRow - (frontierRow - inNeighRow) / 2;
        var frontColNeigh = frontierCol - (frontierCol - inNeighCol) / 2;
        maze[frontRowNeigh][frontColNeigh] = "IN";

        // Records the last cell to leave the frontier
        end = [frontRowNeigh, frontColNeigh];
        // Go through the neighbors and either add a path or a wall between them
        for (var i = 0; i < neighbors.length; i++) {
            // This is so ugly fix this up
            var nRow = neighbors[i][0];
            var nCol = neighbors[i][1];
            var rDiff = (frontierRow - nRow) / 2;
            var cDiff = (frontierCol - nCol) / 2;
            // if this neighbor is not the one the frontier cell is connecting to
            if (i !== randNdx) {
                // Place a "WALL" between the frontier cell and this neighbor
                maze[nRow + rDiff][nCol + cDiff] = "WALL";
            }
        }


    }
    // Add the last "IN" part added to the maze as the coffee's location
    startEnd.push(end);
    return startEnd;

}

// Returns a new 2D array identical in composition
// to the given parameter
function mazeCopy(maze) {
    var newMaze = [];
    for (var r = 0; r < maze.length; r++) {
        newMaze.push([]);
        for (var c = 0; c < maze[r].length; c++) {
            newMaze[r][c] = maze[r][c];
        }
    }
    return newMaze;
}


// Finds the path to get back to the start position
// beginning from where the coffee is.
function backTrack(maze, endRow, endCol) {

    // Start from the end (coffee) location
    var curRow = endRow;
    var curCol = endCol;
    // Start with the total path length from start to end
    var distance = maze[curRow][curCol];
    var id; //id of a specific html div in the solution path

    // Only changing the row or column by one each loop iteration
    // because iterating through the path the row or col only
    // needs to change by 1 to get to the next cell in the path
    // because every consecutive part of the path must be touching
    // the previous part ie the row or the column must stay the same
    // when moving from one cell to the next in the path
    while (distance > 0) {
        distance = maze[curRow][curCol];
        if (curRow + 1 >= 0 && curRow + 1 < maze.length && curCol >= 0 &&
            curCol < maze[0].length && maze[curRow + 1][curCol] === distance - 1) {

            maze[curRow][curCol] = 0;
            id = "r" + curRow + "c" + curCol;
            $("#" + id).css("background-color", "yellow");
            curRow += 1;
            //curCol = curCol;
        }
        else if (curRow - 1 >= 0 && curRow - 1 < maze.length && curCol >= 0 && curCol < maze[0].length && maze[curRow - 1][curCol] === distance - 1) {
            maze[curRow][curCol] = 0;
            id = "r" + curRow + "c" + curCol;
            $("#" + id).css("background-color", "yellow");
            curRow -= 1;
            //curCol = curCol;
        }
        else if (curRow >= 0 && curRow < maze.length && curCol + 1 >= 0 && curCol + 1 < maze[0].length && maze[curRow][curCol + 1] === distance - 1) {
            //curRow = curRow;
            maze[curRow][curCol] = 0;
            id = "r" + curRow + "c" + curCol;
            $("#" + id).css("background-color", "yellow");
            curCol += 1;
        }
        else if (curRow >= 0 && curRow < maze.length && curCol - 1 >= 0 && curCol - 1 < maze[0].length && maze[curRow][curCol - 1] === distance - 1) {
            //curRow = curRow;
            maze[curRow][curCol] = 0;
            id = "r" + curRow + "c" + curCol;
            $("#" + id).css("background-color", "yellow");
            curCol -= 1;
        }

    }
}

function solveMaze(maze, start) {
    // Solve and show solution (in browser)

    //Condition to check if end location is reached
    var done = false;
    // Array's can act of queues in javascript... so cool
    // http://stackoverflow.com/questions/1590247/how-do-you-implement-a-stack-and-a-queue-in-javascript
    var queue = [];
    var currCell;
    var infinity = 8000;

    var row;
    var col;

    var newMaze = mazeCopy(maze);

    // Recreate the maze into a new object
    // Walls are represented by a value of -1
    // All other possible places to traverse the maze
    // are given a value of "infinity" or 8000, that's big enough right?
    for (var r = 0; r < newMaze.length; r++) {
        for (var c = 0; c < newMaze[r].length; c++) {
            if (newMaze[r][c] === "IN" || newMaze[r][c] === "end") {
                newMaze[r][c] = infinity;
            }
            else { // WALL or NOT IN
                newMaze[r][c] = -1;
            }
        }
    }

    newMaze[start[0]][start[1]] = 0;
    // push the starting position
    queue.push( [start[0], start[1]] );
    var currDistance;
    var endCol;
    var endRow;

    // My attempt at Djikstra's algorithm
    while (queue.length > 0 && done === false) {
        currCell = queue.shift();
        row = currCell[0];
        col = currCell[1];
        currDistance = newMaze[row][col];

        if (maze[row][col] === "end") {
            endRow = row;
            endCol = col;
            done = true;
        }
        else {
            // Add the neighbors
            // Check tentative distances, if tentative distance < current distance
            // add to queue and update the distance
            currDistance = newMaze[row][col];

            if (row + 1 >= 0 && row + 1 < newMaze.length && col >= 0 && col < newMaze[0].length && currDistance + 1 < newMaze[row + 1][col]) {
                if (newMaze[row + 1][col] !== -1) { // Not a wall
                    newMaze[row + 1][col] = currDistance + 1;
                    queue.push([row + 1, col]);
                }
            }
            if (row - 1 >= 0 && row - 1 < newMaze.length && col >= 0 && col < newMaze[0].length && currDistance + 1 < newMaze[row - 1][col]) {
                if (newMaze[row - 1][col] !== -1) { // Not a wall
                    newMaze[row - 1][col] = currDistance + 1;
                    queue.push([row - 1, col]);
                }
            }
            if (row >= 0 && row < newMaze.length && col + 1 >= 0 && col + 1 < newMaze[0].length && currDistance + 1 < newMaze[row][col + 1]) {
                if (newMaze[row][col + 1] !== -1) { // Not a wall
                    newMaze[row][col + 1] = currDistance + 1;
                    queue.push([row, col + 1]);
                }
            }
            if (row >= 0 && row < newMaze.length && col - 1 >= 0 && col - 1 >= 0 && col - 1 < newMaze[0].length && currDistance + 1 < newMaze[row][col - 1]) {
                if (newMaze[row][col - 1] !== -1) { // Not a wall
                    newMaze[row][col - 1] = currDistance + 1;
                    queue.push([row, col - 1]);
                }
            }
        }
    }

    // Backtrack to find shortestpath
    backTrack(newMaze, endRow, endCol);

}

// Create HTML elements and add them to Maze.html
function drawMaze(maze) {

    // TODO get the width and length of maze and then determine
    // the length and width of pixel size to fit inside of
    // HTML div. TL;DR resize squares to fit HTML div
    var mazeWidth;
    var mazeHeight;
    var cellWidth;
    var cellHeight;
    var containerWidth;
    var containerHeight;

    var numRows = maze.length;
    var numCols = maze[0].length;

    mazeWidth = $("#MazeDiv").width();
    mazeHeight = $("#MazeDiv").height();

    containerWidth = mazeWidth;
    containerHeight = mazeHeight / numRows;

    cellWidth = containerWidth / numCols;
    cellHeight = containerHeight;

    var type;
    var HTML;
    // Unique id of a specific div identified by its row and col
    var id;

    for (var r = 0; r < maze.length; r++) {
        HTML = "<div class=\"container\" style=\"width:" + containerWidth + "px; height:" + containerHeight + "px;\">";
        for (var c = 0; c < maze[r].length; c++) {
            if (maze[r][c] === "NOT IN" || maze[r][c] === "WALL") {
                type = "wall";
                id = "r" + r + "c" + c;
                HTML += "<div style=\"width:"+cellWidth+"px; height:"+cellHeight +"px;\" id=\""+id+ "\" class=\"" + type + "\"></div>";
            }
            else if (maze[r][c] === "start") {
                type = "start";
                HTML += "<div style=\"width:"+cellWidth+"px; height:"+cellHeight +"px;\" id=\""+id+ "\" class=\"" + type + "\">";
                HTML += "<img src=\"StickMan.png\" style=\"height: 100%; width: 100%; object-fit: contain\">";
                HTML += "</div>";
            }
            else if (maze[r][c] === "end") {
                type = "end";
                HTML += "<div style=\"width:"+cellWidth+"px; height:"+cellHeight +"px;\" id=\""+id+ "\" class=\"" + type + "\">";
                HTML += "<img src=\"CoffeeMug.jpg\" style=\"height: 100%; width: 100%; object-fit: contain\">";
                HTML += "</div>";
            }
            else {
                type = "path";
                id = "r" + r + "c" + c;
                HTML += "<div style=\"width:"+cellWidth+"px; height:"+cellHeight +"px;\" id=\""+id+ "\" class=\"" + type + "\"></div>";
            }
        }
        HTML += "</div>";
        $("#MazeDiv").append(HTML);
    }



}

function refreshPage() {
  // Clear event listeners and divs out
  $("#MazeDiv").empty();
  $("#restart").unbind("click");
  $("#solve").unbind("click");

  // Clear the text areas
  $('#numRows').val("");
  $('#numCols').val("");

}

function start(rows, cols) {
    // Keeps track of where walls and non-walls are
    // 0: a wall
    // 1: a valid walk place... carpet?
    // Could prompt user for size of map

    //Refresh the web page
    refreshPage();

    var maze = [];

    var rows = (rows !== undefined && rows !== "" && rows < 20 && rows > 5 ? rows : 20);
    var cols = (cols !== undefined && cols !== "" && cols < 40 && cols > 3 ? cols : 40);

    // Array to record the position of the maze's start and end
    // startEnd[0] = [startRow, startCo]
    // startEnd[1] = [endRow, endCol]
    var startEnd;

    for (var i = 0; i < rows; i++) {
        // Create arrays for each row/col
        maze.push([]);
    }

    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            // Init every cell to have value 0
            // ie. be a wall
            //NOT IN, IN, WALL
            maze[i].push("NOT IN");
        }
    }

    // Fill in the maze object with walls and what not
    // Build maze makes the maze and returns the start and
    // end locations in the startEnd variable
    startEnd = buildMaze(maze);

    var startRow = startEnd[0][0];
    var startCol = startEnd[0][1];
    maze[startRow][startCol] = "start";

    var endRow = startEnd[1][0];
    var endCol = startEnd[1][1];
    maze[endRow][endCol] = "end";

    drawMaze(maze);

    // Djikstra?
    //solveMaze(maze);

    $("#solve").on("click", function() {
        // Pass the maze and the start position
        solveMaze(maze, startEnd[0]);
    });


    $("#restart").on("click", function() {
        //Restart!
        start();
    });
}
