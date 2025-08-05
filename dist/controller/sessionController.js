"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.checkConnectionSession = checkConnectionSession;exports.closeSession = closeSession;exports.download = download;exports.downloadMediaByMessage = downloadMediaByMessage;exports.editBusinessProfile = editBusinessProfile;exports.getMediaByMessage = getMediaByMessage;exports.getQrCode = getQrCode;exports.getSessionState = getSessionState;exports.killServiceWorker = killServiceWorker;exports.logOutSession = logOutSession;exports.restartService = restartService;exports.setOnlinePresence = setOnlinePresence;exports.showAllSessions = showAllSessions;exports.startAllSessions = startAllSessions;exports.startSession = startSession;exports.subscribePresence = subscribePresence;
















var _fs = _interopRequireDefault(require("fs"));
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _qrcode = _interopRequireDefault(require("qrcode"));


var _package = require("../../package.json");
var _config = _interopRequireDefault(require("../config"));
var _createSessionUtil = _interopRequireDefault(require("../util/createSessionUtil"));
var _functions = require("../util/functions");
var _getAllTokens = _interopRequireDefault(require("../util/getAllTokens"));
var _sessionUtil = require("../util/sessionUtil"); /*
 * Copyright 2021 WPPConnect Team
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
 * See the License for the specific language governing permclearSessionissions and
 * limitations under the License.
 */const SessionUtil = new _createSessionUtil.default();async function downloadFileFunction(message, client, logger) {try {const buffer = await client.decryptFile(message);const filename = `./WhatsAppImages/file${message.t}`;if (!_fs.default.existsSync(filename)) {let result = '';
      if (message.type === 'ptt') {
        result = `${filename}.oga`;
      } else {
        result = `${filename}.${_mimeTypes.default.extension(message.mimetype)}`;
      }

      await _fs.default.writeFile(result, buffer, (err) => {
        if (err) {
          logger.error(err);
        }
      });

      return result;
    } else {
      return `${filename}.${_mimeTypes.default.extension(message.mimetype)}`;
    }
  } catch (e) {
    logger.error(e);
    logger.warn(
      'Erro ao descriptografar a midia, tentando fazer o download direto...'
    );
    try {
      const buffer = await client.downloadMedia(message);
      const filename = `./WhatsAppImages/file${message.t}`;
      if (!_fs.default.existsSync(filename)) {
        let result = '';
        if (message.type === 'ptt') {
          result = `${filename}.oga`;
        } else {
          result = `${filename}.${_mimeTypes.default.extension(message.mimetype)}`;
        }

        await _fs.default.writeFile(result, buffer, (err) => {
          if (err) {
            logger.error(err);
          }
        });

        return result;
      } else {
        return `${filename}.${_mimeTypes.default.extension(message.mimetype)}`;
      }
    } catch (e) {
      logger.error(e);
      logger.warn('Não foi possível baixar a mídia...');
    }
  }
}

async function download(message, client, logger) {
  try {
    const path = await downloadFileFunction(message, client, logger);
    return path?.replace('./', '');
  } catch (e) {
    logger.error(e);
  }
}

async function startAllSessions(
req,
res)
{
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.operationId = 'startAllSessions'
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["secretkey"] = {
      schema: 'THISISMYSECURECODE'
     }
   */
  const { secretkey } = req.params;
  const { authorization: token } = req.headers;

  let tokenDecrypt = '';

  if (secretkey === undefined) {
    tokenDecrypt = token.split(' ')[0];
  } else {
    tokenDecrypt = secretkey;
  }

  const allSessions = await (0, _getAllTokens.default)(req);

  if (tokenDecrypt !== req.serverOptions.secretKey) {
    res.status(400).json({
      response: 'error',
      message: 'The token is incorrect'
    });
  }

  allSessions.map(async (session) => {
    const util = new _createSessionUtil.default();
    await util.opendata(req, session);
  });

  return await res.
  status(201).
  json({ status: 'success', message: 'Starting all sessions' });
}

async function showAllSessions(
req,
res)
{
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.operationId = 'showAllSessions'
     #swagger.autoQuery=false
     #swagger.autoHeaders=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["secretkey"] = {
      schema: 'THISISMYSECURETOKEN'
     }
   */
  const { secretkey } = req.params;
  const { authorization: token } = req.headers;

  let tokenDecrypt = '';

  if (secretkey === undefined) {
    tokenDecrypt = token?.split(' ')[0];
  } else {
    tokenDecrypt = secretkey;
  }

  const arr = [];

  if (tokenDecrypt !== req.serverOptions.secretKey) {
    res.status(400).json({
      response: false,
      message: 'The token is incorrect'
    });
  }

  Object.keys(_sessionUtil.clientsArray).forEach((item) => {
    arr.push({ session: item });
  });

  res.status(200).json({ response: await (0, _getAllTokens.default)(req) });
}

async function startSession(req, res) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.operationId = 'startSession'
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              webhook: { type: "string" },
              waitQrCode: { type: "boolean" },
            }
          },
          example: {
            webhook: "",
            waitQrCode: false,
          }
        }
      }
     }
   */
  const session = req.session;
  const { waitQrCode = false } = req.body;

  await getSessionState(req, res);
  await SessionUtil.opendata(req, session, waitQrCode ? res : null);
}

async function closeSession(req, res) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.operationId = 'closeSession'
     #swagger.autoBody=true
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  const session = req.session;
  try {
    if (_sessionUtil.clientsArray[session].status === null) {
      return await res.
      status(200).
      json({ status: true, message: 'Session successfully closed' });
    } else {
      _sessionUtil.clientsArray[session] = { status: null };

      await req.client.close();
      req.io.emit('whatsapp-status', false);
      (0, _functions.callWebHook)(req.client, req, 'closesession', {
        message: `Session: ${session} disconnected`,
        connected: false
      });

      return await res.
      status(200).
      json({ status: true, message: 'Session successfully closed' });
    }
  } catch (error) {
    req.logger.error(error);
    return await res.
    status(500).
    json({ status: false, message: 'Error closing session', error });
  }
}

async function logOutSession(req, res) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.operationId = 'logoutSession'
   * #swagger.description = 'This route logout and delete session data'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const session = req.session;
    await req.client.logout();
    (0, _sessionUtil.deleteSessionOnArray)(req.session);

    setTimeout(async () => {
      const pathUserData = _config.default.customUserDataDir + req.session;
      const pathTokens = __dirname + `../../../tokens/${req.session}.data.json`;

      if (_fs.default.existsSync(pathUserData)) {
        await _fs.default.promises.rm(pathUserData, {
          recursive: true,
          maxRetries: 5,
          force: true,
          retryDelay: 1000
        });
      }
      if (_fs.default.existsSync(pathTokens)) {
        await _fs.default.promises.rm(pathTokens, {
          recursive: true,
          maxRetries: 5,
          force: true,
          retryDelay: 1000
        });
      }

      req.io.emit('whatsapp-status', false);
      (0, _functions.callWebHook)(req.client, req, 'logoutsession', {
        message: `Session: ${session} logged out`,
        connected: false
      });

      return await res.
      status(200).
      json({ status: true, message: 'Session successfully closed' });
    }, 500);
    /*try {
      await req.client.close();
    } catch (error) {}*/
  } catch (error) {
    req.logger.error(error);
    res.
    status(500).
    json({ status: false, message: 'Error closing session', error });
  }
}

