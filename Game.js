var gl;
var points = [];
var normals = [];
var texCoords = [];
var tangents = [];

var canvas;
var textCanvas;
var ctx;
var program;
var objToWorldM;
var modelViewM;
var modelViewIndex = 0;
var mModelViewLoc;
var mTranslationLoc;
var mObjToWorldLoc;
var vTexCoord;

var gameBoard;
var walls = [];
var floors = [];
var cellSize = 1;

var num_cube_points = 0;
var num_sphere_points = 0;
var num_friesman_points = 0;
var num_ring_points = 0;
var num_stick_points = 0;
var num_fire_points = 0;
var num_floor_points = 0;
var num_obstacle_points = 0;
var num_shade_points = 0;

var timer = 0;
var pause = false;
var end = false;

var rock1;
var rock1_init_position = vec3(0,11,20);
var rock1_init_speed = vec3(0.0375, 0.00, 0.05);
var rock_x_distance = 5;
var rock2;
var rock2_init_position = vec3(20,11,20);
var rock2_init_speed = vec3(-0.0375,0.00,0.05);

var fries_x_amount;
var fries_y_amount;
var enemy_x_amount;
var enemy_y_amount;

var titlepage = 1.0;
var dots = 5;

// for debugging
var disable_enemy = false;
var anim_speed = 10;    // smaller number -> faster animation

window.onload = function init()
{
    // set up webgl canvas
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // set up text canvas
    textCanvas = document.getElementById("textCanvas");
    ctx = textCanvas.getContext("2d");

    // main game board
    gameBoard = new Board();
    // obstacle
    rock1 = new ObstacleObject(rock1_init_position, rock1_init_speed, vec3(0.0, 0.0, -0.003));
    rock2 = new ObstacleObject(rock2_init_position, rock2_init_speed,vec3(0.0,0.0,-0.003));
    
    for ( var x = 0; x < 21; x++)
    {
        for ( var y = 0; y < 21; y++)
        {
            if (gameBoard.mapArray[y][x] === WALL)
            {
                walls.push( vec3(x*cellSize, y*cellSize, 0) );
            }
            else if (!(gameBoard.mapArray[y][x] === BLANK_SPACE || gameBoard.mapArray[y][x] === WALL ) )
            {
                floors.push( vec3(x*cellSize, y*cellSize, 0) );
            }
        }
    }

    // object constructors defined in Objects.js
    maze = new Maze();
    door = new Door(maze.pointsStart, maze.pointsLength);
    fire = new Fire();
    floor = new Floor();
    title = new Title(floor.pointsStart, floor.pointsLength);
    happy_end = new Happy(floor.pointsStart,floor.pointsLength);
    sad_end = new Sad(floor.pointsStart, floor.pointsLength)
    friesman = new Friesman2();
    ketchupdot = new Ketchupdot();
    enemy = new Enemy2();
    stick = new Stick();
    obstacle = new Obstacle();
    shade = new Shade();

    var introMusic = true;
    gameBoard.introAudio.play();

    window.onkeydown = function(input)
    {
        // any first key press will start the game
        if(input.keyCode != 0 && titlepage >= 1.0)
        {
            gameBoard.introAudio.pause();
            introMusic = false;
            titlepage -= 0.01;
            gameBoard.startAudio.play();    // play audio
            setTimeout(function(){MOVED = 0;}, 4000);   // allow movements after 4s
        }
        else
        {
            if (input.keyCode === 38)   // up arrow
            {
                if(modelViewIndex === 0 || modelViewIndex === 2)
                    gameBoard.friesMan.nextDir = NORTH;
            }
            else if (input.keyCode === 39)  // right arrow
            {
                if(modelViewIndex === 0 || modelViewIndex === 2)
                    gameBoard.friesMan.nextDir = EAST;
                else
                    gameBoard.friesMan.nextDir = (gameBoard.friesMan.currDir+1)%4;
            }
            else if (input.keyCode === 40)  // down arrow
            {
                if(modelViewIndex === 0 || modelViewIndex === 2)
                    gameBoard.friesMan.nextDir = SOUTH;
                else
                    gameBoard.friesMan.nextDir = (gameBoard.friesMan.currDir+2)%4;
            }
            else if (input.keyCode === 37)  // left arrow
            {
                if(modelViewIndex === 0 || modelViewIndex === 2)
                    gameBoard.friesMan.nextDir = WEST;
                else
                    gameBoard.friesMan.nextDir = (gameBoard.friesMan.currDir+3)%4;
            }
            else if (input.keyCode === 32)  // space bar
            {
                modelViewIndex = (modelViewIndex+1) % 3
            }
            else if (input.keyCode === 13)  // enter (pause)
            {
                pause = !pause;
                if(!pause)
                    render();
            }
        }
    }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    gl.enable(gl.DEPTH_TEST);

    // Load the data into the GPU, set vPosition
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // normal buffer
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // bind vTexCoord to texCoords array
    var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW );
    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 4, gl.FLOAT, false, 0, 0 );
    gl.disableVertexAttribArray( vTexCoord );

    // tangents array
    var tanBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tanBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(tangents), gl.STATIC_DRAW );
    vTangent = gl.getAttribLocation( program, "vTangent" );
    gl.vertexAttribPointer( vTangent, 4, gl.FLOAT, false, 0, 0 );
    gl.disableVertexAttribArray( vTangent );

    loadTextures();   // defined in loadImage.js

    // set mPerspective
    var mPerspective = perspective( 60, canvas.width/canvas.height, 0.01, 1000);
    var mPerspectiveLoc = gl.getUniformLocation(program, "mPerspective");
    gl.uniformMatrix4fv(mPerspectiveLoc, false, new flatten(mPerspective));

    mModelViewLoc = gl.getUniformLocation(program, "mModelView");
    mObjToWorldLoc = gl.getUniformLocation(program, "mObjToWorld");
    objectIDLoc = gl.getUniformLocation(program, "objectID");
    mNormalLoc = gl.getUniformLocation(program, "mNormal");  // normal matrix to be used in vertex shader for shading
    normalmapLoc = gl.getUniformLocation(program, "normalmap");
    opacityLoc = gl.getUniformLocation(program, "opacity");

    render();
};

