var ROAD_EMPTY = ' ';
var ROAD_KETCHUP = '.';
var ROAD_POWER = '*';
var BLANK_SPACE = 'x';
var DOOR = 'd'
var WALL = 'o';
var MOVED = -1;
var MOVE_FRIESMAN = 0;
var MOVE_ENEMY = 1;

function Board()
{
	this.introAudio = new Audio('audio/intro.mp3');
	this.startAudio = new Audio('audio/start.mp3');
	this.gameOverAudio = new Audio('audio/gameOver.mp3');
	// this.startAudio.play();
	this.diedAudio = new Audio('audio/nonono.mp3');
	// creating enemies inside of the map
	this.enemyArray = [new Enemy(DUMB_ENEMY, 10, 13, WEST, true),
					   new Enemy(DUMB_ENEMY, 9, 11, EAST, false),
					   new Enemy(DUMB_ENEMY, 10, 11, NORTH, false),
					   new Enemy(SMART_ENEMY, 11, 11, WEST, false)];

	// creating Friesman
	this.friesMan = new Friesman(10, 5, NORTH);

	this.prevEnemyArray = [new Enemy(DUMB_ENEMY, 10, 13, WEST, true),
						   new Enemy(DUMB_ENEMY, 9, 11, EAST, false),
						   new Enemy(DUMB_ENEMY, 10, 11, NORTH, false),
						   new Enemy(SMART_ENEMY, 11, 11, WEST, false)]

    this.prevFriesMan = new Friesman(10, 5, NORTH);

	// creating the map
	this.mapArray = [
// 	 -> East
//   ^  South
//    0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16   17   18   19   20
	['x', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'x'], // 0
	['x', 'o', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'o', 'x'], // 1
	['x', 'o', '.', 'o', 'o', 'o', 'o', 'o', 'o', '.', 'o', '.', 'o', 'o', 'o', 'o', 'o', 'o', '.', 'o', 'x'], // 2
	['x', 'o', '.', '.', '.', '.', 'o', '.', '.', '.', 'o', '.', '.', '.', 'o', '.', '.', '.', '.', 'o', 'x'], // 3
	['x', 'o', 'o', '.', 'o', '.', 'o', '.', 'o', 'o', 'o', 'o', 'o', '.', 'o', '.', 'o', '.', 'o', 'o', 'x'], // 4
	['x', 'o', '*', '.', 'o', '.', '.', '.', '.', '.', 'F', '.', '.', '.', '.', '.', 'o', '.', '*', 'o', 'x'], // 5
	['x', 'o', '.', 'o', 'o', '.', 'o', 'o', 'o', '.', 'o', '.', 'o', 'o', 'o', '.', 'o', 'o', '.', 'o', 'x'], // 6
	['x', 'o', '.', '.', '.', '.', '.', '.', '.', '.', 'o', '.', '.', '.', '.', '.', '.', '.', '.', 'o', 'x'], // 7
	['x', 'o', 'o', 'o', 'o', '.', 'o', ' ', 'o', 'o', 'o', 'o', 'o', ' ', 'o', '.', 'o', 'o', 'o', 'o', 'x'], // 8
	['x', 'x', 'x', 'x', 'o', '.', 'o', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'o', '.', 'o', 'x', 'x', 'x', 'x'], // 9
	['o', 'o', 'o', 'o', 'o', '.', 'o', ' ', 'o', 'o', 'o', 'o', 'o', ' ', 'o', '.', 'o', 'o', 'o', 'o', 'o'], // 10
	[' ', ' ', ' ', ' ', ' ', '.', ' ', ' ', 'o', '1', '2', '3', 'o', ' ', ' ', '.', ' ', ' ', ' ', ' ', ' '], // 11
	['o', 'o', 'o', 'o', 'o', '.', 'o', ' ', 'o', 'o', 'd', 'o', 'o', ' ', 'o', '.', 'o', 'o', 'o', 'o', 'o'], // 12
	['x', 'x', 'x', 'x', 'o', '.', 'o', ' ', ' ', ' ', '0', ' ', ' ', ' ', 'o', '.', 'o', 'x', 'x', 'x', 'x'], // 13
	['x', 'o', 'o', 'o', 'o', '.', 'o', 'o', 'o', ' ', 'o', ' ', 'o', 'o', 'o', '.', 'o', 'o', 'o', 'o', 'x'], // 14
	['x', 'o', '.', '.', '.', '.', 'o', '.', '.', '.', 'o', '.', '.', '.', 'o', '.', '.', '.', '.', 'o', 'x'], // 15
	['x', 'o', '.', 'o', 'o', '.', 'o', '.', 'o', 'o', 'o', 'o', 'o', '.', 'o', '.', 'o', 'o', '.', 'o', 'x'], // 16
	['x', 'o', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'o', 'x'], // 17
	['x', 'o', '*', 'o', 'o', '.', 'o', 'o', 'o', '.', 'o', '.', 'o', 'o', 'o', '.', 'o', 'o', '*', 'o', 'x'], // 18
	['x', 'o', '.', '.', '.', '.', '.', '.', '.', '.', 'o', '.', '.', '.', '.', '.', '.', '.', '.', 'o', 'x'], // 19
	['x', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'x']  // 20
	];

	this.power = false;
	this.numKilled = 0;
	this.numPower = 0;

	this.movedArray = [10, 10, 10, 10];

	// stores the previous value of the map
	this.prevState = [ROAD_EMPTY, ROAD_EMPTY, ROAD_EMPTY, ROAD_EMPTY];
	this.score = 0;
	this.life = 3;
}

