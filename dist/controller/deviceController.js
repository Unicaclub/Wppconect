"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.archiveAllChats = archiveAllChats;exports.archiveChat = archiveChat;exports.blockContact = blockContact;exports.chatWoot = chatWoot;exports.checkNumberStatus = checkNumberStatus;exports.clearAllChats = clearAllChats;exports.clearChat = clearChat;exports.deleteAllChats = deleteAllChats;exports.deleteChat = deleteChat;exports.deleteMessage = deleteMessage;exports.forwardMessages = forwardMessages;exports.getAllChats = getAllChats;exports.getAllChatsArchiveds = getAllChatsArchiveds;exports.getAllChatsWithMessages = getAllChatsWithMessages;exports.getAllContacts = getAllContacts;exports.getAllMessagesInChat = getAllMessagesInChat;exports.getAllNewMessages = getAllNewMessages;exports.getAllUnreadMessages = getAllUnreadMessages;exports.getBatteryLevel = getBatteryLevel;exports.getBlockList = getBlockList;exports.getChatById = getChatById;exports.getChatIsOnline = getChatIsOnline;exports.getContact = getContact;exports.getHostDevice = getHostDevice;exports.getLastSeen = getLastSeen;exports.getListMutes = getListMutes;exports.getMessageById = getMessageById;exports.getMessages = getMessages;exports.getNumberProfile = getNumberProfile;exports.getPhoneNumber = getPhoneNumber;exports.getPlatformFromMessage = getPlatformFromMessage;exports.getProfilePicFromServer = getProfilePicFromServer;exports.getReactions = getReactions;exports.getStatus = getStatus;exports.getUnreadMessages = getUnreadMessages;exports.getVotes = getVotes;exports.listChats = listChats;exports.loadAndGetAllMessagesInChat = loadAndGetAllMessagesInChat;exports.markUnseenMessage = markUnseenMessage;exports.pinChat = pinChat;exports.reactMessage = reactMessage;exports.rejectCall = rejectCall;exports.reply = reply;exports.sendContactVcard = sendContactVcard;exports.sendMute = sendMute;exports.sendSeen = sendSeen;exports.setChatState = setChatState;exports.setProfileName = setProfileName;exports.setProfilePic = setProfilePic;exports.setProfileStatus = setProfileStatus;exports.setRecording = setRecording;exports.setTemporaryMessages = setTemporaryMessages;exports.setTyping = setTyping;exports.showAllContacts = showAllContacts;exports.starMessage = starMessage;exports.unblockContact = unblockContact;

















var _functions = require("../util/functions");
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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function returnSucess(res, session, phone, data) {res.status(201).json({ status: 'Success', response: { message: 'Information retrieved successfully.', contact: phone, session: session, data: data } });}function returnError(req, res, session, error) {
  req.logger.error(error);
  res.status(400).json({
    status: 'Error',
    response: {
      message: 'Error retrieving information',
      session: session,
      log: error
    }
  });
}

async function setProfileName(req, res) {
  /**
   * #swagger.tags = ["Profile"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: false,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
            }
          },
          examples: {
            "Default": {
              value: {
                name: "My new name",
              }
            },
          }
        }
      }
     }
   */
  const { name } = req.body;

  if (!name)
  res.
  status(400).
  json({ status: 'error', message: 'Parameter name is required!' });

  try {
    const result = await req.client.setProfileName(name);
    res.status(200).json({ status: 'success', response: result });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on set profile name.',
      error: error
    });
  }
}

async function showAllContacts(req, res) {
  /**
   * #swagger.tags = ["Contacts"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const contacts = await req.client.getAllContacts();
    res.status(200).json({ status: 'success', response: contacts });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching contacts',
      error: error
    });
  }
}

async function getAllChats(req, res) {
  /**
   * #swagger.tags = ["Chat"]
   * #swagger.summary = 'Deprecated in favor of 'list-chats'
   * #swagger.deprecated = true
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const response = await req.client.getAllChats();
    res.
    status(200).
    json({ status: 'success', response: response, mapper: 'chat' });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on get all chats' });
  }
}

async function listChats(req, res) {
  /**
   * #swagger.tags = ["Chat"]
   * #swagger.summary = 'Retrieve a list of chats'
   * #swagger.description = 'This body is not required. Not sent body to get all chats or filter.'
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: false,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "string" },
              count: { type: "number" },
              direction: { type: "string" },
              onlyGroups: { type: "boolean" },
              onlyUsers: { type: "boolean" },
              onlyWithUnreadMessage: { type: "boolean" },
              withLabels: { type: "array" },
            }
          },
          examples: {
            "All options - Edit this": {
              value: {
                id: "<chatId>",
                count: 20,
                direction: "after",
                onlyGroups: false,
                onlyUsers: false,
                onlyWithUnreadMessage: false,
                withLabels: []
              }
            },
            "All chats": {
              value: {
              }
            },
            "Chats group": {
              value: {
                onlyGroups: true,
              }
            },
            "Only with unread messages": {
              value: {
                onlyWithUnreadMessage: false,
              }
            },
            "Paginated results": {
              value: {
                id: "<chatId>",
                count: 20,
                direction: "after",
              }
            },
          }
        }
      }
     }
   */
  try {
    const {
      id,
      count,
      direction,
      onlyGroups,
      onlyUsers,
      onlyWithUnreadMessage,
      withLabels
    } = req.body;

    const response = await req.client.listChats({
      id: id,
      count: count,
      direction: direction,
      onlyGroups: onlyGroups,
      onlyUsers: onlyUsers,
      onlyWithUnreadMessage: onlyWithUnreadMessage,
      withLabels: withLabels
    });

    res.status(200).json(response);
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on get all chats' });
  }
}

async function getAllChatsWithMessages(req, res) {
  /**
   * #swagger.tags = ["Chat"]
   * #swagger.summary = 'Deprecated in favor of list-chats'
   * #swagger.deprecated = true
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const response = await req.client.listChats();
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get all chats whit messages',
      error: e
    });
  }
}
/**
 * Depreciado em favor de getMessages
 */
async function getAllMessagesInChat(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999'
     }
     #swagger.parameters["isGroup"] = {
      schema: 'false'
     }
     #swagger.parameters["includeMe"] = {
      schema: 'true'
     }
     #swagger.parameters["includeNotifications"] = {
      schema: 'true'
     }
   */
  try {
    const { phone } = req.params;
    const {
      isGroup = false,
      includeMe = true,
      includeNotifications = true
    } = req.query;

    let response;
    for (const contato of (0, _functions.contactToArray)(phone, isGroup)) {
      response = await req.client.getAllMessagesInChat(
        contato,
        includeMe,
        includeNotifications
      );
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get all messages in chat',
      error: e
    });
  }
}

async function getAllNewMessages(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const response = await req.client.getAllNewMessages();
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get all messages in chat',
      error: e
    });
  }
}

async function getAllUnreadMessages(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const response = await req.client.getAllUnreadMessages();
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get all messages in chat',
      error: e
    });
  }
}

async function getChatById(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999'
     }
     #swagger.parameters["isGroup"] = {
      schema: 'false'
     }
   */
  const { phone } = req.params;
  const { isGroup } = req.query;

  try {
    let result = {};
    if (isGroup) {
      result = await req.client.getChatById(`${phone}@g.us`);
    } else {
      result = await req.client.getChatById(`${phone}@c.us`);
    }

    res.status(200).json(result);
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error changing chat by Id',
      error: e
    });
  }
}

async function getMessageById(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["messageId"] = {
      required: true,
      schema: '<message_id>'
     }
   */
  const session = req.session;
  const { messageId } = req.params;

  try {
    const result = await req.client.getMessageById(messageId);

    returnSucess(res, session, result.chatId.user, result);
  } catch (error) {
    returnError(req, res, session, error);
  }
}

async function getBatteryLevel(req, res) {
  /**
   * #swagger.tags = ["Misc"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const response = await req.client.getBatteryLevel();
    res.status(200).json({ status: 'Success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving battery status',
      error: e
    });
  }
}

async function getHostDevice(req, res) {
  /**
   * #swagger.tags = ["Misc"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const response = await req.client.getHostDevice();
    const phoneNumber = await req.client.getWid();
    res.status(200).json({
      status: 'success',
      response: { ...response, phoneNumber },
      mapper: 'device'
    });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao recuperar dados do telefone',
      error: e
    });
  }
}

async function getPhoneNumber(req, res) {
  /**
   * #swagger.tags = ["Misc"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const phoneNumber = await req.client.getWid();
    res.
    status(200).
    json({ status: 'success', response: phoneNumber, mapper: 'device' });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving phone number',
      error: e
    });
  }
}

async function getBlockList(req, res) {
  /**
   * #swagger.tags = ["Misc"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  const response = await req.client.getBlockList();

  try {
    const blocked = response.map((contato) => {
      return { phone: contato ? contato.split('@')[0] : '' };
    });

    res.status(200).json({ status: 'success', response: blocked });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving blocked contact list',
      error: e
    });
  }
}

async function deleteChat(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: false,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              phone: { type: "string" },
              isGroup: { type: "boolean" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
              }
            },
          }
        }
      }
     }
   */
  const { phone } = req.body;
  const session = req.session;

  try {
    const results = {};
    for (const contato of phone) {
      results[contato] = await req.client.deleteChat(contato);
    }
    returnSucess(res, session, phone, results);
  } catch (error) {
    returnError(req, res, session, error);
  }
}
async function deleteAllChats(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const chats = await req.client.getAllChats();
    for (const chat of chats) {
      await req.client.deleteChat(chat.chatId);
    }
    res.status(200).json({ status: 'success' });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on delete all chats',
      error: error
    });
  }
}

async function clearChat(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     
     #swagger.requestBody = {
      required: false,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              phone: { type: "string" },
              isGroup: { type: "boolean" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
              }
            },
          }
        }
      }
     }
   */
  const { phone } = req.body;
  const session = req.session;

  try {
    const results = {};
    for (const contato of phone) {
      results[contato] = await req.client.clearChat(contato);
    }
    returnSucess(res, session, phone, results);
  } catch (error) {
    returnError(req, res, session, error);
  }
}

async function clearAllChats(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const chats = await req.client.getAllChats();
    for (const chat of chats) {
      await req.client.clearChat(`${chat.chatId}`);
    }
    res.status(201).json({ status: 'success' });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on clear all chats', error: e });
  }
}

async function archiveChat(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     
     #swagger.requestBody = {
      required: false,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              phone: { type: "string" },
              isGroup: { type: "boolean" },
              value: { type: "boolean" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                value: true,
              }
            },
          }
        }
      }
     }
   */
  const { phone, value = true } = req.body;

  try {
    const response = await req.client.archiveChat(`${phone}`, value);
    res.status(201).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on archive chat', error: e });
  }
}

