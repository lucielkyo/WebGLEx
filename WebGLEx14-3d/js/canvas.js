import {CreateShader, CreateProgram, LoadImage} from './preFun.js';
import {matrix4} from './matrix.js';

const vertexandcolor = [
//頂點        材質
  -75, -75,     0,0,//左上  
  75, -75,   1,0,//右上  
  75, 75, 1,1,//右下

  -75, -75,     0,0,//左上
  75, 75, 1,1,//右下
  -75, 75,   0,1 //左下
];

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

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.STATIC_DRAW);

  //<--colorBuffer-->

  buffers.texcoord = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoord);

  gl.enableVertexAttribArray(attributes.texcoord);
  gl.vertexAttribPointer(attributes.texcoord, 3, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.STATIC_DRAW);
  //Attributelocation, size, type, normalize, stride, offset
  
  return {
    gl, 
    program, attributes, uniforms,
    buffers, 
    state: {},
    time: 0
  };
}

function render(app){
  const {
    gl, 
    program, uniforms,
    state
  } = app;
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height); //繪製區域設定

  gl.clearColor(250/255, 250/255, 180/255, 1); //背景底色
  gl.clear(gl.COLOR_BUFFER_BIT); //顏色緩衝區

  gl.useProgram(program);

  const viewMatrix = matrix4.identity();
  const worldMatrix = matrix4.identity();
  
  
  gl.uniformMatrix4fv(
    uniforms.matrix,
    false,
    matrix4.multiply(viewMatrix,worldMatrix)
  );

  gl.drawArrays(gl.TRIANGLES, 0, 0);
}

async function main(){
  const app = await setup();
  console.log(app.state);
  window.app = app;
  window.gl = app.gl;

  render(app);

  const cForm = $('#controls');
  // cForm.on('input', function() {
  //   let fData = $('input[name="texture"]:checked').val();
  //   let sData = $('input[name="speed"]').val();
  //   let txData = $('input[name="translate-x"]').val();
  //   let tyData = $('input[name="translate-y"]').val();
  //   let scaleData = $('input[name="scale"]').val();
  //   let rDate = $('input[name="rotation"]').val();
  //   app.state.texture = fData;
  //   app.state.speed = sData;
  //   app.state.translate[0] = txData;
  //   app.state.translate[1] = tyData;
  //   app.state.scale = scaleData;
  //   app.state.rotation = rDate * Math.PI / 180; //弧度
  // });

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