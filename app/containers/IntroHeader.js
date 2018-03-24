var container;
var camera, scene, renderer;

var geometry, group;

var mouseX = 0,
    mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = 600 / 2;

document.addEventListener('mousemove', onDocumentMouseMove, false);

init();
animate();

// var $ = document.getElementById;

// $(".re-render").click(function() {
//     init();
// });

function init() {

    ////////////////////////////////////
    // Setup Container
    ////////////////////////////////////
    container = document.createElement('div');
    $("#canvas").html(container);


    scene = new THREE.Scene();

    group = new THREE.Group();

    var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: THREE.FaceColors
    });

    // Set Cube Size
    geometry = new THREE.BoxGeometry(30, 30, 30);

    // Set cube color
    grey = new THREE.Color(0x0B244E);
    blue = new THREE.Color(0x0066FF);
    light = new THREE.Color(0xD0E3FF);
    var colors = [grey, blue, light];

    for (var i = 0; i < 3; i++) {
        geometry.faces[4 * i].color = colors[i];
        geometry.faces[4 * i + 1].color = colors[i];
        geometry.faces[4 * i + 2].color = colors[i];
        geometry.faces[4 * i + 3].color = colors[i];
    }                     

    // Creat cubes
    for (var i = 0; i < 100; i++) {
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = Math.random() * 1400 - 700;
        mesh.position.y = Math.random() * 1400 - 700;
        mesh.position.z = Math.random() * 1400 - 700;

        mesh.rotation.x = Math.random() * 2 * Math.PI;
        mesh.rotation.y = Math.random() * 2 * Math.PI;
        
        // Scale Cube between 0.2 to 4
        var xScale = Math.random() * (4 - 0.2) + 0.2;
        mesh.scale.x = xScale;
        mesh.scale.y = xScale;
        mesh.scale.z = xScale;

        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();

        group.add(mesh);
    }


    scene.add(group);

    ////////////////////////////////////
    // Setup Camera
    ////////////////////////////////////
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / 600, 1, 10000);
    camera.position.z = 1;

    ////////////////////////////////////
    // Lighting
    ////////////////////////////////////

    // create a point light
    var pointLight = new THREE.DirectionalLight(0xD0E3FF);

    // set its position
    pointLight.position.x = 20;
    pointLight.position.y = 120;
    pointLight.position.z = 0;

    // add to the scene
    scene.add(pointLight);

    ////////////////////////////////////
    // Rendering
    ////////////////////////////////////

    renderer = new THREE.WebGLRenderer({ antialias: true } );
    renderer.setClearColor(0x101317);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, 600);
    renderer.sortObjects = false;

    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
}

 /////////////////////////////////
// Feel free to resize that windah, Y'all!
// We all know a good pen should resize when you be adjustin' that little screen dat errythang renders into, knah mean?
////////////////////////////////////
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    // windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / 600;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, 600);
}

function onDocumentMouseMove(event) {
  if ((event.clientY + window.scrollY) < 600) {
    mouseX = (event.clientX - windowHalfX) * 5;
    mouseY = (event.clientY - windowHalfY) * 5;
  }
}

function animate() {
    requestAnimationFrame(animate);

    render();
}

function render() {

    var time = Date.now() * 0.001;

    var rx = Math.sin(time * 0.3) * 0.5,
        ry = Math.sin(time * 0.3) * 0.5,
        rz = Math.sin(time * 0.3) * 0.5;

    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;

    camera.lookAt(scene.position);

    group.rotation.x = rx / 5;
    group.rotation.y = ry / 5;
    group.rotation.z = rz / 5;

    renderer.render(scene, camera);
}