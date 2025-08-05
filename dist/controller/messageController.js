"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.editMessage = editMessage;exports.replyMessage = replyMessage;exports.sendButtons = sendButtons;exports.sendFile = sendFile;exports.sendImageAsSticker = sendImageAsSticker;exports.sendImageAsStickerGif = sendImageAsStickerGif;exports.sendLinkPreview = sendLinkPreview;exports.sendListMessage = sendListMessage;exports.sendLocation = sendLocation;exports.sendMentioned = sendMentioned;exports.sendMessage = sendMessage;exports.sendOrderMessage = sendOrderMessage;exports.sendPollMessage = sendPollMessage;exports.sendStatusText = sendStatusText;exports.sendVoice = sendVoice;exports.sendVoice64 = sendVoice64;

















var _functions = require("../util/functions"); /*
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
 */function returnError(req, res, error) {req.logger.error(error);res.status(500).json({ status: 'Error', message: 'Erro ao enviar a mensagem.', error: error });}async function returnSucess(res, data) {res.status(201).json({ status: 'success', response: data, mapper: 'return' });}
async function sendMessage(req, res) {
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
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              phone: { type: "string" },
              isGroup: { type: "boolean" },
              isNewsletter: { type: "boolean" },
              isLid: { type: "boolean" },
              message: { type: "string" },
              options: { type: "object" },
            }
          },
          examples: {
            "Send message to contact": {
              value: { 
                phone: '5521999999999',
                isGroup: false,
                isNewsletter: false,
                isLid: false,
                message: 'Hi from WPPConnect',
              }
            },
            "Send message with reply": {
              value: { 
                phone: '5521999999999',
                isGroup: false,
                isNewsletter: false,
                isLid: false,
                message: 'Hi from WPPConnect with reply',
                options: {
                  quotedMsg: 'true_...@c.us_3EB01DE65ACC6_out',
                }
              }
            },
            "Send message to group": {
              value: {
                phone: '8865623215244578',
                isGroup: true,
                message: 'Hi from WPPConnect',
              }
            },
          }
        }
      }
     }
   */
  const { phone, message } = req.body;

  const options = req.body.options || {};

  try {
    const results = [];
    for (const contato of phone) {
      results.push(await req.client.sendText(contato, message, options));
    }

    if (results.length === 0) res.status(400).json('Error sending message');
    req.io.emit('mensagem-enviada', results);
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function editMessage(req, res) {
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
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              id: { type: "string" },
              newText: { type: "string" },
              options: { type: "object" },
            }
          },
          examples: {
            "Edit a message": {
              value: { 
                id: 'true_5521999999999@c.us_3EB04FCAA1527EB6D9DEC8',
                newText: 'New text for message'
              }
            },
          }
        }
      }
     }
   */
  const { id, newText } = req.body;

  const options = req.body.options || {};
  try {
    const edited = await req.client.editMessage(id, newText, options);

    req.io.emit('edited-message', edited);
    returnSucess(res, edited);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendFile(req, res) {
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
      required: true,
      "@content": {
        "application/json": {
            schema: {
                type: "object",
                properties: {
                    "phone": { type: "string" },
                    "isGroup": { type: "boolean" },
                    "isNewsletter": { type: "boolean" },
                    "isLid": { type: "boolean" },
                    "filename": { type: "string" },
                    "caption": { type: "string" },
                    "base64": { type: "string" }
                }
            },
            examples: {
                "Default": {
                    value: {
                        "phone": "5521999999999",
                        "isGroup": false,
                        "isNewsletter": false,
                        "isLid": false,
                        "filename": "file name lol",
                        "caption": "caption for my file",
                        "base64": "<base64> string"
                    }
                }
            }
        }
      }
    }
   */
  const {
    phone,
    path,
    base64,
    filename = 'file',
    message,
    caption,
    quotedMessageId
  } = req.body;

  const options = req.body.options || {};

  if (!path && !req.file && !base64)
  res.status(401).send({
    message: 'Sending the file is mandatory'
  });

  const pathFile = path || base64 || req.file?.path;
  const msg = message || caption;

  try {
    const results = [];
    for (const contact of phone) {
      results.push(
        await req.client.sendFile(contact, pathFile, {
          filename: filename,
          caption: msg,
          quotedMsg: quotedMessageId,
          ...options
        })
      );
    }

    if (results.length === 0) res.status(400).json('Error sending message');
    if (req.file) await (0, _functions.unlinkAsync)(pathFile);
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendVoice(req, res) {
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
        required: true,
        "@content": {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        "phone": { type: "string" },
                        "isGroup": { type: "boolean" },
                        "path": { type: "string" },
                        "quotedMessageId": { type: "string" }
                    }
                },
                examples: {
                    "Default": {
                        value: {
                            "phone": "5521999999999",
                            "isGroup": false,
                            "path": "<path_file>",
                            "quotedMessageId": "message Id"
                        }
                    }
                }
            }
        }
    }
   */
  const {
    phone,
    path,
    filename = 'Voice Audio',
    message,
    quotedMessageId
  } = req.body;

  try {
    const results = [];
    for (const contato of phone) {
      results.push(
        await req.client.sendPtt(
          contato,
          path,
          filename,
          message,
          quotedMessageId
        )
      );
    }

    if (results.length === 0) res.status(400).json('Error sending message');
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendVoice64(req, res) {
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
        required: true,
        "@content": {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        "phone": { type: "string" },
                        "isGroup": { type: "boolean" },
                        "base64Ptt": { type: "string" }
                    }
                },
                examples: {
                    "Default": {
                        value: {
                            "phone": "5521999999999",
                            "isGroup": false,
                            "base64Ptt": "<base64_string>"
                        }
                    }
                }
            }
        }
    }
   */
  const { phone, base64Ptt, quotedMessageId } = req.body;

  try {
    const results = [];
    for (const contato of phone) {
      results.push(
        await req.client.sendPttFromBase64(
          contato,
          base64Ptt,
          'Voice Audio',
          '',
          quotedMessageId
        )
      );
    }

    if (results.length === 0) res.status(400).json('Error sending message');
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendLinkPreview(req, res) {
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
        required: true,
        "@content": {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        "phone": { type: "string" },
                        "isGroup": { type: "boolean" },
                        "url": { type: "string" },
                        "caption": { type: "string" }
                    }
                },
                examples: {
                    "Default": {
                        value: {
                            "phone": "5521999999999",
                            "isGroup": false,
                            "url": "http://www.link.com",
                            "caption": "Text for describe link"
                        }
                    }
                }
            }
        }
    }
   */
  const { phone, url, caption } = req.body;

  try {
    const results = [];
    for (const contato of phone) {
      results.push(
        await req.client.sendLinkPreview(`${contato}`, url, caption)
      );
    }

    if (results.length === 0) res.status(400).json('Error sending message');
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendLocation(req, res) {
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
        required: true,
        "@content": {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        "phone": { type: "string" },
                        "isGroup": { type: "boolean" },
                        "lat": { type: "string" },
                        "lng": { type: "string" },
                        "title": { type: "string" },
                        "address": { type: "string" }
                    }
                },
                examples: {
                    "Default": {
                        value: {
                            "phone": "5521999999999",
                            "isGroup": false,
                            "lat": "-89898322",
                            "lng": "-545454",
                            "title": "Rio de Janeiro",
                            "address": "Av. N. S. de Copacabana, 25, Copacabana"
                        }
                    }
                }
            }
        }
    }
   */
  const { phone, lat, lng, title, address } = req.body;

  try {
    const results = [];
    for (const contato of phone) {
      results.push(
        await req.client.sendLocation(contato, {
          lat: lat,
          lng: lng,
          address: address,
          name: title
        })
      );
    }

    if (results.length === 0) res.status(400).json('Error sending message');
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendButtons(req, res) {
  /**
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA',
     }
     #swagger.deprecated=true
   */
  const { phone, message, options } = req.body;

  try {
    const results = [];

    for (const contact of phone) {
      results.push(await req.client.sendText(contact, message, options));
    }

    if (results.length === 0)
    return returnError(req, res, 'Error sending message with buttons');

    returnSucess(res, phone);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendListMessage(req, res) {
  /**
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA',
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
              description: { type: "string" },
              sections: { type: "array" },
              buttonText: { type: "string" },
            }
          },
          examples: {
            "Send list message": {
              value: { 
                phone: '5521999999999',
                isGroup: false,
                description: 'Desc for list',
                buttonText: 'Select a option',
                sections: [
                  {
                    title: 'Section 1',
                    rows: [
                      {
                        rowId: 'my_custom_id',
                        title: 'Test 1',
                        description: 'Description 1',
                      },
                      {
                        rowId: '2',
                        title: 'Test 2',
                        description: 'Description 2',
                      },
                    ],
                  },
                ],
              }
            },
          }
        }
      }
     }
   */
  const {
    phone,
    description = '',
    sections,
    buttonText = 'SELECIONE UMA OPÇÃO'
  } = req.body;

  try {
    const results = [];

    for (const contact of phone) {
      results.push(
        await req.client.sendListMessage(contact, {
          buttonText: buttonText,
          description: description,
          sections: sections
        })
      );
    }

    if (results.length === 0)
    return returnError(req, res, 'Error sending list buttons');

    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendOrderMessage(req, res) {
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
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              phone: { type: "string" },
              isGroup: { type: "boolean" },
              items: { type: "object" },
              options: { type: "object" },
            }
          },
          examples: {
            "Send with custom items": {
              value: { 
                phone: '5521999999999',
                isGroup: false,
                items: [
                  {
                    type: 'custom',
                    name: 'Item test',
                    price: 120000,
                    qnt: 2,
                  },
                  {
                    type: 'custom',
                    name: 'Item test 2',
                    price: 145000,
                    qnt: 2,
                  },
                ],
              }
            },
            "Send with product items": {
              value: { 
                phone: '5521999999999',
                isGroup: false,
                items: [
                  {
                    type: 'product',
                    id: '37878774457',
                    price: 148000,
                    qnt: 2,
                  },
                ],
              }
            },
            "Send with custom items and options": {
              value: { 
                phone: '5521999999999',
                isGroup: false,
                items: [
                  {
                    type: 'custom',
                    name: 'Item test',
                    price: 120000,
                    qnt: 2,
                  },
                ],
                options: {
                  tax: 10000,
                  shipping: 4000,
                  discount: 10000,
                }
              }
            },
          }
        }
      }
     }
   */
  const { phone, items } = req.body;

  const options = req.body.options || {};

  try {
    const results = [];
    for (const contato of phone) {
      results.push(await req.client.sendOrderMessage(contato, items, options));
    }

    if (results.length === 0)
    res.status(400).json('Error sending order message');
    req.io.emit('mensagem-enviada', results);
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendPollMessage(req, res) {
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
        required: true,
        "@content": {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        phone: { type: "string" },
                        isGroup: { type: "boolean" },
                        name: { type: "string" },
                        choices: { type: "array" },
                        options: { type: "object" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          phone: '5521999999999',
                          isGroup: false,
                          name: 'Poll name',
                          choices: ['Option 1', 'Option 2', 'Option 3'],
                          options: {
                            selectableCount: 1,
                          }
                        }
                    },
                }
            }
        }
    }
   */
  const { phone, name, choices, options } = req.body;

  try {
    const results = [];

    for (const contact of phone) {
      results.push(
        await req.client.sendPollMessage(contact, name, choices, options)
      );
    }

    if (results.length === 0)
    return returnError(req, res, 'Error sending poll message');

    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendStatusText(req, res) {
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
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              phone: { type: 'string' },
              isGroup: { type: 'boolean' },
              message: { type: 'string' },
              messageId: { type: 'string' }
            },
            required: ['phone', 'isGroup', 'message']
          },
          examples: {
            Default: {
              value: {
                phone: '5521999999999',
                isGroup: false,
                message: 'Reply to message',
                messageId: '<id_message>'
              }
            }
          }
        }
      }
    }
   */
  const { message } = req.body;

  try {
    const results = [];
    results.push(await req.client.sendText('status@broadcast', message));

    if (results.length === 0) res.status(400).json('Error sending message');
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function replyMessage(req, res) {
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
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              "phone": { type: "string" },
              "isGroup": { type: "boolean" },
              "message": { type: "string" },
              "messageId": { type: "string" }
            }
          },
          examples: {
            "Default": {
              value: {
                "phone": "5521999999999",
                "isGroup": false,
                "message": "Reply to message",
                "messageId": "<id_message>"
              }
            }
          }
        }
      }
    }
   */
  const { phone, message, messageId } = req.body;

  try {
    const results = [];
    for (const contato of phone) {
      results.push(await req.client.reply(contato, message, messageId));
    }

    if (results.length === 0) res.status(400).json('Error sending message');
    req.io.emit('mensagem-enviada', { message: message, to: phone });
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}

