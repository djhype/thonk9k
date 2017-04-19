const Discord = require('discord.js');
const glob = require('glob');
const path = require('path');

class Bot {
    constructor() {
        this.client = new Discord.Client();
        this.token = 'MzAzMzI4NjQzNTUwMDE5NTg2.C9Wgwg.2SjC-LzYWuLNGPdhG0F0axdAqtM';
        this.commands = {};
        this.cmdCount = 0;

        this.loadCommands();

        this.client.on('ready', () => {
            console.log('Thonking.');
        });
    }

    thonk() {
        this.client.login(this.token)
    }

    loadCommands() {
        console.log('Loading commands...');

        glob.sync(path.join(__dirname, 'commands/*.js')).forEach( file => {
            this.addCommand(require(path.resolve(file)));
            this.cmdCount++
        });

        console.log(this.commands);

        console.log(`Finished loading ${this.cmdCount} commands.`)
    }

    addCommand(command) {
        this.commands[command.command] = {
            description: command.description,
            execute: command.execute
        }
    }


    //client.on('message', message => {
    //    message.react(':thonking:291056594601377792')
    //});
}

module.exports = Bot;