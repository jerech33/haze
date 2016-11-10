var colors = {
    
    'skin' :        0xe5c587,
    'hairs' :       0x733b1e,
    'iris':         0xa6aa85,
    'pupil' :       0x000000,
    'white' :       0xffffff,
    'black' :       0x000000,
    'up_lips' :     0xefa08b,
    'down_lips' :   0xeab489,
    'ears' :        0x444444,
    'shirt' :       0x333333,
    'border' :      0x555555,
    'logo' :        0x555555,
    'pant' :        0x555555,
    'shoes' :       0x555555,
    'gray1' :       0x666666,
    'gray2' :       0x444444,
    'gray3' :       0x222222,
    'wood' :        0xFF9932,
}

var members = [
    'head',
    'body',
    'arm_up',
    'arm_up2',
    'arm_down',
    'arm_down2',
    'leg_up',
    'leg_up2'
];

var clothes = {
    top : 'shirt01'
};

var head, body;

function assignColor(item, i){
    
    $('.'+item).on('click',function() {
        
        $('.'+item).removeClass('active');
        $(this).addClass('active');

        var data = $(this).css('background-color');
        var color = new THREE.Color(data).getHex();

        colors[i] = color;
        updateCharacter();

    });
}

function updateCharacter(){   
    
    for ( i in members ){
        var obj = scene.getObjectByName(members[i])
        updateMaterials(obj,false);  
    }
}

function updateMaterials(obj, create, callback) {
    
    var materials = [

        // MAIN

        ['C02', colors['skin']],
        ['M00', colors['white']],

        // HEAD

        ['B02', colors['up_lips']],
        ['C08', colors['hairs']],
        ['D02', colors['down_lips']],
        ['G02', colors['iris']],
        ['M07', colors['ears']],
        ['M08', colors['pupil']],
        
        // BODY
        
        ['I05', colors['shirt']],
        ['P01', colors['logo']],
        ['J05', colors['border']],
        
        // AK47
        
        ['gray1',   colors['gray1']],
        ['gray2',   colors['gray2']],
        ['gray3',   colors['gray3']],
        ['wood',    colors['wood']]
        
    ];
    
    var top = {
        
        'shirt01' : [

            ['F03', colors['skin']],     //b_full
            ['M01', colors['border']],   //b_top1
            ['H05', colors['shirt']],    //b_top2
            ['M04', colors['border']],   //b_top3
            ['F07', colors['shirt']],    //b_top4

            ['H07', colors['skin']],     //a_full1
            ['H06', colors['skin']],     //a_shirt
            ['H09', colors['skin']],     //a_b_top

            ['J09', colors['skin']],     //a_full2
            ['J06', colors['skin']],     //a_b_bottom
            ['J07', colors['skin']]      //a_b_top
        
        ],
        'shirt02' : [

            ['F03', colors['shirt']],    //b_full
            ['M01', colors['shirt']],    //b_top1
            ['H05', colors['border']],   //b_top2
            ['M04', colors['skin']],     //b_top3
            ['F07', colors['shirt']],    //b_top4

            ['H07', colors['skin']],     //a_full1
            ['H06', colors['shirt']],    //a_shirt
            ['H09', colors['border']],   //a_b_top

            ['J09', colors['skin']],     //a_full2
            ['J06', colors['skin']],     //a_b_bottom
            ['J07', colors['skin']]      //a_b_top
        
        ],
        'shirt03' : [

            ['F03', colors['shirt']],    //b_full
            ['M01', colors['shirt']],    //b_top1
            ['H05', colors['border']],   //b_top2
            ['M04', colors['skin']],     //b_top3
            ['F07', colors['shirt']],    //b_top4

            ['H07', colors['shirt']],    //a_full1
            ['H06', colors['shirt']],    //a_shirt
            ['H09', colors['shirt']],    //a_b_top

            ['J09', colors['skin']],     //a_full2
            ['J06', colors['border']],   //a_b_bottom
            ['J07', colors['shirt']]     //a_b_top
        
        ]
    }
    
    var m = materials.concat(top[clothes.top]);

    for (child in obj.children) {

        for (i in m) {

            var name = obj.children[child].material.name;
            var set = 'Color_' + m[i][0];
            
            obj.children[child].castShadow = true;
            obj.children[child].receiveShadow = false;
            
            if (name == set) {

                if ( create ){
                    
                    obj.children[child].material = new THREE.MeshLambertMaterial({name: set, color: m[i][1]});

                } else {
                    
                    obj.children[child].material.color = new THREE.Color(m[i][1]);
                    
                }
                
                if ( callback != undefined )
                    callback(m[i]);

            }
        }
    }
}

