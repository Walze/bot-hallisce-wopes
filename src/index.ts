// tslint:disable-next-line:no-var-requires
require('source-map-support').install()

import { Message } from 'discord.js'
import ReplyError from './bot/helpers/ReplyError';

import { client } from './setup';
import { parseCommand } from './bot/parse';

import { pipe } from 'ramda'
import { replyMessage } from './bot/reply';
import { makeCommand } from './bot/command';

const runPipeline = (message: Message) => {
  if (message.author.bot) return

  const command = makeCommand({ message })
  const run = pipe(
    parseCommand,
    replyMessage,
    console.log,
  )

  run(command)
}

const onMessage = async (message: Message) => {
  // Handles Internal Errors
  try {
    runPipeline(message)
  } catch (err) {
    ReplyError(message, err)
  }
}

client.on('message', onMessage)
