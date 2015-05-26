var gl;
var points = [];
var normals = [];
var texCoords = [];

var canvas;
var program;
var objToWorldM;
var modelViewM;
var AngleRotation = 0;
var modelViewIndex = 0;
var mModelViewLoc;
var mTranslationLoc;
var mObjToWorldLoc;

var gameBoard;
var field;
var walls = [];
var ketchups = [];
var cellSize = 1;

var MOVE_FRIESMAN = 0;
var MOVE_ENEMY = 1;

var num_cube_points = 0;
var num_sphere_points = 0;
var num_friesman_points = 0;
var num_ring_points = 0;
var num_stick_points = 0;
var num_fire_points = 0;

var timer = 0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gameBoard = new Board();

    for ( var x = 0; x < 21; x++)
    {
        for ( var y = 0; y < 21; y++)
        {
            if (gameBoard.mapArray[y][x] === WALL)
            {
                walls.push( vec3(x*cellSize, y*cellSize, 0) );
            }
        }
    }

    cube();
    num_cube_points = points.length;
    ketchupdot(3, false);
    num_sphere_points = points.length - num_cube_points;
    friesman();
    num_friesman_points = points.length - num_sphere_points - num_cube_points;
    makeTorus(0.7, 0.3, 100, 20, 1.0);
    num_ring_points = points.length - num_friesman_points - num_sphere_points - num_cube_points;
    cube2(stickVertices);
    num_stick_points = points.length - num_ring_points - num_friesman_points - num_sphere_points - num_cube_points;
    cube2(fireVertices);
    num_fire_points = points.length - num_stick_points - num_ring_points - num_friesman_points - num_sphere_points - num_cube_points;

    window.onkeydown = function(input)
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
        else if (input.keyCode === 90)  // z key
        {
            modelViewIndex = (modelViewIndex+1) % 3
        }

    }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
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

    // set mPerspective
    var mPerspective = perspective( 60, canvas.width/canvas.height, 1, 1000);
    var mPerspectiveLoc = gl.getUniformLocation(program, "mPerspective");
    gl.uniformMatrix4fv(mPerspectiveLoc, false, new flatten(mPerspective));

    mModelViewLoc = gl.getUniformLocation(program, "mModelView");
    mObjToWorldLoc = gl.getUniformLocation(program, "mObjToWorld");
    objectIDLoc = gl.getUniformLocation(program, "objectID");
    mNormalLoc = gl.getUniformLocation(program, "mNormal");  // normal matrix to be used in vertex shader for shading

    render();

};

