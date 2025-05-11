//made by SpliZz

//autototem
let autoTotemListener;
function autototem(bot, action, hand) {
    let status
    if (action === "on") {
        status = "active"
        autoTotemListener = () => {
            if (bot.inventory.slots[45] != null) return
            else {
                const totem = bot.inventory.findInventoryItem("totem_of_undying", null, null)
                if (totem) {
                    if (!hand || hand === "offhand") {
                        bot.inventory.requiresConfirmation = false
                        bot.equip(totem, 'off-hand')
                    } else if (hand == "mainhand") {
                        bot.equip(totem, 'hand')
                    }
                }
            }
        }
        bot.on("physicsTick", autoTotemListener)
    } else if (action === "off") {
        status = "inactive"
        if (autoTotemListener) bot.removeListener("physicsTick", autoTotemListener)
    }
}

//autoarmor
let autoArmorListener;

function autoarmor(bot, action) {
    if (action === "on") {
        const armorSlots = {
            head: ["leather_helmet", "golden_helmet", "chainmail_helmet", "iron_helmet", "diamond_helmet", "netherite_helmet"],
            torso: ["leather_chestplate", "golden_chestplate", "chainmail_chestplate", "iron_chestplate", "diamond_chestplate", "netherite_chestplate"],
            legs: ["leather_leggings", "golden_leggings", "chainmail_leggings", "iron_leggings", "diamond_leggings", "netherite_leggings"],
            feet: ["leather_boots", "golden_boots", "chainmail_boots", "iron_boots", "diamond_boots", "netherite_boots"]
        };

        autoArmorListener = () => {
            for (const [slot, priorities] of Object.entries(armorSlots)) {
                const equipped = bot.inventory.slots[bot.getEquipmentDestSlot(slot)];
                const equippedIndex = equipped ? priorities.indexOf(equipped.name) : -1;

                // Finde bessere Rüstung im Inventar
                for (let i = priorities.length - 1; i > equippedIndex; i--) {
                    const item = bot.inventory.findInventoryItem(priorities[i]);
                    if (item) {
                        bot.equip(item, slot);
                        break;
                    }
                }

                // Schlechtere Duplikate wegwerfen
                for (let i = 0; i <= equippedIndex; i++) {
                    const item = bot.inventory.findInventoryItem(priorities[i]);
                    if (item) {
                        bot.tossStack(item).catch(() => {}); // Fehler ignorieren (z. B. wenn gerade geworfen wird)
                    }
                }
            }
        };

        bot.on("physicsTick", autoArmorListener);
    } else if (action === "off") {
        if (autoArmorListener) bot.removeListener("physicsTick", autoArmorListener);
    }
}

//autoeat
let autoEatListener;
let isEating = false;

function autoeat(bot, action) {
    const foods = ["apple", "baked_potato", "beetroot", "beetroot_soup", "bread", "carrot", "cooked_beef", "cooked_chicken", "cooked_cod", "cooked_mutton", "cooked_porkchop", "cooked_rabbit", "cooked_salmon", "cookie", "dried_kelp", "enchanted_golden_apple", "golden_apple", "golden_carrot", "honey_bottle", "melon_slice", "mushroom_stew", "poisonous_potato", "potato", "pufferfish", "pumpkin_pie", "rabbit_stew", "rotten_flesh", "spider_eye", "suspicious_stew", "sweet_berries"];
    const meat = ["cooked_beef", "cooked_chicken", "cooked_cod", "cooked_mutton", "cooked_porkchop", "cooked_rabbit", "cooked_salmon", "baked_potato"];

    if (action === "on") {
        autoEatListener = async () => {
            if (isEating || bot.food > 17) return;

            let itemToEat = null;

            // First look for good food
            for (const m of meat) {
                const item = bot.inventory.items().find(i => i.name === m);
                if (item) {
                    itemToEat = item;
                    break;
                }
            }

            // if no good food is present fall back to worse foods
            if (!itemToEat) {
                for (const f of foods) {
                    if (!meat.includes(f)) {
                        const item = bot.inventory.items().find(i => i.name === f);
                        if (item) {
                            itemToEat = item;
                            break;
                        }
                    }
                }
            }

            if (itemToEat) {
                isEating = true;
                try {
                    await bot.equip(itemToEat, 'hand');
                    await bot.consume();
                } catch (err) {
                    console.log("Fehler beim Essen:", err.message);
                }
                isEating = false;
            }
        };

        bot.on('physicsTick', autoEatListener);
    } else if (action === "off") {
        if (autoEatListener) bot.removeListener("physicsTick", autoEatListener);
    }
}


function plugin(bot) {
    bot.autototem = (action, hand) => autototem(bot, action, hand);
    bot.autoarmor = (action) => autoarmor(bot, action);
    bot.autoeat = (action) => autoeat(bot, action);
}

module.exports = plugin;