// displaying the map
Board.prototype.display = function()
{
	for (var i = 20; i >= 0; i--)
	{
		var temp = '';
		for (var j = 0; j < 21; j++)
		{
			temp += this.mapArray[i][j];
		}
		// console.log(temp);
	}
}

Board.prototype.die = function(enemyID)
{
 	this.mapArray[this.friesMan.y][this.friesMan.x] = ROAD_EMPTY;

	for (var i = 0; i < 4; i++)
	{
		var enemyY = this.enemyArray[i].y;
		var enemyX = this.enemyArray[i].x;
		if(i === enemyID)
			this.mapArray[enemyY][enemyX] = ROAD_EMPTY;
		else
		{
			if(isEnemy(this.prevState[i]))
				this.mapArray[enemyY][enemyX] = ROAD_EMPTY;
			else
				this.mapArray[enemyY][enemyX] = this.prevState[i];
		}
		this.prevState[i] = ROAD_EMPTY;
	}

	this.mapArray[13][10] = '0';
	this.mapArray[11][9] = '1';
	this.mapArray[11][10] = '2';
	this.mapArray[11][11] = '3';
	this.mapArray[5][10] = 'F';

	// creating enemies inside of the map
	this.enemyArray = [new Enemy(DUMB_ENEMY, 10, 13, WEST, true),
					   new Enemy(DUMB_ENEMY, 9, 11, EAST, false),
					   new Enemy(DUMB_ENEMY, 10, 11, NORTH, false),
					   new Enemy(SMART_ENEMY, 11, 11, WEST, false)];

	// creating Friesman
	this.friesMan = new Friesman(10, 5, NORTH);

	this.prevEnemyArray = [new Enemy(DUMB_ENEMY, 10, 13, WEST, true),
						   new Enemy(DUMB_ENEMY, 9, 11, EAST, false),
						   new Enemy(DUMB_ENEMY, 10, 11, NORTH, false),
						   new Enemy(SMART_ENEMY, 11, 11, WEST, false)]

    this.prevFriesMan = new Friesman(10, 5, NORTH);

    this.power = false;
    this.life--;
	MOVED = -1;
	if (this.life !== 0)
		this.diedAudio.play();
}

Board.prototype.killEnemy = function(enemyID)
{
	var enemyY = this.enemyArray[enemyID].y;
	var enemyX = this.enemyArray[enemyID].x;
	this.mapArray[enemyY][enemyX] = this.prevState[enemyID];
	this.prevState[enemyID] = ROAD_EMPTY;

	switch(enemyID)
	{
		case 0:
			this.mapArray[13][10] = '0';
			this.enemyArray[enemyID] = new Enemy(DUMB_ENEMY, 10, 13, WEST, true);
			this.prevEnemyArray[enemyID] = new Enemy(DUMB_ENEMY, 10, 13, WEST, true);
			this.movedArray[enemyID] = -10;
			break;
		case 1:
			this.mapArray[11][9] = '1';
			this.enemyArray[enemyID] = new Enemy(DUMB_ENEMY, 9, 11, EAST, false);
			this.prevEnemyArray[enemyID] = new Enemy(DUMB_ENEMY, 9, 11, EAST, false);
			this.movedArray[enemyID] = -10;
			break;
		case 2:
			this.mapArray[11][10] = '2';
			this.enemyArray[enemyID] = new Enemy(DUMB_ENEMY, 10, 11, NORTH, false);
			this.enemyArray[enemyID] = new Enemy(DUMB_ENEMY, 10, 11, NORTH, false);
			this.movedArray[enemyID] = -10;
			break;
		case 3:
			this.mapArray[11][11] = '3';
			this.enemyArray[enemyID] = new Enemy(SMART_ENEMY, 11, 11, WEST, false);
			this.prevEnemyArray[enemyID] = new Enemy(SMART_ENEMY, 11, 11, WEST, false);
			this.movedArray[enemyID] = -10;
			break;
	}

	this.numKilled++;
	this.score += 200 * this.numKilled;
}