function getModelView(index)
{
    if(gameBoard.prevFriesMan.x === 0 || gameBoard.prevFriesMan.x === 20)
    {
        if(gameBoard.friesMan.currDir === WEST)
            var xAmount = gameBoard.prevFriesMan.x - timer/anim_speed;
        else if(gameBoard.friesMan.currDir === EAST)
            var xAmount = gameBoard.prevFriesMan.x + timer/anim_speed;
        var yAmount = gameBoard.prevFriesMan.y;
    }
    else
    {
        var xAmount = gameBoard.prevFriesMan.x + (gameBoard.friesMan.x - gameBoard.prevFriesMan.x) * timer / anim_speed;
        var yAmount = gameBoard.prevFriesMan.y + (gameBoard.friesMan.y - gameBoard.prevFriesMan.y) * timer / anim_speed;
    }
    var reverseTranslation = translate(-xAmount, -yAmount, 0.0);

    if(index === 0)
    {
        return translate(-10, -10, -20);
    }
    else if(index === 1)
    {
        var adjustHeading = mult(translate(0,-2,-3), rotate(40, vec3(1,0,0)));
        return mult(mult(adjustHeading, getHeading(gameBoard.friesMan.currDir)), reverseTranslation);
    }
    else if(index === 2)
    {
        return mult(mult(rotate(-20, vec3(1,0,0)), translate(0, 2, -5)), reverseTranslation);
    }
}

function getHeading(dir)
{
    if(dir === NORTH)
        return rotate(-90, vec3(1,0,0));
    if(dir === SOUTH)
        return mult(rotate(180, vec3(0,1,0)), rotate(-90, vec3(1,0,0)));
    if(dir === EAST)
        return mult(rotate(90, vec3(0,1,0)), rotate(-90, vec3(1,0,0)));
    if(dir === WEST)
        return mult(rotate(-90, vec3(0,1,0)), rotate(-90, vec3(1,0,0)));
}

function getFriesmanRotation(dir)
{
    if(dir === NORTH)
        return mat4();
    if(dir === SOUTH)
        return rotate(180, vec3(0,0,1));
    if(dir === EAST)
        return rotate(-90, vec3(0,0,1));
    if(dir === WEST)
        return rotate(90, vec3(0,0,1));
}

function resetObstacles()
{
    rock1.set(rock1_init_position, rock1_init_speed);
    rock2.set(rock2_init_position, rock2_init_speed);
}

