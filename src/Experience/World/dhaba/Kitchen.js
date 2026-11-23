import * as THREE from 'three'
import * as Kit from './Kit.js'
import { stories } from './data.js'

export function buildKitchen(world)
{
    const mats = world.palette.mats
    const rand = Kit.seeded(2391)

    const hood = Kit.group(world.group, -7, 0, -6.5)
    Kit.box(hood, 10, 0.5, 4.5, mats.steelDark, 0, 6.2, 0)
    Kit.box(hood, 10.4, 0.7, 0.35, mats.steel, 0, 5.85, 2.2)
    for(let i = 0; i < 5; i++)
    {
        Kit.box(hood, 0.12, 1.2, 4.4, mats.steel, -4 + i * 2, 5.4, 0)
    }

    const rack = Kit.group(world.group, -7.5, 0, -12.8)
    for(let level = 0; level < 3; level++)
    {
        Kit.box(rack, 9.5, 0.14, 0.9, mats.steelDark, 0, 1.3 + level * 1.35, 0)
        Kit.box(rack, 9.5, 0.1, 0.1, mats.steel, 0, 1.42 + level * 1.35, 0.44)
        for(let i = 0; i < 11; i++)
        {
            const color = ['#c9432b', '#dba02c', '#4b9b58', '#b87330', '#d8c66a'][(i + level) % 5]
            const jar = Kit.cylinder(rack, 0.18, 0.18, 0.42, 12, Kit.standard(color, { roughness: 0.45, emissive: color, emissiveIntensity: 0.16 }), -4.3 + i * 0.86, 1.55 + level * 1.35, 0)
            Kit.cylinder(rack, 0.2, 0.2, 0.07, 12, mats.brass, jar.position.x, 1.8 + level * 1.35, 0)
        }
    }
    world.markTree(rack, 'spice', { label: 'Spice rack', camera: 'spice', hint: stories.spice })

    for(let i = 0; i < 12; i++)
    {
        const x = -12.5 + i * 0.95
        const ladle = Kit.cylinder(world.group, 0.028, 0.028, 0.7, 8, mats.brass, x, 4.5, -2.2)
        ladle.rotation.z = (rand() - 0.5) * 0.12
        const bowl = Kit.sphere(world.group, 0.1, 8, mats.brass, x, 4.1, -2.2)
        bowl.scale.y = 0.45
    }
    Kit.box(world.group, 11.5, 0.12, 0.12, mats.steel, -7, 4.9, -2.2)

    const counter = Kit.box(world.group, 11.5, 1.1, 2.4, mats.steelDark, -7, 0.55, -2.2)
    world.mark(counter, 'counterTop', { label: 'Stainless worktop', hint: 'The heart of the kitchen' })
    const counterEdge = Kit.box(world.group, 11.7, 0.12, 2.55, mats.steel, -7, 1.14, -2.2)
    counterEdge.userData.decorative = true

    for(let i = 0; i < 4; i++)
    {
        const burnerX = -11.2 + i * 2.5
        const base = Kit.cylinder(world.group, 0.62, 0.68, 0.18, 20, mats.iron, burnerX, 1.27, -2.3)
        const ring = Kit.torus(world.group, 0.42, 0.045, 8, 20, mats.brass, burnerX, 1.4, -2.3)
        ring.rotation.x = Math.PI * 0.5
        const flame = Kit.cone(world.group, 0.26, 0.5, 10, mats.flame, burnerX, 1.62, -2.3)
        const core = Kit.cone(world.group, 0.12, 0.3, 8, mats.flameCore, burnerX, 1.55, -2.3)
        world.mark(base, 'burner', { label: 'Gas burner', hint: 'Four burners roaring all service' })
        world.animated.push((elapsed) =>
        {
            const pulse = 0.86 + Math.sin(elapsed * 0.012 + i * 1.8) * 0.18
            flame.scale.set(pulse, 0.9 + pulse * 0.2, pulse)
            core.scale.set(pulse * 0.9, 1 + pulse * 0.1, pulse * 0.9)
        })

        if(i < 3)
        {
            const pot = Kit.cylinder(world.group, 0.46, 0.42, 0.55, 18, mats.steel, burnerX, 1.85, -2.3)
            Kit.cylinder(world.group, 0.5, 0.5, 0.06, 18, mats.steelDark, burnerX, 2.14, -2.3)
            world.mark(pot, 'pot', { label: 'Cooking pot', hint: 'Something is always simmering' })
        }
    }
    world.light(-8.5, 2.4, -1.8, '#ff8a28', 1.6, 9, { flicker: true, essential: true })

    const kadhai = Kit.group(world.group, -7, 1.28, -1.7)
    const kadhaiBowl = Kit.sphere(kadhai, 0.68, 20, mats.iron, 0, 0.2, 0)
    kadhaiBowl.scale.y = 0.5
    Kit.torus(kadhai, 0.7, 0.06, 8, 24, mats.steel, 0, 0.38, 0).rotation.x = Math.PI * 0.5
    const kadhaiFire = Kit.cone(kadhai, 0.5, 0.6, 10, mats.flame, 0, -0.24, 0)
    const kadhaiCore = Kit.cone(kadhai, 0.24, 0.32, 8, mats.flameCore, 0, -0.3, 0)
    kadhaiFire.visible = false
    kadhaiCore.visible = false
    kadhai.userData.fire = kadhaiFire
    kadhai.userData.core = kadhaiCore
    world.mark(kadhaiBowl, 'cook', { label: 'Kadhai', camera: 'kitchen', hint: 'Start a dish with the chef' })
    world.cookingProps.kadhai = kadhai
    world.animated.push((elapsed) =>
    {
        const pulse = 0.88 + Math.sin(elapsed * 0.014) * 0.16
        kadhaiFire.scale.set(pulse, 1 + pulse * 0.18, pulse)
        kadhaiCore.scale.y = 1 + Math.sin(elapsed * 0.02) * 0.2
    })

    const tawa = Kit.group(world.group, -3.9, 1.34, -2.1)
    const tawaPlate = Kit.cylinder(tawa, 0.93, 0.93, 0.07, 28, mats.iron, 0, 0.1, 0)
    Kit.cylinder(tawa, 0.1, 0.1, 0.5, 10, mats.woodDark, 1.1, 0.1, 0).rotation.z = Math.PI * 0.5
    world.mark(tawaPlate, 'cook', { label: 'Tawa', camera: 'kitchen', hint: 'Rotis and parathas crisp here' })
    world.cookingProps.tawa = tawa

    const tandoor = Kit.group(world.group, -10.4, 0, 3.5)
    const clayBody = Kit.cylinder(tandoor, 0.82, 1.05, 1.9, 20, mats.clay, 0, 0.95, 0)
    const rim = Kit.torus(tandoor, 0.8, 0.13, 10, 24, mats.clayHot, 0, 1.9, 0)
    rim.rotation.x = Math.PI * 0.5
    const mouth = Kit.circle(tandoor, 0.68, 24, mats.ember, 0, 1.92, 0)
    mouth.rotation.x = -Math.PI * 0.5
    Kit.cylinder(tandoor, 0.9, 0.9, 0.22, 20, mats.mud || mats.woodDark, 0, 0.12, 0)
    const naan = Kit.sphere(tandoor, 0.5, 16, mats.mustard, 0, 2.05, 0)
    naan.scale.set(1, 0.16, 1.1)
    naan.visible = true
    tandoor.userData.naan = naan
    tandoor.userData.fire = mouth
    const tandoorLight = world.light(-10.4, 2.2, 3.5, '#ff5f14', 2.6, 10, { flicker: true, essential: true })
    tandoor.userData.light = tandoorLight
    world.tandoor = tandoor
    world.mark(clayBody, 'tandoor', { label: 'Tandoor', camera: 'tandoor', hint: 'Touch the clay oven to feed the fire' })
    world.mark(rim, 'tandoor', { label: 'Tandoor rim', camera: 'tandoor' })
    world.mark(mouth, 'tandoor', { label: 'Tandoor coals', camera: 'tandoor' })
    world.mark(naan, 'tandoor', { label: 'Fresh naan', camera: 'tandoor', hint: stories.naan })

    for(let i = 0; i < 3; i++)
    {
        const plank = Kit.box(world.detailGroup, 0.7, 0.06, 0.42, mats.woodLight, -12.8 + i * 0.9, 1.22, -3.1)
        plank.rotation.y = rand() * 0.4
        const dough = Kit.sphere(world.detailGroup, 0.22, 10, mats.cream, plank.position.x, 1.33, plank.position.z)
        dough.scale.y = 0.45
    }

    const chaiStation = Kit.group(world.group, 9.2, 0, 3.4)
    Kit.box(chaiStation, 4.4, 1.25, 1.8, mats.woodDark, 0, 0.62, 0)
    Kit.box(chaiStation, 4.6, 0.12, 1.95, mats.steel, 0, 1.28, 0)
    const kettle = Kit.group(chaiStation, -1.15, 1.45, 0)
    Kit.cylinder(kettle, 0.42, 0.48, 0.7, 20, mats.brass, 0, 0.08, 0)
    Kit.cylinder(kettle, 0.44, 0.44, 0.06, 20, mats.copper, 0, 0.46, 0)
    Kit.sphere(kettle, 0.12, 10, mats.copper, 0, 0.57, 0)
    const spout = Kit.cylinder(kettle, 0.07, 0.12, 0.68, 10, mats.brass, 0.5, 0.2, 0)
    spout.rotation.z = -0.8
    Kit.torus(kettle, 0.32, 0.045, 8, 20, mats.copper, -0.48, 0.12, 0).rotation.y = Math.PI * 0.5
    world.mark(kettle.children[0], 'chaiPour', { label: 'Chai kettle', camera: 'chai', hint: 'Tap to pour a glass of masala chai' })
    world.chaiKettle = kettle
    world.cookingProps.chai = chaiStation

    const glass = Kit.group(chaiStation, 0.8, 1.35, 0.15)
    const glassMesh = Kit.cylinder(glass, 0.15, 0.12, 0.3, 14, mats.glass, 0, 0, 0)
    const fill = Kit.cylinder(glass, 0.13, 0.11, 0.2, 14, mats.chai, 0, -0.04, 0)
    glass.userData.fill = fill
    world.mark(glassMesh, 'chai', { label: 'Masala chai', camera: 'chai', hint: 'A glass of burning hot chai' })
    world.chaiGlass = glass

    for(let i = 0; i < 4; i++)
    {
        const cup = Kit.cylinder(chaiStation, 0.14, 0.1, 0.26, 14, mats.cream, -0.1 + i * 0.42, 1.44, -0.52)
        world.mark(cup, 'chai', { label: 'Chai glass', camera: 'chai' })
    }

    for(let i = 0; i < 3; i++)
    {
        const can = Kit.cylinder(world.detailGroup, 0.2, 0.2, 0.55, 12, mats.oil, 6.5 + i * 0.5, 1.55 + (i % 2) * 0.1, -1.5)
        world.mark(can, 'oil', { label: 'Mustard oil', hint: 'The golden oil that makes it desi' })
    }

    const fridge1 = Kit.box(world.group, 1.5, 2.5, 1.1, mats.fridge, 14.2, 1.25, -2.4)
    const fridge2 = Kit.box(world.group, 1.5, 2.5, 1.1, mats.fridge, -14.1, 1.25, -2.4)
    world.mark(fridge1, 'fridge', { label: 'Cold drink fridge', hint: 'Ice cold and always humming' })
    world.mark(fridge2, 'fridge', { label: 'Cold drink fridge' })
    world.light(14, 2.2, -1.2, '#7ecbff', 0.8, 6)
    world.light(-14, 2.2, -1.2, '#7ecbff', 0.8, 6)

    const pump = Kit.group(world.group, 4.9, 0, 5.4)
    Kit.cylinder(pump, 0.42, 0.48, 0.3, 14, mats.steelDark, 0, 0.15, 0)
    Kit.cylinder(pump, 0.11, 0.13, 1.5, 12, mats.steel, 0, 0.95, 0)
    Kit.box(pump, 0.9, 0.12, 0.14, mats.iron, -0.3, 1.62, 0)
    Kit.cylinder(pump, 0.08, 0.08, 0.45, 10, mats.steel, 0.45, 1.35, 0).rotation.z = Math.PI * 0.5
    Kit.box(pump, 0.6, 0.1, 0.5, mats.steelDark, 0.45, 0.55, 0.1)
    world.markTree(pump, 'water', { label: 'Handpump', hint: 'Pump a fresh glass of water' })
    world.handpump = pump

    const vegCrates = Kit.group(world.group, 11.4, 0, -6.6)
    const vegColors = [mats.tomato, mats.onion, mats.chilli, mats.potato]
    const vegNames = ['Tomatoes', 'Onions', 'Green chillies', 'Potatoes']
    for(let i = 0; i < 4; i++)
    {
        const crate = Kit.group(vegCrates, -2.1 + i * 1.4, 0, 0)
        Kit.box(crate, 1.2, 0.35, 0.9, mats.wood, 0, 0.18, 0)
        for(let j = 0; j < 9; j++)
        {
            const veg = Kit.sphere(crate, 0.15 + rand() * 0.06, 8, vegColors[i], -0.4 + (j % 3) * 0.4, 0.42 + Math.floor(j / 3) * 0.12, -0.25 + Math.floor(j / 3) * 0.24)
            veg.scale.y = i === 2 ? 1.8 : 0.8
        }
        world.mark(crate.children[crate.children.length - 1], 'veg', { label: vegNames[i], camera: 'prep', hint: stories.vegetable, vegName: vegNames[i] })
    }
    world.vegCrates = vegCrates

    for(let i = 0; i < 6; i++)
    {
        const jar = Kit.group(world.detailGroup, -4.5 + i * 1.2, 1.35, -3.2)
        Kit.cylinder(jar, 0.18, 0.18, 0.44, 12, mats.glass, 0, 0, 0)
        Kit.cylinder(jar, 0.16, 0.16, 0.25, 12, i % 2 ? mats.orange : mats.red, 0, -0.05, 0)
        Kit.cylinder(jar, 0.2, 0.2, 0.06, 12, mats.brass, 0, 0.26, 0)
        world.markTree(jar, 'spice', { label: 'Spice jar', camera: 'spice', hint: stories.spice })
    }

    const waterTank = Kit.cylinder(world.group, 1.1, 1.1, 1.6, 16, mats.plasticBlue, -13.5, 8.8, -9)
    world.mark(waterTank, 'water', { label: 'Overhead water tank', hint: 'Water for a thousand chais' })
    Kit.box(world.group, 0.12, 1.4, 0.12, mats.iron, -13.5, 7.6, -9)
    Kit.box(world.group, 0.12, 1.4, 0.12, mats.iron, -12.2, 7.6, -9)

    world.light(9.4, 3.1, 4.2, '#ffbe5c', 2.1, 11, { flicker: true, essential: true })
    world.light(-10.4, 3.2, 4.6, '#ff7324', 1.6, 10, { flicker: true, essential: true })

    for(let i = 0; i < 7; i++)
    {
        const plate = Kit.cylinder(world.detailGroup, 0.24, 0.22, 0.03, 16, mats.steel, -13.6 + i * 0.42, 1.22, 0.1)
        world.mark(plate, 'plate', { label: 'Steel plate', hint: 'Clean plates stacked for the next table' })
    }
}
