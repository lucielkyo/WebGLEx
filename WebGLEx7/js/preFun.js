export function CreateShader(gl, type, source)   {
  const shader = gl.createShader(type); //type = vertex 或 fragment shader
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS); //查看編譯成功或失敗
  if (ok) return shader;
  else alert("compile shader error");

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

export function CreateProgram(gl, vertexShader, fragmentShader) {
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

//非同步
export async function LoadImage(url){
  return new Promise(resolve => {
    const image = new Image();

    //Cross Origin
    if ((new URL(url)).host !== location.host ) {
      image.crossOrigin = '';
    }

    image.onload = function() {
      resolve(image);
    };
    image.src = url;
  })
}