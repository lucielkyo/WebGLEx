import {CreateShader, CreateProgram, LoadImage} from './preFun.js';

const vertexandcolor = [
//頂點        材質
  0, 0,     0,0,//左上  
  150, 0,   1,0,//右上  
  150, 150, 1,1,//右下

  0, 0,     0,0,//左上
  150, 150, 1,1,//右下
  0, 150,   0,1 //左下
];


const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_texcoord;

uniform vec2 u_resolution;
uniform vec2 u_offset;

varying vec2 v_texcoord;

void main() {
  vec2 position = a_position + u_offset;
  gl_Position = vec4(
  position / u_resolution * vec2(2,-2) + vec2(-1, 1), 0, 1); 
  v_texcoord =  a_texcoord;}`;
//新座標 = 舊座標x座標比例x方向+原點偏移

//mediump 設定要多精準的float
const fragmentShaderSource = `
precision mediump float; 

varying vec2 v_texcoord;
uniform sampler2D u_texture;

void main() {
  gl_FragColor = texture2D(u_texture, v_texcoord); }`;


async function setup(){
  const canvas = document.getElementById('canvas');
  const gl = canvas.getContext('webgl');  

  const vertexShader = CreateShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = CreateShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = CreateProgram(gl, vertexShader, fragmentShader);

  const attributes = {
    position: gl.getAttribLocation(program, 'a_position'),
    texcoord: gl.getAttribLocation(program, 'a_texcoord')
  };
  const uniforms ={
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    texture: gl.getUniformLocation(program, 'u_texture'),
    offset: gl.getUniformLocation(program, 'u_offset')
  };

  const textureimgs = await Promise.all([
    'https://i.imgur.com/EDLB71ih.jpg',
    'https://i.imgur.com/KT2nqZNh.jpg',
    'https://i.imgur.com/diRWq5ph.jpg'
  ].map(async url => {
    const image = await LoadImage(url);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0, // level
      gl.RGB, // internalFormat
      gl.RGB, // format
      gl.UNSIGNED_BYTE, // type
      image // data
    );

    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

    return texture;
  }));

  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); //預設是REPEAT
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  const buffers = {};

  //<--posBuffer-->

  buffers.position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

  gl.enableVertexAttribArray(attributes.position);
  gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 16, 0);
  //Attributelocation, size, type, normalize, stride, offset

  //Float32Array時
  //    |  vertex1  |  vertex2  |
  //    |x |y |s |t |x |y |s |t |
  //byte0  4  8  12 16
  //stride = 16
  //offset = 距離起始點 0

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexandcolor), gl.STATIC_DRAW);

  //<--texBuffer-->

  buffers.texcoord = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texcoord);

  gl.enableVertexAttribArray(attributes.texcoord);
  gl.vertexAttribPointer(attributes.texcoord, 2, gl.FLOAT, false, 16, 8);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexandcolor), gl.STATIC_DRAW);
  //Attributelocation, size, type, normalize, stride, offset

  const directionDeg = Math.random() * 2 * Math.PI;
  
  return {
    gl, 
    program, attributes, uniforms,
    buffers, textureimgs, 
    state: { 
      texture: 0,
      offset:[0,0],
      direction:[Math.cos(directionDeg), Math.sin(directionDeg)],
      speed: 0.1 },
    time: 0
  };
}

async function render(app){
  const {
    gl, 
    program, uniforms,
    textureimgs, state
  } = app;
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  gl.viewport(0, 0, canvas.width, canvas.height); //繪製區域設定

  gl.clearColor(250/255, 250/255, 180/255, 1); //背景底色
  gl.clear(gl.COLOR_BUFFER_BIT); //顏色緩衝區

  gl.useProgram(program);

  gl.uniform2f(uniforms.resolution, gl.canvas.width, gl.canvas.height);
  gl.uniform2fv(uniforms.offset, state.offset); 

  const textureUnit = 0;
  gl.bindTexture(gl.TEXTURE_2D, textureimgs[state.texture]);
  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.uniform1i(uniforms.texture, textureUnit);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

async function main(){
  const app = await setup();
  console.log(app.state);
  window.app = app;
  window.gl = app.gl;

  await render(app);

  const cForm = $('#controls');
  cForm.on('input', function() {
    let fData = $('input[name="texture"]:checked').val();
    let sData = $('input[name="speed"]').val();
    console.log(fData);
    app.state.texture = fData;
    app.state.speed = sData;
  });

  startLoop(app);
}

function startLoop(app, now = 0){
  const {state, gl} = app;
  const timeDiff = now - app.time;
  app.time = now;

  state.offset = state.offset.map((v, i) => v + state.direction[i] * timeDiff * state.speed);

  if(state.offset[0] + 150 > gl.canvas.width){
    state.direction[0] *= -1;
    state.offset[0] = gl.canvas.width - 150;
  }
  else if (state.offset[0] < 0){
    state.direction[0] *= -1;
    state.offset[0] = 0;
  }

  if (state.offset[1] + 150 > gl.canvas.height) {
    state.direction[1] *= -1;
    state.offset[1] = gl.canvas.height - 150; //32 = 2rem
  }
  else if (state.offset[1] < 0){
    state.direction[1] *= -1;
    state.offset[1] = 0;
  }

  render(app);
  requestAnimationFrame(now =>startLoop(app,now))
}

main();