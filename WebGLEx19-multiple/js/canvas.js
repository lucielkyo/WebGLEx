import { CreateShader, CreateProgram, LoadImage } from './preFun.js';
import { matrix4 } from './matrix.js';
import * as twgl from 'https://unpkg.com/twgl.js@4.19.2/dist/4.x/twgl-full.module.js';

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

uniform vec3 u_color;

varying vec3 v_color;

void main() {
  gl_FragColor = vec4(v_color + u_color, 1); }`;


async function setup() {
	const canvas = document.getElementById('canvas');
	const gl = canvas.getContext('webgl');

	const oesVaoExt = gl.getExtension('OES_vertex_array_object');
	console.log(oesVaoExt)
	if (oesVaoExt) {
		gl.createVertexArray = (...args) => oesVaoExt.createVertexArrayOES(...args);
		gl.deleteVertexArray = (...args) => oesVaoExt.deleteVertexArrayOES(...args);
		gl.isVertexArray = (...args) => oesVaoExt.isVertexArrayOES(...args);
		gl.bindVertexArray = (...args) => oesVaoExt.bindVertexArrayOES(...args);
	} else {
		throw new Error('Your browser does not support WebGL ext: OES_vertex_array_object')
	}


	const vertexShader = CreateShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	const fragmentShader = CreateShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	const program = CreateProgram(gl, vertexShader, fragmentShader);

	const attributes = {
		position: gl.getAttribLocation(program, 'a_position'),
		color: gl.getAttribLocation(program, 'a_color')
	};
	const uniforms = {
		matrix: gl.getUniformLocation(program, 'u_matrix'),
		color: gl.getUniformLocation(program, 'u_color'),

	};
		
	const objects = {};

	{
		//pModel

		const { attribs, numElements } = createModelBufferArrays();
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);
		
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

		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(attribs.a_position),
			gl.STATIC_DRAW
		);

		//<--colorBuffer-->

		buffers.color = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);

		gl.enableVertexAttribArray(attributes.color);
		gl.vertexAttribPointer(attributes.color, 3, gl.FLOAT, false, 0, 0);
		//Attributelocation, size, type, normalize, stride, offset

		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(attribs.a_color),
			gl.STATIC_DRAW);

		objects.pModel = {
			attribs, numElements,
			vao, buffers,
		};
	}

	{
		//ball
		const attribs = twgl.primitives.deindexVertices(
			twgl.primitives.createSphereVertices(10, 32, 32) //半徑, 精緻度
		);

		const numElements = attribs.position.length / attribs.position.numComponents;

		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);

		const buffers = {};

		// a_position
		buffers.position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

		gl.enableVertexAttribArray(attributes.position);
		gl.vertexAttribPointer(
			attributes.position,
			3, // size
			gl.FLOAT, // type
			false, // normalize
			0, // stride
			0, // offset
		);

		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(attribs.position),
			gl.STATIC_DRAW,
		);

		objects.ball = {
			attribs, numElements,
			vao, buffers
		};
	}


	{
		//ground
		const attribs = twgl.primitives.deindexVertices(
			twgl.primitives.createPlaneVertices(1, 1)
		);

		const numElements = attribs.position.length / attribs.position.numComponents;
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);

		const buffers = {};
		buffers.position = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

		gl.enableVertexAttribArray(attributes.position);
		gl.vertexAttribPointer(
			attributes.position,
			3,
			gl.FLOAT,
			false,
			0,
			0
		);

		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(attribs.position),
			gl.STATIC_DRAW
		);

		objects.ground = {
			attribs, numElements,
			vao, buffers
		};
	}

	
	return {
		gl,
		program, attributes, uniforms,
		//buffers, modelBufferArrays,
		objects,
		state: {
			fovy: 45 * Math.PI / 180,
			translate: [150, 100, 0],
			rotate: [degToRad(180), degToRad(0), degToRad(0)],
			scale: [1, 1, 1],
			cameraPosition: [250, 180, 400],
			cameraVelocity: [0, 0, 0],
		},
		time: 0
	};
}

function render(app) {
	const {
		gl,
		program, uniforms,
		//modelBufferArrays,
		objects,
		state
	} = app;

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	gl.viewport(0, 0, canvas.width, canvas.height); //繪製區域設定

	gl.clearColor(250 / 255, 250 / 255, 180 / 255, 1); //背景底色
	gl.clear(gl.COLOR_BUFFER_BIT); //顏色緩衝區

	gl.useProgram(program);

	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	//const cameraMatrix = matrix4.translate(250, 0, 400);
	//lookAt(cameraPosition, target, up)
	const cameraMatrix = matrix4.lookAt(state.cameraPosition,[250, 0, 0],[0,1,0]);

	//const viewMatrix = matrix4.identity();
	//perspective: (fovy, aspect, near, far)
	const viewMatrix = matrix4.multiply(
		matrix4.perspective(state.fovy, gl.canvas.width / gl.canvas.height, 0.1, 2000),
		matrix4.inverse(cameraMatrix));
	//const viewMatrix = matrix4.perspective(state.fovy, gl.canvas.width / gl.canvas.height, 0.1, 2000);


	{
		//pModel
		gl.bindVertexArray(objects.pModel.vao);

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
			matrix4.multiply(viewMatrix, worldMatrix)
		);
		
		gl.uniform3f(uniforms.color,0,0,0);

		// gl.drawArrays(gl.TRIANGLES, 0, 0);
		gl.drawArrays(gl.TRIANGLES, 0, objects.pModel.numElements);
	}

	{
		//ball
		gl.bindVertexArray(objects.ball.vao);

		const worldMatrix = matrix4.multiply(
			matrix4.translate(300, 30, 0),
			matrix4.scale(3, 3, 3),
		);

		gl.uniformMatrix4fv(
			uniforms.matrix,
			false,
			matrix4.multiply(viewMatrix, worldMatrix),
		);

		gl.uniform3f(uniforms.color, 67 / 255, 123 / 255, 208 / 255);

		gl.drawArrays(gl.TRIANGLES, 0, objects.ball.numElements);
	}

	{
		//ground
		gl.bindVertexArray(objects.ground.vao);

		const worldMatrix = matrix4.multiply(
			matrix4.translate(240, 0, 0),
			matrix4.scale(300, 1, 300)
		);

		gl.uniformMatrix4fv(
			uniforms.matrix,
			false,
			matrix4.multiply(viewMatrix, worldMatrix),
		);

		gl.uniform3f(uniforms.color, 0.5, 0.5, 0.5);

		gl.drawArrays(gl.TRIANGLES, 0, objects.ground.numElements);
	}
}

async function main() {
	const app = await setup();
	console.log(app.state);
	window.app = app;
	window.gl = app.gl;

	render(app);

	const cForm = $('#controls');
	cForm.on('input', function () {
		//let fData = $('input[name="texture"]:checked').val();
		//let sData = $('input[name="speed"]').val();
		let fovData = $('input[name="fov"]').val();
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
		app.state.fovy = fovData * Math.PI / 180;
		console.log(app.state);
		app.state.translate[0] = txData;
		app.state.translate[1] = tyData;
		app.state.translate[2] = tzData;
		app.state.scale[0] = scaleX;
		app.state.scale[1] = scaleY;
		app.state.scale[2] = scaleZ;
		app.state.rotate[0] = degToRad(rotaX);
		app.state.rotate[1] = degToRad(rotaY);
		app.state.rotate[2] = degToRad(rotaZ); //弧度

		//render(app);
	});

	//按鍵事件
	handleKeyDown(app);
	handleKeyUp(app);
	$(document).on({
		'touchstart': function (event) {
			handlePointerDown(app, event.touches[0]);
		}
	});
	$(document).on({
		'mousedown': function (event) {
			handlePointerDown(app, event);
		}
	});
	$(document).on({
		'mouseup': function () {
			handlerPointerEnd(app);
		}
	});
	$(document).on({
		'touchend': function () {
			handlerPointerEnd(app);
		}
	});
	
	startLoop(app);
}

function startLoop(app, now = 0) {
	const { state, gl } = app;
	const timeDiff = now - app.time;
	app.time = now;
	
	app.state.cameraPosition[0] += app.state.cameraVelocity[0] * timeDiff;
	app.state.cameraPosition[1] += app.state.cameraVelocity[1] * timeDiff;
	app.state.cameraPosition[2] += app.state.cameraVelocity[2] * timeDiff;
	$('#cameraPosition').text('cameraPosition:{' + app.state.cameraPosition.flatMap(f => f.toFixed(2)).join(',') + '}');

	render(app, timeDiff);
	requestAnimationFrame(now => startLoop(app, now))
}

main();


function createModelBufferArrays() {
	// positions
	const a = 100, b = 100, c = 100;

	const points = [0, c].flatMap(z => ([
		[0, 0, z], //0, 4
		[0, b, z], //1, 5
		[a, b, z], //2, 6
		[a, 0, z]  //3, 7
	]));

	const a_position = [
		...rectVertices(points[0], points[1], points[2], points[3]), //前
		...rectVertices(points[4], points[7], points[6], points[5]), //後
		...rectVertices(points[4], points[5], points[1], points[0]), //左
		...rectVertices(points[3], points[2], points[6], points[7]), //右
		...rectVertices(points[4], points[0], points[3], points[7]), //上
		...rectVertices(points[5], points[6], points[2], points[1]), //下
	];

	// a_color
	const frontColor = [0 / 255, 0 / 255, 0 / 255];
	const a_color = [
		...rectColor(frontColor),
		...rectColor([255 / 255, 255 / 255, 255 / 255]),
		...rectColor(randomColor()),
		...rectColor(randomColor()),
		...rectColor(randomColor()),
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

//鍵盤控制
function handleKeyDown(app) {

	$(document).keydown(function () {
		switch (event.code) {
			case 'KeyA':
			case 'ArrowLeft':
				app.state.cameraVelocity[0] = -0.5;
				break;
			case 'KeyD':
			case 'ArrowRight':
				app.state.cameraVelocity[0] = 0.5;
				break;
			case 'KeyW':
			case 'ArrowUp':
				app.state.cameraVelocity[1] = 0.5;
				break;
			case 'KeyS':
			case 'ArrowDown':
				app.state.cameraVelocity[1] = -0.5;
				break;
		}
	});
}
function handleKeyUp(app) {
	$(document).keyup(function () {
		switch (event.code) {
			case 'KeyA':
			case 'ArrowLeft':
			case 'KeyD':
			case 'ArrowRight':
				app.state.cameraVelocity[0] = 0;
				break;
			case 'KeyW':
			case 'ArrowUp':
			case 'KeyS':
			case 'ArrowDown':
				app.state.cameraVelocity[1] = 0;
				break;
		}
	});
}

function handlePointerDown(app, TouchMouseevent) {
	const x = TouchMouseevent.pageX - app.gl.canvas.width / 2;
	const y = TouchMouseevent.pageY - app.gl.canvas.height / 2;
	if (x * x > y * y) {
		if (x > 0) {
			app.state.cameraVelocity[0] = 0.5;
		} else {
			app.state.cameraVelocity[0] = -0.5;
		}
	} else {
		if (y < 0) {
			app.state.cameraVelocity[1] = 0.5;
		} else {
			app.state.cameraVelocity[1] = -0.5;
		}
	}
}

function handlerPointerEnd(app) {
	app.state.cameraVelocity[0] = 0;
	app.state.cameraVelocity[1] = 0;
	app.state.cameraVelocity[2] = 0;
}