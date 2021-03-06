import { Requirements } from "../../classes/Requirements";
import { actionBehaviour } from '../../../types';
import Action from '../../classes/Action';
import { isArray } from 'util';
import Commands from '../../classes/Commands';

// tslint:disable-next-line:no-var-requires
const cleverbot = require('cleverbot.io')

const bot = new cleverbot('MLMxCR7Y6uZwY8cA', 'pLKDtbcAETWaMTvv2WZMiT0z2hslqkYu')
bot.setNick('Blyad');

const requirements: Requirements = {

}

const description = 'Talk with me :3'

const action: actionBehaviour = async req => {
  return await new Promise((res) => {

    req.msg.channel.send('*typing...*').then(async afterTyping => {
      bot.create(async (_: any, __: any) => {
        // tslint:disable-next-line:no-shadowed-variable
        bot.ask(req.text, async (_: any, response: any) => {

          if (isArray(afterTyping)) afterTyping = afterTyping[0]

          afterTyping.delete().then(async () => {
            res(req.msg.reply(response))
          })

        })
      })
    })

  })
}

const talk = new Action(requirements, action, description)

Commands.add('talk', talk)
