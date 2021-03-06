# Haze engine
Let's create a video game

#### GAME ENGINE FOR THREE.JS ####

Project coming soon.

[Demo](http://threejs.org/examples/)

[Documentation](http://threejs.org/docs/)

### USAGE ###

Download the [minified library](http://threejs.org/build/three.min.js) and include it in your html.
Alternatively see [how to build the library yourself](https://github.com/mrdoob/three.js/wiki/Build-instructions).

```html
<script src="js/three.min.js"></script>
<script src="js/haze.min.js"></script>
```
```javascript
<script>

  var character = new HAZE.Character('../myCharacter.bvh');
  scene.add(character);
  
  var skin = THREE.SkinnedMesh( geometry, material );
  character.applySkin(skin,true);
  character.assignSkeleton(skin.skeleton);
  
  var animator = new HAZE.Animator(character);
  var walk_action = new HAZE.Action('../myAnimation.bvh');
  animator.addAction(walk_action)
  
  walk_action.play();
  
</script>
```


[![Latest NPM release][npm-badge]][npm-badge-url]
[![License][license-badge]][license-badge-url]

### Change log ###

[releases](https://github.com/mrdoob/three.js/releases)




[npm-badge]: https://img.shields.io/npm/v/three.svg
[npm-badge-url]: https://www.npmjs.com/package/three
[license-badge]: https://img.shields.io/npm/l/three.svg
[license-badge-url]: ./LICENSE
[dependencies-badge]: https://img.shields.io/david/mrdoob/three.js.svg
[dependencies-badge-url]: https://david-dm.org/mrdoob/three.js
[devDependencies-badge]: https://img.shields.io/david/dev/mrdoob/three.js.svg
[devDependencies-badge-url]: https://david-dm.org/mrdoob/three.js#info=devDependencies
