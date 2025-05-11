# Mineflayer Survival Plugin

A compact Mineflayer plugin providing three essential survival features:
- **Auto Totem Equip**
- **Auto Armor Equip**
- **Auto Eating**

All features are toggleable and execute actions on every `physicsTick`.


---

## Features

### Auto Totem (`bot.autototem(action, hand)`)

Automatically equips a Totem of Undying in the desired hand when none is equipped.

**Arguments:**
- `action` – `"on"` to activate, `"off"` to deactivate
- `hand` – `"mainhand"` or `"offhand"` (optional, defaults to `"offhand"`)

**Behavior:**
- Checks if the offhand (slot 45) is empty.
- If a totem is found in inventory, it equips it in the selected hand.

---

### Auto Armor (`bot.autoarmor(action)`)

Automatically equips the best armor available in the bot’s inventory.

**Arguments:**
- `action` – `"on"` to activate, `"off"` to deactivate

**Behavior:**
- Compares currently equipped armor to what's available in the inventory.
- Equips higher-tier armor when found (e.g., diamond > iron).
- Tosses worse duplicates to free up space.

---

### Auto Eat (`bot.autoeat(action)`)

Automatically eats when the bot’s hunger drops below 18.

**Arguments:**
- `action` – `"on"` to activate, `"off"` to deactivate

**Behavior:**
- Prioritizes high-quality food (`cooked_meat` types).
- If no good food is found, falls back to any other edible items.
- Prevents multiple eat attempts at the same time.

---

## Usage Example

```js
const mineflayer = require('mineflayer');
const survivalPlugin = require('./yourPluginFile'); // Replace with actual path

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'Bot'
});

bot.once('spawn', () => {
  survivalPlugin(bot);

  bot.autototem('on', 'offhand');
  bot.autoarmor('on');
  bot.autoeat('on');
});
