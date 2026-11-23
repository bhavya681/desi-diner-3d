import * as THREE from 'three'
import gsap from 'gsap'
import Palette from './Palette.js'
import * as Kit from './Kit.js'
import { buildArchitecture } from './Architecture.js'
import { buildKitchen } from './Kitchen.js'
import { buildDining } from './Dining.js'
import { buildHighway } from './Highway.js'
import { Atmosphere } from './Atmosphere.js'
import { dishes, dishById } from './data.js'

export default class DhabaWorld
{
    constructor()
    {
        this.experience = window.experience
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.config = this.experience.config
        this.palette = new Palette()

        this.scene.background = new THREE.Color('#07060a')
        this.scene.fog = new THREE.FogExp2('#0b0810', 0.0125)

        this.group = new THREE.Group()
        this.detailGroup = new THREE.Group()
        this.group.add(this.detailGroup)
        this.scene.add(this.group)

        const ambient = new THREE.AmbientLight('#ffd0a0', 0.3)
        const hemisphere = new THREE.HemisphereLight('#6b5570', '#1d0c07', 0.52)
        const moon = new THREE.DirectionalLight('#9cb4d4', 0.34)
        moon.position.set(28, 42, -26)
        const warmFill = new THREE.DirectionalLight('#ff9a4d', 0.2)
        warmFill.position.set(-18, 14, 26)
        this.scene.add(ambient, hemisphere, moon, warmFill)
        this.globalLights = [ambient, hemisphere, moon, warmFill]

        this.interactive = []
        this.pointLights = []
        this.animated = []
        this.fans = []
        this.bulbs = []
        this.dishMeshes = new Map()
        this.cookingProps = {}
        this.quality = this.config.vertical ? 'medium' : 'high'
        this.lightsOn = true
        this.radioOn = false
        this.tandoorHeat = 1

        this.atmosphere = new Atmosphere(this)

        this.box = (...args) => Kit.box(this.group, ...args)
        this.cylinder = (...args) => Kit.cylinder(this.group, ...args)
        this.sphere = (...args) => Kit.sphere(this.group, ...args)
        this.cone = (...args) => Kit.cone(this.group, ...args)
        this.torus = (...args) => Kit.torus(this.group, ...args)
        this.plane = (...args) => Kit.plane(this.group, ...args)
        this.circle = (...args) => Kit.circle(this.group, ...args)
        this.groupNode = (...args) => Kit.group(this.group, ...args)
        this.glow = (...args) => Kit.glowSprite(this.group, ...args)

        buildArchitecture(this)
        buildKitchen(this)
        buildDining(this)
        buildHighway(this)
        this.atmosphere.build()
        this.buildDishRegistry()

        this.animated.push((elapsed, delta) =>
        {
            this.fans.forEach((fan) =>
            {
                const speed = fan.userData.speed === undefined ? 1 : fan.userData.speed
                fan.rotation.y += delta * 0.00135 * speed
            })
        })

        this.animated.push((elapsed) =>
        {
            this.pointLights.forEach((light, index) =>
            {
                if(!light.userData.toggleable || !light.userData.on)
                {
                    return
                }
                const base = light.userData.baseIntensity
                const flicker = light.userData.flicker ? Math.sin(elapsed * 0.011 + index * 2.3) * 0.14 : Math.sin(elapsed * 0.0022 + index) * 0.035
                light.intensity = base * (this.lightsOn ? 1 + flicker : 0.04)
            })
        })

        this.setQuality(this.quality)
    }

    mark(mesh, action, data = {})
    {
        if(!mesh)
        {
            return mesh
        }

        const interaction = { action, label: data.label || action.toUpperCase(), ...data }
        mesh.userData.interaction = interaction
        mesh.userData.action = action

        if(mesh.material && !Array.isArray(mesh.material) && !mesh.userData.uniqueMaterial)
        {
            mesh.material = mesh.material.clone()
            mesh.userData.uniqueMaterial = true
        }

        this.interactive.push(mesh)
        return mesh
    }

    markTree(root, action, data = {})
    {
        root.traverse((child) =>
        {
            if(child.isMesh && !child.userData.interaction)
            {
                this.mark(child, action, data)
            }
        })
        return root
    }

