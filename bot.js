debugger;

//region Imports
const {
    Client,
    Intents,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
    Guild
} = require('discord.js');
const client = new Client({intents: [Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]});
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');
const fs = require('fs');
const {Tester} = require('./tester.js')
// const {content, check} = require("yarn/lib/cli");
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const guildId = '541588026518798337';
const clientId = '802069327280603158';
const {MongoClient} = require('mongodb');
const {remove} = require("yarn/lib/cli");
const Process = require("process");

//endregion

//region Global variables and bot start up

//Log 'ready' when bot is ready
client.on('ready', async () => {
    console.log(`${client.user.tag} ready`);
    const permissions = [
        {
            id: '429555374291550208',
            type: 'USER',
            permission: true
        },
        {
            id: '899311445219631105',
            type: 'USER',
            permission: true
        }
    ];
    if (!client.application?.owner) await client.application?.fetch();
    // console.log(await client.guilds.cache.get(guildId)?.commands.fetch())
    const command = await client.guilds.cache.get(guildId)?.commands.fetch('933412427507306506');
    await command.permissions.add({permissions});
    const command2 = await client.guilds.cache.get(guildId)?.commands.fetch('934784207438372874');
    await command2.permissions.add({permissions});
    const command3 = await client.guilds.cache.get(guildId)?.commands.fetch('940303261519474758');
    await command3.permissions.add({permissions});
});
//Read all command files
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

//Create discord.js REST API
const rest = new REST({version: '9'}).setToken(process.env.BOT_TOKEN);

//Add commands to guild
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            {body: commands},
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

//endregion

//region Data

//Working with MongoDB

var addSocialCreditQuestion = async function ({text, photo, incorrect_options, correct_options, points}) {
    const mClient = new MongoClient(process.env.MONGODB_URL);
    await mClient.connect();
    const collection = (await mClient.db("bot_db").collection("social-credit-test"));
    await collection.insertOne({
        "text": text,
        "photo": photo,
        "incorrect_options": incorrect_options,
        "correct_options": correct_options,
        "points": points
    });
};

var getSocialCreditQuestions = async function () {
    const mClient = new MongoClient(process.env.MONGODB_URL);
    await mClient.connect();
    const collection = (await mClient.db("bot_db").collection("social-credit-test"));
    return collection.find({}).toArray()
};


var editSocialCreditUser = async function (id, value) {
    const mClient = new MongoClient(process.env.MONGODB_URL);
    await mClient.connect();
    const collection = (await mClient.db("bot_db").collection("social-credit-users"));
    social_credit_users[id] = value;
    await collection.updateOne({"_id": id}, {$set: {"value": value}}, () => {
        mClient.close();
    });
};

var addSocialCreditUser = async function (id, value) {
    const mClient = new MongoClient(process.env.MONGODB_URL);
    await mClient.connect();
    const collection = (await mClient.db("bot_db").collection("social-credit-users"));
    await collection.insertOne({"_id": id, "value": value});
};

var getSocialCreditUsers = async function () {
    const mClient = new MongoClient(process.env.MONGODB_URL);
    await mClient.connect();
    let ret = {};
    (await mClient.db("bot_db").collection("social-credit-users").find({}).toArray()).forEach((x) => {
        ret[x._id.valueOf()] = x.value;
    });
    await mClient.close()
    return ret;
};

let ongoing_tests = {};
let social_credit_users = {};
getSocialCreditUsers().then((data) => {
    social_credit_users = JSON.parse(JSON.stringify(data));
}).catch((err) => {
    console.log(err)
});

let creditTestQuestions = [];
getSocialCreditQuestions().then(res => {
    creditTestQuestions = res;
    console.log('Questions Fetched.')
});

//endregion

//region Functions for discord.js

function checkCommand(interaction, commandName) {
    return !(!interaction.isCommand() || interaction.commandName !== commandName);
}

/**
 * @param {Guild} guild The guild
 * @param {member} member The member
 * @param {role} role Role
 */
