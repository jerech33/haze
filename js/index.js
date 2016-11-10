var camera, controls, scene, light, renderer;
var clock = new THREE.Clock();
var params = {
    antialias: true,
    controls : {
        min : 100,
        max : 500
    },
    shadow : {
        enabled : true,
        size : 1024,
        far : 200
    }
    
};

 function init() {
     
     renderer = new THREE.WebGLRenderer({
         antialias: params.antialias
     });
     renderer.setClearColor(0xbedff6);
     renderer.setPixelRatio(window.devicePixelRatio);
     renderer.setSize(window.innerWidth, window.innerHeight);

     renderer.physicallyCorrectLights = params.shadow.enabled;
     renderer.gammaInput = params.shadow.enabled;
     renderer.gammaOutput = params.shadow.enabled;
     renderer.shadowMap.enabled = params.shadow.enabled;
     
     //  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
     //  renderer.toneMapping = THREE.ReinhardToneMapping;

     document.body.appendChild(renderer.domElement);
     window.addEventListener('resize', onWindowResize, false);

     camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
     camera.position.set(0, 200, 400);

     controls = new THREE.OrbitControls(camera);
     controls.minDistance = params.controls.min;
     controls.maxDistance = params.controls.max;

     scene = new THREE.Scene();

     scene.add(new THREE.AmbientLight(0xbedff6));
     scene.add(new THREE.DirectionalLight(0xffffff, .3));
     scene.fog = new THREE.Fog(0xbedff6, 500, 5000);
     
     var ground = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshLambertMaterial({
         color: 0x92A970
     }));
     scene.add(ground);
     ground.rotation.x = -Math.PI / 2;
     ground.castShadow = params.shadow.enabled;
     ground.receiveShadow = params.shadow.enabled;

     light = new THREE.DirectionalLight(0xffffff, .5);
     light.position.set(200, 200, 200);
     light.castShadow = true;

     var s = params.shadow.size;
     light.shadow.mapSize.width = s;
     light.shadow.mapSize.height = s;
     
     var d = params.shadow.far;
     light.shadow.camera.left = -d/2;
     light.shadow.camera.right = d/2;
     light.shadow.camera.top = d;
     light.shadow.camera.bottom = -d/2;
     light.shadow.camera.far = d*2;
     light.target = HAZE_anim.scene;
     scene.add(light);
    // scene.add(new THREE.CameraHelper(light.shadow.camera ));
     
     HAZE_anim.scene.add(camera);
     HAZE_anim.loadCharacter();
     
 }

 init();

 function onWindowResize() {

     camera.aspect = window.innerWidth / window.innerHeight;
     camera.updateProjectionMatrix();

     renderer.setSize(window.innerWidth, window.innerHeight);
 }

 function animate() {
     
     light.position.x = HAZE_anim.scene.position.x+100;
     light.position.z = HAZE_anim.scene.position.z+100;

     requestAnimationFrame(animate);

     HAZE_anim.update();
     renderer.render(scene, camera);
 }