export const areas = [
    { id: 'overview', label: 'Highway View', icon: 'road', hint: 'The whole dhaba, glowing beside the highway' },
    { id: 'entrance', label: 'Entrance', icon: 'gate', hint: 'Under the big red-and-yellow gate' },
    { id: 'dining', label: 'Dining Hall', icon: 'plate', hint: 'Wooden tables, steel thalis and busy waiters' },
    { id: 'kitchen', label: 'Open Kitchen', icon: 'fire', hint: 'Burners, tawas, kadhais and hanging utensils' },
    { id: 'tandoor', label: 'Tandoor', icon: 'fire', hint: 'Clay oven, live coals and fresh naan' },
    { id: 'chai', label: 'Chai Station', icon: 'cup', hint: 'Big kettles, small glasses, endless chai' },
    { id: 'display', label: 'Food Display', icon: 'plate', hint: 'Tap a dish to see what is cooking' },
    { id: 'outdoor', label: 'Charpai Yard', icon: 'star', hint: 'Rope beds and cold beer under the bulbs' },
    { id: 'trucks', label: 'Truck Yard', icon: 'truck', hint: 'Painted trucks, horns and reflective lights' },
    { id: 'prep', label: 'Veg Prep', icon: 'leaf', hint: 'Onions, tomatoes, chillies and spice jars' },
    { id: 'cash', label: 'Cash Counter', icon: 'note', hint: 'Settle the bill and take your receipt' }
]

