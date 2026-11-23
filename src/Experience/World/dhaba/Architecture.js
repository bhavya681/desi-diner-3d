import * as THREE from 'three'
import * as Kit from './Kit.js'

export function buildArchitecture(world)
{
    const mats = world.palette.mats
    const rand = Kit.seeded(9081)

    const floor = Kit.box(world.group, 34, 0.16, 18, mats.stone, 0, -0.08, -5.5)
    floor.userData.base = true

    const backWall = Kit.box(world.group, 32, 7.6, 0.5, mats.brick, 0, 3.8, -13.7)
    const leftWall = Kit.box(world.group, 0.5, 7.6, 16, mats.plaster, -15.8, 3.8, -5.7)
    const rightWall = Kit.box(world.group, 0.5, 7.6, 16, mats.plaster, 15.8, 3.8, -5.7)
    backWall.receiveShadow = true
    leftWall.receiveShadow = true
    rightWall.receiveShadow = true

    for(let i = 0; i < 16; i++)
    {
        const x = -15 + i * 2
        Kit.box(world.detailGroup, 0.06, 7.5, 0.05, mats.woodDark, x, 3.8, -13.42)
    }

    const pillarPositions = [-15.4, -7.8, 0, 7.8, 15.4]
    pillarPositions.forEach((x, index) =>
    {
        const pillar = Kit.box(world.group, 0.85, 7.7, 0.9, index % 2 ? mats.brick : mats.plaster, x, 3.85, 1.9)
        Kit.box(world.group, 1.15, 0.35, 1.2, mats.woodDark, x, 0.2, 1.9)
        Kit.box(world.group, 1.1, 0.3, 1.15, mats.wood, x, 7.35, 1.9)
        world.mark(pillar, 'post', { label: 'Painted pillar', hint: 'Hand-painted pillars hold up the roof' })
    })

    Kit.box(world.group, 7.3, 4.6, 0.4, mats.brick, -11.55, 2.3, 1.95)
    Kit.box(world.group, 7.3, 4.6, 0.4, mats.brick, 11.55, 2.3, 1.95)
    Kit.box(world.group, 7.2, 0.35, 0.55, mats.woodDark, -11.55, 4.7, 2.05)
    Kit.box(world.group, 7.2, 0.35, 0.55, mats.woodDark, 11.55, 4.7, 2.05)

    for(let i = 0; i < 8; i++)
    {
        const x = -14.6 + i * 0.85
        Kit.box(world.detailGroup, 0.5, 1.9, 0.08, mats.woodDark, x, 2.7, 2.2)
        Kit.box(world.detailGroup, 0.5, 1.9, 0.08, mats.woodDark, -x, 2.7, 2.2)
    }

    Kit.box(world.group, 32.6, 0.45, 17, mats.roof, 0, 7.85, -5.6)
    const roofTrim = Kit.box(world.group, 33, 0.35, 0.5, mats.red, 0, 7.5, 2.25)
    world.mark(roofTrim, 'post', { label: 'Dhaba facade' })

    for(let i = 0; i < 9; i++)
    {
        const z = -12 + i * 2
        Kit.box(world.group, 32, 0.4, 0.42, mats.woodDark, 0, 7.25, z)
        Kit.box(world.detailGroup, 0.35, 0.5, 16, mats.wood, -10 + i * 2.5, 7.05, -5.5)
    }

    for(let i = 0; i < 6; i++)
    {
        const x = -13 + i * 5.2
        Kit.box(world.group, 0.5, 0.45, 2.6, mats.woodDark, x, 7.15, 3.15)
        world.addBulb(x, 6.85, 4.2, i % 3 === 0 ? 'red' : i % 3 === 1 ? 'warm' : 'green', { radius: 0.11, halo: 1.4 })
    }

    const awning = Kit.plane(world.group, 32, 4.6, mats.tarp, 0, 5.55, 3.7)
    awning.rotation.x = -Math.PI * 0.5 + 0.16
    const awningEdge = Kit.box(world.group, 32, 0.2, 0.2, mats.woodDark, 0, 4.2, 4.6)
    world.mark(awningEdge, 'post', { label: 'Striped tarpaulin' })

    for(let i = 0; i < 11; i++)
    {
        const x = -15 + i * 3
        Kit.box(world.detailGroup, 0.05, 0.14, 0.05, mats.iron, x, 7.3, 3.3)
    }

    const signFrame = Kit.box(world.group, 12.6, 3.4, 0.35, mats.charcoal, 0, 6.25, 2.55)
    const signGlowBack = Kit.box(world.group, 12.9, 3.65, 0.12, mats.mustard, 0, 6.25, 2.4)
    const sign = Kit.plane(world.group, 12.2, 3.05, mats.sign, 0, 6.25, 2.76)
    world.mark(sign, 'sign', { label: 'Sardar Ji Dhaba sign', camera: 'entrance', hint: 'The sign has welcomed drivers for 30 years' })
    world.mark(signFrame, 'sign', { label: 'Main signboard', camera: 'entrance' })
    signGlowBack.userData.decorative = true

    world.signLight = world.light(0, 6.3, 4.2, '#ffb452', 2.4, 16, { flicker: true, essential: true })
    world.light(8, 5.6, 4.4, '#ff5a35', 1.1, 12, { flicker: true })

    const neonFrame = Kit.box(world.group, 6.2, 2.3, 0.25, mats.charcoal, 9.6, 5.4, 2.4)
    const neon = Kit.plane(world.group, 6, 2.1, mats.neonRed, 9.6, 5.4, 2.56)
    world.mark(neon, 'neon', { label: 'Neon sign', hint: 'CHAI • TANDOOR • KHANA 24x7' })
    world.mark(neonFrame, 'neon', { label: 'Neon sign frame' })

    const menuFrame = Kit.box(world.group, 3.3, 4.6, 0.22, mats.woodDark, -5.6, 3.4, 1.95)
    const menu = Kit.plane(world.group, 3.05, 4.35, mats.menu, -5.6, 3.4, 2.08)
    world.mark(menu, 'menu', { label: 'Menu board', camera: 'menu', hint: 'Tap to open the full menu' })
    world.mark(menuFrame, 'menu', { label: 'Menu board', camera: 'menu' })
    world.menuBoard = menu

    const chaiBoard = Kit.plane(world.group, 2.1, 0.66, mats.chaiLabel, 5.6, 3.2, 2.08)
    world.mark(chaiBoard, 'chaiSign', { label: 'Chai counter sign', camera: 'chai' })

    for(let i = 0; i < 4; i++)
    {
        const posterTextures = [mats.posterBollywood, mats.posterCricket, mats.posterFood, mats.posterBus]
        const x = [-13.6, -10.8, 12.2, 14.6][i]
        const frame = Kit.box(world.group, 2.25, 3.25, 0.16, mats.woodDark, x, 3.8, 2.22)
        const poster = Kit.plane(world.group, 2.05, 3.05, posterTextures[i], x, 3.8, 2.32)
        world.mark(poster, 'poster', { label: 'Painted poster', hint: 'A hand-painted memory from the highway' })
        world.mark(frame, 'poster', { label: 'Poster frame' })
    }

    const gateZ = 7.4
    ;[-7.2, 7.2].forEach((x) =>
    {
        Kit.box(world.group, 1.1, 6.4, 1.1, mats.brick, x, 3.2, gateZ)
        Kit.box(world.group, 1.5, 0.4, 1.5, mats.mustard, x, 6.45, gateZ)
        Kit.sphere(world.group, 0.28, 10, mats.mustard, x, 6.9, gateZ)
    })
    const gateArch = Kit.plane(world.group, 15.2, 2.2, mats.tarp, 0, 6.1, gateZ)
    gateArch.rotation.x = -Math.PI * 0.5 + 0.22
    world.addBulb(-6.4, 6.3, gateZ, 'red', { halo: 1.8 })
    world.addBulb(0, 6.2, gateZ, 'warm', { halo: 1.8 })
    world.addBulb(6.4, 6.3, gateZ, 'green', { halo: 1.8 })

    const gateSign = Kit.box(world.group, 8.2, 1.1, 0.2, mats.charcoal, 0, 6.9, gateZ + 0.6)
    const gateSignFace = Kit.plane(world.group, 8, 0.95, mats.horn, 0, 6.9, gateZ + 0.72)
    world.mark(gateSignFace, 'sign', { label: 'Gate sign', camera: 'entrance' })
    gateSign.userData.decorative = true

    Kit.box(world.group, 32, 0.16, 2.2, mats.gravel, 0, -0.02, 3.3)

    for(let i = 0; i < 5; i++)
    {
        const x = -12 + i * 6
        Kit.cylinder(world.group, 0.22, 0.26, 0.5, 10, mats.clay, x, 0.25, -12.2)
        Kit.sphere(world.group, 0.35, 8, mats.green, x, 0.75, -12.2)
    }

    const storageShelf = Kit.group(world.group, -12.6, 0, -10.2)
    for(let level = 0; level < 3; level++)
    {
        Kit.box(storageShelf, 4.6, 0.14, 1.1, mats.woodDark, 0, 0.9 + level * 1.1, 0)
        for(let i = 0; i < 6; i++)
        {
            const sack = Kit.sphere(storageShelf, 0.28 + rand() * 0.12, 8, level % 2 ? mats.cream : mats.potato, -1.9 + i * 0.75, 1.25 + level * 1.1, 0)
            sack.scale.set(1, 0.65, 0.8)
        }
    }
    world.markTree(storageShelf, 'storage', { label: 'Rice and flour sacks', camera: 'prep', hint: 'Sacks stacked to the ceiling' })

    for(let i = 0; i < 8; i++)
    {
        const sack = Kit.sphere(world.group, 0.42 + rand() * 0.14, 8, i % 2 ? mats.cream : mats.potato, -14.4 + (i % 4) * 0.85, 0.35 + Math.floor(i / 4) * 0.7, -7 + Math.floor(i / 4) * 0.5)
        sack.scale.set(1, 0.55, 0.85)
        Kit.box(world.detailGroup, 0.32, 0.08, 0.02, mats.red, sack.position.x, sack.position.y + 0.24, sack.position.z + 0.38)
    }

    const prepCounter = Kit.box(world.group, 5.4, 0.22, 1.6, mats.steelDark, 11.4, 1.15, -9.6)
    world.mark(prepCounter, 'veg', { label: 'Vegetable prep table', camera: 'prep', hint: 'Everything here gets chopped by hand' })
    for(let i = 0; i < 4; i++)
    {
        Kit.box(world.group, 0.16, 1.1, 0.16, mats.iron, 9.1 + i * 1.5, 0.55, -10.2)
    }

    world.addBulb(-12, 6.3, -7, 'warm', { halo: 2.2 })
    world.addBulb(0, 6.3, -7, 'warm', { halo: 2.2 })
    world.addBulb(12, 6.3, -7, 'warm', { halo: 2.2 })
    world.light(0, 5.2, -6, '#ffca80', 1.2, 20, { flicker: true, essential: true })

    for(let i = 0; i < 8; i++)
    {
        const cable = Kit.pipe(world.detailGroup, [
            [-14 + i * 4, 7.2, -4],
            [-13.4 + i * 4, 6.7, -1],
            [-12.6 + i * 4, 6.9, 2]
        ], 0.018, mats.iron, 12)
        cable.userData.decorative = true
    }

    const clock = Kit.cylinder(world.group, 0.42, 0.42, 0.1, 24, mats.woodDark, -2.2, 5.6, 2.16)
    clock.rotation.x = Math.PI * 0.5
    const clockFace = Kit.circle(world.group, 0.35, 24, mats.cream, -2.2, 5.6, 2.23)
    const clockHand = Kit.box(world.group, 0.03, 0.26, 0.02, mats.charcoal, -2.2, 5.72, 2.25)
    world.mark(clockFace, 'clock', { label: 'Wall clock', hint: 'Always truck time at the dhaba' })
    world.animated.push((elapsed) => { clockHand.rotation.z = -elapsed * 0.00016 })
}
