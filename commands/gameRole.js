const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('gamerole')
		.setDescription('Получить или убрать игровые роли.')
};