"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.autoDownload = autoDownload;exports.callWebHook = callWebHook;exports.contactToArray = contactToArray;exports.createCatalogLink = createCatalogLink;exports.createFolders = createFolders;exports.getIPAddress = getIPAddress;exports.groupNameToArray = groupNameToArray;exports.groupToArray = groupToArray;exports.setMaxListners = setMaxListners;exports.startAllSessions = startAllSessions;exports.startHelper = startHelper;exports.strToBool = strToBool;exports.unlinkAsync = void 0;














var _clientS = require("@aws-sdk/client-s3");





var _axios = _interopRequireDefault(require("axios"));
var _crypto = _interopRequireDefault(require("crypto"));

var _fs = _interopRequireDefault(require("fs"));
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _os = _interopRequireDefault(require("os"));
var _path = _interopRequireDefault(require("path"));
var _util = require("util");

var _config = _interopRequireDefault(require("../config"));
var _index = require("../mapper/index");

var _bucketAlreadyExists = require("./bucketAlreadyExists"); /*
 * Copyright 2023 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let mime, crypto; //, aws: any;
if (_config.default.webhook.uploadS3) {mime = _config.default.webhook.uploadS3 ? _mimeTypes.default : null;crypto = _config.default.webhook.uploadS3 ? _crypto.default : null;}if (_config.default?.websocket?.uploadS3) {mime = _config.default.websocket.uploadS3 ? _mimeTypes.default : null;crypto = _config.default.websocket.uploadS3 ? _crypto.default : null;}function contactToArray(number, isGroup, isNewsletter,
isLid)
{
  const localArr = [];
  if (Array.isArray(number)) {
    for (let contact of number) {
      isGroup || isNewsletter ?
      contact = contact.split('@')[0] :
      contact = contact.split('@')[0]?.replace(/[^\w ]/g, '');
      if (contact !== '')
      if (isGroup) localArr.push(`${contact}@g.us`);else
      if (isNewsletter) localArr.push(`${contact}@newsletter`);else
      if (isLid || contact.length > 14)
      localArr.push(`${contact}@lid`);else
      localArr.push(`${contact}@c.us`);
    }
  } else {
    const arrContacts = number.split(/\s*[,;]\s*/g);
    for (let contact of arrContacts) {
      isGroup || isNewsletter ?
      contact = contact.split('@')[0] :
      contact = contact.split('@')[0]?.replace(/[^\w ]/g, '');
      if (contact !== '')
      if (isGroup) localArr.push(`${contact}@g.us`);else
      if (isNewsletter) localArr.push(`${contact}@newsletter`);else
      if (isLid || contact.length > 14)
      localArr.push(`${contact}@lid`);else
      localArr.push(`${contact}@c.us`);
    }
  }

  return localArr;
}

function groupToArray(group) {
  const localArr = [];
  if (Array.isArray(group)) {
    for (let contact of group) {
      contact = contact.split('@')[0];
      if (contact !== '') localArr.push(`${contact}@g.us`);
    }
  } else {
    const arrContacts = group.split(/\s*[,;]\s*/g);
    for (let contact of arrContacts) {
      contact = contact.split('@')[0];
      if (contact !== '') localArr.push(`${contact}@g.us`);
    }
  }

  return localArr;
}

function groupNameToArray(group) {
  const localArr = [];
  if (Array.isArray(group)) {
    for (const contact of group) {
      if (contact !== '') localArr.push(`${contact}`);
    }
  } else {
    const arrContacts = group.split(/\s*[,;]\s*/g);
    for (const contact of arrContacts) {
      if (contact !== '') localArr.push(`${contact}`);
    }
  }

  return localArr;
}

async function callWebHook(
client,
req,
event,
data)
{
  const webhook =
  client?.config.webhook || req.serverOptions.webhook.url || false;
  if (webhook) {
    if (
    req.serverOptions.webhook?.ignore && (
    req.serverOptions.webhook.ignore.includes(event) ||
    req.serverOptions.webhook.ignore.includes(data?.from) ||
    req.serverOptions.webhook.ignore.includes(data?.type)))

    return;
    if (req.serverOptions.webhook.autoDownload)
    await autoDownload(client, req, data);
    try {
      const chatId =
      data.from ||
      data.chatId || (
      data.chatId ? data.chatId._serialized : null);
      data = Object.assign({ event: event, session: client.session }, data);
      if (req.serverOptions.mapper.enable)
      data = await (0, _index.convert)(req.serverOptions.mapper.prefix, data);
      _axios.default.
      post(webhook, data).
      then(() => {
        try {
          const events = ['unreadmessages', 'onmessage'];
          if (events.includes(event) && req.serverOptions.webhook.readMessage)
          client.sendSeen(chatId);
        } catch (e) {}
      }).
      catch((e) => {
        req.logger.warn('Error calling Webhook.', e);
      });
    } catch (e) {
      req.logger.error(e);
    }
  }
}

