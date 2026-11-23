import Experience from './Experience.js'
import gsap from 'gsap'
import { areas, dishes, dishById, recipes, recipeById, stories, hints } from './World/dhaba/data.js'

export default class Controller
{
    constructor()
    {
        this.experience = new Experience()
        this.camera = this.experience.camera
        this.sounds = this.experience.sounds
        this.preLoader = this.experience.preLoader
        this.config = this.experience.config

        this.started = false
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        this.stall = null
        this.world = null

        this.hud = document.querySelector('.hud')
        this.hintText = document.querySelector('#hintText')
        this.backButton = document.querySelector('#backButton')
        this.soundButton = document.querySelector('#soundButton')
        this.settingsButton = document.querySelector('#settingsButton')
        this.resetButton = document.querySelector('#resetButton')
        this.orderButton = document.querySelector('#orderButton')
        this.orderCount = document.querySelector('#orderCount')
        this.toast = document.querySelector('#toast')
        this.navRail = document.querySelector('#navRail')
        this.storyCard = document.querySelector('#storyCard')
        this.storyTitle = document.querySelector('#storyTitle')
        this.storyText = document.querySelector('#storyText')
        this.menuPanel = document.querySelector('#menuPanel')
        this.menuList = document.querySelector('#menuList')
        this.dishCard = document.querySelector('#dishCard')
        this.recipeCard = document.querySelector('#recipeCard')
        this.orderDrawer = document.querySelector('#orderDrawer')
        this.settingsPanel = document.querySelector('#settingsPanel')

        this.setLogic()
        this.setHudControls()
        this.buildNavigation()
        this.buildMenu()
        this.buildRecipeList()
        this.setPanels()

        this.preLoader.on('start', () => this.start())

        window.addEventListener('keydown', (event) =>
        {
            if(event.key === 'Escape' && this.started)
            {
                const openPanel = this.getOpenPanel()
                if(openPanel)
                {
                    this.closePanels()
                }
                else
                {
                    this.back()
                }
            }
        })
    }

    onWorldReady(world)
    {
        this.world = world
        this.stall = world
    }

    setLogic()
    {
        this.logic = {
            locked: false,
            mode: 'overview',
            history: [],
            order: [],
            currentDish: null,
            currentRecipe: null,
            recipeStep: 0,
            radioOn: false,
            lightsOn: true,
            quality: this.config.vertical ? 'medium' : 'high'
        }
    }

    setPanels()
    {
        document.querySelectorAll('[data-close]').forEach((button) =>
        {
            button.addEventListener('click', () => this.closePanels())
        })

        document.querySelectorAll('.panelScrim').forEach((scrim) =>
        {
            scrim.addEventListener('click', () => this.closePanels())
        })
    }

    buildNavigation()
    {
        if(!this.navRail)
        {
            return
        }
        areas.forEach((area) =>
        {
            const button = document.createElement('button')
            button.type = 'button'
            button.className = 'navItem'
            button.dataset.area = area.id
            button.innerHTML = `<span class="navIcon">${this.navIcon(area.icon)}</span><span class="navLabel">${area.label}</span>`
            button.addEventListener('click', () => this.explore(area.id, area.hint))
            this.navRail.appendChild(button)
        })
    }

    navIcon(icon)
    {
        const icons = {
            road: '━', gate: '⌂', plate: '◉', fire: '♨', cup: '☕', star: '✦',
            truck: '▰', leaf: '♣', note: '₹'
        }
        return icons[icon] || '•'
    }

    buildMenu()
    {
        if(!this.menuList)
        {
            return
        }
        dishes.forEach((dish) =>
        {
            const item = document.createElement('button')
            item.type = 'button'
            item.className = 'menuRow'
            item.dataset.dish = dish.id
            item.innerHTML = `
                <span class="menuSwatch" style="--swatch:${dish.color}"></span>
                <span class="menuRowName">${dish.name}</span>
                <span class="menuSpice">${'🌶'.repeat(dish.spice) || '—'}</span>
                <span class="menuPrice">₹${dish.price}</span>
            `
            item.addEventListener('click', () => this.openDish(dish.id))
            this.menuList.appendChild(item)
        })
    }

    buildRecipeList()
    {
        const list = document.querySelector('#recipeList')
        if(!list)
        {
            return
        }
        recipes.forEach((recipe) =>
        {
            const item = document.createElement('button')
            item.type = 'button'
            item.className = 'recipeRow'
            item.dataset.recipe = recipe.id
            item.innerHTML = `<span class="recipeNumber">0${recipes.indexOf(recipe) + 1}</span><span>${recipe.name}</span><span class="recipeArrow">→</span>`
            item.addEventListener('click', () => this.startRecipe(recipe.id))
            list.appendChild(item)
        })
    }

