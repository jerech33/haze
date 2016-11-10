var HAZE_anim = {
    
    data : {
        
        name : 'Haze',
        health : 100,
        position : new THREE.Vector3(),
        weapons : []
    },

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
        
        'rifle_on',
        'rifle_off',
        
        'drive', 
        'thriller_part_2'
    ],
    controls: true,

    clip: [],
    character: null,
    animations: null,
    root: 'bvh',
    loader : new THREE.BVHLoader(),
    
    loadCharacter: function() {

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
                        animate();
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
            .delay(scope.delay)
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
            HAZE_anim.tween(HAZE_anim.move, { y: -.03 }, HAZE_anim.time)
        },
        
        right : function(){
            HAZE_anim.tween(HAZE_anim.move, { y: .03 }, HAZE_anim.time)
        },
        
        front : function(){
            if (!HAZE_anim.walking) {
                HAZE_anim.setAnimation(HAZE_anim.clip['walk'], 600);
                HAZE_anim.current_state = 'walk';
                HAZE_anim.tween(HAZE_anim.move, { speed: 100 }, HAZE_anim.time)
                HAZE_anim.walking = true;
            }           
        },
        
        back : function(){
            if (!HAZE_anim.back) {
                if (!HAZE_anim.walking && HAZE_anim.current_state != 'walk') {
                    HAZE_anim.setAnimation(HAZE_anim.clip['walk_back']);
                    HAZE_anim.current_state = 'walk';
                    HAZE_anim.walking = true
                }
                HAZE_anim.tween(HAZE_anim.move, { speed: -100 }, HAZE_anim.time);
            }        
        },
        
        run : function(){
            if (!HAZE_anim.running && HAZE_anim.walking) {
                HAZE_anim.setAnimation(HAZE_anim.clip['run'], 600);
                HAZE_anim.current_state = 'run';
                HAZE_anim.tween(HAZE_anim.move, { speed: 500 }, HAZE_anim.time);
                HAZE_anim.running = true;
            }       
        },
        
        jump : function(){
            HAZE_anim.playOnce(HAZE_anim.current_state+'_jump',500);
        },
        
        reload : function(){
            HAZE_anim.playOnce(HAZE_anim.current_state+'_reload',1000);
        },
        
        change : function(){
            HAZE_anim.playOnce('rifle_off',500);
            setTimeout(function(){HAZE_anim.playOnce('rifle_on',500);},500);
        },
        
        drive : function(){
            HAZE_anim.playOnce('drive',500);
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
        
        buildCharacter(scope.character.skeleton);

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
    },

    update: function() {

        var scope = this;

        var delta = clock.getDelta();

        var move = scope.move.speed * delta;
        scope.scene.translateZ(move);
        scope.scene.rotation.y -= scope.move.y;

        HAZE_anim.animations.update(delta);
        HAZE_anim.character.update();

        TWEEN.update();
        
    }
}