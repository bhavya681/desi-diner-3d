import Experience from './Experience.js'
import EventEmitter from './Utils/EventEmitter.js'

export default class PreLoader extends EventEmitter
{
    constructor()
    {
        super()

        this.experience = new Experience()
        this.sounds = this.experience.sounds
        this.resources = this.experience.resources
        this.sizes = this.experience.sizes

        this.overlay = document.querySelector('.overlay')
        this.startButton = document.querySelector('.start')
        this.progressBar = document.querySelector('#progressBar')
        this.progressPercentage = document.querySelector('#progressPercentage')
        this.loaderMessage = document.querySelector('#loaderMessage')
        this.loaderKicker = document.querySelector('.loaderKicker')

        this.messages = [
            'Lighting the tandoor',
            'Boiling the chai',
            'Parking the trucks',
            'Hanging the bulbs',
            'Setting the tables',
            'Opening the highway'
        ]

        this.resources.on('itemLoaded', () =>
        {
            const ratio = Math.min((this.resources.loaded + 1) / this.resources.toLoad, 1)
            this.updateProgress(ratio)
        })

        this.resources.on('ready', () =>
        {
            this.updateProgress(1)
            window.setTimeout(() => this.readyScreen(), 420)
        })
    }

    updateProgress(ratio)
    {
        const percentage = Math.trunc(ratio * 100)
        this.progressBar.style.width = `${percentage}%`
        this.progressPercentage.textContent = percentage
        this.loaderMessage.textContent = this.messages[Math.min(this.messages.length - 1, Math.floor(percentage / 20))]
    }

    readyScreen()
    {
        this.loaderMessage.textContent = 'THE DHABA IS OPEN'
        this.loaderKicker.textContent = 'NATIONAL HIGHWAY 1 • OPEN ALL NIGHT'
        this.startButton.classList.add('fadeIn')

        const begin = () =>
        {
            this.overlay.classList.add('fade')
            this.startButton.classList.add('fadeOut')
            this.startButton.disabled = true

            this.controller = this.experience.controller
            this.performance = this.experience.performance

            this.sounds.start()
            this.sounds.playClick()
            this.sounds.playWhoosh()
            this.sounds.playCooking()

            this.sizes.resize()
            this.controller.start()

            window.setTimeout(() => this.performance.performanceCheck(), 1200)
            this.trigger('start')

            window.setTimeout(() => this.overlay.remove(), 950)
            window.setTimeout(() => this.sounds.playDing(), 600)
        }

        this.startButton.addEventListener('click', begin, { once: true })
        window.addEventListener('keydown', (event) =>
        {
            if(event.key === 'Enter' && !this.startButton.disabled)
            {
                begin()
            }
        })
    }
}