async function assignMafiaRole(guild, member, role) {
    if (!member.roles.cache.has(role.id)) {
        await removeMafiaRoles(guild, member);
        member.roles.add(role);
        return true;
    }
    ;
    return false;
};

/**
 * @param {Guild} guild The guild
 * @param {member} member The member
 */
async function removeMafiaRoles(guild, member) {
    await guild.roles.fetch();
    for (const roleName in roleNames) {
        const role = guild.roles.cache.find(r => r.name === roleNames[roleName]);
        member.roles.remove(role);
    }
}

//endregion

//region /gameRole

async function getGameroleRows(interaction) {
    const member = interaction.member;
    const guild = interaction.guild;
    await guild.roles.fetch();
    let select_options_remove = [];
    let toRemove = new Set();
    let rows = [];
    member.roles.cache.map(role => role).forEach((role) => {
        if (role.color === 15105570) {
            select_options_remove.push({'label': role.name, 'value': role.id});
            toRemove.add(role.id)
        }

    });
    const addRowId = `addRow.${interaction.user.id}`;
    const removeRowId = `removeRow.${interaction.user.id}`

    if (select_options_remove.length > 0) {
        rows.push(new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(removeRowId)
                    .setPlaceholder('Удалить роли')
                    .addOptions(select_options_remove)
                    .setMaxValues(Math.min(Math.max(select_options_remove.length, 1), 25))));
    }


    let select_options_add = [];
    guild.roles.cache.forEach((role => {
        if (role.color === 15105570 && !toRemove.has(role.id)) {
            select_options_add.push({label: role.name, value: role.id})
        }
    }))
    if (select_options_add.length > 0) {
        rows.push(new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId(addRowId)
                    .setPlaceholder('Добавить роли')
                    .addOptions(select_options_add)
                    .setMaxValues(Math.min(Math.max(select_options_add.length, 1), 25))));
    }
    return rows.reverse();
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    if (!(interaction.customId.startsWith('addRow') || interaction.customId.startsWith('removeRow'))) return;
    const member = interaction.member;
    const guild = interaction.guild;
    const split = interaction.customId.split('.');
    const rowType = split[0];
    await interaction.deferUpdate();
    switch (rowType) {
        case 'addRow':
            for await (let roleId of interaction.values) {
                await member.roles.add(guild.roles.cache.get(roleId));
            }
            break;
        case 'removeRow':
            for await (let roleId of interaction.values) {
                await member.roles.remove(member.roles.cache.get(roleId));
            }
            break;
        default:
            console.log('Id Fetch Error : /gamerole')
    }

    await interaction.editReply({
        content: '**Успешно!**\nУправление ролями - **/gamerole**',
        components: [],
        ephemeral: true
    });


});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== 'gamerole') return;
    const rows = await getGameroleRows(interaction);
    await interaction.reply({content: '**Управление ролями**', components: rows, ephemeral: true})

});

//endregion

