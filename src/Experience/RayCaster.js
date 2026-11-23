import * as THREE from 'three'
import Experience from './Experience.js'
import gsap from 'gsap'

export default class RayCaster
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.sizes = this.experience.sizes
        this.canvas = this.experience.canvas
        this.preLoader = this.experience.preLoader
        this.controller = this.experience.controller
        this.config = this.experience.config

        this.hovered = null
        this.label = document.querySelector('#hoverLabel')

        this.preLoader.on('start', () =>
        {
            this.world = this.experience.world.dhaba
            if(!this.world)
            {
                return
            }
            this.raycaster = new THREE.Raycaster()
            this.cursor = new THREE.Vector2()
            this.downPoint = new THREE.Vector2()
            this.objectsToTest = this.world.interactive

            window.addEventListener('pointerdown', (event) =>
            {
                this.downPoint.set(event.clientX, event.clientY)
            })

            window.addEventListener('pointermove', (event) =>
            {
                if(this.config.touch || this.isUiTarget(event.target))
                {
                    this.clearHover()
                    return
                }
                this.setCursor(event)
                this.moveLabel(event)
                this.updateHover()
            })

            window.addEventListener('pointerup', (event) =>
            {
                if(this.isUiTarget(event.target))
                {
                    return
                }
                const distance = this.downPoint.distanceTo(new THREE.Vector2(event.clientX, event.clientY))
                if(distance > 14)
                {
                    return
                }
                this.setCursor(event)
                this.click()
            })
        })
    }

    isUiTarget(target)
    {
        return target && target.closest && target.closest('button, input, select, .ui-panel, .navItem, .overlay, .dishCard, .recipeCard, .orderDrawer')
    }

    setCursor(event)
    {
        this.cursor.x = event.clientX / this.sizes.width * 2 - 1
        this.cursor.y = -(event.clientY / this.sizes.height) * 2 + 1
    }

    moveLabel(event)
    {
        if(!this.label)
        {
            return
        }
        this.label.style.left = `${event.clientX + 16}px`
        this.label.style.top = `${event.clientY + 18}px`
    }

    clearHover()
    {
        if(!this.hovered)
        {
            return
        }
        this.setHighlight(this.hovered, false)
        this.hovered = null
        this.canvas.style.cursor = 'default'
        if(this.label)
        {
            this.label.classList.remove('is-visible')
        }
    }

    updateHover()
    {
        this.raycaster.setFromCamera(this.cursor, this.camera.instance)
        const intersections = this.raycaster.intersectObjects(this.objectsToTest, false)
        const object = intersections.length ? intersections[0].object : null

        if(object === this.hovered)
        {
            return
        }

        this.setHighlight(this.hovered, false)
        this.hovered = object
        this.setHighlight(this.hovered, true)
        this.canvas.style.cursor = this.hovered ? 'pointer' : 'default'

        if(this.label)
        {
            if(this.hovered && this.hovered.userData.interaction)
            {
                this.label.textContent = this.hovered.userData.interaction.label
                this.label.classList.add('is-visible')
            }
            else
            {
                this.label.classList.remove('is-visible')
            }
        }
    }

    setHighlight(object, active)
    {
        if(!object)
        {
            return
        }

        if(!object.userData.baseScale)
        {
            object.userData.baseScale = object.scale.clone()
        }
        const base = object.userData.baseScale
        const scale = active ? 1.14 : 1

        gsap.to(object.scale, {
            duration: 0.24,
            ease: 'power2.out',
            x: base.x * scale,
            y: base.y * scale,
            z: base.z * scale
        })

        const material = object.material
        if(!material)
        {
            return
        }

        if(material.emissive && material.emissiveIntensity !== undefined)
        {
            if(object.userData.baseEmissive === undefined)
            {
                object.userData.baseEmissive = material.emissiveIntensity
            }
            gsap.to(material, {
                duration: 0.24,
                emissiveIntensity: active ? Math.max(0.9, object.userData.baseEmissive + 0.85) : object.userData.baseEmissive
            })
        }
        else if(material.color)
        {
            if(!object.userData.baseColor)
            {
                object.userData.baseColor = material.color.clone()
            }
            const target = object.userData.baseColor.clone()
            if(active)
            {
                target.offsetHSL(0, 0.08, 0.18)
            }
            gsap.to(material.color, { duration: 0.24, r: target.r, g: target.g, b: target.b })
        }
    }

    click()
    {
        if(!this.raycaster || !this.objectsToTest)
        {
            return
        }
        this.raycaster.setFromCamera(this.cursor, this.camera.instance)
        const intersections = this.raycaster.intersectObjects(this.objectsToTest, false)
        if(!intersections.length)
        {
            return
        }
        const object = intersections[0].object
        const interaction = object.userData.interaction
        if(interaction)
        {
            this.controller.handleInteraction(interaction, object)
        }
    }
}
