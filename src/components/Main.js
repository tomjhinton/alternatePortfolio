//pic size 687*687
import React from 'react'
import {Link} from 'react-router-dom'

let text = 'The sky above the port was the colour of a television tuned to a dead channel.'

class Main extends React.Component{
  constructor(){
    super()
    this.state = {
      data: {},
      error: ''

    }
    this.componentDidMount = this.componentDidMount.bind(this)



  }


  componentDidMount(){

    this.drawPoints()

  }

  componentDidUpdate(prevProps){



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
        <div className='head'>
        </div>



        <div className='block1'>
          <p className='name'>About Me</p>
          <div className='box'>

            Web Developer
          </div>

        </div>

        <div className='block2'>
          <p className='name'>Contact</p>
          <div className='triangle'>

            Web Developer
          </div>

        </div>


        <hr className='hr'/>


        <div className='block3'>
          <p className='name'>Cat Detector</p>
          <div className='box'>

            <img src="assets/cat.png" />


            <p className="desc">How often have you felt like your life lacks real time webcam based Cat detection? Problem solved.  Uses the tensorflow image detection and classification model coco-ssd and a users webcam to detect the presence of cats. </p>
          </div>

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

        <div className='block9'>
          <p className='name'>Increnfinity</p>
          <div className='box'>
            <img src="assets/Increnfinity.png" />
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

        <div className='block11'>
          <p className='name'>Bounce</p>
          <div className='box'>
            <img src="assets/bounce.png" />
            hiya
          </div>
        </div>
      </div>



    )
  }
}
export default Main
