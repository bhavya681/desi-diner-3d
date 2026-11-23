import * as THREE from 'three'
import * as Kit from './Kit.js'

export function buildHighway(world)
{
    const mats = world.palette.mats
    const rand = Kit.seeded(4077)

    const desert = Kit.plane(world.group, 180, 180, mats.dirt, 0, -0.14, 0)
    desert.rotation.x = -Math.PI * 0.5

    const road = Kit.box(world.group, 180, 0.08, 12, mats.asphalt, 0, -0.06, 17.5)
    road.userData.decorative = true
    world.mark(road, 'road', { label: 'NH-1 highway', camera: 'highway', hint: 'The highway never really sleeps' })

    const markings = []
    for(let i = 0; i < 90; i++)
    {
        markings.push({ p: [-86 + i * 2, 0.0, 17.5], s: [1, 1, 1] })
    }
    Kit.instanced(world.group, new THREE.BoxGeometry(0.95, 0.012, 0.12), mats.mustard, markings)

    for(const z of [12.1, 22.9])
    {
        const line = Kit.box(world.group, 180, 0.012, 0.16, mats.cream, 0, 0.01, z)
        line.userData.decorative = true
    }

    const gravelPatch = Kit.box(world.group, 62, 0.05, 8, mats.gravel, -6, -0.005, 25.2)
    world.mark(gravelPatch, 'truckYard', { label: 'Truck parking', camera: 'trucks', hint: 'Drivers park here for the night' })

    const buildTruck = (x, z, color, index) =>
    {
        const truck = Kit.group(world.group, x, 0, z)
        truck.rotation.y = Math.PI * 0.5

        const bodyColor = Kit.standard(color, { roughness: 0.68, metalness: 0.16 })
        Kit.box(truck, 8.2, 2.9, 2.7, bodyColor, 1.4, 2.15, 0)
        const art = Kit.box(truck, 8.25, 2.15, 2.76, mats.truckArt, 1.4, 2.25, 0)
        art.userData.decorative = true

        Kit.box(truck, 2.5, 2.7, 2.65, bodyColor, -4.1, 2.0, 0)
        Kit.box(truck, 2.2, 0.9, 2.5, mats.glass, -4.2, 3.1, 0)
        Kit.box(truck, 2.55, 0.35, 2.75, mats.red, -4.1, 3.62, 0)
        Kit.box(truck, 0.15, 2.4, 2.75, mats.brass, -5.4, 2.0, 0)

        const headlights = []
        for(const side of [-1, 1])
        {
            const lamp = Kit.cylinder(truck, 0.19, 0.19, 0.12, 14, mats.bulbWarm, -5.5, 1.25, side * 0.9)
            lamp.rotation.z = Math.PI * 0.5
            const halo = Kit.glowSprite(truck, -5.6, 1.25, side * 0.9, '#ffdf9a', 1.6, 0.45)
            lamp.userData.halo = halo
            headlights.push(lamp)

            Kit.cylinder(truck, 0.32, 0.32, 0.16, 14, mats.iron, -5.5, 2.5, side * 1.1).rotation.z = Math.PI * 0.5
            Kit.cylinder(truck, 0.09, 0.09, 0.1, 10, mats.mustard, -5.58, 2.5, side * 1.1).rotation.z = Math.PI * 0.5
        }

        const beamMaterial = new THREE.MeshBasicMaterial({ color: '#ffd898', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })
        const beam = Kit.cone(truck, 1.8, 12, 16, beamMaterial, -11.2, 1.4, 0)
        beam.rotation.z = Math.PI * 0.5
        beam.userData.opacity = 0
        truck.userData.beam = beam

        for(const wheelX of [-3.6, 0.2, 2.3, 4.1])
        {
            for(const side of [-1, 1])
            {
                const wheel = Kit.cylinder(truck, 0.62, 0.62, 0.34, 16, mats.iron, wheelX, 0.62, side * 1.4)
                wheel.rotation.x = Math.PI * 0.5
                const hub = Kit.cylinder(truck, 0.28, 0.28, 0.36, 12, mats.steel, wheelX, 0.62, side * 1.42)
                hub.rotation.x = Math.PI * 0.5
            }
        }

        for(let i = 0; i < 10; i++)
        {
            const strip = Kit.box(truck, 0.16, 0.09, 2.8, i % 2 ? mats.greenBright : mats.mustard, -2.6 + i * 0.95, 0.85, 0)
            strip.userData.decorative = true
        }

        const horn = Kit.cylinder(truck, 0.16, 0.1, 0.5, 12, mats.brass, -4.9, 3.9, 0.7)
        horn.rotation.z = Math.PI * 0.5
        world.mark(horn, 'horn', { label: 'Truck horn', camera: 'trucks' })

        const hornSign = Kit.plane(truck, 1.8, 0.9, mats.horn, 5.5, 3.3, 0)
        hornSign.rotation.y = Math.PI * 0.5
        world.mark(hornSign, 'hornSign', { label: 'Horn ok please', camera: 'trucks' })

        for(let i = 0; i < 5; i++)
        {
            Kit.sphere(truck, 0.14, 8, i % 2 ? mats.mustard : mats.redBright, -4.6 + i * 0.4, 3.85, Math.sin(i) * 0.5)
        }

        const underGlow = Kit.glowSprite(truck, 0, 1.2, 0, color, 6, 0.16)
        underGlow.userData.decorative = true
        truck.userData.headlights = headlights
        truck.userData.index = index
        world.markTree(truck, 'truck', { label: 'Painted truck', camera: 'trucks', hint: 'Tap to wake the truck and sound the horn', index })
        world.trucks = world.trucks || []
        world.trucks.push(truck)
        return truck
    }

    buildTruck(-25, 24.5, '#1c6d8e', 0)
    buildTruck(-9, 25.2, '#9d2c22', 1)
    buildTruck(11, 24.8, '#1d6b4f', 2)

    const passingVehicles = []
    const createVehicle = (x, z, speed, kind) =>
    {
        const vehicle = Kit.group(world.group, x, 0, z)
        const color = kind === 'bus' ? mats.mustard : kind === 'truck' ? mats.plasticBlue : mats.redBright
        if(kind === 'bus')
        {
            Kit.box(vehicle, 6.4, 2.7, 2.4, color, 0, 1.6, 0)
            for(let i = 0; i < 5; i++)
            {
                Kit.box(vehicle, 0.9, 0.8, 0.04, mats.glass, -2.3 + i * 1.1, 2.0, 1.22)
            }
            Kit.box(vehicle, 6.5, 0.2, 2.5, mats.green, 0, 0.7, 0)
        }
        else if(kind === 'truck')
        {
            Kit.box(vehicle, 7, 2.2, 2.4, color, 1, 1.5, 0)
            Kit.box(vehicle, 2.2, 2, 2.3, mats.cream, -3.4, 1.35, 0)
        }
        else
        {
            Kit.box(vehicle, 3.6, 1.1, 1.8, color, 0, 0.95, 0)
            Kit.box(vehicle, 1.8, 0.8, 1.65, mats.glass, -0.2, 1.65, 0)
        }
        for(const side of [-1, 1])
        {
            const lamp = Kit.sphere(vehicle, 0.12, 8, mats.bulbWarm, kind === 'car' ? -1.8 : -3.6, 1.0, side * 0.7)
            Kit.glowSprite(vehicle, lamp.position.x, lamp.position.y, lamp.position.z, '#ffe4a5', 0.9, 0.5)
            const tail = Kit.sphere(vehicle, 0.1, 8, mats.redBright, kind === 'car' ? 1.8 : 3.5, 1.0, side * 0.7)
            tail.userData.decorative = true
        }
        for(const wheelX of [-1.2, 1.2])
        {
            for(const side of [-1, 1])
            {
                const wheel = Kit.cylinder(vehicle, 0.35, 0.35, 0.18, 12, mats.iron, wheelX, 0.38, side * 0.92)
                wheel.rotation.x = Math.PI * 0.5
            }
        }
        vehicle.userData.speed = speed
        vehicle.userData.kind = kind
        passingVehicles.push(vehicle)
    }

    createVehicle(-50, 15, 8.5, 'car')
    createVehicle(34, 20.2, -6.2, 'truck')
    createVehicle(12, 13.6, 5.4, 'bus')
    createVehicle(-18, 20.8, -9, 'car')
    createVehicle(58, 15.2, -7.4, 'car')

    world.animated.push((elapsed, delta) =>
    {
        passingVehicles.forEach((vehicle) =>
        {
            vehicle.position.x += vehicle.userData.speed * delta * 0.001
            if(vehicle.position.x > 85)
            {
                vehicle.position.x = -85
            }
            if(vehicle.position.x < -85)
            {
                vehicle.position.x = 85
            }
        })
    })

    for(let i = 0; i < 7; i++)
    {
        const x = -48 + i * 16
        const pole = Kit.group(world.group, x, 0, 12.8)
        Kit.cylinder(pole, 0.13, 0.18, 7.5, 10, mats.iron, 0, 3.75, 0)
        Kit.box(pole, 2.4, 0.12, 0.12, mats.iron, 1.1, 7.4, 0)
        const lamp = Kit.box(pole, 0.9, 0.18, 0.5, mats.bulbWarm, 2.1, 7.25, 0)
        Kit.glowSprite(pole, 2.1, 7.1, 0, '#ffcf83', 3.2, 0.4)
        world.mark(lamp, 'streetlight', { label: 'Highway streetlight', camera: 'highway', hint: 'A yellow pool of light on the highway' })
        if(i % 2 === 1)
        {
            const light = world.light(x + 2.1, 7, 12.8, '#ffc471', 0.9, 14, { toggleable: false })
            light.userData.decorative = true
        }
    }

    const signPole = Kit.group(world.group, -30, 0, 12.4)
    Kit.cylinder(signPole, 0.12, 0.14, 4.6, 8, mats.iron, 0, 2.3, 0)
    Kit.box(signPole, 3.4, 1.7, 0.12, mats.charcoal, 0, 4.8, 0)
    const highwaySign = Kit.plane(signPole, 3.2, 1.55, mats.highwaySign, 0, 4.8, 0.08)
    world.mark(highwaySign, 'highwaySign', { label: 'NH-1 sign', camera: 'highway' })

    for(let i = 0; i < 14; i++)
    {
        const x = -70 + i * 11
        const z = i % 2 ? -38 - rand() * 12 : 40 + rand() * 12
        const height = 5 + rand() * 16
        const building = Kit.box(world.group, 4 + rand() * 7, height, 4 + rand() * 6, mats.charcoalSoft, x, height / 2 - 0.2, z)
        building.userData.decorative = true
        for(let row = 0; row < Math.floor(height / 2); row++)
        {
            for(let column = 0; column < 3; column++)
            {
                if(rand() > 0.52)
                {
                    const window = Kit.box(world.detailGroup, 0.55, 0.5, 0.04, rand() > 0.5 ? mats.mustard : mats.plasticBlue, x - 1.2 + column * 1.2, 1 + row * 1.8, z + (z < 0 ? 3.2 : -3.2))
                    window.userData.decorative = true
                }
            }
        }
    }

    for(let i = 0; i < 22; i++)
    {
        const x = -80 + i * 7.6 + rand() * 3
        const z = i % 2 ? 33 + rand() * 7 : -28 - rand() * 6
        const height = 3 + rand() * 4
        Kit.cylinder(world.group, 0.12, 0.2, height, 7, mats.woodDark, x, height / 2, z)
        const canopy = Kit.sphere(world.group, 1.2 + rand() * 0.8, 8, mats.green, x, height + 0.4, z)
        canopy.scale.set(1, 0.8, 1)
        canopy.userData.decorative = true
    }

    for(let i = 0; i < 6; i++)
    {
        const x = -55 + i * 23
        Kit.cylinder(world.group, 0.1, 0.14, 8, 8, mats.iron, x, 4, 29)
        Kit.box(world.group, 1.1, 0.14, 0.14, mats.iron, x, 7.9, 29)
    }
    world.animated.push((elapsed) =>
    {
        const wires = world.highwayWires || []
        wires.forEach((wire, index) => { wire.rotation.z = Math.sin(elapsed * 0.0008 + index) * 0.006 })
    })

    world.light(-25, 4, 24, '#ffd28a', 0.7, 10, { toggleable: false })
    world.light(11, 4, 24, '#ffd28a', 0.7, 10, { toggleable: false })
}
