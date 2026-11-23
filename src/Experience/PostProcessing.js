import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import Experience from './Experience.js'

export default class PostProcessing
{
    constructor()
    {
        this.experience = new Experience()
        this.renderer = this.experience.renderer
        this.scene = this.experience.scene
        this.camera = this.experience.camera
        this.sizes = this.experience.sizes
        this.resources = this.experience.resources

        this.enabled = true
        this.quality = this.experience.config.vertical ? 'medium' : 'high'

        this.update = () =>
        {
            this.renderer.instance.render(this.scene, this.camera.instance)
        }

        this.resources.on('ready', () => this.setup())
    }

    setup()
    {
        this.composer = new EffectComposer(this.renderer.instance)
        this.renderPass = new RenderPass(this.scene, this.camera.instance)
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.sizes.width, this.sizes.height), 0.68, 0.68, 0.72)
        this.composer.addPass(this.renderPass)
        this.composer.addPass(this.bloomPass)
        this.setQuality(this.quality)
        this.resize()

        this.update = () =>
        {
            if(this.enabled && this.composer)
            {
                this.composer.render()
            }
            else
            {
                this.renderer.instance.render(this.scene, this.camera.instance)
            }
        }
    }

    setQuality(level)
    {
        this.quality = level
        this.enabled = level !== 'low'
        if(this.bloomPass)
        {
            this.bloomPass.strength = level === 'high' ? 0.72 : 0.5
            this.bloomPass.radius = level === 'high' ? 0.7 : 0.5
        }
    }

    resize()
    {
        if(!this.composer)
        {
            return
        }
        const ratio = this.quality === 'high' ? Math.min(this.sizes.pixelRatio, 2) : this.quality === 'medium' ? Math.min(this.sizes.pixelRatio, 1.4) : 1
        this.composer.setPixelRatio(ratio)
        this.composer.setSize(this.sizes.width, this.sizes.height)
    }
}
