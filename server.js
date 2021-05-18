const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const fs = require('fs');
const db = require('quick.db');
const express = require('express');
require('./util/eventLoader.js')(client);
const path = require('path');
const snekfetch = require('snekfetch');
const ms = require('ms');
const fetch = require('node-fetch')
const xpfile = require("./xp.json");

var prefix = ayarlar.prefix;

const log = message => {
    console.log(`${message}`);
};
console.log(prefix)
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        log(`${props.help.name} Komutu Yüklendi.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});




client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};



client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) {
        return;
    }

    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
client.on('warn', e => {
    console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});
client.on('error', e => {
    console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});
client.login(process.env.token);



client.on("message",function(message) {
  let kanal = db.fetch(`seviyekanal_${message.guild.id}`)
  let mesaj = db.fetch(`seviyemsj_${message.guild.id}`)
  if(message.author.bot) return;
  var addXP = Math.floor(Math.random() * 8) + 3
  
  if(!xpfile[message.author.id])
      xpfile[message.author.id] = {
        xp: 0,
        level: 1,
        reqxp: 100
      }
  
       fs.writeFile("./xp.json",JSON.stringify(xpfile), function(err){
         if(err) console.log(err)
       })
   
      xpfile[message.author.id].xp += addXP
    if(xpfile[message.author.id].xp > xpfile[message.author.id].reqxp) {
      xpfile[message.author.id].xp -= xpfile[message.author.id].reqxp
      xpfile[message.author.id].reqxp *= 1.25
      xpfile[message.author.id].reqxp = Math.floor(xpfile[message.author.id].reqxp)
      xpfile[message.author.id].level += 1
     if(!mesaj) {
      message.reply("Hey Level Atladın** "+xpfile[message.author.id].level+" **!")
     } 
       if (mesaj) {
    const msg = mesaj.replace("-member-", `<@${message.author.id}>`).replace("-server-", `${message.guild.name}`).replace("-seviye-", `${xpfile[message.author.id].level}`).replace("-seviyexp-", `${xpfile[message.author.id].xp}`).replace("-totalxp-", `${xpfile[message.author.id].reqxp}`)
    return client.channels.cache.get(kanal).send(msg);
  
       fs.writeFile("./xp.json",JSON.stringify(xpfile), function(err){
         if(err) console.log(err)
       })
        
         }
    }
    
  
   })
client.on("ready", () => {
  client.channels.cache.get("842536774462341150").join();   
})