function render() 
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // TODO: USE A REAL TIMER
    if(MOVED >= 0 && timer%anim_speed === 0)
    {
        gameBoard.move(MOVE_FRIESMAN, 0);
        if(!disable_enemy)
            for (var i = 0; i < 4; i++)
            {
                gameBoard.move(MOVE_ENEMY, i);
                if(gameBoard.movedArray[i] <= 10)
                    gameBoard.movedArray[i]++;
            }
        if(MOVED < 20)
            MOVED++;
        timer = 0;
    }

    modelViewM = getModelView(modelViewIndex);
    gl.uniformMatrix4fv(mModelViewLoc, false, new flatten(modelViewM));
    gl.uniformMatrix3fv(mNormalLoc, false, new flatten(mat4To3(modelViewM)));
    
    // ==================== ENABLE : texture coordinate buffer ====================
    gl.enableVertexAttribArray( vTexCoord );

    if(gameBoard.life == 0)
    {
        gameBoard.gameOverAudio.play();
        modelViewIndex = 0;
        modelViewM = getModelView(modelViewIndex);
        gl.uniformMatrix4fv(mModelViewLoc, false, new flatten(modelViewM));
        sad_end.render();
        end = true;
    }
    else if (dots == 0)
    {
        modelViewIndex = 0;
        modelViewM = getModelView(modelViewIndex);
        gl.uniformMatrix4fv(mModelViewLoc, false, new flatten(modelViewM));
        happy_end.render();
        resetObstacles();
        end = true;
    }

    // ==================== ENABLE : tangents buffer ====================
    gl.enableVertexAttribArray( vTangent );
    for(var k = 0; k < walls.length; k++)
    {
        maze.render(walls[k]);  // render maze
    }
    gl.disableVertexAttribArray( vTangent );
    // ==================== DISABLE : tangents buffer ====================

    fire.render();  // render fire

    for(var k = 0; k < floors.length; k++)
    {
        floor.render(floors[k]);    // render floor
    }

    friesman.render();  // render friesman

    // gl.disableVertexAttribArray( vTexCoord );        disabled in friesman.render()
    // ==================== DISABLE : texture coordinate buffer ====================

    for(var i = 0; i < 4; i++)
    {
        enemy.render(i);    // render enemies
        if(Math.abs(enemy_x_amount-fries_x_amount) <= 0.2 && Math.abs(enemy_y_amount-fries_y_amount) <= 0.2)
        {
            if(gameBoard.power)
            {
                gameBoard.killEnemy(i);
            }
            else
            {
                resetObstacles();
                friesman.resetArmPosition();
                modelViewIndex = 0; // reset camera view
                gameBoard.die(i);
                setTimeout(function(){MOVED = 0;}, 4000);
            }
        }
    }

    dots = 0;
    for ( var x = 2; x < 19; x++)
    {
        for ( var y = 1; y < 20; y++)
        {
            if (gameBoard.mapArray[y][x] === ROAD_KETCHUP || gameBoard.mapArray[y][x] === ROAD_POWER)
            {
                var dotsize = gameBoard.mapArray[y][x] === ROAD_KETCHUP ? 0.12 : 0.2;
                ketchupdot.render(vec3(x*cellSize, y*cellSize, 0.0), dotsize);  // render ketchupdots (spheres)
                dots++;
            }
        }
    }

    stick.render();     // render stick

    if (MOVED > 0)
    {
        // update the position of the rocks and their shade using physics
        rock1.speed = add(rock1.speed, rock1.acceleration);
        rock1.position = add(rock1.position, rock1.speed);

        rock2.speed = add(rock2.speed, rock2.acceleration);
        rock2.position = add(rock2.position, rock2.speed);
    }
    if (rock1.hasCollided(fries_x_amount, fries_y_amount, 1.75) || rock2.hasCollided(fries_x_amount, fries_y_amount, 1.75))
    {
        resetObstacles();
        friesman.resetArmPosition();
        modelViewIndex = 0; // reset camera view
        gameBoard.die();
        setTimeout(function(){MOVED = 0;}, 4000);
    }
    else if(rock1.position[2] <= -0.2)  // if rocks reached the bottom of the map
    {
        resetObstacles();
    }
    var percent_moved = (rock1.position[0])/(rock_x_distance);
    var shade_scale_factor = 4*(percent_moved/5);
    // render rocks and shades
    obstacle.render(rock1.position);
    obstacle.render(rock2.position);
    shade.render(vec3(rock1.position[0], rock1.position[1], -0.49), 0.3*(0.4 + shade_scale_factor));
    shade.render(vec3(rock2.position[0], rock2.position[1], -0.49), 0.3*(0.4 + shade_scale_factor));

    // ==================== ENABLE : blending ====================
    gl.enable( gl.BLEND );
    gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
    gl.depthMask( false );
    door.render();  // render door
    // ==================== ENABLE : texture coordinate buffer ====================    
    gl.enableVertexAttribArray(vTexCoord);
    if(titlepage <= 1.0 && titlepage >= 0.0)
    {
        title.render()  // render title page
        if(titlepage < 1.0)
            titlepage -= 0.01;
    }
    gl.disableVertexAttribArray(vTexCoord);
    // ==================== DISABLE : texture coordinate buffer ====================    
    gl.depthMask( true );
    gl.disable( gl.BLEND );
    // ==================== DISABLE : blending ====================

    // score
    ctx.beginPath();
    ctx.rect(100, 0, ctx.canvas.width-200, ctx.canvas.height);
    ctx.fillStyle = "#FFFF66";
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.restore();
    ctx.beginPath();
    ctx.font = "25px Impact";
    ctx.textAlign = "center";
    ctx.fillText("SCORE: ", 170, 35);
    ctx.fillStyle = "red";
    ctx.fillText(gameBoard.score, 230, 35);
    ctx.fillStyle = "black"
    ctx.fillText("LIFE: ", 450, 35);
    for(var k=0; k < gameBoard.life; k++)
    {
        ctx.rect(475 + k*40, 12.5, 25, 25);
        ctx.fillStyle = "red";
        ctx.fill();
    }
    ctx.restore();

    timer++;
    if (!pause && !end)
        window.requestAnimFrame(render);
}
