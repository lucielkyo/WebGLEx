import {CreateShader, CreateProgram, LoadImage} from './preFun.js';

const verts = [
  -0.5, -0.5, -0.5, //1
  0.5, -0.5, -0.5,  //2
  0.5, -0.5, 0.5,   //3

  -0.5, -0.5, -0.5, //1
  0.5, 0.5, -0.5,   //4
  0.5, -0.5, -0.5,  //2

  -0.5, -0.5, -0.5, //1
  -0.5, 0.5, -0.5,  //5
  0.5, 0.5, -0.5,   //4

  -0.5, 0.5, -0.5,  //5
  0.5, 0.5, 0.5,    //6
  0.5, 0.5, -0.5,   //4

  0.5, -0.5, -0.5,  //2
  0.5, 0.5, -0.5,   //4
  0.5, 0.5, 0.5,    //6

  -0.5, 0.5, -0.5,  //5
  -0.5, 0.5, 0.5,   //7
  0.5, 0.5, 0.5,    //6

  -0.5, -0.5, 0.5,  //8
  0.5, 0.5, 0.5,    //6
  -0.5, 0.5, 0.5,   //7

  -0.5, -0.5, 0.5,  //8
  0.5, -0.5, 0.5,   //3
  0.5, 0.5, 0.5,    //6

  -0.5, -0.5, -0.5, //1
  -0.5, -0.5, 0.5,  //8
  -0.5, 0.5, 0.5,   //7

  -0.5, -0.5, -0.5, //1
  0.5, -0.5, 0.5,   //3
  -0.5, -0.5, 0.5,  //8

  0.5, -0.5, -0.5,  //2
  0.5, 0.5, 0.5,    //6
  0.5, -0.5, 0.5,   //3

  -0.5, -0.5, -0.5, //1
  -0.5, 0.5, 0.5,   //7
  -0.5, 0.5, -0.5,  //5
]


const vertexShaderSource = `
attribute vec3 a_position;

void main() {
  gl_Position = vec4(a_position, 1);}`;

const fragmentShaderSource = `
void main() {
  gl_FragColor = vec4(0.9, 0.5, 0.05, 1); }`;


async function main(){

  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');
  window.gl = gl;

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height); //繪製區域設定

  gl.clearColor(250/255, 250/255, 180/255, 1); //背景底色
  gl.clear(gl.COLOR_BUFFER_BIT); //顏色緩衝區

  const vertexShader = CreateShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = CreateShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = CreateProgram(gl, vertexShader, fragmentShader);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');

  //<--posBuffer-->

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 12, 0);
  //Attributelocation, size, type, normalize, stride, offset
  //    |vertex1 | vertex2|
  //    |x |y |z |x |y |z |
  //byte0  4  8  12 16
  //stride = 12
  //offset = 距離起始點 0

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  gl.useProgram(program);
  gl.drawArrays(gl.TRIANGLES, 0, 36);

}
  main();