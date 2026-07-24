const MODULE_ID = 'dualitys-denizes-v11';

Hooks.once('init', () => {
    console.log(`${MODULE_ID} | Initializing Duality's Denizes`);
});

Hooks.on('ready', async () => {
    if (game.system.id !== 'daggerheart') return;

    // 1. Принудительная индексация паков для системы
    await registerCompendiumSources();
    
    // 2. Регистрация доменов
    await registerVoidDomains();
});

async function registerCompendiumSources() {
    const myPacks = [
        `${MODULE_ID}.DH-void-classes`,
        `${MODULE_ID}.DH-void-subclasses`,
        `${MODULE_ID}.DH-void-ancestries`,
        `${MODULE_ID}.DH-void-communities`,
        `${MODULE_ID}.DH-bestiary`,
        `${MODULE_ID}.DH-dnd-conversions`
    ];

    for (const packId of myPacks) {
        const pack = game.packs.get(packId);
        if (pack) {
            // Индексируем поля, которые важны для связи Класс-Подкласс
            await pack.getIndex({ fields: ["system.class", "system.type", "system.identifier", "name"] });
        }
    }
    console.log(`${MODULE_ID} | All compendiums indexed for Character Creator.`);
}

async function registerVoidDomains() {
    let homebrewSettings;
    try {
        homebrewSettings = game.settings.get('daggerheart', 'Homebrew');
    } catch (e) {
        try {
            homebrewSettings = game.settings.get('daggerheart', 'homebrew');
        } catch (e2) {
            return;
        }
    }

    if (!homebrewSettings) return;

    const domainData = {
        'dread': {
            id: 'dread',
            label: 'Ужас',
            src: `modules/${MODULE_ID}/assets/icons/dread-domain.webp`,
            description: 'Домен ужаса'
        },
        'blood': {
            id: 'blood',
            label: 'Кровь',
            src: `modules/${MODULE_ID}/assets/icons/blood-domain.webp`,
            description: 'Домен крови'
        }
    };

    let updates = false;
    const currentDomains = { ...(homebrewSettings.domains || {}) };

    for (const [key, data] of Object.entries(domainData)) {
        if (!currentDomains[key]) {
            currentDomains[key] = data;
            updates = true;
        }
    }

    if (updates) {
        try {
            const newSettings = { ...homebrewSettings, domains: currentDomains };
            let key = game.settings.settings.has('daggerheart.Homebrew') ? 'Homebrew' : 'homebrew';
            await game.settings.set('daggerheart', key, newSettings);
            ui.notifications.info(`${MODULE_ID} | Registered missing domains.`);
        } catch (err) {
            console.error(`${MODULE_ID} | Failed to update settings:`, err);
        }
    }
}