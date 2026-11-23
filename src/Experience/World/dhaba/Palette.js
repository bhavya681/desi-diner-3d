import * as THREE from 'three'
import { canvasTexture, standard, basic, seeded } from './Kit.js'

const noise = (context, width, height, amount, seed, alpha = 0.14) =>
{
    const random = seeded(seed)
    for(let i = 0; i < amount; i++)
    {
        const value = Math.floor(random() * 90)
        context.fillStyle = `rgba(${value + 40},${value + 25},${value + 15},${alpha * random()})`
        const size = 1 + random() * 3
        context.fillRect(random() * width, random() * height, size, size)
    }
}

const panel = (context, width, height, colors) =>
{
    const gradient = context.createLinearGradient(0, 0, width, height)
    colors.forEach((color, index) => gradient.addColorStop(index / (colors.length - 1), color))
    context.fillStyle = gradient
    context.fillRect(0, 0, width, height)
}

const frame = (context, width, height, color, thickness = 10, inset = 8) =>
{
    context.strokeStyle = color
    context.lineWidth = thickness
    context.strokeRect(inset, inset, width - inset * 2, height - inset * 2)
}

export default class Palette
{
    constructor()
    {
        this.textures = {}
        this.createTextures()
        this.createMaterials()
    }

    createTextures()
    {
        this.textures.brick = canvasTexture('brick', 512, 512, (context, width, height) =>
        {
            context.fillStyle = '#3b211a'
            context.fillRect(0, 0, width, height)
            const rows = 10
            const bricksPerRow = 6
            const brickWidth = width / bricksPerRow
            const brickHeight = height / rows
            const random = seeded(7741)

            for(let row = 0; row < rows; row++)
            {
                const offset = row % 2 ? brickWidth * 0.5 : 0
                for(let column = -1; column <= bricksPerRow; column++)
                {
                    const x = column * brickWidth + offset + 2
                    const y = row * brickHeight + 2
                    const shade = 0.75 + random() * 0.45
                    const red = Math.floor(112 * shade)
                    const green = Math.floor(48 * shade)
                    const blue = Math.floor(32 * shade)
                    context.fillStyle = `rgb(${red},${green},${blue})`
                    context.fillRect(x, y, brickWidth - 4, brickHeight - 4)
                    context.fillStyle = 'rgba(0,0,0,0.13)'
                    context.fillRect(x, y + brickHeight - 8, brickWidth - 4, 4)
                }
            }
            noise(context, width, height, 2800, 22, 0.2)
        })

        this.textures.plaster = canvasTexture('plaster', 512, 512, (context, width, height) =>
        {
            panel(context, width, height, ['#5c2319', '#7a321a', '#4a1d16'])
            noise(context, width, height, 4200, 91, 0.24)
            const random = seeded(556)
            for(let i = 0; i < 36; i++)
            {
                context.fillStyle = `rgba(20,10,8,${0.05 + random() * 0.1})`
                context.beginPath()
                context.ellipse(random() * width, random() * height, 10 + random() * 48, 4 + random() * 18, random() * 3, 0, Math.PI * 2)
                context.fill()
            }
        })

        this.textures.road = canvasTexture('road', 512, 512, (context, width, height) =>
        {
            context.fillStyle = '#211e1d'
            context.fillRect(0, 0, width, height)
            noise(context, width, height, 9000, 451, 0.28)
            const random = seeded(77)
            context.strokeStyle = 'rgba(24,20,18,0.6)'
            for(let i = 0; i < 26; i++)
            {
                context.lineWidth = 1 + random() * 2
                context.beginPath()
                context.moveTo(random() * width, random() * height)
                context.lineTo(random() * width, random() * height)
                context.stroke()
            }
        })

        this.textures.gravel = canvasTexture('gravel', 512, 512, (context, width, height) =>
        {
            context.fillStyle = '#2b231d'
            context.fillRect(0, 0, width, height)
            noise(context, width, height, 12000, 618, 0.32)
        })

        this.textures.stone = canvasTexture('stone', 512, 512, (context, width, height) =>
        {
            context.fillStyle = '#332a24'
            context.fillRect(0, 0, width, height)
            const random = seeded(1221)
            for(let row = 0; row < 8; row++)
            {
                for(let column = 0; column < 8; column++)
                {
                    const size = 64
                    context.fillStyle = `rgba(${70 + random() * 35},${58 + random() * 26},${48 + random() * 20},0.75)`
                    context.fillRect(column * size + 2, row * size + 2, size - 4, size - 4)
                }
            }
            noise(context, width, height, 5000, 17, 0.22)
        })

        this.textures.roof = canvasTexture('roof', 512, 512, (context, width, height) =>
        {
            context.fillStyle = '#262224'
            context.fillRect(0, 0, width, height)
            for(let i = 0; i < width; i += 24)
            {
                context.fillStyle = i % 48 === 0 ? '#3a3434' : '#1d1a1b'
                context.fillRect(i, 0, 12, height)
                context.fillStyle = 'rgba(255,160,70,0.05)'
                context.fillRect(i + 12, 0, 2, height)
            }
            noise(context, width, height, 2200, 34, 0.2)
        })

        this.textures.tarp = canvasTexture('tarp', 256, 256, (context, width, height) =>
        {
            const colors = ['#a81e18', '#e5a51d', '#18724a', '#a81e18', '#e5a51d']
            colors.forEach((color, index) =>
            {
                context.fillStyle = color
                context.fillRect(index * (width / colors.length), 0, width / colors.length + 1, height)
            })
            noise(context, width, height, 1800, 8, 0.13)
        })

        this.textures.cloth = canvasTexture('cloth', 256, 256, (context, width, height) =>
        {
            context.fillStyle = '#b7402e'
            context.fillRect(0, 0, width, height)
            context.strokeStyle = 'rgba(255,213,132,0.55)'
            context.lineWidth = 3
            for(let i = -height; i < width; i += 22)
            {
                context.beginPath()
                context.moveTo(i, 0)
                context.lineTo(i + height, height)
                context.stroke()
            }
            noise(context, width, height, 1400, 902, 0.16)
        })

        this.textures.mainSign = canvasTexture('mainSign', 1024, 320, (context, width, height) =>
        {
            panel(context, width, height, ['#5c0f0d', '#a52215', '#6b130e'])
            frame(context, width, height, '#f2b72c', 16, 14)
            frame(context, width, height, '#ffe6a5', 3, 32)
            context.fillStyle = '#ffe6a5'
            context.font = '900 128px Arial Black, Arial, sans-serif'
            context.textAlign = 'center'
            context.fillText('SARDAR JI DHABA', width / 2, 152)
            context.font = '900 46px Arial, sans-serif'
            context.fillStyle = '#ffd23c'
            context.fillText('TRUE HIGHWAY TASTE • OPEN 24 HOURS', width / 2, 218)
            context.font = '700 30px Arial, sans-serif'
            context.fillStyle = '#f7e7c4'
            context.fillText('NH-1  •  TANDOOR  •  CHAI  •  DHABA', width / 2, 270)

            const motif = (x) =>
            {
                context.strokeStyle = '#ffcd45'
                context.lineWidth = 6
                context.beginPath()
                context.arc(x, 158, 24, 0, Math.PI * 2)
                context.stroke()
                context.beginPath()
                context.arc(x, 158, 10, 0, Math.PI * 2)
                context.fillStyle = '#ffcd45'
                context.fill()
            }
            motif(78)
            motif(width - 78)
        })

        this.textures.neonSign = canvasTexture('neonSign', 768, 256, (context, width, height) =>
        {
            context.fillStyle = '#0c0808'
            context.fillRect(0, 0, width, height)
            context.textAlign = 'center'
            context.shadowBlur = 26
            context.shadowColor = '#ff3b1e'
            context.fillStyle = '#ff6947'
            context.font = '900 82px Arial Black, Arial, sans-serif'
            context.fillText('CHAI • TANDOOR', width / 2, 108)
            context.shadowColor = '#4dff9b'
            context.fillStyle = '#59ff9f'
            context.font = '900 70px Arial Black, Arial, sans-serif'
            context.fillText('KHANA 24x7', width / 2, 194)
            context.shadowBlur = 0
        })

        this.textures.menuBoard = canvasTexture('menuBoard', 640, 900, (context, width, height) =>
        {
            panel(context, width, height, ['#160c09', '#26120d', '#160c09'])
            frame(context, width, height, '#e9a521', 14, 14)
            frame(context, width, height, 'rgba(255,224,158,0.45)', 2, 32)
            context.textAlign = 'center'
            context.fillStyle = '#f0b32b'
            context.font = '900 62px Arial Black, Arial, sans-serif'
            context.fillText('TODAY’S MENU', width / 2, 104)
            context.fillStyle = '#f8e6c0'
            context.font = '700 24px Arial, sans-serif'
            context.fillText('COOKED FRESH • SERVED HOT', width / 2, 145)
            context.strokeStyle = '#c63820'
            context.lineWidth = 4
            context.beginPath()
            context.moveTo(70, 168)
            context.lineTo(width - 70, 168)
            context.stroke()

            const items = [
                ['BUTTER CHICKEN', '320'], ['DAL MAKHANI', '220'], ['PANEER TIKKA', '260'],
                ['CHICKEN TIKKA', '290'], ['DUM BIRYANI', '340'], ['CHOLE BHATURE', '240'],
                ['TANDOORI ROTI', '40'], ['BUTTER NAAN', '55'], ['ALOO PARATHA', '90'],
                ['SAMOSA', '60'], ['ONION PAKORA', '70'], ['MASALA CHAI', '30'],
                ['SWEET LASSI', '80'], ['JALEBI', '90'], ['GULAB JAMUN', '100']
            ]
            context.font = '700 27px Arial, sans-serif'
            items.forEach((item, index) =>
            {
                const y = 214 + index * 42
                context.fillStyle = index % 2 ? '#f8e6c0' : '#ffcf70'
                context.textAlign = 'left'
                context.fillText(item[0], 62, y)
                context.textAlign = 'right'
                context.fillStyle = '#f8e6c0'
                context.fillText(`₹${item[1]}`, width - 62, y)
            })
            context.textAlign = 'center'
            context.fillStyle = '#e9a521'
            context.font = '900 25px Arial, sans-serif'
            context.fillText('ORDER AT THE COUNTER →', width / 2, height - 42)
        })

        this.textures.truckArt = canvasTexture('truckArt', 512, 512, (context, width, height) =>
        {
            panel(context, width, height, ['#1b5f8c', '#1e83a8', '#15607f'])
            const random = seeded(441)
            const petals = ['#f6c229', '#e94225', '#f3e6c4', '#43b66a', '#e97821']
            for(let i = 0; i < 34; i++)
            {
                const x = random() * width
                const y = random() * height
                const radius = 5 + random() * 14
                context.fillStyle = petals[Math.floor(random() * petals.length)]
                for(let p = 0; p < 6; p++)
                {
                    const angle = (p / 6) * Math.PI * 2
                    context.beginPath()
                    context.ellipse(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, radius * 0.6, radius * 0.35, angle, 0, Math.PI * 2)
                    context.fill()
                }
                context.fillStyle = '#f6c229'
                context.beginPath()
                context.arc(x, y, radius * 0.4, 0, Math.PI * 2)
                context.fill()
            }
            context.strokeStyle = '#f2c12a'
            context.lineWidth = 8
            for(let i = 0; i < 7; i++)
            {
                context.beginPath()
                context.arc(width / 2, height / 2, 30 + i * 38, 0, Math.PI * 2)
                context.stroke()
            }
            noise(context, width, height, 1800, 33, 0.12)
        })

        this.textures.hornSign = canvasTexture('hornSign', 512, 256, (context, width, height) =>
        {
            panel(context, width, height, ['#b71b13', '#df2d1d', '#8f130e'])
            frame(context, width, height, '#ffd452', 12, 10)
            context.textAlign = 'center'
            context.fillStyle = '#ffeac0'
            context.font = '900 52px Arial Black, Arial, sans-serif'
            context.fillText('HORN OK', width / 2, 104)
            context.fillText('PLEASE', width / 2, 168)
            context.font = '700 22px Arial, sans-serif'
            context.fillStyle = '#ffd452'
            context.fillText('DRIVE SAFE • DRIVE SLOW', width / 2, 216)
        })

        this.textures.highwaySign = canvasTexture('highwaySign', 512, 256, (context, width, height) =>
        {
            context.fillStyle = '#16392a'
            context.fillRect(0, 0, width, height)
            frame(context, width, height, '#f1d998', 10, 10)
            context.textAlign = 'center'
            context.fillStyle = '#f1d998'
            context.font = '900 60px Arial Black, Arial, sans-serif'
            context.fillText('NH-1', width / 2, 92)
            context.font = '700 30px Arial, sans-serif'
            context.fillText('DELHI — AMRITSAR', width / 2, 144)
            context.font = '700 24px Arial, sans-serif'
            context.fillText('NEXT DHABA 0 KM', width / 2, 196)
        })

        this.textures.posterBollywood = this.poster('posterBollywood', 'DILORAMA', 'TONIGHT 8 PM', ['#6c1438', '#c02d36'], '#f7c84a', 'A ROMANCE ON THE HIGHWAY')
        this.textures.posterCricket = this.poster('posterCricket', 'MATCH DAY', 'INDIA vs AUSTRALIA', ['#123c62', '#1d6b8d'], '#f2d058', 'LIVE ON THE BIG SCREEN')
        this.textures.posterFood = this.poster('posterFood', 'TANDOOR NIGHT', 'FRESH FROM THE CLAY', ['#7a210e', '#bd4b13'], '#ffdc78', 'NAAN • TIKKA • CHAI')
        this.textures.posterBus = this.poster('posterBus', 'RAJASTHAN EXPRESS', 'DAILY 5 AM', ['#134b42', '#18715a'], '#f3d88a', 'BOOK AT THE COUNTER')
        this.textures.fridge = this.poster('fridge', 'COLD COLA', 'ICE COLD • ₹20', ['#0d3a5c', '#125f83'], '#8fe3ff', 'THIRSTY? COME INSIDE')
        this.textures.chaiLabel = this.label('chaiLabel', 'MASALA CHAI', '#2a1109', '#ffc43d')
        this.textures.spiceLabel = this.label('spiceLabel', 'GARAM MASALA', '#1e3a24', '#c9e76d')
        this.textures.naanLabel = this.label('naanLabel', 'FRESH NAAN', '#43190e', '#ffcf6a')
    }