    setHudControls()
    {
        this.backButton.addEventListener('click', () => this.back())
        this.resetButton.addEventListener('click', () =>
        {
            this.closePanels()
            this.explore('overview', 'Back on the highway — where to next?')
        })
        this.soundButton.addEventListener('click', () =>
        {
            const muted = this.sounds.toggleMute()
            this.soundButton.textContent = muted ? 'SOUND OFF' : 'SOUND ON'
            this.soundButton.classList.toggle('is-muted', muted)
        })
        this.settingsButton.addEventListener('click', () => this.togglePanel('settingsPanel'))
        this.orderButton.addEventListener('click', () => this.openOrder())

        document.querySelectorAll('[data-quality]').forEach((button) =>
        {
            button.addEventListener('click', () =>
            {
                const level = button.dataset.quality
                this.logic.quality = level
                this.experience.performance.manual = true
                if(this.world)
                {
                    this.world.setQuality(level)
                }
                document.querySelectorAll('[data-quality]').forEach((candidate) => candidate.classList.toggle('is-active', candidate === button))
                this.setHint(`Visual quality set to ${level.toUpperCase()}`)
                this.sounds.playClick()
            })
        })

        const cookButton = document.querySelector('#cookButton')
        if(cookButton)
        {
            cookButton.addEventListener('click', () => this.togglePanel('recipeCard'))
        }
        const menuButton = document.querySelector('#menuButton')
        if(menuButton)
        {
            menuButton.addEventListener('click', () => this.openMenu())
        }
        const checkoutButton = document.querySelector('#checkoutButton')
        if(checkoutButton)
        {
            checkoutButton.addEventListener('click', () =>
            {
                if(!this.logic.order.length)
                {
                    this.showToast('NOTHING TO BILL YET — ADD A DISH FIRST', 'red')
                    return
                }
                this.sounds.playDing()
                checkoutButton.textContent = 'RECEIPT PRINTED ✓'
                const items = this.logic.order.length
                window.setTimeout(() =>
                {
                    this.logic.order = []
                    this.orderCount.textContent = '0'
                    this.renderOrder()
                    checkoutButton.textContent = 'PRINT THE BILL'
                    this.closePanels()
                    this.showToast(`${items} ITEM${items > 1 ? 'S' : ''} SERVED — COME AGAIN!`, 'green')
                }, 1400)
            })
        }
    }

    start()
    {
        if(this.started)
        {
            return
        }
        this.started = true
        this.hud.classList.add('is-visible')
        this.setHint('Tap anything that glows — the dhaba is full of secrets')
        this.startHintRotation()
    }

    startHintRotation()
    {
        window.setInterval(() =>
        {
            if(!this.started || this.getOpenPanel() || this.logic.locked)
            {
                return
            }
            this.setHint(hints[Math.floor(Math.random() * hints.length)])
        }, 14000)
    }

    async explore(name, hint)
    {
        if(!this.started || this.logic.locked || !this.camera.anchors[name])
        {
            return
        }
        this.closePanels()
        this.logic.locked = true
        this.logic.mode = name
        this.updateHistory(name)
        this.updateBack()
        this.updateNav(name)

        if(hint)
        {
            this.setHint(hint)
        }
        this.sounds.playWhoosh()
        await this.camera.transitions.goTo(name, this.reducedMotion ? 0.14 : 1.6)
        this.logic.locked = false
    }

    updateHistory(name)
    {
        if(this.logic.history[this.logic.history.length - 1] !== name)
        {
            this.logic.history.push(name)
            if(this.logic.history.length > 12)
            {
                this.logic.history.shift()
            }
        }
    }

    back()
    {
        if(this.getOpenPanel())
        {
            this.closePanels()
            return
        }
        if(this.logic.locked)
        {
            return
        }
        this.logic.history.pop()
        const previous = this.logic.history.pop() || 'overview'
        this.explore(previous, 'Back to where the story started')
    }

    updateBack()
    {
        this.backButton.classList.toggle('is-visible', this.logic.mode !== 'overview')
    }

    updateNav(name)
    {
        document.querySelectorAll('.navItem').forEach((item) =>
        {
            item.classList.toggle('is-active', item.dataset.area === name)
        })
    }

