/**
 * @author JeremyChartreu / jeremychartreu.fr
 */

var HAZE = {

    WebglViewport: function(scene, camera) {

        var scope = this;

        this.enabled = true;
        this.render = true;

        this.id = '';

        this.execute = [];

        this.params = {
            width: window.innerWidth,
            height: window.innerHeight,
            color: 0x222222,
            antialias: true,
            grid: false,
            controls: {
                min: 10,
                max: 200
            },
            shadow: {
                enabled: true,
                size: 1024,
                far: 200
            }
        };

        this.renderer = new THREE.WebGLRenderer({
            antialias: scope.params.antialias
        });

        this.scene = scene;
        this.camera = camera;
        this.controls = new THREE.OrbitControls(scope.camera, scope.renderer.domElement);

        this.current = {

            scene: scope.scene,
            camera: scope.camera
        };

        this.offset = {

            right: 0,
            bottom: 0
        };

        this.init = function(callback) {

            if ( scope.params.grid ){
                scope.grid = new THREE.GridHelper(1000, 100, 0xffa700, 0x333333);
                scope.scene.add(scope.grid);

                scope.ground = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshLambertMaterial({
                    color: 0x111111
                }));
                scene.add(scope.ground);
                scope.ground.position.y = -.1;
                scope.ground.rotation.x = -Math.PI / 2;
                scope.ground.castShadow = scope.params.shadow.enabled;
                scope.ground.receiveShadow = scope.params.shadow.enabled;

                scope.scene.fog = new THREE.FogExp2(scope.params.color, 0.003);
            }

            scope.controls.enableDamping = true;
            scope.controls.dampingFactor = 0.3;
            scope.controls.minDistance = scope.params.controls.min;
            scope.controls.maxDistance = scope.params.controls.max;

            scope.renderer.setClearColor(scope.params.color);
            scope.renderer.setPixelRatio(window.devicePixelRatio);
            scope.renderer.setSize(window.innerWidth, window.innerHeight);

            scope.renderer.physicallyCorrectLights = scope.params.shadow.enabled;
            scope.renderer.gammaInput = scope.params.shadow.enabled;
            scope.renderer.gammaOutput = scope.params.shadow.enabled;
            scope.renderer.shadowMap.enabled = scope.params.shadow.enabled;

            scope.camera.position.set(200, 100, 0);

            scope.light = new THREE.DirectionalLight(0xffffff, 1);
            scope.light.position.set(100, 100, 100);
            scope.light.castShadow = true;

            var s = scope.params.shadow.size;
            scope.light.shadow.mapSize.width = s;
            scope.light.shadow.mapSize.height = s;

            var d = scope.params.shadow.far;
            scope.light.shadow.camera.left = -d / 2;
            scope.light.shadow.camera.right = d / 2;
            scope.light.shadow.camera.top = d;
            scope.light.shadow.camera.bottom = -d / 2;
            scope.light.shadow.camera.far = d * 2;
            scope.light.target = scope.scene;
            scope.scene.add(scope.light);

            if (callback != undefined)
                callback();
        };

        this.resize = function() {

            scope.params.width = window.innerWidth;
            scope.params.height = window.innerHeight;

            scope.renderer.setSize(scope.params.width, scope.params.height);

            scope.camera.aspect = scope.params.width / scope.params.height;
            scope.camera.updateProjectionMatrix();
        };

        this.update = function() {

            if (scope.render) {
                scope.renderer.render(scope.current.scene, scope.current.camera);
                for (f in scope.execute) {
                    scope.execute[f]();
                }
            }
            if (!scope.enabled) {
                scope.controls.enabled = false;

            } else {
                scope.controls.enabled = true;
                scope.controls.update();
            }
        };
        return this;
    },
    FileLoader: function(type, URL, callback) {

        var scope = this;

    },
    SkyShader: function(scene) {

        var scope = this;

        this.sky = new THREE.Sky();
        scene.add(this.sky.mesh);

        this.sun = new THREE.Mesh(new THREE.SphereGeometry(20000, 30, 30),
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            }));
        this.sun.position.y = -700000;
        this.sun.visible = true;
        scene.add(this.sun);
        
        this.cloudMaterial = new THREE.MeshBasicMaterial({
            
            map : new HAZE.Texture('img/clouds2.png',1,1),
            transparent : true,
            side : THREE.BackSide,
            blending : THREE.AdditiveBlending
            
        });
        this.clouds = new THREE.Mesh(new THREE.SphereGeometry(10000,30,30),this.cloudMaterial);
        scene.add(this.clouds);
            

        this.parameters = {
            far: 100000,
            turbidity: 10,
            rayleigh: 2,
            mieCoefficient: 0.005,
            mieDirectionalG: 0.8,
            luminance: 1,
            inclination: 0,
            azimuth: 0.10,
            sun: !true
        }

        this.update = function() {

            var uniforms = scope.sky.uniforms;
            uniforms.turbidity.value = scope.parameters.turbidity;
            uniforms.rayleigh.value = scope.parameters.rayleigh;
            uniforms.luminance.value = scope.parameters.luminance;
            uniforms.mieCoefficient.value = scope.parameters.mieCoefficient;
            uniforms.mieDirectionalG.value = scope.parameters.mieDirectionalG;

            var theta = Math.PI * (scope.parameters.inclination - 0.5);
            var phi = 2 * Math.PI * (scope.parameters.azimuth - 0.5);

            scope.sun.position.x = scope.parameters.far * Math.cos(phi);
            scope.sun.position.y = scope.parameters.far * Math.sin(phi) * Math.sin(theta);
            scope.sun.position.z = scope.parameters.far * Math.sin(phi) * Math.cos(theta);

            scope.sun.visible = scope.parameters.sun;

            scope.sky.uniforms.sunPosition.value.copy(scope.sun.position);

        }
        this.update();


    },
    WaterShader: function(scene, camera, renderer, light) {

        this.parameters = {
            width: 1000,
            height: 1000,
        }

        if (light == undefined) {

            var light = new THREE.HemisphereLight(0xffffff, 0xffffff, .5);
            light.position.set(-1, 1, -1);
            scene.add(light);
        }

        var waterNormals = new THREE.TextureLoader().load('img/water.png');
        waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

        this.water = new THREE.Water(renderer, camera, scene, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: waterNormals,
            alpha: .9,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x00362b,
            distortionScale: 5.0,
        });
        
        var s = 500;

        this.waterMesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.parameters.width * s, this.parameters.height * s, 100, 100),
            this.water.material
        );
        this.waterMesh.add(this.water);
        this.waterMesh.position.y = 1;
        this.waterMesh.rotation.x = -Math.PI * 0.5;
        scene.add(this.waterMesh);

        var deep = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(this.parameters.width * s, this.parameters.height * s, 1, 1),
            new THREE.MeshBasicMaterial({
                color: 0x000000
            })
        );

        deep.rotation.x = -Math.PI * 0.5;
        deep.position.y = -2500;
        scene.add(deep);

        this.update = function() {

            this.water.material.uniforms.time.value += 0.75 / 60.0;
            this.water.render();
        }
    },
    PhysicEngine: function() {

        var scope = this;

        this.enabled = false;

        this.world = new CANNON.World();
        this.world.quatNormalizeSkip = 0;
        this.world.quatNormalizeFast = false;

        this.solver = new CANNON.GSSolver();

        this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
        this.world.defaultContactMaterial.contactEquationRelaxation = 4;

        this.solver.iterations = 7;
        this.solver.tolerance = 0.1;
        this.split = true;
        if (this.split)
            scope.world.solver = new CANNON.SplitSolver(scope.solver);
        else
            scope.world.solver = scope.solver;

        this.world.gravity.set(0, -20, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();

        this.physicsMaterial = new CANNON.Material("slipperyMaterial");
        this.physicsContactMaterial = new CANNON.ContactMaterial(scope.physicsMaterial,
            scope.physicsMaterial,
            0.0,                     // FRICTION 
            0.3                     // RESTITUTION
        );

        this.world.addContactMaterial(this.physicsContactMaterial);
        this.renderer = [];

        this.update = function() {

            if (scope.enabled) {

                for (var i = 0; i < scope.renderer.length; i++) {

                    scope.renderer[i][0].position.copy(scope.renderer[i][1].position);
                    scope.renderer[i][0].quaternion.copy(scope.renderer[i][1].quaternion);
                }
            }
        };
    },
    Box : function(x,y,z,mass){
            
            this.name = 'Box';
            
            this.vec3 = new CANNON.Vec3(x/2,y/2,z/2);
            this.geometry = new THREE.BoxGeometry(x,y,z);
        
            this.physicShape = new CANNON.Box(this.vec3);
            this.physicBody = new CANNON.Body({ mass: mass });
            this.physicBody.addShape(this.physicShape);
            
            return this;
            
        },
    Sphere : function(r,s,mass){
            
            this.name = 'Sphere';
            
            this.physicShape = new CANNON.Sphere(r);
            this.geometry = new THREE.SphereGeometry(this.physicShape.radius,s,s);
        
            this.physicBody = new CANNON.Body({ mass: mass });
            this.physicBody.addShape(this.physicShape);
            
            return this;
            
        },
    Object3D : function(obj) {
            
            var scope = this;
            
            this.get = obj;
            this.mesh.name = 'Object';

            this.mesh = new THREE.Mesh(this.get.geometry, new THREE.MeshStandardMaterial({color:0xaaaaaa}));
            
            this.mesh.receiveShadow = true;
            this.mesh.castShadow = true;
            
            this.mesh.userData = {
                element : function(){
                    return scope;
                },
                type : 'object',
                position : new THREE.Vector3(),
                quaternion : new THREE.Quaternion(),
                geometry : {
                    id : null,
                    name : 'Box'
                },
                material : {
                    id : null,
                    name : null
                }
            };
            
            this.physicEnabled = false;
             
            if ( this.get.physicBody != undefined ) {

                this.physic = [this.mesh,this.get.physicBody];
                this.get.physicBody.position.copy(this.mesh.position);
                
            }
                
        return this;
                
    },
    Texture: function(url, repeatX, repeatY) {

        this.loader = new THREE.TextureLoader();

        var texture = this.loader.load(url);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);

        return texture;
    },
    LensFlare: function() {
        
        var scope = this;
        
        this.texture01 = new HAZE.Texture( "img/lensflare0.png",1,1);
        this.texture02 = new HAZE.Texture( "img/lensflare2.png",1,1);
        this.texture03 = new HAZE.Texture( "img/lensflare3.png",1,1);
        this.texture04 = new HAZE.Texture( "img/lensflare4.jpg",1,1);
        
        this.color = new THREE.Color( 0xffffff );
        
        this.object = new THREE.LensFlare( this.texture01, 700, 0.0, THREE.AdditiveBlending, this.color );
        
        this.object.add( this.texture02, 512, 0.0, THREE.AdditiveBlending );
        this.object.add( this.texture02, 512, 0.0, THREE.AdditiveBlending );
        this.object.add( this.texture02, 512, 0.0, THREE.AdditiveBlending );
        this.object.add( this.texture03, 60, 0.6, THREE.AdditiveBlending );
        this.object.add( this.texture03, 70, 0.7, THREE.AdditiveBlending );
        this.object.add( this.texture03, 120, 0.9, THREE.AdditiveBlending );
        this.object.add( this.texture03, 70, 1.0, THREE.AdditiveBlending );
        
        this.object.customUpdateCallback = this.update;
        
        this.update = function(object){
            
            var f, fl = object.lensFlares.length;
            var flare;
            var vecX = -object.positionScreen.x * 2;
            var vecY = -object.positionScreen.y * 2;
            for( f = 0; f < fl; f++ ) {
                flare = object.lensFlares[ f ];
                flare.x = object.positionScreen.x + vecX * flare.distance;
                flare.y = object.positionScreen.y + vecY * flare.distance;
                flare.rotation = 0;
            }
            object.lensFlares[ 2 ].y += 0.025;
            object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
        }
        
        return this.object;
    },
    ReflectionMap: function(object, scene, renderer) {

        var scope = this;

        this.cubeCamera = new THREE.CubeCamera(1, 1000000, 512);
        scene.add(scope.cubeCamera);

        this.map = this.cubeCamera.renderTarget.texture;

        this.update = function() {

            scope.map = this.cubeCamera.renderTarget.texture;

            object.visible = false;
            scope.cubeCamera.position.copy(object.position);
            scope.cubeCamera.updateCubeMap(renderer, scene);
            object.visible = true;

        };

        return this;
    },
    RefractionMap: function(object, scene, renderer) {

        var scope = this;

        this.cubeCamera = new THREE.CubeCamera(1, 1000000, 512);
        object.add(scope.cubeCamera);

        this.map = this.cubeCamera.renderTarget.texture;

        this.update = function() {

            scope.map = this.cubeCamera.renderTarget.texture;

            object.visible = false;
            scope.cubeCamera.position.copy(object.position);
            scope.cubeCamera.updateCubeMap(renderer, scene);
            object.visible = true;

        };

        return this;
    },
    PostProcessing: function(camera, scene, renderer) {

        var scope = this;
        
        this.enabled = true;
        
        this.composer = new THREE.EffectComposer( renderer );
        
        this.overrideMaterial = false;
        this.depthMaterial = null;
        
        this.filters = [];
        this.callBacks = [];
        
        var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter };
        this.renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars );
        
        this.addFilter = function(filter, callback){
            
            scope.filters.push(filter);
            effectComposer.addPass(filter); 
            
            if ( callback != undefined ){
                scope.callBacks.push(callback);
            }

        };
        
        this.removeFilter = function(filter){
            
            scope.composer.passes.splice( filter.index, 1 );
            scope.filters.splice( filter.index, 1 );
            
        };
        
        this.hasFilter = function(filter){
            
            for ( i in scope.filters ){
                if ( scope.filters[i].name == filter.name ){
                    return true;
                } else {
                    return false;
                }
            }
        };
        
        this.resize = function(){
            
            var width = window.innerWidth;
            var height = window.innerHeight;
            
            for ( i in scope.filters ){
                
                scope.filters[i].uniforms[ 'size' ].value.set( width, height );
            }
            
            var pixelRatio = renderer.getPixelRatio();
            var newWidth  = Math.floor( width / pixelRatio ) || 1;
            var newHeight = Math.floor( height / pixelRatio ) || 1;
            scope.renderTarget.setSize( newWidth, newHeight );
            
            scope.composer.setSize( newWidth, newHeight );
            
        };
        
        this.update = function() {
            
            if ( scope.enabled ){
                if ( scope.overrideMaterial ){

                    for ( i in scope.callBacks ){
                        scope.callBacks[i]();
                    }
                    
                    scene.overrideMaterial = scope.depthMaterial;
                    renderer.render( scene, camera, depthRenderTarget, true );
                    scene.overrideMaterial = null;
                    
                    scope.composer.render();

                } else {

                    for ( i in scope.callBacks ){
                        scope.callBacks[i]();
                    }
                    scope.composer.render();

                }
            }
        };

        return this;
    },
    Character: function() {

        var character = this;
        
        this.data = {

            name : 'Haze',
            health : 100,
            position : new THREE.Vector3(),
            weapons : []
        };
        
        this.body = {
            
            isLoaded : false,
            loader : new THREE.FBXLoader(),
            
            object: [],
            weapon : new THREE.Object3D(),
            skeleton: null,
            mixer : null,
            
            load: function(url, callback){
                
                var scope = this;
                
                scope.loader.load( url, function( object ) {
                    
					object.traverse( function( child ) {
                        
						if ( child instanceof THREE.Mesh ) {}
						if ( child instanceof THREE.SkinnedMesh ) {
                            
                            scope.object.push(child);
						}
					});
                    
                    scope.mixer = new THREE.AnimationMixer( scope.object[0] );
                            
                    scope.skeleton = new THREE.SkeletonHelper(scope.object[0]);
                    scene.add( scope.skeleton );
                    
					character.engine.scene.add( object );
                    scope.mixer.clipAction(character.engine.clip['walk']).play();
                    
                    if ( callback != undefined )
                        callback(object);
				});
            },
            
            update: function(){
                
                var scope = this;
                
                scope.skeleton.update();
                
                for (var i = 0, u = character.engine.character.skeleton.bones; i < u.length; i++){

                    var bone = u[i];
                    scope.skeleton.bones[i].position.copy(bone.position);
                    scope.skeleton.bones[i].quaternion.copy(bone.quaternion);
                }
                
                for (var i = 0, u = character.skeleton.bones; i < u.length; i++) {
                    
                    var set;if(i<7)set=i;else if(i>6&&i<9)switch(i){case 7:set=8;case 8:set=10}else i>8&&(set=i+3);
                    
                    var q = new THREE.Euler( 1,1,1, 'XYZ' );
                    q.copy(bones[set].rotation);
                    q.reorder('ZYX');

                    u[i].position.copy(bones[set].position);
                    u[i].quaternion.setFromEuler(q);
                    u[i].quaternion.copy(bones[set].quaternion);
                    u[i].scale.copy(bones[set].scale);
                }
            }
        };

        this.engine = {
            
            isLoaded : false,
            scene: new THREE.Object3D(),

            demo_list: [
                'idle', 
                'walk', 
                'walk_back', 
                'run', 

                'idle_jump', 
                'walk_jump', 
                'run_jump', 

                'idle_reload',
                'walk_reload',
                'run_reload',

                'change',

                'drive', 
                'vehicle_on',
                'vehicle_off'
            ],
            controls: true,

            clip: [],
            root: 'bvh',
            character: null,
            animations: null,
            loader : new THREE.BVHLoader(),
            weapon : new THREE.Object3D(),

            create: function(callback) {

                var scope = this;

                scope.loader.load(scope.root + '/pose.bvh', function(bvh) {

                    scene.add(scope.scene);

                    scope.character = new THREE.SkeletonHelper(bvh.skeleton.bones[0]);
                    scope.character.skeleton = bvh.skeleton;
                    scope.scene.add(bvh.skeleton.bones[0]);
                    scope.animations = new THREE.AnimationMixer(scope.character);

                    var clip = bvh.clip;
                    clip.name = 'pose';
                    scope.clip[clip.name] = clip;
                    scope.animations.clipAction(clip).play();

                    var count = 0;
                    var list = scope.demo_list;

                    for ( bvh in list) {

                        scope.loadBVH(list[bvh], function() {

                            count++;
                            if (count == list.length) {

                                scope.init();
                                scope.build();
                                if ( callback != undefined ){
                                    callback();
                                }
                            }
                        });
                    }
                });
            },
            loadBVH: function(name, callback) {

                var scope = this;

                scope.loader.load(scope.root + '/' + name + '.bvh', function(bvh) {

                    var clip = bvh.clip;
                    clip.name = name;
                    scope.clip[name] = clip;

                    var animation = scope.animations.clipAction(clip);
                    animation.play();
                    animation.weight = 0;

                    callback(bvh);
                });
            },

            delay: 0,
            time: 500,
            clock: new THREE.Clock(),

            move: {
                speed: 0,
                y: 0,
                old: 0
            },

            walking: false,
            running: false,
            aiming: false,
            firing: false,

            front: false,
            back: false,
            left: false,
            right: false,

            driving : false,

            current_state: 'idle',
            current_anim: 'idle',

            weight: function(event) {

                var scope = this;

                var data = event.detail;
                for (var i = 0; i < data.anims.length; ++i) {

                    scope.animations.clipAction(data.anims[i]).setEffectiveWeight(data.weights[i]);
                }
            },
            tween: function(obj, to, duration) {

                var tween = new TWEEN.Tween(obj)
                    .to(to, duration)
                    .onUpdate(function() {
                        obj = this.f;
                    })
                    .easing(TWEEN.Easing.Quartic.InOut)
                    .start();

            },
            isUpdatingAnim: false,

            setAnimation: function(name, t) {

                var scope = this;

                var duration = 300;
                if (t != undefined) { duration = t }

                scope.animations.clipAction(name).reset();

                var coords = { f: 0, t: 1 };
                var tween = new TWEEN.Tween(coords)
                    .to({
                        f: 1,
                        t: 0
                    }, duration)
                    .onStart(function() {
                        scope.isUpdatingAnim = true;
                        scope.delay = duration;
                    })
                    .onUpdate(function() {
                        scope.delay -= 1;
                        scope.weight({
                            detail: {
                                anims: [name, scope.current_anim],
                                weights: [this.f, this.t]

                            }
                        });
                    })
                    .onComplete(function() {
                        scope.delay = 0;
                        scope.current_anim = name;
                        scope.isUpdatingAnim = false;

                    })
                    .easing(TWEEN.Easing.Quartic.InOut)
                    .delay(scope.delay/2)
                    .start();
            },
            playOnce: function(name, time){

                var scope = this;

                var action = scope.animations.clipAction(scope.clip[name]);
                action.setLoop('LoopOnce',0);
                var t = action._clip.duration * 1000;
                var duration = t - ( t / 2);

                scope.setAnimation(scope.clip[name]);
                setTimeout(
                    function(){
                        scope.setAnimation(scope.clip[scope.current_state], time);
                    },
                    duration
                );
            },
            controller : {

                left : function(){
                    character.engine.tween(character.engine.move, { y: -.03 }, character.engine.time)
                },
                right : function(){
                    character.engine.tween(character.engine.move, { y: .03 }, character.engine.time)
                },
                front : function(){
                    if ( !character.engine.weapon.visible ){
                        character.engine.weapon.visible = true;
                    }
                    if (!character.engine.walking) {
                        character.engine.setAnimation(character.engine.clip['walk'], 600);
                        character.engine.current_state = 'walk';
                        character.engine.tween(character.engine.move, { speed: 100 }, character.engine.time)
                        character.engine.walking = true;
                        character.engine.driving = false;
                    }           
                },
                back : function(){
                    if (!character.engine.back) {
                        if (!character.engine.walking && character.engine.current_state != 'walk') {
                            character.engine.setAnimation(character.engine.clip['walk_back']);
                            character.engine.current_state = 'walk';
                            character.engine.walking = true
                            character.engine.driving = false;
                        }
                        character.engine.tween(character.engine.move, { speed: -100 }, character.engine.time);
                    }        
                },
                run : function(){
                    if (!character.engine.running && character.engine.walking) {
                        character.engine.setAnimation(character.engine.clip['run'], 600);
                        character.engine.current_state = 'run';
                        character.engine.tween(character.engine.move, { speed: 500 }, character.engine.time);
                        character.engine.running = true;
                    }       
                },
                jump : function(){
                    character.engine.playOnce(character.engine.current_state+'_jump',500);
                },
                reload : function(){
                    character.engine.playOnce(character.engine.current_state+'_reload',1000);
                },
                change : function(){
                    character.engine.playOnce('change',500);
                },
                drive : function(){
                    if ( !character.engine.driving ){

                        character.engine.controls = false;
                        character.engine.playOnce('change',500);

                        setTimeout(function(){
                            character.engine.weapon.visible = false;
                        }, 750);
                        setTimeout(function(){
                            character.engine.setAnimation(character.engine.clip['vehicle_on'], 500);
                        }, 1750);
                        setTimeout(function(){
                            character.engine.setAnimation(character.engine.clip['drive'], 500);
                            character.engine.controls = true;
                        }, 6500);

                        character.engine.driving = true;

                    } else if ( character.engine.driving ){

                        character.engine.controls = false;
                        character.engine.setAnimation(character.engine.clip['vehicle_off'], 500);

                        setTimeout(function(){
                            character.engine.playOnce('change',500);
                        }, 5000);
                        setTimeout(function(){
                            character.engine.weapon.visible = true;
                            character.engine.controls = true;
                        }, 5750);

                        character.engine.driving = false;
                    }
                }
            },
            initControls: function() {

                var scope = this;

                var ctrl = scope.controller;

                document.addEventListener('keydown', function(ev) {

                    if ( scope.controls ){

                        switch (ev.keyCode) {

                            case 65: 
                                ctrl.left();
                                break;

                            case 68: 
                                ctrl.right();
                                break;
                        }
                    }

                    if (scope.controls && !scope.isUpdatingAnim) {

                        switch (ev.keyCode) {

                            case 32: 
                                ctrl.jump();
                                break;

                            case 82:
                                ctrl.reload();
                                break;

                            case 69: 
                                ctrl.drive();
                                break;

                            case 70: 
                                ctrl.change();
                                break;

                            case 87: 
                                ctrl.front();
                                break;

                            case 83: 
                                ctrl.back();
                                break;

                            case 16:
                                ctrl.run();
                                break;
                        }
                    }
                });

                document.addEventListener('keyup', function(ev) {

                    if (scope.controls) {

                        switch (ev.keyCode) {
                            case 32: // space --> JUMP
                                break;

                            case 82: // R --> RELOAD
                                break;

                            case 65: // left
                                scope.tween(scope.move, { y: 0 }, scope.time)
                                break;

                            case 87: // forward
                                scope.setAnimation(scope.clip['idle'], 600);
                                scope.current_state = 'idle';
                                scope.tween(scope.move, { speed: 0 }, scope.time);
                                scope.walking = false;
                                break;

                            case 68: // right
                                scope.tween(scope.move, { y: 0 }, scope.time)
                                break;

                            case 83: // back
                                scope.setAnimation(scope.clip['idle'], 600);
                                scope.current_state = 'idle';
                                scope.tween(scope.move, { speed: 0 }, scope.time);
                                scope.back = false;
                                scope.walking = false;
                                break;

                            case 16: // shift
                                if (scope.walking) {
                                    if (scope.running) {
                                        scope.setAnimation(scope.clip['walk'], 1000);
                                        scope.current_state = 'walk';
                                        scope.running = false;
                                    } else if (scope.current_state != 'idle') {
                                        scope.setAnimation(scope.clip['idle'], 1000);
                                        scope.current_state = 'idle';
                                    }
                                    scope.tween(scope.move, { speed: 100 }, 1000);
                                }
                                break;
                        }
                    }
                });
            },
            build: function() {

                var scope = this;
                
                for (var i = 0, u = scope.character.skeleton.bones; i < u.length; i++) {

                    var bone = u[i];

                    var member = new THREE.Mesh(
                        new THREE.BoxGeometry(1, 2, 1),
                        new THREE.MeshBasicMaterial()
                    );

                    bone.add(member);
                }
            },
            init: function() {

                var scope = this;

                scope.current_anim = scope.clip['pose'];
                scope.animations.clipAction(scope.clip['pose']).setEffectiveWeight(1);

                scope.initControls();
                scope.isLoaded = true;

            },
            update: function() {

                var scope = this;

                var delta = scope.clock.getDelta();

                var move = scope.move.speed * delta;
                scope.scene.translateZ(move);
                scope.scene.rotation.y -= scope.move.y;

                scope.animations.update(delta);
                scope.character.update();

                TWEEN.update();
            }
        };
        return this;
    },
    Vehicle: function(scene, renderer) {

        var scope = this;

        this.update = function() {

        };

        return this;
    },
};