export const commands = [
    {
      name: 'irlfact',
      description: 'Replies with a random Real Life fact',
    },
    {
      name: 'catfact',
      description: 'Replies with a random cat fact'
    },
    {
      name: 'gif',
      description: 'Replies with a gif from the ones it has learned COULD BE NSFW!'
    },
    {
      name: 'image',
      description: 'Replies with an image from the ones it has learned COULD BE NSFW!'
    },
    {
      name: 'video',
      description: 'Replies with an video/youtube link from the ones it has learned COULD BE NSFW!'
    },
    {
      name: 'providetraining',
      description: 'Memorizes all the messages of the SERVER and uses them as training data',
    },
    {
      name: 'resettraining',
      description: 'Deletes all memorized messages, will make me learn from new messages only',
    },
    {
      name: 'replyrate',
      description: 'Shows the current reply rate',
    },
    {
      name: 'setreplyrate',
      description: 'Sets the rate at which the bot will reply',
      options: [
        {
          name: 'rate',
          description: "Probability of 1/rate | 1=always reply | 0=never reply unless pinged",
          type: 4, //Integer type
          required: true,
        }
      ]
    }
  ];