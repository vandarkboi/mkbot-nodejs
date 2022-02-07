const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addquestion')
		.setDescription('Добавить новый вопрос к тесту на Социальный Рейтинг.')
        .addStringOption(option => option.setName('text').setDescription('Текст Вопроса').setRequired(true))
        .addStringOption(option => option.setName('photo').setDescription('Ссылка на Изображение').setRequired(true))
        .addStringOption(option => option.setName('incorrect_options').setDescription('Неправильные Варианты Ответа (Разделитель - ".")').setRequired(true))
        .addStringOption(option => option.setName('correct_options').setDescription('Правильные Варианты Ответа (Разделитель - ".")').setRequired(true))
        .addIntegerOption(option => option.setName('points').setDescription('Очки за Правильный Ответ').setRequired(true))
		.setDefaultPermission(false)
};