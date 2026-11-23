import * as THREE from 'three'

const textureCache = new Map()
const geometryCache = new Map()

export function canvasTexture(key, width, height, draw)
{
    if(textureCache.has(key))
    {
        return textureCache.get(key)
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    draw(context, width, height)

    const texture = new THREE.CanvasTexture(canvas)
    texture.encoding = THREE.sRGBEncoding
    texture.anisotropy = 4
    texture.needsUpdate = true
    textureCache.set(key, texture)
    return texture
}

export function getGeometry(key, factory)
{
    if(!geometryCache.has(key))
    {
        geometryCache.set(key, factory())
    }
    return geometryCache.get(key)
}

export function standard(color, options = {})
{
    return new THREE.MeshStandardMaterial({
        color,
        roughness: options.roughness === undefined ? 0.82 : options.roughness,
        metalness: options.metalness === undefined ? 0.04 : options.metalness,
        emissive: options.emissive || '#000000',
        emissiveIntensity: options.emissiveIntensity === undefined ? 0 : options.emissiveIntensity,
        side: options.side || THREE.FrontSide,
        transparent: options.transparent || false,
        opacity: options.opacity === undefined ? 1 : options.opacity,
        depthWrite: options.depthWrite === undefined ? true : options.depthWrite,
        flatShading: options.flatShading || false,
        map: options.map || null
    })
}

export function basic(color, options = {})
{
    return new THREE.MeshBasicMaterial({
        color,
        transparent: options.transparent || false,
        opacity: options.opacity === undefined ? 1 : options.opacity,
        side: options.side || THREE.FrontSide,
        depthWrite: options.depthWrite === undefined ? true : options.depthWrite,
        blending: options.blending || THREE.NormalBlending,
        map: options.map || null
    })
}

export function add(parent, geometry, material, x = 0, y = 0, z = 0)
{
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z)
    parent.add(mesh)
    return mesh
}

export function box(parent, width, height, depth, material, x = 0, y = 0, z = 0)
{
    return add(parent, getGeometry(`box:${width}:${height}:${depth}`, () => new THREE.BoxGeometry(width, height, depth)), material, x, y, z)
}

export function cylinder(parent, radiusTop, radiusBottom, height, segments, material, x = 0, y = 0, z = 0)
{
    const key = `cyl:${radiusTop}:${radiusBottom}:${height}:${segments}`
    return add(parent, getGeometry(key, () => new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments)), material, x, y, z)
}

export function sphere(parent, radius, segments, material, x = 0, y = 0, z = 0)
{
    const key = `sph:${radius}:${segments}`
    return add(parent, getGeometry(key, () => new THREE.SphereGeometry(radius, segments, Math.max(6, Math.floor(segments * 0.7)))), material, x, y, z)
}

export function cone(parent, radius, height, segments, material, x = 0, y = 0, z = 0)
{
    const key = `cone:${radius}:${height}:${segments}`
    return add(parent, getGeometry(key, () => new THREE.ConeGeometry(radius, height, segments)), material, x, y, z)
}

export function torus(parent, radius, tube, radial, tubular, material, x = 0, y = 0, z = 0)
{
    const key = `tor:${radius}:${tube}:${radial}:${tubular}`
    return add(parent, getGeometry(key, () => new THREE.TorusGeometry(radius, tube, radial, tubular)), material, x, y, z)
}

export function plane(parent, width, height, material, x = 0, y = 0, z = 0)
{
    return add(parent, getGeometry(`plane:${width}:${height}`, () => new THREE.PlaneGeometry(width, height)), material, x, y, z)
}

export function circle(parent, radius, segments, material, x = 0, y = 0, z = 0)
{
    return add(parent, getGeometry(`circle:${radius}:${segments}`, () => new THREE.CircleGeometry(radius, segments)), material, x, y, z)
}

export function group(parent, x = 0, y = 0, z = 0)
{
    const object = new THREE.Group()
    object.position.set(x, y, z)
    parent.add(object)
    return object
}

export function instanced(parent, geometry, material, items)
{
    const mesh = new THREE.InstancedMesh(geometry, material, items.length)
    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    items.forEach((item, index) =>
    {
        dummy.position.set(item.p[0], item.p[1], item.p[2])
        dummy.rotation.set(item.r ? item.r[0] : 0, item.r ? item.r[1] : 0, item.r ? item.r[2] : 0)
        dummy.scale.set(item.s ? item.s[0] : 1, item.s ? item.s[1] : 1, item.s ? item.s[2] : 1)
        dummy.updateMatrix()
        mesh.setMatrixAt(index, dummy.matrix)
        if(item.color)
        {
            mesh.setColorAt(index, color.set(item.color))
        }
    })

    mesh.instanceMatrix.needsUpdate = true
    if(mesh.instanceColor)
    {
        mesh.instanceColor.needsUpdate = true
    }
    mesh.frustumCulled = false
    parent.add(mesh)
    return mesh
}

export function pipe(parent, points, radius, material, segments = 24)
{
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)))
    return add(parent, new THREE.TubeGeometry(curve, segments, radius, 6, false), material)
}

export const glowTexture = () => canvasTexture('glow', 128, 128, (context, width, height) =>
{
    const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.22, 'rgba(255,255,255,0.72)')
    gradient.addColorStop(0.55, 'rgba(255,255,255,0.2)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)
})

export function glowSprite(parent, x, y, z, color, size = 1, opacity = 0.6)
{
    const material = new THREE.SpriteMaterial({
        map: glowTexture(),
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })
    const sprite = new THREE.Sprite(material)
    sprite.position.set(x, y, z)
    sprite.scale.set(size, size, 1)
    parent.add(sprite)
    return sprite
}

export function seeded(seed)
{
    let value = seed
    return () =>
    {
        value = (value * 1664525 + 1013904223) % 4294967296
        return value / 4294967296
    }
}

export function disposeCache()
{
    textureCache.forEach((texture) => texture.dispose())
    textureCache.clear()
    geometryCache.forEach((geometry) => geometry.dispose())
    geometryCache.clear()
}
