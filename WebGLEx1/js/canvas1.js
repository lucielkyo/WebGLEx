const canvas = document.getElementById('canvas1');
const gl = canvas.getContext('webgl');
window.gl = gl;

gl.clearColor(250/255, 250/255, 180/255, 1); //背景底色
gl.clear(gl.COLOR_BUFFER_BIT); //顏色緩衝區

//頂點
const verteices = [
  0, 0.5,
 -0.4, -0.4,
  0.4, -0.8
  
];

const vertexShaderSource = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0, 1); }`;

const fragmentShaderSource = `
void main() {
  gl_FragColor = vec4(0.4044, 0.2233, 0.2223, 1); }`;

function CreateShader(gl, type, source)   {
  const shader = gl.createShader(type); //type = vertex 或 fragment shader
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS); //查看編譯成功或失敗
  if (true) return shader;
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

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
//Attributelocation, size, type, normalize, stride, offset

//size: 設定了每次 vertex shader 執行時該 attribute 要從 buffer 中拿出多少個數值，依序填入 vecX 的各個元素

//假設今天原始資料是 0~255 整數表示的 RGB，
//那麼就可以用 type: gl.UNSIGNED_BYTE 搭配 normalize: true 使用，
//在 shader 中 attribute 就會直接是符合 gl_FragColor 的顏色資料

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verteices), gl.STATIC_DRAW);

gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, 3);