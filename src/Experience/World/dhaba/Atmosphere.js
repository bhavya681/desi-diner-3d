import * as THREE from 'three'
import * as Kit from './Kit.js'

const vertexShader = `
    attribute float aOpacity;
    attribute float aSize;
    attribute vec3 aColor;
    varying float vOpacity;
    varying vec3 vColor;
    void main()
    {
        vOpacity = aOpacity;
        vColor = aColor;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (240.0 / max(1.0, -mvPosition.z));
        gl_Position = projectionMatrix * mvPosition;
    }
`

const fragmentShader = `
    uniform sampler2D uMap;
    varying float vOpacity;
    varying vec3 vColor;
    void main()
    {
        vec4 textureColor = texture2D(uMap, gl_PointCoord);
        gl_FragColor = vec4(vColor, textureColor.a * vOpacity);
        if(gl_FragColor.a < 0.01) discard;
    }
`

class ParticleField
{
    constructor(parent, capacity, blending)
    {
        this.capacity = capacity
        this.positions = new Float32Array(capacity * 3)
        this.colors = new Float32Array(capacity * 3)
        this.opacities = new Float32Array(capacity)
        this.sizes = new Float32Array(capacity)
        this.items = new Array(capacity).fill(null)

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
        geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3))
        geometry.setAttribute('aOpacity', new THREE.BufferAttribute(this.opacities, 1))
        geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1))

        const material = new THREE.ShaderMaterial({
            uniforms: { uMap: { value: Kit.glowTexture() } },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending
        })

        this.points = new THREE.Points(geometry, material)
        this.points.frustumCulled = false
        parent.add(this.points)
        this.cursor = 0
    }

    spawn(config)
    {
        let index = -1
        for(let attempt = 0; attempt < this.capacity; attempt++)
        {
            const candidate = (this.cursor + attempt) % this.capacity
            if(!this.items[candidate])
            {
                index = candidate
                break
            }
        }
        if(index === -1)
        {
            return
        }
        this.cursor = (index + 1) % this.capacity
        this.items[index] = {
            age: config.age || 0,
            duration: config.duration || 2,
            origin: config.origin.clone(),
            velocity: config.velocity || new THREE.Vector3(),
            acceleration: config.acceleration || new THREE.Vector3(),
            sway: config.sway || 0,
            phase: config.phase || Math.random() * Math.PI * 2,
            color: new THREE.Color(config.color || '#ffffff'),
            size: config.size || 1,
            growth: config.growth || 0,
            opacity: config.opacity === undefined ? 0.4 : config.opacity
        }
    }

    update(elapsed, delta, qualityScale)
    {
        const limit = Math.max(1, Math.floor(this.capacity * qualityScale))
        for(let i = 0; i < this.capacity; i++)
        {
            const item = this.items[i]
            const offset = i * 3
            if(!item || i >= limit)
            {
                this.opacities[i] = 0
                continue
            }

            item.age += delta * 0.001
            const life = item.age / item.duration
            if(life >= 1)
            {
                this.items[i] = null
                this.opacities[i] = 0
                continue
            }

            const sway = Math.sin(elapsed * 0.0018 + item.phase) * item.sway
            this.positions[offset] = item.origin.x + item.velocity.x * item.age + sway
            this.positions[offset + 1] = item.origin.y + item.velocity.y * item.age + item.acceleration.y * item.age * item.age
            this.positions[offset + 2] = item.origin.z + item.velocity.z * item.age + Math.cos(elapsed * 0.0015 + item.phase) * item.sway * 0.5
            this.colors[offset] = item.color.r
            this.colors[offset + 1] = item.color.g
            this.colors[offset + 2] = item.color.b
            this.sizes[i] = item.size * (1 + life * item.growth)
            this.opacities[i] = Math.sin(life * Math.PI) * item.opacity
        }

        this.points.geometry.attributes.position.needsUpdate = true
        this.points.geometry.attributes.aColor.needsUpdate = true
        this.points.geometry.attributes.aOpacity.needsUpdate = true
        this.points.geometry.attributes.aSize.needsUpdate = true
    }
}

export class Atmosphere
{
    constructor(world)
    {
        this.world = world
        this.sources = []
        this.qualityScale = 1
        this.emitAccumulator = 0
    }

    build()
    {
        this.buildSky()
        this.particles = new ParticleField(this.world.group, 620, THREE.NormalBlending)
        this.sparks = new ParticleField(this.world.group, 180, THREE.AdditiveBlending)

        const tandoorPosition = new THREE.Vector3(-10.4, 2.2, 3.5)
        this.addSmokeSource(tandoorPosition, 3.2, '#8c7a6c', 0.62)
        this.addSteamSource(new THREE.Vector3(-7, 2, -1.7), 1.4, '#fff1d8', 0.3)
        this.addSteamSource(new THREE.Vector3(9.2, 2.2, 3.4), 1.1, '#fff1d8', 0.26)
        this.addSmokeSource(new THREE.Vector3(-7, 4.9, -6.5), 0.7, '#6b6159', 0.22)

        this.world.animated.push((elapsed) =>
        {
            this.world.bulbs.forEach((bulb, index) =>
            {
                if(!bulb.userData.basePosition)
                {
                    bulb.userData.basePosition = bulb.position.clone()
                }
                const base = bulb.userData.basePosition
                bulb.position.x = base.x + Math.sin(elapsed * 0.0008 + index * 0.7) * 0.035
                bulb.position.z = base.z + Math.cos(elapsed * 0.0007 + index) * 0.025
                if(bulb.userData.halo && bulb.userData.on)
                {
                    bulb.userData.halo.material.opacity = 0.44 + Math.sin(elapsed * 0.003 + bulb.userData.phase) * 0.1
                }
            })
        })
    }

