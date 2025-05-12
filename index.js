//made by SpliZz
const fs = require('fs');
const { format } = require('date-fns');
let formatted
setInterval(() => {
const now = new Date();
formatted = format(now, 'MM.dd.yy ; HH:mm:ss');
}, 1000);

//autototem
let autoTotemListener;
function autototem(bot, action, hand) {
    registerModuleCall('autototem', action, hand)
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
    registerModuleCall('autoarmor', action)
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
                for (let i = priorities.length - 1; i > equippedIndex; i--) {
                    const item = bot.inventory.findInventoryItem(priorities[i]);
                    if (item) {
                        bot.equip(item, slot);
                        break;
                    }
                }
                for (let i = 0; i <= equippedIndex; i++) {
                    const item = bot.inventory.findInventoryItem(priorities[i]);
                    if (item) {
                        bot.tossStack(item).catch(() => {});
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
    registerModuleCall('autoeat', action)
    const foods = ["apple", "baked_potato", "beetroot", "beetroot_soup", "bread", "carrot", "cooked_beef", "cooked_chicken", "cooked_cod", "cooked_mutton", "cooked_porkchop", "cooked_rabbit", "cooked_salmon", "cookie", "dried_kelp", "enchanted_golden_apple", "golden_apple", "golden_carrot", "honey_bottle", "melon_slice", "mushroom_stew", "poisonous_potato", "potato", "pufferfish", "pumpkin_pie", "rabbit_stew", "rotten_flesh", "spider_eye", "suspicious_stew", "sweet_berries"];
    const meat = ["cooked_beef", "cooked_chicken", "cooked_cod", "cooked_mutton", "cooked_porkchop", "cooked_rabbit", "cooked_salmon", "baked_potato"];

    if (action === "on") {
        autoEatListener = async () => {
            if (isEating || bot.food > 17) return;

            let itemToEat = null;
            for (const m of meat) {
                const item = bot.inventory.items().find(i => i.name === m);
                if (item) {
                    itemToEat = item;
                    break;
                }
            }
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

//spammers
let spamInterval;
function spammer(bot, action, message, delay) {
    registerModuleCall('spammer', action, message, delay)
    if (action === "on") {
        if (spamInterval) clearInterval(spamInterval);

        spamInterval = setInterval(() => {
            bot.chat(message);
        }, delay);
    }

    else if (action === "off") {
        if (spamInterval) {
            clearInterval(spamInterval);
            spamInterval = null;
        }
    }
}

let fileSpamInterval;
function filespammer(bot, action, file, order, delay) {
    registerModuleCall('filespammer', action, file, order, delay)
    if (action === "on") {
        if (fs.existsSync(file)) {
            const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);


            if (lines.length === 0) return;

            if (fileSpamInterval) clearInterval(fileSpamInterval);

            if (order === "random") {
                fileSpamInterval = setInterval(() => {
                    const randomLine = lines[Math.floor(Math.random() * lines.length)];
                    bot.chat(randomLine);
                }, delay);
            }

            else if (order === "first") {
                let index = 0;
                fileSpamInterval = setInterval(() => {
                    bot.chat(lines[index]);
                    index = (index + 1) % lines.length;
                }, delay);
            }

            else if (order === "last") {
                let index = lines.length - 1;
                fileSpamInterval = setInterval(() => {
                    bot.chat(lines[index]);
                    index = (index - 1 + lines.length) % lines.length;
                }, delay);
            }
        }
    }

    else if (action === "off") {
        if (fileSpamInterval) {
            clearInterval(fileSpamInterval);
            fileSpamInterval = null;
        }
    }
}

//antiafk
let movementinterval
function antiafk(bot, action) {
    registerModuleCall('antiafk', action)
    if (movementinterval) clearInterval(movementinterval);
    if (action === "on") {
        movementinterval = setInterval(() => {
            bot.setControlState("forward", true);
            setTimeout(() => {
                bot.setControlState("forward", false);
                bot.setControlState("jump", true);
                setTimeout(() => {
                    bot.setControlState("jump", false);
                    bot.setControlState("back", true);
                    setTimeout(() => {
                        bot.setControlState("back", false);
                        bot.setControlState("sneak", true);
                        setTimeout(() => {
                            bot.setControlState("sneak", false);
                        }, 2000);
                    }, 750);
                }, 2000);
            }, 500);
        }, 10000)
    } else if (action === "off") {
    if (movementinterval) {
        clearInterval(movementinterval);
        movementinterval = null;
        ["forward", "back", "jump", "sneak"].forEach(state => {
            bot.setControlState(state, false);
        });
    }
}
}

//greeter
let joinListener = null
let leaveListener = null

function greeter(bot, action, mode) {
    registerModuleCall('greeter', action, mode)
  if (action === "on") {
    if (mode === "semi") {
      if (!joinListener) {
        joinListener = (player) => {
          bot.chat(`Hello ${player.username}!`)
        }
        bot.on("playerJoined", joinListener)
      }
    } else if (mode === "full") {
      if (!joinListener) {
        joinListener = (player) => {
          bot.chat(`Hello ${player.username}!`)
        }
        bot.on("playerJoined", joinListener)
      }
      if (!leaveListener) {
        leaveListener = (player) => {
          bot.chat(`Goodbye ${player.username}!`)
        }
        bot.on("playerLeft", leaveListener)
      }
    }

  } else if (action === "off") {
    if (joinListener) {
      bot.removeListener("playerJoined", joinListener)
      joinListener = null
    }
    if (leaveListener) {
      bot.removeListener("playerLeft", leaveListener)
      leaveListener = null
    }
  }
}

//velocity
function velocity(bot, action) {
    registerModuleCall('velocity', action)
  if (action === "on") {
    if (!bot._velocityLock) {
      bot._velocityLock = {
        lastGroundPosition: {...bot.entity.position},
        velocityHandler: (packet) => {
          if (packet.entityId === bot.entity.id) {
            bot.entity.position.x = bot._velocityLock.lastGroundPosition.x;
            bot.entity.position.y = bot._velocityLock.lastGroundPosition.y;
            bot.entity.position.z = bot._velocityLock.lastGroundPosition.z;
            bot.entity.velocity.set(0, 0, 0);
          }
        },
        physicsHandler: () => {
          if (bot.entity.onGround) {
            bot._velocityLock.lastGroundPosition = {...bot.entity.position};
          }
        }
      };

      bot._client.on('entity_velocity', bot._velocityLock.velocityHandler);
      bot.on('physicsTick', bot._velocityLock.physicsHandler);
    }
  } 
  else if (action === "off") {
    if (bot._velocityLock) {
      bot._client.off('entity_velocity', bot._velocityLock.velocityHandler);
      bot.off('physicsTick', bot._velocityLock.physicsHandler);
      delete bot._velocityLock;
    }
  }
}

//chatlogger
let chatlistener;
function chatlogger(bot, action) {
    registerModuleCall('chatlogger', action)
  if (action === "on") {
    chatlistener = (username, message) => {
      if (fs.existsSync('chatlog.txt')) {
        fs.appendFileSync('chatlog.txt', `\n${formatted} | ${username} ${message}`);
      } else {
        fs.writeFileSync('chatlog.txt', `Created at ${formatted}\n--------\n`);
      }
    };
    bot.on("chat", chatlistener);
  } else if (action === "off") {
    if (chatlistener) {
      bot.removeListener("chat", chatlistener);
      chatlistener = null;
    }
  }
}

//config
const configPath = 'pluginconfig.json'
let config = {}
let pendingChanges = {}

function confighandler(bot, action) {
  if (action === "load") {
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        for (const [module, data] of Object.entries(config)) {
          if (typeof bot[module] === 'function') {
            if (Array.isArray(data)) {
              bot[module](...data)
            } else {
              bot[module](data)
            }
          }
        }
      } catch {
        config = {}
      }
    }
  } else if (action === "save") {
    if (Object.keys(pendingChanges).length > 0) {
      for (const [module, args] of Object.entries(pendingChanges)) {
        config[module] = args
      }
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
      pendingChanges = {}
    }
  }
}

function registerModuleCall(module, ...args) {
  pendingChanges[module] = args.length === 1 ? args[0] : args
}

function plugin(bot) {
    bot.autototem = (action, hand) => autototem(bot, action, hand);
    bot.autoarmor = (action) => autoarmor(bot, action);
    bot.autoeat = (action) => autoeat(bot, action);
    bot.spammer = (action, message, delay) => spammer(bot, action, message, delay);
    bot.filespammer = (action, file, order, delay) => filespammer(bot, action, file, order, delay);
    bot.antiafk = (action) => antiafk(bot, action);
    bot.greeter = (action, mode) => greeter(bot, action, mode);
    bot.velocity = (action) => velocity(bot, action);
    bot.chatlogger = (action) => chatlogger(bot, action);
    bot.confighandler = (action) => confighandler(bot, action);
}

module.exports = plugin;
