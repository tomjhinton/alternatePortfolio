//pic size 687*687
import React from 'react'
import {Link} from 'react-router-dom'

let text = 'The sky above the port was the colour of a television tuned to a dead channel.'
import 'react-devicon'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheckSquare, faCoffee, faAt, faLink } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

library.add(fab, faCheckSquare, faCoffee, faAt, faLink)

import * as THREE from 'three'
import { EffectComposer, RenderPass ,Effect, EffectPass} from 'postprocessing'
import IconGithub from 'react-devicon/github/original'


const fragment = `

uniform sampler2D uTexture;
#define PI 3.14159265359

void mainUv(inout vec2 uv) {
        vec4 tex = texture2D(uTexture, uv);
        float angle = -((tex.r) * (PI * 2.) - PI) ;
        float vx = -(tex.r *2. - 1.);
        float vy = -(tex.g *2. - 1.);
        float intensity = tex.b;
        uv.x += vx * 0.2 * intensity ;
        uv.y += vy * 0.2  *intensity;
        // uv.xy *= 1. - 0.5 * smoothstep( 0., 1., intensity) ;
        // uv.x +=  0.2 * intensity;
        // uv.y +=  0.2  *intensity;
    }


`;
const easeOutSine = (t, b, c, d) => {
  return c * Math.sin((t / d) * (Math.PI / 2)) + b;
};

const easeOutQuad = (t, b, c, d) => {
  t /= d;
  return -c * t * (t - 2) + b;
};
export class WaterTexture{
  constructor(options) {
    this.last = null;
    this.size = 64;
      this.radius = this.size * 0.1;
      this.points = [];
        this.maxAge = 64;
     this.width = this.height = this.size;
    if (options.debug) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.radius = this.width * 0.05;
    }

    this.initTexture();
      if(options.debug) document.body.append(this.canvas);
  }
    // Initialize our canvas
  initTexture() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "WaterTexture";
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    this.clear();
    this.texture = new THREE.Texture(this.canvas);

  }
  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  update(){
    this.clear();
     let agePart = 1. / this.maxAge;
        this.points.forEach(point => {
          let slowAsOlder = (1.- point.age / this.maxAge)
         let force = point.force * agePart * slowAsOlder;
           point.x += point.vx * force;
           point.y += point.vy * force;
         point.age += 1;
            if(point.age > this.maxAge){
                this.points.splice(this.points.indexOf(point), 1);
            }
        })
        this.points.forEach(point => {
            this.drawPoint(point);
        })
        this.texture.needsUpdate = true;

  }
  addPoint(point){
    let force = 0;
         let vx = 0;
         let vy = 0;
         const last = this.last;
         if(last){
             const relativeX = point.x - last.x;
             const relativeY = point.y - last.y;
             // Distance formula
             const distanceSquared = relativeX * relativeX + relativeY * relativeY;
             const distance = Math.sqrt(distanceSquared);
             // Calculate Unit Vector
             vx = relativeX / distance;
             vy = relativeY / distance;

             force = Math.min(distanceSquared * 10000,1.);
         }

         this.last = {
             x: point.x,
             y: point.y
         }
         this.points.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
   }
   drawPoint(point) {
        // Convert normalized position into canvas coordinates
        let pos = {
            x: point.x * this.width,
            y: point.y * this.height
        }
        const radius = this.radius;


        const ctx = this.ctx;
          // Lower the opacity as it gets older
          let intensity = 1.;
          if (point.age < this.maxAge * 0.3) {
          intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1);
        } else {
          intensity = easeOutQuad(
            1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
            0,
            1,
            1
          );
        }
        intensity *= point.force;

        let red = ((point.vx + 1) / 2) * 255;
      let green = ((point.vy + 1) / 2) * 255;
      // B = Unit vector
      let blue = intensity * 255;
      let color = `${red}, ${green}, ${blue}`;


      let offset = this.size * 50;
      ctx.shadowOffsetX = offset;
      ctx.shadowOffsetY = offset;
      ctx.shadowBlur = radius * 1;
      ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;

      this.ctx.beginPath();
      this.ctx.fillStyle = "rgba(0,0,0,1)";
      this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
}
let waterTexture = new WaterTexture({ debug: false })
let renderer = new THREE.WebGLRenderer({
         antialias: false
       });
       renderer.setSize(window.innerWidth, window.innerHeight);
       renderer.setPixelRatio(window.devicePixelRatio);
       document.body.prepend(renderer.domElement);
       const scene = new THREE.Scene()

       let camera = new THREE.PerspectiveCamera(
         45,
         window.innerWidth / window.innerHeight,
         0.1,
         10000
       );
       camera.position.z = 70;
       const light = new THREE.DirectionalLight( 0xffffff )
