import {CreateShader, CreateProgram, LoadImage} from './preFun.js';

const vertexandcolor = [
//頂點        材質
  100, 0,     0,0,//左上  
  250, 0,   8,0,//右上  
  250, 150, 8,8,//右下

  100, 0,     0,0,//左上
  250, 150, 8,8,//右下
  100, 150,   0,8 //左下
];

const blackColor = [0, 0, 0, 255];
const orangeColor = [250, 150, 50, 255];

const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texcoord;

uniform vec2 u_resolution;

varying vec2 v_texcoord;

void main() {
  gl_Position = vec4(a_position / u_resolution * vec2(2,-2) + vec2(-1, 1), 0, 1); 
  v_texcoord =  a_texcoord;}`;
//新座標 = 舊座標x座標比例x方向+原點偏移

//mediump 設定要多精準的float
const fragmentShaderSource = `
precision mediump float; 

varying vec2 v_texcoord;
uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_texcoord); }`;


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
  const texcoordAttributeLocation = gl.getAttribLocation(program, 'a_texcoord');
  console.log({ texcoordAttributeLocation });
  const textureUniformLocation = gl.getUniformLocation(program, 'u_texture');
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');

  //const image = await LoadImage('https://i.imgur.com/8TxuWEl.jpeg');

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D, //target
    0, //level 與gl.generateMipmap 有一定的關係 不過這邊通常是填 0 表示輸入的是原始尺寸/最大張的圖
    gl.RGBA, //internalFormat
    2, //width
    2, //height
    0, //border
    gl.RGBA, //format
    gl.UNSIGNED_BYTE, //type
    new Uint8Array([
    ...blackColor, ...orangeColor,
    ...orangeColor, ...blackColor]) //arraybufferview
  );
  //(target, level, internalformat, width, height, border, format, type, ArrayBufferView? pixels);
  //(target, level, internalformat, format, type, ImageData? pixels);

  //圖片寬高2的次方才能用
  //gl.generateMipmap(gl.TEXTURE_2D);

  //圖片寬高不是2的次方要用
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); //預設是REPEAT
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  //<--posBuffer-->

  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 16, 0);
  //Attributelocation, size, type, normalize, stride, offset

  //Float32Array時
  //    |  vertex1  |  vertex2  |
  //    |x |y |s |t |x |y |s |t |
  //byte0  4  8  12 16
  //stride = 16
  //offset = 距離起始點 0

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexandcolor), gl.STATIC_DRAW);

  //<--texBuffer-->

  const texBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);

  gl.enableVertexAttribArray(texcoordAttributeLocation);
  gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT, false, 16, 8);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexandcolor), gl.STATIC_DRAW);
  //Attributelocation, size, type, normalize, stride, offset

  //Float32Array時
  //    |  vertex1  |  vertex2  |
  //    |x |y |s |t |x |y |s |t |
  //byte0  4  8  12 16
  //stride = 16
  //offset = 距離起始點 8

  gl.useProgram(program);

  gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height); 

  const textureUnit = 0;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.uniform1i(textureUniformLocation, textureUnit);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

main();