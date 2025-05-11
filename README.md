# Mineflayer Toolbox

A set of tools aiming to make your anarchy experience with your bot better with some useful modules based off popular hack clients.

Current modules:
- **Auto Totem**
- **Auto Armor**
- **Auto Eating**
- **Spammer**
- **Filespammer**

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

### Spammer (`bot.spammer(action, message, delay)` and `bot.filespammer(action, file, order, delay`)

Automatically spams set messages or file content

**Spammer Arguments:**
- `action` – `"on"` to activate, `"off"` to deactivate
- `message` – The message that gets spammed
- `delay` – The delay messages will be spammed in ms. (Do not go under 300 or the bot will most likely get kicked)

**Filespammer Arguments:**
- `action` – `"on"` to activate, `"off"` to deactivate
- `file` – The file with the messages. It should be a txt and every message should have its own line
- `order` – `"random"` random order, `"first"` first to last, `"last"` last to first
- `delay` – The delay messages will be spammed in ms. (Do not go under 300 or the bot will most likely get kicked)

**Behavior:**
- Spams either the set message or the file in the set delay.

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


---

## Usage Example

```js
const mineflayer = require('mineflayer');
const toolbox = require('mineflayer-toolbox');

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 25565,
  username: 'Bot'
});

bot.loadPlugin(toolbox);

bot.once('spawn', () => {
  bot.autototem('on', 'offhand');
  bot.autoarmor('on');
  bot.autoeat('on');
});
