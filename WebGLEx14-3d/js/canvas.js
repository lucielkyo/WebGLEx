import {CreateShader, CreateProgram, LoadImage} from './preFun.js';
import {matrix4} from './matrix.js';

// const vertexandcolor = [
// //頂點        材質
//   -75, -75,     0,0,//左上  
//   75, -75,   1,0,//右上  
//   75, 75, 1,1,//右下

//   -75, -75,     0,0,//左上
//   75, 75, 1,1,//右下
//   -75, 75,   0,1 //左下
// ];

const vertexShaderSource = `
attribute vec4 a_position;
attribute vec3 a_color;

uniform mat4 u_matrix;

varying vec3 v_color;

void main() {
  gl_Position = u_matrix * a_position;

  v_color =  a_color;}`;

//mediump 設定要多精準的float
const fragmentShaderSource = `
precision highp float; 

varying vec3 v_color;

void main() {
  gl_FragColor = vec4(v_color, 1); }`;


async function setup(){
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');  

  const vertexShader = CreateShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = CreateShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = CreateProgram(gl, vertexShader, fragmentShader);

  const attributes = {
    position: gl.getAttribLocation(program, 'a_position'),
    color: gl.getAttribLocation(program, 'a_color')
  };
  const uniforms ={
    matrix: gl.getUniformLocation(program, 'u_matrix')
  };

  const buffers = {};

  const modelBufferArrays = createModelBufferArrays();

  //<--posBuffer-->

  buffers.position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

  gl.enableVertexAttribArray(attributes.position);
  gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
  //Attributelocation, size, type, normalize, stride, offset

  //Float32Array時
  //    |vertex1 |vertex2 |
  //    |x |y |z |x |y |z |
  //byte0  4  8  12
  //stride = 0
  //offset = 距離起始點 0

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelBufferArrays.attribs.a_position), gl.STATIC_DRAW);

  //<--colorBuffer-->

  buffers.position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

  gl.enableVertexAttribArray(attributes.color);
  gl.vertexAttribPointer(attributes.color, 3, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelBufferArrays.attribs.a_color), gl.STATIC_DRAW);
  //Attributelocation, size, type, normalize, stride, offset
  
  return {
    gl, 
    program, attributes, uniforms,
    buffers, modelBufferArrays,
    state: {
      projectionZ: 400,
      translate: [150, 100, 0],
      rotate: [degToRad(30), degToRad(30), degToRad(0)],
      scale: [1, 1, 1],
    },
    time: 0
  };
}

function render(app){
  const {
    gl, 
    program, uniforms,
    modelBufferArrays,
    state
  } = app;
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height); //繪製區域設定

  gl.clearColor(250/255, 250/255, 180/255, 1); //背景底色
  gl.clear(gl.COLOR_BUFFER_BIT); //顏色緩衝區

  gl.useProgram(program);

  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  //const viewMatrix = matrix4.identity();
  const viewMatrix = matrix4.projection(gl.canvas.width, gl.canvas.height, state.projectionZ);
  const worldMatrix = matrix4.multiply(
  matrix4.translate(...state.translate),
  matrix4.rotateX(state.rotate[0]),
  matrix4.rotateY(state.rotate[1]),
  matrix4.rotateZ(state.rotate[2]),
  matrix4.scale(...state.scale)
);
  
  
  gl.uniformMatrix4fv(
    uniforms.matrix,
    false,
    matrix4.multiply(viewMatrix,worldMatrix)
  );

  // gl.drawArrays(gl.TRIANGLES, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, modelBufferArrays.numElements);
}

async function main(){
  const app = await setup();
  console.log(app.state);
  window.app = app;
  window.gl = app.gl;

  render(app);

  const cForm = $('#controls');
  cForm.on('input', function() {
    //let fData = $('input[name="texture"]:checked').val();
    //let sData = $('input[name="speed"]').val();
    let projZ = $('input[name="projection-z"]').val();
    let txData = $('input[name="translate-x"]').val();
    let tyData = $('input[name="translate-y"]').val();
    let tzData = $('input[name="translate-z"]').val();
    let scaleX = $('input[name="scale-x"]').val();
    let scaleY = $('input[name="scale-y"]').val();
    let scaleZ = $('input[name="scale-z"]').val();
    let rotaX = $('input[name="rotation-x"]').val();
    let rotaY = $('input[name="rotation-y"]').val();
    let rotaZ = $('input[name="rotation-z"]').val();
    // app.state.texture = fData;
    // app.state.speed = sData;
    app.state.projectionZ = projZ;
    app.state.translate[0] = txData;
    app.state.translate[1] = tyData;
    app.state.translate[2] = tzData;
    app.state.scale[0] = scaleX;
    app.state.scale[1] = scaleY;
    app.state.scale[2] = scaleZ;
    app.state.rotate[0] = degToRad(rotaX);
    app.state.rotate[1] = degToRad(rotaY);
    app.state.rotate[2] = degToRad(rotaZ); //弧度

    render(app);
  });

  //startLoop(app);
}

