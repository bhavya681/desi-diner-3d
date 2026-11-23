import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Materials
{
    constructor()
    {
        this.experience = new Experience()
        this.debug = this.experience.debug

        this.palette = {
            ink: '#120a08',
            charcoal: '#241512',
            wood: '#7a3f1d',
            woodLight: '#b86c31',
            brass: '#d99b2b',
            saffron: '#ff9d2e',
            chilli: '#ff4d2e',
            cream: '#fff2d6',
            teal: '#164b48',
            green: '#2c9b55',
            pink: '#ff5f9e'
        }

        this.createMaterials()
    }

    createMaterials()
    {
        this.signMaterial = new THREE.MeshBasicMaterial({ color: this.palette.saffron })
        this.neonWarmMaterial = new THREE.MeshBasicMaterial({ color: '#ffd36b' })
        this.neonPinkMaterial = new THREE.MeshBasicMaterial({ color: this.palette.pink })
        this.neonGreenMaterial = new THREE.MeshBasicMaterial({ color: this.palette.green })
        this.darkMaterial = new THREE.MeshStandardMaterial({ color: this.palette.ink, roughness: 0.9 })
    }
}