function getModelView(index)
{
    if(index === 0)
        return translate(-10, -10, -20);
    else if(index === 1)
    {
        var xAmount = gameBoard.prevFriesMan.x + (gameBoard.friesMan.x - gameBoard.prevFriesMan.x) * timer / 10;
        var yAmount = gameBoard.prevFriesMan.y + (gameBoard.friesMan.y - gameBoard.prevFriesMan.y) * timer / 10;
        var reverseTranslation = translate(-xAmount, -yAmount, 0.0);
        return mult(getHeading(gameBoard.friesMan.currDir), reverseTranslation);
    }
    else if(index === 2)
    {
        var xAmount = gameBoard.prevFriesMan.x + (gameBoard.friesMan.x - gameBoard.prevFriesMan.x) * timer / 10;
        var yAmount = gameBoard.prevFriesMan.y + (gameBoard.friesMan.y - gameBoard.prevFriesMan.y) * timer / 10;
        var reverseTranslation = translate(-xAmount, -yAmount, 0.0);
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

function render() 
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // TODO: USE A REAL TIMER
    if(timer%10 === 0)
    {

        gameBoard.move(MOVE_FRIESMAN, 0);
        for (var i = 0; i < 4; i++)
        {
            gameBoard.move(MOVE_ENEMY, i);
        }
        if(MOVED < 20)
        MOVED++;
        timer = 0;
    }

    modelViewM = getModelView(modelViewIndex);
    gl.uniformMatrix4fv(mModelViewLoc, false, new flatten(modelViewM));
    gl.uniformMatrix3fv(mNormalLoc, false, new flatten(mat4To3(modelViewM)));
    
    // render cubes (maze)
    for(var k = 0; k < walls.length; k++)
    {
        objToWorldM = translate(walls[k]);
        gl.uniformMatrix4fv(mObjToWorldLoc, false, new flatten(objToWorldM));
        
        gl.uniform1i(objectIDLoc, 0);
        gl.drawArrays( gl.TRIANGLE_STRIP, 0, num_cube_points);
    }

    // render spheres (ketchup dots)
    for ( var x = 2; x < 19; x++)
    {
        for ( var y = 1; y < 20; y++)
        {
            if (gameBoard.mapArray[y][x] === ROAD_KETCHUP)
            {
                objToWorldM = mult(translate(x*cellSize, y*cellSize, 0.0), scale(0.15, 0.15, 0.15));
                gl.uniformMatrix4fv(mObjToWorldLoc, false, new flatten(objToWorldM));

                gl.uniform1i(objectIDLoc, 1);
                gl.drawArrays(gl.TRIANGLES, num_cube_points, num_sphere_points);
            }
        }
    }

    // render friesman
    if(gameBoard.prevFriesMan.x === 0 || gameBoard.prevFriesMan.x === 20)
    {
        if(gameBoard.friesMan.currDir === WEST)
            var xAmount = gameBoard.prevFriesMan.x - timer/10;
        else if(gameBoard.friesMan.currDir === EAST)
            var xAmount = gameBoard.prevFriesMan.x + timer/10;
        var yAmount = gameBoard.prevFriesMan.y;
    }
    else
    {
        var xAmount = gameBoard.prevFriesMan.x + (gameBoard.friesMan.x - gameBoard.prevFriesMan.x) * timer / 10;
        var yAmount = gameBoard.prevFriesMan.y + (gameBoard.friesMan.y - gameBoard.prevFriesMan.y) * timer / 10;
    }
    objToWorldM = scale(0.5, 0.5, 0.5);
    // objToWorldM = mult(getHeading(gameBoard.friesMan.currDir), objToWorldM);
    objToWorldM = mult(translate(xAmount, yAmount, 0.0), objToWorldM);
    gl.uniformMatrix4fv(mObjToWorldLoc, false, new flatten(objToWorldM));
    gl.uniform1i(objectIDLoc, 2);
    gl.drawArrays( gl.TRIANGLES, num_cube_points+num_sphere_points, num_friesman_points);

    // render enemies
    for(var i = 0; i < 4; i++)
    {
        var xAmount = gameBoard.prevEnemyArray[i].x + (gameBoard.enemyArray[i].x - gameBoard.prevEnemyArray[i].x) * timer / 10;
        var yAmount = gameBoard.prevEnemyArray[i].y + (gameBoard.enemyArray[i].y - gameBoard.prevEnemyArray[i].y) * timer / 10;
        objToWorldM = mult(translate(xAmount, yAmount, 0.0), scale(0.3, 0.3, 0.3));
        gl.uniformMatrix4fv(mObjToWorldLoc, false, new flatten(objToWorldM));
        gl.uniform1i(objectIDLoc, 3);
        gl.drawArrays( gl.TRIANGLE_STRIP, num_cube_points+num_sphere_points+num_friesman_points, num_ring_points);        
    }

    // render stick
    objToWorldM = mult(translate(10, 10, 1), rotate(90, vec3(1,0,0)));
    gl.uniformMatrix4fv(mObjToWorldLoc, false, new flatten(objToWorldM));
    gl.uniform1i(objectIDLoc, 4);
    gl.drawArrays(gl.TRIANGLES, num_cube_points+num_sphere_points+num_friesman_points+num_ring_points, num_stick_points);

    // render fire
    objToWorldM = translate(10, 10, 1.5);
    gl.uniformMatrix4fv(mObjToWorldLoc, false, new flatten(objToWorldM));
    gl.uniform1i(objectIDLoc, 5);
    gl.drawArrays(gl.TRIANGLES, num_cube_points+num_sphere_points+num_friesman_points+num_ring_points+num_stick_points, num_fire_points);

    timer++;
    window.requestAnimFrame(render);
}