async function autoDownload(client, req, message) {
  try {
    if (message && (message['mimetype'] || message.isMedia || message.isMMS)) {
      const buffer = await client.decryptFile(message);
      if (
      req.serverOptions.webhook.uploadS3 ||
      req.serverOptions?.websocket?.uploadS3)
      {
        const hashName = crypto.randomBytes(24).toString('hex');

        if (
        !_config.default?.aws_s3?.region ||
        !_config.default?.aws_s3?.access_key_id ||
        !_config.default?.aws_s3?.secret_key)

        throw new Error('Please, configure your aws configs');
        const s3Client = new _clientS.S3Client({
          region: _config.default?.aws_s3?.region,
          endpoint: _config.default?.aws_s3?.endpoint || undefined,
          forcePathStyle: _config.default?.aws_s3?.forcePathStyle || undefined
        });
        let bucketName = _config.default?.aws_s3?.defaultBucketName ?
        _config.default?.aws_s3?.defaultBucketName :
        client.session;
        bucketName = bucketName.
        normalize('NFD').
        replace(/[\u0300-\u036f]|[— _.,?!]/g, '').
        toLowerCase();
        bucketName =
        bucketName.length < 3 ?
        bucketName +
        `${Math.floor(Math.random() * (999 - 100 + 1)) + 100}` :
        bucketName;
        const fileName = `${
        _config.default.aws_s3.defaultBucketName ? client.session + '/' : ''}${
        hashName}.${mime.extension(message.mimetype)}`;

        if (
        !_config.default.aws_s3.defaultBucketName &&
        !(await (0, _bucketAlreadyExists.bucketAlreadyExists)(bucketName)))
        {
          await s3Client.send(
            new _clientS.CreateBucketCommand({
              Bucket: bucketName,
              ObjectOwnership: 'ObjectWriter'
            })
          );
          await s3Client.send(
            new _clientS.PutPublicAccessBlockCommand({
              Bucket: bucketName,
              PublicAccessBlockConfiguration: {
                BlockPublicAcls: false,
                IgnorePublicAcls: false,
                BlockPublicPolicy: false
              }
            })
          );
        }

        await s3Client.send(
          new _clientS.PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: message.mimetype,
            ACL: 'public-read'
          })
        );

        message.fileUrl = `https://${bucketName}.s3.amazonaws.com/${fileName}`;
      } else {
        message.body = await buffer.toString('base64');
      }
    }
  } catch (e) {
    req.logger.error(e);
  }
}

async function startAllSessions(config, logger) {
  try {
    await _axios.default.post(
      `${config.host}:${config.port}/api/${config.secretKey}/start-all`
    );
  } catch (e) {
    logger.error(e);
  }
}

async function startHelper(client, req) {
  if (req.serverOptions.webhook.allUnreadOnStart) await sendUnread(client, req);

  if (req.serverOptions.archive.enable) await archive(client, req);
}

async function sendUnread(client, req) {
  req.logger.info(`${client.session} : Inicio enviar mensagens não lidas`);

  try {
    const chats = await client.getAllChatsWithMessages(true);

    if (chats && chats.length > 0) {
      for (let i = 0; i < chats.length; i++)
      for (let j = 0; j < chats[i].msgs.length; j++) {
        callWebHook(client, req, 'unreadmessages', chats[i].msgs[j]);
      }
    }

    req.logger.info(`${client.session} : Fim enviar mensagens não lidas`);
  } catch (ex) {
    req.logger.error(ex);
  }
}

async function archive(client, req) {
  async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time * 10));
  }

  req.logger.info(`${client.session} : Inicio arquivando chats`);

  try {
    let chats = await client.getAllChats();
    if (chats && Array.isArray(chats) && chats.length > 0) {
      chats = chats.filter((c) => !c.archive);
    }
    if (chats && Array.isArray(chats) && chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        const date = new Date(chats[i].t * 1000);

        if (DaysBetween(date) > req.serverOptions.archive.daysToArchive) {
          await client.archiveChat(
            chats[i].id.id || chats[i].id._serialized,
            true
          );
          await sleep(
            Math.floor(Math.random() * req.serverOptions.archive.waitTime + 1)
          );
        }
      }
    }
    req.logger.info(`${client.session} : Fim arquivando chats`);
  } catch (ex) {
    req.logger.error(ex);
  }
}

function DaysBetween(StartDate) {
  const endDate = new Date();
  // The number of milliseconds in all UTC days (no DST)
  const oneDay = 1000 * 60 * 60 * 24;

  // A day in UTC always lasts 24 hours (unlike in other time formats)
  const start = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  const end = Date.UTC(
    StartDate.getFullYear(),
    StartDate.getMonth(),
    StartDate.getDate()
  );

  // so it's safe to divide by 24 hours
  return (start - end) / oneDay;
}

function createFolders() {
  const __dirname = _path.default.resolve(_path.default.dirname(''));
  const dirFiles = _path.default.resolve(__dirname, 'WhatsAppImages');
  if (!_fs.default.existsSync(dirFiles)) {
    _fs.default.mkdirSync(dirFiles);
  }

  const dirUpload = _path.default.resolve(__dirname, 'uploads');
  if (!_fs.default.existsSync(dirUpload)) {
    _fs.default.mkdirSync(dirUpload);
  }
}

function strToBool(s) {
  return /^(true|1)$/i.test(s);
}

function getIPAddress() {
  const interfaces = _os.default.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
      alias.family === 'IPv4' &&
      alias.address !== '127.0.0.1' &&
      !alias.internal)

      return alias.address;
    }
  }
  return '0.0.0.0';
}

function setMaxListners(serverOptions) {
  if (serverOptions && Number.isInteger(serverOptions.maxListeners)) {
    process.setMaxListeners(serverOptions.maxListeners);
  }
}

const unlinkAsync = exports.unlinkAsync = (0, _util.promisify)(_fs.default.unlink);

