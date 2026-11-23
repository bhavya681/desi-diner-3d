import * as THREE from 'three'
import * as Kit from './Kit.js'
import { makeDish } from './Dishes.js'
import { dishes, dishById, stories } from './data.js'

export function buildDining(world)
{
    const mats = world.palette.mats
    const rand = Kit.seeded(6123)

    const display = Kit.group(world.group, 0, 0, 4.2)
    Kit.box(display, 10.4, 1.15, 2.5, mats.woodDark, 0, 0.58, 0)
    Kit.box(display, 10.6, 0.12, 2.65, mats.steel, 0, 1.2, 0)
    Kit.box(display, 10.6, 0.08, 0.1, mats.brass, 0, 1.15, 1.35)
    world.mark(display.children[0], 'displayCounter', { label: 'Food display', camera: 'display', hint: 'Every dish is clickable' })

    for(const side of [-5.2, 5.2])
    {
        Kit.cylinder(display, 0.05, 0.05, 1.8, 8, mats.iron, side, 2.15, -1.15)
        Kit.cylinder(display, 0.05, 0.05, 1.8, 8, mats.iron, side, 2.15, 1.15)
    }
    Kit.box(display, 10.6, 0.1, 2.5, mats.iron, 0, 3.05, 0)
    const glassCanopy = Kit.box(display, 10.4, 0.02, 2.4, mats.glass, 0, 2.96, 0)
    glassCanopy.userData.decorative = true

    const positions = []
    for(let row = 0; row < 2; row++)
    {
        for(let column = 0; column < 8; column++)
        {
            positions.push([-4.45 + column * 1.27, 1.28, -0.62 + row * 1.24])
        }
    }
    dishes.forEach((dish, index) =>
    {
        const position = positions[index % positions.length]
        makeDish(world, dish, position[0], position[1], position[2], dish.type === 'drink' ? 0.9 : 1)
    })

    world.light(-3, 3.4, 4.6, '#ffd394', 1.8, 11, { flicker: true, essential: true })
    world.light(3, 3.4, 4.6, '#ffd394', 1.8, 11, { flicker: true, essential: true })

    const boards = [
        { text: 'BUTTER CHICKEN  ₹320', x: -3.4 },
        { text: 'DAL MAKHANI  ₹220', x: -1.1 },
        { text: 'PANEER TIKKA  ₹260', x: 1.2 },
        { text: 'DUM BIRYANI  ₹340', x: 3.5 }
    ]
    boards.forEach((board) =>
    {
        const texture = Kit.canvasTexture(`price:${board.text}`, 512, 96, (context, width, height) =>
        {
            context.fillStyle = '#160c08'
            context.fillRect(0, 0, width, height)
            context.strokeStyle = '#e9a521'
            context.lineWidth = 6
            context.strokeRect(4, 4, width - 8, height - 8)
            context.fillStyle = '#ffd879'
            context.font = '900 40px Arial Black, Arial, sans-serif'
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.fillText(board.text, width / 2, height / 2)
        })
        const sign = Kit.plane(display, 2.2, 0.42, Kit.basic('#ffffff', { map: texture }), board.x, 2.5, 1.32)
        world.mark(sign, 'dishLabel', { label: board.text, camera: 'display' })
    })

    const tablePositions = [[4.5, -9], [9.5, -9], [4.5, -5], [9.5, -5], [4.5, -1.2], [9.5, -1.2]]
    tablePositions.forEach((position, index) =>
    {
        const table = Kit.group(world.group, position[0], 0, position[1])
        Kit.box(table, 2.4, 0.14, 1.3, mats.woodLight, 0, 0.95, 0)
        for(let i = 0; i < 4; i++)
        {
            Kit.box(table, 0.12, 0.9, 0.12, mats.woodDark, i % 2 ? 1 : -1, 0.45, i < 2 ? 0.5 : -0.5)
        }
        world.mark(table.children[0], 'table', { label: 'Wooden dining table', camera: 'dining', hint: 'Sit for a while — the chai is endless' })

        for(let i = 0; i < 2; i++)
        {
            const stool = Kit.group(table, i ? 1.9 : -1.9, 0, 0)
            Kit.cylinder(stool, 0.28, 0.28, 0.1, 12, i ? mats.plasticBlue : mats.plasticRed, 0, 0.48, 0)
            for(let j = 0; j < 3; j++)
            {
                Kit.cylinder(stool, 0.03, 0.03, 0.48, 6, mats.iron, Math.cos(j * 2.1) * 0.2, 0.24, Math.sin(j * 2.1) * 0.2)
            }
            world.mark(stool.children[0], 'stool', { label: 'Plastic stool', camera: 'dining' })
        }

        const plate = Kit.cylinder(table, 0.25, 0.22, 0.03, 18, mats.steel, -0.45, 1.04, 0)
        const glass = Kit.cylinder(table, 0.1, 0.09, 0.22, 12, mats.glass, 0.2, 1.13, 0.2)
        const bottle = Kit.cylinder(table, 0.08, 0.09, 0.35, 10, mats.plasticGreen, 0.7, 1.22, -0.3)
        world.mark(plate, 'plate', { label: 'Steel thali', camera: 'dining' })
        world.mark(glass, 'glass', { label: 'Water glass', camera: 'dining' })
        world.mark(bottle, 'bottle', { label: 'Cold drink bottle', camera: 'dining' })

        if(index % 2 === 0)
        {
            world.atmosphere.addSteamSource(new THREE.Vector3(position[0] - 0.45, 1.1, position[1]), 0.7, '#fff1d8', 0.16)
        }
    })

    const fanPositions = [[3, 6.5, -6], [10, 6.5, -6], [0, 6.4, 5.8], [8, 6.4, 7.6]]
    fanPositions.forEach((position, index) =>
    {
        const fan = Kit.group(world.group, position[0], position[1], position[2])
        Kit.cylinder(fan, 0.22, 0.22, 0.28, 12, mats.iron, 0, 0, 0)
        Kit.cylinder(fan, 0.05, 0.05, 0.9, 8, mats.steelDark, 0, -0.5, 0)
        for(let i = 0; i < 4; i++)
        {
            const blade = Kit.box(fan, 1.5, 0.05, 0.24, mats.woodLight, 0.85, -0.95, 0)
            blade.rotation.y = i * Math.PI * 0.5
            blade.position.set(Math.cos(i * Math.PI * 0.5) * 0.85, -0.95, Math.sin(i * Math.PI * 0.5) * 0.85)
            blade.rotation.y = i * Math.PI * 0.5 + 0.2
        }
        fan.userData.speed = index === 3 ? 0.4 : 1
        world.fans.push(fan)
        const switchboard = Kit.box(world.detailGroup, 0.36, 0.5, 0.08, mats.cream, position[0] + 1.2, 2.6, position[2] > 2 ? 2.2 : -13.3)
        world.mark(switchboard, 'fanSwitch', { label: 'Ceiling fan switch', hint: stories.fan, fanIndex: index })
        world.mark(fan.children[0], 'fan', { label: 'Ceiling fan', hint: stories.fan, fanIndex: index })
    })

    const charpaiPositions = [[-12, 8.8], [-5.5, 10.2], [3.5, 10.4], [11.2, 8.6]]
    charpaiPositions.forEach((position, index) =>
    {
        const charpai = Kit.group(world.group, position[0], 0, position[1])
        charpai.rotation.y = (rand() - 0.5) * 0.35
        for(let i = 0; i < 4; i++)
        {
            const legX = i % 2 ? 1.05 : -1.05
            const legZ = i < 2 ? 0.65 : -0.65
            Kit.cylinder(charpai, 0.07, 0.09, 0.55, 8, mats.woodDark, legX, 0.27, legZ)
        }
        Kit.box(charpai, 2.3, 0.12, 0.13, mats.wood, 0, 0.58, 0.68)
        Kit.box(charpai, 2.3, 0.12, 0.13, mats.wood, 0, 0.58, -0.68)
        Kit.box(charpai, 0.13, 0.12, 1.35, mats.wood, -1.1, 0.58, 0)
        Kit.box(charpai, 0.13, 0.12, 1.35, mats.wood, 1.1, 0.58, 0)
        const ropeBed = Kit.box(charpai, 2.1, 0.05, 1.22, mats.cloth, 0, 0.62, 0)
        for(let i = 0; i < 10; i++)
        {
            Kit.box(world.detailGroup, 0.02, 0.012, 1.2, mats.cream, position[0] - 0.95 + i * 0.21, 0.655, position[1])
        }
        world.mark(ropeBed, 'charpai', { label: 'Charpai', camera: 'outdoor', hint: stories.charpai, index })

        const pillow = Kit.sphere(charpai, 0.3, 10, index % 2 ? mats.cream : mats.mustard, -0.65, 0.75, 0)
        pillow.scale.set(1.2, 0.35, 0.8)
        if(index % 2 === 0)
        {
            const chai = Kit.cylinder(charpai, 0.1, 0.08, 0.16, 12, mats.cream, 0.6, 0.73, 0.2)
            world.mark(chai, 'chai', { label: 'Chai on the charpai', camera: 'outdoor' })
        }
    })

    const outdoorTables = [[-9, 5.9], [0, 7.4], [8, 6.2]]
    outdoorTables.forEach((position) =>
    {
        const table = Kit.group(world.group, position[0], 0, position[1])
        Kit.cylinder(table, 0.85, 0.85, 0.1, 20, mats.woodLight, 0, 0.92, 0)
        Kit.cylinder(table, 0.1, 0.14, 0.9, 10, mats.iron, 0, 0.45, 0)
        for(let i = 0; i < 3; i++)
        {
            const angle = i * Math.PI * 2 / 3
            const chair = Kit.group(table, Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5)
            const color = [mats.plasticRed, mats.plasticBlue, mats.plasticGreen][i]
            Kit.box(chair, 0.55, 0.08, 0.55, color, 0, 0.45, 0)
            Kit.box(chair, 0.55, 0.6, 0.08, color, 0, 0.75, -0.25)
            for(let j = 0; j < 4; j++)
            {
                Kit.cylinder(chair, 0.025, 0.025, 0.45, 6, mats.iron, j % 2 ? 0.22 : -0.22, 0.22, j < 2 ? 0.22 : -0.22)
            }
            world.mark(chair.children[0], 'chair', { label: 'Plastic chair', camera: 'outdoor', hint: 'Every chair has heard a good story' })
        }
        const plate = Kit.cylinder(table, 0.22, 0.2, 0.03, 16, mats.steel, 0.2, 1, 0.1)
        world.mark(plate, 'plate', { label: 'Steel plate', camera: 'outdoor' })
    })

    for(let i = 0; i < 5; i++)
    {
        const x = -14.5 + i * 7.2
        Kit.cylinder(world.group, 0.09, 0.12, 4.2, 8, mats.woodDark, x, 2.1, 12.4)
        Kit.box(world.group, 0.5, 0.12, 0.5, mats.wood, x, 4.15, 12.4)
    }

    const bulbRows = [-14, -6, 2, 10]
    bulbRows.forEach((startX, row) =>
    {
        for(let i = 0; i < 7; i++)
        {
            const x = startX + i * 1.28
            const y = 4.15 + Math.sin((i / 6) * Math.PI) * -0.55
            world.addBulb(x, y, row % 2 ? 11.4 : 6.8, i % 4 === 0 ? 'red' : i % 4 === 2 ? 'green' : 'warm', { radius: 0.1, halo: 1.2 })
        }
    })

    const cash = Kit.group(world.group, 13.6, 0, 3.2)
    Kit.box(cash, 3.6, 1.25, 1.3, mats.woodDark, 0, 0.62, 0)
    Kit.box(cash, 3.8, 0.12, 1.5, mats.woodLight, 0, 1.28, 0)
    const register = Kit.box(cash, 0.8, 0.55, 0.6, mats.iron, -1, 1.6, 0)
    const registerScreen = Kit.box(cash, 0.6, 0.25, 0.05, mats.greenBright, -1, 1.75, 0.32)
    world.mark(register, 'cash', { label: 'Cash counter', camera: 'cash', hint: 'Tap to see your bill' })
    world.mark(registerScreen, 'cash', { label: 'Billing machine', camera: 'cash' })
    world.cashRegister = register

    const radio = Kit.group(world.group, 12.4, 1.5, 2.6)
    Kit.box(radio, 0.8, 0.5, 0.38, mats.wood, 0, 0, 0)
    Kit.cylinder(radio, 0.15, 0.15, 0.04, 16, mats.charcoal, -0.2, 0.02, 0.21).rotation.x = Math.PI * 0.5
    Kit.cylinder(radio, 0.15, 0.15, 0.04, 16, mats.charcoal, 0.2, 0.02, 0.21).rotation.x = Math.PI * 0.5
    Kit.box(radio, 0.2, 0.04, 0.04, mats.brass, 0.05, -0.18, 0.22)
    const radioAntenna = Kit.cylinder(radio, 0.012, 0.012, 0.9, 6, mats.steel, 0.35, 0.65, 0)
    radioAntenna.rotation.z = -0.18
    world.markTree(radio, 'radio', { label: 'Old radio', camera: 'cash', hint: stories.radio })
    world.radio = radio
    world.radioLight = world.light(12.4, 2.4, 3, '#5be08a', 0.5, 5, { visible: false })

    for(let i = 0; i < 8; i++)
    {
        const bin = Kit.cylinder(world.detailGroup, 0.24, 0.2, 0.5, 12, i % 2 ? mats.plasticBlue : mats.plasticGreen, -14 + i * 4, 0.25, 11.6)
        world.mark(bin, 'bin', { label: 'Dustbin', hint: 'Keep the dhaba clean' })
    }

    for(let i = 0; i < 10; i++)
    {
        const x = -16 + i * 3.6
        const pot = Kit.cylinder(world.detailGroup, 0.28, 0.21, 0.4, 10, mats.clay, x, 0.2, 12.9)
        const plant = Kit.sphere(world.detailGroup, 0.35, 8, mats.chilli, x, 0.7, 12.9)
        plant.scale.set(0.8, 1.3, 0.8)
        for(let j = 0; j < 3; j++)
        {
            const leaf = Kit.sphere(world.detailGroup, 0.16, 8, mats.green, x + Math.cos(j * 2) * 0.25, 0.95 + j * 0.1, 12.9 + Math.sin(j * 2) * 0.2)
            leaf.scale.set(1.4, 0.3, 0.7)
        }
        world.mark(pot, 'plant', { label: 'Roadside plant', hint: 'Even the plants survive the highway dust' })
    }

    const newspaper = Kit.box(world.detailGroup, 0.6, 0.02, 0.42, mats.cream, 1.2, 0.99, 7.4)
    newspaper.rotation.y = 0.3
    world.mark(newspaper, 'newspaper', { label: 'Old newspaper', hint: 'Cricket scores and yesterday’s news' })

    for(let i = 0; i < 6; i++)
    {
        const bottle = Kit.cylinder(world.detailGroup, 0.06, 0.07, 0.26, 8, i % 2 ? mats.glass : mats.plasticGreen, -10 + i * 2.4, 0.14, 12.1)
        bottle.rotation.z = i % 3 === 0 ? Math.PI * 0.5 : 0
        world.mark(bottle, 'bottle', { label: 'Empty bottle', hint: 'Someone left this behind last night' })
    }

    const flagColors = [mats.mustard, mats.redBright, mats.greenBright]
    for(let i = 0; i < 12; i++)
    {
        const flag = Kit.plane(world.group, 0.45, 0.3, flagColors[i % 3], -14 + i * 2.6, 5.7 + Math.sin(i) * 0.2, 2.6)
        flag.rotation.y = 0.3
        world.animated.push((elapsed) => { flag.rotation.z = Math.sin(elapsed * 0.002 + i) * 0.22 })
    }

    world.light(13.6, 3.4, 4.5, '#ffbe62', 1.3, 9, { flicker: true })
    world.light(0, 5.2, 9.5, '#ffa847', 0.9, 18, { essential: true })
}
