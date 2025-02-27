//importing javascript libraries
import * as THREE from 'https://cdn.skypack.dev/three@0.133.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/loaders/DRACOLoader'
import { MeshSurfaceSampler } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/math/MeshSurfaceSampler'

/*  class for model  */
class Model {
    constructor(obj) {
        console.log(obj)
        this.name = obj.name
        this.file = obj.file
        this.scene = obj.scene
        this.placeOnLoad = obj.placeOnLoad

        this.isActive = false
        this.loader = new GLTFLoader()
        // Configure and create Draco decoder. https://threejs.org/docs/?q=draco#examples/en/loaders/DRACOLoader
        this.dracoLoader = new DRACOLoader()
        this.dracoLoader.setDecoderPath('/')
        this.dracoLoader.setDecoderConfig( { type: 'js' } );
        this.loader.setDRACOLoader(this.dracoLoader)
        this.init()
    }

    init() {
        this.loader.load(this.file, 
            (response) => {
  
    /*  Original Mesh  */
            this.OriginalModelMesh = response.scene.children[0]
            this.OriginalModelMesh.material = this.meshMaterial
          
          
    /* Shader Material */
    this.shaderMaterial = new THREE.ShaderMaterial({
	    vertexShader: vertex,
	    fragmentShader: fragment,
	    uniforms: {
		    uTime: { value: 0.1 },
	        },
    })
          
          
    /*  Particles Geometry  */
    const sampler = new MeshSurfaceSampler(this.OriginalModelMesh).build();
    const numParticles = 20000;
    this.particlesGeometry = new THREE.BufferGeometry();
    const particlesPosition = new Float32Array(numParticles * 3);
    for (let i = 0; i < numParticles; i++) {
        const newPosition = new THREE.Vector3()
        sampler.sample(newPosition);
        particlesPosition.set([
            newPosition.x, newPosition.y, newPosition.z
            ], i * 3)
        }
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPosition, 3))
          
    /*  create particles  */
        this.particleMesh = new THREE.Points(this.particlesGeometry, this.shaderMaterial)
            
    /*  add mesh  */
        this.scene.add(this.particleMesh)
        })
    }
}

/*  render system  */
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight); //change
document.body.appendChild(renderer.domElement); //change

/*  scene and camera setup  */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight, //change
    0.1,
    100
);
camera.position.z = 5;
camera.position.y = 1;

/*  camera setup  */
const controls = new OrbitControls(camera, renderer.domElement);
const blocker = document.getElementById('blocker');
blocker.style.display = 'none';
controls.addEventListener('start', function() {
    blocker.style.display = '';
});
controls.addEventListener('end', function() {
    blocker.style.display = 'none';
});

/* media responsive  */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight; //change
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight); //change
}
window.addEventListener('resize', onWindowResize, false);

/* model import */
const human = new Model({
    name: 'human',
    file: 'assets/human.glb',
    scene: scene
})

/* animation EXTRA */
let start_time = Date.now();
const animate = function() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
   

    //  human.shaderMaterial.uniforms.uTime.value = (Date.now() - start_time)*.0001;
};
animate();