function createCatalogLink(session) {
  const [wid] = session.split('@');
  return `https://wa.me/c/${wid}`;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfY2xpZW50UyIsInJlcXVpcmUiLCJfYXhpb3MiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwiX2NyeXB0byIsIl9mcyIsIl9taW1lVHlwZXMiLCJfb3MiLCJfcGF0aCIsIl91dGlsIiwiX2NvbmZpZyIsIl9pbmRleCIsIl9idWNrZXRBbHJlYWR5RXhpc3RzIiwibWltZSIsImNyeXB0byIsImNvbmZpZyIsIndlYmhvb2siLCJ1cGxvYWRTMyIsIm1pbWV0eXBlcyIsIkNyeXB0byIsIndlYnNvY2tldCIsImNvbnRhY3RUb0FycmF5IiwibnVtYmVyIiwiaXNHcm91cCIsImlzTmV3c2xldHRlciIsImlzTGlkIiwibG9jYWxBcnIiLCJBcnJheSIsImlzQXJyYXkiLCJjb250YWN0Iiwic3BsaXQiLCJyZXBsYWNlIiwicHVzaCIsImxlbmd0aCIsImFyckNvbnRhY3RzIiwiZ3JvdXBUb0FycmF5IiwiZ3JvdXAiLCJncm91cE5hbWVUb0FycmF5IiwiY2FsbFdlYkhvb2siLCJjbGllbnQiLCJyZXEiLCJldmVudCIsImRhdGEiLCJzZXJ2ZXJPcHRpb25zIiwidXJsIiwiaWdub3JlIiwiaW5jbHVkZXMiLCJmcm9tIiwidHlwZSIsImF1dG9Eb3dubG9hZCIsImNoYXRJZCIsIl9zZXJpYWxpemVkIiwiT2JqZWN0IiwiYXNzaWduIiwic2Vzc2lvbiIsIm1hcHBlciIsImVuYWJsZSIsImNvbnZlcnQiLCJwcmVmaXgiLCJhcGkiLCJwb3N0IiwidGhlbiIsImV2ZW50cyIsInJlYWRNZXNzYWdlIiwic2VuZFNlZW4iLCJlIiwiY2F0Y2giLCJsb2dnZXIiLCJ3YXJuIiwiZXJyb3IiLCJtZXNzYWdlIiwiaXNNZWRpYSIsImlzTU1TIiwiYnVmZmVyIiwiZGVjcnlwdEZpbGUiLCJoYXNoTmFtZSIsInJhbmRvbUJ5dGVzIiwidG9TdHJpbmciLCJhd3NfczMiLCJyZWdpb24iLCJhY2Nlc3Nfa2V5X2lkIiwic2VjcmV0X2tleSIsIkVycm9yIiwiczNDbGllbnQiLCJTM0NsaWVudCIsImVuZHBvaW50IiwidW5kZWZpbmVkIiwiZm9yY2VQYXRoU3R5bGUiLCJidWNrZXROYW1lIiwiZGVmYXVsdEJ1Y2tldE5hbWUiLCJub3JtYWxpemUiLCJ0b0xvd2VyQ2FzZSIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImZpbGVOYW1lIiwiZXh0ZW5zaW9uIiwibWltZXR5cGUiLCJidWNrZXRBbHJlYWR5RXhpc3RzIiwic2VuZCIsIkNyZWF0ZUJ1Y2tldENvbW1hbmQiLCJCdWNrZXQiLCJPYmplY3RPd25lcnNoaXAiLCJQdXRQdWJsaWNBY2Nlc3NCbG9ja0NvbW1hbmQiLCJQdWJsaWNBY2Nlc3NCbG9ja0NvbmZpZ3VyYXRpb24iLCJCbG9ja1B1YmxpY0FjbHMiLCJJZ25vcmVQdWJsaWNBY2xzIiwiQmxvY2tQdWJsaWNQb2xpY3kiLCJQdXRPYmplY3RDb21tYW5kIiwiS2V5IiwiQm9keSIsIkNvbnRlbnRUeXBlIiwiQUNMIiwiZmlsZVVybCIsImJvZHkiLCJzdGFydEFsbFNlc3Npb25zIiwiaG9zdCIsInBvcnQiLCJzZWNyZXRLZXkiLCJzdGFydEhlbHBlciIsImFsbFVucmVhZE9uU3RhcnQiLCJzZW5kVW5yZWFkIiwiYXJjaGl2ZSIsImluZm8iLCJjaGF0cyIsImdldEFsbENoYXRzV2l0aE1lc3NhZ2VzIiwiaSIsImoiLCJtc2dzIiwiZXgiLCJzbGVlcCIsInRpbWUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJnZXRBbGxDaGF0cyIsImZpbHRlciIsImMiLCJkYXRlIiwiRGF0ZSIsInQiLCJEYXlzQmV0d2VlbiIsImRheXNUb0FyY2hpdmUiLCJhcmNoaXZlQ2hhdCIsImlkIiwid2FpdFRpbWUiLCJTdGFydERhdGUiLCJlbmREYXRlIiwib25lRGF5Iiwic3RhcnQiLCJVVEMiLCJnZXRGdWxsWWVhciIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsImVuZCIsImNyZWF0ZUZvbGRlcnMiLCJfX2Rpcm5hbWUiLCJwYXRoIiwiZGlybmFtZSIsImRpckZpbGVzIiwiZnMiLCJleGlzdHNTeW5jIiwibWtkaXJTeW5jIiwiZGlyVXBsb2FkIiwic3RyVG9Cb29sIiwicyIsInRlc3QiLCJnZXRJUEFkZHJlc3MiLCJpbnRlcmZhY2VzIiwib3MiLCJuZXR3b3JrSW50ZXJmYWNlcyIsImRldk5hbWUiLCJpZmFjZSIsImFsaWFzIiwiZmFtaWx5IiwiYWRkcmVzcyIsImludGVybmFsIiwic2V0TWF4TGlzdG5lcnMiLCJOdW1iZXIiLCJpc0ludGVnZXIiLCJtYXhMaXN0ZW5lcnMiLCJwcm9jZXNzIiwic2V0TWF4TGlzdGVuZXJzIiwidW5saW5rQXN5bmMiLCJleHBvcnRzIiwicHJvbWlzaWZ5IiwidW5saW5rIiwiY3JlYXRlQ2F0YWxvZ0xpbmsiLCJ3aWQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC9mdW5jdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQ29weXJpZ2h0IDIwMjMgV1BQQ29ubmVjdCBUZWFtXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XHJcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqXHJcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKi9cclxuaW1wb3J0IHtcclxuICBDcmVhdGVCdWNrZXRDb21tYW5kLFxyXG4gIFB1dE9iamVjdENvbW1hbmQsXHJcbiAgUHV0UHVibGljQWNjZXNzQmxvY2tDb21tYW5kLFxyXG4gIFMzQ2xpZW50LFxyXG59IGZyb20gJ0Bhd3Mtc2RrL2NsaWVudC1zMyc7XHJcbmltcG9ydCBhcGkgZnJvbSAnYXhpb3MnO1xyXG5pbXBvcnQgQ3J5cHRvIGZyb20gJ2NyeXB0byc7XHJcbmltcG9ydCB7IFJlcXVlc3QgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IG1pbWV0eXBlcyBmcm9tICdtaW1lLXR5cGVzJztcclxuaW1wb3J0IG9zIGZyb20gJ29zJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gJ3V0aWwnO1xyXG5cclxuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcnO1xyXG5pbXBvcnQgeyBjb252ZXJ0IH0gZnJvbSAnLi4vbWFwcGVyL2luZGV4JztcclxuaW1wb3J0IHsgU2VydmVyT3B0aW9ucyB9IGZyb20gJy4uL3R5cGVzL1NlcnZlck9wdGlvbnMnO1xyXG5pbXBvcnQgeyBidWNrZXRBbHJlYWR5RXhpc3RzIH0gZnJvbSAnLi9idWNrZXRBbHJlYWR5RXhpc3RzJztcclxuXHJcbmxldCBtaW1lOiBhbnksIGNyeXB0bzogYW55OyAvLywgYXdzOiBhbnk7XHJcbmlmIChjb25maWcud2ViaG9vay51cGxvYWRTMykge1xyXG4gIG1pbWUgPSBjb25maWcud2ViaG9vay51cGxvYWRTMyA/IG1pbWV0eXBlcyA6IG51bGw7XHJcbiAgY3J5cHRvID0gY29uZmlnLndlYmhvb2sudXBsb2FkUzMgPyBDcnlwdG8gOiBudWxsO1xyXG59XHJcbmlmIChjb25maWc/LndlYnNvY2tldD8udXBsb2FkUzMpIHtcclxuICBtaW1lID0gY29uZmlnLndlYnNvY2tldC51cGxvYWRTMyA/IG1pbWV0eXBlcyA6IG51bGw7XHJcbiAgY3J5cHRvID0gY29uZmlnLndlYnNvY2tldC51cGxvYWRTMyA/IENyeXB0byA6IG51bGw7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjb250YWN0VG9BcnJheShcclxuICBudW1iZXI6IGFueSxcclxuICBpc0dyb3VwPzogYm9vbGVhbixcclxuICBpc05ld3NsZXR0ZXI/OiBib29sZWFuLFxyXG4gIGlzTGlkPzogYm9vbGVhblxyXG4pIHtcclxuICBjb25zdCBsb2NhbEFycjogYW55ID0gW107XHJcbiAgaWYgKEFycmF5LmlzQXJyYXkobnVtYmVyKSkge1xyXG4gICAgZm9yIChsZXQgY29udGFjdCBvZiBudW1iZXIpIHtcclxuICAgICAgaXNHcm91cCB8fCBpc05ld3NsZXR0ZXJcclxuICAgICAgICA/IChjb250YWN0ID0gY29udGFjdC5zcGxpdCgnQCcpWzBdKVxyXG4gICAgICAgIDogKGNvbnRhY3QgPSBjb250YWN0LnNwbGl0KCdAJylbMF0/LnJlcGxhY2UoL1teXFx3IF0vZywgJycpKTtcclxuICAgICAgaWYgKGNvbnRhY3QgIT09ICcnKVxyXG4gICAgICAgIGlmIChpc0dyb3VwKSAobG9jYWxBcnIgYXMgYW55KS5wdXNoKGAke2NvbnRhY3R9QGcudXNgKTtcclxuICAgICAgICBlbHNlIGlmIChpc05ld3NsZXR0ZXIpIChsb2NhbEFyciBhcyBhbnkpLnB1c2goYCR7Y29udGFjdH1AbmV3c2xldHRlcmApO1xyXG4gICAgICAgIGVsc2UgaWYgKGlzTGlkIHx8IGNvbnRhY3QubGVuZ3RoID4gMTQpXHJcbiAgICAgICAgICAobG9jYWxBcnIgYXMgYW55KS5wdXNoKGAke2NvbnRhY3R9QGxpZGApO1xyXG4gICAgICAgIGVsc2UgKGxvY2FsQXJyIGFzIGFueSkucHVzaChgJHtjb250YWN0fUBjLnVzYCk7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGNvbnN0IGFyckNvbnRhY3RzID0gbnVtYmVyLnNwbGl0KC9cXHMqWyw7XVxccyovZyk7XHJcbiAgICBmb3IgKGxldCBjb250YWN0IG9mIGFyckNvbnRhY3RzKSB7XHJcbiAgICAgIGlzR3JvdXAgfHwgaXNOZXdzbGV0dGVyXHJcbiAgICAgICAgPyAoY29udGFjdCA9IGNvbnRhY3Quc3BsaXQoJ0AnKVswXSlcclxuICAgICAgICA6IChjb250YWN0ID0gY29udGFjdC5zcGxpdCgnQCcpWzBdPy5yZXBsYWNlKC9bXlxcdyBdL2csICcnKSk7XHJcbiAgICAgIGlmIChjb250YWN0ICE9PSAnJylcclxuICAgICAgICBpZiAoaXNHcm91cCkgKGxvY2FsQXJyIGFzIGFueSkucHVzaChgJHtjb250YWN0fUBnLnVzYCk7XHJcbiAgICAgICAgZWxzZSBpZiAoaXNOZXdzbGV0dGVyKSAobG9jYWxBcnIgYXMgYW55KS5wdXNoKGAke2NvbnRhY3R9QG5ld3NsZXR0ZXJgKTtcclxuICAgICAgICBlbHNlIGlmIChpc0xpZCB8fCBjb250YWN0Lmxlbmd0aCA+IDE0KVxyXG4gICAgICAgICAgKGxvY2FsQXJyIGFzIGFueSkucHVzaChgJHtjb250YWN0fUBsaWRgKTtcclxuICAgICAgICBlbHNlIChsb2NhbEFyciBhcyBhbnkpLnB1c2goYCR7Y29udGFjdH1AYy51c2ApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGxvY2FsQXJyO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ3JvdXBUb0FycmF5KGdyb3VwOiBhbnkpIHtcclxuICBjb25zdCBsb2NhbEFycjogYW55ID0gW107XHJcbiAgaWYgKEFycmF5LmlzQXJyYXkoZ3JvdXApKSB7XHJcbiAgICBmb3IgKGxldCBjb250YWN0IG9mIGdyb3VwKSB7XHJcbiAgICAgIGNvbnRhY3QgPSBjb250YWN0LnNwbGl0KCdAJylbMF07XHJcbiAgICAgIGlmIChjb250YWN0ICE9PSAnJykgKGxvY2FsQXJyIGFzIGFueSkucHVzaChgJHtjb250YWN0fUBnLnVzYCk7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIGNvbnN0IGFyckNvbnRhY3RzID0gZ3JvdXAuc3BsaXQoL1xccypbLDtdXFxzKi9nKTtcclxuICAgIGZvciAobGV0IGNvbnRhY3Qgb2YgYXJyQ29udGFjdHMpIHtcclxuICAgICAgY29udGFjdCA9IGNvbnRhY3Quc3BsaXQoJ0AnKVswXTtcclxuICAgICAgaWYgKGNvbnRhY3QgIT09ICcnKSAobG9jYWxBcnIgYXMgYW55KS5wdXNoKGAke2NvbnRhY3R9QGcudXNgKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBsb2NhbEFycjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdyb3VwTmFtZVRvQXJyYXkoZ3JvdXA6IGFueSkge1xyXG4gIGNvbnN0IGxvY2FsQXJyOiBhbnkgPSBbXTtcclxuICBpZiAoQXJyYXkuaXNBcnJheShncm91cCkpIHtcclxuICAgIGZvciAoY29uc3QgY29udGFjdCBvZiBncm91cCkge1xyXG4gICAgICBpZiAoY29udGFjdCAhPT0gJycpIChsb2NhbEFyciBhcyBhbnkpLnB1c2goYCR7Y29udGFjdH1gKTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgY29uc3QgYXJyQ29udGFjdHMgPSBncm91cC5zcGxpdCgvXFxzKlssO11cXHMqL2cpO1xyXG4gICAgZm9yIChjb25zdCBjb250YWN0IG9mIGFyckNvbnRhY3RzKSB7XHJcbiAgICAgIGlmIChjb250YWN0ICE9PSAnJykgKGxvY2FsQXJyIGFzIGFueSkucHVzaChgJHtjb250YWN0fWApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGxvY2FsQXJyO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FsbFdlYkhvb2soXHJcbiAgY2xpZW50OiBhbnksXHJcbiAgcmVxOiBSZXF1ZXN0LFxyXG4gIGV2ZW50OiBhbnksXHJcbiAgZGF0YTogYW55XHJcbikge1xyXG4gIGNvbnN0IHdlYmhvb2sgPVxyXG4gICAgY2xpZW50Py5jb25maWcud2ViaG9vayB8fCByZXEuc2VydmVyT3B0aW9ucy53ZWJob29rLnVybCB8fCBmYWxzZTtcclxuICBpZiAod2ViaG9vaykge1xyXG4gICAgaWYgKFxyXG4gICAgICByZXEuc2VydmVyT3B0aW9ucy53ZWJob29rPy5pZ25vcmUgJiZcclxuICAgICAgKHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2suaWdub3JlLmluY2x1ZGVzKGV2ZW50KSB8fFxyXG4gICAgICAgIHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2suaWdub3JlLmluY2x1ZGVzKGRhdGE/LmZyb20pIHx8XHJcbiAgICAgICAgcmVxLnNlcnZlck9wdGlvbnMud2ViaG9vay5pZ25vcmUuaW5jbHVkZXMoZGF0YT8udHlwZSkpXHJcbiAgICApXHJcbiAgICAgIHJldHVybjtcclxuICAgIGlmIChyZXEuc2VydmVyT3B0aW9ucy53ZWJob29rLmF1dG9Eb3dubG9hZClcclxuICAgICAgYXdhaXQgYXV0b0Rvd25sb2FkKGNsaWVudCwgcmVxLCBkYXRhKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGNoYXRJZCA9XHJcbiAgICAgICAgZGF0YS5mcm9tIHx8XHJcbiAgICAgICAgZGF0YS5jaGF0SWQgfHxcclxuICAgICAgICAoZGF0YS5jaGF0SWQgPyBkYXRhLmNoYXRJZC5fc2VyaWFsaXplZCA6IG51bGwpO1xyXG4gICAgICBkYXRhID0gT2JqZWN0LmFzc2lnbih7IGV2ZW50OiBldmVudCwgc2Vzc2lvbjogY2xpZW50LnNlc3Npb24gfSwgZGF0YSk7XHJcbiAgICAgIGlmIChyZXEuc2VydmVyT3B0aW9ucy5tYXBwZXIuZW5hYmxlKVxyXG4gICAgICAgIGRhdGEgPSBhd2FpdCBjb252ZXJ0KHJlcS5zZXJ2ZXJPcHRpb25zLm1hcHBlci5wcmVmaXgsIGRhdGEpO1xyXG4gICAgICBhcGlcclxuICAgICAgICAucG9zdCh3ZWJob29rLCBkYXRhKVxyXG4gICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IFsndW5yZWFkbWVzc2FnZXMnLCAnb25tZXNzYWdlJ107XHJcbiAgICAgICAgICAgIGlmIChldmVudHMuaW5jbHVkZXMoZXZlbnQpICYmIHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2sucmVhZE1lc3NhZ2UpXHJcbiAgICAgICAgICAgICAgY2xpZW50LnNlbmRTZWVuKGNoYXRJZCk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7fVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKChlKSA9PiB7XHJcbiAgICAgICAgICByZXEubG9nZ2VyLndhcm4oJ0Vycm9yIGNhbGxpbmcgV2ViaG9vay4nLCBlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhdXRvRG93bmxvYWQoY2xpZW50OiBhbnksIHJlcTogYW55LCBtZXNzYWdlOiBhbnkpIHtcclxuICB0cnkge1xyXG4gICAgaWYgKG1lc3NhZ2UgJiYgKG1lc3NhZ2VbJ21pbWV0eXBlJ10gfHwgbWVzc2FnZS5pc01lZGlhIHx8IG1lc3NhZ2UuaXNNTVMpKSB7XHJcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGNsaWVudC5kZWNyeXB0RmlsZShtZXNzYWdlKTtcclxuICAgICAgaWYgKFxyXG4gICAgICAgIHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2sudXBsb2FkUzMgfHxcclxuICAgICAgICByZXEuc2VydmVyT3B0aW9ucz8ud2Vic29ja2V0Py51cGxvYWRTM1xyXG4gICAgICApIHtcclxuICAgICAgICBjb25zdCBoYXNoTmFtZSA9IGNyeXB0by5yYW5kb21CeXRlcygyNCkudG9TdHJpbmcoJ2hleCcpO1xyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAhY29uZmlnPy5hd3NfczM/LnJlZ2lvbiB8fFxyXG4gICAgICAgICAgIWNvbmZpZz8uYXdzX3MzPy5hY2Nlc3Nfa2V5X2lkIHx8XHJcbiAgICAgICAgICAhY29uZmlnPy5hd3NfczM/LnNlY3JldF9rZXlcclxuICAgICAgICApXHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSwgY29uZmlndXJlIHlvdXIgYXdzIGNvbmZpZ3MnKTtcclxuICAgICAgICBjb25zdCBzM0NsaWVudCA9IG5ldyBTM0NsaWVudCh7XHJcbiAgICAgICAgICByZWdpb246IGNvbmZpZz8uYXdzX3MzPy5yZWdpb24sXHJcbiAgICAgICAgICBlbmRwb2ludDogY29uZmlnPy5hd3NfczM/LmVuZHBvaW50IHx8IHVuZGVmaW5lZCxcclxuICAgICAgICAgIGZvcmNlUGF0aFN0eWxlOiBjb25maWc/LmF3c19zMz8uZm9yY2VQYXRoU3R5bGUgfHwgdW5kZWZpbmVkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBidWNrZXROYW1lID0gY29uZmlnPy5hd3NfczM/LmRlZmF1bHRCdWNrZXROYW1lXHJcbiAgICAgICAgICA/IGNvbmZpZz8uYXdzX3MzPy5kZWZhdWx0QnVja2V0TmFtZVxyXG4gICAgICAgICAgOiBjbGllbnQuc2Vzc2lvbjtcclxuICAgICAgICBidWNrZXROYW1lID0gYnVja2V0TmFtZVxyXG4gICAgICAgICAgLm5vcm1hbGl6ZSgnTkZEJylcclxuICAgICAgICAgIC5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXXxb4oCUIF8uLD8hXS9nLCAnJylcclxuICAgICAgICAgIC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGJ1Y2tldE5hbWUgPVxyXG4gICAgICAgICAgYnVja2V0TmFtZS5sZW5ndGggPCAzXHJcbiAgICAgICAgICAgID8gYnVja2V0TmFtZSArXHJcbiAgICAgICAgICAgICAgYCR7TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDk5OSAtIDEwMCArIDEpKSArIDEwMH1gXHJcbiAgICAgICAgICAgIDogYnVja2V0TmFtZTtcclxuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IGAke1xyXG4gICAgICAgICAgY29uZmlnLmF3c19zMy5kZWZhdWx0QnVja2V0TmFtZSA/IGNsaWVudC5zZXNzaW9uICsgJy8nIDogJydcclxuICAgICAgICB9JHtoYXNoTmFtZX0uJHttaW1lLmV4dGVuc2lvbihtZXNzYWdlLm1pbWV0eXBlKX1gO1xyXG5cclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAhY29uZmlnLmF3c19zMy5kZWZhdWx0QnVja2V0TmFtZSAmJlxyXG4gICAgICAgICAgIShhd2FpdCBidWNrZXRBbHJlYWR5RXhpc3RzKGJ1Y2tldE5hbWUpKVxyXG4gICAgICAgICkge1xyXG4gICAgICAgICAgYXdhaXQgczNDbGllbnQuc2VuZChcclxuICAgICAgICAgICAgbmV3IENyZWF0ZUJ1Y2tldENvbW1hbmQoe1xyXG4gICAgICAgICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcclxuICAgICAgICAgICAgICBPYmplY3RPd25lcnNoaXA6ICdPYmplY3RXcml0ZXInLFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGF3YWl0IHMzQ2xpZW50LnNlbmQoXHJcbiAgICAgICAgICAgIG5ldyBQdXRQdWJsaWNBY2Nlc3NCbG9ja0NvbW1hbmQoe1xyXG4gICAgICAgICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcclxuICAgICAgICAgICAgICBQdWJsaWNBY2Nlc3NCbG9ja0NvbmZpZ3VyYXRpb246IHtcclxuICAgICAgICAgICAgICAgIEJsb2NrUHVibGljQWNsczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBJZ25vcmVQdWJsaWNBY2xzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIEJsb2NrUHVibGljUG9saWN5OiBmYWxzZSxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGF3YWl0IHMzQ2xpZW50LnNlbmQoXHJcbiAgICAgICAgICBuZXcgUHV0T2JqZWN0Q29tbWFuZCh7XHJcbiAgICAgICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcclxuICAgICAgICAgICAgS2V5OiBmaWxlTmFtZSxcclxuICAgICAgICAgICAgQm9keTogYnVmZmVyLFxyXG4gICAgICAgICAgICBDb250ZW50VHlwZTogbWVzc2FnZS5taW1ldHlwZSxcclxuICAgICAgICAgICAgQUNMOiAncHVibGljLXJlYWQnLFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBtZXNzYWdlLmZpbGVVcmwgPSBgaHR0cHM6Ly8ke2J1Y2tldE5hbWV9LnMzLmFtYXpvbmF3cy5jb20vJHtmaWxlTmFtZX1gO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG1lc3NhZ2UuYm9keSA9IGF3YWl0IGJ1ZmZlci50b1N0cmluZygnYmFzZTY0Jyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0QWxsU2Vzc2lvbnMoY29uZmlnOiBhbnksIGxvZ2dlcjogYW55KSB7XHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IGFwaS5wb3N0KFxyXG4gICAgICBgJHtjb25maWcuaG9zdH06JHtjb25maWcucG9ydH0vYXBpLyR7Y29uZmlnLnNlY3JldEtleX0vc3RhcnQtYWxsYFxyXG4gICAgKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBsb2dnZXIuZXJyb3IoZSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRIZWxwZXIoY2xpZW50OiBhbnksIHJlcTogYW55KSB7XHJcbiAgaWYgKHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2suYWxsVW5yZWFkT25TdGFydCkgYXdhaXQgc2VuZFVucmVhZChjbGllbnQsIHJlcSk7XHJcblxyXG4gIGlmIChyZXEuc2VydmVyT3B0aW9ucy5hcmNoaXZlLmVuYWJsZSkgYXdhaXQgYXJjaGl2ZShjbGllbnQsIHJlcSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNlbmRVbnJlYWQoY2xpZW50OiBhbnksIHJlcTogYW55KSB7XHJcbiAgcmVxLmxvZ2dlci5pbmZvKGAke2NsaWVudC5zZXNzaW9ufSA6IEluaWNpbyBlbnZpYXIgbWVuc2FnZW5zIG7Do28gbGlkYXNgKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNoYXRzID0gYXdhaXQgY2xpZW50LmdldEFsbENoYXRzV2l0aE1lc3NhZ2VzKHRydWUpO1xyXG5cclxuICAgIGlmIChjaGF0cyAmJiBjaGF0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hhdHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBjaGF0c1tpXS5tc2dzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ3VucmVhZG1lc3NhZ2VzJywgY2hhdHNbaV0ubXNnc1tqXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlcS5sb2dnZXIuaW5mbyhgJHtjbGllbnQuc2Vzc2lvbn0gOiBGaW0gZW52aWFyIG1lbnNhZ2VucyBuw6NvIGxpZGFzYCk7XHJcbiAgfSBjYXRjaCAoZXgpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXgpO1xyXG4gIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gYXJjaGl2ZShjbGllbnQ6IGFueSwgcmVxOiBhbnkpIHtcclxuICBhc3luYyBmdW5jdGlvbiBzbGVlcCh0aW1lOiBudW1iZXIpIHtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCB0aW1lICogMTApKTtcclxuICB9XHJcblxyXG4gIHJlcS5sb2dnZXIuaW5mbyhgJHtjbGllbnQuc2Vzc2lvbn0gOiBJbmljaW8gYXJxdWl2YW5kbyBjaGF0c2ApO1xyXG5cclxuICB0cnkge1xyXG4gICAgbGV0IGNoYXRzID0gYXdhaXQgY2xpZW50LmdldEFsbENoYXRzKCk7XHJcbiAgICBpZiAoY2hhdHMgJiYgQXJyYXkuaXNBcnJheShjaGF0cykgJiYgY2hhdHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBjaGF0cyA9IGNoYXRzLmZpbHRlcigoYykgPT4gIWMuYXJjaGl2ZSk7XHJcbiAgICB9XHJcbiAgICBpZiAoY2hhdHMgJiYgQXJyYXkuaXNBcnJheShjaGF0cykgJiYgY2hhdHMubGVuZ3RoID4gMCkge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKGNoYXRzW2ldLnQgKiAxMDAwKTtcclxuXHJcbiAgICAgICAgaWYgKERheXNCZXR3ZWVuKGRhdGUpID4gcmVxLnNlcnZlck9wdGlvbnMuYXJjaGl2ZS5kYXlzVG9BcmNoaXZlKSB7XHJcbiAgICAgICAgICBhd2FpdCBjbGllbnQuYXJjaGl2ZUNoYXQoXHJcbiAgICAgICAgICAgIGNoYXRzW2ldLmlkLmlkIHx8IGNoYXRzW2ldLmlkLl9zZXJpYWxpemVkLFxyXG4gICAgICAgICAgICB0cnVlXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgYXdhaXQgc2xlZXAoXHJcbiAgICAgICAgICAgIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHJlcS5zZXJ2ZXJPcHRpb25zLmFyY2hpdmUud2FpdFRpbWUgKyAxKVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlcS5sb2dnZXIuaW5mbyhgJHtjbGllbnQuc2Vzc2lvbn0gOiBGaW0gYXJxdWl2YW5kbyBjaGF0c2ApO1xyXG4gIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGV4KTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIERheXNCZXR3ZWVuKFN0YXJ0RGF0ZTogRGF0ZSkge1xyXG4gIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gIC8vIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGluIGFsbCBVVEMgZGF5cyAobm8gRFNUKVxyXG4gIGNvbnN0IG9uZURheSA9IDEwMDAgKiA2MCAqIDYwICogMjQ7XHJcblxyXG4gIC8vIEEgZGF5IGluIFVUQyBhbHdheXMgbGFzdHMgMjQgaG91cnMgKHVubGlrZSBpbiBvdGhlciB0aW1lIGZvcm1hdHMpXHJcbiAgY29uc3Qgc3RhcnQgPSBEYXRlLlVUQyhcclxuICAgIGVuZERhdGUuZ2V0RnVsbFllYXIoKSxcclxuICAgIGVuZERhdGUuZ2V0TW9udGgoKSxcclxuICAgIGVuZERhdGUuZ2V0RGF0ZSgpXHJcbiAgKTtcclxuICBjb25zdCBlbmQgPSBEYXRlLlVUQyhcclxuICAgIFN0YXJ0RGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgU3RhcnREYXRlLmdldE1vbnRoKCksXHJcbiAgICBTdGFydERhdGUuZ2V0RGF0ZSgpXHJcbiAgKTtcclxuXHJcbiAgLy8gc28gaXQncyBzYWZlIHRvIGRpdmlkZSBieSAyNCBob3Vyc1xyXG4gIHJldHVybiAoc3RhcnQgLSBlbmQpIC8gb25lRGF5O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRm9sZGVycygpIHtcclxuICBjb25zdCBfX2Rpcm5hbWUgPSBwYXRoLnJlc29sdmUocGF0aC5kaXJuYW1lKCcnKSk7XHJcbiAgY29uc3QgZGlyRmlsZXMgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnV2hhdHNBcHBJbWFnZXMnKTtcclxuICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyRmlsZXMpKSB7XHJcbiAgICBmcy5ta2RpclN5bmMoZGlyRmlsZXMpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgZGlyVXBsb2FkID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3VwbG9hZHMnKTtcclxuICBpZiAoIWZzLmV4aXN0c1N5bmMoZGlyVXBsb2FkKSkge1xyXG4gICAgZnMubWtkaXJTeW5jKGRpclVwbG9hZCk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RyVG9Cb29sKHM6IHN0cmluZykge1xyXG4gIHJldHVybiAvXih0cnVlfDEpJC9pLnRlc3Qocyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRJUEFkZHJlc3MoKSB7XHJcbiAgY29uc3QgaW50ZXJmYWNlcyA9IG9zLm5ldHdvcmtJbnRlcmZhY2VzKCk7XHJcbiAgZm9yIChjb25zdCBkZXZOYW1lIGluIGludGVyZmFjZXMpIHtcclxuICAgIGNvbnN0IGlmYWNlOiBhbnkgPSBpbnRlcmZhY2VzW2Rldk5hbWVdO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpZmFjZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBjb25zdCBhbGlhcyA9IGlmYWNlW2ldO1xyXG4gICAgICBpZiAoXHJcbiAgICAgICAgYWxpYXMuZmFtaWx5ID09PSAnSVB2NCcgJiZcclxuICAgICAgICBhbGlhcy5hZGRyZXNzICE9PSAnMTI3LjAuMC4xJyAmJlxyXG4gICAgICAgICFhbGlhcy5pbnRlcm5hbFxyXG4gICAgICApXHJcbiAgICAgICAgcmV0dXJuIGFsaWFzLmFkZHJlc3M7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAnMC4wLjAuMCc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRNYXhMaXN0bmVycyhzZXJ2ZXJPcHRpb25zOiBTZXJ2ZXJPcHRpb25zKSB7XHJcbiAgaWYgKHNlcnZlck9wdGlvbnMgJiYgTnVtYmVyLmlzSW50ZWdlcihzZXJ2ZXJPcHRpb25zLm1heExpc3RlbmVycykpIHtcclxuICAgIHByb2Nlc3Muc2V0TWF4TGlzdGVuZXJzKHNlcnZlck9wdGlvbnMubWF4TGlzdGVuZXJzKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCB1bmxpbmtBc3luYyA9IHByb21pc2lmeShmcy51bmxpbmspO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNhdGFsb2dMaW5rKHNlc3Npb246IGFueSkge1xyXG4gIGNvbnN0IFt3aWRdID0gc2Vzc2lvbi5zcGxpdCgnQCcpO1xyXG4gIHJldHVybiBgaHR0cHM6Ly93YS5tZS9jLyR7d2lkfWA7XHJcbn1cclxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFlQSxJQUFBQSxRQUFBLEdBQUFDLE9BQUE7Ozs7OztBQU1BLElBQUFDLE1BQUEsR0FBQUMsc0JBQUEsQ0FBQUYsT0FBQTtBQUNBLElBQUFHLE9BQUEsR0FBQUQsc0JBQUEsQ0FBQUYsT0FBQTs7QUFFQSxJQUFBSSxHQUFBLEdBQUFGLHNCQUFBLENBQUFGLE9BQUE7QUFDQSxJQUFBSyxVQUFBLEdBQUFILHNCQUFBLENBQUFGLE9BQUE7QUFDQSxJQUFBTSxHQUFBLEdBQUFKLHNCQUFBLENBQUFGLE9BQUE7QUFDQSxJQUFBTyxLQUFBLEdBQUFMLHNCQUFBLENBQUFGLE9BQUE7QUFDQSxJQUFBUSxLQUFBLEdBQUFSLE9BQUE7O0FBRUEsSUFBQVMsT0FBQSxHQUFBUCxzQkFBQSxDQUFBRixPQUFBO0FBQ0EsSUFBQVUsTUFBQSxHQUFBVixPQUFBOztBQUVBLElBQUFXLG9CQUFBLEdBQUFYLE9BQUEsMEJBQTRELENBakM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FxQkEsSUFBSVksSUFBUyxFQUFFQyxNQUFXLENBQUMsQ0FBQztBQUM1QixJQUFJQyxlQUFNLENBQUNDLE9BQU8sQ0FBQ0MsUUFBUSxFQUFFLENBQzNCSixJQUFJLEdBQUdFLGVBQU0sQ0FBQ0MsT0FBTyxDQUFDQyxRQUFRLEdBQUdDLGtCQUFTLEdBQUcsSUFBSSxDQUNqREosTUFBTSxHQUFHQyxlQUFNLENBQUNDLE9BQU8sQ0FBQ0MsUUFBUSxHQUFHRSxlQUFNLEdBQUcsSUFBSSxDQUNsRCxDQUNBLElBQUlKLGVBQU0sRUFBRUssU0FBUyxFQUFFSCxRQUFRLEVBQUUsQ0FDL0JK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