const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('github')
		.setDescription('Получить ссылку на репозиторий на GitHub этого бота.')
};