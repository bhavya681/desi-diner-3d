import Experience from './Experience.js'
import { Howl, Howler } from 'howler'

import arcade from '../../static/sounds/arcade.mp3'
import bloop from '../../static/sounds/bloop.mp3'
import click from '../../static/sounds/click.mp3'
import ding from '../../static/sounds/ding.mp3'
import cooking from '../../static/sounds/cooking.mp3'
import whoosh from '../../static/sounds/whoosh.mp3'

export default class Sounds
{
    constructor()
    {
        this.experience = new Experience()
        this.muted = false
        this.started = false
        this.context = null
        this.radioTimer = null
        this.radioStep = 0

        this.arcade = new Howl({ src: [arcade], volume: 0.12 })
        this.bloop = new Howl({ src: [bloop], volume: 0.24 })
        this.click = new Howl({ src: [click], volume: 0.28 })
        this.ding = new Howl({ src: [ding], volume: 0.16 })
        this.cookingLoop = new Howl({ src: [cooking], loop: true, volume: 0.05 })
        this.cookingHit = new Howl({ src: [cooking], volume: 0.13 })
        this.whoosh = new Howl({ src: [whoosh], volume: 0.45 })

        Howler.mute(this.muted)

        window.addEventListener('keydown', (event) =>
        {
            if(event.key === 'm' && this.started)
            {
                this.toggleMute()
                const button = document.querySelector('#soundButton')
                if(button)
                {
                    button.textContent = this.muted ? 'SOUND OFF' : 'SOUND ON'
                    button.classList.toggle('is-muted', this.muted)
                }
            }
        })

        document.addEventListener('visibilitychange', () =>
        {
            if(!this.context)
            {
                return
            }
            if(document.hidden)
            {
                this.context.suspend()
            }
            else
            {
                this.context.resume()
            }
        })
    }

    start()
    {
        if(this.started)
        {
            return
        }
        this.started = true

        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        if(!AudioContextClass)
        {
            return
        }

        this.context = new AudioContextClass()
        this.master = this.context.createGain()
        this.master.gain.value = this.muted ? 0 : 0.65
        this.master.connect(this.context.destination)

        this.noiseBuffer = this.createNoiseBuffer(3)
        this.startHighway()
        this.startFire()
        this.startFan()
    }

    createNoiseBuffer(seconds)
    {
        const length = Math.floor(this.context.sampleRate * seconds)
        const buffer = this.context.createBuffer(1, length, this.context.sampleRate)
        const data = buffer.getChannelData(0)
        let last = 0
        for(let i = 0; i < length; i++)
        {
            const white = Math.random() * 2 - 1
            last = (last + 0.02 * white) / 1.02
            data[i] = last * 3.2
        }
        return buffer
    }

    noiseSource(loop = true)
    {
        const source = this.context.createBufferSource()
        source.buffer = this.noiseBuffer
        source.loop = loop
        return source
    }

    startHighway()
    {
        const source = this.noiseSource()
        const filter = this.context.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 420
        const gain = this.context.createGain()
        gain.gain.value = 0.1
        source.connect(filter).connect(gain).connect(this.master)
        source.start()
        this.highwayGain = gain

        const rumble = this.context.createOscillator()
        rumble.type = 'sine'
        rumble.frequency.value = 48
        const rumbleGain = this.context.createGain()
        rumbleGain.gain.value = 0.035
        rumble.connect(rumbleGain).connect(this.master)
        rumble.start()
        this.rumble = rumble
    }

    startFire()
    {
        const source = this.noiseSource()
        const filter = this.context.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 760
        filter.Q.value = 0.8
        const gain = this.context.createGain()
        gain.gain.value = 0.045
        source.connect(filter).connect(gain).connect(this.master)
        source.start()
        this.fireGain = gain

        this.crackleTimer = window.setInterval(() =>
        {
            if(!this.context || document.hidden || this.muted)
            {
                return
            }
            if(Math.random() > 0.5)
            {
                this.shortNoise(0.035, 1400, 0.05)
            }
        }, 480)
    }