// function startLoop(app, now = 0){
//   const {state, gl} = app;
//   const timeDiff = now - app.time;
//   app.time = now;

//   state.offset = state.offset.map((v, i) => v + state.direction[i] * timeDiff * state.speed);

//   if(state.offset[0] > gl.canvas.width){
//     state.direction[0] *= -1;
//     state.offset[0] = gl.canvas.width;
//   }
//   else if (state.offset[0] < 0){
//     state.direction[0] *= -1;
//     state.offset[0] = 0;
//   }

//   if (state.offset[1] > gl.canvas.height) {
//     state.direction[1] *= -1;
//     state.offset[1] = gl.canvas.height;
//   }
//   else if (state.offset[1] < 0){
//     state.direction[1] *= -1;
//     state.offset[1] = 0;
//   }

//   render(app);
//   requestAnimationFrame(now =>startLoop(app,now))
// }

main();


function createModelBufferArrays() {
  // positions
  const a = 40, b = 200, c = 60, d = 45;

  const points = [0, d].flatMap(z => ([
    [0, 0, z], // 0, 13
    [0, b, z],
    [a, b, z],
    [a, 0, z],
    [2*a+c, 0, z], // 4, 17
    [a, a, z],
    [2*a+c, a, z],
    [a, 2*a, z],
    [2*a+c, 2*a, z], // 8, 21
    [a, 3*a, z],
    [2*a+c, 3*a, z],
    [a+c, a, z],
    [a+c, 2*a, z] // 12, 25
  ]));

  const a_position = [
    ...rectVertices(points[0], points[1], points[2], points[3]), // 0
    ...rectVertices(points[3], points[5], points[6], points[4]),
    ...rectVertices(points[7], points[9], points[10], points[8]),
    ...rectVertices(points[11], points[12], points[8], points[6]),
    ...rectVertices(points[13], points[16], points[15], points[14]), // 4
    ...rectVertices(points[16], points[17], points[19], points[18]),
    ...rectVertices(points[20], points[21], points[23], points[22]),
    ...rectVertices(points[24], points[19], points[21], points[25]),
    ...rectVertices(points[0], points[13], points[14], points[1]), // 8
    ...rectVertices(points[0], points[4], points[17], points[13]),
    ...rectVertices(points[4], points[10], points[23], points[17]),
    ...rectVertices(points[9], points[22], points[23], points[10]),
    ...rectVertices(points[9], points[2], points[15], points[22]), // 12
    ...rectVertices(points[2], points[1], points[14], points[15]),
    ...rectVertices(points[5], points[7], points[20], points[18]),
    ...rectVertices(points[5], points[18], points[24], points[11]),
    ...rectVertices(points[11], points[24], points[25], points[12]), // 16
    ...rectVertices(points[7], points[12], points[25], points[20])
  ];

  // a_color
  const frontColor = [108/255, 225/255, 153/255];
  const backColor = randomColor();
  const a_color = [
    ...rectColor(frontColor), // 0
    ...rectColor(frontColor),
    ...rectColor(frontColor),
    ...rectColor(frontColor),
    ...rectColor(backColor), // 4
    ...rectColor(backColor),
    ...rectColor(backColor),
    ...rectColor(backColor),
    ...rectColor(randomColor()), // 8
    ...rectColor(randomColor()),
    ...rectColor(randomColor()),
    ...rectColor(randomColor()),
    ...rectColor(randomColor()), // 12
    ...rectColor(randomColor()),
    ...rectColor(randomColor()),
    ...rectColor(randomColor()),
    ...rectColor(randomColor()), // 16
    ...rectColor(randomColor())
  ];

  return {
    numElements: a_position.length / 3,
    attribs: {
      a_position, a_color
    }
  };
}

function rectVertices(a, b, c, d) {
    return [
      ...a, ...b, ...c,
      ...a, ...c, ...d
  ];
}

function rectColor(color) {
  return Array(6).fill(color).flat();
}

function randomColor() {
  return [Math.random(), Math.random(), Math.random()];
}

function degToRad(deg) {
  return deg * Math.PI / 180;
}