export const dishes = [
    {
        id: 'butter-chicken',
        name: 'Butter Chicken',
        price: 320,
        spice: 2,
        color: '#c9502a',
        type: 'curry',
        description: 'Tandoori chicken simmered in a silky tomato, butter and fenugreek gravy.',
        ingredients: ['Tandoori chicken', 'Tomato', 'Butter', 'Cream', 'Kasuri methi', 'Garam masala']
    },
    {
        id: 'dal-makhani',
        name: 'Dal Makhani',
        price: 220,
        spice: 1,
        color: '#6d4526',
        type: 'curry',
        description: 'Black lentils and kidney beans cooked overnight on the tandoor embers.',
        ingredients: ['Urad dal', 'Rajma', 'Butter', 'Cream', 'Ginger', 'Garlic']
    },
    {
        id: 'paneer-tikka',
        name: 'Paneer Tikka',
        price: 260,
        spice: 3,
        color: '#e08a2e',
        type: 'tikka',
        description: 'Charred cottage cheese cubes with peppers and onions in a tandoor.',
        ingredients: ['Paneer', 'Capsicum', 'Onion', 'Yogurt', 'Tikka masala', 'Mustard oil']
    },
    {
        id: 'chicken-tikka',
        name: 'Chicken Tikka',
        price: 290,
        spice: 3,
        color: '#a84422',
        type: 'tikka',
        description: 'Smoky boneless chicken with a red chilli and yogurt marinade.',
        ingredients: ['Chicken', 'Yogurt', 'Red chilli', 'Ginger', 'Garlic', 'Lemon']
    },
    {
        id: 'biryani',
        name: 'Dum Biryani',
        price: 340,
        spice: 3,
        color: '#c99338',
        type: 'rice',
        description: 'Long-grain rice layered with spiced chicken and sealed under dough.',
        ingredients: ['Basmati rice', 'Chicken', 'Saffron', 'Onion', 'Yogurt', 'Whole spices']
    },
    {
        id: 'chole-bhature',
        name: 'Chole Bhature',
        price: 240,
        spice: 2,
        color: '#b37024',
        type: 'curry',
        description: 'Puffy fried bread with tangy chickpeas, pickle and onion rings.',
        ingredients: ['Chickpeas', 'Maida', 'Amla', 'Ginger', 'Jeera', 'Green chilli']
    },
    {
        id: 'tandoori-roti',
        name: 'Tandoori Roti',
        price: 40,
        spice: 0,
        color: '#c68b45',
        type: 'bread',
        description: 'Whole wheat flatbread slapped onto the tandoor wall until blistered.',
        ingredients: ['Whole wheat flour', 'Water', 'Salt', 'Tandoor heat']
    },
    {
        id: 'naan',
        name: 'Butter Naan',
        price: 55,
        spice: 0,
        color: '#dda44e',
        type: 'bread',
        description: 'Leavened white flour naan, brushed with butter and coriander.',
        ingredients: ['Maida', 'Yeast', 'Yogurt', 'Butter', 'Coriander']
    },
    {
        id: 'paratha',
        name: 'Aloo Paratha',
        price: 90,
        spice: 1,
        color: '#cf9a44',
        type: 'bread',
        description: 'Flaky layered flatbread stuffed with spiced mashed potato.',
        ingredients: ['Wheat flour', 'Potato', 'Green chilli', 'Coriander', 'Ghee']
    },
    {
        id: 'samosa',
        name: 'Samosa',
        price: 60,
        spice: 2,
        color: '#d99a32',
        type: 'snack',
        description: 'Golden triangular pastry pockets with a spiced potato filling.',
        ingredients: ['Maida', 'Potato', 'Peas', 'Jeera', 'Green chilli']
    },
    {
        id: 'pakora',
        name: 'Onion Pakora',
        price: 70,
        spice: 2,
        color: '#c17724',
        type: 'snack',
        description: 'Crisp onion fritters with gram flour and mint chutney.',
        ingredients: ['Onion', 'Gram flour', 'Ajwain', 'Mint', 'Chilli']
    },
    {
        id: 'lassi',
        name: 'Sweet Lassi',
        price: 80,
        spice: 0,
        color: '#e6c98a',
        type: 'drink',
        description: 'Thick whipped yogurt with sugar, cardamom and a pistachio dusting.',
        ingredients: ['Yogurt', 'Sugar', 'Cardamom', 'Pistachio', 'Ice']
    },
    {
        id: 'chai',
        name: 'Masala Chai',
        price: 30,
        spice: 1,
        color: '#9d602c',
        type: 'drink',
        description: 'Strong leaf tea boiled with milk, ginger, cloves and jaggery.',
        ingredients: ['Tea leaves', 'Milk', 'Ginger', 'Cardamom', 'Cloves', 'Sugar']
    },
    {
        id: 'jalebi',
        name: 'Jalebi',
        price: 90,
        spice: 0,
        color: '#e8a11f',
        type: 'sweet',
        description: 'Hot crispy spirals drenched in saffron syrup.',
        ingredients: ['Gram flour', 'Sugar', 'Saffron', 'Cardamom', 'Ghee']
    },
    {
        id: 'gulab-jamun',
        name: 'Gulab Jamun',
        price: 100,
        spice: 0,
        color: '#8a4d22',
        type: 'sweet',
        description: 'Soft milk dumplings soaking in cardamom-rose syrup.',
        ingredients: ['Khoya', 'Milk', 'Sugar', 'Cardamom', 'Rose water']
    },
    {
        id: 'pav-bhaji',
        name: 'Pav Bhaji',
        price: 180,
        spice: 2,
        color: '#c65324',
        type: 'curry',
        description: 'Mashed vegetable bhaji with buttered pav and a squeeze of lemon.',
        ingredients: ['Potato', 'Tomato', 'Capsicum', 'Peas', 'Butter', 'Pav']
    }
]

export const dishById = Object.fromEntries(dishes.map((dish) => [dish.id, dish]))