async function archiveAllChats(req, res) {
  /**
   * #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const chats = await req.client.getAllChats();
    for (const chat of chats) {
      await req.client.archiveChat(`${chat.chatId}`, true);
    }
    res.status(201).json({ status: 'success' });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on archive all chats',
      error: e
    });
  }
}

async function getAllChatsArchiveds(req, res) {
  /**
   * #swagger.tags = ["Chat"]
   * #swagger.description = 'Retrieves all archived chats.'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const chats = await req.client.getAllChats();
    const archived = [];
    for (const chat of chats) {
      if (chat.archive === true) {
        archived.push(chat);
      }
    }
    res.status(201).json(archived);
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on archive all chats',
      error: e
    });
  }
}
async function deleteMessage(req, res) {
  /**
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     
     #swagger.requestBody = {
      required: false,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              phone: { type: "string" },
              isGroup: { type: "boolean" },
              messageId: { type: "string" },
              onlyLocal: { type: "boolean" },
              deleteMediaInDevice: { type: "boolean" },
            }
          },
          examples: {
            "Delete message to all": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                messageId: "<messageId>",
                deleteMediaInDevice: true,
              }
            },
            "Delete message only me": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                messageId: "<messageId>",
              }
            },
          }
        }
      }
     }
   */
  const { phone, messageId, deleteMediaInDevice, onlyLocal } = req.body;

  try {
    const result = await req.client.deleteMessage(
      `${phone}`,
      messageId,
      onlyLocal,
      deleteMediaInDevice
    );
    if (result) {
      res.
      status(200).
      json({ status: 'success', response: { message: 'Message deleted' } });
    }
    res.status(401).json({
      status: 'error',
      response: { message: 'Error unknown on delete message' }
    });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on delete message', error: e });
  }
}
async function reactMessage(req, res) {
  /**
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: false,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              msgId: { type: "string" },
              reaction: { type: "string" },
            }
          },
          examples: {
            "Default": {
              value: {
                msgId: "<messageId>",
                reaction: "😜",
              }
            },
          }
        }
      }
     }
   */
  const { msgId, reaction } = req.body;

  try {
    await req.client.sendReactionToMessage(msgId, reaction);

    res.
    status(200).
    json({ status: 'success', response: { message: 'Reaction sended' } });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on send reaction to message',
      error: e
    });
  }
}

async function reply(req, res) {
  /**
   * #swagger.deprecated=true
     #swagger.tags = ["Messages"]
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
              messageid: { type: "string" },
              text: { type: "string" },
            }
          },
          examples: {
            "Default": {
              value: {
              phone: "5521999999999",
              isGroup: false,
              messageid: "<messageId>",
              text: "Text to reply",
              }
            },
          }
        }
      }
     }
   */
  const { phone, text, messageid } = req.body;

  try {
    const response = await req.client.reply(`${phone}@c.us`, text, messageid);
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error replying message', error: e });
  }
}

async function forwardMessages(req, res) {
  /**
     #swagger.tags = ["Messages"]
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
              messageId: { type: "string" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                messageId: "<messageId>",
              }
            },
          }
        }
      }
     }
   */
  const { phone, messageId, isGroup = false } = req.body;

  try {
    let response;

    if (!isGroup) {
      response = await req.client.forwardMessage(`${phone[0]}`, messageId);
    } else {
      response = await req.client.forwardMessage(`${phone[0]}`, messageId);
    }

    res.status(201).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error forwarding message', error: e });
  }
}

async function markUnseenMessage(req, res) {
  /**
     #swagger.tags = ["Messages"]
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
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
              }
            },
          }
        }
      }
     }
   */
  const { phone } = req.body;

  try {
    await req.client.markUnseenMessage(`${phone}`);
    res.
    status(200).
    json({ status: 'success', response: { message: 'unseen checked' } });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on mark unseen', error: e });
  }
}

async function blockContact(req, res) {
  /**
     #swagger.tags = ["Misc"]
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
            }
          },
          examples: {
            "Default": {
              value: {
              phone: "5521999999999",
              isGroup: false,
              }
            },
          }
        }
      }
     }
   */
  const { phone } = req.body;

  try {
    await req.client.blockContact(`${phone}`);
    res.
    status(200).
    json({ status: 'success', response: { message: 'Contact blocked' } });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on block contact', error: e });
  }
}

async function unblockContact(req, res) {
  /**
     #swagger.tags = ["Misc"]
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
            }
          },
          examples: {
            "Default": {
              value: {
              phone: "5521999999999",
              isGroup: false,
              }
            },
          }
        }
      }
     }
   */
  const { phone } = req.body;

  try {
    await req.client.unblockContact(`${phone}`);
    res.
    status(200).
    json({ status: 'success', response: { message: 'Contact UnBlocked' } });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on unlock contact', error: e });
  }
}

async function pinChat(req, res) {
  /**
     #swagger.tags = ["Chat"]
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
        $phone: '5521999999999',
        $isGroup: false,
        $state: true,
      }
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
              state: { type: "boolean" },
            }
          },
          examples: {
            "Default": {
              value: {
              phone: "5521999999999",
              state: true,
              }
            },
          }
        }
      }
     }
   */
  const { phone, state } = req.body;

  try {
    for (const contato of phone) {
      await req.client.pinChat(contato, state === 'true', false);
    }

    res.
    status(200).
    json({ status: 'success', response: { message: 'Chat fixed' } });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: e.text || 'Error on pin chat',
      error: e
    });
  }
}

async function setProfilePic(req, res) {
  /**
     #swagger.tags = ["Profile"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.consumes = ['multipart/form-data']  
      #swagger.parameters['file'] = {
          in: 'formData',
          type: 'file',
          required: 'true',
      }
   */
  if (!req.file)
  res.
  status(400).
  json({ status: 'Error', message: 'File parameter is required!' });

  try {
    const { path: pathFile } = req.file;

    await req.client.setProfilePic(pathFile);
    await (0, _functions.unlinkAsync)(pathFile);

    res.status(200).json({
      status: 'success',
      response: { message: 'Profile photo successfully changed' }
    });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error changing profile photo',
      error: e
    });
  }
}

async function getUnreadMessages(req, res) {
  /**
     #swagger.deprecated=true
     #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const response = await req.client.getUnreadMessages(false, false, true);
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', response: 'Error on open list', error: e });
  }
}

async function getChatIsOnline(req, res) {
  /**
     #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999',
     }
   */
  const { phone } = req.params;
  try {
    const response = await req.client.getChatIsOnline(`${phone}@c.us`);
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      response: 'Error on get chat is online',
      error: e
    });
  }
}

async function getLastSeen(req, res) {
  /**
     #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999',
     }
   */
  const { phone } = req.params;
  try {
    const response = await req.client.getLastSeen(`${phone}@c.us`);

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      response: 'Error on get chat last seen',
      error: error
    });
  }
}

async function getListMutes(req, res) {
  /**
     #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["type"] = {
      schema: 'all',
     }
   */
  const { type = 'all' } = req.params;
  try {
    const response = await req.client.getListMutes(type);

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      response: 'Error on get list mutes',
      error: error
    });
  }
}

async function loadAndGetAllMessagesInChat(req, res) {
  /**
     #swagger.deprecated=true
     #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999'
     }
     #swagger.parameters["includeMe"] = {
      schema: 'true'
     }
     #swagger.parameters["includeNotifications"] = {
      schema: 'false'
     }
   */
  const { phone, includeMe = true, includeNotifications = false } = req.params;
  try {
    const response = await req.client.loadAndGetAllMessagesInChat(
      `${phone}@c.us`,
      includeMe,
      includeNotifications
    );

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.
    status(500).
    json({ status: 'error', response: 'Error on open list', error: error });
  }
}
async function getMessages(req, res) {
  /**
     #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999@c.us'
     }
     #swagger.parameters["count"] = {
      schema: '20'
     }
     #swagger.parameters["direction"] = {
      schema: 'before'
     }
     #swagger.parameters["id"] = {
      schema: '<message_id_to_use_direction>'
     }
   */
  const { phone } = req.params;
  const { count = 20, direction = 'before', id = null } = req.query;
  try {
    const response = await req.client.getMessages(`${phone}`, {
      count: parseInt(count),
      direction: direction.toString(),
      id: id
    });
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.
    status(401).
    json({ status: 'error', response: 'Error on open list', error: e });
  }
}

async function sendContactVcard(req, res) {
  /**
     #swagger.tags = ["Messages"]
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
              name: { type: "string" },
              contactsId: { type: "array" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                name: 'Name of contact',
                contactsId: ['5521999999999'],
              }
            },
          }
        }
      }
     }
   */
  const { phone, contactsId, name = null, isGroup = false } = req.body;
  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, isGroup)) {
      response = await req.client.sendContactVcard(
        `${contato}`,
        contactsId,
        name
      );
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on send contact vcard',
      error: error
    });
  }
}

async function sendMute(req, res) {
  /**
     #swagger.tags = ["Chat"]
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
              time: { type: "number" },
              type: { type: "string" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                time: 1,
                type: 'hours',
              }
            },
          }
        }
      }
     }
   */
  const { phone, time, type = 'hours', isGroup = false } = req.body;

  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, isGroup)) {
      response = await req.client.sendMute(`${contato}`, time, type);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.
    status(500).
    json({ status: 'error', message: 'Error on send mute', error: error });
  }
}

async function sendSeen(req, res) {
  /**
     #swagger.tags = ["Chat"]
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
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
              }
            },
          }
        }
      }
     }
   */
  const { phone } = req.body;
  const session = req.session;

  try {
    const results = [];
    for (const contato of phone) {
      results.push(await req.client.sendSeen(contato));
    }
    returnSucess(res, session, phone, results);
  } catch (error) {
    returnError(req, res, session, error);
  }
}

async function setChatState(req, res) {
  /**
     #swagger.deprecated=true
     #swagger.tags = ["Chat"]
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
              chatstate: { type: "string" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                chatstate: "1",
              }
            },
          }
        }
      }
     }
   */
  const { phone, chatstate, isGroup = false } = req.body;

  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, isGroup)) {
      response = await req.client.setChatState(`${contato}`, chatstate);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on send chat state',
      error: error
    });
  }
}

async function setTemporaryMessages(req, res) {
  /**
     #swagger.tags = ["Messages"]
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
              value: { type: "boolean" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                value: true,
              }
            },
          }
        }
      }
     }
   */
  const { phone, value = true, isGroup = false } = req.body;

  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, isGroup)) {
      response = await req.client.setTemporaryMessages(`${contato}`, value);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on set temporary messages',
      error: error
    });
  }
}

async function setTyping(req, res) {
  /**
     #swagger.tags = ["Chat"]
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
              value: { type: "boolean" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                value: true,
              }
            },
          }
        }
      }
     }
   */
  const { phone, value = true, isGroup = false } = req.body;
  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, isGroup)) {
      if (value) response = await req.client.startTyping(contato);else
      response = await req.client.stopTyping(contato);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.
    status(500).
    json({ status: 'error', message: 'Error on set typing', error: error });
  }
}