    light(x, y, z, color, intensity, distance, options = {})
    {
        const light = new THREE.PointLight(color, intensity, distance, options.decay || 2)
        light.position.set(x, y, z)
        light.userData.baseIntensity = intensity
        light.userData.toggleable = options.toggleable !== false
        light.userData.flicker = options.flicker || false
        light.userData.on = true
        light.userData.essential = options.essential || false
        light.visible = options.visible !== false
        this.group.add(light)
        this.pointLights.push(light)
        return light
    }

    addBulb(x, y, z, color = 'warm', options = {})
    {
        const materialName = color === 'red' ? 'bulbRed' : color === 'green' ? 'bulbGreen' : 'bulbWarm'
        const material = this.palette.mats[materialName].clone()
        const bulb = Kit.sphere(this.group, options.radius || 0.12, 10, material, x, y, z)
        bulb.userData.baseEmissive = material.emissiveIntensity
        bulb.userData.colorName = color
        bulb.userData.on = true
        bulb.userData.phase = Math.random() * Math.PI * 2
        this.bulbs.push(bulb)

        const halo = Kit.glowSprite(this.group, x, y, z, material.emissive, options.halo || 1.5, 0.5)
        bulb.userData.halo = halo

        if(options.light)
        {
            const pointLight = this.light(x, y - 0.1, z, material.emissive, options.lightIntensity || 0.7, options.lightDistance || 7, { flicker: options.flicker })
            bulb.userData.pointLight = pointLight
        }

        if(options.interactive !== false)
        {
            this.mark(bulb, 'light', { label: 'Hanging bulb', camera: options.camera, hint: 'Switch me on and off' })
        }

        return bulb
    }

    toggleLight(bulb)
    {
        if(!bulb)
        {
            return false
        }
        bulb.userData.on = !bulb.userData.on
        bulb.material.emissiveIntensity = bulb.userData.on ? bulb.userData.baseEmissive : 0
        bulb.material.color.set(bulb.userData.on ? (bulb.userData.colorName === 'green' ? '#5be08a' : bulb.userData.colorName === 'red' ? '#ff5c45' : '#ffd47a') : '#4a4038')
        if(bulb.userData.halo)
        {
            bulb.userData.halo.material.opacity = bulb.userData.on ? 0.5 : 0
        }
        if(bulb.userData.pointLight)
        {
            const light = bulb.userData.pointLight
            if(bulb.userData.lightBase === undefined)
            {
                bulb.userData.lightBase = light.userData.baseIntensity
            }
            light.userData.on = bulb.userData.on
            light.intensity = bulb.userData.on ? bulb.userData.lightBase : 0
        }
        return bulb.userData.on
    }

    flareTandoor()
    {
        const tandoor = this.tandoor
        if(!tandoor)
        {
            return
        }

        gsap.killTweensOf(this)
        gsap.fromTo(this, { tandoorHeat: 2.6 }, { tandoorHeat: 1, duration: 2.2, ease: 'power2.out' })

        if(tandoor.userData.naan)
        {
            const naan = tandoor.userData.naan
            gsap.fromTo(naan.scale, { x: 0.2, y: 0.2, z: 0.2 }, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'back.out(2)' })
            gsap.fromTo(naan.position, { y: 1.7 }, { y: 2.35, duration: 1.1, ease: 'power2.out', yoyo: true, repeat: 1 })
        }

        if(tandoor.userData.light)
        {
            const light = tandoor.userData.light
            gsap.fromTo(light, { intensity: 6 }, { intensity: light.userData.baseIntensity, duration: 1.5, ease: 'power2.out' })
        }