async function checkConnectionSession(
req,
res)
{
  /**
   * #swagger.tags = ["Auth"]
     #swagger.operationId = 'CheckConnectionState'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    await req.client.isConnected();

    res.status(200).json({ status: true, message: 'Connected' });
  } catch (error) {
    res.status(200).json({ status: false, message: 'Disconnected' });
  }
}

async function downloadMediaByMessage(req, res) {
  /**
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.operationId = 'downloadMediabyMessage'
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              messageId: { type: "string" },
            }
          },
          example: {
            messageId: '<messageId>'
          }
        }
      }
     }
   */
  const client = req.client;
  const { messageId } = req.body;

  let message;

  try {
    if (!messageId.isMedia || !messageId.type) {
      message = await client.getMessageById(messageId);
    } else {
      message = messageId;
    }

    if (!message)
    res.status(400).json({
      status: 'error',
      message: 'Message not found'
    });

    if (!(message['mimetype'] || message.isMedia || message.isMMS))
    res.status(400).json({
      status: 'error',
      message: 'Message does not contain media'
    });

    const buffer = await client.decryptFile(message);

    res.
    status(200).
    json({ base64: buffer.toString('base64'), mimetype: message.mimetype });
  } catch (e) {
    req.logger.error(e);
    res.status(400).json({
      status: 'error',
      message: 'Decrypt file error',
      error: e
    });
  }
}

async function getMediaByMessage(req, res) {
  /**
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.operationId = 'getMediaByMessage'
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["session"] = {
      schema: 'messageId'
     }
   */
  const client = req.client;
  const { messageId } = req.params;

  try {
    const message = await client.getMessageById(messageId);

    if (!message)
    res.status(400).json({
      status: 'error',
      message: 'Message not found'
    });

    if (!(message['mimetype'] || message.isMedia || message.isMMS))
    res.status(400).json({
      status: 'error',
      message: 'Message does not contain media'
    });

    const buffer = await client.decryptFile(message);

    res.
    status(200).
    json({ base64: buffer.toString('base64'), mimetype: message.mimetype });
  } catch (ex) {
    req.logger.error(ex);
    res.status(500).json({
      status: 'error',
      message: 'The session is not active',
      error: ex
    });
  }
}

async function getSessionState(req, res) {
  /**
     #swagger.tags = ["Auth"]
     #swagger.operationId = 'getSessionState'
     #swagger.summary = 'Retrieve status of a session'
     #swagger.autoBody = false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const { waitQrCode = false } = req.body;
    const client = req.client;
    const qr =
    client?.urlcode != null && client?.urlcode != '' ?
    await _qrcode.default.toDataURL(client.urlcode) :
    null;

    if ((client == null || client.status == null) && !waitQrCode)
    res.status(200).json({ status: 'CLOSED', qrcode: null });else
    if (client != null)
    res.status(200).json({
      status: client.status,
      qrcode: qr,
      urlcode: client.urlcode,
      version: _package.version
    });
  } catch (ex) {
    req.logger.error(ex);
    res.status(500).json({
      status: 'error',
      message: 'The session is not active',
      error: ex
    });
  }
}

async function getQrCode(req, res) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.operationId = 'getQrCode'
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    if (req?.client?.urlcode) {
      // We add options to generate the QR code in higher resolution
      // The /qrcode-session request will now return a readable qrcode.
      const qrOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        scale: 5,
        width: 500
      };
      const qr = req.client.urlcode ?
      await _qrcode.default.toDataURL(req.client.urlcode, qrOptions) :
      null;
      const img = Buffer.from(
        qr.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
        'base64'
      );
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
      });
      res.end(img);
    } else if (typeof req.client === 'undefined') {
      res.status(200).json({
        status: null,
        message:
        'Session not started. Please, use the /start-session route, for initialization your session'
      });
    } else {
      res.status(200).json({
        status: req.client.status,
        message: 'QRCode is not available...'
      });
    }
  } catch (ex) {
    req.logger.error(ex);
    res.
    status(500).
    json({ status: 'error', message: 'Error retrieving QRCode', error: ex });
  }
}

async function killServiceWorker(req, res) {
  /**
   * #swagger.ignore=true
   * #swagger.tags = ["Messages"]
     #swagger.operationId = 'killServiceWorkier'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    res.status(200).json({ status: 'error', response: 'Not implemented yet' });
  } catch (ex) {
    req.logger.error(ex);
    res.status(500).json({
      status: 'error',
      message: 'The session is not active',
      error: ex
    });
  }
}

async function restartService(req, res) {
  /**
   * #swagger.ignore=true
   * #swagger.tags = ["Messages"]
     #swagger.operationId = 'restartService'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    res.status(200).json({ status: 'error', response: 'Not implemented yet' });
  } catch (ex) {
    req.logger.error(ex);
    res.status(500).json({
      status: 'error',
      response: { message: 'The session is not active', error: ex }
    });
  }
}

async function subscribePresence(req, res) {
  /**
   * #swagger.tags = ["Misc"]
     #swagger.operationId = 'subscribePresence'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              phone: { type: "string" },
              isGroup: { type: "boolean" },
              all: { type: "boolean" },
            }
          },
          example: {
            phone: '5521999999999',
            isGroup: false,
            all: false,
          }
        }
      }
     }
   */
  try {
    const { phone, isGroup = false, all = false } = req.body;

    if (all) {
      let contacts;
      if (isGroup) {
        const groups = await req.client.getAllGroups(false);
        contacts = groups.map((p) => p.id._serialized);
      } else {
        const chats = await req.client.getAllContacts();
        contacts = chats.map((c) => c.id._serialized);
      }
      await req.client.subscribePresence(contacts);
    } else
    for (const contato of (0, _functions.contactToArray)(phone, isGroup)) {
      await req.client.subscribePresence(contato);
    }

    res.status(200).json({
      status: 'success',
      response: { message: 'Subscribe presence executed' }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error on subscribe presence',
      error: error
    });
  }
}

async function setOnlinePresence(req, res) {
  /**
   * #swagger.tags = ["Misc"]
     #swagger.operationId = 'setOnlinePresence'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              isOnline: { type: "boolean" },
            }
          },
          example: {
   isOnline: false,
          }
        }
      }
     }
   */
  try {
    const { isOnline = true } = req.body;

    await req.client.setOnlinePresence(isOnline);

    res.status(200).json({
      status: 'success',
      response: { message: 'Set Online Presence Successfully' }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error on set online presence',
      error: error
    });
  }
}