function buildCharacter(skeleton) {

    var loader = new THREE.ObjectLoader();
    
    loader.load('forkl.json', function(obj) {

        scene.add(obj);
        obj.scale.set(500,500,500);
        obj.position.z = 200;
        obj.position.y = 25;
        obj.rotation.y = Math.PI;

    });
    
    loader.load('tree.json', function(obj) {

        scene.add(obj);
        obj.scale.set(150,150,150);
        obj.position.z = -400;
        obj.position.y = -10;
        obj.rotation.y = Math.PI;

    });
    
    loader.load('character/aka47.json', function(obj) {

        head = obj;
        obj.name = 'aka47';

        skeleton.bones[44].add(obj);
        obj.scale.set(30,30,30);
        obj.position.set(30,-10, -1.3);
        obj.rotation.x = 0.30;
        obj.rotation.y = -0.20;
        obj.rotation.z = 0.30;

        updateMaterials(obj,true);

    });

    loader.load('character/head.json', function(obj) {

        head = obj;
        obj.name = 'head';

        skeleton.bones[5].add(obj);
        obj.scale.set(.1, .1, .1);
        obj.rotation.y = Math.PI;

        updateMaterials(obj,true);

    });
    
    loader.load('character/arm_up.json', function(obj) {

        head = obj;
        obj.name = 'arm_up';
        
        skeleton.bones[13].add(obj);
        obj.scale.set(15, 15, 15);
        obj.position.set(-2,-2,0);
        obj.rotation.y = Math.PI;
        
        var msh = obj.clone();
        msh.name = 'arm_up2';
        skeleton.bones[37].add(msh);
        msh.rotation.y = -Math.PI;

        updateMaterials(obj,true);
        updateMaterials(msh,true);

    });
    
    loader.load('character/arm_up.json', function(obj) {

        head = obj;
        obj.name = 'leg_up';
        
        skeleton.bones[60].add(obj);
        obj.scale.set(15, 15, 15);
        obj.position.set(7.5,10,0);
        obj.rotation.z = Math.PI/2;
        
        var msh = obj.clone();
        msh.name = 'leg_up2';
        skeleton.bones[65].add(msh);
        msh.rotation.z = Math.PI/2;

        updateMaterials(obj,true);
        updateMaterials(msh,true);

    });
    
    
    loader.load('character/arm_down.json', function(obj) {

        head = obj;
        obj.name = 'arm_down';

        skeleton.bones[14].add(obj);
        obj.scale.set(15, 15, 15);
        obj.position.set(2,2.7,0);
        obj.rotation.y = Math.PI;
        
        var msh = obj.clone();
        msh.name = 'arm_down2';
        skeleton.bones[38].add(msh);
        msh.rotation.y = -Math.PI;

        updateMaterials(obj,true);
        updateMaterials(msh,true);

    });

    loader.load('character/body.json', function(obj) {

        body = obj;
        obj.name = 'body';

        skeleton.bones[1].add(obj);
        obj.scale.set(.1, .1, .1);
        obj.rotation.y = Math.PI;

        updateMaterials(obj, true, function(color){
            
            if (color[0] == 'P01') { //LOGO MATERIAL

                var logo = new THREE.TextureLoader().load("logo.png");
                logo.wrapS = logo.wrapT = THREE.RepeatWrapping;
                logo.repeat.set(1, -1);

                obj.children[child].material.side = THREE.BackSide;
                obj.children[child].material.map = logo;
                obj.children[child].material.transparent = true;
            }
            
        });

    });

    assignColor('skin','skin');
    assignColor('hair','hairs');
    assignColor('eyes','iris');
    assignColor('border','border');
    assignColor('shirt','shirt');
}