        this.atmosphere.burstSmoke(tandoor.position, 14)
    }

    pourChai()
    {
        const kettle = this.cookingProps.kettle || this.chaiKettle
        if(!kettle)
        {
            return
        }
        gsap.fromTo(kettle.rotation, { z: 0 }, { z: -0.6, duration: 0.45, ease: 'power2.in', yoyo: true, repeat: 1 })
        if(this.chaiGlass)
        {
            const fill = this.chaiGlass.userData.fill
            if(fill)
            {
                gsap.fromTo(fill.scale, { y: 0.02 }, { y: 1, duration: 0.9, ease: 'power1.inOut' })
                gsap.fromTo(fill.position, { y: this.chaiGlass.position.y - 0.06 }, { y: this.chaiGlass.position.y + 0.08, duration: 0.9 })
            }
        }
        this.atmosphere.burstSteam(new THREE.Vector3(kettle.position.x + 0.4, kettle.position.y + 0.5, kettle.position.z), 8)
    }

    flashTruck(truck)
    {
        if(!truck)
        {
            return
        }
        const lights = truck.userData.headlights || []
        lights.forEach((lamp, index) =>
        {
            gsap.fromTo(lamp.material, { emissiveIntensity: 7 }, { emissiveIntensity: 2.4, duration: 0.9, delay: index * 0.08 })
            if(lamp.userData.halo)
            {
                gsap.fromTo(lamp.userData.halo.material, { opacity: 0.95 }, { opacity: 0.5, duration: 0.9 })
            }
        })
        if(truck.userData.beam)
        {
            gsap.fromTo(truck.userData.beam.material, { opacity: 0.35 }, { opacity: 0, duration: 1.2, ease: 'power2.out' })
        }
    }

    shakeVegetables(group)
    {
        if(!group)
        {
            return
        }
        gsap.fromTo(group.rotation, { z: -0.08 }, { z: 0.08, duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut', onComplete: () => { group.rotation.z = 0 } })
    }

    spiceBurst(jar)
    {
        if(!jar)
        {
            return
        }
        gsap.fromTo(jar.rotation, { z: 0 }, { z: -0.65, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.inOut' })
        this.atmosphere.burstSpice(jar.getWorldPosition(new THREE.Vector3()), 10, jar.userData.spiceColor || '#ffb43d')
    }

    splashWater(pump)
    {
        if(!pump)
        {
            return
        }
        this.atmosphere.burstWater(pump.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, -0.35, 0.28)), 12)
        gsap.fromTo(pump.scale, { y: 0.9 }, { y: 1.04, duration: 0.18, yoyo: true, repeat: 3 })
    }

    popPoster(poster)
    {
        if(!poster)
        {
            return
        }
        gsap.fromTo(poster.scale, { x: 1, y: 0.92 }, { x: 1.04, y: 1.08, duration: 0.3, yoyo: true, repeat: 1, ease: 'back.out(2)' })
    }

    toggleFan(fan)
    {
        if(!fan)
        {
            return 1
        }
        const speeds = [0, 1, 2.4]
        const current = speeds.indexOf(fan.userData.speed === undefined ? 1 : fan.userData.speed)
        const next = speeds[(current + 1) % speeds.length]
        fan.userData.speed = next
        return next
    }

    buildDishRegistry()
    {
        dishes.forEach((dish) =>
        {
            const mesh = this.dishMeshes.get(dish.id)
            if(mesh)
            {
                mesh.userData.dishId = dish.id
            }
        })
    }

    highlightDish(id)
    {
        this.dishMeshes.forEach((mesh, key) =>
        {
            gsap.killTweensOf(mesh.scale)
            if(key === id)
            {
                gsap.fromTo(mesh.scale, { x: 1, y: 1, z: 1 }, { x: 1.35, y: 1.35, z: 1.35, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' })
            }
        })
    }

    startCooking(recipe)
    {
        const station = this.cookingProps[recipe.station]
        if(!station)
        {
            return
        }

        Object.values(this.cookingProps).forEach((prop) =>
        {
            if(prop.userData && prop.userData.ingredients)
            {
                prop.userData.ingredients.forEach((item) => item.visible = false)
            }
        })

        station.userData.ingredients = []
        const colors = ['#d43a25', '#f3d473', '#4b8f3c', '#f0e1b4', '#a8501f']

        recipe.ingredients.forEach((ingredient, index) =>
        {
            const color = ingredient.color || colors[index % colors.length]
            const item = Kit.group(this.group, station.position.x - 2.2 + index * 0.62, station.position.y + 1.4 + (index % 2) * 0.22, station.position.z + 2.1)
            const material = Kit.standard(color, { roughness: 0.7, emissive: color, emissiveIntensity: 0.18 })
            const bowl = Kit.cylinder(item, 0.19, 0.15, 0.16, 14, this.palette.mats.steel, 0, 0, 0)
            const content = Kit.sphere(item, 0.14, 12, material, 0, 0.1, 0)
            content.scale.y = 0.6
            this.mark(bowl, 'cookIngredient', { label: ingredient.label, ingredientId: ingredient.id })
            this.mark(content, 'cookIngredient', { label: ingredient.label, ingredientId: ingredient.id })
            item.userData.ingredientId = ingredient.id
            item.userData.material = material
            item.visible = false
            station.userData.ingredients.push(item)
        })

        if(recipe.ingredients.length)
        {
            station.userData.ingredients[0].visible = true
        }

        if(station.userData.fire)
        {
            station.userData.fire.visible = false
        }
    }

    addCookingIngredient(recipe, ingredientId)
    {
        const station = this.cookingProps[recipe.station]
        if(!station || !station.userData.ingredients)
        {
            return false
        }

        const item = station.userData.ingredients.find((candidate) => candidate.userData.ingredientId === ingredientId)
        if(!item || !item.visible)
        {
            return false
        }

        const target = new THREE.Vector3(station.position.x, station.position.y + 0.45, station.position.z)
        gsap.to(item.position, {
            x: target.x,
            y: target.y + 0.7,
            z: target.z,
            duration: 0.65,
            ease: 'power2.inOut',
            onComplete: () =>
            {
                item.visible = false
                this.atmosphere.burstSpice(target, 8, item.userData.material.color.getStyle())
            }
        })
        gsap.to(item.rotation, { y: Math.PI * 3, duration: 0.65 })

        const next = station.userData.ingredients.find((candidate) => candidate.visible === false && !candidate.userData.used && candidate !== item)
        if(next)
        {
            item.userData.used = true
            window.setTimeout(() => { next.visible = true }, 620)
        }

        if(station.userData.fire)
        {
            station.userData.fire.visible = true
            gsap.fromTo(station.userData.fire.scale, { y: 0.4 }, { y: 1, duration: 0.6, ease: 'power2.out' })
        }

        return true
    }

    finishCooking(recipe)
    {
        const station = this.cookingProps[recipe.station]
        if(!station)
        {
            return
        }
        if(station.userData.ingredients)
        {
            station.userData.ingredients.forEach((item) => item.visible = false)
        }
        const dish = dishById[recipe.result]
        if(dish)
        {
            this.atmosphere.burstSteam(new THREE.Vector3(station.position.x, station.position.y + 0.7, station.position.z), 14)
            this.highlightDish(dish.id)
        }
    }

    setLights(on)
    {
        this.lightsOn = on
        this.bulbs.forEach((bulb) =>
        {
            const shouldBeOn = on ? true : bulb.userData.colorName === 'red'
            if(bulb.userData.on !== shouldBeOn)
            {
                this.toggleLight(bulb)
            }
        })
    }

    setQuality(level)
    {
        this.quality = level
        this.detailGroup.visible = level !== 'low'
        this.atmosphere.setQuality(level)

        const renderScale = level === 'high' ? Math.min(window.devicePixelRatio, 2) : level === 'medium' ? Math.min(window.devicePixelRatio, 1.5) : 1
        this.experience.renderer.instance.setPixelRatio(renderScale)
        this.experience.renderer.instance.setSize(this.experience.sizes.width, this.experience.sizes.height)

        if(this.experience.postProcessing)
        {
            this.experience.postProcessing.setQuality(level)
            this.experience.postProcessing.resize()
        }

        this.pointLights.forEach((light, index) =>
        {
            const keep = light.userData.essential || !light.userData.toggleable
            light.visible = level === 'high' ? true : level === 'medium' ? keep || index % 3 !== 2 : keep || index % 3 === 0
        })
    }

    update()
    {
        const elapsed = this.time.elapsed
        const delta = this.time.delta
        const motionScale = this.config.reducedMotion ? 0.18 : 1

        this.animated.forEach((callback) => callback(elapsed, delta * motionScale))
        this.atmosphere.update(elapsed, delta * motionScale)
    }
}
