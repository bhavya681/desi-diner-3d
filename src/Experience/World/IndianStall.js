import * as THREE from 'three'
import Experience from '../Experience.js'
import gsap from 'gsap'

export default class IndianStall
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.config = this.experience.config
        this.debug = this.experience.debug

        this.scene.background = new THREE.Color('#0b0706')
        this.scene.fog = new THREE.FogExp2('#0b0706', 0.018)

        this.group = new THREE.Group()
        this.scene.add(this.group)

        this.interactive = []
        this.steamParticles = []
        this.bulbs = []
        this.spiceJars = []
        this.dishes = []
        this.lights = []

        this.lowMode = false
        this.chaiTilt = 0
        this.cooking = { active: false, progress: 0 }

        this.createTextures()
        this.createMaterials()
        this.buildGround()
        this.buildStall()
        this.buildSigns()
        this.buildStove()
        this.buildDisplay()
        this.buildChai()
        this.buildSpices()
        this.buildLights()
        this.buildSteam()
    }

    createCanvasTexture(width, height, draw)
    {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const context = canvas.getContext('2d')
        draw(context, width, height)

        const texture = new THREE.CanvasTexture(canvas)
        texture.encoding = THREE.sRGBEncoding
        texture.anisotropy = 4
        return texture
    }

    createTextures()
    {
        this.signTexture = this.createCanvasTexture(1024, 256, (context, width, height) =>
        {
            const gradient = context.createLinearGradient(0, 0, width, 0)
            gradient.addColorStop(0, '#2a1009')
            gradient.addColorStop(0.5, '#4a1d0e')
            gradient.addColorStop(1, '#2a1009')
            context.fillStyle = gradient
            context.fillRect(0, 0, width, height)
            context.strokeStyle = '#ff9d2e'
            context.lineWidth = 10
            context.strokeRect(14, 14, width - 28, height - 28)
            context.strokeStyle = '#fff2d6'
            context.lineWidth = 2
            context.strokeRect(28, 28, width - 56, height - 56)
            context.textAlign = 'center'
            context.fillStyle = '#ffb443'
            context.font = '900 96px Arial, sans-serif'
            context.fillText('TADKA LANE', width / 2, 122)
            context.fillStyle = '#fff2d6'
            context.font = '700 31px Arial, sans-serif'
            context.fillText('INDIAN STREET KITCHEN', width / 2, 184)
            context.fillStyle = '#ff4d2e'
            context.beginPath()
            context.arc(78, height / 2, 12, 0, Math.PI * 2)
            context.arc(width - 78, height / 2, 12, 0, Math.PI * 2)
            context.fill()
        })

        this.menuTexture = this.createCanvasTexture(512, 768, (context, width, height) =>
        {
            context.fillStyle = '#1c0f0b'
            context.fillRect(0, 0, width, height)
            context.strokeStyle = '#ffb443'
            context.lineWidth = 8
            context.strokeRect(18, 18, width - 36, height - 36)
            context.strokeStyle = 'rgba(255,242,214,0.35)'
            context.lineWidth = 2
            context.strokeRect(34, 34, width - 68, height - 68)
            context.textAlign = 'center'
            context.fillStyle = '#ffb443'
            context.font = '900 62px Arial, sans-serif'
            context.fillText('TODAY’S TADKA', width / 2, 116)
            context.fillStyle = '#fff2d6'
            context.font = '700 24px Arial, sans-serif'
            context.fillText('FRESH OFF THE TAWA', width / 2, 158)
            context.strokeStyle = '#ff4d2e'
            context.lineWidth = 3
            context.beginPath()
            context.moveTo(80, 184)
            context.lineTo(width - 80, 184)
            context.stroke()

            const items = [
                ['MASALA DOSA', '₹ 160'],
                ['PANI PURI', '₹ 120'],
                ['PAV BHAJI', '₹ 180'],
                ['CHANA CHAAT', '₹ 140'],
                ['SAMOSA PLATTER', '₹ 110'],
                ['KARAK CHAI', '₹ 40'],
                ['GULAB JAMUN', '₹ 90']
            ]

            context.textAlign = 'left'
            context.font = '700 29px Arial, sans-serif'
            items.forEach((item, index) =>
            {
                const y = 248 + index * 66
                context.fillStyle = index % 2 ? '#fff2d6' : '#ffd98a'
                context.fillText(item[0], 62, y)
                context.textAlign = 'right'
                context.fillText(item[1], width - 62, y)
                context.textAlign = 'left'
                context.strokeStyle = 'rgba(255,242,214,0.12)'
                context.lineWidth = 1
                context.beginPath()
                context.moveTo(62, y + 14)
                context.lineTo(width - 62, y + 14)
                context.stroke()
            })

            context.textAlign = 'center'
            context.fillStyle = '#ff9d2e'
            context.font = '700 22px Arial, sans-serif'
            context.fillText('ORDER AT THE COUNTER', width / 2, height - 62)
        })

        this.chaiTexture = this.createLabelTexture('CHAI', '#ffd98a', '#4a1d0e')
        this.spiceTexture = this.createLabelTexture('MASALA', '#ff8a3d', '#1c3d34')
        this.dishTextures = [
            this.createLabelTexture('SAMOSA', '#ffd98a', '#6b2d14'),
            this.createLabelTexture('CHAAT', '#ff9d2e', '#2c5f31'),
            this.createLabelTexture('PAKORA', '#fff2d6', '#6b3b15')
        ]
    }

    createLabelTexture(text, color, background)
    {
        return this.createCanvasTexture(512, 160, (context, width, height) =>
        {
            context.fillStyle = background
            context.fillRect(0, 0, width, height)
            context.strokeStyle = color
            context.lineWidth = 8
            context.strokeRect(10, 10, width - 20, height - 20)
            context.fillStyle = color
            context.font = '900 72px Arial, sans-serif'
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.fillText(text, width / 2, height / 2)
        })
    }

    standard(color, options = {})
    {
        return new THREE.MeshStandardMaterial({
            color,
            roughness: options.roughness === undefined ? 0.78 : options.roughness,
            metalness: options.metalness === undefined ? 0.05 : options.metalness,
            emissive: options.emissive || '#000000',
            emissiveIntensity: options.emissiveIntensity === undefined ? 0 : options.emissiveIntensity,
            side: options.side || THREE.FrontSide,
            transparent: options.transparent || false,
            opacity: options.opacity === undefined ? 1 : options.opacity
        })
    }

    createMaterials()
    {
        this.materials = {
            ground: this.standard('#120e0c', { roughness: 1 }),
            road: this.standard('#1f1814', { roughness: 1 }),
            wall: this.standard('#123936', { roughness: 0.92 }),
            wallDark: this.standard('#0a2422', { roughness: 0.92 }),
            wood: this.standard('#5d321b'),
            woodLight: this.standard('#9d5c2a'),
            brass: this.standard('#c88b2c', { roughness: 0.3, metalness: 0.72 }),
            metal: this.standard('#4c5152', { roughness: 0.48, metalness: 0.55 }),
            metalDark: this.standard('#1c1e1f', { roughness: 0.62, metalness: 0.45 }),
            saffron: this.standard('#ef8d24', { emissive: '#5d2200', emissiveIntensity: 0.22 }),
            chilli: this.standard('#c43222', { emissive: '#3a0800', emissiveIntensity: 0.22 }),
            cream: this.standard('#f4e4c4'),
            green: this.standard('#2b8b4f'),
            pink: this.standard('#ef5b95'),
            dosa: this.standard('#d19032', { roughness: 0.65, emissive: '#5a2a00', emissiveIntensity: 0.36, side: THREE.DoubleSide }),
            chai: this.standard('#a76129', { roughness: 0.42 }),
            warmGlow: new THREE.MeshBasicMaterial({ color: '#ffc85c' }),
            pinkGlow: new THREE.MeshBasicMaterial({ color: '#ff5f9e' }),
            greenGlow: new THREE.MeshBasicMaterial({ color: '#57e88a' }),
            edgeGlow: new THREE.MeshBasicMaterial({ color: '#ff8a2b' }),
            steam: new THREE.MeshBasicMaterial({ color: '#fff2dc', transparent: true, opacity: 0, depthWrite: false })
        }
    }

    box(width, height, depth, material, x, y, z, parent = this.group)
    {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material)
        mesh.position.set(x, y, z)
        parent.add(mesh)
        return mesh
    }

    cylinder(radiusTop, radiusBottom, height, segments, material, x, y, z, parent = this.group)
    {
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material)
        mesh.position.set(x, y, z)
        parent.add(mesh)
        return mesh
    }

    sphere(radius, widthSegments, heightSegments, material, x, y, z, parent = this.group)
    {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, widthSegments, heightSegments), material)
        mesh.position.set(x, y, z)
        parent.add(mesh)
        return mesh
    }

    torus(radius, tube, radialSegments, tubularSegments, material, x, y, z, parent = this.group)
    {
        const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, radialSegments, tubularSegments), material)
        mesh.position.set(x, y, z)
        parent.add(mesh)
        return mesh
    }

    plane(width, height, material, x, y, z, parent = this.group)
    {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
        mesh.position.set(x, y, z)
        parent.add(mesh)
        return mesh
    }

    mark(mesh, action, data = {})
    {
        mesh.userData.action = action
        mesh.userData.dish = data.dish
        this.interactive.push(mesh)
        return mesh
    }

    buildGround()
    {
        const ground = this.plane(42, 42, this.materials.ground, 0, -1.62, 0)
        ground.rotation.x = -Math.PI * 0.5

        const mat = this.box(10.5, 0.08, 6.4, this.materials.wallDark, 0, -1.56, 0.2)

        for(let i = 0; i < 7; i++)
        {
            this.box(0.05, 0.012, 5.4, this.materials.road, -4.5 + i * 1.5, -1.5, 0.2)
        }

        mat.receiveShadow = true
    }

    buildStall()
    {
        this.box(7.9, 4.6, 0.18, this.materials.wall, 0, 1.05, -1.76)
        this.box(7.9, 0.22, 0.24, this.materials.wallDark, 0, 3.35, -1.76)
        this.box(0.24, 5.4, 0.24, this.materials.wood, -3.9, 1.05, 1.2)
        this.box(0.24, 5.4, 0.24, this.materials.wood, 3.9, 1.05, 1.2)
        this.box(8.1, 0.2, 0.22, this.materials.wood, 0, 3.95, 1.5)

        this.box(7.9, 1.55, 0.2, this.materials.chilli, 0, -0.72, 2.03)
        this.box(8.1, 0.3, 2.35, this.materials.woodLight, 0, 0.05, 1.05)
        this.box(8.15, 0.12, 0.2, this.materials.brass, 0, -0.07, 2.2)
        this.box(7.6, 0.028, 0.03, this.materials.edgeGlow, 0, -0.16, 2.31)
        this.box(6.8, 0.12, 0.6, this.materials.wood, 0, 1.85, -1.43)
        this.box(6.5, 0.025, 0.025, this.materials.edgeGlow, 0, 1.89, -1.11)
        this.box(6.8, 0.1, 0.48, this.materials.wood, 0.35, 2.72, -1.45)
        this.box(7.6, 0.025, 0.025, this.materials.edgeGlow, 0, 3.73, 1.63)

        for(let i = 0; i < 10; i++)
        {
            const material = i % 2 === 0 ? this.materials.saffron : this.materials.cream
            const stripe = this.box(0.79, 0.16, 2.75, material, -3.56 + i * 0.79, 3.82, 0.15)
            stripe.rotation.x = -0.1
            this.box(0.79, 0.42, 0.12, material, -3.56 + i * 0.79, 3.57, 1.54)
        }

        this.fan = new THREE.Group()
        this.fan.position.set(0, 3.25, 0.05)
        this.group.add(this.fan)
        this.cylinder(0.17, 0.17, 0.2, 18, this.materials.brass, 0, 0, 0, this.fan)
        this.cylinder(0.04, 0.04, 0.7, 10, this.materials.metalDark, 0, 0.4, 0, this.fan)

        for(let i = 0; i < 4; i++)
        {
            const pivot = new THREE.Group()
            pivot.rotation.y = i * Math.PI * 0.5
            this.fan.add(pivot)
            const blade = this.box(1.35, 0.045, 0.2, this.materials.woodLight, 0.78, 0, 0, pivot)
            blade.rotation.z = 0.12
        }

        for(let i = 0; i < 5; i++)
        {
            const ladle = this.cylinder(0.035, 0.035, 0.65, 8, this.materials.brass, -3.25 + i * 0.28, 2.35, -1.34)
            ladle.rotation.z = 0.15
            const bowl = this.sphere(0.11, 10, 8, this.materials.brass, -3.25 + i * 0.28, 2.68, -1.34)
            bowl.scale.y = 0.5
        }
    }

    buildSigns()
    {
        this.box(4.8, 1.12, 0.2, this.materials.metalDark, 0, 3.35, 1.63)
        const signMaterial = new THREE.MeshBasicMaterial({ map: this.signTexture })
        this.plane(4.58, 1.0, signMaterial, 0, 3.35, 1.75)

        this.box(2.5, 2.25, 0.14, this.materials.metalDark, -2.35, 2.15, -1.62)
        const menuMaterial = new THREE.MeshBasicMaterial({ map: this.menuTexture })
        this.mark(this.plane(2.34, 2.1, menuMaterial, -2.35, 2.15, -1.53), 'menu')

        this.box(1.65, 0.72, 0.12, this.materials.metalDark, 2.35, 2.2, -1.62)
        const chaiMaterial = new THREE.MeshBasicMaterial({ map: this.chaiTexture })
        this.mark(this.plane(1.52, 0.6, chaiMaterial, 2.35, 2.2, -1.53), 'chai')

        this.box(1.9, 0.66, 0.12, this.materials.metalDark, 0.85, 2.76, -1.62)
        const spiceMaterial = new THREE.MeshBasicMaterial({ map: this.spiceTexture })
        this.mark(this.plane(1.78, 0.55, spiceMaterial, 0.85, 2.76, -1.53), 'spice')
    }

    buildStove()
    {
        const x = -2.35
        const z = 0.65

        this.cylinder(0.74, 0.8, 0.2, 24, this.materials.metalDark, x, 0.3, z)
        const ring = this.torus(0.54, 0.055, 10, 28, this.materials.brass, x, 0.43, z)
        ring.rotation.x = Math.PI * 0.5

        for(let i = 0; i < 3; i++)
        {
            const flame = this.torus(0.25 + i * 0.1, 0.018, 8, 24, i === 0 ? this.materials.pinkGlow : this.materials.warmGlow, x, 0.46 - i * 0.01, z)
            flame.rotation.x = Math.PI * 0.5
        }

        this.mark(this.cylinder(0.64, 0.64, 0.09, 36, this.materials.metal, x, 0.52, z), 'cook')

        this.dosa = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), this.materials.dosa.clone())
        this.dosa.rotation.x = -Math.PI * 0.5
        this.dosa.position.set(x, 0.58, z)
        this.dosaBaseColor = new THREE.Color('#d19032')
        this.dosaCookedColor = new THREE.Color('#8c4513')
        this.mark(this.dosa, 'dosa')

        const spatula = this.box(0.08, 0.035, 1.05, this.materials.metal, x + 0.86, 0.5, z - 0.1)
        spatula.rotation.y = -0.35

        const glow = new THREE.PointLight('#ff7a1a', 1.15, 4.2, 2)
        glow.position.set(x, 0.75, z)
        glow.userData.baseIntensity = 1.15
        this.group.add(glow)
        this.lights.push(glow)
    }

    buildDisplay()
    {
        const hues = ['#e58a25', '#d94d2f', '#c8752f']
        const names = ['SAMOSA', 'CHAAT', 'PAKORA']
        const xPositions = [-0.85, 0, 0.85]

        xPositions.forEach((x, index) =>
        {
            const plate = this.mark(this.cylinder(0.44, 0.4, 0.08, 28, this.materials.cream, x, 0.28, 1.22), 'display')
            const food = this.sphere(0.3, 18, 14, this.standard(hues[index], { roughness: 0.6 }), x, 0.42, 1.22)
            food.scale.y = 0.48
            this.mark(food, 'dish', { dish: names[index] })

            for(let i = 0; i < 4; i++)
            {
                const garnish = this.sphere(0.045, 8, 6, i % 2 ? this.materials.green : this.materials.chilli, x - 0.14 + i * 0.09, 0.56, 1.22 + (i % 2 ? 0.07 : -0.07))
                garnish.scale.y = 0.5
            }

            const labelMaterial = new THREE.MeshBasicMaterial({ map: this.dishTextures[index] })
            this.plane(0.8, 0.24, labelMaterial, x, -0.36, 2.15)

            this.dishes.push({ plate, food })
        })
    }

    buildChai()
    {
        const x = 2.35
        const z = 0.72

        this.cylinder(0.48, 0.54, 0.16, 24, this.materials.metalDark, x, 0.29, z)

        this.kettle = new THREE.Group()
        this.kettle.position.set(x, 0.55, z)
        this.group.add(this.kettle)
        this.mark(this.cylinder(0.36, 0.42, 0.56, 24, this.materials.brass, 0, 0.08, 0, this.kettle), 'chai')
        this.cylinder(0.3, 0.3, 0.05, 24, this.materials.metalDark, 0, 0.38, 0, this.kettle)
        this.sphere(0.1, 12, 10, this.materials.metalDark, 0, 0.47, 0, this.kettle)

        const handle = this.torus(0.32, 0.035, 10, 24, this.materials.metalDark, -0.42, 0.08, 0, this.kettle)
        handle.rotation.y = Math.PI * 0.5

        const spout = this.cylinder(0.06, 0.1, 0.52, 12, this.materials.brass, 0.42, 0.15, 0, this.kettle)
        spout.rotation.z = -0.75

        for(let i = 0; i < 3; i++)
        {
            const cupX = 1.7 + i * 0.55
            const cup = this.mark(this.cylinder(0.15, 0.11, 0.24, 18, this.materials.cream, cupX, 0.34, 1.36), 'chai')
            const tea = this.mark(this.cylinder(0.13, 0.13, 0.02, 18, this.materials.chai, cupX, 0.47, 1.36), 'chai')
            cup.userData.dish = 'Karak chai'
            tea.userData.dish = 'Karak chai'
        }

        const glow = new THREE.PointLight('#ffb347', 0.8, 3.4, 2)
        glow.position.set(x, 0.9, z)
        glow.userData.baseIntensity = 0.8
        this.group.add(glow)
        this.lights.push(glow)
    }

    buildSpices()
    {
        const colors = ['#d94d2f', '#e8a72c', '#6ca53c', '#b84b24', '#e5c451', '#8d4a2a']
        const jarMaterialColors = ['#ff6b3d', '#ffc247', '#78c65a', '#d45b31', '#f2da66', '#9e5a34']

        colors.forEach((color, index) =>
        {
            const x = 0.15 + index * 0.45
            const glass = this.mark(this.cylinder(0.17, 0.17, 0.38, 18, this.standard(color, { roughness: 0.4, transparent: true, opacity: 0.82 }), x, 2.05, -1.35), 'spice')
            const lid = this.mark(this.cylinder(0.19, 0.19, 0.07, 18, this.materials.brass, x, 2.27, -1.35), 'spice')
            const band = this.mark(this.cylinder(0.175, 0.175, 0.1, 18, this.standard(jarMaterialColors[index], { emissive: jarMaterialColors[index], emissiveIntensity: 0.12 }), x, 1.99, -1.35), 'spice')
            this.spiceJars.push(glass, lid, band)
        })
    }

    buildLights()
    {
        const ambient = new THREE.AmbientLight('#ffd7a8', 0.52)
        const hemisphere = new THREE.HemisphereLight('#ffc179', '#120806', 0.58)
        const directional = new THREE.DirectionalLight('#ffe2b5', 0.95)
        directional.position.set(5, 8, 7)
        this.scene.add(ambient, hemisphere, directional)

        const signGlow = new THREE.PointLight('#ff9d2e', 1.3, 7.5, 2)
        signGlow.position.set(0, 3.0, 1.1)
        signGlow.userData.baseIntensity = 1.3
        this.group.add(signGlow)
        this.lights.push(signGlow)

        for(let i = 0; i < 13; i++)
        {
            const x = -3.6 + i * 0.6
            const y = 3.25 - Math.sin((i / 12) * Math.PI) * 0.32
            const material = i % 3 === 0 ? this.materials.pinkGlow : i % 3 === 1 ? this.materials.warmGlow : this.materials.greenGlow
            const bulb = this.sphere(0.075, 10, 8, material, x, y, 1.68)
            this.bulbs.push(bulb)
        }
    }

    buildSteam()
    {
        const origins = [
            { x: -2.35, y: 0.75, z: 0.65, count: 8 },
            { x: 2.35, y: 0.85, z: 0.72, count: 7 }
        ]

        origins.forEach((origin, originIndex) =>
        {
            for(let i = 0; i < origin.count; i++)
            {
                const material = this.materials.steam.clone()
                const particle = this.sphere(0.1, 8, 6, material, origin.x, origin.y, origin.z)
                particle.visible = true
                this.steamParticles.push({
                    mesh: particle,
                    origin: new THREE.Vector3(origin.x, origin.y, origin.z),
                    phase: (i / origin.count + originIndex * 0.31) % 1,
                    speed: 0.75 + (i % 4) * 0.18,
                    drift: 0.06 + (i % 3) * 0.035
                })
            }
        })
    }

    startCooking()
    {
        this.cooking.active = true
        this.cooking.progress = 0

        gsap.fromTo(this.dosa.scale,
            { x: 0.7, y: 0.7, z: 0.7 },
            { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(2)' }
        )
    }

    pourChai()
    {
        this.chaiTilt = -0.32
        gsap.to(this, { chaiTilt: 0, duration: 1.3, ease: 'elastic.out(1, 0.5)' })
    }

    sparkleSpices()
    {
        this.spiceJars.forEach((jar, index) =>
        {
            const base = jar.userData.baseScale || jar.scale.clone()
            jar.userData.baseScale = base
            gsap.fromTo(jar.scale,
                { x: base.x, y: base.y * 0.82, z: base.z },
                {
                    x: base.x * 1.08,
                    y: base.y * 1.12,
                    z: base.z * 1.08,
                    duration: 0.45,
                    delay: index * 0.04,
                    yoyo: true,
                    repeat: 1,
                    ease: 'sine.inOut'
                }
            )
        })
    }

    setLowMode(value)
    {
        this.lowMode = value

        if(value)
        {
            this.steamParticles.forEach((particle, index) =>
            {
                particle.mesh.visible = index % 2 === 0
            })
            this.bulbs.forEach((bulb, index) =>
            {
                bulb.visible = index % 2 === 0
            })
        }
    }

    update()
    {
        const elapsed = this.time.elapsed
        const delta = this.time.delta
        const motionScale = this.config.reducedMotion ? 0.18 : 1

        if(this.fan)
        {
            this.fan.rotation.y += delta * 0.0016 * motionScale
        }

        if(this.kettle)
        {
            this.kettle.rotation.z = this.chaiTilt + Math.sin(elapsed * 0.0014) * 0.015 * motionScale
        }

        if(this.cooking.active)
        {
            this.cooking.progress = Math.min(this.cooking.progress + delta * 0.00032, 1)
            this.dosa.material.color.lerpColors(this.dosaBaseColor, this.dosaCookedColor, this.cooking.progress)
            this.dosa.material.emissiveIntensity = 0.3 + Math.sin(elapsed * 0.012) * 0.16
            this.dosa.rotation.z = Math.sin(elapsed * 0.006) * 0.08

            if(this.cooking.progress >= 1)
            {
                this.cooking.active = false
            }
        }

        this.steamParticles.forEach((particle) =>
        {
            const life = (elapsed * 0.00026 * particle.speed * motionScale + particle.phase) % 1
            const spread = particle.drift * (0.4 + life)
            particle.mesh.position.set(
                particle.origin.x + Math.sin(life * 7 + particle.phase * 12) * spread,
                particle.origin.y + life * 1.35,
                particle.origin.z + Math.cos(life * 5 + particle.phase * 9) * spread
            )
            particle.mesh.material.opacity = Math.sin(life * Math.PI) * 0.24
            particle.mesh.scale.setScalar(0.6 + life * 1.7)
        })

        this.bulbs.forEach((bulb, index) =>
        {
            const pulse = 0.92 + Math.sin(elapsed * 0.002 + index * 1.7) * 0.08
            bulb.scale.setScalar(pulse)
        })

        this.lights.forEach((light, index) =>
        {
            const baseIntensity = light.userData.baseIntensity || 1
            light.intensity = baseIntensity * (0.91 + Math.sin(elapsed * 0.004 + index) * 0.09)
        })
    }
}
