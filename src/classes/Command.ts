import Request from "./Request"
import log from "../helpers/logger";
import Commands from "./Commands";
import { RichEmbedOptions } from 'discord.js';
import Action from './Action';
import { mapObj } from '../helpers/obj_array';
import { Performances } from './Performances';

export default class Command {
  constructor(
    public name: string,
    public action: Action,
  ) {
    Commands.event.on(this.name, (req: Request) => {
      log(`|| running command "${req.command}" at ${req.msg.guild.name}...`)
      try {
        this._checkRequirements(req)
        this._run(req)
      } catch (e) {
        this._errorHandler(req, e)
      }
    })
  }

  private async _run(req: Request) {
    let returns = undefined

    try {
      const result = this.action.run(req)

      if (result instanceof Promise)
        returns = await result.catch(err => this._errorHandler(req, err))
      else
        log('|| warning action returned non-promise:'.toUpperCase(), req.command)

    } catch (err) {
      returns = await this._errorHandler(req, err)
    }

    Performances.find('command').end()


    return returns
  }

  private _checkRequirements(req: Request): void {
    let errorString = ''

    if (this.action.required.prefix === req.hasPrefix) {
      if ((this.action.required.text !== (req.text !== '')) && this.action.required.text)
        errorString += '\nThis command requires some text'
      if ((this.action.required.ats !== (req.ats.length > 0)) && this.action.required.ats)
        errorString += '\nThis command requires @someone'

      mapObj(this.action.required.params, (required, prop) => {
        if (!req.params[prop] && required)
          errorString += `\nArgument "${prop}" is required for this command`
      })

      if (errorString === '') return

      throw new Error(errorString)
    }

    throw null
  }

  private _errorHandler(req: Request, err: Error) {
    log('COMMAND CATCH LOG:', err, req.log())

    const embed: RichEmbedOptions = {
      author: {
        name: req.msg.author.username,
        icon_url: req.msg.author.avatarURL
      },
      title: "Error Information",
      description: err.message,
      fields: [
        {
          name: 'Command',
          value: req.command,
          inline: true
        },
        {
          name: 'Text',
          value: req.text || '*empty*',
          inline: true
        },
        {
          name: '@\'s',
          value: req.ats.length > 0 ? req.ats.map(at => at.tag).join(' | ') : '*none*',
          inline: true
        },
        {
          name: 'Arguments',
          value: mapObj(req.params, (val, name) => `${name}-${val}`).join(' | ') || '*none*',
          inline: true
        }
      ],
      timestamp: new Date()
    }

    return req.msg.channel.send(`Use help __${req.command}__ for more information about this command.`, { embed })
  }
}