export const recipes = [
    {
        id: 'butter-chicken',
        name: 'DHABA SPECIAL BUTTER CHICKEN',
        station: 'kadhai',
        camera: 'kitchen',
        ingredients: [
            { id: 'chicken', label: 'Chicken', color: '#cf805d' },
            { id: 'tomato', label: 'Tomato', color: '#d43a25' },
            { id: 'butter', label: 'Butter', color: '#f3d473' },
            { id: 'cream', label: 'Cream', color: '#f1e4c9' },
            { id: 'spice', label: 'Garam masala', color: '#a8501f' }
        ],
        result: 'butter-chicken'
    },
    {
        id: 'paneer-tikka',
        name: 'PANEER TIKKA',
        station: 'tandoor',
        camera: 'tandoor',
        ingredients: [
            { id: 'paneer', label: 'Paneer', color: '#f0e1b4' },
            { id: 'capsicum', label: 'Capsicum', color: '#429443' },
            { id: 'onion', label: 'Onion', color: '#b980ab' },
            { id: 'spice', label: 'Tikka masala', color: '#b8451c' }
        ],
        result: 'paneer-tikka'
    },
    {
        id: 'chai',
        name: 'KARAK MASALA CHAI',
        station: 'chai',
        camera: 'chai',
        ingredients: [
            { id: 'water', label: 'Water', color: '#6fa8c9' },
            { id: 'tea', label: 'Tea leaves', color: '#3d2a1b' },
            { id: 'milk', label: 'Milk', color: '#f0e9d8' },
            { id: 'spice', label: 'Cardamom', color: '#9db45e' }
        ],
        result: 'chai'
    },
    {
        id: 'tandoori-roti',
        name: 'TANDOORI ROTI',
        station: 'tandoor',
        camera: 'tandoor',
        ingredients: [
            { id: 'flour', label: 'Whole wheat', color: '#c69a5e' },
            { id: 'water', label: 'Water', color: '#6fa8c9' },
            { id: 'salt', label: 'Salt', color: '#e8e4dc' }
        ],
        result: 'tandoori-roti'
    },
    {
        id: 'dal-makhani',
        name: 'DAL MAKHANI',
        station: 'kadhai',
        camera: 'kitchen',
        ingredients: [
            { id: 'dal', label: 'Black lentils', color: '#4b3427' },
            { id: 'tomato', label: 'Tomato', color: '#d43a25' },
            { id: 'butter', label: 'Butter', color: '#f3d473' },
            { id: 'cream', label: 'Cream', color: '#f1e4c9' }
        ],
        result: 'dal-makhani'
    },
    {
        id: 'pav-bhaji',
        name: 'PAV BHAJI',
        station: 'tawa',
        camera: 'kitchen',
        ingredients: [
            { id: 'potato', label: 'Potato', color: '#c8a560' },
            { id: 'tomato', label: 'Tomato', color: '#d43a25' },
            { id: 'capsicum', label: 'Capsicum', color: '#429443' },
            { id: 'butter', label: 'Butter', color: '#f3d473' }
        ],
        result: 'pav-bhaji'
    }
]

export const recipeById = Object.fromEntries(recipes.map((recipe) => [recipe.id, recipe]))

export const stories = {
    charpai: 'The charpai is the dhaba living room. Truck drivers swap routes here over endless chai until the stars fade.',
    truck: 'Every truck is a rolling canvas. The mirrors, flowers and “HORN OK PLEASE” are a blessing for the long road.',
    poster: 'Hand-painted film posters have advertised Saturday night cinema at the dhaba for thirty years.',
    radio: 'The old radio plays film songs, cricket scores and the occasional political jingle. Nobody agrees on the station.',
    handpump: 'No dhaba running water? Impossible. The handpump is the first stop before every meal.',
    spice: 'Masalas are ground fresh each morning. The chilli version makes grown drivers cry — and order seconds.',
    vegetable: 'Onions, tomatoes and green chillies arrive by the crate every dawn from the market town.',
    fan: 'The ceiling fans fight a losing battle against the tandoor. Everyone still insists on sitting underneath them.',
    light: 'Each bulb is hung by hand. The red ones are for luck, the green ones are for the chai counter.',
    naan: 'Naan sticks to the clay wall, blisters, then falls into the basket. Timing is everything.'
}

export const hints = [
    'Tap anything that glows — the dhaba is full of secrets',
    'Drag to look around. Use EXPLORE to jump between areas',
    'Hungry? Tap a dish, then add it to your order',
    'Try COOK with the chef to make a dhaba special',
    'Truckers swear the best chai is at the far counter',
    'Switch the lights off to see how the highway glows',
    'Every bulb, poster and spice jar has a story'
]