// type is either Friesman (0) or Enemy (1), number specifies the ID of the enemy
// still needs to implement the part where Friesman moves into one of the enemies or vice versa
Board.prototype.move = function(type, number)
{
	// Friesman's move
	if (type === MOVE_FRIESMAN)
	{
		this.prevFriesMan.x = this.friesMan.x;
		this.prevFriesMan.y = this.friesMan.y;
		var currX = this.friesMan.x;
		var currY = this.friesMan.y;
		// try to move in direction 'nextDir'. if unable to move, move in currDir
		for(var i = 0; i < 2; i++)
		{
			if(i === 0)
				var dir = this.friesMan.nextDir;
			else
				var dir = this.friesMan.currDir;

			if(dir === NORTH || dir === SOUTH)
				var nextX = currX;
			else if(dir === EAST && currX === 20 && currY === 11)
				var nextX = 0;
			else if(dir === EAST)
				var nextX = currX + 1;
			else if(dir === WEST && currX === 0 && currY === 11)
				var nextX = 20;
			else if(dir === WEST)
				var nextX = currX - 1;

			if(dir === EAST || dir === WEST)
				var nextY = currY;
			else if(dir === NORTH)
				var nextY = currY + 1;
			else if(dir === SOUTH)
				var nextY = currY - 1;

			// check the bound
			if(nextY >= 0 && nextY <= 20 && nextX >= 0 && nextX <= 20)
			{
				if(this.mapArray[nextY][nextX] === ROAD_KETCHUP || this.mapArray[nextY][nextX] === ROAD_POWER || this.mapArray[nextY][nextX] === ROAD_EMPTY)
				{
					if (this.mapArray[nextY][nextX] === ROAD_KETCHUP)
						this.score += 10;
					else if (this.mapArray[nextY][nextX] === ROAD_POWER)
					{
						var self = this;
						this.score += 50;
						this.power = true;
						this.numPower++;
						var save = this.numPower;
						setTimeout(function (){
							if(save === self.numPower)
							{
								self.power = false;
								self.numPower = 0;
							}
							self.numKilled = 0;
						}, 7000);
					}
					//////////////// TODO: UPDATE THE SCORE AND DECREMENT THE # OF KETCHUP DOTS //////////////////////////////
					this.mapArray[currY][currX] = ROAD_EMPTY;	// mark the point as visited
					this.mapArray[nextY][nextX] = 'F';			// mark the next point as Friesman
					this.friesMan.x += (nextX - currX);			// update Friesman's position
					this.friesMan.y += (nextY - currY);
					if(i === 0)
						this.friesMan.currDir = dir;
					return;
				}
				else if(this.mapArray[nextY][nextX] === '0' || this.mapArray[nextY][nextX] === '1' || this.mapArray[nextY][nextX] === '2' || this.mapArray[nextY][nextX] === '3')
				{
					this.mapArray[currY][currX] = ROAD_EMPTY;	// mark the point as visited
					this.mapArray[nextY][nextX] = 'F';			// mark the next point as Friesman
					this.friesMan.x += (nextX - currX);			// update Friesman's position
					this.friesMan.y += (nextY - currY);
					if(i === 0)
						this.friesMan.currDir = dir;
					return;
				// 	this.die();
				}
			}
		}
	}
	// Enemy's move
	else
	{
		this.prevEnemyArray[number].x = this.enemyArray[number].x;
		this.prevEnemyArray[number].y = this.enemyArray[number].y;

		var currX = this.enemyArray[number].x;
		var currY = this.enemyArray[number].y;
		var dir = this.enemyArray[number].currDir;
		var currChar = number.toString();
		var enemyType = this.enemyArray[number].enemyType;
		var dirIndex = 0;

		if (enemyType === SMART_ENEMY)
		{
			var friesX = this.friesMan.x;
			var friesY = this.friesMan.y;

			if (currX === friesX)
			{
				if (friesY > currY)
					var dirArray = [SOUTH, WEST, EAST, NORTH];
				else
					var dirArray = [NORTH, WEST, EAST, SOUTH];
			}
			else if (currY === friesY)
			{
				if (friesX < currX)
					var dirArray = [WEST, SOUTH, NORTH, EAST];
				else
					var dirArray = [EAST, SOUTH, NORTH, WEST];
			}
			// south or west
			else if ((friesY > currY) && (friesX < currX))
			{
				if ((friesY - currY) > (currX - friesX))
					var dirArray = [SOUTH, WEST, NORTH, EAST];
				else
					var dirArray = [WEST, SOUTH, NORTH, EAST];
			}
			// south or east
			else if ((friesY > currY) && (friesX >= currX))
			{
				if ((friesY - currY) > (friesX - currX))
					var dirArray = [SOUTH, EAST, NORTH, WEST];
				else
					var dirArray = [EAST, SOUTH, NORTH, WEST];
			}
			// north or west
			else if ((friesY <= currY) && (friesX < currX))
			{
				if ((currY - friesY) > (currX - friesX))
					var dirArray = [NORTH, WEST, SOUTH, EAST];
				else
					var dirArray = [WEST, NORTH, SOUTH, EAST];
			}
			else
			{
				if ((currY - friesY) > (friesX - currX))
					var dirArray = [NORTH, EAST, SOUTH, WEST];
				else
					var dirArray = [EAST, NORTH, SOUTH, WEST];
			}
		}

		if(MOVED < 10 || this.movedArray[number] < 10)
		{
			if(this.movedArray[number] < 10)
				var m = this.movedArray[number];
			else
				var m = MOVED;
			switch(m)
			{
				case 0:
					if(number === 0)
					{
						this.mapArray[13][10] = ROAD_EMPTY;
						this.prevState[0] = this.mapArray[13][9];
						this.mapArray[13][9] = '0';
						this.enemyArray[0].x = 9;
					}
					if(number === 2)
					{
						this.mapArray[11][10] = ROAD_EMPTY;
						this.prevState[2] = this.mapArray[12][10];
						this.mapArray[12][10] = '2';
						this.enemyArray[2].y = 12;
					}
					return;
				case 1:
					if(number === 0)
					{
						this.mapArray[13][9] = this.prevState[0];
						this.prevState[0] = this.mapArray[13][8];
						this.mapArray[14][9] = '0';
						this.enemyArray[0].y = 14;
					}
					if(number === 2)
					{
						this.mapArray[12][10] = this.prevState[2];
						this.prevState[2] = this.mapArray[13][10];
						this.mapArray[13][10] = '2';
						this.enemyArray[2].y = 13;
						this.enemyArray.passedDoor = true;
					}
					return;
				case 2:
					if(number === 0)
					{
						this.mapArray[14][9] = this.prevState[0];
						this.prevState[0] = this.mapArray[15][9];
						this.mapArray[15][9] = '0';
						this.enemyArray[0].y = 15;
					}
					if(number === 2)
					{
						this.mapArray[13][10] = this.prevState[2];
						this.prevState[2] = this.mapArray[13][9];
						this.mapArray[13][9] = '2';
						this.enemyArray[2].x = 9;
					}
					return;
				case 3:
					if(number === 0)
					{
						this.mapArray[15][9] = this.prevState[0];
						this.prevState[0] = this.mapArray[15][8];
						this.mapArray[15][8] = '0';
						this.enemyArray[0].x = 8;
					}
					if(number === 2)
					{
						this.mapArray[13][9] = this.prevState[2];
						this.prevState[2] = this.mapArray[13][8];
						this.mapArray[13][8] = '2';
						this.enemyArray[2].x = 8;
					}
					if(number === 1)
					{
						this.mapArray[11][9] = ROAD_EMPTY;
						this.prevState[1] = this.mapArray[11][10];
						this.mapArray[11][10] = '1';
						this.enemyArray[1].x = 10;
					}
					return;
				case 4:
					if(number === 0)
					{
						this.mapArray[15][8] = this.prevState[0];
						this.prevState[0] = this.mapArray[15][7];
						this.mapArray[15][7] = '0';
						this.enemyArray[0].x = 7;
					}
					if(number === 2)
					{
						this.mapArray[13][8] = this.prevState[2];
						this.prevState[2] = this.mapArray[13][7];
						this.mapArray[13][7] = '2';
						this.enemyArray[2].x = 7;
					}
					if(number === 1)
					{
						this.mapArray[11][10] = this.prevState[1];
						this.prevState[1] = this.mapArray[12][10];
						this.mapArray[12][10] = '1';
						this.enemyArray[1].y = 12;
					}
					return;
				case 5:
					if(number === 0)
					{
						this.mapArray[15][7] = this.prevState[0];
						this.prevState[0] = this.mapArray[16][7];
						this.mapArray[16][7] = '0';
						this.enemyArray[0].y = 16;
					}
					if(number === 2)
					{
						this.mapArray[13][7] = this.prevState[2];
						this.prevState[2] = this.mapArray[12][7];
						this.mapArray[12][7] = '2';
						this.enemyArray[2].y = 12;
					}
					if(number === 1)
					{
						this.mapArray[12][10] = this.prevState[1];
						this.prevState[1] = this.mapArray[13][10];
						this.mapArray[13][10] = '1';
						this.enemyArray[1].y = 13;
					}
					return;
				case 6:
					if(number === 0)
					{
						this.mapArray[16][7] = this.prevState[0];
						this.prevState[0] = this.mapArray[17][7];
						this.mapArray[17][7] = '0';
						this.enemyArray[0].y = 17;
					}
					if(number === 2)
					{
						this.mapArray[12][7] = this.prevState[2];
						this.prevState[2] = this.mapArray[11][7];
						this.mapArray[11][7] = '2';
						this.enemyArray[2].y = 11;
					}
					if(number === 1)
					{
						this.mapArray[13][10] = this.prevState[1];
						this.prevState[1] = this.mapArray[13][9];
						this.mapArray[13][9] = '1';
						this.enemyArray[1].x = 9;
					}
					if(number === 3)
					{
						this.mapArray[11][11] = ROAD_EMPTY;
						this.prevState[3] = this.mapArray[11][10];
						this.mapArray[11][10] = '3';
						this.enemyArray[3].x = 10;
					}
					return;
				case 7:
					if(number === 0)
					{
						this.mapArray[17][7] = this.prevState[0];
						this.prevState[0] = this.mapArray[17][6];
						this.mapArray[17][6] = '0';
						this.enemyArray[0].x = 6;
					}
					if(number === 2)
					{
						this.mapArray[11][7] = this.prevState[2];
						this.prevState[2] = this.mapArray[11][6];
						this.mapArray[11][6] = '2';
						this.enemyArray[2].x = 6;
					}
					if(number === 1)
					{
						this.mapArray[13][9] = this.prevState[1];
						this.prevState[1] = this.mapArray[13][8];
						this.mapArray[13][8] = '1';
						this.enemyArray[1].x = 8;
					}
					if(number === 3)
					{
						this.mapArray[11][10] = this.prevState[3];
						this.prevState[3] = this.mapArray[12][10];
						this.mapArray[12][10] = '3';
						this.enemyArray[3].y = 12;
					}
					return;
				case 8:
					if(number === 0)
					{
						this.mapArray[17][6] = this.prevState[0];
						this.prevState[0] = this.mapArray[17][5];
						this.mapArray[17][5] = '0';
						this.enemyArray[0].x = 5;
					}
					if(number === 2)
					{
						this.mapArray[11][6] = this.prevState[2];
						this.prevState[2] = this.mapArray[11][5];
						this.mapArray[11][5] = '2';
						this.enemyArray[2].x = 5;
					}
					if(number === 1)
					{
						this.mapArray[13][8] = this.prevState[1];
						this.prevState[1] = this.mapArray[13][7];
						this.mapArray[13][7] = '1';
						this.enemyArray[1].x = 7;
					}
					if(number === 3)
					{
						this.mapArray[12][10] = this.prevState[3];
						this.prevState[3] = this.mapArray[13][10];
						this.mapArray[13][10] = '3';
						this.enemyArray[3].y = 13;
					}
					return;
				case 9:
					if(number === 0)
					{
						this.mapArray[17][5] = this.prevState[0];
						this.prevState[0] = this.mapArray[16][5];
						this.mapArray[16][5] = '0';
						this.enemyArray[0].y = 16;
						this.enemyArray[3].currDir = SOUTH;
					}
					if(number === 2)
					{
						this.mapArray[11][5] = this.prevState[2];
						this.prevState[2] = this.mapArray[10][5];
						this.mapArray[10][5] = '2';
						this.enemyArray[2].y = 10;
						this.enemyArray[3].currDir = SOUTH;
					}
					if(number === 1)
					{
						this.mapArray[13][7] = this.prevState[1];
						this.prevState[1] = this.mapArray[12][7];
						this.mapArray[12][7] = '1';
						this.enemyArray[1].y = 12;
						this.enemyArray[3].currDir = SOUTH;
					}
					if(number === 3)
					{
						this.mapArray[13][10] = this.prevState[3];
						this.prevState[3] = this.mapArray[13][9];
						this.mapArray[13][9] = '3';
						this.enemyArray[3].x = 9;
						this.enemyArray[3].currDir = WEST;
					}
					return;
				default:
					return;
			}
		}

		var repeat = false;
		do
		{
			// var currX = this.enemyArray[number].x;
			// var currY = this.enemyArray[number].y;
			// var dir = this.enemyArray[number].currDir;
			// var currChar = number.toString();
			// var enemyType = this.enemyArray[number].enemyType;
			// var dirIndex = 0;

			if (enemyType === SMART_ENEMY && dirIndex < 4)
			{
				dir = dirArray[dirIndex];
				dirIndex++;
			}

			if (enemyType === DUMB_ENEMY)
				dir = this.enemyArray[number].currDir;

			if(dir === NORTH || dir === SOUTH)
				var nextX = currX;
			else if(dir === EAST)
				var nextX = currX + 1;
			else if(dir === WEST)
				var nextX = currX - 1;

			if(dir === EAST || dir === WEST)
				var nextY = currY;
			else if(dir === NORTH)
				var nextY = currY - 1;
			else if(dir === SOUTH)
				var nextY = currY + 1;


			if(nextY >= 0 && nextY <= 20 && nextX >= 0 && nextX <= 20)
			{
				if(isEnemy(this.mapArray[nextY][nextX]))
				{
					this.mapArray[currY][currX] = this.prevState[number];
					var prevEnemy = parseInt(this.mapArray[nextY][nextX]);
					this.prevState[number] = this.prevState[prevEnemy];
					this.prevState[prevEnemy] = currChar;
					this.enemyArray[number].x += (nextX - currX);
					this.enemyArray[number].y += (nextY - currY);
					repeat = false;
				}
				else if(this.mapArray[nextY][nextX] === ROAD_KETCHUP || this.mapArray[nextY][nextX] === ROAD_POWER || this.mapArray[nextY][nextX] === ROAD_EMPTY || (this.mapArray[nextY][nextX] === 'd' && !this.enemyArray[number].passedDoor))
				{
					// if(number === 1)
					// 	console.log("passedDoor: " + this.enemyArray[number].passedDoor.toString());
					if(this.mapArray[nextY][nextX] === 'd')
						this.enemyArray[number].passedDoor = true;
			
					this.mapArray[currY][currX] = this.prevState[number];
					this.prevState[number] = this.mapArray[nextY][nextX];
					this.mapArray[nextY][nextX] = currChar;
					this.enemyArray[number].x += (nextX - currX);
					this.enemyArray[number].y += (nextY - currY);
					
					repeat = false;
				}
				else if(this.mapArray[nextY][nextX] === 'F')		// enemy has killed Friesman
				{
					this.mapArray[currY][currX] = this.prevState[number];
					// this.mapArray[nextY][nextX] = ROAD_EMPTY;
					this.enemyArray[number].x += (nextX - currX);
					this.enemyArray[number].y += (nextY - currY);
					
					repeat = false;
					// this.die();
				}
				else
				{
					// console.log("IN HERE 1");
					this.enemyArray[number].randDir();
					repeat = true;
				}
			}
			else
			{
				// console.log("IN HERE 2");
				this.enemyArray[number].randDir();
				repeat = true;
			}
		} while(repeat)
	}
}

function isEnemy(enemy)
{
	if (enemy === '0' || enemy === '1' || enemy === '2' || enemy === '3')
		return true;
	return false;
}