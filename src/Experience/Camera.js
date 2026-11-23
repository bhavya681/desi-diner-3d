import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.config = this.experience.config
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        this.anchors = this.createAnchors()
        this.current = 'overview'
        this.transitioning = false

        this.setInstance()
        this.setControls()
        this.setTransitions()

        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('camera')
            this.debugFolder.add(this.instance.position, 'x').min(-60).max(60).step(0.1)
            this.debugFolder.add(this.instance.position, 'y').min(-10).max(40).step(0.1)
            this.debugFolder.add(this.instance.position, 'z').min(-60).max(60).step(0.1)
        }
    }

    createAnchors()
    {
        const anchors = {
            overview: { position: [31, 18, 35], target: [0, 3, 3] },
            entrance: { position: [0, 7.4, 15.5], target: [0, 5, 3] },
            dining: { position: [7, 5.6, 8], target: [6.5, 2.1, -6] },
            kitchen: { position: [-8.4, 5.2, 6.2], target: [-7, 2.2, -3.4] },
            kadhai: { position: [-7, 3.6, 3], target: [-7, 1.7, -1.7] },
            tandoor: { position: [-10.4, 3.6, 7.8], target: [-10.4, 1.8, 3.5] },
            chai: { position: [9.2, 3.7, 7.8], target: [9.2, 1.8, 3.4] },
            display: { position: [0, 3.4, 8], target: [0, 1.5, 4.2] },
            outdoor: { position: [-1, 6, 17], target: [0, 1.2, 9] },
            trucks: { position: [-17, 6, 35], target: [-10, 2.5, 24] },
            highway: { position: [36, 9, 32], target: [0, 2.5, 17.5] },
            prep: { position: [11.4, 4.4, -3], target: [11.4, 1.8, -8.6] },
            storage: { position: [-12.6, 4.4, -4.6], target: [-12.6, 2, -10.2] },
            menu: { position: [-5.6, 4.4, 5.2], target: [-5.6, 3.2, 2.1] },
            cash: { position: [13.6, 3.8, 7.2], target: [13.4, 1.8, 3.2] },
            spice: { position: [-7.5, 4.6, -8], target: [-7.5, 2.9, -12.8] }
        }

        if(this.config.vertical)
        {
            for(const name in anchors)
            {
                const distanceMultiplier = name === 'overview' || name === 'highway' || name === 'trucks' || name === 'outdoor' ? 1.42 : 1.24
                anchors[name].position[2] *= distanceMultiplier
                anchors[name].position[1] += 0.9
            }
        }

        return anchors
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(56, this.sizes.width / this.sizes.height, 0.1, 600)
        this.instance.position.set(...this.anchors.overview.position)
        this.scene.add(this.instance)
    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.075
        this.controls.enablePan = false
        this.controls.rotateSpeed = 0.5
        this.controls.zoomSpeed = 0.7
        this.controls.target.set(...this.anchors.overview.target)
        this.setCameraLimits('overview')
    }

    setCameraLimits(name)
    {
        if(name === 'overview' || name === 'highway' || name === 'trucks' || name === 'outdoor')
        {
            this.controls.minDistance = this.config.vertical ? 28 : 18
            this.controls.maxDistance = this.config.vertical ? 90 : 75
            this.controls.minAzimuthAngle = -0.72
            this.controls.maxAzimuthAngle = 0.72
            this.controls.minPolarAngle = 0.62
            this.controls.maxPolarAngle = 1.34
            this.controls.enableRotate = true
            this.controls.enableZoom = true
        }
        else
        {
            this.controls.minDistance = 2.2
            this.controls.maxDistance = 16
            this.controls.minAzimuthAngle = -Math.PI
            this.controls.maxAzimuthAngle = Math.PI
            this.controls.minPolarAngle = 0.48
            this.controls.maxPolarAngle = Math.PI * 0.62
            this.controls.enableRotate = true
            this.controls.enableZoom = true
        }

        if(this.reducedMotion)
        {
            this.controls.enableRotate = false
        }
    }

    setTransitions()
    {
        this.transitions = {}

        this.transitions.goTo = async (name, duration = 1.6) =>
        {
            const anchor = this.anchors[name] || this.anchors.overview
            const actualDuration = this.reducedMotion ? 0.14 : duration

            this.current = name
            this.transitioning = true
            this.controls.enabled = false

            const fromPosition = this.instance.position.clone()
            const toPosition = new THREE.Vector3(...anchor.position)
            const arc = Math.min(4, fromPosition.distanceTo(toPosition) * 0.07)

            gsap.killTweensOf(this.instance.position)
            gsap.killTweensOf(this.controls.target)
            gsap.killTweensOf(this.instance)

            gsap.to(this.instance.position, {
                duration: actualDuration,
                ease: 'power3.inOut',
                x: toPosition.x,
                y: toPosition.y + arc,
                z: toPosition.z,
                onComplete: () =>
                {
                    gsap.to(this.instance.position, { duration: actualDuration * 0.32, y: toPosition.y, ease: 'sine.out' })
                }
            })

            const target = new THREE.Vector3(...anchor.target)
            gsap.to(this.controls.target, {
                duration: actualDuration,
                ease: 'power3.inOut',
                x: target.x,
                y: target.y,
                z: target.z
            })

            const fov = name === 'overview' || name === 'highway' ? 56 : 50
            gsap.to(this.instance, { duration: actualDuration, fov, onUpdate: () => this.instance.updateProjectionMatrix() })

            await this.sleep(actualDuration * 1000 + 40)
            this.controls.enabled = true
            this.transitioning = false
            this.setCameraLimits(name)
        }

        this.transitions.focus = async (object, duration = 1.1, distance = 3.2) =>
        {
            if(!object)
            {
                return
            }
            const position = object.getWorldPosition(new THREE.Vector3())
            const direction = this.instance.position.clone().sub(this.controls.target).normalize()
            const cameraPosition = position.clone().add(direction.multiplyScalar(distance))
            cameraPosition.y = Math.max(cameraPosition.y, position.y + 1.2)

            this.transitioning = true
            this.controls.enabled = false
            gsap.to(this.instance.position, { duration, ease: 'power2.inOut', x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z })
            gsap.to(this.controls.target, { duration, ease: 'power2.inOut', x: position.x, y: position.y, z: position.z })
            await this.sleep(duration * 1000 + 30)
            this.controls.enabled = true
            this.transitioning = false
        }

        for(const name in this.anchors)
        {
            this.transitions[name] = async (duration = 1.6) => this.transitions.goTo(name, duration)
        }
    }

    sleep(ms)
    {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        this.controls.update()
    }
}