async function editBusinessProfile(req, res) {
  /**
   * #swagger.tags = ["Profile"]
     #swagger.operationId = 'editBusinessProfile'
   * #swagger.description = 'Edit your bussiness profile'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["obj"] = {
      in: 'body',
      schema: {
        $adress: 'Av. Nossa Senhora de Copacabana, 315',
        $email: 'test@test.com.br',
        $categories: {
          $id: "133436743388217",
          $localized_display_name: "Artes e entretenimento",
          $not_a_biz: false,
        },
        $website: [
          "https://www.wppconnect.io",
          "https://www.teste2.com.br",
        ],
      }
     }
     
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              adress: { type: "string" },
              email: { type: "string" },
              categories: { type: "object" },
              websites: { type: "array" },
            }
          },
          example: {
            adress: 'Av. Nossa Senhora de Copacabana, 315',
            email: 'test@test.com.br',
            categories: {
              $id: "133436743388217",
              $localized_display_name: "Artes e entretenimento",
              $not_a_biz: false,
            },
            website: [
              "https://www.wppconnect.io",
              "https://www.teste2.com.br",
            ],
          }
        }
      }
     }
   */
  try {
    res.status(200).json(await req.client.editBusinessProfile(req.body));
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error on edit business profile',
      error: error
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZnMiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsIl9taW1lVHlwZXMiLCJfcXJjb2RlIiwiX3BhY2thZ2UiLCJfY29uZmlnIiwiX2NyZWF0ZVNlc3Npb25VdGlsIiwiX2Z1bmN0aW9ucyIsIl9nZXRBbGxUb2tlbnMiLCJfc2Vzc2lvblV0aWwiLCJTZXNzaW9uVXRpbCIsIkNyZWF0ZVNlc3Npb25VdGlsIiwiZG93bmxvYWRGaWxlRnVuY3Rpb24iLCJtZXNzYWdlIiwiY2xpZW50IiwibG9nZ2VyIiwiYnVmZmVyIiwiZGVjcnlwdEZpbGUiLCJmaWxlbmFtZSIsInQiLCJmcyIsImV4aXN0c1N5bmMiLCJyZXN1bHQiLCJ0eXBlIiwibWltZSIsImV4dGVuc2lvbiIsIm1pbWV0eXBlIiwid3JpdGVGaWxlIiwiZXJyIiwiZXJyb3IiLCJlIiwid2FybiIsImRvd25sb2FkTWVkaWEiLCJkb3dubG9hZCIsInBhdGgiLCJyZXBsYWNlIiwic3RhcnRBbGxTZXNzaW9ucyIsInJlcSIsInJlcyIsInNlY3JldGtleSIsInBhcmFtcyIsImF1dGhvcml6YXRpb24iLCJ0b2tlbiIsImhlYWRlcnMiLCJ0b2tlbkRlY3J5cHQiLCJ1bmRlZmluZWQiLCJzcGxpdCIsImFsbFNlc3Npb25zIiwiZ2V0QWxsVG9rZW5zIiwic2VydmVyT3B0aW9ucyIsInNlY3JldEtleSIsInN0YXR1cyIsImpzb24iLCJyZXNwb25zZSIsIm1hcCIsInNlc3Npb24iLCJ1dGlsIiwib3BlbmRhdGEiLCJzaG93QWxsU2Vzc2lvbnMiLCJhcnIiLCJPYmplY3QiLCJrZXlzIiwiY2xpZW50c0FycmF5IiwiZm9yRWFjaCIsIml0ZW0iLCJwdXNoIiwic3RhcnRTZXNzaW9uIiwid2FpdFFyQ29kZSIsImJvZHkiLCJnZXRTZXNzaW9uU3RhdGUiLCJjbG9zZVNlc3Npb24iLCJjbG9zZSIsImlvIiwiZW1pdCIsImNhbGxXZWJIb29rIiwiY29ubmVjdGVkIiwibG9nT3V0U2Vzc2lvbiIsImxvZ291dCIsImRlbGV0ZVNlc3Npb25PbkFycmF5Iiwic2V0VGltZW91dCIsInBhdGhVc2VyRGF0YSIsImNvbmZpZyIsImN1c3RvbVVzZXJEYXRhRGlyIiwicGF0aFRva2VucyIsIl9fZGlybmFtZSIsInByb21pc2VzIiwicm0iLCJyZWN1cnNpdmUiLCJtYXhSZXRyaWVzIiwiZm9yY2UiLCJyZXRyeURlbGF5IiwiY2hlY2tDb25uZWN0aW9uU2Vzc2lvbiIsImlzQ29ubmVjdGVkIiwiZG93bmxvYWRNZWRpYUJ5TWVzc2FnZSIsIm1lc3NhZ2VJZCIsImlzTWVkaWEiLCJnZXRNZXNzYWdlQnlJZCIsImlzTU1TIiwiYmFzZTY0IiwidG9TdHJpbmciLCJnZXRNZWRpYUJ5TWVzc2FnZSIsImV4IiwicXIiLCJ1cmxjb2RlIiwiUVJDb2RlIiwidG9EYXRhVVJMIiwicXJjb2RlIiwidmVyc2lvbiIsImdldFFyQ29kZSIsInFyT3B0aW9ucyIsImVycm9yQ29ycmVjdGlvbkxldmVsIiwic2NhbGUiLCJ3aWR0aCIsImltZyIsIkJ1ZmZlciIsImZyb20iLCJ3cml0ZUhlYWQiLCJsZW5ndGgiLCJlbmQiLCJraWxsU2VydmljZVdvcmtlciIsInJlc3RhcnRTZXJ2aWNlIiwic3Vic2NyaWJlUHJlc2VuY2UiLCJwaG9uZSIsImlzR3JvdXAiLCJhbGwiLCJjb250YWN0cyIsImdyb3VwcyIsImdldEFsbEdyb3VwcyIsInAiLCJpZCIsIl9zZXJpYWxpemVkIiwiY2hhdHMiLCJnZXRBbGxDb250YWN0cyIsImMiLCJjb250YXRvIiwiY29udGFjdFRvQXJyYXkiLCJzZXRPbmxpbmVQcmVzZW5jZSIsImlzT25saW5lIiwiZWRpdEJ1c2luZXNzUHJvZmlsZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVyL3Nlc3Npb25Db250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXHJcbiAqIENvcHlyaWdodCAyMDIxIFdQUENvbm5lY3QgVGVhbVxyXG4gKlxyXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xyXG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXHJcbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxyXG4gKlxyXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXHJcbiAqXHJcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcclxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxyXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cclxuICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1jbGVhclNlc3Npb25pc3Npb25zIGFuZFxyXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuICovXHJcbmltcG9ydCB7IE1lc3NhZ2UsIFdoYXRzYXBwIH0gZnJvbSAnQHdwcGNvbm5lY3QtdGVhbS93cHBjb25uZWN0JztcclxuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IG1pbWUgZnJvbSAnbWltZS10eXBlcyc7XHJcbmltcG9ydCBRUkNvZGUgZnJvbSAncXJjb2RlJztcclxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSAnd2luc3Rvbic7XHJcblxyXG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSAnLi4vLi4vcGFja2FnZS5qc29uJztcclxuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcnO1xyXG5pbXBvcnQgQ3JlYXRlU2Vzc2lvblV0aWwgZnJvbSAnLi4vdXRpbC9jcmVhdGVTZXNzaW9uVXRpbCc7XHJcbmltcG9ydCB7IGNhbGxXZWJIb29rLCBjb250YWN0VG9BcnJheSB9IGZyb20gJy4uL3V0aWwvZnVuY3Rpb25zJztcclxuaW1wb3J0IGdldEFsbFRva2VucyBmcm9tICcuLi91dGlsL2dldEFsbFRva2Vucyc7XHJcbmltcG9ydCB7IGNsaWVudHNBcnJheSwgZGVsZXRlU2Vzc2lvbk9uQXJyYXkgfSBmcm9tICcuLi91dGlsL3Nlc3Npb25VdGlsJztcclxuXHJcbmNvbnN0IFNlc3Npb25VdGlsID0gbmV3IENyZWF0ZVNlc3Npb25VdGlsKCk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBkb3dubG9hZEZpbGVGdW5jdGlvbihcclxuICBtZXNzYWdlOiBNZXNzYWdlLFxyXG4gIGNsaWVudDogV2hhdHNhcHAsXHJcbiAgbG9nZ2VyOiBMb2dnZXJcclxuKSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGNsaWVudC5kZWNyeXB0RmlsZShtZXNzYWdlKTtcclxuXHJcbiAgICBjb25zdCBmaWxlbmFtZSA9IGAuL1doYXRzQXBwSW1hZ2VzL2ZpbGUke21lc3NhZ2UudH1gO1xyXG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGZpbGVuYW1lKSkge1xyXG4gICAgICBsZXQgcmVzdWx0ID0gJyc7XHJcbiAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdwdHQnKSB7XHJcbiAgICAgICAgcmVzdWx0ID0gYCR7ZmlsZW5hbWV9Lm9nYWA7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzdWx0ID0gYCR7ZmlsZW5hbWV9LiR7bWltZS5leHRlbnNpb24obWVzc2FnZS5taW1ldHlwZSl9YDtcclxuICAgICAgfVxyXG5cclxuICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKHJlc3VsdCwgYnVmZmVyLCAoZXJyKSA9PiB7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gYCR7ZmlsZW5hbWV9LiR7bWltZS5leHRlbnNpb24obWVzc2FnZS5taW1ldHlwZSl9YDtcclxuICAgIH1cclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBsb2dnZXIuZXJyb3IoZSk7XHJcbiAgICBsb2dnZXIud2FybihcclxuICAgICAgJ0Vycm8gYW8gZGVzY3JpcHRvZ3JhZmFyIGEgbWlkaWEsIHRlbnRhbmRvIGZhemVyIG8gZG93bmxvYWQgZGlyZXRvLi4uJ1xyXG4gICAgKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGNsaWVudC5kb3dubG9hZE1lZGlhKG1lc3NhZ2UpO1xyXG4gICAgICBjb25zdCBmaWxlbmFtZSA9IGAuL1doYXRzQXBwSW1hZ2VzL2ZpbGUke21lc3NhZ2UudH1gO1xyXG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMoZmlsZW5hbWUpKSB7XHJcbiAgICAgICAgbGV0IHJlc3VsdCA9ICcnO1xyXG4gICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdwdHQnKSB7XHJcbiAgICAgICAgICByZXN1bHQgPSBgJHtmaWxlbmFtZX0ub2dhYDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmVzdWx0ID0gYCR7ZmlsZW5hbWV9LiR7bWltZS5leHRlbnNpb24obWVzc2FnZS5taW1ldHlwZSl9YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGF3YWl0IGZzLndyaXRlRmlsZShyZXN1bHQsIGJ1ZmZlciwgKGVycikgPT4ge1xyXG4gICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gYCR7ZmlsZW5hbWV9LiR7bWltZS5leHRlbnNpb24obWVzc2FnZS5taW1ldHlwZSl9YDtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBsb2dnZXIuZXJyb3IoZSk7XHJcbiAgICAgIGxvZ2dlci53YXJuKCdOw6NvIGZvaSBwb3Nzw612ZWwgYmFpeGFyIGEgbcOtZGlhLi4uJyk7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWQobWVzc2FnZTogYW55LCBjbGllbnQ6IGFueSwgbG9nZ2VyOiBhbnkpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcGF0aCA9IGF3YWl0IGRvd25sb2FkRmlsZUZ1bmN0aW9uKG1lc3NhZ2UsIGNsaWVudCwgbG9nZ2VyKTtcclxuICAgIHJldHVybiBwYXRoPy5yZXBsYWNlKCcuLycsICcnKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBsb2dnZXIuZXJyb3IoZSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRBbGxTZXNzaW9ucyhcclxuICByZXE6IFJlcXVlc3QsXHJcbiAgcmVzOiBSZXNwb25zZVxyXG4pOiBQcm9taXNlPGFueT4ge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJBdXRoXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdzdGFydEFsbFNlc3Npb25zJ1xyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZWNyZXRrZXlcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ1RISVNJU01ZU0VDVVJFQ09ERSdcclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBzZWNyZXRrZXkgfSA9IHJlcS5wYXJhbXM7XHJcbiAgY29uc3QgeyBhdXRob3JpemF0aW9uOiB0b2tlbiB9ID0gcmVxLmhlYWRlcnM7XHJcblxyXG4gIGxldCB0b2tlbkRlY3J5cHQgPSAnJztcclxuXHJcbiAgaWYgKHNlY3JldGtleSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICB0b2tlbkRlY3J5cHQgPSAodG9rZW4gYXMgYW55KS5zcGxpdCgnICcpWzBdO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0b2tlbkRlY3J5cHQgPSBzZWNyZXRrZXk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBhbGxTZXNzaW9ucyA9IGF3YWl0IGdldEFsbFRva2VucyhyZXEpO1xyXG5cclxuICBpZiAodG9rZW5EZWNyeXB0ICE9PSByZXEuc2VydmVyT3B0aW9ucy5zZWNyZXRLZXkpIHtcclxuICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcclxuICAgICAgcmVzcG9uc2U6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdUaGUgdG9rZW4gaXMgaW5jb3JyZWN0JyxcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYWxsU2Vzc2lvbnMubWFwKGFzeW5jIChzZXNzaW9uOiBzdHJpbmcpID0+IHtcclxuICAgIGNvbnN0IHV0aWwgPSBuZXcgQ3JlYXRlU2Vzc2lvblV0aWwoKTtcclxuICAgIGF3YWl0IHV0aWwub3BlbmRhdGEocmVxLCBzZXNzaW9uKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIGF3YWl0IHJlc1xyXG4gICAgLnN0YXR1cygyMDEpXHJcbiAgICAuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCBtZXNzYWdlOiAnU3RhcnRpbmcgYWxsIHNlc3Npb25zJyB9KTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNob3dBbGxTZXNzaW9ucyhcclxuICByZXE6IFJlcXVlc3QsXHJcbiAgcmVzOiBSZXNwb25zZVxyXG4pOiBQcm9taXNlPGFueT4ge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJBdXRoXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdzaG93QWxsU2Vzc2lvbnMnXHJcbiAgICAgI3N3YWdnZXIuYXV0b1F1ZXJ5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuYXV0b0hlYWRlcnM9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlY3JldGtleVwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnVEhJU0lTTVlTRUNVUkVUT0tFTidcclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBzZWNyZXRrZXkgfSA9IHJlcS5wYXJhbXM7XHJcbiAgY29uc3QgeyBhdXRob3JpemF0aW9uOiB0b2tlbiB9ID0gcmVxLmhlYWRlcnM7XHJcblxyXG4gIGxldCB0b2tlbkRlY3J5cHQ6IGFueSA9ICcnO1xyXG5cclxuICBpZiAoc2VjcmV0a2V5ID09PSB1bmRlZmluZWQpIHtcclxuICAgIHRva2VuRGVjcnlwdCA9IHRva2VuPy5zcGxpdCgnICcpWzBdO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0b2tlbkRlY3J5cHQgPSBzZWNyZXRrZXk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBhcnI6IGFueSA9IFtdO1xyXG5cclxuICBpZiAodG9rZW5EZWNyeXB0ICE9PSByZXEuc2VydmVyT3B0aW9ucy5zZWNyZXRLZXkpIHtcclxuICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcclxuICAgICAgcmVzcG9uc2U6IGZhbHNlLFxyXG4gICAgICBtZXNzYWdlOiAnVGhlIHRva2VuIGlzIGluY29ycmVjdCcsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIE9iamVjdC5rZXlzKGNsaWVudHNBcnJheSkuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgYXJyLnB1c2goeyBzZXNzaW9uOiBpdGVtIH0pO1xyXG4gIH0pO1xyXG5cclxuICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHJlc3BvbnNlOiBhd2FpdCBnZXRBbGxUb2tlbnMocmVxKSB9KTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0U2Vzc2lvbihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPGFueT4ge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJBdXRoXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdzdGFydFNlc3Npb24nXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICB3ZWJob29rOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICB3YWl0UXJDb2RlOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlOiB7XHJcbiAgICAgICAgICAgIHdlYmhvb2s6IFwiXCIsXHJcbiAgICAgICAgICAgIHdhaXRRckNvZGU6IGZhbHNlLFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCBzZXNzaW9uID0gcmVxLnNlc3Npb247XHJcbiAgY29uc3QgeyB3YWl0UXJDb2RlID0gZmFsc2UgfSA9IHJlcS5ib2R5O1xyXG5cclxuICBhd2FpdCBnZXRTZXNzaW9uU3RhdGUocmVxLCByZXMpO1xyXG4gIGF3YWl0IFNlc3Npb25VdGlsLm9wZW5kYXRhKHJlcSwgc2Vzc2lvbiwgd2FpdFFyQ29kZSA/IHJlcyA6IG51bGwpO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xvc2VTZXNzaW9uKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSk6IFByb21pc2U8YW55PiB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkF1dGhcIl1cclxuICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdjbG9zZVNlc3Npb24nXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9dHJ1ZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHNlc3Npb24gPSByZXEuc2Vzc2lvbjtcclxuICB0cnkge1xyXG4gICAgaWYgKChjbGllbnRzQXJyYXkgYXMgYW55KVtzZXNzaW9uXS5zdGF0dXMgPT09IG51bGwpIHtcclxuICAgICAgcmV0dXJuIGF3YWl0IHJlc1xyXG4gICAgICAgIC5zdGF0dXMoMjAwKVxyXG4gICAgICAgIC5qc29uKHsgc3RhdHVzOiB0cnVlLCBtZXNzYWdlOiAnU2Vzc2lvbiBzdWNjZXNzZnVsbHkgY2xvc2VkJyB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIChjbGllbnRzQXJyYXkgYXMgYW55KVtzZXNzaW9uXSA9IHsgc3RhdHVzOiBudWxsIH07XHJcblxyXG4gICAgICBhd2FpdCByZXEuY2xpZW50LmNsb3NlKCk7XHJcbiAgICAgIHJlcS5pby5lbWl0KCd3aGF0c2FwcC1zdGF0dXMnLCBmYWxzZSk7XHJcbiAgICAgIGNhbGxXZWJIb29rKHJlcS5jbGllbnQsIHJlcSwgJ2Nsb3Nlc2Vzc2lvbicsIHtcclxuICAgICAgICBtZXNzYWdlOiBgU2Vzc2lvbjogJHtzZXNzaW9ufSBkaXNjb25uZWN0ZWRgLFxyXG4gICAgICAgIGNvbm5lY3RlZDogZmFsc2UsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIGF3YWl0IHJlc1xyXG4gICAgICAgIC5zdGF0dXMoMjAwKVxyXG4gICAgICAgIC5qc29uKHsgc3RhdHVzOiB0cnVlLCBtZXNzYWdlOiAnU2Vzc2lvbiBzdWNjZXNzZnVsbHkgY2xvc2VkJyB9KTtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXR1cm4gYXdhaXQgcmVzXHJcbiAgICAgIC5zdGF0dXMoNTAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogZmFsc2UsIG1lc3NhZ2U6ICdFcnJvciBjbG9zaW5nIHNlc3Npb24nLCBlcnJvciB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2dPdXRTZXNzaW9uKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSk6IFByb21pc2U8YW55PiB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkF1dGhcIl1cclxuICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdsb2dvdXRTZXNzaW9uJ1xyXG4gICAqICNzd2FnZ2VyLmRlc2NyaXB0aW9uID0gJ1RoaXMgcm91dGUgbG9nb3V0IGFuZCBkZWxldGUgc2Vzc2lvbiBkYXRhJ1xyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICovXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNlc3Npb24gPSByZXEuc2Vzc2lvbjtcclxuICAgIGF3YWl0IHJlcS5jbGllbnQubG9nb3V0KCk7XHJcbiAgICBkZWxldGVTZXNzaW9uT25BcnJheShyZXEuc2Vzc2lvbik7XHJcblxyXG4gICAgc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IHBhdGhVc2VyRGF0YSA9IGNvbmZpZy5jdXN0b21Vc2VyRGF0YURpciArIHJlcS5zZXNzaW9uO1xyXG4gICAgICBjb25zdCBwYXRoVG9rZW5zID0gX19kaXJuYW1lICsgYC4uLy4uLy4uL3Rva2Vucy8ke3JlcS5zZXNzaW9ufS5kYXRhLmpzb25gO1xyXG5cclxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aFVzZXJEYXRhKSkge1xyXG4gICAgICAgIGF3YWl0IGZzLnByb21pc2VzLnJtKHBhdGhVc2VyRGF0YSwge1xyXG4gICAgICAgICAgcmVjdXJzaXZlOiB0cnVlLFxyXG4gICAgICAgICAgbWF4UmV0cmllczogNSxcclxuICAgICAgICAgIGZvcmNlOiB0cnVlLFxyXG4gICAgICAgICAgcmV0cnlEZWxheTogMTAwMCxcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoVG9rZW5zKSkge1xyXG4gICAgICAgIGF3YWl0IGZzLnByb21pc2VzLnJtKHBhdGhUb2tlbnMsIHtcclxuICAgICAgICAgIHJlY3Vyc2l2ZTogdHJ1ZSxcclxuICAgICAgICAgIG1heFJldHJpZXM6IDUsXHJcbiAgICAgICAgICBmb3JjZTogdHJ1ZSxcclxuICAgICAgICAgIHJldHJ5RGVsYXk6IDEwMDAsXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcS5pby5lbWl0KCd3aGF0c2FwcC1zdGF0dXMnLCBmYWxzZSk7XHJcbiAgICAgIGNhbGxXZWJIb29rKHJlcS5jbGllbnQsIHJlcSwgJ2xvZ291dHNlc3Npb24nLCB7XHJcbiAgICAgICAgbWVzc2FnZTogYFNlc3Npb246ICR7c2Vzc2lvbn0gbG9nZ2VkIG91dGAsXHJcbiAgICAgICAgY29ubmVjdGVkOiBmYWxzZSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gYXdhaXQgcmVzXHJcbiAgICAgICAgLnN0YXR1cygyMDApXHJcbiAgICAgICAgLmpzb24oeyBzdGF0dXM6IHRydWUsIG1lc3NhZ2U6ICdTZXNzaW9uIHN1Y2Nlc3NmdWxseSBjbG9zZWQnIH0pO1xyXG4gICAgfSwgNTAwKTtcclxuICAgIC8qdHJ5IHtcclxuICAgICAgYXdhaXQgcmVxLmNsaWVudC5jbG9zZSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHt9Ki9cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiBmYWxzZSwgbWVzc2FnZTogJ0Vycm9yIGNsb3Npbmcgc2Vzc2lvbicsIGVycm9yIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrQ29ubmVjdGlvblNlc3Npb24oXHJcbiAgcmVxOiBSZXF1ZXN0LFxyXG4gIHJlczogUmVzcG9uc2VcclxuKTogUHJvbWlzZTxhbnk+IHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQXV0aFwiXVxyXG4gICAgICNzd2FnZ2VyLm9wZXJhdGlvbklkID0gJ0NoZWNrQ29ubmVjdGlvblN0YXRlJ1xyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICovXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHJlcS5jbGllbnQuaXNDb25uZWN0ZWQoKTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogdHJ1ZSwgbWVzc2FnZTogJ0Nvbm5lY3RlZCcgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiBmYWxzZSwgbWVzc2FnZTogJ0Rpc2Nvbm5lY3RlZCcgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG93bmxvYWRNZWRpYUJ5TWVzc2FnZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLm9wZXJhdGlvbklkID0gJ2Rvd25sb2FkTWVkaWFieU1lc3NhZ2UnXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBtZXNzYWdlSWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZToge1xyXG4gICAgICAgICAgICBtZXNzYWdlSWQ6ICc8bWVzc2FnZUlkPidcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgY2xpZW50ID0gcmVxLmNsaWVudDtcclxuICBjb25zdCB7IG1lc3NhZ2VJZCB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIGxldCBtZXNzYWdlO1xyXG5cclxuICB0cnkge1xyXG4gICAgaWYgKCFtZXNzYWdlSWQuaXNNZWRpYSB8fCAhbWVzc2FnZUlkLnR5cGUpIHtcclxuICAgICAgbWVzc2FnZSA9IGF3YWl0IGNsaWVudC5nZXRNZXNzYWdlQnlJZChtZXNzYWdlSWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbWVzc2FnZSA9IG1lc3NhZ2VJZDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIW1lc3NhZ2UpXHJcbiAgICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcclxuICAgICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgICAgbWVzc2FnZTogJ01lc3NhZ2Ugbm90IGZvdW5kJyxcclxuICAgICAgfSk7XHJcblxyXG4gICAgaWYgKCEobWVzc2FnZVsnbWltZXR5cGUnXSB8fCBtZXNzYWdlLmlzTWVkaWEgfHwgbWVzc2FnZS5pc01NUykpXHJcbiAgICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcclxuICAgICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgICAgbWVzc2FnZTogJ01lc3NhZ2UgZG9lcyBub3QgY29udGFpbiBtZWRpYScsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGNsaWVudC5kZWNyeXB0RmlsZShtZXNzYWdlKTtcclxuXHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cygyMDApXHJcbiAgICAgIC5qc29uKHsgYmFzZTY0OiBidWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpLCBtaW1ldHlwZTogbWVzc2FnZS5taW1ldHlwZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg0MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdEZWNyeXB0IGZpbGUgZXJyb3InLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE1lZGlhQnlNZXNzYWdlKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJNZXNzYWdlc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIub3BlcmF0aW9uSWQgPSAnZ2V0TWVkaWFCeU1lc3NhZ2UnXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ21lc3NhZ2VJZCdcclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgY2xpZW50ID0gcmVxLmNsaWVudDtcclxuICBjb25zdCB7IG1lc3NhZ2VJZCB9ID0gcmVxLnBhcmFtcztcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IG1lc3NhZ2UgPSBhd2FpdCBjbGllbnQuZ2V0TWVzc2FnZUJ5SWQobWVzc2FnZUlkKTtcclxuXHJcbiAgICBpZiAoIW1lc3NhZ2UpXHJcbiAgICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcclxuICAgICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgICAgbWVzc2FnZTogJ01lc3NhZ2Ugbm90IGZvdW5kJyxcclxuICAgICAgfSk7XHJcblxyXG4gICAgaWYgKCEobWVzc2FnZVsnbWltZXR5cGUnXSB8fCBtZXNzYWdlLmlzTWVkaWEgfHwgbWVzc2FnZS5pc01NUykpXHJcbiAgICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcclxuICAgICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgICAgbWVzc2FnZTogJ01lc3NhZ2UgZG9lcyBub3QgY29udGFpbiBtZWRpYScsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IGNsaWVudC5kZWNyeXB0RmlsZShtZXNzYWdlKTtcclxuXHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cygyMDApXHJcbiAgICAgIC5qc29uKHsgYmFzZTY0OiBidWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpLCBtaW1ldHlwZTogbWVzc2FnZS5taW1ldHlwZSB9KTtcclxuICB9IGNhdGNoIChleCkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihleCk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ1RoZSBzZXNzaW9uIGlzIG5vdCBhY3RpdmUnLFxyXG4gICAgICBlcnJvcjogZXgsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTZXNzaW9uU3RhdGUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkF1dGhcIl1cclxuICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdnZXRTZXNzaW9uU3RhdGUnXHJcbiAgICAgI3N3YWdnZXIuc3VtbWFyeSA9ICdSZXRyaWV2ZSBzdGF0dXMgb2YgYSBzZXNzaW9uJ1xyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5ID0gZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgY29uc3QgeyB3YWl0UXJDb2RlID0gZmFsc2UgfSA9IHJlcS5ib2R5O1xyXG4gICAgY29uc3QgY2xpZW50ID0gcmVxLmNsaWVudDtcclxuICAgIGNvbnN0IHFyID1cclxuICAgICAgY2xpZW50Py51cmxjb2RlICE9IG51bGwgJiYgY2xpZW50Py51cmxjb2RlICE9ICcnXHJcbiAgICAgICAgPyBhd2FpdCBRUkNvZGUudG9EYXRhVVJMKGNsaWVudC51cmxjb2RlKVxyXG4gICAgICAgIDogbnVsbDtcclxuXHJcbiAgICBpZiAoKGNsaWVudCA9PSBudWxsIHx8IGNsaWVudC5zdGF0dXMgPT0gbnVsbCkgJiYgIXdhaXRRckNvZGUpXHJcbiAgICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnQ0xPU0VEJywgcXJjb2RlOiBudWxsIH0pO1xyXG4gICAgZWxzZSBpZiAoY2xpZW50ICE9IG51bGwpXHJcbiAgICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcclxuICAgICAgICBzdGF0dXM6IGNsaWVudC5zdGF0dXMsXHJcbiAgICAgICAgcXJjb2RlOiBxcixcclxuICAgICAgICB1cmxjb2RlOiBjbGllbnQudXJsY29kZSxcclxuICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxyXG4gICAgICB9KTtcclxuICB9IGNhdGNoIChleCkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihleCk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ1RoZSBzZXNzaW9uIGlzIG5vdCBhY3RpdmUnLFxyXG4gICAgICBlcnJvcjogZXgsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRRckNvZGUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkF1dGhcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLm9wZXJhdGlvbklkID0gJ2dldFFyQ29kZSdcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgaWYgKHJlcT8uY2xpZW50Py51cmxjb2RlKSB7XHJcbiAgICAgIC8vIFdlIGFkZCBvcHRpb25zIHRvIGdlbmVyYXRlIHRoZSBRUiBjb2RlIGluIGhpZ2hlciByZXNvbHV0aW9uXHJcbiAgICAgIC8vIFRoZSAvcXJjb2RlLXNlc3Npb24gcmVxdWVzdCB3aWxsIG5vdyByZXR1cm4gYSByZWFkYWJsZSBxcmNvZGUuXHJcbiAgICAgIGNvbnN0IHFyT3B0aW9ucyA9IHtcclxuICAgICAgICBlcnJvckNvcnJlY3Rpb25MZXZlbDogJ00nIGFzIGNvbnN0LFxyXG4gICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnIGFzIGNvbnN0LFxyXG4gICAgICAgIHNjYWxlOiA1LFxyXG4gICAgICAgIHdpZHRoOiA1MDAsXHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IHFyID0gcmVxLmNsaWVudC51cmxjb2RlXHJcbiAgICAgICAgPyBhd2FpdCBRUkNvZGUudG9EYXRhVVJMKHJlcS5jbGllbnQudXJsY29kZSwgcXJPcHRpb25zKVxyXG4gICAgICAgIDogbnVsbDtcclxuICAgICAgY29uc3QgaW1nID0gQnVmZmVyLmZyb20oXHJcbiAgICAgICAgKHFyIGFzIGFueSkucmVwbGFjZSgvXmRhdGE6aW1hZ2VcXC8ocG5nfGpwZWd8anBnKTtiYXNlNjQsLywgJycpLFxyXG4gICAgICAgICdiYXNlNjQnXHJcbiAgICAgICk7XHJcbiAgICAgIHJlcy53cml0ZUhlYWQoMjAwLCB7XHJcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICdDb250ZW50LUxlbmd0aCc6IGltZy5sZW5ndGgsXHJcbiAgICAgIH0pO1xyXG4gICAgICByZXMuZW5kKGltZyk7XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiByZXEuY2xpZW50ID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7XHJcbiAgICAgICAgc3RhdHVzOiBudWxsLFxyXG4gICAgICAgIG1lc3NhZ2U6XHJcbiAgICAgICAgICAnU2Vzc2lvbiBub3Qgc3RhcnRlZC4gUGxlYXNlLCB1c2UgdGhlIC9zdGFydC1zZXNzaW9uIHJvdXRlLCBmb3IgaW5pdGlhbGl6YXRpb24geW91ciBzZXNzaW9uJyxcclxuICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7XHJcbiAgICAgICAgc3RhdHVzOiByZXEuY2xpZW50LnN0YXR1cyxcclxuICAgICAgICBtZXNzYWdlOiAnUVJDb2RlIGlzIG5vdCBhdmFpbGFibGUuLi4nLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9IGNhdGNoIChleCkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihleCk7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlOiAnRXJyb3IgcmV0cmlldmluZyBRUkNvZGUnLCBlcnJvcjogZXggfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24ga2lsbFNlcnZpY2VXb3JrZXIocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIuaWdub3JlPXRydWVcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdraWxsU2VydmljZVdvcmtpZXInXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdlcnJvcicsIHJlc3BvbnNlOiAnTm90IGltcGxlbWVudGVkIHlldCcgfSk7XHJcbiAgfSBjYXRjaCAoZXgpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXgpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdUaGUgc2Vzc2lvbiBpcyBub3QgYWN0aXZlJyxcclxuICAgICAgZXJyb3I6IGV4LFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdGFydFNlcnZpY2UocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIuaWdub3JlPXRydWVcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdyZXN0YXJ0U2VydmljZSdcclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ2Vycm9yJywgcmVzcG9uc2U6ICdOb3QgaW1wbGVtZW50ZWQgeWV0JyB9KTtcclxuICB9IGNhdGNoIChleCkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihleCk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgcmVzcG9uc2U6IHsgbWVzc2FnZTogJ1RoZSBzZXNzaW9uIGlzIG5vdCBhY3RpdmUnLCBlcnJvcjogZXggfSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN1YnNjcmliZVByZXNlbmNlKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJNaXNjXCJdXHJcbiAgICAgI3N3YWdnZXIub3BlcmF0aW9uSWQgPSAnc3Vic2NyaWJlUHJlc2VuY2UnXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgYWxsOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlOiB7XHJcbiAgICAgICAgICAgIHBob25lOiAnNTUyMTk5OTk5OTk5OScsXHJcbiAgICAgICAgICAgIGlzR3JvdXA6IGZhbHNlLFxyXG4gICAgICAgICAgICBhbGw6IGZhbHNlLFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBwaG9uZSwgaXNHcm91cCA9IGZhbHNlLCBhbGwgPSBmYWxzZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gICAgaWYgKGFsbCkge1xyXG4gICAgICBsZXQgY29udGFjdHM7XHJcbiAgICAgIGlmIChpc0dyb3VwKSB7XHJcbiAgICAgICAgY29uc3QgZ3JvdXBzID0gYXdhaXQgcmVxLmNsaWVudC5nZXRBbGxHcm91cHMoZmFsc2UpO1xyXG4gICAgICAgIGNvbnRhY3RzID0gZ3JvdXBzLm1hcCgocDogYW55KSA9PiBwLmlkLl9zZXJpYWxpemVkKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zdCBjaGF0cyA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0QWxsQ29udGFjdHMoKTtcclxuICAgICAgICBjb250YWN0cyA9IGNoYXRzLm1hcCgoYzogYW55KSA9PiBjLmlkLl9zZXJpYWxpemVkKTtcclxuICAgICAgfVxyXG4gICAgICBhd2FpdCByZXEuY2xpZW50LnN1YnNjcmliZVByZXNlbmNlKGNvbnRhY3RzKTtcclxuICAgIH0gZWxzZVxyXG4gICAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgY29udGFjdFRvQXJyYXkocGhvbmUsIGlzR3JvdXApKSB7XHJcbiAgICAgICAgYXdhaXQgcmVxLmNsaWVudC5zdWJzY3JpYmVQcmVzZW5jZShjb250YXRvKTtcclxuICAgICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnc3VjY2VzcycsXHJcbiAgICAgIHJlc3BvbnNlOiB7IG1lc3NhZ2U6ICdTdWJzY3JpYmUgcHJlc2VuY2UgZXhlY3V0ZWQnIH0sXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBzdWJzY3JpYmUgcHJlc2VuY2UnLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRPbmxpbmVQcmVzZW5jZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiTWlzY1wiXVxyXG4gICAgICNzd2FnZ2VyLm9wZXJhdGlvbklkID0gJ3NldE9ubGluZVByZXNlbmNlJ1xyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBpc09ubGluZTogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZToge1xyXG4gICBpc09ubGluZTogZmFsc2UsXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGlzT25saW5lID0gdHJ1ZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gICAgYXdhaXQgcmVxLmNsaWVudC5zZXRPbmxpbmVQcmVzZW5jZShpc09ubGluZSk7XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdzdWNjZXNzJyxcclxuICAgICAgcmVzcG9uc2U6IHsgbWVzc2FnZTogJ1NldCBPbmxpbmUgUHJlc2VuY2UgU3VjY2Vzc2Z1bGx5JyB9LFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gc2V0IG9ubGluZSBwcmVzZW5jZScsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRCdXNpbmVzc1Byb2ZpbGUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIlByb2ZpbGVcIl1cclxuICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdlZGl0QnVzaW5lc3NQcm9maWxlJ1xyXG4gICAqICNzd2FnZ2VyLmRlc2NyaXB0aW9uID0gJ0VkaXQgeW91ciBidXNzaW5lc3MgcHJvZmlsZSdcclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJvYmpcIl0gPSB7XHJcbiAgICAgIGluOiAnYm9keScsXHJcbiAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICRhZHJlc3M6ICdBdi4gTm9zc2EgU2VuaG9yYSBkZSBDb3BhY2FiYW5hLCAzMTUnLFxyXG4gICAgICAgICRlbWFpbDogJ3Rlc3RAdGVzdC5jb20uYnInLFxyXG4gICAgICAgICRjYXRlZ29yaWVzOiB7XHJcbiAgICAgICAgICAkaWQ6IFwiMTMzNDM2NzQzMzg4MjE3XCIsXHJcbiAgICAgICAgICAkbG9jYWxpemVkX2Rpc3BsYXlfbmFtZTogXCJBcnRlcyBlIGVudHJldGVuaW1lbnRvXCIsXHJcbiAgICAgICAgICAkbm90X2FfYml6OiBmYWxzZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgICR3ZWJzaXRlOiBbXHJcbiAgICAgICAgICBcImh0dHBzOi8vd3d3LndwcGNvbm5lY3QuaW9cIixcclxuICAgICAgICAgIFwiaHR0cHM6Ly93d3cudGVzdGUyLmNvbS5iclwiLFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICAgXHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBhZHJlc3M6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgIGVtYWlsOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBjYXRlZ29yaWVzOiB7IHR5cGU6IFwib2JqZWN0XCIgfSxcclxuICAgICAgICAgICAgICB3ZWJzaXRlczogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGU6IHtcclxuICAgICAgICAgICAgYWRyZXNzOiAnQXYuIE5vc3NhIFNlbmhvcmEgZGUgQ29wYWNhYmFuYSwgMzE1JyxcclxuICAgICAgICAgICAgZW1haWw6ICd0ZXN0QHRlc3QuY29tLmJyJyxcclxuICAgICAgICAgICAgY2F0ZWdvcmllczoge1xyXG4gICAgICAgICAgICAgICRpZDogXCIxMzM0MzY3NDMzODgyMTdcIixcclxuICAgICAgICAgICAgICAkbG9jYWxpemVkX2Rpc3BsYXlfbmFtZTogXCJBcnRlcyBlIGVudHJldGVuaW1lbnRvXCIsXHJcbiAgICAgICAgICAgICAgJG5vdF9hX2JpejogZmFsc2UsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHdlYnNpdGU6IFtcclxuICAgICAgICAgICAgICBcImh0dHBzOi8vd3d3LndwcGNvbm5lY3QuaW9cIixcclxuICAgICAgICAgICAgICBcImh0dHBzOi8vd3d3LnRlc3RlMi5jb20uYnJcIixcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgdHJ5IHtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKGF3YWl0IHJlcS5jbGllbnQuZWRpdEJ1c2luZXNzUHJvZmlsZShyZXEuYm9keSkpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGVkaXQgYnVzaW5lc3MgcHJvZmlsZScsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBLElBQUFBLEdBQUEsR0FBQUMsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFDLFVBQUEsR0FBQUYsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFFLE9BQUEsR0FBQUgsc0JBQUEsQ0FBQUMsT0FBQTs7O0FBR0EsSUFBQUcsUUFBQSxHQUFBSCxPQUFBO0FBQ0EsSUFBQUksT0FBQSxHQUFBTCxzQkFBQSxDQUFBQyxPQUFBO0FBQ0EsSUFBQUssa0JBQUEsR0FBQU4sc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFNLFVBQUEsR0FBQU4sT0FBQTtBQUNBLElBQUFPLGFBQUEsR0FBQVIsc0JB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