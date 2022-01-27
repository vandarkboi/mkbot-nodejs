const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('assignroles')
		.setDescription('Переназначить роли согласно Социальному Рейтингу.')
		.setDefaultPermission(false)
};