light.position.set( 0, 0, 60 )
light.castShadow = true
scene.add(light)
scene.background = new THREE.Color( 0xFFFFFF )
       let composer = new EffectComposer(renderer);
          let  clock = new THREE.Clock();
          let geometry = new THREE.BoxBufferGeometry(40,20,20,1);
          var texture = new THREE.TextureLoader().load( "assets/tom.png" );
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;

          let material = new THREE.MeshStandardMaterial({
    map: texture,
  });
          let mesh = new THREE.Mesh(geometry, material);


          scene.add(mesh);

          const renderPass = new RenderPass(scene, camera);
          renderPass.renderToScreen = true;



      let waterEffect = new Effect("WaterEffect", fragment, {
        uniforms: new Map([["uTexture", new THREE.Uniform(waterTexture.texture)]])
      }  );
    const waterPass = new EffectPass(camera, waterEffect);
    console.log(waterEffect)

    renderPass.renderToScreen = false;
    waterPass.renderToScreen = true;
  composer.addPass(renderPass);
  composer.addPass(waterPass);

        composer.addPass(renderPass)
        console.log(composer)
function render(){
      mesh.rotation.x+=0.01
        mesh.rotation.y+=0.001
      composer.render(clock.getDelta())
    }


class Main extends React.Component{
  constructor(){
    super()
    this.state = {
      data: {},
      error: ''

    }
    this.componentDidMount = this.componentDidMount.bind(this)
    this.tick = this.tick.bind(this);




  }


  componentDidMount(){
    this.tick()


    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.drawPoints()

  }

  componentDidUpdate(prevProps){



  }

  tick(){
          waterTexture.update()
          requestAnimationFrame(this.tick);
          render()
      }

      onMouseMove(ev){
              const point = {
      			x: ev.clientX/ window.innerWidth,
      			y: ev.clientY/ window.innerHeight,
              }
              waterTexture.addPoint(point);
      	}