//region /11bruh
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== '11bruh') return;
    const member = interaction.member;
    const guild = interaction.guild;
    await guild.roles.fetch();
    const role = guild.roles.cache.get('808270098615369728');

    if (!member.roles.cache.has('808270098615369728')) {
        const embed = new MessageEmbed()
            .setColor('#ac0000')
            .addFields(
                {
                    name: '**ВНИМАНИЕ!**',
                    value: 'Эта роль может быть полезна **только** ученикам 11 "Б" класса Гимназии Менталитет, **и только им.**'
                },
                {
                    name: 'Описание Роли',
                    value: 'Роль открывает доступ к каналу, где периодически выкладываются сделанные домашние задания.'
                }
            );
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`add-role ${Math.random().toString().substring(1, 10)}`)
                    .setLabel('ПОЛУЧИТЬ РОЛЬ')
                    .setStyle("SUCCESS"),
                new MessageButton()
                    .setCustomId(Math.random().toString().substring(1, 10))
                    .setLabel('ОТМЕНА')
                    .setStyle("DANGER")
            );
        await interaction.reply({content: '**11-bruh\n**', embeds: [embed], components: [row], ephemeral: true});
        const Filter = inter => { // Фильтрация ивентов по пользователю
            inter.deferUpdate();
            return inter.user.id === interaction.user.id
        };
        const message = await interaction.fetchReply();
        message.awaitMessageComponent({Filter, componentType: "BUTTON", time: 60000})
            .then(async inter => {
                switch (inter.customId.startsWith('add-role')) {

                    case true:
                        member.roles.add(role);
                        await interaction.editReply({content: 'Успешно.', embeds: [], components: []});
                        break;

                    default:
                        await interaction.editReply({content: 'Отменено.', embeds: [], components: []});
                }
            });


    } else {
        const embed = new MessageEmbed()
            .setColor('#ac0000')
            .addFields(
                {
                    name: '**ВНИМАНИЕ!**',
                    value: 'Вы действительно хотите удалить роль **11 bruh?**'
                }
            )
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`add-role ${Math.random().toString().substring(1, 10)}`)
                    .setLabel('УБРАТЬ РОЛЬ')
                    .setStyle("SUCCESS"),
                new MessageButton()
                    .setCustomId(Math.random().toString().substring(1, 10))
                    .setLabel('ОТМЕНА')
                    .setStyle("DANGER")
            );
        await interaction.reply({content: '**11-bruh\n**', embeds: [embed], components: [row], ephemeral: true});
        const Filter = inter => { // Фильтрация ивентов по пользователю
            inter.deferUpdate();
            return inter.user.id === interaction.user.id
        };
        const message = await interaction.fetchReply();
        message.awaitMessageComponent({Filter, componentType: "BUTTON", time: 60000})
            .then(async inter => {
                switch (inter.customId.startsWith('add-role')) {
                    case true:
                        member.roles.remove('808270098615369728');
                        await interaction.editReply({content: 'Успешно.', embeds: [], components: []});
                        break;

                    default:
                        await interaction.editReply({content: 'Отменено.', embeds: [], components: []});
                }
            });

    }

})

//endregion

//region /socialcredit

client.on('interactionCreate', async interaction => {
    const user = interaction.user.toString();
    if (!interaction.isCommand()) return;
    if (interaction.commandName !== 'socialcredit') return;


    switch (user in social_credit_users) {

        case true: // Show Stats
            try {

                let users = Object.keys(social_credit_users).map(function (key) {
                    return [key, social_credit_users[key]];
                });
                users.sort(function (first, second) {
                    return second[1] - first[1];
                });
                let repl = '';
                users.forEach(function (x) {
                    repl += `${x[0]} - ${x[1]}\n`;

                });
                await interaction.reply({content: `**Рейтинг по очкам**\n` + repl, ephemeral: true});
            } catch (err) {
                console.log(`ERROR ${err}`)
                await interaction.reply({content: `Произошла ошибка: \n ${err}`})
            }
            break;

        case false: // Start Testing
            try {
                const Test = (user in ongoing_tests) ? ongoing_tests[user] : new Tester(creditTestQuestions); // Выбор объекта Tester
                const Filter = inter => { // Фильтрация ивентов по пользователю

                    return inter.user.id === interaction.user.id
                };

                var question = Test.ask_question(); // Getting question data


                var {row: row, picture: picture, counter: counter} = Test.get_question_message_data(); // Get data to send

                await interaction.reply({
                    content: `**Вопрос №${counter}**\n**${question.text}**`.toString(),
                    embeds: [picture],
                    components: [row],
                    ephemeral: true
                })
                // Asked a question


                const message = await interaction.fetchReply();
                if (!message) console.log('ERROR: UNDEFINED OR NULL MESSAGE');
                const collector = message.createMessageComponentCollector({Filter, componentType: 'BUTTON'});
                collector.on('collect', async inter => {
                    inter.deferUpdate();
                    Test.make_guess_by_id(inter.customId); // Check answer
                    var question = Test.ask_question(); // Get new question

                    if (question === false) { // If there are no questions left
                        const finalScore = Test.get_final_score();
                        social_credit_users[user] = finalScore; // Assign final score to user
                        await interaction.followUp(`**${user} получил ${finalScore} очков в тесте социального рейтинга!**\nПройти тест или посмотреть результаты - **/socialcredit**`);
                        delete ongoing_tests[user]; // Remove this Tester object from ongoing_tests
                        addSocialCreditUser(user, finalScore).then(() => console.log(`User with ID "${user}" passed the Social Credit Test and earned ${finalScore} points.`));
                        // Save users with their final scores
                        collector.stop();

                    } else {
                        var {row: row, picture: picture} = Test.get_question_message_data();
                        await interaction.editReply({
                            content: `**Вопрос №${Test.counter}**\n**${question.text}**`.toString(),
                            embeds: [picture],
                            components: [row],
                            ephemeral: true
                        })
                        // Asked another question
                    }
                });
            } catch (err) {
                console.log(`ERROR ${err}`)
                await interaction.reply({content: `Произошла ошибка: \n ${err}`})
            }


            break;
        default:
            await interaction.reply({content: 'Произошла _**неизвестная ошибка.**_', ephemeral: true})
            console.log(`CASE CHECK ERROR\nINFO:\nUSER: ${user}\nSOCICAL_CREDIT_USERS: ${social_credit_users}`)
    }

});

