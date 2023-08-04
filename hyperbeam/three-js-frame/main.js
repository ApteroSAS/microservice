import * as THREE from "three"
import Hyperbeam from "@hyperbeam/web"
import {getRegionFromLocale, readQueryVariable} from "./lib.js";

let hb;
let texture;
let renderer;
let sound;
let scene;
let camera;
let raycaster;
let aspectRatio;
let pointer;
let listener;
let plane;


async function start(){
	let url = readQueryVariable('url', "www.aptero.co");
	let debug = readQueryVariable('debug', "false");
	let session = readQueryVariable('session', "");//session_id : for multiplayer frame
	if (!(url.startsWith("http://") || url.startsWith("https://"))) {
		url = "https://" + url;
	}

	const api = debug === "true" ? "http://localhost:8286/computer" : "/computer";
	const response = await fetch(api, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			session: session? session : undefined,
			start_url: url,
			region: getRegionFromLocale(),
			width: window.innerWidth,
			height: window.innerHeight,
			webgl:true,
		}),
	});

	if (!response.ok) {
		throw new Error('Network response was not ok');
	}

	const data = await response.json();
	/*
	data = {
		"session_id": "52f968cb-6739-4197-83d7-2305fe5d6f54",
		"embed_url": "https://vwdrccwgpv181powg61ggyvy.hyperbeam.com/Uvloy2c5QZeD1yMF_l1vVA?token=c8iw3SmQglOU0ugfLr3dWY2LalSKI_WOGUldEt8knbw",
		"admin_token": "51JOZEEcMp4trCwbpTS3jjQc0lSmeAZpPfxioDqe73U"
	}
 */
	const url2 = new URL(window.location.href);
	url2.searchParams.set('session', data.session_id);
	window.history.replaceState({}, '', url2.toString());

	hb = await Hyperbeam(hbcontainer, data.embed_url, {
		frameCb: (frame) => {
			if(!texture || !renderer) {
				return;
			}
			if (texture.image === null) {
				if (frame.constructor === HTMLVideoElement) {
					// hack: three.js internal methods check for .width and .height
					// need to set manually for video so that three.js handles it correctly
					frame.width = frame.videoWidth
					frame.height = frame.videoHeight
				}
				texture.image = frame
				texture.needsUpdate = true
			} else {
				renderer.copyTextureToTexture(new THREE.Vector2(0, 0), new THREE.Texture(frame), texture)
			}
		},
		audioTrackCb: (track) => {
			if(sound) {
				// sound.play() does not need to be called when calling setMediaStreamSource
				// See https://threejs.org/docs/#api/en/audio/Audio.setMediaStreamSource
				sound.setMediaStreamSource(new MediaStream([track]))
				sound.setRefDistance(0.5)
			}
		}
	})

	await mountViewport(window.innerWidth, window.innerHeight);

	setInterval(() => {
		hb.ping();
	}, 1000);

	window.addEventListener("resize", debounce(onWindowResized, 1000));
	window.addEventListener("wheel", onWheel)
	window.addEventListener("contextmenu", onContextMenu)
	window.addEventListener("pointermove", onPointerMove)
	window.addEventListener("pointerdown", onPointerDown)
	window.addEventListener("pointerup", onPointerUp)
	animate();
}

function debounce(func, wait) {
	let timeout;
	return function (...args) {
		const context = this;
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(context, args), wait);
	};
}

async function mountViewport(width, height) {
	if(renderer) {
		threejscontainer.removeChild(renderer.domElement);//cleanup previous renderer
		renderer.dispose();
		texture.dispose();
		texture = null;
		renderer = null;
	}
	scene = new THREE.Scene()
	pointer = new THREE.Vector2()
	raycaster = new THREE.Raycaster()
	aspectRatio = width / height;
	camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0, 1);
	camera.position.set(0, 0, 1);

	listener = new THREE.AudioListener()
	sound = new THREE.PositionalAudio(listener)
	camera.add(listener)

	renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false })
	renderer.setPixelRatio(window.devicePixelRatio)
	renderer.setClearColor(0xFF889B, 1)
	renderer.setSize(width, height)
	threejscontainer.appendChild(renderer.domElement)

	texture = new THREE.Texture()
	// force flipY to false, three.js is inconsistent with this behaviour
	texture.flipY = false
	texture.generateMipmaps = false

	const geometry = new THREE.PlaneBufferGeometry(2 * aspectRatio, 2)
	const material = new THREE.MeshBasicMaterial({ map: texture })
	plane = new THREE.Mesh(geometry, material)
	scene.add(plane)
	plane.add(sound)
	plane.rotateZ(Math.PI)
	plane.scale.set(-1, 1, 1)

}

async function onWindowResized() {
	if(!hb&& !renderer) {
		return;
	}
	hb.resize(window.innerWidth, window.innerHeight);
	await mountViewport(window.innerWidth,window.innerHeight);
	hb.resize(window.innerWidth, window.innerHeight);
}

function getPlaneIntersects() {
	raycaster.setFromCamera(pointer, camera)
	return raycaster.intersectObject(plane, false)
}

function onWheel(e) {
	hb.sendEvent({
		type: "wheel",
		deltaY: e.deltaY,
	})
}

function onContextMenu(e) {
	e.preventDefault()
}

function handlePointer(e, type) {
	pointer.x = (e.clientX / window.innerWidth) * 2 - 1
	pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
	const intersects = getPlaneIntersects()
	if (intersects.length > 0) {
		const vector = new THREE.Vector3().copy(intersects[0].point)
		plane.worldToLocal(vector)
		hb.sendEvent({
			type,
			x: vector.x / (2 * aspectRatio) + 0.5,
			y: vector.y / 2 + 0.5,
			button: e.button
		})
	}
}

function onPointerMove(e) {
	handlePointer(e, "mousemove")
}

function onPointerDown(e) {
	handlePointer(e, "mousedown")
}

async function onPointerUp(e) {
	handlePointer(e, "mouseup")
	// If the audio context was suspended because there were no user gestures,
	// resume the audio context now since the user interacted with the page
	if (listener.context.state === "suspended") {
		await listener.context.resume()
	}
}

function animate() {
	window.requestAnimationFrame(animate)
	renderer.render(scene, camera)
}

const promise = start();
promise.then(() => {
	console.log("done");
});
promise.catch((err) => {
	console.log(err);
});