    poster(key, title, subtitle, colors, accent, footer)
    {
        return canvasTexture(key, 384, 576, (context, width, height) =>
        {
            panel(context, width, height, colors)
            frame(context, width, height, accent, 12, 10)
            context.textAlign = 'center'
            context.fillStyle = accent
            context.font = '900 52px Arial Black, Arial, sans-serif'
            context.fillText(title, width / 2, 78)
            context.font = '900 30px Arial, sans-serif'
            context.fillStyle = '#fff1cf'
            context.fillText(subtitle, width / 2, 132)

            const random = seeded(key.length * 97 + 13)
            for(let i = 0; i < 46; i++)
            {
                context.fillStyle = `hsla(${20 + random() * 50},85%,55%,${0.16 + random() * 0.35})`
                context.beginPath()
                context.arc(random() * width, 180 + random() * 260, 4 + random() * 28, 0, Math.PI * 2)
                context.fill()
            }

            context.fillStyle = 'rgba(0,0,0,0.45)'
            context.fillRect(24, height - 116, width - 48, 76)
            context.fillStyle = accent
            context.font = '700 22px Arial, sans-serif'
            context.fillText(footer, width / 2, height - 72)
            noise(context, width, height, 1600, key.length + 3, 0.14)
        })
    }

    label(key, text, background, color)
    {
        return canvasTexture(key, 512, 160, (context, width, height) =>
        {
            context.fillStyle = background
            context.fillRect(0, 0, width, height)
            frame(context, width, height, color, 8, 8)
            context.fillStyle = color
            context.font = '900 62px Arial Black, Arial, sans-serif'
            context.textAlign = 'center'
            context.textBaseline = 'middle'
            context.fillText(text, width / 2, height / 2)
        })
    }

