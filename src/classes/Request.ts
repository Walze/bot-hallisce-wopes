import { Message } from "discord.js"
import { at } from "../types"
import Commands from "./Commands"
import { log } from 'console'
import { indexObj } from '../helpers/obj_array';
//import { Performances } from './Performances';

export interface DefaultParams { [key: string]: string }


// s-debug argument-value
// Eg. s-debug event-MEMBER_ADD_BAN amount-5 @wiva#9996
// params.argument will equals to value


export default class Request {

  public command: string = ''
  public text: string = ''
  public ats: at[] = []
  public params: DefaultParams = {}
  public hasPrefix: boolean = false

  //private readonly _paramRegex = new RegExp(`\\w+${Commands.separator}\\w+`, 'g')
  private _commandRegex = new RegExp(`^${Commands.prefix}(\\w+)`)
  private readonly _atsRegex = new RegExp(`<@!?(\\d+)>`, 'g')
  private readonly _rolesRegex = new RegExp(`<@&(\\d+)>`, 'g')
  //private readonly _textRegex = new RegExp(`\\w+${Commands.separator}\\w+\\s?`, 'g')

  constructor(
    public readonly msg: Message,
  ) {
    this.fetch()
    //Performances.start('request')
    //Performances.start('command')


    const commandInfo = this._getCommandInfo()

    if (!commandInfo || commandInfo.name === '') return

    this._setProperties(commandInfo)
    this._emit()
  }

  fetch() {
    const splits = this.msg.content.split(' ')

    const command: string | undefined = splits[0].split(Commands.prefix + Commands.separator)[1]

    if (command) {
      //remove command
      splits.splice(0, 1)

      // get all stuff and remove it from split
      const params: indexObj = {}
      const ats: at[] = []

      for (let i = 0; i < splits.length; i++) {
        const split = splits[i].trim()

        console.log(split, i)

        //params
        const param = split.split(Commands.separator)

        if (param[1]) {
          params[param[0]] = param[1]
          splits.splice(i, 1)
          i--
        }

        // ats
        // fix this 
        if (this._atsRegex.test(split)) {
          const match = split.match(/<@!(\d+)>/)

          if (match)
            ats.push({
              type: 'AT',
              tag: split,
              id: match[1]
            })

          splits.splice(i, 1)
          i--
        }

        // roles
        if (this._rolesRegex.test(split)) {
          ats.push({
            type: 'ROLE',
            tag: split,
            id: split.replace(/<@&!?/g, '').replace(/>/g, '')
          })
          splits.splice(i, 1)
          i--
        }


      }

      console.log('\n\n', command, params, ats)
      console.log(splits.join(' '))
    }
  }

  private _emit() {
    //Commands.event.emit(this.command, this)

    //Performances.find('request').end()
  }

  private _setProperties(commandInfo: { name: string, hasPrefix: boolean }) {
    this.command = commandInfo.name
    this.hasPrefix = commandInfo.hasPrefix
    // this.params = this._filterArguments()
    // this.text = this._filterText()
    // this.ats = this._filterAts()
  }

  private _getCommandInfo() {
    if (this.msg.author.id === this.msg.client.user.id) return

    const command: {
      name: string,
      hasPrefix: boolean,
    } = {
      name: this.command,
      hasPrefix: this.hasPrefix,
    }


    let match = this.msg.content.toLowerCase().match(this._commandRegex)

    if (match) {
      command.name = match[1]
      command.hasPrefix = true
    } else {
      command.name = this._getNonPrefixCommand()
      this._commandRegex = new RegExp(`${command.name}`, 'g')
    }

    return command
  }

  private _getNonPrefixCommand() {
    const command = Commands.includesCommand(this.msg.content)
    if (!command) return ''

    if (command.action.required.prefix) return ''

    return command.name
  }

  // private _filterArguments() {
  //   const paramsMatch = this.msg.content.toLowerCase().match(this._paramRegex)
  //   const params: indexObj = {}

  //   if (paramsMatch)
  //     paramsMatch.map(el => {
  //       const split = el.split(Commands.separator)
  //       const prop = split[0]
  //       const value = split[1]
  //       if (split[0] !== Commands.prefix && split[0] !== Commands.prefix[0])
  //         params[prop] = value
  //     })

  //   return params
  // }

  public log(logBool?: boolean, ...args: any[]): object {
    const filtered: any = {}

    for (let prop in this)
      if (prop[0] != '_' && prop != 'msg')
        filtered[prop] = this[prop]

    if (logBool)
      log(filtered, ...args)

    return filtered
  }

  public getAt(pos: number): at {
    const at = this.ats[pos]
    if (at) return at

    throw new Error('At not found')
  }

  // // Gets @'s
  // private _filterAts() {
  //   const atsMatchеs = this.msg.content.match(this._atsRegex)
  //   const ats: at[] = []

  //   if (atsMatchеs)
  //     atsMatchеs.map(tag => {
  //       const found = ats.find(at => at.tag === tag)

  //       if (!found)
  //         ats.push({ tag, id: tag.replace(/<@!?/g, '').replace(/>/g, '') })
  //     })

  //   return ats
  // }

  // // Removes params and gets text only
  // private _filterText() {
  //   return this.msg.content
  //     .replace(this._textRegex, '')
  //     .replace(this._commandRegex, '')
  //     .replace(this._atsRegex, '')
  //     .trim()
  // }

}