const { MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');



function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


class Tester {
    /**
     * @param {Array} testQuestions Array of JSON-typed questions
     */
    constructor(testQuestions){

        this.questions = [...testQuestions];
        this.streak = 1;
        this.score = 0;
        this.maxStreak = 0;
        this.counter = 0;

        shuffleArray(this.questions);
    };

    ask_question(){
        if (this.questions.length === 0){
            return false;
        };
        this.counter++;
        this.current_question = this.questions.pop();
        return this.current_question;
    };

    get_final_score(){
        this.maxStreak = Math.max(this.streak, this.maxStreak);
        return this.score * this.maxStreak * this.streak;
    }

    get_counter(){
        return this.counter;
    }

    make_guess_by_id(answer_id){
        if (answer_id.startsWith('correct')){
            ++this.streak;
            this.score += this.current_question.points;
            return true;
        } else {
            this.maxStreak = Math.max(this.streak, this.maxStreak);
            this.streak = 1;
            return false;
        };
    };

    get_question_message_data(){
        var buttons = [];
        this.current_question.correct_options.forEach(function (x){
            buttons.push(
                new MessageButton()
                    .setCustomId('correct' + Math.random().toString().substring(1, 10))
                    .setLabel(x)
                    .setStyle('PRIMARY')
            );
        });
        this.current_question.incorrect_options.forEach(function (x){
            buttons.push(
                new MessageButton()
                    .setCustomId(Math.random().toString().substring(1, 10))
                    .setLabel(x)
                    .setStyle('PRIMARY')
            );
        });
        shuffleArray(buttons);
        return {
            row: new MessageActionRow().addComponents(...buttons),
            picture: new MessageEmbed().setImage(this.current_question.photo),
            counter: this.get_counter()
        };
    };
};

module.exports = {
    Tester,
    shuffleArray
}
