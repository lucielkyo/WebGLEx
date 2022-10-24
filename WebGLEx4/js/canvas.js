const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
window.gl = gl;

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

gl.viewport(0, 0, canvas.width, canvas.height, 0); //繪製區域設定

gl.clearColor(250/255, 250/255, 180/255, 1); //背景底色
gl.clear(gl.COLOR_BUFFER_BIT); //顏色緩衝區

//頂點座標3+顏色3
const vertexandcolor = [
//頂點     顏色
  0, 0, 0,      1, 0, 0,
  20, 150, 0,    0, 1, 0,
  120, 82.5, 0, 0, 0, 1
];

const vertexShaderSource = `
attribute vec3 a_position;
attribute vec3 a_color;
varying vec3 v_color;

uniform vec3 u_resolution;


void main() {
  gl_Position = vec4(a_position / u_resolution * vec3(2,-2, 0) + vec3(-1, 1, 0), 1); 
  v_color = a_color;
}`;

// (150,60,0)/(300,150,0) => (0.5,0.4,0) * (2,-2,0) = (1,-0.8,0)+(-1,1,0) => (0, 0.2,0)

//要注意 attribute 這個型別只能夠用在 vertex shader 中！
//其實在使用 attribute，是先取用 buffer 中的資料再傳給 attribute

//uniform 一旦給予值之後就不會再變化，
//每個點都是相同的，所以使用 uniform

//mediump 設定要多精準的float
const fragmentShaderSource = `
precision mediump float; 
varying vec3 v_color;

void main() {
  gl_FragColor = vec4(v_color, 1); }`;

function CreateShader(gl, type, source)   {
  const shader = gl.createShader(type); //type = vertex 或 fragment shader
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS); //查看編譯成功或失敗
  if (ok) return shader;
  else alert("compile shader error");

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function CreateProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const ok = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (ok) return program;
  else alert("Create program error");

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

const vertexShader = CreateShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = CreateShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = CreateProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
console.log({ positionAttributeLocation })

const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');

//<--posBuffer-->

const posBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 24, 0);
//Attributelocation, size, type, normalize, stride, offset

//Float32Array時
//    |     vertex1     |     vertex2     |
//    |x |y |z |r |g |b |x |y |z |r |g |b |
//byte0  4  8  12       24
//stride = (3格 x 4byte)+(3格 x 4byte) = 24
//offset = 距離起始點 0

//第五個參數 stride 與第六個參數 offset: 控制讀取 buffer 時的位置，
//stride 表示這次與下次 vertex shader 執行時 attribute 讀取的起始位置的距離，設定為 0 表示每份資料是緊密排列的，"xyz"到下一個"xyz"，"rgb"到"rgb"
//簡單說就是一份資料的大小

//offset 則是第一份資料距離開始位置的距離，這兩個參數的單位皆為 byte

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexandcolor), gl.STATIC_DRAW);

//<--colorBuffer-->

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

gl.enableVertexAttribArray(colorAttributeLocation);
gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 24, 12);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexandcolor), gl.STATIC_DRAW);
//Attributelocation, size, type, normalize, stride, offset

//stride = (3格 x 4byte)+(3格 x 4byte) = 24
//offset = 第一個"rgb"距離起始點 3格 x 4byte = 12

gl.useProgram(program);

gl.uniform3f(resolutionUniformLocation, canvas.width, canvas.height, 0); 
//3f代表三個元素的float(vec3)

gl.drawArrays(gl.TRIANGLES, 0, 3);