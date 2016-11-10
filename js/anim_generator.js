var HAZE_anim = {

    state: ['idle', 'walk', 'run'],

    direction: ['front', 'back', 'left', 'right'],
    position: ['', 'crouch', 'die'],
    weapon: ['', 'rifle', 'gun', 'cut'],
    action: ['', 'aim', 'shoot', 'cut', 'throw'],

    load: function() {

        var scope = this;
        var act = [];

        for (var i in scope.state) {

            var count = 0;
            var old;

            for (var j in scope.direction) {
                for (var k in scope.position) {
                    for (var l in scope.weapon) {
                        for (var m in scope.action) {

                            var data;

                            "idle" == scope.state[i] ? (data = scope.state[i] + " ", "die" != scope.position[k] ? (data += scope.position[k] + " ", data += scope.weapon[l] + " ", "" != scope.weapon[l] && (data += scope.action[m])) : data += scope.position[k] + " ") : "idle" != scope.state[i] && (data = scope.state[i] + " ", "die" != scope.position[k] ? ("crouch" != scope.position[k] ? (data += scope.direction[j] + " ", data += scope.position[k] + " ") : data += scope.position[k] + " ", data += scope.weapon[l] + " ", "" != scope.weapon[l] && (data += scope.action[m])) : data += scope.position[k] + " ");

                            count++;

                            if (data != old) {

                                var check = (act.indexOf(data) > -1);

                                if (!check) {

                                    act.push(data);
                                    console.log(scope.state[i] + '_' + count + ' - ' + data);
                                }
                            }

                            old = data;
                        }
                    }
                }
            }
        }
    }
}