    startFan()
    {
        const oscillator = this.context.createOscillator()
        oscillator.type = 'sawtooth'
        oscillator.frequency.value = 72
        const filter = this.context.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 220
        const gain = this.context.createGain()
        gain.gain.value = 0.014
        oscillator.connect(filter).connect(gain).connect(this.master)
        oscillator.start()
        this.fanGain = gain
    }

    shortNoise(duration, frequency, volume, type = 'bandpass')
    {
        if(!this.context)
        {
            return
        }
        const source = this.noiseSource(false)
        const filter = this.context.createBiquadFilter()
        filter.type = type
        filter.frequency.value = frequency
        const gain = this.context.createGain()
        const now = this.context.currentTime
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(volume, now + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
        source.connect(filter).connect(gain).connect(this.master)
        source.start(now)
        source.stop(now + duration + 0.05)
    }

    tone(frequency, duration, volume, type = 'sine', delay = 0)
    {
        if(!this.context)
        {
            return
        }
        const oscillator = this.context.createOscillator()
        const gain = this.context.createGain()
        const now = this.context.currentTime + delay
        oscillator.type = type
        oscillator.frequency.setValueAtTime(frequency, now)
        gain.gain.setValueAtTime(0, now)
        gain.gain.linearRampToValueAtTime(volume, now + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
        oscillator.connect(gain).connect(this.master)
        oscillator.start(now)
        oscillator.stop(now + duration + 0.05)
    }

    playHorn()
    {
        if(!this.context || this.muted)
        {
            return
        }
        const notes = [196, 246.94]
        notes.forEach((frequency, index) =>
        {
            this.tone(frequency, 0.75, 0.16 + index * 0.04, 'sawtooth', index * 0.06)
            this.tone(frequency * 1.01, 0.72, 0.08, 'square', index * 0.06)
        })
    }

    playPour()
    {
        this.shortNoise(0.65, 1800, 0.12, 'highpass')
        this.shortNoise(0.4, 900, 0.06)
    }

    playWater()
    {
        this.shortNoise(0.5, 2400, 0.1, 'highpass')
        this.tone(520, 0.12, 0.04, 'sine', 0.08)
    }

    playFire()
    {
        if(!this.context || this.muted)
        {
            return
        }
        this.shortNoise(0.5, 520, 0.16)
        this.tone(110, 0.35, 0.09, 'sawtooth')
        this.cookingHit.play()
    }

    playFan()
    {
        this.shortNoise(0.18, 340, 0.06)
    }

    playRadio(on)
    {
        if(!this.context)
        {
            return
        }
        window.clearInterval(this.radioTimer)
        if(!on || this.muted)
        {
            return
        }
        const melody = [392, 440, 523.25, 493.88, 392, 349.23, 293.66, 349.23]
        this.radioStep = 0
        this.radioTimer = window.setInterval(() =>
        {
            if(this.muted || document.hidden)
            {
                return
            }
            const frequency = melody[this.radioStep % melody.length]
            this.tone(frequency, 0.34, 0.045, 'triangle')
            if(this.radioStep % 4 === 0)
            {
                this.tone(frequency / 2, 0.4, 0.025, 'sine')
            }
            this.radioStep++
        }, 420)
    }

    toggleMute()
    {
        this.muted = !this.muted
        Howler.mute(this.muted)
        if(this.master && this.context)
        {
            this.master.gain.setTargetAtTime(this.muted ? 0 : 0.65, this.context.currentTime, 0.05)
        }
        if(this.muted)
        {
            window.clearInterval(this.radioTimer)
        }
        return this.muted
    }

    playClick() { this.click.play() }
    playDing() { this.ding.play() }
    playBloop() { this.bloop.play() }
    playWhoosh() { this.whoosh.play() }
    playArcade() { this.arcade.play() }
    playCooking() { this.cookingLoop.play() }
    playCookingOneShot() { this.cookingHit.play() }
}