//endregion

//region Edit Social Credit

//region /fine

client.on('interactionCreate', async interaction => {
    if (!checkCommand(interaction, 'fine')) return;

    const member = interaction.options.getMember('member');
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason');

    if (!(member.user.toString() in social_credit_users)) {
        await interaction.reply({
            content: '**Ошибка: пользователь отсутствует в _системе социального рейтинга._**',
            ephemeral: true
        });
        return;
    }

    if (member.user.toString() === interaction.user.toString()) {
        await interaction.reply({content: '**Ошибка: нельзя оштрафовать _самого себя._**', ephemeral: true});
        return;
    }
    if (amount <= 0) {
        await interaction.reply({
            content: '**Ошибка: нельзя _не убавить_ очки социального рейтинга.**',
            ephemeral: true
        });
        return;
    }
    if (amount > social_credit_users[member.user.toString()] * Process.env.MAX_FINE_PERCENTAGE) {
        await interaction.reply({
            content: '**Ошибка: нельзя оштрафовать пользователя на _слишком большую сумму._**',
            ephemeral: true
        });
        return;
    }

    await interaction.deferReply();
    const newUserScore = social_credit_users[member.user.toString()] - amount;
    await editSocialCreditUser(member.user.toString(), newUserScore)
    const embed = new MessageEmbed()
        .setColor('#ac0000')
        .setTitle(`**${member.user.username} _оштрафован._**`)
        .addFields(
            {name: 'Размер:', value: `**${amount}** очков **Социального Рейтинга**`},
            {name: 'Причина:', value: reason}
        )
    await interaction.editReply({content: `**Объявление**`, embeds: [embed]});
})

//endregion

//region /givecredit

client.on('interactionCreate', async interaction => {
    if (!checkCommand(interaction, 'givecredit')) return;


    const member = interaction.options.getMember('member');
    const user = interaction.user;
    const amount = interaction.options.getInteger('amount');
    const reason = interaction.options.getString('reason');

    if (!(member.user.toString() in social_credit_users)) {
        await interaction.reply({
            content: '**Ошибка: пользователь отсутствует в _системе социального рейтинга._**',
            ephemeral: true
        });
        return;
    }

    if (member.user.toString() === user.toString()) {
        await interaction.reply({content: '**Ошибка: передать очки _самому себе._**', ephemeral: true});
        return;
    }
    if (amount <= 0) {
        await interaction.reply({
            content: '**Ошибка: нельзя _не передать_ очки социального рейтинга.**',
            ephemeral: true
        });
        return;
    }
    if (amount > social_credit_users[user.toString()] * Process.env.MAX_GIVECREDIT_PERCENTAGE_GIVE) {
        await interaction.reply({content: '**Ошибка: нельзя передать _слишком много._**', ephemeral: true});
        return;
    }

    await interaction.deferReply();
    const newMemberScore = social_credit_users[member.user.toString()] + amount;
    await editSocialCreditUser(member.user.toString(), newMemberScore)

    const newUserScore = social_credit_users[user.toString()] - amount;
    await editSocialCreditUser(user.toString(), newUserScore)

    const embed = new MessageEmbed()
        .setColor('#ac0000')
        .setTitle(`**Пользователю ${member.user.username} передали _Социальный Рейтинг._**`)
        .addFields(
            {name: 'Размер:', value: `**${amount}** очков **Социального Рейтинга**`},
            {name: 'Причина:', value: reason}
        )
    await interaction.editReply({content: `**Объявление**`, embeds: [embed]});
})