  drawPoints(){
    const canvas = document.getElementById('points')
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const  FPS = 60

    canvas.addEventListener('mousemove', function(evt) {


      mouse.x = evt.offsetX,
      mouse.y = evt.offsetY

    }, false)

    canvas.addEventListener('mouseleave', function() {

      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }, false)

    canvas.addEventListener('mouseenter', function() {

    }, false)



    const  mouse = {
      x: 0,
      y: 0,
      vx: 0.3,
      vy: 0.3
    }

    const  mouse2 = {
      x: 400,
      y: 400,
      vx: 0.6,
      vy: 0.6
    }


    let points =  []
    points = []
    for (var i = 0; i < 200; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1 + 1,
        vx: Math.floor(Math.random() * 50) - 25,
        vy: Math.floor(Math.random() * 50) - 25
      })
    }

    function drawPointsDots(){


      points.map(x=> {

        ctx.fillStyle = 'rgba(74,246,38,0.9)'
        ctx.beginPath()
        ctx.arc(x.x, x.y, x.radius, 0, 5 * Math.PI)
        ctx.fill()
        ctx.fillStyle = 'black'
        ctx.stroke()
      })



    }
    function drawPaths(){
      ctx.beginPath()
      for (var i = 0, x = points.length; i < x; i++) {

        var pointA = points[i]
        ctx.moveTo(pointA.x,pointA.y)

        if(distance(mouse, pointA) < 150){

          ctx.lineTo(mouse.x, mouse.y)



          for (var j = 0, y = points.length; j < y; j++) {
            var pointB = points[j]
            if(distance(pointA, pointB) < 255) {

              ctx.lineTo(pointB.x,pointB.y)
            }
          }
        }

        if(distance(mouse2, pointA) < 250){

          ctx.lineTo(mouse2.x, mouse2.y)



          for (var k = 0, v = points.length; k < v; k++) {
            var pointC = points[k]
            if(distance(pointA, pointC) < 255) {

              ctx.lineTo(pointC.x,pointC.y)

            }
          }
        }
      }
      ctx.lineWidth = 0.55
      ctx.strokeStyle = 'rgba(74,246,38,0.9)'
      ctx.stroke()
    }


    function distance( point1, point2 ){
      var xs = 0
      var ys = 0

      xs = point2.x - point1.x
      xs = xs * xs

      ys = point2.y - point1.y
      ys = ys * ys

      return Math.sqrt( xs + ys )
    }

    function update() {
      for (var i = 0, x = points.length; i < x; i++) {
        var s = points[i]

        s.x += s.vx / FPS
        s.y += s.vy / FPS

        if (s.x < 0 || s.x > canvas.width) s.vx = -s.vx
        if (s.y < 0 || s.y > canvas.height) s.vy = -s.vy
      }
    }
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(0,0,0,0)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      mouse.x+=mouse.vx
      mouse.y+= mouse.vy
      if (mouse.x < 0 || mouse.x > canvas.width) mouse.vx = -mouse.vx
      if (mouse.y < 0 || mouse.y > canvas.height) mouse.vy = -mouse.vy

      mouse2.x+=mouse2.vx
      mouse2.y+= mouse2.vy
      if (mouse2.x < 0 || mouse2.x > canvas.width) mouse2.vx = -mouse2.vx
      if (mouse2.y < 0 || mouse2.y > canvas.height) mouse2.vy = -mouse2.vy

      update()
      drawPointsDots()
      drawPaths()
      requestAnimationFrame(tick)
    }

    tick()

  }


  render() {

    console.log(this.state)

    return (
      <div className='main'>
        <canvas id="points" width={900} height={1960}>  </canvas>




        <div className='block1'>
          <p className='name'>About Me</p>
          <div className='box'>

            Web Developer
          </div>

        </div>

        <div className='block2'>
          <p className='name'>Contact</p>
          <div className='triangle'>

          <a href="https://www.linkedin.com/in/tom-hinton/" target="_blank"><FontAwesomeIcon icon={['fab', 'linkedin']} /> tom-hinton </a>
          <br/>

          <a href="https://twitter.com/tomjhinton" target="_blank"><FontAwesomeIcon icon={['fab', 'twitter']} />  tomjhinton </a>
          <br/>

          <a href="https://github.com/tomjhinton" target="_blank"><FontAwesomeIcon icon={['fab', 'github']} />  tomjhinton </a>
          <br/>


          <a href="https://www.instagram.com/svg.png/ " target="_blank"><FontAwesomeIcon icon={['fab', 'instagram']} />  SVG.PNG</a>
          <br/>

          <a href="https://www.instagram.com/above_the_port/ " target="_blank"><FontAwesomeIcon icon={['fab', 'instagram']} />  above_the_port</a>
          <br/>



          <a href="mailto:tomjhinton@gmail.com"> <FontAwesomeIcon icon="at"/> </a> tomjhinton@gmail.com
          </div>

        </div>

        <div className='nav'>
        ML Controlled Games Full Stack Sites Other
        </div>

        <div>
          <h2 className='section'>ML Controlled</h2>
        </div>


        <div className='block3'>
          <p className='name'>Cat Detector</p>
          <div className='box'>

            <img src="assets/cat.png" />


            <p className="desc">How often have you felt like your life lacks real time webcam based Cat detection? Problem solved.  Uses the tensorflow image detection and classification model coco-ssd and a users webcam to detect the presence of cats. </p>
            <a href="https://github.com/tomjhinton/catDetector" target="_blank"><IconGithub className="github"  width={'1em'} height={'1em'} /> </a>
                <a href="https://tomjhinton.github.io/catDetector/" target="_blank"><FontAwesomeIcon icon="link"/></a>
          </div>

        </div>



        <div className='block7'>
          <p className='name'>speakAndSpells</p>
          <div className='box'>
            <img src="assets/speak.png" />
            hiya
          </div>
        </div>

        <div className='block8'>
          <p className='name'>aleph</p>
          <div className='triangle'>
            <img src="assets/aleph.png" />
            hiya
          </div>
        </div>



        <div className='block10'>
          <p className='name'>EBM</p>
          <div className='triangle'>
            <img src="assets/ebm.png" />
            hiya
          </div>
        </div>

        <div className='block10'>
          <p className='name'>emokinesis</p>
          <div className='triangle'>
            <img src="assets/emo.png" />
            hiya
          </div>
        </div>

        <div className='block10'>
          <p className='name'>nice</p>
          <div className='triangle'>
            <img src="assets/nice.png" />
            hiya
          </div>
        </div>

        <div className='block10'>
          <p className='name'>MagToei</p>
          <div className='triangle'>
            <img src="assets/mag.png" />
            hiya
          </div>
        </div>



        <div>
          <h2 className='section'>Games</h2>
        </div>

        <div className='block4'>
          <p className='name'>cyberBlobOfTheRings</p>
          <div className='triangle'>
            <img src="assets/cyberblob.png" />
            <p className="desc">How often have you felt like your life lacks real time webcam based Cat detection? Problem solved.  Uses the tensorflow image detection and classification model coco-ssd and a users webcam to detect the presence of cats. </p>
          </div>

        </div>

        <div className='block5'>
          <p className='name'>Freeside</p>
          <div className='box'>
            <img src="assets/freeside.png" />
            hiya
          </div>

        </div>

        <div className='block6'>
          <p className='name'>pastelDOA</p>
          <div className='triangle'>
            <img src="assets/pastel.png" />
            hiya
          </div>

        </div>

        <div className='block11'>
          <p className='name'>Bounce</p>
          <div className='box'>
            <img src="assets/bounce.png" />
            hiya
          </div>
        </div>

        <div className='block9'>
          <p className='name'>Increnfinity</p>
          <div className='box'>
            <img src="assets/Increnfinity.png" />
            hiya
          </div>
        </div>

        <div className='block9'>
          <p className='name'>Tetris</p>
          <div className='box'>
            <img src="assets/tetris.png" />
            hiya
          </div>
        </div>

        <div>
          <h2 className='section'>Full Stack Sites</h2>
        </div>

        <div className='block9'>
          <p className='name'>Neurot467</p>
          <div className='box'>
            <img src="assets/neurot.png" />
            hiya
          </div>
        </div>

        <div className='block9'>
          <p className='name'>EventUp</p>
          <div className='box'>
            <img src="assets/EventUp.png" />
            hiya
          </div>
        </div>

        <div className='block9'>
          <p className='name'>Epiphyte</p>
          <div className='box'>
            <img src="assets/epiphyte.png" />
            hiya
          </div>
        </div>

        <h2 className='section'>Other</h2>

        <div className='block9'>
          <p className='name'>Twitter Bots</p>
          <div className='box'>
            <img src="assets/tetris.png" />
            hiya
          </div>
        </div>

        <div className='block9'>
          <p className='name'>movieBase</p>
          <div className='box'>
            <img src="assets/movieBase.png" />
            hiya
          </div>
        </div>

        <div className='block9'>
          <p className='name'>Interactive Canvas Headers</p>
          <div className='box'>
            <img src="assets/canvas.png" />
            hiya
          </div>
        </div>

      </div>



    )
  }
}
export default Main
