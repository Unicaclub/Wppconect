"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.default = void 0;














var _wppconnect = require("@wppconnect-team/wppconnect");


var _sessionController = require("../controller/sessionController");

var _chatWootClient = _interopRequireDefault(require("./chatWootClient"));
var _functions = require("./functions");
var _sessionUtil = require("./sessionUtil");
var _factory = _interopRequireDefault(require("./tokenStore/factory")); /*
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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CreateSessionUtil {startChatWootClient(client) {if (client.config.chatWoot && !client._chatWootClient) client._chatWootClient = new _chatWootClient.default(client.config.chatWoot, client.session);return client._chatWootClient;}async createSessionUtil(req, clientsArray,
  session,
  res)
  {
    try {
      let client = this.getClient(session);
      if (client.status != null && client.status !== 'CLOSED') return;
      client.status = 'INITIALIZING';
      client.config = req.body;

      const tokenStore = new _factory.default();
      const myTokenStore = tokenStore.createTokenStory(client);
      const tokenData = await myTokenStore.getToken(session);

      // we need this to update phone in config every time session starts, so we can ask for code for it again.
      myTokenStore.setToken(session, tokenData ?? {});

      this.startChatWootClient(client);

      if (req.serverOptions.customUserDataDir) {
        req.serverOptions.createOptions.puppeteerOptions = {
          userDataDir: req.serverOptions.customUserDataDir + session
        };
      }

      const wppClient = await (0, _wppconnect.create)(
        Object.assign(
          {},
          { tokenStore: myTokenStore },
          req.serverOptions.createOptions,
          {
            session: session,
            phoneNumber: client.config.phone ?? null,
            deviceName:
            client.config.phone == undefined // bug when using phone code this shouldn't be passed (https://github.com/wppconnect-team/wppconnect-server/issues/1687#issuecomment-2099357874)
            ? client.config?.deviceName ||
            req.serverOptions.deviceName ||
            'WppConnect' :
            undefined,
            poweredBy:
            client.config.phone == undefined // bug when using phone code this shouldn't be passed (https://github.com/wppconnect-team/wppconnect-server/issues/1687#issuecomment-2099357874)
            ? client.config?.poweredBy ||
            req.serverOptions.poweredBy ||
            'Unicaclub-WPPConnect-Server' :
            undefined,
            catchLinkCode: (code) => {
              this.exportPhoneCode(req, client.config.phone, code, client, res);
            },
            catchQR: (
            base64Qr,
            asciiQR,
            attempt,
            urlCode) =>
            {
              this.exportQR(req, base64Qr, urlCode, client, res);
            },
            onLoadingScreen: (percent, message) => {
              req.logger.info(`[${session}] ${percent}% - ${message}`);
            },
            statusFind: (statusFind) => {
              try {
                _sessionUtil.eventEmitter.emit(
                  `status-${client.session}`,
                  client,
                  statusFind
                );
                if (
                statusFind === 'autocloseCalled' ||
                statusFind === 'desconnectedMobile')
                {
                  client.status = 'CLOSED';
                  client.qrcode = null;
                  client.close();
                  clientsArray[session] = undefined;
                }
                (0, _functions.callWebHook)(client, req, 'status-find', {
                  status: statusFind,
                  session: client.session
                });
                req.logger.info(statusFind + '\n\n');
              } catch (error) {}
            }
          }
        )
      );

      client = clientsArray[session] = Object.assign(wppClient, client);
      await this.start(req, client);

      if (req.serverOptions.webhook.onParticipantsChanged) {
        await this.onParticipantsChanged(req, client);
      }

      if (req.serverOptions.webhook.onReactionMessage) {
        await this.onReactionMessage(client, req);
      }

      if (req.serverOptions.webhook.onRevokedMessage) {
        await this.onRevokedMessage(client, req);
      }

      if (req.serverOptions.webhook.onPollResponse) {
        await this.onPollResponse(client, req);
      }
      if (req.serverOptions.webhook.onLabelUpdated) {
        await this.onLabelUpdated(client, req);
      }
    } catch (e) {
      req.logger.error(e);
      if (e instanceof Error && e.name == 'TimeoutError') {
        const client = this.getClient(session);
        client.status = 'CLOSED';
      }
    }
  }

  async opendata(req, session, res) {
    await this.createSessionUtil(req, _sessionUtil.clientsArray, session, res);
  }

  exportPhoneCode(
  req,
  phone,
  phoneCode,
  client,
  res)
  {
    _sessionUtil.eventEmitter.emit(`phoneCode-${client.session}`, phoneCode, client);

    Object.assign(client, {
      status: 'PHONECODE',
      phoneCode: phoneCode,
      phone: phone
    });

    req.io.emit('phoneCode', {
      data: phoneCode,
      phone: phone,
      session: client.session
    });

    (0, _functions.callWebHook)(client, req, 'phoneCode', {
      phoneCode: phoneCode,
      phone: phone,
      session: client.session
    });

    if (res && !res._headerSent)
    res.status(200).json({
      status: 'phoneCode',
      phone: phone,
      phoneCode: phoneCode,
      session: client.session
    });
  }

  exportQR(
  req,
  qrCode,
  urlCode,
  client,
  res)
  {
    _sessionUtil.eventEmitter.emit(`qrcode-${client.session}`, qrCode, urlCode, client);
    Object.assign(client, {
      status: 'QRCODE',
      qrcode: qrCode,
      urlcode: urlCode
    });

    qrCode = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(qrCode, 'base64');

    req.io.emit('qrCode', {
      data: 'data:image/png;base64,' + imageBuffer.toString('base64'),
      session: client.session
    });

    (0, _functions.callWebHook)(client, req, 'qrcode', {
      qrcode: qrCode,
      urlcode: urlCode,
      session: client.session
    });
    if (res && !res._headerSent)
    res.status(200).json({
      status: 'qrcode',
      qrcode: qrCode,
      urlcode: urlCode,
      session: client.session
    });
  }

  async onParticipantsChanged(req, client) {
    await client.isConnected();
    await client.onParticipantsChanged((message) => {
      (0, _functions.callWebHook)(client, req, 'onparticipantschanged', message);
    });
  }

  async start(req, client) {
    try {
      await client.isConnected();
      Object.assign(client, { status: 'CONNECTED', qrcode: null });

      req.logger.info(`Started Session: ${client.session}`);
      //callWebHook(client, req, 'session-logged', { status: 'CONNECTED'});
      req.io.emit('session-logged', { status: true, session: client.session });
      (0, _functions.startHelper)(client, req);
    } catch (error) {
      req.logger.error(error);
      req.io.emit('session-error', client.session);
    }

    await this.checkStateSession(client, req);
    await this.listenMessages(client, req);

    if (req.serverOptions.webhook.listenAcks) {
      await this.listenAcks(client, req);
    }

    if (req.serverOptions.webhook.onPresenceChanged) {
      await this.onPresenceChanged(client, req);
    }
  }

  async checkStateSession(client, req) {
    await client.onStateChange((state) => {
      req.logger.info(`State Change ${state}: ${client.session}`);
      const conflits = [_wppconnect.SocketState.CONFLICT];

      if (conflits.includes(state)) {
        client.useHere();
      }
    });
  }

  async listenMessages(client, req) {
    await client.onMessage(async (message) => {
      _sessionUtil.eventEmitter.emit(`mensagem-${client.session}`, client, message);
      (0, _functions.callWebHook)(client, req, 'onmessage', message);
      if (message.type === 'location')
      client.onLiveLocation(message.sender.id, (location) => {
        (0, _functions.callWebHook)(client, req, 'location', location);
      });
    });

    await client.onAnyMessage(async (message) => {
      message.session = client.session;

      if (message.type === 'sticker') {
        (0, _sessionController.download)(message, client, req.logger);
      }

      if (
      req.serverOptions?.websocket?.autoDownload ||
      req.serverOptions?.webhook?.autoDownload && message.fromMe == false)
      {
        await (0, _functions.autoDownload)(client, req, message);
      }

      req.io.emit('received-message', { response: message });
      if (req.serverOptions.webhook.onSelfMessage && message.fromMe)
      (0, _functions.callWebHook)(client, req, 'onselfmessage', message);
    });

    await client.onIncomingCall(async (call) => {
      req.io.emit('incomingcall', call);
      (0, _functions.callWebHook)(client, req, 'incomingcall', call);
    });
  }

  async listenAcks(client, req) {
    await client.onAck(async (ack) => {
      req.io.emit('onack', ack);
      (0, _functions.callWebHook)(client, req, 'onack', ack);
    });
  }

  async onPresenceChanged(client, req) {
    await client.onPresenceChanged(async (presenceChangedEvent) => {
      req.io.emit('onpresencechanged', presenceChangedEvent);
      (0, _functions.callWebHook)(client, req, 'onpresencechanged', presenceChangedEvent);
    });
  }

  async onReactionMessage(client, req) {
    await client.isConnected();
    await client.onReactionMessage(async (reaction) => {
      req.io.emit('onreactionmessage', reaction);
      (0, _functions.callWebHook)(client, req, 'onreactionmessage', reaction);
    });
  }

  async onRevokedMessage(client, req) {
    await client.isConnected();
    await client.onRevokedMessage(async (response) => {
      req.io.emit('onrevokedmessage', response);
      (0, _functions.callWebHook)(client, req, 'onrevokedmessage', response);
    });
  }
  async onPollResponse(client, req) {
    await client.isConnected();
    await client.onPollResponse(async (response) => {
      req.io.emit('onpollresponse', response);
      (0, _functions.callWebHook)(client, req, 'onpollresponse', response);
    });
  }
  async onLabelUpdated(client, req) {
    await client.isConnected();
    await client.onUpdateLabel(async (response) => {
      req.io.emit('onupdatelabel', response);
      (0, _functions.callWebHook)(client, req, 'onupdatelabel', response);
    });
  }

  encodeFunction(data, webhook) {
    data.webhook = webhook;
    return JSON.stringify(data);
  }

  decodeFunction(text, client) {
    const object = JSON.parse(text);
    if (object.webhook && !client.webhook) client.webhook = object.webhook;
    delete object.webhook;
    return object;
  }

  getClient(session) {
    let client = _sessionUtil.clientsArray[session];

    if (!client)
    client = _sessionUtil.clientsArray[session] = {
      status: null,
      session: session
    };
    return client;
  }
}exports.default = CreateSessionUtil;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfd3BwY29ubmVjdCIsInJlcXVpcmUiLCJfc2Vzc2lvbkNvbnRyb2xsZXIiLCJfY2hhdFdvb3RDbGllbnQiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwiX2Z1bmN0aW9ucyIsIl9zZXNzaW9uVXRpbCIsIl9mYWN0b3J5IiwiQ3JlYXRlU2Vzc2lvblV0aWwiLCJzdGFydENoYXRXb290Q2xpZW50IiwiY2xpZW50IiwiY29uZmlnIiwiY2hhdFdvb3QiLCJjaGF0V29vdENsaWVudCIsInNlc3Npb24iLCJjcmVhdGVTZXNzaW9uVXRpbCIsInJlcSIsImNsaWVudHNBcnJheSIsInJlcyIsImdldENsaWVudCIsInN0YXR1cyIsImJvZHkiLCJ0b2tlblN0b3JlIiwiRmFjdG9yeSIsIm15VG9rZW5TdG9yZSIsImNyZWF0ZVRva2VuU3RvcnkiLCJ0b2tlbkRhdGEiLCJnZXRUb2tlbiIsInNldFRva2VuIiwic2VydmVyT3B0aW9ucyIsImN1c3RvbVVzZXJEYXRhRGlyIiwiY3JlYXRlT3B0aW9ucyIsInB1cHBldGVlck9wdGlvbnMiLCJ1c2VyRGF0YURpciIsIndwcENsaWVudCIsImNyZWF0ZSIsIk9iamVjdCIsImFzc2lnbiIsInBob25lTnVtYmVyIiwicGhvbmUiLCJkZXZpY2VOYW1lIiwidW5kZWZpbmVkIiwicG93ZXJlZEJ5IiwiY2F0Y2hMaW5rQ29kZSIsImNvZGUiLCJleHBvcnRQaG9uZUNvZGUiLCJjYXRjaFFSIiwiYmFzZTY0UXIiLCJhc2NpaVFSIiwiYXR0ZW1wdCIsInVybENvZGUiLCJleHBvcnRRUiIsIm9uTG9hZGluZ1NjcmVlbiIsInBlcmNlbnQiLCJtZXNzYWdlIiwibG9nZ2VyIiwiaW5mbyIsInN0YXR1c0ZpbmQiLCJldmVudEVtaXR0ZXIiLCJlbWl0IiwicXJjb2RlIiwiY2xvc2UiLCJjYWxsV2ViSG9vayIsImVycm9yIiwic3RhcnQiLCJ3ZWJob29rIiwib25QYXJ0aWNpcGFudHNDaGFuZ2VkIiwib25SZWFjdGlvbk1lc3NhZ2UiLCJvblJldm9rZWRNZXNzYWdlIiwib25Qb2xsUmVzcG9uc2UiLCJvbkxhYmVsVXBkYXRlZCIsImUiLCJFcnJvciIsIm5hbWUiLCJvcGVuZGF0YSIsInBob25lQ29kZSIsImlvIiwiZGF0YSIsIl9oZWFkZXJTZW50IiwianNvbiIsInFyQ29kZSIsInVybGNvZGUiLCJyZXBsYWNlIiwiaW1hZ2VCdWZmZXIiLCJCdWZmZXIiLCJmcm9tIiwidG9TdHJpbmciLCJpc0Nvbm5lY3RlZCIsInN0YXJ0SGVscGVyIiwiY2hlY2tTdGF0ZVNlc3Npb24iLCJsaXN0ZW5NZXNzYWdlcyIsImxpc3RlbkFja3MiLCJvblByZXNlbmNlQ2hhbmdlZCIsIm9uU3RhdGVDaGFuZ2UiLCJzdGF0ZSIsImNvbmZsaXRzIiwiU29ja2V0U3RhdGUiLCJDT05GTElDVCIsImluY2x1ZGVzIiwidXNlSGVyZSIsIm9uTWVzc2FnZSIsInR5cGUiLCJvbkxpdmVMb2NhdGlvbiIsInNlbmRlciIsImlkIiwibG9jYXRpb24iLCJvbkFueU1lc3NhZ2UiLCJkb3dubG9hZCIsIndlYnNvY2tldCIsImF1dG9Eb3dubG9hZCIsImZyb21NZSIsInJlc3BvbnNlIiwib25TZWxmTWVzc2FnZSIsIm9uSW5jb21pbmdDYWxsIiwiY2FsbCIsIm9uQWNrIiwiYWNrIiwicHJlc2VuY2VDaGFuZ2VkRXZlbnQiLCJyZWFjdGlvbiIsIm9uVXBkYXRlTGFiZWwiLCJlbmNvZGVGdW5jdGlvbiIsIkpTT04iLCJzdHJpbmdpZnkiLCJkZWNvZGVGdW5jdGlvbiIsInRleHQiLCJvYmplY3QiLCJwYXJzZSIsImV4cG9ydHMiLCJkZWZhdWx0Il0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWwvY3JlYXRlU2Vzc2lvblV0aWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQ29weXJpZ2h0IDIwMjEgV1BQQ29ubmVjdCBUZWFtXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XHJcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqXHJcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKi9cclxuaW1wb3J0IHsgY3JlYXRlLCBTb2NrZXRTdGF0ZSB9IGZyb20gJ0B3cHBjb25uZWN0LXRlYW0vd3BwY29ubmVjdCc7XHJcbmltcG9ydCB7IFJlcXVlc3QgfSBmcm9tICdleHByZXNzJztcclxuXHJcbmltcG9ydCB7IGRvd25sb2FkIH0gZnJvbSAnLi4vY29udHJvbGxlci9zZXNzaW9uQ29udHJvbGxlcic7XHJcbmltcG9ydCB7IFdoYXRzQXBwU2VydmVyIH0gZnJvbSAnLi4vdHlwZXMvV2hhdHNBcHBTZXJ2ZXInO1xyXG5pbXBvcnQgY2hhdFdvb3RDbGllbnQgZnJvbSAnLi9jaGF0V29vdENsaWVudCc7XHJcbmltcG9ydCB7IGF1dG9Eb3dubG9hZCwgY2FsbFdlYkhvb2ssIHN0YXJ0SGVscGVyIH0gZnJvbSAnLi9mdW5jdGlvbnMnO1xyXG5pbXBvcnQgeyBjbGllbnRzQXJyYXksIGV2ZW50RW1pdHRlciB9IGZyb20gJy4vc2Vzc2lvblV0aWwnO1xyXG5pbXBvcnQgRmFjdG9yeSBmcm9tICcuL3Rva2VuU3RvcmUvZmFjdG9yeSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDcmVhdGVTZXNzaW9uVXRpbCB7XHJcbiAgc3RhcnRDaGF0V29vdENsaWVudChjbGllbnQ6IGFueSkge1xyXG4gICAgaWYgKGNsaWVudC5jb25maWcuY2hhdFdvb3QgJiYgIWNsaWVudC5fY2hhdFdvb3RDbGllbnQpXHJcbiAgICAgIGNsaWVudC5fY2hhdFdvb3RDbGllbnQgPSBuZXcgY2hhdFdvb3RDbGllbnQoXHJcbiAgICAgICAgY2xpZW50LmNvbmZpZy5jaGF0V29vdCxcclxuICAgICAgICBjbGllbnQuc2Vzc2lvblxyXG4gICAgICApO1xyXG4gICAgcmV0dXJuIGNsaWVudC5fY2hhdFdvb3RDbGllbnQ7XHJcbiAgfVxyXG5cclxuICBhc3luYyBjcmVhdGVTZXNzaW9uVXRpbChcclxuICAgIHJlcTogYW55LFxyXG4gICAgY2xpZW50c0FycmF5OiBhbnksXHJcbiAgICBzZXNzaW9uOiBzdHJpbmcsXHJcbiAgICByZXM/OiBhbnlcclxuICApIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGxldCBjbGllbnQgPSB0aGlzLmdldENsaWVudChzZXNzaW9uKSBhcyBhbnk7XHJcbiAgICAgIGlmIChjbGllbnQuc3RhdHVzICE9IG51bGwgJiYgY2xpZW50LnN0YXR1cyAhPT0gJ0NMT1NFRCcpIHJldHVybjtcclxuICAgICAgY2xpZW50LnN0YXR1cyA9ICdJTklUSUFMSVpJTkcnO1xyXG4gICAgICBjbGllbnQuY29uZmlnID0gcmVxLmJvZHk7XHJcblxyXG4gICAgICBjb25zdCB0b2tlblN0b3JlID0gbmV3IEZhY3RvcnkoKTtcclxuICAgICAgY29uc3QgbXlUb2tlblN0b3JlID0gdG9rZW5TdG9yZS5jcmVhdGVUb2tlblN0b3J5KGNsaWVudCk7XHJcbiAgICAgIGNvbnN0IHRva2VuRGF0YSA9IGF3YWl0IG15VG9rZW5TdG9yZS5nZXRUb2tlbihzZXNzaW9uKTtcclxuXHJcbiAgICAgIC8vIHdlIG5lZWQgdGhpcyB0byB1cGRhdGUgcGhvbmUgaW4gY29uZmlnIGV2ZXJ5IHRpbWUgc2Vzc2lvbiBzdGFydHMsIHNvIHdlIGNhbiBhc2sgZm9yIGNvZGUgZm9yIGl0IGFnYWluLlxyXG4gICAgICBteVRva2VuU3RvcmUuc2V0VG9rZW4oc2Vzc2lvbiwgdG9rZW5EYXRhID8/IHt9KTtcclxuXHJcbiAgICAgIHRoaXMuc3RhcnRDaGF0V29vdENsaWVudChjbGllbnQpO1xyXG5cclxuICAgICAgaWYgKHJlcS5zZXJ2ZXJPcHRpb25zLmN1c3RvbVVzZXJEYXRhRGlyKSB7XHJcbiAgICAgICAgcmVxLnNlcnZlck9wdGlvbnMuY3JlYXRlT3B0aW9ucy5wdXBwZXRlZXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgdXNlckRhdGFEaXI6IHJlcS5zZXJ2ZXJPcHRpb25zLmN1c3RvbVVzZXJEYXRhRGlyICsgc2Vzc2lvbixcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCB3cHBDbGllbnQgPSBhd2FpdCBjcmVhdGUoXHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcclxuICAgICAgICAgIHt9LFxyXG4gICAgICAgICAgeyB0b2tlblN0b3JlOiBteVRva2VuU3RvcmUgfSxcclxuICAgICAgICAgIHJlcS5zZXJ2ZXJPcHRpb25zLmNyZWF0ZU9wdGlvbnMsXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNlc3Npb246IHNlc3Npb24sXHJcbiAgICAgICAgICAgIHBob25lTnVtYmVyOiBjbGllbnQuY29uZmlnLnBob25lID8/IG51bGwsXHJcbiAgICAgICAgICAgIGRldmljZU5hbWU6XHJcbiAgICAgICAgICAgICAgY2xpZW50LmNvbmZpZy5waG9uZSA9PSB1bmRlZmluZWQgLy8gYnVnIHdoZW4gdXNpbmcgcGhvbmUgY29kZSB0aGlzIHNob3VsZG4ndCBiZSBwYXNzZWQgKGh0dHBzOi8vZ2l0aHViLmNvbS93cHBjb25uZWN0LXRlYW0vd3BwY29ubmVjdC1zZXJ2ZXIvaXNzdWVzLzE2ODcjaXNzdWVjb21tZW50LTIwOTkzNTc4NzQpXHJcbiAgICAgICAgICAgICAgICA/IGNsaWVudC5jb25maWc/LmRldmljZU5hbWUgfHxcclxuICAgICAgICAgICAgICAgICAgcmVxLnNlcnZlck9wdGlvbnMuZGV2aWNlTmFtZSB8fFxyXG4gICAgICAgICAgICAgICAgICAnV3BwQ29ubmVjdCdcclxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICBwb3dlcmVkQnk6XHJcbiAgICAgICAgICAgICAgY2xpZW50LmNvbmZpZy5waG9uZSA9PSB1bmRlZmluZWQgLy8gYnVnIHdoZW4gdXNpbmcgcGhvbmUgY29kZSB0aGlzIHNob3VsZG4ndCBiZSBwYXNzZWQgKGh0dHBzOi8vZ2l0aHViLmNvbS93cHBjb25uZWN0LXRlYW0vd3BwY29ubmVjdC1zZXJ2ZXIvaXNzdWVzLzE2ODcjaXNzdWVjb21tZW50LTIwOTkzNTc4NzQpXHJcbiAgICAgICAgICAgICAgICA/IGNsaWVudC5jb25maWc/LnBvd2VyZWRCeSB8fFxyXG4gICAgICAgICAgICAgICAgICByZXEuc2VydmVyT3B0aW9ucy5wb3dlcmVkQnkgfHxcclxuICAgICAgICAgICAgICAgICAgJ1VuaWNhY2x1Yi1XUFBDb25uZWN0LVNlcnZlcidcclxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICBjYXRjaExpbmtDb2RlOiAoY29kZTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5leHBvcnRQaG9uZUNvZGUocmVxLCBjbGllbnQuY29uZmlnLnBob25lLCBjb2RlLCBjbGllbnQsIHJlcyk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNhdGNoUVI6IChcclxuICAgICAgICAgICAgICBiYXNlNjRRcjogYW55LFxyXG4gICAgICAgICAgICAgIGFzY2lpUVI6IGFueSxcclxuICAgICAgICAgICAgICBhdHRlbXB0OiBhbnksXHJcbiAgICAgICAgICAgICAgdXJsQ29kZTogc3RyaW5nXHJcbiAgICAgICAgICAgICkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMuZXhwb3J0UVIocmVxLCBiYXNlNjRRciwgdXJsQ29kZSwgY2xpZW50LCByZXMpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkxvYWRpbmdTY3JlZW46IChwZXJjZW50OiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykgPT4ge1xyXG4gICAgICAgICAgICAgIHJlcS5sb2dnZXIuaW5mbyhgWyR7c2Vzc2lvbn1dICR7cGVyY2VudH0lIC0gJHttZXNzYWdlfWApO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdGF0dXNGaW5kOiAoc3RhdHVzRmluZDogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50RW1pdHRlci5lbWl0KFxyXG4gICAgICAgICAgICAgICAgICBgc3RhdHVzLSR7Y2xpZW50LnNlc3Npb259YCxcclxuICAgICAgICAgICAgICAgICAgY2xpZW50LFxyXG4gICAgICAgICAgICAgICAgICBzdGF0dXNGaW5kXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKFxyXG4gICAgICAgICAgICAgICAgICBzdGF0dXNGaW5kID09PSAnYXV0b2Nsb3NlQ2FsbGVkJyB8fFxyXG4gICAgICAgICAgICAgICAgICBzdGF0dXNGaW5kID09PSAnZGVzY29ubmVjdGVkTW9iaWxlJ1xyXG4gICAgICAgICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNsaWVudC5zdGF0dXMgPSAnQ0xPU0VEJztcclxuICAgICAgICAgICAgICAgICAgY2xpZW50LnFyY29kZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgIGNsaWVudC5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICBjbGllbnRzQXJyYXlbc2Vzc2lvbl0gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ3N0YXR1cy1maW5kJywge1xyXG4gICAgICAgICAgICAgICAgICBzdGF0dXM6IHN0YXR1c0ZpbmQsXHJcbiAgICAgICAgICAgICAgICAgIHNlc3Npb246IGNsaWVudC5zZXNzaW9uLFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXEubG9nZ2VyLmluZm8oc3RhdHVzRmluZCArICdcXG5cXG4nKTtcclxuICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge31cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICApXHJcbiAgICAgICk7XHJcblxyXG4gICAgICBjbGllbnQgPSBjbGllbnRzQXJyYXlbc2Vzc2lvbl0gPSBPYmplY3QuYXNzaWduKHdwcENsaWVudCwgY2xpZW50KTtcclxuICAgICAgYXdhaXQgdGhpcy5zdGFydChyZXEsIGNsaWVudCk7XHJcblxyXG4gICAgICBpZiAocmVxLnNlcnZlck9wdGlvbnMud2ViaG9vay5vblBhcnRpY2lwYW50c0NoYW5nZWQpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLm9uUGFydGljaXBhbnRzQ2hhbmdlZChyZXEsIGNsaWVudCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChyZXEuc2VydmVyT3B0aW9ucy53ZWJob29rLm9uUmVhY3Rpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5vblJlYWN0aW9uTWVzc2FnZShjbGllbnQsIHJlcSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChyZXEuc2VydmVyT3B0aW9ucy53ZWJob29rLm9uUmV2b2tlZE1lc3NhZ2UpIHtcclxuICAgICAgICBhd2FpdCB0aGlzLm9uUmV2b2tlZE1lc3NhZ2UoY2xpZW50LCByZXEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocmVxLnNlcnZlck9wdGlvbnMud2ViaG9vay5vblBvbGxSZXNwb25zZSkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMub25Qb2xsUmVzcG9uc2UoY2xpZW50LCByZXEpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChyZXEuc2VydmVyT3B0aW9ucy53ZWJob29rLm9uTGFiZWxVcGRhdGVkKSB7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5vbkxhYmVsVXBkYXRlZChjbGllbnQsIHJlcSk7XHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvciAmJiBlLm5hbWUgPT0gJ1RpbWVvdXRFcnJvcicpIHtcclxuICAgICAgICBjb25zdCBjbGllbnQgPSB0aGlzLmdldENsaWVudChzZXNzaW9uKSBhcyBhbnk7XHJcbiAgICAgICAgY2xpZW50LnN0YXR1cyA9ICdDTE9TRUQnO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBvcGVuZGF0YShyZXE6IFJlcXVlc3QsIHNlc3Npb246IHN0cmluZywgcmVzPzogYW55KSB7XHJcbiAgICBhd2FpdCB0aGlzLmNyZWF0ZVNlc3Npb25VdGlsKHJlcSwgY2xpZW50c0FycmF5LCBzZXNzaW9uLCByZXMpO1xyXG4gIH1cclxuXHJcbiAgZXhwb3J0UGhvbmVDb2RlKFxyXG4gICAgcmVxOiBhbnksXHJcbiAgICBwaG9uZTogYW55LFxyXG4gICAgcGhvbmVDb2RlOiBhbnksXHJcbiAgICBjbGllbnQ6IFdoYXRzQXBwU2VydmVyLFxyXG4gICAgcmVzPzogYW55XHJcbiAgKSB7XHJcbiAgICBldmVudEVtaXR0ZXIuZW1pdChgcGhvbmVDb2RlLSR7Y2xpZW50LnNlc3Npb259YCwgcGhvbmVDb2RlLCBjbGllbnQpO1xyXG5cclxuICAgIE9iamVjdC5hc3NpZ24oY2xpZW50LCB7XHJcbiAgICAgIHN0YXR1czogJ1BIT05FQ09ERScsXHJcbiAgICAgIHBob25lQ29kZTogcGhvbmVDb2RlLFxyXG4gICAgICBwaG9uZTogcGhvbmUsXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXEuaW8uZW1pdCgncGhvbmVDb2RlJywge1xyXG4gICAgICBkYXRhOiBwaG9uZUNvZGUsXHJcbiAgICAgIHBob25lOiBwaG9uZSxcclxuICAgICAgc2Vzc2lvbjogY2xpZW50LnNlc3Npb24sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ3Bob25lQ29kZScsIHtcclxuICAgICAgcGhvbmVDb2RlOiBwaG9uZUNvZGUsXHJcbiAgICAgIHBob25lOiBwaG9uZSxcclxuICAgICAgc2Vzc2lvbjogY2xpZW50LnNlc3Npb24sXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAocmVzICYmICFyZXMuX2hlYWRlclNlbnQpXHJcbiAgICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcclxuICAgICAgICBzdGF0dXM6ICdwaG9uZUNvZGUnLFxyXG4gICAgICAgIHBob25lOiBwaG9uZSxcclxuICAgICAgICBwaG9uZUNvZGU6IHBob25lQ29kZSxcclxuICAgICAgICBzZXNzaW9uOiBjbGllbnQuc2Vzc2lvbixcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBleHBvcnRRUihcclxuICAgIHJlcTogYW55LFxyXG4gICAgcXJDb2RlOiBhbnksXHJcbiAgICB1cmxDb2RlOiBhbnksXHJcbiAgICBjbGllbnQ6IFdoYXRzQXBwU2VydmVyLFxyXG4gICAgcmVzPzogYW55XHJcbiAgKSB7XHJcbiAgICBldmVudEVtaXR0ZXIuZW1pdChgcXJjb2RlLSR7Y2xpZW50LnNlc3Npb259YCwgcXJDb2RlLCB1cmxDb2RlLCBjbGllbnQpO1xyXG4gICAgT2JqZWN0LmFzc2lnbihjbGllbnQsIHtcclxuICAgICAgc3RhdHVzOiAnUVJDT0RFJyxcclxuICAgICAgcXJjb2RlOiBxckNvZGUsXHJcbiAgICAgIHVybGNvZGU6IHVybENvZGUsXHJcbiAgICB9KTtcclxuXHJcbiAgICBxckNvZGUgPSBxckNvZGUucmVwbGFjZSgnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcsICcnKTtcclxuICAgIGNvbnN0IGltYWdlQnVmZmVyID0gQnVmZmVyLmZyb20ocXJDb2RlLCAnYmFzZTY0Jyk7XHJcblxyXG4gICAgcmVxLmlvLmVtaXQoJ3FyQ29kZScsIHtcclxuICAgICAgZGF0YTogJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnICsgaW1hZ2VCdWZmZXIudG9TdHJpbmcoJ2Jhc2U2NCcpLFxyXG4gICAgICBzZXNzaW9uOiBjbGllbnQuc2Vzc2lvbixcclxuICAgIH0pO1xyXG5cclxuICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAncXJjb2RlJywge1xyXG4gICAgICBxcmNvZGU6IHFyQ29kZSxcclxuICAgICAgdXJsY29kZTogdXJsQ29kZSxcclxuICAgICAgc2Vzc2lvbjogY2xpZW50LnNlc3Npb24sXHJcbiAgICB9KTtcclxuICAgIGlmIChyZXMgJiYgIXJlcy5faGVhZGVyU2VudClcclxuICAgICAgcmVzLnN0YXR1cygyMDApLmpzb24oe1xyXG4gICAgICAgIHN0YXR1czogJ3FyY29kZScsXHJcbiAgICAgICAgcXJjb2RlOiBxckNvZGUsXHJcbiAgICAgICAgdXJsY29kZTogdXJsQ29kZSxcclxuICAgICAgICBzZXNzaW9uOiBjbGllbnQuc2Vzc2lvbixcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBvblBhcnRpY2lwYW50c0NoYW5nZWQocmVxOiBhbnksIGNsaWVudDogYW55KSB7XHJcbiAgICBhd2FpdCBjbGllbnQuaXNDb25uZWN0ZWQoKTtcclxuICAgIGF3YWl0IGNsaWVudC5vblBhcnRpY2lwYW50c0NoYW5nZWQoKG1lc3NhZ2U6IGFueSkgPT4ge1xyXG4gICAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ29ucGFydGljaXBhbnRzY2hhbmdlZCcsIG1lc3NhZ2UpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBzdGFydChyZXE6IFJlcXVlc3QsIGNsaWVudDogV2hhdHNBcHBTZXJ2ZXIpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IGNsaWVudC5pc0Nvbm5lY3RlZCgpO1xyXG4gICAgICBPYmplY3QuYXNzaWduKGNsaWVudCwgeyBzdGF0dXM6ICdDT05ORUNURUQnLCBxcmNvZGU6IG51bGwgfSk7XHJcblxyXG4gICAgICByZXEubG9nZ2VyLmluZm8oYFN0YXJ0ZWQgU2Vzc2lvbjogJHtjbGllbnQuc2Vzc2lvbn1gKTtcclxuICAgICAgLy9jYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ3Nlc3Npb24tbG9nZ2VkJywgeyBzdGF0dXM6ICdDT05ORUNURUQnfSk7XHJcbiAgICAgIHJlcS5pby5lbWl0KCdzZXNzaW9uLWxvZ2dlZCcsIHsgc3RhdHVzOiB0cnVlLCBzZXNzaW9uOiBjbGllbnQuc2Vzc2lvbiB9KTtcclxuICAgICAgc3RhcnRIZWxwZXIoY2xpZW50LCByZXEpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICAgIHJlcS5pby5lbWl0KCdzZXNzaW9uLWVycm9yJywgY2xpZW50LnNlc3Npb24pO1xyXG4gICAgfVxyXG5cclxuICAgIGF3YWl0IHRoaXMuY2hlY2tTdGF0ZVNlc3Npb24oY2xpZW50LCByZXEpO1xyXG4gICAgYXdhaXQgdGhpcy5saXN0ZW5NZXNzYWdlcyhjbGllbnQsIHJlcSk7XHJcblxyXG4gICAgaWYgKHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2subGlzdGVuQWNrcykge1xyXG4gICAgICBhd2FpdCB0aGlzLmxpc3RlbkFja3MoY2xpZW50LCByZXEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXEuc2VydmVyT3B0aW9ucy53ZWJob29rLm9uUHJlc2VuY2VDaGFuZ2VkKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMub25QcmVzZW5jZUNoYW5nZWQoY2xpZW50LCByZXEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgY2hlY2tTdGF0ZVNlc3Npb24oY2xpZW50OiBXaGF0c0FwcFNlcnZlciwgcmVxOiBSZXF1ZXN0KSB7XHJcbiAgICBhd2FpdCBjbGllbnQub25TdGF0ZUNoYW5nZSgoc3RhdGUpID0+IHtcclxuICAgICAgcmVxLmxvZ2dlci5pbmZvKGBTdGF0ZSBDaGFuZ2UgJHtzdGF0ZX06ICR7Y2xpZW50LnNlc3Npb259YCk7XHJcbiAgICAgIGNvbnN0IGNvbmZsaXRzID0gW1NvY2tldFN0YXRlLkNPTkZMSUNUXTtcclxuXHJcbiAgICAgIGlmIChjb25mbGl0cy5pbmNsdWRlcyhzdGF0ZSkpIHtcclxuICAgICAgICBjbGllbnQudXNlSGVyZSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGxpc3Rlbk1lc3NhZ2VzKGNsaWVudDogV2hhdHNBcHBTZXJ2ZXIsIHJlcTogUmVxdWVzdCkge1xyXG4gICAgYXdhaXQgY2xpZW50Lm9uTWVzc2FnZShhc3luYyAobWVzc2FnZTogYW55KSA9PiB7XHJcbiAgICAgIGV2ZW50RW1pdHRlci5lbWl0KGBtZW5zYWdlbS0ke2NsaWVudC5zZXNzaW9ufWAsIGNsaWVudCwgbWVzc2FnZSk7XHJcbiAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnb25tZXNzYWdlJywgbWVzc2FnZSk7XHJcbiAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09ICdsb2NhdGlvbicpXHJcbiAgICAgICAgY2xpZW50Lm9uTGl2ZUxvY2F0aW9uKG1lc3NhZ2Uuc2VuZGVyLmlkLCAobG9jYXRpb24pID0+IHtcclxuICAgICAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnbG9jYXRpb24nLCBsb2NhdGlvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBhd2FpdCBjbGllbnQub25BbnlNZXNzYWdlKGFzeW5jIChtZXNzYWdlOiBhbnkpID0+IHtcclxuICAgICAgbWVzc2FnZS5zZXNzaW9uID0gY2xpZW50LnNlc3Npb247XHJcblxyXG4gICAgICBpZiAobWVzc2FnZS50eXBlID09PSAnc3RpY2tlcicpIHtcclxuICAgICAgICBkb3dubG9hZChtZXNzYWdlLCBjbGllbnQsIHJlcS5sb2dnZXIpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgcmVxLnNlcnZlck9wdGlvbnM/LndlYnNvY2tldD8uYXV0b0Rvd25sb2FkIHx8XHJcbiAgICAgICAgKHJlcS5zZXJ2ZXJPcHRpb25zPy53ZWJob29rPy5hdXRvRG93bmxvYWQgJiYgbWVzc2FnZS5mcm9tTWUgPT0gZmFsc2UpXHJcbiAgICAgICkge1xyXG4gICAgICAgIGF3YWl0IGF1dG9Eb3dubG9hZChjbGllbnQsIHJlcSwgbWVzc2FnZSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJlcS5pby5lbWl0KCdyZWNlaXZlZC1tZXNzYWdlJywgeyByZXNwb25zZTogbWVzc2FnZSB9KTtcclxuICAgICAgaWYgKHJlcS5zZXJ2ZXJPcHRpb25zLndlYmhvb2sub25TZWxmTWVzc2FnZSAmJiBtZXNzYWdlLmZyb21NZSlcclxuICAgICAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ29uc2VsZm1lc3NhZ2UnLCBtZXNzYWdlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGF3YWl0IGNsaWVudC5vbkluY29taW5nQ2FsbChhc3luYyAoY2FsbCkgPT4ge1xyXG4gICAgICByZXEuaW8uZW1pdCgnaW5jb21pbmdjYWxsJywgY2FsbCk7XHJcbiAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnaW5jb21pbmdjYWxsJywgY2FsbCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGxpc3RlbkFja3MoY2xpZW50OiBXaGF0c0FwcFNlcnZlciwgcmVxOiBSZXF1ZXN0KSB7XHJcbiAgICBhd2FpdCBjbGllbnQub25BY2soYXN5bmMgKGFjaykgPT4ge1xyXG4gICAgICByZXEuaW8uZW1pdCgnb25hY2snLCBhY2spO1xyXG4gICAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ29uYWNrJywgYWNrKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgb25QcmVzZW5jZUNoYW5nZWQoY2xpZW50OiBXaGF0c0FwcFNlcnZlciwgcmVxOiBSZXF1ZXN0KSB7XHJcbiAgICBhd2FpdCBjbGllbnQub25QcmVzZW5jZUNoYW5nZWQoYXN5bmMgKHByZXNlbmNlQ2hhbmdlZEV2ZW50KSA9PiB7XHJcbiAgICAgIHJlcS5pby5lbWl0KCdvbnByZXNlbmNlY2hhbmdlZCcsIHByZXNlbmNlQ2hhbmdlZEV2ZW50KTtcclxuICAgICAgY2FsbFdlYkhvb2soY2xpZW50LCByZXEsICdvbnByZXNlbmNlY2hhbmdlZCcsIHByZXNlbmNlQ2hhbmdlZEV2ZW50KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgb25SZWFjdGlvbk1lc3NhZ2UoY2xpZW50OiBXaGF0c0FwcFNlcnZlciwgcmVxOiBSZXF1ZXN0KSB7XHJcbiAgICBhd2FpdCBjbGllbnQuaXNDb25uZWN0ZWQoKTtcclxuICAgIGF3YWl0IGNsaWVudC5vblJlYWN0aW9uTWVzc2FnZShhc3luYyAocmVhY3Rpb246IGFueSkgPT4ge1xyXG4gICAgICByZXEuaW8uZW1pdCgnb25yZWFjdGlvbm1lc3NhZ2UnLCByZWFjdGlvbik7XHJcbiAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnb25yZWFjdGlvbm1lc3NhZ2UnLCByZWFjdGlvbik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIG9uUmV2b2tlZE1lc3NhZ2UoY2xpZW50OiBXaGF0c0FwcFNlcnZlciwgcmVxOiBSZXF1ZXN0KSB7XHJcbiAgICBhd2FpdCBjbGllbnQuaXNDb25uZWN0ZWQoKTtcclxuICAgIGF3YWl0IGNsaWVudC5vblJldm9rZWRNZXNzYWdlKGFzeW5jIChyZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAgIHJlcS5pby5lbWl0KCdvbnJldm9rZWRtZXNzYWdlJywgcmVzcG9uc2UpO1xyXG4gICAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ29ucmV2b2tlZG1lc3NhZ2UnLCByZXNwb25zZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgYXN5bmMgb25Qb2xsUmVzcG9uc2UoY2xpZW50OiBXaGF0c0FwcFNlcnZlciwgcmVxOiBSZXF1ZXN0KSB7XHJcbiAgICBhd2FpdCBjbGllbnQuaXNDb25uZWN0ZWQoKTtcclxuICAgIGF3YWl0IGNsaWVudC5vblBvbGxSZXNwb25zZShhc3luYyAocmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICByZXEuaW8uZW1pdCgnb25wb2xscmVzcG9uc2UnLCByZXNwb25zZSk7XHJcbiAgICAgIGNhbGxXZWJIb29rKGNsaWVudCwgcmVxLCAnb25wb2xscmVzcG9uc2UnLCByZXNwb25zZSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgYXN5bmMgb25MYWJlbFVwZGF0ZWQoY2xpZW50OiBXaGF0c0FwcFNlcnZlciwgcmVxOiBSZXF1ZXN0KSB7XHJcbiAgICBhd2FpdCBjbGllbnQuaXNDb25uZWN0ZWQoKTtcclxuICAgIGF3YWl0IGNsaWVudC5vblVwZGF0ZUxhYmVsKGFzeW5jIChyZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAgIHJlcS5pby5lbWl0KCdvbnVwZGF0ZWxhYmVsJywgcmVzcG9uc2UpO1xyXG4gICAgICBjYWxsV2ViSG9vayhjbGllbnQsIHJlcSwgJ29udXBkYXRlbGFiZWwnLCByZXNwb25zZSk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGVuY29kZUZ1bmN0aW9uKGRhdGE6IGFueSwgd2ViaG9vazogYW55KSB7XHJcbiAgICBkYXRhLndlYmhvb2sgPSB3ZWJob29rO1xyXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGRhdGEpO1xyXG4gIH1cclxuXHJcbiAgZGVjb2RlRnVuY3Rpb24odGV4dDogYW55LCBjbGllbnQ6IGFueSkge1xyXG4gICAgY29uc3Qgb2JqZWN0ID0gSlNPTi5wYXJzZSh0ZXh0KTtcclxuICAgIGlmIChvYmplY3Qud2ViaG9vayAmJiAhY2xpZW50LndlYmhvb2spIGNsaWVudC53ZWJob29rID0gb2JqZWN0LndlYmhvb2s7XHJcbiAgICBkZWxldGUgb2JqZWN0LndlYmhvb2s7XHJcbiAgICByZXR1cm4gb2JqZWN0O1xyXG4gIH1cclxuXHJcbiAgZ2V0Q2xpZW50KHNlc3Npb246IGFueSkge1xyXG4gICAgbGV0IGNsaWVudCA9IGNsaWVudHNBcnJheVtzZXNzaW9uXTtcclxuXHJcbiAgICBpZiAoIWNsaWVudClcclxuICAgICAgY2xpZW50ID0gY2xpZW50c0FycmF5W3Nlc3Npb25dID0ge1xyXG4gICAgICAgIHN0YXR1czogbnVsbCxcclxuICAgICAgICBzZXNzaW9uOiBzZXNzaW9uLFxyXG4gICAgICB9IGFzIGFueTtcclxuICAgIHJldHVybiBjbGllbnQ7XHJcbiAgfVxyXG59XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZUEsSUFBQUEsV0FBQSxHQUFBQyxPQUFBOzs7QUFHQSxJQUFBQyxrQkFBQSxHQUFBRCxPQUFBOztBQUVBLElBQUFFLGVBQUEsR0FBQUMsc0JBQUEsQ0FBQUgsT0FBQTtBQUNBLElBQUFJLFVBQUEsR0FBQUosT0FBQTtBQUNBLElBQUFLLFlBQUEsR0FBQUwsT0FBQTtBQUNBLElBQUFNLFFBQUEsR0FBQUgsc0JBQUEsQ0FBQUgsT0FBQSwwQkFBMkMsQ0F2QjNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQVdlLE1BQU1PLGlCQUFpQixDQUFDLENBQ3JDQyxtQkFBbUJBLENBQUNDLE1BQVcsRUFBRSxDQUMvQixJQUFJQSxNQUFNLENBQUNDLE1BQU0sQ0FBQ0MsUUFBUSxJQUFJLENBQUNGLE1BQU0sQ0FBQ1AsZUFBZSxFQUNuRE8sTUFBTSxDQUFDUCxlQUFlLEdBQUcsSUFBSVUsdUJBQWMsQ0FDekNILE1BQU0sQ0FBQ0MsTUFBTSxDQUFDQyxRQUFRLEVBQ3RCRixNQUFNLENBQUNJLE9BQ1QsQ0FBQyxDQUNILE9BQU9KLE1BQU0sQ0FBQ1AsZUFBZSxDQUMvQixDQUVBLE1B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