async function sendMentioned(req, res) {
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
  required: true,
  "@content": {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          "phone": { type: "string" },
          "isGroup": { type: "boolean" },
          "message": { type: "string" },
          "mentioned": { type: "array", items: { type: "string" } }
        },
        required: ["phone", "message", "mentioned"]
      },
      examples: {
        "Default": {
          value: {
            "phone": "groupId@g.us",
            "isGroup": true,
            "message": "Your text message",
            "mentioned": ["556593077171@c.us"]
          }
        }
      }
    }
  }
  }
   */
  const { phone, message, mentioned } = req.body;

  try {
    let response;
    for (const contato of phone) {
      response = await req.client.sendMentioned(
        `${contato}`,
        message,
        mentioned
      );
    }

    res.status(201).json({ status: 'success', response: response });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on send message mentioned',
      error: error
    });
  }
}
async function sendImageAsSticker(req, res) {
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
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              "phone": { type: "string" },
              "isGroup": { type: "boolean" },
              "path": { type: "string" }
            },
            required: ["phone", "path"]
          },
          examples: {
            "Default": {
              value: {
                "phone": "5521999999999",
                "isGroup": true,
                "path": "<path_file>"
              }
            }
          }
        }
      }
    }
   */
  const { phone, path } = req.body;

  if (!path && !req.file)
  res.status(401).send({
    message: 'Sending the file is mandatory'
  });

  const pathFile = path || req.file?.path;

  try {
    const results = [];
    for (const contato of phone) {
      results.push(await req.client.sendImageAsSticker(contato, pathFile));
    }

    if (results.length === 0) res.status(400).json('Error sending message');
    if (req.file) await (0, _functions.unlinkAsync)(pathFile);
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}
async function sendImageAsStickerGif(req, res) {
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
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              phone: { type: 'string' },
              isGroup: { type: 'boolean' },
              path: { type: 'string' },
            },
            required: ['phone', 'path'],
          },
          examples: {
            'Default': {
              value: {
                phone: '5521999999999',
                isGroup: true,
                path: '<path_file>',
              },
            },
          },
        },
      },
    }
   */
  const { phone, path } = req.body;

  if (!path && !req.file)
  res.status(401).send({
    message: 'Sending the file is mandatory'
  });

  const pathFile = path || req.file?.path;

  try {
    const results = [];
    for (const contato of phone) {
      results.push(await req.client.sendImageAsStickerGif(contato, pathFile));
    }

    if (results.length === 0) res.status(400).json('Error sending message');
    if (req.file) await (0, _functions.unlinkAsync)(pathFile);
    returnSucess(res, results);
  } catch (error) {
    returnError(req, res, error);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZnVuY3Rpb25zIiwicmVxdWlyZSIsInJldHVybkVycm9yIiwicmVxIiwicmVzIiwiZXJyb3IiLCJsb2dnZXIiLCJzdGF0dXMiLCJqc29uIiwibWVzc2FnZSIsInJldHVyblN1Y2VzcyIsImRhdGEiLCJyZXNwb25zZSIsIm1hcHBlciIsInNlbmRNZXNzYWdlIiwicGhvbmUiLCJib2R5Iiwib3B0aW9ucyIsInJlc3VsdHMiLCJjb250YXRvIiwicHVzaCIsImNsaWVudCIsInNlbmRUZXh0IiwibGVuZ3RoIiwiaW8iLCJlbWl0IiwiZWRpdE1lc3NhZ2UiLCJpZCIsIm5ld1RleHQiLCJlZGl0ZWQiLCJzZW5kRmlsZSIsInBhdGgiLCJiYXNlNjQiLCJmaWxlbmFtZSIsImNhcHRpb24iLCJxdW90ZWRNZXNzYWdlSWQiLCJmaWxlIiwic2VuZCIsInBhdGhGaWxlIiwibXNnIiwiY29udGFjdCIsInF1b3RlZE1zZyIsInVubGlua0FzeW5jIiwic2VuZFZvaWNlIiwic2VuZFB0dCIsInNlbmRWb2ljZTY0IiwiYmFzZTY0UHR0Iiwic2VuZFB0dEZyb21CYXNlNjQiLCJzZW5kTGlua1ByZXZpZXciLCJ1cmwiLCJzZW5kTG9jYXRpb24iLCJsYXQiLCJsbmciLCJ0aXRsZSIsImFkZHJlc3MiLCJuYW1lIiwic2VuZEJ1dHRvbnMiLCJzZW5kTGlzdE1lc3NhZ2UiLCJkZXNjcmlwdGlvbiIsInNlY3Rpb25zIiwiYnV0dG9uVGV4dCIsInNlbmRPcmRlck1lc3NhZ2UiLCJpdGVtcyIsInNlbmRQb2xsTWVzc2FnZSIsImNob2ljZXMiLCJzZW5kU3RhdHVzVGV4dCIsInJlcGx5TWVzc2FnZSIsIm1lc3NhZ2VJZCIsInJlcGx5IiwidG8iLCJzZW5kTWVudGlvbmVkIiwibWVudGlvbmVkIiwic2VuZEltYWdlQXNTdGlja2VyIiwic2VuZEltYWdlQXNTdGlja2VyR2lmIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXIvbWVzc2FnZUNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQ29weXJpZ2h0IDIwMjEgV1BQQ29ubmVjdCBUZWFtXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XHJcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqXHJcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IFJlcXVlc3QsIFJlc3BvbnNlIH0gZnJvbSAnZXhwcmVzcyc7XHJcblxyXG5pbXBvcnQgeyB1bmxpbmtBc3luYyB9IGZyb20gJy4uL3V0aWwvZnVuY3Rpb25zJztcclxuXHJcbmZ1bmN0aW9uIHJldHVybkVycm9yKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSwgZXJyb3I6IGFueSkge1xyXG4gIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgIHN0YXR1czogJ0Vycm9yJyxcclxuICAgIG1lc3NhZ2U6ICdFcnJvIGFvIGVudmlhciBhIG1lbnNhZ2VtLicsXHJcbiAgICBlcnJvcjogZXJyb3IsXHJcbiAgfSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJldHVyblN1Y2VzcyhyZXM6IGFueSwgZGF0YTogYW55KSB7XHJcbiAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IGRhdGEsIG1hcHBlcjogJ3JldHVybicgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTWVzc2FnZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBwaG9uZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgaXNHcm91cDogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgIGlzTmV3c2xldHRlcjogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgIGlzTGlkOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgbWVzc2FnZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgb3B0aW9uczogeyB0eXBlOiBcIm9iamVjdFwiIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIlNlbmQgbWVzc2FnZSB0byBjb250YWN0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogeyBcclxuICAgICAgICAgICAgICAgIHBob25lOiAnNTUyMTk5OTk5OTk5OScsXHJcbiAgICAgICAgICAgICAgICBpc0dyb3VwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGlzTmV3c2xldHRlcjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpc0xpZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnSGkgZnJvbSBXUFBDb25uZWN0JyxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiU2VuZCBtZXNzYWdlIHdpdGggcmVwbHlcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7IFxyXG4gICAgICAgICAgICAgICAgcGhvbmU6ICc1NTIxOTk5OTk5OTk5JyxcclxuICAgICAgICAgICAgICAgIGlzR3JvdXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaXNOZXdzbGV0dGVyOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGlzTGlkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdIaSBmcm9tIFdQUENvbm5lY3Qgd2l0aCByZXBseScsXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgIHF1b3RlZE1zZzogJ3RydWVfLi4uQGMudXNfM0VCMDFERTY1QUNDNl9vdXQnLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJTZW5kIG1lc3NhZ2UgdG8gZ3JvdXBcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZTogJzg4NjU2MjMyMTUyNDQ1NzgnLFxyXG4gICAgICAgICAgICAgICAgaXNHcm91cDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdIaSBmcm9tIFdQUENvbm5lY3QnLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSwgbWVzc2FnZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIGNvbnN0IG9wdGlvbnMgPSByZXEuYm9keS5vcHRpb25zIHx8IHt9O1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgcGhvbmUpIHtcclxuICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHJlcS5jbGllbnQuc2VuZFRleHQoY29udGF0bywgbWVzc2FnZSwgb3B0aW9ucykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMCkgcmVzLnN0YXR1cyg0MDApLmpzb24oJ0Vycm9yIHNlbmRpbmcgbWVzc2FnZScpO1xyXG4gICAgcmVxLmlvLmVtaXQoJ21lbnNhZ2VtLWVudmlhZGEnLCByZXN1bHRzKTtcclxuICAgIHJldHVyblN1Y2VzcyhyZXMsIHJlc3VsdHMpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm5FcnJvcihyZXEsIHJlcywgZXJyb3IpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVkaXRNZXNzYWdlKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJNZXNzYWdlc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIGlkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBuZXdUZXh0OiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBvcHRpb25zOiB7IHR5cGU6IFwib2JqZWN0XCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRWRpdCBhIG1lc3NhZ2VcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7IFxyXG4gICAgICAgICAgICAgICAgaWQ6ICd0cnVlXzU1MjE5OTk5OTk5OTlAYy51c18zRUIwNEZDQUExNTI3RUI2RDlERUM4JyxcclxuICAgICAgICAgICAgICAgIG5ld1RleHQ6ICdOZXcgdGV4dCBmb3IgbWVzc2FnZSdcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgaWQsIG5ld1RleHQgfSA9IHJlcS5ib2R5O1xyXG5cclxuICBjb25zdCBvcHRpb25zID0gcmVxLmJvZHkub3B0aW9ucyB8fCB7fTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZWRpdGVkID0gYXdhaXQgKHJlcS5jbGllbnQgYXMgYW55KS5lZGl0TWVzc2FnZShpZCwgbmV3VGV4dCwgb3B0aW9ucyk7XHJcblxyXG4gICAgcmVxLmlvLmVtaXQoJ2VkaXRlZC1tZXNzYWdlJywgZWRpdGVkKTtcclxuICAgIHJldHVyblN1Y2VzcyhyZXMsIGVkaXRlZCk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybkVycm9yKHJlcSwgcmVzLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZEZpbGUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInBob25lXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaXNHcm91cFwiOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpc05ld3NsZXR0ZXJcIjogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaXNMaWRcIjogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsZW5hbWVcIjogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjYXB0aW9uXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFwiYmFzZTY0XCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicGhvbmVcIjogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaXNHcm91cFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJpc05ld3NsZXR0ZXJcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaXNMaWRcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZmlsZW5hbWVcIjogXCJmaWxlIG5hbWUgbG9sXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FwdGlvblwiOiBcImNhcHRpb24gZm9yIG15IGZpbGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJiYXNlNjRcIjogXCI8YmFzZTY0PiBzdHJpbmdcIlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHtcclxuICAgIHBob25lLFxyXG4gICAgcGF0aCxcclxuICAgIGJhc2U2NCxcclxuICAgIGZpbGVuYW1lID0gJ2ZpbGUnLFxyXG4gICAgbWVzc2FnZSxcclxuICAgIGNhcHRpb24sXHJcbiAgICBxdW90ZWRNZXNzYWdlSWQsXHJcbiAgfSA9IHJlcS5ib2R5O1xyXG5cclxuICBjb25zdCBvcHRpb25zID0gcmVxLmJvZHkub3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgaWYgKCFwYXRoICYmICFyZXEuZmlsZSAmJiAhYmFzZTY0KVxyXG4gICAgcmVzLnN0YXR1cyg0MDEpLnNlbmQoe1xyXG4gICAgICBtZXNzYWdlOiAnU2VuZGluZyB0aGUgZmlsZSBpcyBtYW5kYXRvcnknLFxyXG4gICAgfSk7XHJcblxyXG4gIGNvbnN0IHBhdGhGaWxlID0gcGF0aCB8fCBiYXNlNjQgfHwgcmVxLmZpbGU/LnBhdGg7XHJcbiAgY29uc3QgbXNnID0gbWVzc2FnZSB8fCBjYXB0aW9uO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhY3Qgb2YgcGhvbmUpIHtcclxuICAgICAgcmVzdWx0cy5wdXNoKFxyXG4gICAgICAgIGF3YWl0IHJlcS5jbGllbnQuc2VuZEZpbGUoY29udGFjdCwgcGF0aEZpbGUsIHtcclxuICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSxcclxuICAgICAgICAgIGNhcHRpb246IG1zZyxcclxuICAgICAgICAgIHF1b3RlZE1zZzogcXVvdGVkTWVzc2FnZUlkLFxyXG4gICAgICAgICAgLi4ub3B0aW9ucyxcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMCkgcmVzLnN0YXR1cyg0MDApLmpzb24oJ0Vycm9yIHNlbmRpbmcgbWVzc2FnZScpO1xyXG4gICAgaWYgKHJlcS5maWxlKSBhd2FpdCB1bmxpbmtBc3luYyhwYXRoRmlsZSk7XHJcbiAgICByZXR1cm5TdWNlc3MocmVzLCByZXN1bHRzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuRXJyb3IocmVxLCByZXMsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kVm9pY2UocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBob25lXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImlzR3JvdXBcIjogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBhdGhcIjogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicXVvdGVkTWVzc2FnZUlkXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhvbmVcIjogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlzR3JvdXBcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhdGhcIjogXCI8cGF0aF9maWxlPlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdW90ZWRNZXNzYWdlSWRcIjogXCJtZXNzYWdlIElkXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7XHJcbiAgICBwaG9uZSxcclxuICAgIHBhdGgsXHJcbiAgICBmaWxlbmFtZSA9ICdWb2ljZSBBdWRpbycsXHJcbiAgICBtZXNzYWdlLFxyXG4gICAgcXVvdGVkTWVzc2FnZUlkLFxyXG4gIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdHM6IGFueSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBjb250YXRvIG9mIHBob25lKSB7XHJcbiAgICAgIHJlc3VsdHMucHVzaChcclxuICAgICAgICBhd2FpdCByZXEuY2xpZW50LnNlbmRQdHQoXHJcbiAgICAgICAgICBjb250YXRvLFxyXG4gICAgICAgICAgcGF0aCxcclxuICAgICAgICAgIGZpbGVuYW1lLFxyXG4gICAgICAgICAgbWVzc2FnZSxcclxuICAgICAgICAgIHF1b3RlZE1lc3NhZ2VJZFxyXG4gICAgICAgIClcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDApIHJlcy5zdGF0dXMoNDAwKS5qc29uKCdFcnJvciBzZW5kaW5nIG1lc3NhZ2UnKTtcclxuICAgIHJldHVyblN1Y2VzcyhyZXMsIHJlc3VsdHMpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm5FcnJvcihyZXEsIHJlcywgZXJyb3IpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmRWb2ljZTY0KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJNZXNzYWdlc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJwaG9uZVwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJpc0dyb3VwXCI6IHsgdHlwZTogXCJib29sZWFuXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJiYXNlNjRQdHRcIjogeyB0eXBlOiBcInN0cmluZ1wiIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwaG9uZVwiOiBcIjU1MjE5OTk5OTk5OTlcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaXNHcm91cFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmFzZTY0UHR0XCI6IFwiPGJhc2U2NF9zdHJpbmc+XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lLCBiYXNlNjRQdHQsIHF1b3RlZE1lc3NhZ2VJZCB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHRzOiBhbnkgPSBbXTtcclxuICAgIGZvciAoY29uc3QgY29udGF0byBvZiBwaG9uZSkge1xyXG4gICAgICByZXN1bHRzLnB1c2goXHJcbiAgICAgICAgYXdhaXQgcmVxLmNsaWVudC5zZW5kUHR0RnJvbUJhc2U2NChcclxuICAgICAgICAgIGNvbnRhdG8sXHJcbiAgICAgICAgICBiYXNlNjRQdHQsXHJcbiAgICAgICAgICAnVm9pY2UgQXVkaW8nLFxyXG4gICAgICAgICAgJycsXHJcbiAgICAgICAgICBxdW90ZWRNZXNzYWdlSWRcclxuICAgICAgICApXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKSByZXMuc3RhdHVzKDQwMCkuanNvbignRXJyb3Igc2VuZGluZyBtZXNzYWdlJyk7XHJcbiAgICByZXR1cm5TdWNlc3MocmVzLCByZXN1bHRzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuRXJyb3IocmVxLCByZXMsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTGlua1ByZXZpZXcocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBob25lXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImlzR3JvdXBcIjogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInVybFwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJjYXB0aW9uXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGhvbmVcIjogXCI1NTIxOTk5OTk5OTk5XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImlzR3JvdXBcIjogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInVybFwiOiBcImh0dHA6Ly93d3cubGluay5jb21cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2FwdGlvblwiOiBcIlRleHQgZm9yIGRlc2NyaWJlIGxpbmtcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUsIHVybCwgY2FwdGlvbiB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHRzOiBhbnkgPSBbXTtcclxuICAgIGZvciAoY29uc3QgY29udGF0byBvZiBwaG9uZSkge1xyXG4gICAgICByZXN1bHRzLnB1c2goXHJcbiAgICAgICAgYXdhaXQgcmVxLmNsaWVudC5zZW5kTGlua1ByZXZpZXcoYCR7Y29udGF0b31gLCB1cmwsIGNhcHRpb24pXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKSByZXMuc3RhdHVzKDQwMCkuanNvbignRXJyb3Igc2VuZGluZyBtZXNzYWdlJyk7XHJcbiAgICByZXR1cm5TdWNlc3MocmVzLCByZXN1bHRzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuRXJyb3IocmVxLCByZXMsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTG9jYXRpb24ocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBob25lXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImlzR3JvdXBcIjogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBcImxhdFwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXCJsbmdcIjogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGl0bGVcIjogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYWRkcmVzc1wiOiB7IHR5cGU6IFwic3RyaW5nXCIgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBob25lXCI6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpc0dyb3VwXCI6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsYXRcIjogXCItODk4OTgzMjJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibG5nXCI6IFwiLTU0NTQ1NFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIlJpbyBkZSBKYW5laXJvXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFkZHJlc3NcIjogXCJBdi4gTi4gUy4gZGUgQ29wYWNhYmFuYSwgMjUsIENvcGFjYWJhbmFcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUsIGxhdCwgbG5nLCB0aXRsZSwgYWRkcmVzcyB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHRzOiBhbnkgPSBbXTtcclxuICAgIGZvciAoY29uc3QgY29udGF0byBvZiBwaG9uZSkge1xyXG4gICAgICByZXN1bHRzLnB1c2goXHJcbiAgICAgICAgYXdhaXQgcmVxLmNsaWVudC5zZW5kTG9jYXRpb24oY29udGF0bywge1xyXG4gICAgICAgICAgbGF0OiBsYXQsXHJcbiAgICAgICAgICBsbmc6IGxuZyxcclxuICAgICAgICAgIGFkZHJlc3M6IGFkZHJlc3MsXHJcbiAgICAgICAgICBuYW1lOiB0aXRsZSxcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMCkgcmVzLnN0YXR1cyg0MDApLmpzb24oJ0Vycm9yIHNlbmRpbmcgbWVzc2FnZScpO1xyXG4gICAgcmV0dXJuU3VjZXNzKHJlcywgcmVzdWx0cyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybkVycm9yKHJlcSwgcmVzLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZEJ1dHRvbnMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJyxcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIuZGVwcmVjYXRlZD10cnVlXHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSwgbWVzc2FnZSwgb3B0aW9ucyB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHRzOiBhbnkgPSBbXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhY3Qgb2YgcGhvbmUpIHtcclxuICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHJlcS5jbGllbnQuc2VuZFRleHQoY29udGFjdCwgbWVzc2FnZSwgb3B0aW9ucykpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMClcclxuICAgICAgcmV0dXJuIHJldHVybkVycm9yKHJlcSwgcmVzLCAnRXJyb3Igc2VuZGluZyBtZXNzYWdlIHdpdGggYnV0dG9ucycpO1xyXG5cclxuICAgIHJldHVyblN1Y2VzcyhyZXMsIHBob25lKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuRXJyb3IocmVxLCByZXMsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTGlzdE1lc3NhZ2UocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJyxcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBwaG9uZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgaXNHcm91cDogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBzZWN0aW9uczogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgICBidXR0b25UZXh0OiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiU2VuZCBsaXN0IG1lc3NhZ2VcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7IFxyXG4gICAgICAgICAgICAgICAgcGhvbmU6ICc1NTIxOTk5OTk5OTk5JyxcclxuICAgICAgICAgICAgICAgIGlzR3JvdXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdEZXNjIGZvciBsaXN0JyxcclxuICAgICAgICAgICAgICAgIGJ1dHRvblRleHQ6ICdTZWxlY3QgYSBvcHRpb24nLFxyXG4gICAgICAgICAgICAgICAgc2VjdGlvbnM6IFtcclxuICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnU2VjdGlvbiAxJyxcclxuICAgICAgICAgICAgICAgICAgICByb3dzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd0lkOiAnbXlfY3VzdG9tX2lkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdUZXN0IDEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Rlc2NyaXB0aW9uIDEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm93SWQ6ICcyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdUZXN0IDInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Rlc2NyaXB0aW9uIDInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHtcclxuICAgIHBob25lLFxyXG4gICAgZGVzY3JpcHRpb24gPSAnJyxcclxuICAgIHNlY3Rpb25zLFxyXG4gICAgYnV0dG9uVGV4dCA9ICdTRUxFQ0lPTkUgVU1BIE9Qw4fDg08nLFxyXG4gIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdHM6IGFueSA9IFtdO1xyXG5cclxuICAgIGZvciAoY29uc3QgY29udGFjdCBvZiBwaG9uZSkge1xyXG4gICAgICByZXN1bHRzLnB1c2goXHJcbiAgICAgICAgYXdhaXQgcmVxLmNsaWVudC5zZW5kTGlzdE1lc3NhZ2UoY29udGFjdCwge1xyXG4gICAgICAgICAgYnV0dG9uVGV4dDogYnV0dG9uVGV4dCxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbixcclxuICAgICAgICAgIHNlY3Rpb25zOiBzZWN0aW9ucyxcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMClcclxuICAgICAgcmV0dXJuIHJldHVybkVycm9yKHJlcSwgcmVzLCAnRXJyb3Igc2VuZGluZyBsaXN0IGJ1dHRvbnMnKTtcclxuXHJcbiAgICByZXR1cm5TdWNlc3MocmVzLCByZXN1bHRzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuRXJyb3IocmVxLCByZXMsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kT3JkZXJNZXNzYWdlKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJNZXNzYWdlc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBpc0dyb3VwOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgaXRlbXM6IHsgdHlwZTogXCJvYmplY3RcIiB9LFxyXG4gICAgICAgICAgICAgIG9wdGlvbnM6IHsgdHlwZTogXCJvYmplY3RcIiB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJTZW5kIHdpdGggY3VzdG9tIGl0ZW1zXCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogeyBcclxuICAgICAgICAgICAgICAgIHBob25lOiAnNTUyMTk5OTk5OTk5OScsXHJcbiAgICAgICAgICAgICAgICBpc0dyb3VwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiBbXHJcbiAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY3VzdG9tJyxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnSXRlbSB0ZXN0JyxcclxuICAgICAgICAgICAgICAgICAgICBwcmljZTogMTIwMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHFudDogMixcclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjdXN0b20nLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdJdGVtIHRlc3QgMicsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IDE0NTAwMCxcclxuICAgICAgICAgICAgICAgICAgICBxbnQ6IDIsXHJcbiAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJTZW5kIHdpdGggcHJvZHVjdCBpdGVtc1wiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHsgXHJcbiAgICAgICAgICAgICAgICBwaG9uZTogJzU1MjE5OTk5OTk5OTknLFxyXG4gICAgICAgICAgICAgICAgaXNHcm91cDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3Byb2R1Y3QnLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiAnMzc4Nzg3NzQ0NTcnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiAxNDgwMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcW50OiAyLFxyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiU2VuZCB3aXRoIGN1c3RvbSBpdGVtcyBhbmQgb3B0aW9uc1wiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHsgXHJcbiAgICAgICAgICAgICAgICBwaG9uZTogJzU1MjE5OTk5OTk5OTknLFxyXG4gICAgICAgICAgICAgICAgaXNHcm91cDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpdGVtczogW1xyXG4gICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2N1c3RvbScsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0l0ZW0gdGVzdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IDEyMDAwMCxcclxuICAgICAgICAgICAgICAgICAgICBxbnQ6IDIsXHJcbiAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgICB0YXg6IDEwMDAwLFxyXG4gICAgICAgICAgICAgICAgICBzaGlwcGluZzogNDAwMCxcclxuICAgICAgICAgICAgICAgICAgZGlzY291bnQ6IDEwMDAwLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSwgaXRlbXMgfSA9IHJlcS5ib2R5O1xyXG5cclxuICBjb25zdCBvcHRpb25zID0gcmVxLmJvZHkub3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdHM6IGFueSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBjb250YXRvIG9mIHBob25lKSB7XHJcbiAgICAgIHJlc3VsdHMucHVzaChhd2FpdCByZXEuY2xpZW50LnNlbmRPcmRlck1lc3NhZ2UoY29udGF0bywgaXRlbXMsIG9wdGlvbnMpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDApXHJcbiAgICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKCdFcnJvciBzZW5kaW5nIG9yZGVyIG1lc3NhZ2UnKTtcclxuICAgIHJlcS5pby5lbWl0KCdtZW5zYWdlbS1lbnZpYWRhJywgcmVzdWx0cyk7XHJcbiAgICByZXR1cm5TdWNlc3MocmVzLCByZXN1bHRzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuRXJyb3IocmVxLCByZXMsIGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kUG9sbE1lc3NhZ2UocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaXNHcm91cDogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hvaWNlczogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogeyB0eXBlOiBcIm9iamVjdFwiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBwaG9uZTogJzU1MjE5OTk5OTk5OTknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzR3JvdXA6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdQb2xsIG5hbWUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZXM6IFsnT3B0aW9uIDEnLCAnT3B0aW9uIDInLCAnT3B0aW9uIDMnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RhYmxlQ291bnQ6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lLCBuYW1lLCBjaG9pY2VzLCBvcHRpb25zIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdHM6IGFueSA9IFtdO1xyXG5cclxuICAgIGZvciAoY29uc3QgY29udGFjdCBvZiBwaG9uZSkge1xyXG4gICAgICByZXN1bHRzLnB1c2goXHJcbiAgICAgICAgYXdhaXQgcmVxLmNsaWVudC5zZW5kUG9sbE1lc3NhZ2UoY29udGFjdCwgbmFtZSwgY2hvaWNlcywgb3B0aW9ucylcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDApXHJcbiAgICAgIHJldHVybiByZXR1cm5FcnJvcihyZXEsIHJlcywgJ0Vycm9yIHNlbmRpbmcgcG9sbCBtZXNzYWdlJyk7XHJcblxyXG4gICAgcmV0dXJuU3VjZXNzKHJlcywgcmVzdWx0cyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybkVycm9yKHJlcSwgcmVzLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZFN0YXR1c1RleHQocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIGNvbnRlbnQ6IHtcclxuICAgICAgICAnYXBwbGljYXRpb24vanNvbic6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6ICdzdHJpbmcnIH0sXHJcbiAgICAgICAgICAgICAgaXNHcm91cDogeyB0eXBlOiAnYm9vbGVhbicgfSxcclxuICAgICAgICAgICAgICBtZXNzYWdlOiB7IHR5cGU6ICdzdHJpbmcnIH0sXHJcbiAgICAgICAgICAgICAgbWVzc2FnZUlkOiB7IHR5cGU6ICdzdHJpbmcnIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVxdWlyZWQ6IFsncGhvbmUnLCAnaXNHcm91cCcsICdtZXNzYWdlJ11cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBEZWZhdWx0OiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiAnNTUyMTk5OTk5OTk5OScsXHJcbiAgICAgICAgICAgICAgICBpc0dyb3VwOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdSZXBseSB0byBtZXNzYWdlJyxcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VJZDogJzxpZF9tZXNzYWdlPidcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IG1lc3NhZ2UgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XHJcbiAgICByZXN1bHRzLnB1c2goYXdhaXQgcmVxLmNsaWVudC5zZW5kVGV4dCgnc3RhdHVzQGJyb2FkY2FzdCcsIG1lc3NhZ2UpKTtcclxuXHJcbiAgICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDApIHJlcy5zdGF0dXMoNDAwKS5qc29uKCdFcnJvciBzZW5kaW5nIG1lc3NhZ2UnKTtcclxuICAgIHJldHVyblN1Y2VzcyhyZXMsIHJlc3VsdHMpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm5FcnJvcihyZXEsIHJlcywgZXJyb3IpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlcGx5TWVzc2FnZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgXCJwaG9uZVwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBcImlzR3JvdXBcIjogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgIFwibWVzc2FnZVwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBcIm1lc3NhZ2VJZFwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgXCJwaG9uZVwiOiBcIjU1MjE5OTk5OTk5OTlcIixcclxuICAgICAgICAgICAgICAgIFwiaXNHcm91cFwiOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZVwiOiBcIlJlcGx5IHRvIG1lc3NhZ2VcIixcclxuICAgICAgICAgICAgICAgIFwibWVzc2FnZUlkXCI6IFwiPGlkX21lc3NhZ2U+XCJcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lLCBtZXNzYWdlLCBtZXNzYWdlSWQgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgcGhvbmUpIHtcclxuICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHJlcS5jbGllbnQucmVwbHkoY29udGF0bywgbWVzc2FnZSwgbWVzc2FnZUlkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKSByZXMuc3RhdHVzKDQwMCkuanNvbignRXJyb3Igc2VuZGluZyBtZXNzYWdlJyk7XHJcbiAgICByZXEuaW8uZW1pdCgnbWVuc2FnZW0tZW52aWFkYScsIHsgbWVzc2FnZTogbWVzc2FnZSwgdG86IHBob25lIH0pO1xyXG4gICAgcmV0dXJuU3VjZXNzKHJlcywgcmVzdWx0cyk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybkVycm9yKHJlcSwgcmVzLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZE1lbnRpb25lZChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiTWVzc2FnZXNcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gIHJlcXVpcmVkOiB0cnVlLFxyXG4gIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICBcInBob25lXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgXCJpc0dyb3VwXCI6IHsgdHlwZTogXCJib29sZWFuXCIgfSxcclxuICAgICAgICAgIFwibWVzc2FnZVwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgIFwibWVudGlvbmVkXCI6IHsgdHlwZTogXCJhcnJheVwiLCBpdGVtczogeyB0eXBlOiBcInN0cmluZ1wiIH0gfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVxdWlyZWQ6IFtcInBob25lXCIsIFwibWVzc2FnZVwiLCBcIm1lbnRpb25lZFwiXVxyXG4gICAgICB9LFxyXG4gICAgICBleGFtcGxlczoge1xyXG4gICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICBcInBob25lXCI6IFwiZ3JvdXBJZEBnLnVzXCIsXHJcbiAgICAgICAgICAgIFwiaXNHcm91cFwiOiB0cnVlLFxyXG4gICAgICAgICAgICBcIm1lc3NhZ2VcIjogXCJZb3VyIHRleHQgbWVzc2FnZVwiLFxyXG4gICAgICAgICAgICBcIm1lbnRpb25lZFwiOiBbXCI1NTY1OTMwNzcxNzFAYy51c1wiXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUsIG1lc3NhZ2UsIG1lbnRpb25lZCB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2U7XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgcGhvbmUpIHtcclxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LnNlbmRNZW50aW9uZWQoXHJcbiAgICAgICAgYCR7Y29udGF0b31gLFxyXG4gICAgICAgIG1lc3NhZ2UsXHJcbiAgICAgICAgbWVudGlvbmVkXHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlIH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGVycm9yKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gc2VuZCBtZXNzYWdlIG1lbnRpb25lZCcsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZEltYWdlQXNTdGlja2VyKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJNZXNzYWdlc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBcInBob25lXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgIFwiaXNHcm91cFwiOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgXCJwYXRoXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcXVpcmVkOiBbXCJwaG9uZVwiLCBcInBhdGhcIl1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBcInBob25lXCI6IFwiNTUyMTk5OTk5OTk5OVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpc0dyb3VwXCI6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBcInBhdGhcIjogXCI8cGF0aF9maWxlPlwiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwaG9uZSwgcGF0aCB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIGlmICghcGF0aCAmJiAhcmVxLmZpbGUpXHJcbiAgICByZXMuc3RhdHVzKDQwMSkuc2VuZCh7XHJcbiAgICAgIG1lc3NhZ2U6ICdTZW5kaW5nIHRoZSBmaWxlIGlzIG1hbmRhdG9yeScsXHJcbiAgICB9KTtcclxuXHJcbiAgY29uc3QgcGF0aEZpbGUgPSBwYXRoIHx8IHJlcS5maWxlPy5wYXRoO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0czogYW55ID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGNvbnRhdG8gb2YgcGhvbmUpIHtcclxuICAgICAgcmVzdWx0cy5wdXNoKGF3YWl0IHJlcS5jbGllbnQuc2VuZEltYWdlQXNTdGlja2VyKGNvbnRhdG8sIHBhdGhGaWxlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwKSByZXMuc3RhdHVzKDQwMCkuanNvbignRXJyb3Igc2VuZGluZyBtZXNzYWdlJyk7XHJcbiAgICBpZiAocmVxLmZpbGUpIGF3YWl0IHVubGlua0FzeW5jKHBhdGhGaWxlKTtcclxuICAgIHJldHVyblN1Y2VzcyhyZXMsIHJlc3VsdHMpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm5FcnJvcihyZXEsIHJlcywgZXJyb3IpO1xyXG4gIH1cclxufVxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZEltYWdlQXNTdGlja2VyR2lmKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJNZXNzYWdlc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBjb250ZW50OiB7XHJcbiAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBwaG9uZTogeyB0eXBlOiAnc3RyaW5nJyB9LFxyXG4gICAgICAgICAgICAgIGlzR3JvdXA6IHsgdHlwZTogJ2Jvb2xlYW4nIH0sXHJcbiAgICAgICAgICAgICAgcGF0aDogeyB0eXBlOiAnc3RyaW5nJyB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlZDogWydwaG9uZScsICdwYXRoJ10sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgJ0RlZmF1bHQnOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHBob25lOiAnNTUyMTk5OTk5OTk5OScsXHJcbiAgICAgICAgICAgICAgICBpc0dyb3VwOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcGF0aDogJzxwYXRoX2ZpbGU+JyxcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgcGhvbmUsIHBhdGggfSA9IHJlcS5ib2R5O1xyXG5cclxuICBpZiAoIXBhdGggJiYgIXJlcS5maWxlKVxyXG4gICAgcmVzLnN0YXR1cyg0MDEpLnNlbmQoe1xyXG4gICAgICBtZXNzYWdlOiAnU2VuZGluZyB0aGUgZmlsZSBpcyBtYW5kYXRvcnknLFxyXG4gICAgfSk7XHJcblxyXG4gIGNvbnN0IHBhdGhGaWxlID0gcGF0aCB8fCByZXEuZmlsZT8ucGF0aDtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdHM6IGFueSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBjb250YXRvIG9mIHBob25lKSB7XHJcbiAgICAgIHJlc3VsdHMucHVzaChhd2FpdCByZXEuY2xpZW50LnNlbmRJbWFnZUFzU3RpY2tlckdpZihjb250YXRvLCBwYXRoRmlsZSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMCkgcmVzLnN0YXR1cyg0MDApLmpzb24oJ0Vycm9yIHNlbmRpbmcgbWVzc2FnZScpO1xyXG4gICAgaWYgKHJlcS5maWxlKSBhd2FpdCB1bmxpbmtBc3luYyhwYXRoRmlsZSk7XHJcbiAgICByZXR1cm5TdWNlc3MocmVzLCByZXN1bHRzKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmV0dXJuRXJyb3IocmVxLCByZXMsIGVycm9yKTtcclxuICB9XHJcbn1cclxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkEsSUFBQUEsVUFBQSxHQUFBQyxPQUFBLHNCQUFnRCxDQWxCaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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