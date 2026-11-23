import * as THREE from 'three'
import * as Kit from './Kit.js'

export function makeDish(world, dish, x, y, z, scale = 1)
{
    const mats = world.palette.mats
    const root = Kit.group(world.group, x, y, z)
    root.scale.setScalar(scale)

    const plateMaterial = dish.type === 'drink' ? mats.glass : dish.type === 'bread' ? mats.steel : mats.cream
    const plate = dish.type === 'drink'
        ? Kit.cylinder(root, 0.19, 0.15, 0.34, 16, plateMaterial, 0, 0.17, 0)
        : Kit.cylinder(root, 0.39, 0.34, 0.06, 24, plateMaterial, 0, 0.04, 0)

    if(dish.type !== 'drink')
    {
        Kit.torus(root, 0.36, 0.025, 8, 24, dish.type === 'bread' ? mats.steelDark : mats.mustard, 0, 0.075, 0).rotation.x = Math.PI * 0.5
    }

    const foodMaterial = Kit.standard(dish.color, { roughness: 0.62, emissive: dish.color, emissiveIntensity: 0.18 })
    const garnishGreen = mats.greenBright
    const garnishRed = mats.redBright

    if(dish.type === 'curry')
    {
        const bowl = Kit.cylinder(root, 0.31, 0.24, 0.19, 20, mats.steel, 0, 0.17, 0)
        const curry = Kit.cylinder(root, 0.28, 0.26, 0.05, 20, foodMaterial, 0, 0.27, 0)
        for(let i = 0; i < 5; i++)
        {
            const piece = Kit.sphere(root, 0.075, 8, i % 2 ? foodMaterial : mats.orange, -0.15 + i * 0.075, 0.31, Math.sin(i * 2) * 0.1)
            piece.scale.set(1, 0.7, 1)
        }
        Kit.sphere(root, 0.05, 8, garnishGreen, 0.12, 0.32, 0.1)
        Kit.sphere(root, 0.04, 8, garnishRed, -0.1, 0.32, -0.08)
        bowl.userData.decorative = true
        curry.userData.decorative = true
    }
    else if(dish.type === 'tikka')
    {
        for(let i = 0; i < 4; i++)
        {
            const cube = Kit.box(root, 0.17, 0.17, 0.17, i % 2 ? foodMaterial : mats.mustard, -0.26 + i * 0.17, 0.19 + (i % 2) * 0.03, 0)
            cube.rotation.y = 0.3
        }
        const skewer = Kit.cylinder(root, 0.016, 0.016, 0.95, 6, mats.steel, 0, 0.2, 0)
        skewer.rotation.z = Math.PI * 0.5
        Kit.sphere(root, 0.05, 8, garnishGreen, 0.2, 0.29, 0.1)
    }
    else if(dish.type === 'rice')
    {
        const mound = Kit.sphere(root, 0.3, 14, foodMaterial, 0, 0.18, 0)
        mound.scale.y = 0.7
        const grains = []
        for(let i = 0; i < 26; i++)
        {
            const angle = i * 2.4
            grains.push({
                p: [Math.cos(angle) * (0.08 + i * 0.008), 0.29 + (i % 4) * 0.018, Math.sin(angle) * (0.08 + i * 0.008)],
                r: [0, angle, 0],
                s: [1, 0.5, 0.5]
            })
        }
        const grainGeometry = THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.018, 0.05, 3, 5) : new THREE.CylinderGeometry(0.018, 0.018, 0.07, 5)
        Kit.instanced(root, grainGeometry, mats.yellow, grains)
        Kit.sphere(root, 0.055, 8, garnishRed, 0.05, 0.37, 0.02)
    }
    else if(dish.type === 'bread')
    {
        for(let i = 0; i < 2; i++)
        {
            const bread = Kit.sphere(root, 0.31, 16, foodMaterial, i * 0.08 - 0.04, 0.11 + i * 0.06, i * 0.04)
            bread.scale.set(1.15, 0.13, 1)
            bread.rotation.y = i * 0.4
            for(let j = 0; j < 5; j++)
            {
                Kit.sphere(root, 0.025, 6, mats.woodDark, -0.2 + j * 0.1, 0.15 + i * 0.06, -0.12 + (j % 2) * 0.22).scale.y = 0.25
            }
        }
    }
    else if(dish.type === 'snack')
    {
        for(let i = 0; i < 4; i++)
        {
            const x = -0.19 + (i % 2) * 0.24
            const z = -0.12 + Math.floor(i / 2) * 0.24
            if(dish.id === 'samosa')
            {
                const triangle = Kit.cone(root, 0.15, 0.24, 3, foodMaterial, x, 0.2, z)
                triangle.rotation.y = i * 0.7
            }
            else
            {
                const fritter = Kit.sphere(root, 0.14, 10, foodMaterial, x, 0.17, z)
                fritter.scale.y = 0.7
            }
        }
        Kit.sphere(root, 0.06, 8, garnishGreen, 0, 0.23, 0.18)
    }
    else if(dish.type === 'drink')
    {
        const liquid = Kit.cylinder(root, 0.16, 0.13, 0.24, 14, foodMaterial, 0, 0.16, 0)
        liquid.scale.y = 0.8
        if(dish.id === 'lassi')
        {
            Kit.sphere(root, 0.04, 8, mats.greenBright, 0.05, 0.3, 0.02)
        }
        const straw = Kit.cylinder(root, 0.012, 0.012, 0.38, 6, mats.mustard, 0.05, 0.4, 0)
        straw.rotation.z = 0.16
        liquid.userData.decorative = true
    }
    else if(dish.type === 'sweet')
    {
        if(dish.id === 'jalebi')
        {
            for(let i = 0; i < 3; i++)
            {
                const swirl = Kit.torus(root, 0.12 - i * 0.025, 0.032, 8, 18, foodMaterial, 0, 0.13 + i * 0.055, 0)
                swirl.rotation.x = Math.PI * 0.5
            }
        }
        else
        {
            for(let i = 0; i < 4; i++)
            {
                const ball = Kit.sphere(root, 0.13, 12, foodMaterial, -0.17 + (i % 2) * 0.33, 0.16, -0.1 + Math.floor(i / 2) * 0.2)
                ball.scale.y = 0.85
            }
            Kit.sphere(root, 0.05, 8, garnishGreen, 0, 0.24, 0)
        }
    }

    root.traverse((child) =>
    {
        if(child.isMesh)
        {
            world.mark(child, 'dish', { label: dish.name, dishId: dish.id, camera: 'display', hint: `Tap for ingredients, spice level and price` })
        }
    })

    world.dishMeshes.set(dish.id, root)
    return root
}