    repeated(texture, x, y)
    {
        const copy = texture.clone()
        copy.wrapS = THREE.RepeatWrapping
        copy.wrapT = THREE.RepeatWrapping
        copy.repeat.set(x, y)
        copy.needsUpdate = true
        return copy
    }

    createMaterials()
    {
        const textureMaterial = (texture, options = {}) => standard('#ffffff', { ...options, map: texture })

        this.mats = {
            asphalt: textureMaterial(this.repeated(this.textures.road, 16, 4), { roughness: 1 }),
            gravel: textureMaterial(this.repeated(this.textures.gravel, 12, 8), { roughness: 1 }),
            stone: textureMaterial(this.repeated(this.textures.stone, 10, 6), { roughness: 1 }),
            brick: textureMaterial(this.repeated(this.textures.brick, 8, 3), { roughness: 0.95 }),
            plaster: textureMaterial(this.repeated(this.textures.plaster, 5, 2), { roughness: 0.96 }),
            roof: textureMaterial(this.repeated(this.textures.roof, 8, 4), { roughness: 0.72, metalness: 0.25, side: THREE.DoubleSide }),
            tarp: textureMaterial(this.repeated(this.textures.tarp, 2, 1), { roughness: 0.95, side: THREE.DoubleSide }),
            cloth: textureMaterial(this.repeated(this.textures.cloth, 1, 1), { roughness: 0.95, side: THREE.DoubleSide }),
            dirt: standard('#2a1c14', { roughness: 1 }),
            darkDirt: standard('#1a120e', { roughness: 1 }),
            charcoal: standard('#121114', { roughness: 0.9 }),
            charcoalSoft: standard('#1d1a19', { roughness: 0.95 }),
            wood: standard('#6a3b1e', { roughness: 0.86 }),
            woodDark: standard('#3d2214', { roughness: 0.9 }),
            woodLight: standard('#9a5c2b', { roughness: 0.8 }),
            maroon: standard('#571713', { roughness: 0.9 }),
            red: standard('#a52418', { roughness: 0.8, emissive: '#300501', emissiveIntensity: 0.2 }),
            redBright: standard('#d4331d', { roughness: 0.65, emissive: '#5a0a00', emissiveIntensity: 0.35 }),
            orange: standard('#d5661c', { roughness: 0.8, emissive: '#4b1c00', emissiveIntensity: 0.24 }),
            mustard: standard('#e6a521', { roughness: 0.7, emissive: '#5a3a00', emissiveIntensity: 0.25 }),
            green: standard('#2c7a46', { roughness: 0.8, emissive: '#0c2c17', emissiveIntensity: 0.3 }),
            greenBright: standard('#43b361', { roughness: 0.6, emissive: '#124a24', emissiveIntensity: 0.35 }),
            cream: standard('#f0d9a9', { roughness: 0.85 }),
            yellow: standard('#f4cb62', { roughness: 0.7 }),
            steel: standard('#9fa4a3', { roughness: 0.34, metalness: 0.78 }),
            steelDark: standard('#535a5b', { roughness: 0.45, metalness: 0.68 }),
            iron: standard('#26292b', { roughness: 0.6, metalness: 0.62 }),
            brass: standard('#c99432', { roughness: 0.32, metalness: 0.7, emissive: '#3a2300', emissiveIntensity: 0.2 }),
            copper: standard('#a75a27', { roughness: 0.4, metalness: 0.65 }),
            clay: standard('#7c3c25', { roughness: 0.96 }),
            clayHot: standard('#92391f', { roughness: 0.9, emissive: '#ff4a00', emissiveIntensity: 0.5 }),
            plasticBlue: standard('#1760a0', { roughness: 0.5 }),
            plasticRed: standard('#b3261d', { roughness: 0.5 }),
            plasticGreen: standard('#1b7a50', { roughness: 0.5 }),
            chai: standard('#a05f27', { roughness: 0.4 }),
            milk: standard('#eee5cf', { roughness: 0.4 }),
            oil: standard('#ca8a23', { roughness: 0.3, metalness: 0.25 }),
            onion: standard('#a76b9d', { roughness: 0.7 }),
            tomato: standard('#c83222', { roughness: 0.6, emissive: '#3a0500', emissiveIntensity: 0.18 }),
            chilli: standard('#3c912c', { roughness: 0.7 }),
            potato: standard('#b38b52', { roughness: 0.95 }),
            flame: basic('#ff9a22', { transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false }),
            flameCore: basic('#ffe9a0', { transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }),
            ember: basic('#ff5a12', { transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }),
            bulbWarm: standard('#ffd47a', { emissive: '#ffc34d', emissiveIntensity: 2.2, roughness: 0.4 }),
            bulbRed: standard('#ff5c45', { emissive: '#ff2e16', emissiveIntensity: 2.2, roughness: 0.4 }),
            bulbGreen: standard('#5be08a', { emissive: '#25d463', emissiveIntensity: 2.2, roughness: 0.4 }),
            bulbOff: standard('#6b5b48', { roughness: 0.5 }),
            neonRed: basic('#ff4930', { map: this.textures.neonSign }),
            sign: basic('#ffffff', { map: this.textures.mainSign }),
            menu: basic('#ffffff', { map: this.textures.menuBoard }),
            horn: basic('#ffffff', { map: this.textures.hornSign }),
            highwaySign: basic('#ffffff', { map: this.textures.highwaySign }),
            truckArt: standard('#ffffff', { map: this.textures.truckArt, roughness: 0.7 }),
            posterBollywood: basic('#ffffff', { map: this.textures.posterBollywood }),
            posterCricket: basic('#ffffff', { map: this.textures.posterCricket }),
            posterFood: basic('#ffffff', { map: this.textures.posterFood }),
            posterBus: basic('#ffffff', { map: this.textures.posterBus }),
            fridge: standard('#ffffff', { map: this.textures.fridge, roughness: 0.4, metalness: 0.15 }),
            chaiLabel: basic('#ffffff', { map: this.textures.chaiLabel }),
            spiceLabel: basic('#ffffff', { map: this.textures.spiceLabel }),
            naanLabel: basic('#ffffff', { map: this.textures.naanLabel }),
            glass: standard('#b9d8dc', { roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.35, depthWrite: false }),
            smoke: basic('#e8d8c4', { transparent: true, opacity: 0, depthWrite: false }),
            steam: basic('#fff3df', { transparent: true, opacity: 0, depthWrite: false }),
            dust: basic('#e7bb7d', { transparent: true, opacity: 0, depthWrite: false })
        }
    }
}
