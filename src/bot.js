import Discord from 'discord.js'
import sqlite from 'sqlite'
import glob from 'glob'
import path from 'path'
import moduleStore from './moduleStore'

export default (token, {prefix = '!'} = {}) => {
    let state = {
        commandPrefix: prefix,
        client: new Discord.Client(),
        db: null,
        modules: moduleStore()
    };

    if(!token) {
        throw new Error('No token specified')
    }

    async function getDB() {
        try {
            const dbpath = path.resolve(__dirname, '../database/database.sqlite');
            return sqlite.open(dbpath)
        } catch(e) {
            console.error(e)
        }
    }

    async function loadModules(modulePath) {
        let files = glob.sync(modulePath);

        for(let file of files) {
            let module = require(path.resolve(file)).default;
            // Only add if file exports something
            if (typeof module === 'object') {
                try {
                    await module.load(state)
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }

    async function processMessage(message) {
        const content = message.content;
        if (content.startsWith(prefix)) {
            const formatted = content.slice(prefix.length, content.length);
            let commandArray = formatted.split(' ');
            const trigger = commandArray.shift().toLowerCase();
            const args = commandArray.join(' ');
            const command = state.modules.getCommand(trigger);

            if(command) {
                try {
                    await command.executeFn(state, message, args);
                } catch(e) {
                    console.error(e);

                    const triggered = [
                        'REEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE',
                        'OH MY FUCKING GOD XAVIER GET YOUR FUCKING SHIT TOGETHER',
                        'You blew it.', // FOR THE OG'S
                        'im literally so triggered right fucking now...like....you have NO. FUUCKING. IDEA. OMGSDFSDFASDQBVQERWBVQERVGERBVNEHRIBNERBIEQRBNKIDFB',
                        'https://giphy.com/gifs/vk7VesvyZEwuI',
                        'https://giphy.com/gifs/nba-h3h3productions-linuxmasterrace-cVG2i8kfmgETe'
                    ];

                    const triggeredIndex = Math.floor(Math.random() * triggered.length);
                    message.channel.sendMessage(triggered[triggeredIndex]);
                }
            } else {
                message.channel.sendMessage(
                    `Command not recognized. Try ${prefix}help for a list of all available commands.`
                );
            }
        }
    }

    return Object.create({
        async init() {
            try {
                state.db = await getDB();
                await loadModules(path.resolve(__dirname, 'core/*'));
                await loadModules(path.resolve(__dirname, 'modules/*'));
                state.client.login(token);

                state.client.on('ready', () => {
                    console.log('Thonking.')
                });

                state.client.on('message', message => {
                    processMessage(message)
                });
            } catch(e) {
                console.error(e)
            }
        }
    })
}