async function setRecording(req, res) {
  /**
     #swagger.tags = ["Chat"]
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
              duration: { type: "number" },
              value: { type: "boolean" },
            }
          },
          examples: {
            "Default": {
              value: {
                phone: "5521999999999",
                isGroup: false,
                duration: 5,
                value: true,
              }
            },
          }
        }
      }
     }
   */
  const { phone, value = true, duration, isGroup = false } = req.body;
  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, isGroup)) {
      if (value) response = await req.client.startRecording(contato, duration);else
      response = await req.client.stopRecoring(contato);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on set recording',
      error: error
    });
  }
}

async function checkNumberStatus(req, res) {
  /**
     #swagger.tags = ["Misc"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999'
     }
   */
  const { phone } = req.params;
  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, false)) {
      response = await req.client.checkNumberStatus(`${contato}`);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on check number status',
      error: error
    });
  }
}

async function getContact(req, res) {
  /**
     #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999'
     }
   */
  const { phone = true } = req.params;
  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, false)) {
      response = await req.client.getContact(contato);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.
    status(500).
    json({ status: 'error', message: 'Error on get contact', error: error });
  }
}

async function getAllContacts(req, res) {
  /**
   * #swagger.tags = ["Contact"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const response = await req.client.getAllContacts();

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on get all constacts',
      error: error
    });
  }
}

async function getNumberProfile(req, res) {
  /**
     #swagger.deprecated=true
     #swagger.tags = ["Chat"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999'
     }
   */
  const { phone = true } = req.params;
  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, false)) {
      response = await req.client.getNumberProfile(contato);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on get number profile',
      error: error
    });
  }
}

async function getProfilePicFromServer(req, res) {
  /**
     #swagger.tags = ["Contact"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999'
     }
   */
  const { phone = true } = req.params;
  const { isGroup = false } = req.query;
  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, isGroup)) {
      response = await req.client.getProfilePicFromServer(contato);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on  get profile pic',
      error: error
    });
  }
}

async function getStatus(req, res) {
  /**
     #swagger.tags = ["Contact"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      schema: '5521999999999'
     }
   */
  const { phone = true } = req.params;
  try {
    let response;
    for (const contato of (0, _functions.contactToArray)(phone, false)) {
      response = await req.client.getStatus(contato);
    }
    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.
    status(500).
    json({ status: 'error', message: 'Error on  get status', error: error });
  }
}

async function setProfileStatus(req, res) {
  /**
     #swagger.tags = ["Profile"]
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
        $status: 'My new status',
      }
     }
     
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              status: { type: "string" },
            }
          },
          examples: {
            "Default": {
              value: {
                status: "My new status",
              }
            },
          }
        }
      }
     }
   */
  const { status } = req.body;
  try {
    const response = await req.client.setProfileStatus(status);

    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on set profile status' });
  }
}
async function rejectCall(req, res) {
  /**
     #swagger.tags = ["Misc"]
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
              callId: { type: "string" },
            }
          },
          examples: {
            "Default": {
              value: {
                callId: "<callid>",
              }
            },
          }
        }
      }
     }
   */
  const { callId } = req.body;
  try {
    const response = await req.client.rejectCall(callId);

    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error on rejectCall', error: e });
  }
}

async function starMessage(req, res) {
  /**
     #swagger.tags = ["Messages"]
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
              messageId: { type: "string" },
              star: { type: "boolean" },
            }
          },
          examples: {
            "Default": {
              value: {
                messageId: "5521999999999",
                star: true,
              }
            },
          }
        }
      }
     }
   */
  const { messageId, star = true } = req.body;
  try {
    const response = await req.client.starMessage(messageId, star);

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on  start message',
      error: error
    });
  }
}

async function getReactions(req, res) {
  /**
     #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["messageId"] = {
      schema: '<messageId>'
     }
   */
  const messageId = req.params.id;
  try {
    const response = await req.client.getReactions(messageId);

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on get reactions',
      error: error
    });
  }
}

