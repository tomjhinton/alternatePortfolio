//pic size 687*687
import StickyFooter from 'react-sticky-footer';

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
      error: '',
      height: 9000,
      width: 800
    }
    this.componentDidMount = this.componentDidMount.bind(this)
    this.tick = this.tick.bind(this);
    this.drawPoints = this.drawPoints.bind(this);




  }


  componentDidMount(){
    this.tick()
    console.log(window.document.body.offsetHeight)
    console.log(window.document.body.offsetWidth)
    this.setState({ height: window.document.body.offsetHeight-(document.documentElement.clientHeight/2) })
    this.setState({ width: window.document.body.offsetWidth-20 })
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
    let height  = this.state.height
    let width = this.state.width
    const canvas = document.getElementById('points')
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const  FPS = 60

    document.addEventListener('mousemove', function(evt) {


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
      y: 5000,
      vx: 0.6,
      vy: 0.6
    }


    let points =  []
    points = []
    for (var i = 0; i < 800; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.7,
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
            if(distance(pointA, pointB) < 455) {

              ctx.lineTo(pointB.x,pointB.y)
            }
          }
        }

        // if(distance(mouse2, pointA) < 450){
        //
        //   ctx.lineTo(mouse2.x, mouse2.y)
        //
        //
        //
        //   for (var k = 0, v = points.length; k < v; k++) {
        //     var pointC = points[k]
        //     if(distance(pointA, pointC) < 455) {
        //
        //       ctx.lineTo(pointC.x,pointC.y)
        //
        //     }
        //   }
        // }
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

        if (s.x < 0 || s.x > width) s.vx = -s.vx
        if (s.y < 0 || s.y > height) s.vy = -s.vy
      }
    }
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1
      ctx.fillStyle = 'rgba(0,0,0,0)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      // mouse.x+=mouse.vx
      // mouse.y+= mouse.vy
      if (mouse.x < 0 || mouse.x > canvas.width) mouse.vx = -mouse.vx
      if (mouse.y < 0 || mouse.y > canvas.height) mouse.vy = -mouse.vy

      // mouse2.x+=mouse2.vx
      // mouse2.y+= mouse2.vy
      // if (mouse2.x < 0 || mouse2.x > canvas.width) mouse2.vx = -mouse2.vx
      // if (mouse2.y < 0 || mouse2.y > canvas.height) mouse2.vy = -mouse2.vy

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

      <div className='main '>


        <canvas id="points" width={window.document.body.offsetWidth} height={10950}>  </canvas>


        <div className='nav navbar is-fixed-bottom'>
        <a href='#about'>About Me</a> <a href='#contact'>Contact</a>
        <a href='#ml'>ML Controlled</a>  <a href='#games'>Games</a> <a  href='#fullS'>Full Stack Sites</a> <a href='#other'>Other</a>
        </div>

        <div className='block21'>
          <p className='name'  id='about'>About Me</p>
          <div className='circle  about'>

            Creative Coder and full-stack developer. Fond of generative processes, loose gamification and making things go bleep unnecessarily.
          </div>

        </div>

        <div className='block20'>
          <p className='name' id='contact'>Contact</p>
          <div className='triangle'>
            <p>
            Available for work, chats, collaborations etc, across the usual sites...
            </p>
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



        <div>
          <h2 className='section' id='ml'>ML Controlled</h2>
        </div>


        <div className='block19'>
          <p className='name'>Cat Detector</p>
          <div className='circle'>

            <img src="assets/cat.png" />


            <p className="desc">How often have you felt like your life lacks real time webcam based Cat detection? Problem solved.  Uses the tensorflow image detection and classification model coco-ssd and a users webcam to detect the presence of cats. </p>
            <div className='links'>
            <a href="https://github.com/tomjhinton/catDetector" target="_blank">
            <IconGithub className="github"  width={'1.2em'} height={'1.2em'} />  </a>
            <a href="https://tomjhinton.github.io/catDetector/" target="_blank">
            <FontAwesomeIcon icon="link" width={'1.2em'}/></a>
            </div>
          </div>

        </div>



        <div className='block18'>
          <p className='name'>speakAndSpells</p>
          <div className='triangle'>
            <img src="assets/speak.png" />
            <p className="desc">Navigate a block through a gap in an advancing wall by using your voice. The games simplistic but was mainly an excuse to make use of the speechCommands TensorFlow model. It works reasonably well though the failings do add a level of frustration that is quite amusing. You will find yourself angrily shouting at the screen at points. </p>
            <div className='links'>
                <a href="https://github.com/tomjhinton/speakAndSpells" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
                <a href="https://tomjhinton.github.io/speakAndSpells/" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>
        </div>

        <div className='block17'>
          <p className='name'>alephBounce</p>
          <div className='circle'>
            <img src="assets/aleph.png" />
            <p className="desc">I made it look like that on purpose. alephBounce is a motion controlled 3D game with a Tone.js soundtrack. It uses Posenet a ML trained real-time pose estimation model to track a players movements, by moving their arms they can move a block on the screen. They have to dodge an increasing number of bouncing balls. The animation and rendering are Three.js and the physics simulations are done by Cannon.js.</p>
            <div className='links'>
                <a href="https://github.com/tomjhinton/alephBounce" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
                <a href="https://tomjhinton.github.io/alephBounce/" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>
        </div>



        <div className='block16'>
          <p className='name'>EBM</p>
          <div className='triangle'>
            <img src="assets/ebm.png" />
              <p className="desc">A movement controlled instrument using Posenet to track a users arm positions and Tone.js to trigger drum samples and synth sounds. </p>
            <div className='links'>
              <a href="https://github.com/tomjhinton/ebm" target="_blank">
            <IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
              <a href="https://tomjhinton.github.io/ebm/" target="_blank"><FontAwesomeIcon icon="link"/></a>
              </div>
          </div>
        </div>

        <div className='block15'>
          <p className='name'>emokinesis</p>
          <div className='circle'>
            <img src="assets/emo.png" />
            <p className="desc"> A Cannon.js physics based instrument that uses face.api to detect facial expressions to manipulate a Three.js scene that has spheres that trigger drum samples on their impact  with the  ground. </p>
            <div className='links'>
              <a href="https://github.com/tomjhinton/emokinesis" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
              <a href="https://tomjhinton.github.io/emokinesis/" target="_blank"><FontAwesomeIcon icon="link"/></a>
              </div>
          </div>
        </div>

        <div className='block14'>
          <p className='name'>niceGuys</p>
          <div className='triangle'>
            <img src="assets/nice.png" />
            <p className="desc"> An experimental game that uses a tensorflow Text Toxicity classifier as {"it's"} means of control. Scene rendered with Three.js and  uses Cannon.js for the physics. </p>
            <div className='links'>
              <a href="https://github.com/tomjhinton/niceGuys" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
              <a href="https://tomjhinton.github.io/niceGuys/" target="_blank"><FontAwesomeIcon icon="link"/></a>
              </div>
          </div>
        </div>

        <div className='block13'>
          <p className='name'>MagToei</p>
          <div className='circle'>
            <img src="assets/mag.png" />
            <p className="desc">Recursive generative music using Magenta and the Tensorflow model drum_kit_rnn, it is initially using the first 14 notes of Twinkle Twinkle Little Star as an input but then feeds its own generation back into itself to create further patterns.</p>
            <div className='links'>
                <a href="https://github.com/tomjhinton/magToei" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
                <a href="https://tomjhinton.github.io/magToei/" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>
        </div>



        <div>
          <h2 className='section' id='games'>Games</h2>
        </div>

        <div className='block12'>
          <p className='name'>cyberBlobOfTheRings</p>
          <div className='triangle'>
            <img src="assets/cyberblob.png" />
            <p className="desc">A 3D game built using Three.js.The game itself is simplistic, you have to navigate a blob through a series of rings using the mouse. Contains a basic generative soundtrack created with Tone.js</p>
            <div className='links'>
                <a href="https://github.com/tomjhinton/cyberbloboftherings" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
                <a href="https://tomjhinton.github.io/cyberbloboftherings/" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>

        </div>

        <div className='block11'>
          <p className='name'>Freeside</p>
          <div className='circle'>
            <img src="assets/freeside.png" />
            <p className="desc">A 3D game built using Three.js and Cannon.js. Soundtrack is generated using Magenta and the Tensorflow model drum_kit_rnn. Mainly an experiment in utilising the Cannon.js physics engine. Essentially I guess a platform game as the player has to bounce a path along a series of moving platforms. </p>
            <div className='links'>
                <a href="https://github.com/tomjhinton/freeside" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
                <a href="https://tomjhinton.github.io/freeside/" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>

        </div>

        <div className='block10'>
          <p className='name'>pastelDOA</p>
          <div className='triangle'>
            <img src="assets/pastel.png" />
            <p className="desc">A canvas and React based game where the player has to keep inside a rotating rectangle. Direction controls refer to the original orientation of the rectangle so the player has to keep track of which way is up! Can also be controlled by touch on mobile devices.</p>
            <div className='links'>
                <a href="https://github.com/tomjhinton/pastelDOA" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
                <a href="https://tomjhinton.github.io/pastelDOA/" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>

        </div>

        <div className='block9'>
          <p className='name'>aleatoricBounce</p>
          <div className='circle'>
            <img src="assets/bounce.png" />
            <p className="desc"> Loosely gamified aleatoric computer music. There is a white square and some balls bouncing around. You control a rectangle, if you get it in the square you gain some lives, if a ball gets in the square, you lose a life and an extra ball is added. As the balls bounce they trigger Tone.js synthesised sounds. Part game, part composition, part web-site. </p>
            <div className='links'>
              <a href="https://github.com/tomjhinton/aleatoricBounce" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
              <a href="https://tomjhinton.github.io/aleatoricBounce/" target="_blank"><FontAwesomeIcon icon="link"/></a>
              </div>
          </div>
        </div>

        <div className='block8'>
          <p className='name'>Increnfinity</p>
          <div className='triangle'>
            <img src="assets/Increnfinity.png" />
            <p className="desc">A plotless infinite incremental game. The player picks the names of the resources to collect and the thing that produces them and then those resources increase by rates influenced by desicions made by the player. Inspired by Kittens Game and Universal Paperclips, styling has been kept to a bare minimum. Depending on your tastes these games are either highly addictive or unfathomably boring. </p>
            <div className='links'>
                <a href="https://github.com/tomjhinton/increnfinity" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>
                <a href="https://tomjhinton.github.io/increnfinity/" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>
        </div>

        <div className='block7'>
          <p className='name'>Tetris</p>
          <div className='circle'>
            <img src="assets/tetris.png" />
            <p className="desc"> A solo project built over a one week timeframe, the brief for this project was to build a game from a set-list utilising HTML, CSS and JavaScript.</p>

                  <div className="links">
                    <a href="https://github.com/tomjhinton/SEI-Project01" target="_blank"><IconGithub className="github"  width={'1em'} height={'1em'} /> </a>

                    <a href="https://tomjhinton.github.io/SEI-Project01/" target="_blank"><FontAwesomeIcon icon="link"/></a>
                  </div>
          </div>
        </div>

        <div>
          <h2 className='section' id='fullS'>Full Stack Sites</h2>
        </div>

        <div className='block6'>
          <p className='name'>Neurot467</p>
          <div className='triangle'>
            <img src="assets/neurot.png" />
            <p className="desc">Generative art piece with python backend and a React front-end. Image creation is  done server-side using Pillow and the resuslts are saved to a SQL server in base64.  New images are created hourly and the site resets twice a day.
                </p>
                <div className='links'>
                <a href="https://github.com/tomjhinton/fold" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>

                <a href="https://neurot467.herokuapp.com" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>
        </div>

        <div className='block5'>
          <p className='name'>EventUp</p>
          <div className='circle'>
            <img src="assets/EventUp.png" />
            <p className="desc">EventUp was a site that allowed promoters to upload details about their upcoming events. It also used Songkick’s API to provide information about events that had not been added by our users about the venues that the events would be held at. With this information we were able to use Mapcircle to provide a map showing the location of the event on its page. I worked mainly on the form to allow people to add events to our database and on integrating the map.
                </p>
                <div className='links'>
                <a href="https://github.com/tomjhinton/SEI-project03-fork" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>

                <a href="https://gaeventup.herokuapp.com" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>
        </div>

        <div className='block4'>
          <p className='name'>Epiphyte</p>
          <div className='triangle'>
            <img src="assets/epiphyte.png" />
            <p className="desc">A crytocurrency investment simulator. Each user is give $100 to invest which they can spend across 20 digital assets. Front-end created with React and the back-end uses  a Python SQL database.
                </p>
                <div className='links'>
                <a href="https://github.com/tomjhinton/epiphyte" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>

                <a href="https://epiphyte2.herokuapp.com" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>
        </div>

        <h2 className='section' id='other'>Other</h2>

        <div className='block3'>
          <p className='name'>Twitter Bots</p>
          <div className='circle'>
            <img src="assets/twit.png" />
            <a href="https://twitter.com/bktbot1" target="_blank"><FontAwesomeIcon icon={['fab', 'twitter']} />  btkbot </a> Tweets generated by a neural net trained  on Boomkat write-ups.
            <br/>
            <a href="https://twitter.com/newspuppet1" target="_blank"><FontAwesomeIcon icon={['fab', 'twitter']} />  newspuppet </a> Tweets the front pages of a selection of news websites throughout the day.
            <br/>
            <a href="https://twitter.com/neurot465" target="_blank"><FontAwesomeIcon icon={['fab', 'twitter']} />  neurot465 </a>  Tweets generative artworks created with Node Canvas.
            <br/>
            <a href="https://twitter.com/neurot466" target="_blank"><FontAwesomeIcon icon={['fab', 'twitter']} />  neurot466 </a> Tweets generative artworks created with Python.
          </div>
        </div>

        <div className='block2'>
          <p className='name'>movieBase</p>
          <div className='triangle'>
            <img src="assets/movieBase.png" />
            <p className="desc"> .movieBase() was a site that allowed users to search for films and receive information about the film, an embedded video of its trailer and recommendations of similar films that they might also like. We used OMDB’s API to get initial information about a film that a user searched for and then fed that information into themoviedb’s API to find the URL of the film’s trailer and a selection of similar films. A user could then click on any of the similar films to receive the same information for that title. Within the project we pair coded on a single laptop so all aspects of the project were handled as part of a team.</p>
            <div className='links'>
                <a href="https://github.com/tomjhinton/SEI-Project02" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>

                <a href="https://tomjhinton.github.io/SEI-Project02/" target="_blank"><FontAwesomeIcon icon="link"/></a>
                </div>
          </div>
        </div>

        <div className='block1'>
          <p className='name'>Interactive Canvas Headers</p>
          <div className='circle'>
            <img src="assets/canvas.png" />
            <p className="desc"> Experiments with canvas animations that are interactive when hovered over.</p>

                <div className="links">
                  <a href="https://github.com/tomjhinton/reactCanvasInter" target="_blank"><IconGithub className="github"  width={'1.2em'} height={'1.2em'} /> </a>

                  <a href="https://tomjhinton.github.io/reactCanvasInter/#/" target="_blank"><FontAwesomeIcon icon="link"/></a>
          </div>
        </div>
        </div>

      </div>



    )

  }
}
export default Main