    buildSky()
    {
        const texture = Kit.canvasTexture('nightSky', 1024, 512, (context, width, height) =>
        {
            const gradient = context.createLinearGradient(0, 0, 0, height)
            gradient.addColorStop(0, '#040309')
            gradient.addColorStop(0.45, '#0a0712')
            gradient.addColorStop(0.8, '#1b0b12')
            gradient.addColorStop(1, '#2a1010')
            context.fillStyle = gradient
            context.fillRect(0, 0, width, height)
            const random = Kit.seeded(1927)
            for(let i = 0; i < 480; i++)
            {
                const x = random() * width
                const y = random() * height * 0.72
                const radius = random() * 1.2 + 0.2
                context.fillStyle = `rgba(255,238,205,${0.25 + random() * 0.7})`
                context.beginPath()
                context.arc(x, y, radius, 0, Math.PI * 2)
                context.fill()
            }
        })
        const sky = new THREE.Mesh(
            new THREE.SphereGeometry(300, 24, 16),
            new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide, fog: false, depthWrite: false })
        )
        this.world.scene.add(sky)
        this.sky = sky
    }

    addSteamSource(position, rate = 1, color = '#fff1d8', opacity = 0.28)
    {
        this.sources.push({ position: position.clone(), kind: 'steam', rate, color, opacity, accumulator: 0 })
    }

    addSmokeSource(position, rate = 1, color = '#8c7a6c', opacity = 0.34)
    {
        this.sources.push({ position: position.clone(), kind: 'smoke', rate, color, opacity, accumulator: 0 })
    }

    emit(source)
    {
        const isSmoke = source.kind === 'smoke'
        this.particles.spawn({
            origin: source.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3)),
            velocity: new THREE.Vector3((Math.random() - 0.5) * 0.28, isSmoke ? 0.6 + Math.random() * 0.5 : 0.45 + Math.random() * 0.35, (Math.random() - 0.5) * 0.28),
            acceleration: new THREE.Vector3(0, 0.12, 0),
            sway: 0.12 + Math.random() * 0.16,
            color: source.color,
            size: isSmoke ? 26 + Math.random() * 20 : 18 + Math.random() * 14,
            growth: isSmoke ? 2.2 : 1.6,
            duration: isSmoke ? 3.6 + Math.random() * 1.6 : 2.4 + Math.random() * 1.1,
            opacity: source.opacity
        })
    }

    burstSmoke(position, count = 12)
    {
        for(let i = 0; i < count; i++)
        {
            this.particles.spawn({
                origin: position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, Math.random() * 0.4, (Math.random() - 0.5) * 0.8)),
                velocity: new THREE.Vector3((Math.random() - 0.5) * 1.4, 1 + Math.random() * 1.2, (Math.random() - 0.5) * 1.4),
                acceleration: new THREE.Vector3(0, 0.2, 0),
                sway: 0.25,
                color: '#9c8b7c',
                size: 30 + Math.random() * 26,
                growth: 2.4,
                duration: 2.4 + Math.random(),
                opacity: 0.5
            })
        }
    }

    burstSteam(position, count = 10)
    {
        for(let i = 0; i < count; i++)
        {
            this.particles.spawn({
                origin: position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5)),
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.6, 0.8 + Math.random() * 0.7, (Math.random() - 0.5) * 0.6),
                sway: 0.18,
                color: '#fff3de',
                size: 16 + Math.random() * 12,
                growth: 1.8,
                duration: 2 + Math.random(),
                opacity: 0.4
            })
        }
    }

    burstSpice(position, count = 10, color = '#ffb43d')
    {
        for(let i = 0; i < count; i++)
        {
            this.sparks.spawn({
                origin: position.clone(),
                velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 0.4 + Math.random() * 1.2, (Math.random() - 0.5) * 2),
                acceleration: new THREE.Vector3(0, -1.6, 0),
                color,
                size: 7 + Math.random() * 6,
                duration: 0.8 + Math.random() * 0.5,
                opacity: 0.85
            })
        }
    }

    burstWater(position, count = 12)
    {
        for(let i = 0; i < count; i++)
        {
            this.sparks.spawn({
                origin: position.clone(),
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.7, 0.1 + Math.random() * 0.5, 0.6 + Math.random() * 0.7),
                acceleration: new THREE.Vector3(0, -2.8, 0),
                color: '#8fd8ff',
                size: 5 + Math.random() * 5,
                duration: 0.8 + Math.random() * 0.4,
                opacity: 0.7
            })
        }
    }

    setQuality(level)
    {
        this.qualityScale = level === 'high' ? 1 : level === 'medium' ? 0.6 : 0.28
    }

    update(elapsed, delta)
    {
        const scale = this.qualityScale
        this.sources.forEach((source) =>
        {
            source.accumulator += delta * 0.001 * source.rate * scale
            while(source.accumulator > 1)
            {
                this.emit(source)
                source.accumulator -= 1
            }
        })

        if(Math.random() < 0.28 * scale)
        {
            this.particles.spawn({
                origin: new THREE.Vector3(-60 + Math.random() * 120, 0.3 + Math.random() * 3.5, 10 + Math.random() * 20),
                velocity: new THREE.Vector3(0.5 + Math.random() * 1.2, 0.04 + Math.random() * 0.1, (Math.random() - 0.5) * 0.3),
                sway: 0.2,
                color: '#c7965f',
                size: 14 + Math.random() * 10,
                growth: 1.2,
                duration: 5 + Math.random() * 3,
                opacity: 0.09
            })
        }

        this.particles.update(elapsed, delta, scale)
        this.sparks.update(elapsed, delta, scale)
    }
}
