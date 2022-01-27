const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('socialcredit')
		.setDescription('Пройти тест на социальный рейтинг или узнать результаты.')
};