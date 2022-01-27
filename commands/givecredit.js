const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('givecredit')
		.setDescription('Передать Социальный Рейтинг пользователю.')
        .addUserOption(option => option.setName('member').setDescription('Пользователь').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Количество очков').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Причина').setRequired(true))
};