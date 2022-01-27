const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fine')
		.setDescription('Снизить Социальный Рейтинг пользователя.')
        .addUserOption(option => option.setName('member').setDescription('Пользователь').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('Количество очков').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Причина').setRequired(true))
		.setDefaultPermission(false)
};