    setHint(text)
    {
        if(!this.hintText)
        {
            return
        }
        this.hintText.textContent = text
        gsap.fromTo(this.hintText, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
    }

    showToast(text, tone = 'default')
    {
        if(!this.toast)
        {
            return
        }
        this.toast.textContent = text
        this.toast.className = `toast is-visible toast-${tone}`
        window.clearTimeout(this.toastTimeout)
        this.toastTimeout = window.setTimeout(() => this.toast.classList.remove('is-visible'), 2600)
    }

    showStory(title, text)
    {
        if(!this.storyCard)
        {
            this.showToast(text)
            return
        }
        this.storyTitle.textContent = title
        this.storyText.textContent = text
        this.storyCard.classList.add('is-visible')
        window.clearTimeout(this.storyTimeout)
        this.storyTimeout = window.setTimeout(() => this.storyCard.classList.remove('is-visible'), 5200)
    }

    getOpenPanel()
    {
        return document.querySelector('.ui-panel.is-open')
    }

    closePanels()
    {
        document.querySelectorAll('.ui-panel').forEach((panel) => panel.classList.remove('is-open'))
    }

    togglePanel(id)
    {
        const panel = document.getElementById(id)
        if(!panel)
        {
            return
        }
        const wasOpen = panel.classList.contains('is-open')
        this.closePanels()
        if(!wasOpen)
        {
            panel.classList.add('is-open')
        }
    }

    async handleInteraction(interaction, mesh)
    {
        if(!this.started || this.logic.locked)
        {
            return
        }

        const action = interaction.action

        if(action === 'menu')
        {
            this.sounds.playClick()
            await this.explore('menu', 'The full menu — tap a dish for the story')
            this.openMenu()
            return
        }

        if(action === 'dish' || action === 'dishLabel')
        {
            const dishId = interaction.dishId
            if(dishId)
            {
                await this.explore('display', 'Fresh from the display — tap ADD TO ORDER if you like it')
                this.openDish(dishId)
            }
            else
            {
                await this.explore('display', 'Tap a dish to see ingredients and price')
            }
            return
        }

        if(action === 'chai' || action === 'chaiPour')
        {
            this.sounds.playPour()
            await this.explore('chai', 'The kettle is on — pouring a hot glass of masala chai')
            if(this.world)
            {
                this.world.pourChai()
            }
            if(action === 'chai')
            {
                this.openDish('chai')
            }
            return
        }

        if(action === 'tandoor')
        {
            this.sounds.playFire()
            await this.explore('tandoor', 'The clay oven is roaring — watch the naan blister')
            if(this.world)
            {
                this.world.flareTandoor()
            }
            return
        }

        if(action === 'cook')
        {
            this.sounds.playClick()
            this.togglePanel('recipeCard')
            return
        }

        if(action === 'cookIngredient')
        {
            this.handleCookingClick(interaction.ingredientId, mesh)
            return
        }

        if(action === 'truck' || action === 'horn' || action === 'hornSign')
        {
            this.sounds.playHorn()
            await this.explore('trucks', 'Horn OK please — the trucks are awake')
            if(this.world)
            {
                const truck = this.world.trucks && this.world.trucks[interaction.index || 0]
                this.world.flashTruck(truck)
            }
            return
        }

        if(action === 'charpai')
        {
            await this.explore('outdoor', 'Pull up a charpai and stay a while')
            this.showStory('CHARPAI STORIES', stories.charpai)
            return
        }

        if(action === 'light')
        {
            if(this.world)
            {
                const on = this.world.toggleLight(mesh)
                this.sounds.playClick()
                this.showToast(on ? 'BULB ON — THE YARD GLOWS AGAIN' : 'BULB OFF — A LITTLE DARKER NOW')
            }
            return
        }

        if(action === 'fan' || action === 'fanSwitch')
        {
            if(this.world)
            {
                const index = interaction.fanIndex === undefined ? 0 : interaction.fanIndex
                const fan = this.world.fans[index]
                const speed = this.world.toggleFan(fan)
                this.sounds.playFan()
                this.setHint(speed === 0 ? 'Fan switched off — the kitchen gets hotter' : `Fan speed ${speed === 1 ? 'normal' : 'full blast'}`)
            }
            return
        }

        if(action === 'radio')
        {
            this.toggleRadio()
            return
        }

        if(action === 'cash')
        {
            this.sounds.playDing()
            await this.explore('cash', 'The bill counter — your order is waiting')
            this.openOrder()
            return
        }

        if(action === 'spice')
        {
            this.sounds.playPour()
            await this.explore('spice', 'Freshly ground masalas — tap a jar to release the aroma')
            if(this.world && mesh.parent)
            {
                this.world.spiceBurst(mesh.parent)
            }
            this.showStory('MASALA SHELF', stories.spice)
            return
        }

        if(action === 'veg')
        {
            await this.explore('prep', 'Today’s vegetables — chopped by hand, cooked with fire')
            if(this.world)
            {
                this.world.shakeVegetables(mesh.parent)
            }
            this.showStory(interaction.vegName || 'FRESH VEG', stories.vegetable)
            return
        }

        if(action === 'water')
        {
            this.sounds.playWater()
            if(this.world)
            {
                this.world.splashWater(this.world.handpump)
            }
            this.showToast('COLD WATER — FRESH FROM THE HANPUMP', 'blue')
            return
        }

        if(action === 'poster')
        {
            this.sounds.playClick()
            if(this.world)
            {
                this.world.popPoster(mesh)
            }
            this.showStory('WALL OF MEMORIES', stories.poster)
            return
        }

        if(action === 'fridge' || action === 'bottle' || action === 'oil' || action === 'plate' || action === 'glass')
        {
            this.sounds.playBloop()
            this.showToast(interaction.label.toUpperCase(), 'default')
            return
        }

        if(action === 'streetlight' || action === 'neon' || action === 'sign' || action === 'highwaySign')
        {
            this.sounds.playDing()
            if(interaction.camera)
            {
                await this.explore(interaction.camera, interaction.hint || interaction.label)
            }
            this.showToast(interaction.label.toUpperCase(), 'amber')
            return
        }

        this.sounds.playBloop()
        if(interaction.hint)
        {
            this.showStory(interaction.label, interaction.hint)
        }
        else
        {
            this.setHint(interaction.label)
        }
    }

    toggleRadio()
    {
        this.logic.radioOn = !this.logic.radioOn
        if(this.world)
        {
            this.world.radioOn = this.logic.radioOn
            if(this.world.radioLight)
            {
                this.world.radioLight.visible = this.logic.radioOn
            }
        }
        this.sounds.playRadio(this.logic.radioOn)
        this.showStory('THE OLD RADIO', this.logic.radioOn ? `${stories.radio} The dial is glowing now.` : 'The radio goes quiet. The highway is loud enough.')
    }

    openMenu()
    {
        this.togglePanel('menuPanel')
    }

    openDish(id)
    {
        const dish = dishById[id]
        if(!dish)
        {
            return
        }
        this.logic.currentDish = id
        document.querySelector('#dishName').textContent = dish.name
        document.querySelector('#dishPrice').textContent = `₹${dish.price}`
        document.querySelector('#dishDescription').textContent = dish.description
        document.querySelector('#dishSpice').innerHTML = dish.spice ? `<span>SPICE</span> ${'◆'.repeat(dish.spice)}` : '<span>SPICE</span> MILD'
        document.querySelector('#dishSwatch').style.background = dish.color
        document.querySelector('#dishIngredients').innerHTML = dish.ingredients.map((ingredient) => `<span>${ingredient}</span>`).join('')

        const addButton = document.querySelector('#addDishButton')
        addButton.onclick = () =>
        {
            this.addOrder(id)
            this.sounds.playDing()
            addButton.textContent = 'ADDED ✓'
            window.setTimeout(() => { addButton.textContent = 'ADD TO ORDER' }, 1400)
        }
        this.closePanels()
        this.dishCard.classList.add('is-open')
        if(this.world)
        {
            this.world.highlightDish(id)
        }
    }

    addOrder(id)
    {
        this.logic.order.push(id)
        if(this.orderCount)
        {
            this.orderCount.textContent = this.logic.order.length
        }
        const dish = dishById[id]
        this.showToast(`${dish ? dish.name.toUpperCase() : id} ADDED TO ORDER`, 'green')
        this.renderOrder()
    }

    renderOrder()
    {
        const list = document.querySelector('#orderList')
        const total = document.querySelector('#orderTotal')
        if(!list || !total)
        {
            return
        }
        const counts = {}
        this.logic.order.forEach((id) => { counts[id] = (counts[id] || 0) + 1 })
        const entries = Object.entries(counts)

        if(!entries.length)
        {
            list.innerHTML = '<p class="emptyOrder">Your order is empty. Tap a dish in the display or menu.</p>'
            total.textContent = '₹0'
            return
        }

        let sum = 0
        list.innerHTML = entries.map(([id, quantity]) =>
        {
            const dish = dishById[id]
            sum += (dish ? dish.price : 0) * quantity
            return `<div class="orderRow"><span>${quantity} × ${dish ? dish.name : id}</span><span>₹${(dish ? dish.price : 0) * quantity}</span></div>`
        }).join('')
        total.textContent = `₹${sum}`
    }

    openOrder()
    {
        this.renderOrder()
        this.togglePanel('orderDrawer')
    }

    startRecipe(id)
    {
        const recipe = recipeById[id]
        if(!recipe || !this.world)
        {
            return
        }
        this.logic.currentRecipe = id
        this.logic.recipeStep = 0
        this.closePanels()
        this.sounds.playCookingOneShot()
        this.world.startCooking(recipe)
        this.explore(recipe.camera, `Chef mode: ${recipe.name} — tap the ingredients on the counter`)
        this.updateRecipePanel()
        window.setTimeout(() => this.recipeCard.classList.add('is-open'), this.reducedMotion ? 100 : 1450)
    }

    updateRecipePanel()
    {
        const recipe = recipeById[this.logic.currentRecipe]
        if(!recipe)
        {
            return
        }
        const title = document.querySelector('#recipeTitle')
        const stepText = document.querySelector('#recipeStep')
        const ingredientList = document.querySelector('#recipeIngredients')
        const actionButton = document.querySelector('#recipeAction')

        title.textContent = recipe.name
        stepText.textContent = `STEP ${Math.min(this.logic.recipeStep + 1, recipe.ingredients.length + 1)} / ${recipe.ingredients.length + 2}`

        ingredientList.innerHTML = recipe.ingredients.map((ingredient, index) =>
        {
            const done = index < this.logic.recipeStep
            const next = index === this.logic.recipeStep
            return `<button type="button" class="ingredientChip ${done ? 'is-done' : ''} ${next ? 'is-next' : ''}" data-ingredient="${ingredient.id}" ${done || !next ? 'disabled' : ''}>
                <span class="ingredientDot" style="--dot:${ingredient.color}"></span>${ingredient.label}
            </button>`
        }).join('')

        ingredientList.querySelectorAll('[data-ingredient]').forEach((button) =>
        {
            button.addEventListener('click', () => this.handleCookingClick(button.dataset.ingredient))
        })

        if(this.logic.recipeStep >= recipe.ingredients.length)
        {
            actionButton.style.display = 'block'
            actionButton.textContent = this.logic.recipeStep === recipe.ingredients.length ? 'STIR & COOK' : 'SERVE THE DISH'
            actionButton.onclick = () => this.advanceCooking()
        }
        else
        {
            actionButton.style.display = 'none'
        }
    }

    handleCookingClick(ingredientId)
    {
        const recipe = recipeById[this.logic.currentRecipe]
        if(!recipe || !this.world || this.logic.recipeStep >= recipe.ingredients.length)
        {
            return
        }
        const expected = recipe.ingredients[this.logic.recipeStep]
        if(!expected || expected.id !== ingredientId)
        {
            this.showToast('WRONG INGREDIENT — LOOK AT THE RECIPE CARD', 'red')
            this.sounds.playBloop()
            return
        }
        if(this.world.addCookingIngredient(recipe, ingredientId))
        {
            this.logic.recipeStep++
            this.sounds.playDing()
            this.updateRecipePanel()
            if(this.logic.recipeStep >= recipe.ingredients.length)
            {
                this.setHint('All ingredients in — now stir and cook!')
            }
        }
    }

    advanceCooking()
    {
        const recipe = recipeById[this.logic.currentRecipe]
        if(!recipe)
        {
            return
        }

        if(this.logic.recipeStep === recipe.ingredients.length)
        {
            this.logic.recipeStep++
            this.sounds.playCooking()
            this.setHint('Sizzling… stirring… the dhaba smells incredible')
            document.querySelector('#recipeStep').textContent = 'COOKING…'
            document.querySelector('#recipeAction').style.display = 'none'
            window.setTimeout(() =>
            {
                this.logic.recipeStep++
                this.updateRecipePanel()
            }, this.reducedMotion ? 200 : 1900)
            return
        }

        this.world.finishCooking(recipe)
        this.sounds.playDing()
        this.addOrder(recipe.result)
        this.showToast(`${recipe.name} IS READY — ADDED TO YOUR ORDER`, 'green')
        this.logic.recipeStep++
        this.updateRecipePanel()
        document.querySelector('#recipeStep').textContent = 'READY TO SERVE ✓'
        document.querySelector('#recipeAction').style.display = 'none'
    }
}
