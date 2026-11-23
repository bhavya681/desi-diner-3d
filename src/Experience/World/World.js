import Experience from '../Experience.js'
import DhabaWorld from './dhaba/DhabaWorld.js'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resources.on('ready', () =>
        {
            this.dhaba = new DhabaWorld()
            this.indianStall = this.dhaba
            this.stall = this.dhaba
            this.experience.controller.onWorldReady(this.dhaba)
        })
    }

    update()
    {
        if(this.dhaba)
        {
            this.dhaba.update()
        }
    }
}