async function getVotes(req, res) {
  /**
     #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["messageId"] = {
      schema: '<messageId>'
     }
   */
  const messageId = req.params.id;
  try {
    const response = await req.client.getVotes(messageId);

    res.status(200).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.
    status(500).
    json({ status: 'error', message: 'Error on get votes', error: error });
  }
}
async function chatWoot(req, res) {
  /**
     #swagger.tags = ["Misc"]
     #swagger.description = 'You can point your Chatwoot to this route so that it can perform functions.'
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
              event: { type: "string" },
              private: { type: "string" },
            }
          },
          examples: {
            "Default": {
              value: {
                messageId: "conversation_status_changed",
                private: "false",
              }
            },
          }
        }
      }
     }
   */
  const { session } = req.params;
  const client = _sessionUtil.clientsArray[session];
  if (client == null || client.status !== 'CONNECTED') return;
  try {
    if (await client.isConnected()) {
      const event = req.body.event;
      const is_private = req.body.private || req.body.is_private;

      if (
      event == 'conversation_status_changed' ||
      event == 'conversation_resolved' ||
      is_private)
      {
        return res.
        status(200).
        json({ status: 'success', message: 'Success on receive chatwoot' });
      }

      const {
        message_type,
        phone = req.body.conversation.meta.sender.phone_number.replace('+', ''),
        message = req.body.conversation.messages[0]
      } = req.body;

      if (event != 'message_created' && message_type != 'outgoing')
      return res.
      status(200).
      json({ status: 'success', message: 'Success on receive chatwoot' });
      for (const contato of (0, _functions.contactToArray)(phone, false)) {
        if (message_type == 'outgoing') {
          if (message.attachments) {
            const base_url = `${
            client.config.chatWoot.baseURL}/${
            message.attachments[0].data_url.substring(
              message.attachments[0].data_url.indexOf('/rails/') + 1
            )}`;

            // Check if attachments is Push-to-talk and send this
            if (message.attachments[0].file_type === 'audio') {
              await client.sendPtt(
                `${contato}`,
                base_url,
                'Voice Audio',
                message.content
              );
            } else {
              await client.sendFile(
                `${contato}`,
                base_url,
                'file',
                message.content
              );
            }
          } else {
            await client.sendText(contato, message.content);
          }
        }
      }
      res.
      status(200).
      json({ status: 'success', message: 'Success on  receive chatwoot' });
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({
      status: 'error',
      message: 'Error on  receive chatwoot',
      error: e
    });
  }
}
async function getPlatformFromMessage(req, res) {
  /**
   * #swagger.tags = ["Misc"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["messageId"] = {
      schema: '<messageId>'
     }
   */
  try {
    const result = await req.client.getPlatformFromMessage(
      req.params.messageId
    );
    res.status(200).json(result);
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get get platform from message',
      error: e
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZnVuY3Rpb25zIiwicmVxdWlyZSIsIl9zZXNzaW9uVXRpbCIsInJldHVyblN1Y2VzcyIsInJlcyIsInNlc3Npb24iLCJwaG9uZSIsImRhdGEiLCJzdGF0dXMiLCJqc29uIiwicmVzcG9uc2UiLCJtZXNzYWdlIiwiY29udGFjdCIsInJldHVybkVycm9yIiwicmVxIiwiZXJyb3IiLCJsb2dnZXIiLCJsb2ciLCJzZXRQcm9maWxlTmFtZSIsIm5hbWUiLCJib2R5IiwicmVzdWx0IiwiY2xpZW50Iiwic2hvd0FsbENvbnRhY3RzIiwiY29udGFjdHMiLCJnZXRBbGxDb250YWN0cyIsImdldEFsbENoYXRzIiwibWFwcGVyIiwiZSIsImxpc3RDaGF0cyIsImlkIiwiY291bnQiLCJkaXJlY3Rpb24iLCJvbmx5R3JvdXBzIiwib25seVVzZXJzIiwib25seVdpdGhVbnJlYWRNZXNzYWdlIiwid2l0aExhYmVscyIsImdldEFsbENoYXRzV2l0aE1lc3NhZ2VzIiwiZ2V0QWxsTWVzc2FnZXNJbkNoYXQiLCJwYXJhbXMiLCJpc0dyb3VwIiwiaW5jbHVkZU1lIiwiaW5jbHVkZU5vdGlmaWNhdGlvbnMiLCJxdWVyeSIsImNvbnRhdG8iLCJjb250YWN0VG9BcnJheSIsImdldEFsbE5ld01lc3NhZ2VzIiwiZ2V0QWxsVW5yZWFkTWVzc2FnZXMiLCJnZXRDaGF0QnlJZCIsImdldE1lc3NhZ2VCeUlkIiwibWVzc2FnZUlkIiwiY2hhdElkIiwidXNlciIsImdldEJhdHRlcnlMZXZlbCIsImdldEhvc3REZXZpY2UiLCJwaG9uZU51bWJlciIsImdldFdpZCIsImdldFBob25lTnVtYmVyIiwiZ2V0QmxvY2tMaXN0IiwiYmxvY2tlZCIsIm1hcCIsInNwbGl0IiwiZGVsZXRlQ2hhdCIsInJlc3VsdHMiLCJkZWxldGVBbGxDaGF0cyIsImNoYXRzIiwiY2hhdCIsImNsZWFyQ2hhdCIsImNsZWFyQWxsQ2hhdHMiLCJhcmNoaXZlQ2hhdCIsInZhbHVlIiwiYXJjaGl2ZUFsbENoYXRzIiwiZ2V0QWxsQ2hhdHNBcmNoaXZlZHMiLCJhcmNoaXZlZCIsImFyY2hpdmUiLCJwdXNoIiwiZGVsZXRlTWVzc2FnZSIsImRlbGV0ZU1lZGlhSW5EZXZpY2UiLCJvbmx5TG9jYWwiLCJyZWFjdE1lc3NhZ2UiLCJtc2dJZCIsInJlYWN0aW9uIiwic2VuZFJlYWN0aW9uVG9NZXNzYWdlIiwicmVwbHkiLCJ0ZXh0IiwibWVzc2FnZWlkIiwiZm9yd2FyZE1lc3NhZ2VzIiwiZm9yd2FyZE1lc3NhZ2UiLCJtYXJrVW5zZWVuTWVzc2FnZSIsImJsb2NrQ29udGFjdCIsInVuYmxvY2tDb250YWN0IiwicGluQ2hhdCIsInN0YXRlIiwic2V0UHJvZmlsZVBpYyIsImZpbGUiLCJwYXRoIiwicGF0aEZpbGUiLCJ1bmxpbmtBc3luYyIsImdldFVucmVhZE1lc3NhZ2VzIiwiZ2V0Q2hhdElzT25saW5lIiwiZ2V0TGFzdFNlZW4iLCJnZXRMaXN0TXV0ZXMiLCJ0eXBlIiwibG9hZEFuZEdldEFsbE1lc3NhZ2VzSW5DaGF0IiwiZ2V0TWVzc2FnZXMiLCJwYXJzZUludCIsInRvU3RyaW5nIiwic2VuZENvbnRhY3RWY2FyZCIsImNvbnRhY3RzSWQiLCJzZW5kTXV0ZSIsInRpbWUiLCJzZW5kU2VlbiIsInNldENoYXRTdGF0ZSIsImNoYXRzdGF0ZSIsInNldFRlbXBvcmFyeU1lc3NhZ2VzIiwic2V0VHlwaW5nIiwic3RhcnRUeXBpbmciLCJzdG9wVHlwaW5nIiwic2V0UmVjb3JkaW5nIiwiZHVyYXRpb24iLCJzdGFydFJlY29yZGluZyIsInN0b3BSZWNvcmluZyIsImNoZWNrTnVtYmVyU3RhdHVzIiwiZ2V0Q29udGFjdCIsImdldE51bWJlclByb2ZpbGUiLCJnZXRQcm9maWxlUGljRnJvbVNlcnZlciIsImdldFN0YXR1cyIsInNldFByb2ZpbGVTdGF0dXMiLCJyZWplY3RDYWxsIiwiY2FsbElkIiwic3Rhck1lc3NhZ2UiLCJzdGFyIiwiZ2V0UmVhY3Rpb25zIiwiZ2V0Vm90ZXMiLCJjaGF0V29vdCIsImNsaWVudHNBcnJheSIsImlzQ29ubmVjdGVkIiwiZXZlbnQiLCJpc19wcml2YXRlIiwicHJpdmF0ZSIsIm1lc3NhZ2VfdHlwZSIsImNvbnZlcnNhdGlvbiIsIm1ldGEiLCJzZW5kZXIiLCJwaG9uZV9udW1iZXIiLCJyZXBsYWNlIiwibWVzc2FnZXMiLCJhdHRhY2htZW50cyIsImJhc2VfdXJsIiwiY29uZmlnIiwiYmFzZVVSTCIsImRhdGFfdXJsIiwic3Vic3RyaW5nIiwiaW5kZXhPZiIsImZpbGVfdHlwZSIsInNlbmRQdHQiLCJjb250ZW50Iiwic2VuZEZpbGUiLCJzZW5kVGV4dCIsImNvbnNvbGUiLCJnZXRQbGF0Zm9ybUZyb21NZXNzYWdlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXIvZGV2aWNlQ29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBDb3B5cmlnaHQgMjAyMSBXUFBDb25uZWN0IFRlYW1cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqL1xyXG5pbXBvcnQgeyBDaGF0IH0gZnJvbSAnQHdwcGNvbm5lY3QtdGVhbS93cHBjb25uZWN0JztcclxuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuXHJcbmltcG9ydCB7IGNvbnRhY3RUb0FycmF5LCB1bmxpbmtBc3luYyB9IGZyb20gJy4uL3V0aWwvZnVuY3Rpb25zJztcclxuaW1wb3J0IHsgY2xpZW50c0FycmF5IH0gZnJvbSAnLi4vdXRpbC9zZXNzaW9uVXRpbCc7XHJcblxyXG5mdW5jdGlvbiByZXR1cm5TdWNlc3MocmVzOiBhbnksIHNlc3Npb246IGFueSwgcGhvbmU6IGFueSwgZGF0YTogYW55KSB7XHJcbiAgcmVzLnN0YXR1cygyMDEpLmpzb24oe1xyXG4gICAgc3RhdHVzOiAnU3VjY2VzcycsXHJcbiAgICByZXNwb25zZToge1xyXG4gICAgICBtZXNzYWdlOiAnSW5mb3JtYXRpb24gcmV0cmlldmVkIHN1Y2Nlc3NmdWxseS4nLFxyXG4gICAgICBjb250YWN0OiBwaG9uZSxcclxuICAgICAgc2Vzc2lvbjogc2Vzc2lvbixcclxuICAgICAgZGF0YTogZGF0YSxcclxuICAgIH0sXHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJldHVybkVycm9yKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgc2Vzc2lvbjogYW55LCBlcnJvcjogYW55KSB7XHJcbiAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgcmVzLnN0YXR1cyg0MDApLmpzb24oe1xyXG4gICAgc3RhdHVzOiAnRXJyb3InLFxyXG4gICAgcmVzcG9uc2U6IHtcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIHJldHJpZXZpbmcgaW5mb3JtYXRpb24nLFxyXG4gICAgICBzZXNzaW9uOiBzZXNzaW9uLFxyXG4gICAgICBsb2c6IGVycm9yLFxyXG4gICAgfSxcclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFByb2ZpbGVOYW1lKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJQcm9maWxlXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBuYW1lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiTXkgbmV3IG5hbWVcIixcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgbmFtZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIGlmICghbmFtZSlcclxuICAgIHJlc1xyXG4gICAgICAuc3RhdHVzKDQwMClcclxuICAgICAgLmpzb24oeyBzdGF0dXM6ICdlcnJvcicsIG1lc3NhZ2U6ICdQYXJhbWV0ZXIgbmFtZSBpcyByZXF1aXJlZCEnIH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVxLmNsaWVudC5zZXRQcm9maWxlTmFtZShuYW1lKTtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXN1bHQgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBzZXQgcHJvZmlsZSBuYW1lLicsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNob3dBbGxDb250YWN0cyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ29udGFjdHNcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjb250YWN0cyA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0QWxsQ29udGFjdHMoKTtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiBjb250YWN0cyB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIGZldGNoaW5nIGNvbnRhY3RzJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsQ2hhdHMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgKiAjc3dhZ2dlci5zdW1tYXJ5ID0gJ0RlcHJlY2F0ZWQgaW4gZmF2b3Igb2YgJ2xpc3QtY2hhdHMnXHJcbiAgICogI3N3YWdnZXIuZGVwcmVjYXRlZCA9IHRydWVcclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0QWxsQ2hhdHMoKTtcclxuICAgIHJlc1xyXG4gICAgICAuc3RhdHVzKDIwMClcclxuICAgICAgLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlLCBtYXBwZXI6ICdjaGF0JyB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoNTAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ2Vycm9yJywgbWVzc2FnZTogJ0Vycm9yIG9uIGdldCBhbGwgY2hhdHMnIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3RDaGF0cyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2hhdFwiXVxyXG4gICAqICNzd2FnZ2VyLnN1bW1hcnkgPSAnUmV0cmlldmUgYSBsaXN0IG9mIGNoYXRzJ1xyXG4gICAqICNzd2FnZ2VyLmRlc2NyaXB0aW9uID0gJ1RoaXMgYm9keSBpcyBub3QgcmVxdWlyZWQuIE5vdCBzZW50IGJvZHkgdG8gZ2V0IGFsbCBjaGF0cyBvciBmaWx0ZXIuJ1xyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogZmFsc2UsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIGlkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBjb3VudDogeyB0eXBlOiBcIm51bWJlclwiIH0sXHJcbiAgICAgICAgICAgICAgZGlyZWN0aW9uOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBvbmx5R3JvdXBzOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgb25seVVzZXJzOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgb25seVdpdGhVbnJlYWRNZXNzYWdlOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgd2l0aExhYmVsczogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiQWxsIG9wdGlvbnMgLSBFZGl0IHRoaXNcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBpZDogXCI8Y2hhdElkPlwiLFxyXG4gICAgICAgICAgICAgICAgY291bnQ6IDIwLFxyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBcImFmdGVyXCIsXHJcbiAgICAgICAgICAgICAgICBvbmx5R3JvdXBzOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG9ubHlVc2VyczogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBvbmx5V2l0aFVucmVhZE1lc3NhZ2U6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgd2l0aExhYmVsczogW11cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiQWxsIGNoYXRzXCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJDaGF0cyBncm91cFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIG9ubHlHcm91cHM6IHRydWUsXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIk9ubHkgd2l0aCB1bnJlYWQgbWVzc2FnZXNcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBvbmx5V2l0aFVucmVhZE1lc3NhZ2U6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJQYWdpbmF0ZWQgcmVzdWx0c1wiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIGlkOiBcIjxjaGF0SWQ+XCIsXHJcbiAgICAgICAgICAgICAgICBjb3VudDogMjAsXHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IFwiYWZ0ZXJcIixcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7XHJcbiAgICAgIGlkLFxyXG4gICAgICBjb3VudCxcclxuICAgICAgZGlyZWN0aW9uLFxyXG4gICAgICBvbmx5R3JvdXBzLFxyXG4gICAgICBvbmx5VXNlcnMsXHJcbiAgICAgIG9ubHlXaXRoVW5yZWFkTWVzc2FnZSxcclxuICAgICAgd2l0aExhYmVscyxcclxuICAgIH0gPSByZXEuYm9keTtcclxuXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQubGlzdENoYXRzKHtcclxuICAgICAgaWQ6IGlkLFxyXG4gICAgICBjb3VudDogY291bnQsXHJcbiAgICAgIGRpcmVjdGlvbjogZGlyZWN0aW9uLFxyXG4gICAgICBvbmx5R3JvdXBzOiBvbmx5R3JvdXBzLFxyXG4gICAgICBvbmx5VXNlcnM6IG9ubHlVc2VycyxcclxuICAgICAgb25seVdpdGhVbnJlYWRNZXNzYWdlOiBvbmx5V2l0aFVucmVhZE1lc3NhZ2UsXHJcbiAgICAgIHdpdGhMYWJlbHM6IHdpdGhMYWJlbHMsXHJcbiAgICB9KTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlc1xyXG4gICAgICAuc3RhdHVzKDUwMClcclxuICAgICAgLmpzb24oeyBzdGF0dXM6ICdlcnJvcicsIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgYWxsIGNoYXRzJyB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGxDaGF0c1dpdGhNZXNzYWdlcyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2hhdFwiXVxyXG4gICAqICNzd2FnZ2VyLnN1bW1hcnkgPSAnRGVwcmVjYXRlZCBpbiBmYXZvciBvZiBsaXN0LWNoYXRzJ1xyXG4gICAqICNzd2FnZ2VyLmRlcHJlY2F0ZWQgPSB0cnVlXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50Lmxpc3RDaGF0cygpO1xyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGdldCBhbGwgY2hhdHMgd2hpdCBtZXNzYWdlcycsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbi8qKlxyXG4gKiBEZXByZWNpYWRvIGVtIGZhdm9yIGRlIGdldE1lc3NhZ2VzXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsTWVzc2FnZXNJbkNoYXQocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJwaG9uZVwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnNTUyMTk5OTk5OTk5OSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcImlzR3JvdXBcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ2ZhbHNlJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wiaW5jbHVkZU1lXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICd0cnVlJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wiaW5jbHVkZU5vdGlmaWNhdGlvbnNcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ3RydWUnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IHBob25lIH0gPSByZXEucGFyYW1zO1xyXG4gICAgY29uc3Qge1xyXG4gICAgICBpc0dyb3VwID0gZmFsc2UsXHJcbiAgICAgIGluY2x1ZGVNZSA9IHRydWUsXHJcbiAgICAgIGluY2x1ZGVOb3RpZmljYXRpb25zID0gdHJ1ZSxcclxuICAgIH0gPSByZXEucXVlcnk7XHJcblxyXG4gICAgbGV0IHJlc3BvbnNlO1xyXG4gICAgZm9yIChjb25zdCBjb250YXRvIG9mIGNvbnRhY3RUb0FycmF5KHBob25lLCBpc0dyb3VwIGFzIGJvb2xlYW4pKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRBbGxNZXNzYWdlc0luQ2hhdChcclxuICAgICAgICBjb250YXRvLFxyXG4gICAgICAgIGluY2x1ZGVNZSBhcyBib29sZWFuLFxyXG4gICAgICAgIGluY2x1ZGVOb3RpZmljYXRpb25zIGFzIGJvb2xlYW5cclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gZ2V0IGFsbCBtZXNzYWdlcyBpbiBjaGF0JyxcclxuICAgICAgZXJyb3I6IGUsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGxOZXdNZXNzYWdlcyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2hhdFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICovXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRBbGxOZXdNZXNzYWdlcygpO1xyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGdldCBhbGwgbWVzc2FnZXMgaW4gY2hhdCcsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsVW5yZWFkTWVzc2FnZXMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0QWxsVW5yZWFkTWVzc2FnZXMoKTtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgYWxsIG1lc3NhZ2VzIGluIGNoYXQnLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENoYXRCeUlkKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJDaGF0XCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wicGhvbmVcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJzU1MjE5OTk5OTk5OTknXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJpc0dyb3VwXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdmYWxzZSdcclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSB9ID0gcmVxLnBhcmFtcztcclxuICBjb25zdCB7IGlzR3JvdXAgfSA9IHJlcS5xdWVyeTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGxldCByZXN1bHQgPSB7fSBhcyBDaGF0O1xyXG4gICAgaWYgKGlzR3JvdXApIHtcclxuICAgICAgcmVzdWx0ID0gYXdhaXQgcmVxLmNsaWVudC5nZXRDaGF0QnlJZChgJHtwaG9uZX1AZy51c2ApO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzdWx0ID0gYXdhaXQgcmVxLmNsaWVudC5nZXRDaGF0QnlJZChgJHtwaG9uZX1AYy51c2ApO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3VsdCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3IgY2hhbmdpbmcgY2hhdCBieSBJZCcsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TWVzc2FnZUJ5SWQocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJtZXNzYWdlSWRcIl0gPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBzY2hlbWE6ICc8bWVzc2FnZV9pZD4nXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHNlc3Npb24gPSByZXEuc2Vzc2lvbjtcclxuICBjb25zdCB7IG1lc3NhZ2VJZCB9ID0gcmVxLnBhcmFtcztcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0TWVzc2FnZUJ5SWQobWVzc2FnZUlkKTtcclxuXHJcbiAgICByZXR1cm5TdWNlc3MocmVzLCBzZXNzaW9uLCAocmVzdWx0IGFzIGFueSkuY2hhdElkLnVzZXIsIHJlc3VsdCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybkVycm9yKHJlcSwgcmVzLCBzZXNzaW9uLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QmF0dGVyeUxldmVsKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJNaXNjXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmdldEJhdHRlcnlMZXZlbCgpO1xyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdTdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIHJldHJpZXZpbmcgYmF0dGVyeSBzdGF0dXMnLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEhvc3REZXZpY2UocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1pc2NcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0SG9zdERldmljZSgpO1xyXG4gICAgY29uc3QgcGhvbmVOdW1iZXIgPSBhd2FpdCByZXEuY2xpZW50LmdldFdpZCgpO1xyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdzdWNjZXNzJyxcclxuICAgICAgcmVzcG9uc2U6IHsgLi4ucmVzcG9uc2UsIHBob25lTnVtYmVyIH0sXHJcbiAgICAgIG1hcHBlcjogJ2RldmljZScsXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvIGFvIHJlY3VwZXJhciBkYWRvcyBkbyB0ZWxlZm9uZScsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UGhvbmVOdW1iZXIocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1pc2NcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBwaG9uZU51bWJlciA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0V2lkKCk7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cygyMDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiBwaG9uZU51bWJlciwgbWFwcGVyOiAnZGV2aWNlJyB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciByZXRyaWV2aW5nIHBob25lIG51bWJlcicsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QmxvY2tMaXN0KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJNaXNjXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0QmxvY2tMaXN0KCk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBibG9ja2VkID0gcmVzcG9uc2UubWFwKChjb250YXRvOiBhbnkpID0+IHtcclxuICAgICAgcmV0dXJuIHsgcGhvbmU6IGNvbnRhdG8gPyBjb250YXRvLnNwbGl0KCdAJylbMF0gOiAnJyB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IGJsb2NrZWQgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3IgcmV0cmlldmluZyBibG9ja2VkIGNvbnRhY3QgbGlzdCcsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQ2hhdChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2hhdFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiBmYWxzZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgcGhvbmU6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgIGlzR3JvdXA6IHsgdHlwZTogXCJib29sZWFuXCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiBcIjU1MjE5OTk5OTk5OTlcIixcclxuICAgICAgICAgICAgICAgIGlzR3JvdXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSB9ID0gcmVxLmJvZHk7XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IHJlcS5zZXNzaW9uO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0czogYW55ID0ge307XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgcGhvbmUpIHtcclxuICAgICAgcmVzdWx0c1tjb250YXRvXSA9IGF3YWl0IHJlcS5jbGllbnQuZGVsZXRlQ2hhdChjb250YXRvKTtcclxuICAgIH1cclxuICAgIHJldHVyblN1Y2VzcyhyZXMsIHNlc3Npb24sIHBob25lLCByZXN1bHRzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuRXJyb3IocmVxLCByZXMsIHNlc3Npb24sIGVycm9yKTtcclxuICB9XHJcbn1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUFsbENoYXRzKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJDaGF0XCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgY29uc3QgY2hhdHMgPSBhd2FpdCByZXEuY2xpZW50LmdldEFsbENoYXRzKCk7XHJcbiAgICBmb3IgKGNvbnN0IGNoYXQgb2YgY2hhdHMpIHtcclxuICAgICAgYXdhaXQgcmVxLmNsaWVudC5kZWxldGVDaGF0KChjaGF0IGFzIGFueSkuY2hhdElkKTtcclxuICAgIH1cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBkZWxldGUgYWxsIGNoYXRzJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJDaGF0KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJDaGF0XCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICBcclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBwaG9uZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgaXNHcm91cDogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgcGhvbmU6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgICAgaXNHcm91cDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lIH0gPSByZXEuYm9keTtcclxuICBjb25zdCBzZXNzaW9uID0gcmVxLnNlc3Npb247XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHRzOiBhbnkgPSB7fTtcclxuICAgIGZvciAoY29uc3QgY29udGF0byBvZiBwaG9uZSkge1xyXG4gICAgICByZXN1bHRzW2NvbnRhdG9dID0gYXdhaXQgcmVxLmNsaWVudC5jbGVhckNoYXQoY29udGF0byk7XHJcbiAgICB9XHJcbiAgICByZXR1cm5TdWNlc3MocmVzLCBzZXNzaW9uLCBwaG9uZSwgcmVzdWx0cyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybkVycm9yKHJlcSwgcmVzLCBzZXNzaW9uLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2xlYXJBbGxDaGF0cyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2hhdFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICovXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGNoYXRzID0gYXdhaXQgcmVxLmNsaWVudC5nZXRBbGxDaGF0cygpO1xyXG4gICAgZm9yIChjb25zdCBjaGF0IG9mIGNoYXRzKSB7XHJcbiAgICAgIGF3YWl0IHJlcS5jbGllbnQuY2xlYXJDaGF0KGAkeyhjaGF0IGFzIGFueSkuY2hhdElkfWApO1xyXG4gICAgfVxyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJyB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoNTAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ2Vycm9yJywgbWVzc2FnZTogJ0Vycm9yIG9uIGNsZWFyIGFsbCBjaGF0cycsIGVycm9yOiBlIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFyY2hpdmVDaGF0KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJDaGF0XCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICBcclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBwaG9uZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgaXNHcm91cDogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgIHZhbHVlOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgICBpc0dyb3VwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSwgdmFsdWUgPSB0cnVlIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5hcmNoaXZlQ2hhdChgJHtwaG9uZX1gLCB2YWx1ZSk7XHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlc1xyXG4gICAgICAuc3RhdHVzKDUwMClcclxuICAgICAgLmpzb24oeyBzdGF0dXM6ICdlcnJvcicsIG1lc3NhZ2U6ICdFcnJvciBvbiBhcmNoaXZlIGNoYXQnLCBlcnJvcjogZSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhcmNoaXZlQWxsQ2hhdHMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjaGF0cyA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0QWxsQ2hhdHMoKTtcclxuICAgIGZvciAoY29uc3QgY2hhdCBvZiBjaGF0cykge1xyXG4gICAgICBhd2FpdCByZXEuY2xpZW50LmFyY2hpdmVDaGF0KGAkeyhjaGF0IGFzIGFueSkuY2hhdElkfWAsIHRydWUpO1xyXG4gICAgfVxyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJyB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBhcmNoaXZlIGFsbCBjaGF0cycsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsQ2hhdHNBcmNoaXZlZHMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgKiAjc3dhZ2dlci5kZXNjcmlwdGlvbiA9ICdSZXRyaWV2ZXMgYWxsIGFyY2hpdmVkIGNoYXRzLidcclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBjaGF0cyA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0QWxsQ2hhdHMoKTtcclxuICAgIGNvbnN0IGFyY2hpdmVkID0gW10gYXMgYW55O1xyXG4gICAgZm9yIChjb25zdCBjaGF0IG9mIGNoYXRzKSB7XHJcbiAgICAgIGlmIChjaGF0LmFyY2hpdmUgPT09IHRydWUpIHtcclxuICAgICAgICBhcmNoaXZlZC5wdXNoKGNoYXQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbihhcmNoaXZlZCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gYXJjaGl2ZSBhbGwgY2hhdHMnLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlTWVzc2FnZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgIFxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogZmFsc2UsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgbWVzc2FnZUlkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBvbmx5TG9jYWw6IHsgdHlwZTogXCJib29sZWFuXCIgfSxcclxuICAgICAgICAgICAgICBkZWxldGVNZWRpYUluRGV2aWNlOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlbGV0ZSBtZXNzYWdlIHRvIGFsbFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiBcIjU1MjE5OTk5OTk5OTlcIixcclxuICAgICAgICAgICAgICAgIGlzR3JvdXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZUlkOiBcIjxtZXNzYWdlSWQ+XCIsXHJcbiAgICAgICAgICAgICAgICBkZWxldGVNZWRpYUluRGV2aWNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJEZWxldGUgbWVzc2FnZSBvbmx5IG1lXCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgcGhvbmU6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgICAgaXNHcm91cDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlSWQ6IFwiPG1lc3NhZ2VJZD5cIixcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUsIG1lc3NhZ2VJZCwgZGVsZXRlTWVkaWFJbkRldmljZSwgb25seUxvY2FsIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlcS5jbGllbnQuZGVsZXRlTWVzc2FnZShcclxuICAgICAgYCR7cGhvbmV9YCxcclxuICAgICAgbWVzc2FnZUlkLFxyXG4gICAgICBvbmx5TG9jYWwsXHJcbiAgICAgIGRlbGV0ZU1lZGlhSW5EZXZpY2VcclxuICAgICk7XHJcbiAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgIHJlc1xyXG4gICAgICAgIC5zdGF0dXMoMjAwKVxyXG4gICAgICAgIC5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiB7IG1lc3NhZ2U6ICdNZXNzYWdlIGRlbGV0ZWQnIH0gfSk7XHJcbiAgICB9XHJcbiAgICByZXMuc3RhdHVzKDQwMSkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgcmVzcG9uc2U6IHsgbWVzc2FnZTogJ0Vycm9yIHVua25vd24gb24gZGVsZXRlIG1lc3NhZ2UnIH0sXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoNTAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ2Vycm9yJywgbWVzc2FnZTogJ0Vycm9yIG9uIGRlbGV0ZSBtZXNzYWdlJywgZXJyb3I6IGUgfSk7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFjdE1lc3NhZ2UocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IGZhbHNlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBtc2dJZDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgcmVhY3Rpb246IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgbXNnSWQ6IFwiPG1lc3NhZ2VJZD5cIixcclxuICAgICAgICAgICAgICAgIHJlYWN0aW9uOiBcIvCfmJxcIixcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgbXNnSWQsIHJlYWN0aW9uIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHJlcS5jbGllbnQuc2VuZFJlYWN0aW9uVG9NZXNzYWdlKG1zZ0lkLCByZWFjdGlvbik7XHJcblxyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoMjAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogeyBtZXNzYWdlOiAnUmVhY3Rpb24gc2VuZGVkJyB9IH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIHNlbmQgcmVhY3Rpb24gdG8gbWVzc2FnZScsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVwbHkocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIuZGVwcmVjYXRlZD10cnVlXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgbWVzc2FnZWlkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICB0ZXh0OiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICBwaG9uZTogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgaXNHcm91cDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgbWVzc2FnZWlkOiBcIjxtZXNzYWdlSWQ+XCIsXHJcbiAgICAgICAgICAgICAgdGV4dDogXCJUZXh0IHRvIHJlcGx5XCIsXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lLCB0ZXh0LCBtZXNzYWdlaWQgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LnJlcGx5KGAke3Bob25lfUBjLnVzYCwgdGV4dCwgbWVzc2FnZWlkKTtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoNTAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ2Vycm9yJywgbWVzc2FnZTogJ0Vycm9yIHJlcGx5aW5nIG1lc3NhZ2UnLCBlcnJvcjogZSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmb3J3YXJkTWVzc2FnZXMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgbWVzc2FnZUlkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiBcIjU1MjE5OTk5OTk5OTlcIixcclxuICAgICAgICAgICAgICAgIGlzR3JvdXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZUlkOiBcIjxtZXNzYWdlSWQ+XCIsXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lLCBtZXNzYWdlSWQsIGlzR3JvdXAgPSBmYWxzZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2U7XHJcblxyXG4gICAgaWYgKCFpc0dyb3VwKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5mb3J3YXJkTWVzc2FnZShgJHtwaG9uZVswXX1gLCBtZXNzYWdlSWQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmZvcndhcmRNZXNzYWdlKGAke3Bob25lWzBdfWAsIG1lc3NhZ2VJZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlOiAnRXJyb3IgZm9yd2FyZGluZyBtZXNzYWdlJywgZXJyb3I6IGUgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFya1Vuc2Vlbk1lc3NhZ2UocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgICBpc0dyb3VwOiBmYWxzZSxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgYXdhaXQgcmVxLmNsaWVudC5tYXJrVW5zZWVuTWVzc2FnZShgJHtwaG9uZX1gKTtcclxuICAgIHJlc1xyXG4gICAgICAuc3RhdHVzKDIwMClcclxuICAgICAgLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHsgbWVzc2FnZTogJ3Vuc2VlbiBjaGVja2VkJyB9IH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlOiAnRXJyb3Igb24gbWFyayB1bnNlZW4nLCBlcnJvcjogZSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBibG9ja0NvbnRhY3QocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIk1pc2NcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgcGhvbmU6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgIGlzR3JvdXA6IHsgdHlwZTogXCJib29sZWFuXCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICBwaG9uZTogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgaXNHcm91cDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHJlcS5jbGllbnQuYmxvY2tDb250YWN0KGAke3Bob25lfWApO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoMjAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogeyBtZXNzYWdlOiAnQ29udGFjdCBibG9ja2VkJyB9IH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlOiAnRXJyb3Igb24gYmxvY2sgY29udGFjdCcsIGVycm9yOiBlIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHVuYmxvY2tDb250YWN0KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJNaXNjXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgcGhvbmU6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgIGlzR3JvdXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBhd2FpdCByZXEuY2xpZW50LnVuYmxvY2tDb250YWN0KGAke3Bob25lfWApO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoMjAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogeyBtZXNzYWdlOiAnQ29udGFjdCBVbkJsb2NrZWQnIH0gfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlc1xyXG4gICAgICAuc3RhdHVzKDUwMClcclxuICAgICAgLmpzb24oeyBzdGF0dXM6ICdlcnJvcicsIG1lc3NhZ2U6ICdFcnJvciBvbiB1bmxvY2sgY29udGFjdCcsIGVycm9yOiBlIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBpbkNoYXQocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJvYmpcIl0gPSB7XHJcbiAgICAgIGluOiAnYm9keScsXHJcbiAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICRwaG9uZTogJzU1MjE5OTk5OTk5OTknLFxyXG4gICAgICAgICRpc0dyb3VwOiBmYWxzZSxcclxuICAgICAgICAkc3RhdGU6IHRydWUsXHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBwaG9uZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgaXNHcm91cDogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgIHN0YXRlOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgcGhvbmU6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgIHN0YXRlOiB0cnVlLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSwgc3RhdGUgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgZm9yIChjb25zdCBjb250YXRvIG9mIHBob25lKSB7XHJcbiAgICAgIGF3YWl0IHJlcS5jbGllbnQucGluQ2hhdChjb250YXRvLCBzdGF0ZSA9PT0gJ3RydWUnLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoMjAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogeyBtZXNzYWdlOiAnQ2hhdCBmaXhlZCcgfSB9KTtcclxuICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogZS50ZXh0IHx8ICdFcnJvciBvbiBwaW4gY2hhdCcsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UHJvZmlsZVBpYyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiUHJvZmlsZVwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIuY29uc3VtZXMgPSBbJ211bHRpcGFydC9mb3JtLWRhdGEnXSAgXHJcbiAgICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbJ2ZpbGUnXSA9IHtcclxuICAgICAgICAgIGluOiAnZm9ybURhdGEnLFxyXG4gICAgICAgICAgdHlwZTogJ2ZpbGUnLFxyXG4gICAgICAgICAgcmVxdWlyZWQ6ICd0cnVlJyxcclxuICAgICAgfVxyXG4gICAqL1xyXG4gIGlmICghcmVxLmZpbGUpXHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg0MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnRXJyb3InLCBtZXNzYWdlOiAnRmlsZSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQhJyB9KTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgcGF0aDogcGF0aEZpbGUgfSA9IHJlcS5maWxlIGFzIGFueTtcclxuXHJcbiAgICBhd2FpdCByZXEuY2xpZW50LnNldFByb2ZpbGVQaWMocGF0aEZpbGUpO1xyXG4gICAgYXdhaXQgdW5saW5rQXN5bmMocGF0aEZpbGUpO1xyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnc3VjY2VzcycsXHJcbiAgICAgIHJlc3BvbnNlOiB7IG1lc3NhZ2U6ICdQcm9maWxlIHBob3RvIHN1Y2Nlc3NmdWxseSBjaGFuZ2VkJyB9LFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3IgY2hhbmdpbmcgcHJvZmlsZSBwaG90bycsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VW5yZWFkTWVzc2FnZXMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIuZGVwcmVjYXRlZD10cnVlXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmdldFVucmVhZE1lc3NhZ2VzKGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlc1xyXG4gICAgICAuc3RhdHVzKDUwMClcclxuICAgICAgLmpzb24oeyBzdGF0dXM6ICdlcnJvcicsIHJlc3BvbnNlOiAnRXJyb3Igb24gb3BlbiBsaXN0JywgZXJyb3I6IGUgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q2hhdElzT25saW5lKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJDaGF0XCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wicGhvbmVcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJzU1MjE5OTk5OTk5OTknLFxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lIH0gPSByZXEucGFyYW1zO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0Q2hhdElzT25saW5lKGAke3Bob25lfUBjLnVzYCk7XHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICByZXNwb25zZTogJ0Vycm9yIG9uIGdldCBjaGF0IGlzIG9ubGluZScsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0TGFzdFNlZW4ocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJwaG9uZVwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnNTUyMTk5OTk5OTk5OScsXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUgfSA9IHJlcS5wYXJhbXM7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRMYXN0U2VlbihgJHtwaG9uZX1AYy51c2ApO1xyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgcmVzcG9uc2U6ICdFcnJvciBvbiBnZXQgY2hhdCBsYXN0IHNlZW4nLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRMaXN0TXV0ZXMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJ0eXBlXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdhbGwnLFxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHR5cGUgPSAnYWxsJyB9ID0gcmVxLnBhcmFtcztcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmdldExpc3RNdXRlcyh0eXBlKTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIHJlc3BvbnNlOiAnRXJyb3Igb24gZ2V0IGxpc3QgbXV0ZXMnLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQW5kR2V0QWxsTWVzc2FnZXNJbkNoYXQocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIuZGVwcmVjYXRlZD10cnVlXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJwaG9uZVwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnNTUyMTk5OTk5OTk5OSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcImluY2x1ZGVNZVwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAndHJ1ZSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcImluY2x1ZGVOb3RpZmljYXRpb25zXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdmYWxzZSdcclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSwgaW5jbHVkZU1lID0gdHJ1ZSwgaW5jbHVkZU5vdGlmaWNhdGlvbnMgPSBmYWxzZSB9ID0gcmVxLnBhcmFtcztcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmxvYWRBbmRHZXRBbGxNZXNzYWdlc0luQ2hhdChcclxuICAgICAgYCR7cGhvbmV9QGMudXNgLFxyXG4gICAgICBpbmNsdWRlTWUgYXMgYm9vbGVhbixcclxuICAgICAgaW5jbHVkZU5vdGlmaWNhdGlvbnMgYXMgYm9vbGVhblxyXG4gICAgKTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoNTAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ2Vycm9yJywgcmVzcG9uc2U6ICdFcnJvciBvbiBvcGVuIGxpc3QnLCBlcnJvcjogZXJyb3IgfSk7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRNZXNzYWdlcyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJwaG9uZVwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnNTUyMTk5OTk5OTk5OUBjLnVzJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wiY291bnRcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJzIwJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wiZGlyZWN0aW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdiZWZvcmUnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJpZFwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnPG1lc3NhZ2VfaWRfdG9fdXNlX2RpcmVjdGlvbj4nXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUgfSA9IHJlcS5wYXJhbXM7XHJcbiAgY29uc3QgeyBjb3VudCA9IDIwLCBkaXJlY3Rpb24gPSAnYmVmb3JlJywgaWQgPSBudWxsIH0gPSByZXEucXVlcnk7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRNZXNzYWdlcyhgJHtwaG9uZX1gLCB7XHJcbiAgICAgIGNvdW50OiBwYXJzZUludChjb3VudCBhcyBzdHJpbmcpLFxyXG4gICAgICBkaXJlY3Rpb246IGRpcmVjdGlvbi50b1N0cmluZygpIGFzIGFueSxcclxuICAgICAgaWQ6IGlkIGFzIHN0cmluZyxcclxuICAgIH0pO1xyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg0MDEpXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnZXJyb3InLCByZXNwb25zZTogJ0Vycm9yIG9uIG9wZW4gbGlzdCcsIGVycm9yOiBlIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmRDb250YWN0VmNhcmQocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgbmFtZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgY29udGFjdHNJZDogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiBcIjU1MjE5OTk5OTk5OTlcIixcclxuICAgICAgICAgICAgICAgIGlzR3JvdXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogJ05hbWUgb2YgY29udGFjdCcsXHJcbiAgICAgICAgICAgICAgICBjb250YWN0c0lkOiBbJzU1MjE5OTk5OTk5OTknXSxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUsIGNvbnRhY3RzSWQsIG5hbWUgPSBudWxsLCBpc0dyb3VwID0gZmFsc2UgfSA9IHJlcS5ib2R5O1xyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgY29udGFjdFRvQXJyYXkocGhvbmUsIGlzR3JvdXApKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5zZW5kQ29udGFjdFZjYXJkKFxyXG4gICAgICAgIGAke2NvbnRhdG99YCxcclxuICAgICAgICBjb250YWN0c0lkLFxyXG4gICAgICAgIG5hbWVcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBzZW5kIGNvbnRhY3QgdmNhcmQnLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTXV0ZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiQ2hhdFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgdGltZTogeyB0eXBlOiBcIm51bWJlclwiIH0sXHJcbiAgICAgICAgICAgICAgdHlwZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgICBpc0dyb3VwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHRpbWU6IDEsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnaG91cnMnLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSwgdGltZSwgdHlwZSA9ICdob3VycycsIGlzR3JvdXAgPSBmYWxzZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgY29udGFjdFRvQXJyYXkocGhvbmUsIGlzR3JvdXApKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5zZW5kTXV0ZShgJHtjb250YXRvfWAsIHRpbWUsIHR5cGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlOiAnRXJyb3Igb24gc2VuZCBtdXRlJywgZXJyb3I6IGVycm9yIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmRTZWVuKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJDaGF0XCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgICBpc0dyb3VwOiBmYWxzZSxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUgfSA9IHJlcS5ib2R5O1xyXG4gIGNvbnN0IHNlc3Npb24gPSByZXEuc2Vzc2lvbjtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdHM6IGFueSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBjb250YXRvIG9mIHBob25lKSB7XHJcbiAgICAgIHJlc3VsdHMucHVzaChhd2FpdCByZXEuY2xpZW50LnNlbmRTZWVuKGNvbnRhdG8pKTtcclxuICAgIH1cclxuICAgIHJldHVyblN1Y2VzcyhyZXMsIHNlc3Npb24sIHBob25lLCByZXN1bHRzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuRXJyb3IocmVxLCByZXMsIHNlc3Npb24sIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRDaGF0U3RhdGUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIuZGVwcmVjYXRlZD10cnVlXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgcGhvbmU6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgIGlzR3JvdXA6IHsgdHlwZTogXCJib29sZWFuXCIgfSxcclxuICAgICAgICAgICAgICBjaGF0c3RhdGU6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgcGhvbmU6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgICAgaXNHcm91cDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjaGF0c3RhdGU6IFwiMVwiLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSwgY2hhdHN0YXRlLCBpc0dyb3VwID0gZmFsc2UgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgbGV0IHJlc3BvbnNlO1xyXG4gICAgZm9yIChjb25zdCBjb250YXRvIG9mIGNvbnRhY3RUb0FycmF5KHBob25lLCBpc0dyb3VwKSkge1xyXG4gICAgICByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuc2V0Q2hhdFN0YXRlKGAke2NvbnRhdG99YCwgY2hhdHN0YXRlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBzZW5kIGNoYXQgc3RhdGUnLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRUZW1wb3JhcnlNZXNzYWdlcyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgcGhvbmU6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgIGlzR3JvdXA6IHsgdHlwZTogXCJib29sZWFuXCIgfSxcclxuICAgICAgICAgICAgICB2YWx1ZTogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgcGhvbmU6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgICAgaXNHcm91cDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUsIHZhbHVlID0gdHJ1ZSwgaXNHcm91cCA9IGZhbHNlIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGxldCByZXNwb25zZTtcclxuICAgIGZvciAoY29uc3QgY29udGF0byBvZiBjb250YWN0VG9BcnJheShwaG9uZSwgaXNHcm91cCkpIHtcclxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LnNldFRlbXBvcmFyeU1lc3NhZ2VzKGAke2NvbnRhdG99YCwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIHNldCB0ZW1wb3JhcnkgbWVzc2FnZXMnLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRUeXBpbmcocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgcGhvbmU6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgIGlzR3JvdXA6IHsgdHlwZTogXCJib29sZWFuXCIgfSxcclxuICAgICAgICAgICAgICB2YWx1ZTogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgcGhvbmU6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgICAgaXNHcm91cDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUsIHZhbHVlID0gdHJ1ZSwgaXNHcm91cCA9IGZhbHNlIH0gPSByZXEuYm9keTtcclxuICB0cnkge1xyXG4gICAgbGV0IHJlc3BvbnNlO1xyXG4gICAgZm9yIChjb25zdCBjb250YXRvIG9mIGNvbnRhY3RUb0FycmF5KHBob25lLCBpc0dyb3VwKSkge1xyXG4gICAgICBpZiAodmFsdWUpIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5zdGFydFR5cGluZyhjb250YXRvKTtcclxuICAgICAgZWxzZSByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuc3RvcFR5cGluZyhjb250YXRvKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoNTAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ2Vycm9yJywgbWVzc2FnZTogJ0Vycm9yIG9uIHNldCB0eXBpbmcnLCBlcnJvcjogZXJyb3IgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UmVjb3JkaW5nKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJDaGF0XCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICBcclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgZHVyYXRpb246IHsgdHlwZTogXCJudW1iZXJcIiB9LFxyXG4gICAgICAgICAgICAgIHZhbHVlOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgICBpc0dyb3VwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA1LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRydWUsXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lLCB2YWx1ZSA9IHRydWUsIGR1cmF0aW9uLCBpc0dyb3VwID0gZmFsc2UgfSA9IHJlcS5ib2R5O1xyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgY29udGFjdFRvQXJyYXkocGhvbmUsIGlzR3JvdXApKSB7XHJcbiAgICAgIGlmICh2YWx1ZSkgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LnN0YXJ0UmVjb3JkaW5nKGNvbnRhdG8sIGR1cmF0aW9uKTtcclxuICAgICAgZWxzZSByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuc3RvcFJlY29yaW5nKGNvbnRhdG8pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIHNldCByZWNvcmRpbmcnLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja051bWJlclN0YXR1cyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiTWlzY1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInBob25lXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICc1NTIxOTk5OTk5OTk5J1xyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lIH0gPSByZXEucGFyYW1zO1xyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgY29udGFjdFRvQXJyYXkocGhvbmUsIGZhbHNlKSkge1xyXG4gICAgICByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuY2hlY2tOdW1iZXJTdGF0dXMoYCR7Y29udGF0b31gKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBjaGVjayBudW1iZXIgc3RhdHVzJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q29udGFjdChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiQ2hhdFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInBob25lXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICc1NTIxOTk5OTk5OTk5J1xyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lID0gdHJ1ZSB9ID0gcmVxLnBhcmFtcztcclxuICB0cnkge1xyXG4gICAgbGV0IHJlc3BvbnNlO1xyXG4gICAgZm9yIChjb25zdCBjb250YXRvIG9mIGNvbnRhY3RUb0FycmF5KHBob25lIGFzIHN0cmluZywgZmFsc2UpKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRDb250YWN0KGNvbnRhdG8pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlOiAnRXJyb3Igb24gZ2V0IGNvbnRhY3QnLCBlcnJvcjogZXJyb3IgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsQ29udGFjdHMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNvbnRhY3RcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0QWxsQ29udGFjdHMoKTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgYWxsIGNvbnN0YWN0cycsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldE51bWJlclByb2ZpbGUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIuZGVwcmVjYXRlZD10cnVlXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkNoYXRcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJwaG9uZVwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnNTUyMTk5OTk5OTk5OSdcclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSA9IHRydWUgfSA9IHJlcS5wYXJhbXM7XHJcbiAgdHJ5IHtcclxuICAgIGxldCByZXNwb25zZTtcclxuICAgIGZvciAoY29uc3QgY29udGF0byBvZiBjb250YWN0VG9BcnJheShwaG9uZSBhcyBzdHJpbmcsIGZhbHNlKSkge1xyXG4gICAgICByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0TnVtYmVyUHJvZmlsZShjb250YXRvKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgbnVtYmVyIHByb2ZpbGUnLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQcm9maWxlUGljRnJvbVNlcnZlcihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiQ29udGFjdFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInBob25lXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICc1NTIxOTk5OTk5OTk5J1xyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lID0gdHJ1ZSB9ID0gcmVxLnBhcmFtcztcclxuICBjb25zdCB7IGlzR3JvdXAgPSBmYWxzZSB9ID0gcmVxLnF1ZXJ5O1xyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgY29udGFjdFRvQXJyYXkocGhvbmUgYXMgc3RyaW5nLCBpc0dyb3VwIGFzIGJvb2xlYW4pKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRQcm9maWxlUGljRnJvbVNlcnZlcihjb250YXRvKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiAgZ2V0IHByb2ZpbGUgcGljJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3RhdHVzKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJDb250YWN0XCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wicGhvbmVcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJzU1MjE5OTk5OTk5OTknXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUgPSB0cnVlIH0gPSByZXEucGFyYW1zO1xyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgY29udGFjdFRvQXJyYXkocGhvbmUgYXMgc3RyaW5nLCBmYWxzZSkpIHtcclxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmdldFN0YXR1cyhjb250YXRvKTtcclxuICAgIH1cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlOiAnRXJyb3Igb24gIGdldCBzdGF0dXMnLCBlcnJvcjogZXJyb3IgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0UHJvZmlsZVN0YXR1cyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiUHJvZmlsZVwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcIm9ialwiXSA9IHtcclxuICAgICAgaW46ICdib2R5JyxcclxuICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgJHN0YXR1czogJ015IG5ldyBzdGF0dXMnLFxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAgIFxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgc3RhdHVzOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJNeSBuZXcgc3RhdHVzXCIsXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHN0YXR1cyB9ID0gcmVxLmJvZHk7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5zZXRQcm9maWxlU3RhdHVzKHN0YXR1cyk7XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlOiAnRXJyb3Igb24gc2V0IHByb2ZpbGUgc3RhdHVzJyB9KTtcclxuICB9XHJcbn1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlamVjdENhbGwocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIk1pc2NcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgIFxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgY2FsbElkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIGNhbGxJZDogXCI8Y2FsbGlkPlwiLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBjYWxsSWQgfSA9IHJlcS5ib2R5O1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQucmVqZWN0Q2FsbChjYWxsSWQpO1xyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoNTAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ2Vycm9yJywgbWVzc2FnZTogJ0Vycm9yIG9uIHJlamVjdENhbGwnLCBlcnJvcjogZSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFyTWVzc2FnZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgbWVzc2FnZUlkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBzdGFyOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlSWQ6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgICAgc3RhcjogdHJ1ZSxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgbWVzc2FnZUlkLCBzdGFyID0gdHJ1ZSB9ID0gcmVxLmJvZHk7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5zdGFyTWVzc2FnZShtZXNzYWdlSWQsIHN0YXIpO1xyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uICBzdGFydCBtZXNzYWdlJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmVhY3Rpb25zKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJNZXNzYWdlc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcIm1lc3NhZ2VJZFwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnPG1lc3NhZ2VJZD4nXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IG1lc3NhZ2VJZCA9IHJlcS5wYXJhbXMuaWQ7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRSZWFjdGlvbnMobWVzc2FnZUlkKTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgcmVhY3Rpb25zJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Vm90ZXMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wibWVzc2FnZUlkXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICc8bWVzc2FnZUlkPidcclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgbWVzc2FnZUlkID0gcmVxLnBhcmFtcy5pZDtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmdldFZvdGVzKG1lc3NhZ2VJZCk7XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlIH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGVycm9yKTtcclxuICAgIHJlc1xyXG4gICAgICAuc3RhdHVzKDUwMClcclxuICAgICAgLmpzb24oeyBzdGF0dXM6ICdlcnJvcicsIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgdm90ZXMnLCBlcnJvcjogZXJyb3IgfSk7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGF0V29vdChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpOiBQcm9taXNlPGFueT4ge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJNaXNjXCJdXHJcbiAgICAgI3N3YWdnZXIuZGVzY3JpcHRpb24gPSAnWW91IGNhbiBwb2ludCB5b3VyIENoYXR3b290IHRvIHRoaXMgcm91dGUgc28gdGhhdCBpdCBjYW4gcGVyZm9ybSBmdW5jdGlvbnMuJ1xyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBldmVudDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgcHJpdmF0ZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlSWQ6IFwiY29udmVyc2F0aW9uX3N0YXR1c19jaGFuZ2VkXCIsXHJcbiAgICAgICAgICAgICAgICBwcml2YXRlOiBcImZhbHNlXCIsXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHNlc3Npb24gfSA9IHJlcS5wYXJhbXM7XHJcbiAgY29uc3QgY2xpZW50OiBhbnkgPSBjbGllbnRzQXJyYXlbc2Vzc2lvbl07XHJcbiAgaWYgKGNsaWVudCA9PSBudWxsIHx8IGNsaWVudC5zdGF0dXMgIT09ICdDT05ORUNURUQnKSByZXR1cm47XHJcbiAgdHJ5IHtcclxuICAgIGlmIChhd2FpdCBjbGllbnQuaXNDb25uZWN0ZWQoKSkge1xyXG4gICAgICBjb25zdCBldmVudCA9IHJlcS5ib2R5LmV2ZW50O1xyXG4gICAgICBjb25zdCBpc19wcml2YXRlID0gcmVxLmJvZHkucHJpdmF0ZSB8fCByZXEuYm9keS5pc19wcml2YXRlO1xyXG5cclxuICAgICAgaWYgKFxyXG4gICAgICAgIGV2ZW50ID09ICdjb252ZXJzYXRpb25fc3RhdHVzX2NoYW5nZWQnIHx8XHJcbiAgICAgICAgZXZlbnQgPT0gJ2NvbnZlcnNhdGlvbl9yZXNvbHZlZCcgfHxcclxuICAgICAgICBpc19wcml2YXRlXHJcbiAgICAgICkge1xyXG4gICAgICAgIHJldHVybiByZXNcclxuICAgICAgICAgIC5zdGF0dXMoMjAwKVxyXG4gICAgICAgICAgLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgbWVzc2FnZTogJ1N1Y2Nlc3Mgb24gcmVjZWl2ZSBjaGF0d29vdCcgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHtcclxuICAgICAgICBtZXNzYWdlX3R5cGUsXHJcbiAgICAgICAgcGhvbmUgPSByZXEuYm9keS5jb252ZXJzYXRpb24ubWV0YS5zZW5kZXIucGhvbmVfbnVtYmVyLnJlcGxhY2UoJysnLCAnJyksXHJcbiAgICAgICAgbWVzc2FnZSA9IHJlcS5ib2R5LmNvbnZlcnNhdGlvbi5tZXNzYWdlc1swXSxcclxuICAgICAgfSA9IHJlcS5ib2R5O1xyXG5cclxuICAgICAgaWYgKGV2ZW50ICE9ICdtZXNzYWdlX2NyZWF0ZWQnICYmIG1lc3NhZ2VfdHlwZSAhPSAnb3V0Z29pbmcnKVxyXG4gICAgICAgIHJldHVybiByZXNcclxuICAgICAgICAgIC5zdGF0dXMoMjAwKVxyXG4gICAgICAgICAgLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgbWVzc2FnZTogJ1N1Y2Nlc3Mgb24gcmVjZWl2ZSBjaGF0d29vdCcgfSk7XHJcbiAgICAgIGZvciAoY29uc3QgY29udGF0byBvZiBjb250YWN0VG9BcnJheShwaG9uZSwgZmFsc2UpKSB7XHJcbiAgICAgICAgaWYgKG1lc3NhZ2VfdHlwZSA9PSAnb3V0Z29pbmcnKSB7XHJcbiAgICAgICAgICBpZiAobWVzc2FnZS5hdHRhY2htZW50cykge1xyXG4gICAgICAgICAgICBjb25zdCBiYXNlX3VybCA9IGAke1xyXG4gICAgICAgICAgICAgIGNsaWVudC5jb25maWcuY2hhdFdvb3QuYmFzZVVSTFxyXG4gICAgICAgICAgICB9LyR7bWVzc2FnZS5hdHRhY2htZW50c1swXS5kYXRhX3VybC5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAgICAgbWVzc2FnZS5hdHRhY2htZW50c1swXS5kYXRhX3VybC5pbmRleE9mKCcvcmFpbHMvJykgKyAxXHJcbiAgICAgICAgICAgICl9YDtcclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIGF0dGFjaG1lbnRzIGlzIFB1c2gtdG8tdGFsayBhbmQgc2VuZCB0aGlzXHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmF0dGFjaG1lbnRzWzBdLmZpbGVfdHlwZSA9PT0gJ2F1ZGlvJykge1xyXG4gICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5zZW5kUHR0KFxyXG4gICAgICAgICAgICAgICAgYCR7Y29udGF0b31gLFxyXG4gICAgICAgICAgICAgICAgYmFzZV91cmwsXHJcbiAgICAgICAgICAgICAgICAnVm9pY2UgQXVkaW8nLFxyXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5jb250ZW50XHJcbiAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBhd2FpdCBjbGllbnQuc2VuZEZpbGUoXHJcbiAgICAgICAgICAgICAgICBgJHtjb250YXRvfWAsXHJcbiAgICAgICAgICAgICAgICBiYXNlX3VybCxcclxuICAgICAgICAgICAgICAgICdmaWxlJyxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UuY29udGVudFxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5zZW5kVGV4dChjb250YXRvLCBtZXNzYWdlLmNvbnRlbnQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXNcclxuICAgICAgICAuc3RhdHVzKDIwMClcclxuICAgICAgICAuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCBtZXNzYWdlOiAnU3VjY2VzcyBvbiAgcmVjZWl2ZSBjaGF0d29vdCcgfSk7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgY29uc29sZS5sb2coZSk7XHJcbiAgICByZXMuc3RhdHVzKDQwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uICByZWNlaXZlIGNoYXR3b290JyxcclxuICAgICAgZXJyb3I6IGUsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFBsYXRmb3JtRnJvbU1lc3NhZ2UocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1pc2NcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJtZXNzYWdlSWRcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJzxtZXNzYWdlSWQ+J1xyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVxLmNsaWVudC5nZXRQbGF0Zm9ybUZyb21NZXNzYWdlKFxyXG4gICAgICByZXEucGFyYW1zLm1lc3NhZ2VJZFxyXG4gICAgKTtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3VsdCk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gZ2V0IGdldCBwbGF0Zm9ybSBmcm9tIG1lc3NhZ2UnLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWtCQSxJQUFBQSxVQUFBLEdBQUFDLE9BQUE7QUFDQSxJQUFBQyxZQUFBLEdBQUFELE9BQUEsd0JBQW1ELENBbkJuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FPQSxTQUFTRSxZQUFZQSxDQUFDQyxHQUFRLEVBQUVDLE9BQVksRUFBRUMsS0FBVSxFQUFFQyxJQUFTLEVBQUUsQ0FDbkVILEdBQUcsQ0FBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDQyxJQUFJLENBQUMsRUFDbkJELE1BQU0sRUFBRSxTQUFTLEVBQ2pCRSxRQUFRLEVBQUUsRUFDUkMsT0FBTyxFQUFFLHFDQUFxQyxFQUM5Q0MsT0FB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