//endregion

//endregion

//region Role Assignment

const rolesQueue = [
    'boss',
    'advisor',
    'underboss',
    'capo',
    'capo',
    'capo'
];
const roleNames = {
    boss: 'Консул',
    advisor: 'Проконсул',
    underboss: 'Трибун',
    capo: 'Патриций',
    soldier: 'Плебей',
    associate: 'Раб'
};

async function autoRoleAssignment(guild) {
    await guild.roles.fetch();
    let userIds = [];
    for (var userId in social_credit_users) {
        userIds.push([userId, social_credit_users[userId]])
    }
    userIds.sort((a, b) => a[1] - b[1]);

    let assignedRoles = "";

    for (const roleName of rolesQueue) {
        const role = guild.roles.cache.find(Role => Role.name === roleNames[roleName]);
        const memberId = userIds.pop();
        const member = await guild.members.fetch(memberId[0].substring(2, 20));
        let reply = await assignMafiaRole(guild, member, role)
        if (reply) assignedRoles += (`${memberId[0]} - **${memberId[1]}** - **${role.name}**\n`);
    }

    for (const memberId of userIds.reverse()) {
        const role = guild.roles.cache.find(Role => Role.name === (memberId[1] > 12000 ? roleNames["soldier"] : roleNames["associate"]));
        const member = await guild.members.fetch(memberId[0].substring(2, 20));
        await assignMafiaRole(guild, member, role)
        let reply = await assignMafiaRole(guild, member, role)
        if (reply) assignedRoles += (`${memberId[0]} - **${memberId[1]}** - **${role.name}**\n`);
    }

    return assignedRoles;
}

client.on('interactionCreate', async interaction => {
    if (!checkCommand(interaction, 'assignroles')) return;
    await interaction.deferReply();
    const retMessage = await autoRoleAssignment(interaction.guild);
    if (retMessage.length === 0) {
        await interaction.editReply({content: "Все пользователи остались при своих ролях."});
        return;
    }
    const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Перераспределение Ролей')
        .addFields({name: "Эти пользователи теперь имеют следующие роли:", value: retMessage});

    await interaction.editReply({embeds: [embed]});

});
//endregion

//region Help

//region /github

client.on('interactionCreate', async interaction => {
    if (!checkCommand(interaction, 'github')) return;
    await interaction.reply({content: 'Вам Сюда -> https://github.com/vandarkboi/mkbot-nodejs', ephemeral: true})
})

//endregion


//endregion

//region /addquestion
client.on('interactionCreate', async interaction => {
    if (!checkCommand(interaction, 'addquestion')) return;

    const text = interaction.options.getString('text');
    const photo = interaction.options.getString('photo');
    const incorrect_options = interaction.options.getString('incorrect_options').split('.');
    const correct_options = interaction.options.getString('correct_options').split('.');
    const points = interaction.options.getInteger('points');

    if (points <= 0) {
        await interaction.reply({
            content: '**Ошибка: нельзя _не добавить_ очки социального рейтинга.**',
            ephemeral: true
        });
        return;
    }

    if (incorrect_options.length < 1 ||
        correct_options.length < 1) {
        await interaction.reply({
            content: '**Ошибка: отсутствуют правильные или неправильные варианты.**',
            ephemeral: true
        });
        return;
    }

    await addSocialCreditQuestion({text: text, photo: photo, incorrect_options: incorrect_options, correct_options: correct_options, points: points});
    await interaction.reply({content: '**Успешно**', ephemeral: true});


});
//endregion

client.login(process.env.BOT_TOKEN);
