import Experience from './Experience.js'
import Stats from 'stats.js'

export default class Performance
{
    constructor()
    {
        this.experience = new Experience()
        this.debug = this.experience.debug
        this.renderer = this.experience.renderer

        if(this.debug.active)
        {
            this.stats = new Stats()
            this.stats.showPanel(0)
            document.body.appendChild(this.stats.dom)
        }

        this.filterStrength = 5
        this.frameTime = 16
        this.lastLoop = new Date()
        this.intervalSet = null
        this.lowMode = false
        this.manual = false
        this.windowOpen = true

        document.addEventListener('visibilitychange', () =>
        {
            this.windowOpen = !document.hidden
        })
    }

    performanceCheck()
    {
        if(this.intervalSet === null)
        {
            this.intervalSet = window.setInterval(() => this.performanceCheck(), 12000)
        }

        const frameRate = 1000 / this.frameTime
        if(frameRate < 26 && this.windowOpen && !this.lowMode && !this.manual)
        {
            this.enableLowMode()
        }
    }

    enableLowMode()
    {
        this.lowMode = true
        const world = this.experience.world.dhaba
        if(world)
        {
            world.setQuality('low')
        }
        document.querySelectorAll('[data-quality]').forEach((button) =>
        {
            button.classList.toggle('is-active', button.dataset.quality === 'low')
        })
    }

    update()
    {
        const thisFrameTime = (this.thisLoop = new Date()) - this.lastLoop
        this.frameTime += (thisFrameTime - this.frameTime) / this.filterStrength
        this.lastLoop = this.thisLoop

        if(this.debug.active && this.stats)
        {
            this.stats.begin()
            this.stats.end()
        }
    }
}
