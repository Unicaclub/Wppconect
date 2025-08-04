"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.addParticipant = addParticipant;exports.changePrivacyGroup = changePrivacyGroup;exports.createGroup = createGroup;exports.demoteParticipant = demoteParticipant;exports.getAllBroadcastList = getAllBroadcastList;exports.getAllGroups = getAllGroups;exports.getCommonGroups = getCommonGroups;exports.getGroupAdmins = getGroupAdmins;exports.getGroupInfoFromInviteLink = getGroupInfoFromInviteLink;exports.getGroupInviteLink = getGroupInviteLink;exports.getGroupMembers = getGroupMembers;exports.getGroupMembersIds = getGroupMembersIds;exports.joinGroupByCode = joinGroupByCode;exports.leaveGroup = leaveGroup;exports.promoteParticipant = promoteParticipant;exports.removeParticipant = removeParticipant;exports.revokeGroupInviteLink = revokeGroupInviteLink;exports.setGroupDescription = setGroupDescription;exports.setGroupProfilePic = setGroupProfilePic;exports.setGroupProperty = setGroupProperty;exports.setGroupSubject = setGroupSubject;exports.setMessagesAdminsOnly = setMessagesAdminsOnly;
















var _functions = require("../util/functions"); /*
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
 */async function getAllGroups(req, res) {/**
     #swagger.tags = ["Group"]
     #swagger.deprecated = true
     #swagger.summary = 'Deprecated in favor of 'list-chats'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */try {const response = await req.client.getAllGroups();res.status(200).json({ status: 'success', response: response });} catch (e) {req.logger.error(e);res.
    status(500).
    json({ status: 'error', message: 'Error fetching groups', error: e });
  }
}

async function joinGroupByCode(req, res) {
  /**
     #swagger.tags = ["Group"]
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
        "application/json": {
          schema: {
            type: "object",
            properties: {
              inviteCode: {
                type: "string"
              }
            },
            required: ["inviteCode"]
          },
          examples: {
            "Default": {
              value: {
                inviteCode: "5644444"
              }
            }
          }
        }
      }
    }
   */
  const { inviteCode } = req.body;

  if (!inviteCode)
  res.status(400).send({ message: 'Invitation Code is required' });

  try {
    await req.client.joinGroup(inviteCode);
    res.status(201).json({
      status: 'success',
      response: {
        message: 'The informed contact(s) entered the group successfully',
        contact: inviteCode
      }
    });
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'The informed contact(s) did not join the group successfully',
      error: error
    });
  }
}

async function createGroup(req, res) {
  /**
     #swagger.tags = ["Group"]
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
        "application/json": {
          schema: {
            type: "object",
            properties: {
              participants: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              name: {
                type: "string"
              }
            },
            required: ["participants", "name"]
          },
          examples: {
            "Default": {
              value: {
                participants: ["5521999999999"],
                name: "Group name"
              }
            }
          }
        }
      }
    }
   */
  const { participants, name } = req.body;

  try {
    let response = {};
    const infoGroup = [];

    for (const group of (0, _functions.groupNameToArray)(name)) {
      response = await req.client.createGroup(
        group,
        (0, _functions.contactToArray)(participants)
      );
      infoGroup.push({
        name: group,
        id: response.gid.user,
        participants: response.participants
      });
    }

    res.status(201).json({
      status: 'success',
      response: {
        message: 'Group(s) created successfully',
        group: name,
        groupInfo: infoGroup
      }
    });
  } catch (e) {
    req.logger.error(e);
    res.
    status(500).
    json({ status: 'error', message: 'Error creating group(s)', error: e });
  }
}

async function leaveGroup(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              groupId: { type: "string" }
            },
            required: ["groupId"]
          }
        }
      }
    }
   */
  const { groupId } = req.body;

  try {
    for (const group of (0, _functions.groupToArray)(groupId)) {
      await req.client.leaveGroup(group);
    }

    res.status(200).json({
      status: 'success',
      response: { messages: 'Você saiu do grupo com sucesso', group: groupId }
    });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao sair do(s) grupo(s)',
      error: e
    });
  }
}

async function getGroupMembers(req, res) {
  /**
     #swagger.tags = ["Group"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  const { groupId } = req.params;

  try {
    let response = {};
    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.getGroupMembers(group);
    }
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get group members',
      error: e
    });
  }
}

async function addParticipant(req, res) {
  /**
     #swagger.tags = ["Group"]
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
        "application/json": {
          schema: {
            type: "object",
            properties: {
              groupId: { type: "string" },
              phone: { type: "string" }
            },
            required: ["groupId", "phone"]
          },
          examples: {
            "Default": {
              value: {
                groupId: "<groupId>",
                phone: "5521999999999"
              }
            }
          }
        }
      }
    }
   */
  const { groupId, phone } = req.body;

  try {
    let response = {};
    const arrayGroups = [];

    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.addParticipant(group, (0, _functions.contactToArray)(phone));
      arrayGroups.push(response);
    }

    res.status(201).json({
      status: 'success',
      response: {
        message: 'Addition to group attempted.',
        participants: phone,
        groups: (0, _functions.groupToArray)(groupId),
        result: arrayGroups
      }
    });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error adding participant(s)',
      error: e
    });
  }
}

async function removeParticipant(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              "groupId": { type: "string" },
              "phone": { type: "string" }
            },
            required: ["groupId", "phone"]
          },
          examples: {
            "Default": {
              value: {
                "groupId": "<groupId>",
                "phone": "5521999999999"
              }
            }
          }
        }
      }
    }
   */
  const { groupId, phone } = req.body;

  try {
    let response = {};
    const arrayGroups = [];

    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.removeParticipant(
        group,
        (0, _functions.contactToArray)(phone)
      );
      arrayGroups.push(response);
    }

    res.status(200).json({
      status: 'success',
      response: {
        message: 'Participant(s) removed successfully',
        participants: phone,
        groups: arrayGroups
      }
    });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error removing participant(s)',
      error: e
    });
  }
}

async function promoteParticipant(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              "groupId": { type: "string" },
              "phone": { type: "string" }
            },
            required: ["groupId", "phone"]
          },
          examples: {
            "Default": {
              value: {
                "groupId": "<groupId>",
                "phone": "5521999999999"
              }
            }
          }
        }
      }
    }
   */
  const { groupId, phone } = req.body;

  try {
    const arrayGroups = [];
    for (const group of (0, _functions.groupToArray)(groupId)) {
      await req.client.promoteParticipant(group, (0, _functions.contactToArray)(phone));
      arrayGroups.push(group);
    }

    res.status(201).json({
      status: 'success',
      response: {
        message: 'Successful promoted participant(s)',
        participants: phone,
        groups: arrayGroups
      }
    });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error promoting participant(s)',
      error: e
    });
  }
}

async function demoteParticipant(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              "groupId": { type: "string" },
              "phone": { type: "string" }
            },
            required: ["groupId", "phone"]
          },
          examples: {
            "Default": {
              value: {
                "groupId": "<groupId>",
                "phone": "5521999999999"
              }
            }
          }
        }
      }
    }
   */
  const { groupId, phone } = req.body;

  try {
    const arrayGroups = [];
    for (const group of (0, _functions.groupToArray)(groupId)) {
      await req.client.demoteParticipant(group, (0, _functions.contactToArray)(phone));
      arrayGroups.push(group);
    }

    res.status(201).json({
      status: 'success',
      response: {
        message: 'Admin of participant(s) revoked successfully',
        participants: phone,
        groups: arrayGroups
      }
    });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: "Error revoking participant's admin(s)",
      error: e
    });
  }
}

async function getGroupAdmins(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              "groupId": { type: "string" }
            },
            required: ["groupId"]
          },
          examples: {
            "Default": {
              value: {
                "groupId": "<groupId>"
              }
            }
          }
        }
      }
    }
   */
  const { groupId } = req.params;

  try {
    let response = {};
    const arrayGroups = [];

    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.getGroupAdmins(group);
      arrayGroups.push(response);
    }

    res.status(200).json({ status: 'success', response: arrayGroups });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving group admin(s)',
      error: e
    });
  }
}

async function getGroupInviteLink(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              groupId: { type: "string" }
            }
          }
        }
      }
    }
   */
  const { groupId } = req.params;
  try {
    let response = {};
    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.getGroupInviteLink(group);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get group invite link',
      error: e
    });
  }
}

async function revokeGroupInviteLink(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              $groupId: { type: "string" }
            }
          }
        }
      }
    }
   */
  const { groupId } = req.params;

  let response = {};

  try {
    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.revokeGroupInviteLink(group);
    }

    res.status(200).json({
      status: 'Success',
      response: response
    });
  } catch (e) {
    req.logger.error(e);
    res.status(400).json({
      status: 'error',
      message: 'Error on revoke group invite link',
      error: e
    });
  }
}

async function getAllBroadcastList(req, res) {
  /**
     #swagger.tags = ["Misc"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const response = await req.client.getAllBroadcastList();
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get all broad cast list',
      error: e
    });
  }
}

async function getGroupInfoFromInviteLink(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              $invitecode: { type: "string" }
            }
          }
        }
      }
    }
   */
  try {
    const { invitecode } = req.body;
    const response = await req.client.getGroupInfoFromInviteLink(invitecode);
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get group info from invite link',
      error: e
    });
  }
}

async function getGroupMembersIds(req, res) {
  /**
     #swagger.tags = ["Group"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["groupId"] = {
      schema: '<groupId>'
     }
   */
  const { groupId } = req.params;
  let response = {};
  try {
    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.getGroupMembersIds(group);
    }
    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get group members ids',
      error: e
    });
  }
}

async function setGroupDescription(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              $groupId: { type: "string" },
              $description: { type: "string" }
            }
          }
        }
      }
    }
   */
  const { groupId, description } = req.body;

  let response = {};

  try {
    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.setGroupDescription(group, description);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on set group description',
      error: e
    });
  }
}

async function setGroupProperty(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              $groupId: { type: "string" },
              $property: { type: "string" },
              $value: { type: "boolean" }
            }
          }
        }
      }
    }
   */
  const { groupId, property, value = true } = req.body;

  let response = {};

  try {
    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.setGroupProperty(group, property, value);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on set group property',
      error: e
    });
  }
}

async function setGroupSubject(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              $groupId: { type: "string" },
              $title: { type: "string" }
            }
          }
        }
      }
    }
   */
  const { groupId, title } = req.body;

  let response = {};

  try {
    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.setGroupSubject(group, title);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on set group subject',
      error: e
    });
  }
}

async function setMessagesAdminsOnly(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              $groupId: { type: "string" },
              $value: { type: "boolean" }
            }
          }
        }
      }
    }
   */
  const { groupId, value = true } = req.body;

  let response = {};

  try {
    for (const group of (0, _functions.groupToArray)(groupId)) {
      response = await req.client.setMessagesAdminsOnly(group, value);
    }

    res.status(200).json({ status: 'success', response: response });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on set messages admins only',
      error: e
    });
  }
}

async function changePrivacyGroup(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              $groupId: { type: "string" },
              $status: { type: "boolean" }
            }
          }
        }
      }
    }
   */
  const { groupId, status } = req.body;

  try {
    for (const group of (0, _functions.contactToArray)(groupId)) {
      await req.client.setGroupProperty(
        group,
        'restrict',
        status === 'true'
      );
    }

    res.status(200).json({
      status: 'success',
      response: { message: 'Group privacy changed successfully' }
    });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error changing group privacy',
      error: e
    });
  }
}

async function setGroupProfilePic(req, res) {
  /**
     #swagger.tags = ["Group"]
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
              $groupId: { type: "string" },
              $path: { type: "string" }
            }
          }
        }
      }
    }
   */
  const { groupId, path } = req.body;

  if (!path && !req.file)
  res.status(401).send({
    message: 'Sending the image is mandatory'
  });

  const pathFile = path || req.file?.path;

  try {
    for (const contact of (0, _functions.contactToArray)(groupId, true)) {
      await req.client.setGroupIcon(contact, pathFile);
    }

    res.status(201).json({
      status: 'success',
      response: { message: 'Group profile photo successfully changed' }
    });
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error changing group photo',
      error: e
    });
  }
}

async function getCommonGroups(req, res) {
  /**
     #swagger.tags = ["Group"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["wid"] = {
      schema: '5521999999999@c.us'
     }
   */
  const { wid } = req.params;
  try {
    res.status(200).json(await req.client.getCommonGroups(wid));
  } catch (e) {
    req.logger.error(e);
    res.status(500).json({
      status: 'error',
      message: 'Error on get common groups',
      error: e
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZnVuY3Rpb25zIiwicmVxdWlyZSIsImdldEFsbEdyb3VwcyIsInJlcSIsInJlcyIsInJlc3BvbnNlIiwiY2xpZW50Iiwic3RhdHVzIiwianNvbiIsImUiLCJsb2dnZXIiLCJlcnJvciIsIm1lc3NhZ2UiLCJqb2luR3JvdXBCeUNvZGUiLCJpbnZpdGVDb2RlIiwiYm9keSIsInNlbmQiLCJqb2luR3JvdXAiLCJjb250YWN0IiwiY3JlYXRlR3JvdXAiLCJwYXJ0aWNpcGFudHMiLCJuYW1lIiwiaW5mb0dyb3VwIiwiZ3JvdXAiLCJncm91cE5hbWVUb0FycmF5IiwiY29udGFjdFRvQXJyYXkiLCJwdXNoIiwiaWQiLCJnaWQiLCJ1c2VyIiwiZ3JvdXBJbmZvIiwibGVhdmVHcm91cCIsImdyb3VwSWQiLCJncm91cFRvQXJyYXkiLCJtZXNzYWdlcyIsImdldEdyb3VwTWVtYmVycyIsInBhcmFtcyIsImFkZFBhcnRpY2lwYW50IiwicGhvbmUiLCJhcnJheUdyb3VwcyIsImdyb3VwcyIsInJlc3VsdCIsInJlbW92ZVBhcnRpY2lwYW50IiwicHJvbW90ZVBhcnRpY2lwYW50IiwiZGVtb3RlUGFydGljaXBhbnQiLCJnZXRHcm91cEFkbWlucyIsImdldEdyb3VwSW52aXRlTGluayIsInJldm9rZUdyb3VwSW52aXRlTGluayIsImdldEFsbEJyb2FkY2FzdExpc3QiLCJnZXRHcm91cEluZm9Gcm9tSW52aXRlTGluayIsImludml0ZWNvZGUiLCJnZXRHcm91cE1lbWJlcnNJZHMiLCJzZXRHcm91cERlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb24iLCJzZXRHcm91cFByb3BlcnR5IiwicHJvcGVydHkiLCJ2YWx1ZSIsInNldEdyb3VwU3ViamVjdCIsInRpdGxlIiwic2V0TWVzc2FnZXNBZG1pbnNPbmx5IiwiY2hhbmdlUHJpdmFjeUdyb3VwIiwic2V0R3JvdXBQcm9maWxlUGljIiwicGF0aCIsImZpbGUiLCJwYXRoRmlsZSIsInNldEdyb3VwSWNvbiIsImdldENvbW1vbkdyb3VwcyIsIndpZCJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVyL2dyb3VwQ29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBDb3B5cmlnaHQgMjAyMyBXUFBDb25uZWN0IFRlYW1cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqL1xyXG5pbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xyXG5cclxuaW1wb3J0IHtcclxuICBjb250YWN0VG9BcnJheSxcclxuICBncm91cE5hbWVUb0FycmF5LFxyXG4gIGdyb3VwVG9BcnJheSxcclxufSBmcm9tICcuLi91dGlsL2Z1bmN0aW9ucyc7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QWxsR3JvdXBzKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJHcm91cFwiXVxyXG4gICAgICNzd2FnZ2VyLmRlcHJlY2F0ZWQgPSB0cnVlXHJcbiAgICAgI3N3YWdnZXIuc3VtbWFyeSA9ICdEZXByZWNhdGVkIGluIGZhdm9yIG9mICdsaXN0LWNoYXRzJ1xyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICovXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRBbGxHcm91cHMoKTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlc1xyXG4gICAgICAuc3RhdHVzKDUwMClcclxuICAgICAgLmpzb24oeyBzdGF0dXM6ICdlcnJvcicsIG1lc3NhZ2U6ICdFcnJvciBmZXRjaGluZyBncm91cHMnLCBlcnJvcjogZSB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBqb2luR3JvdXBCeUNvZGUocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkdyb3VwXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIGNvbnRlbnQ6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBpbnZpdGVDb2RlOiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlZDogW1wiaW52aXRlQ29kZVwiXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIGludml0ZUNvZGU6IFwiNTY0NDQ0NFwiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBpbnZpdGVDb2RlIH0gPSByZXEuYm9keTtcclxuXHJcbiAgaWYgKCFpbnZpdGVDb2RlKVxyXG4gICAgcmVzLnN0YXR1cyg0MDApLnNlbmQoeyBtZXNzYWdlOiAnSW52aXRhdGlvbiBDb2RlIGlzIHJlcXVpcmVkJyB9KTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGF3YWl0IHJlcS5jbGllbnQuam9pbkdyb3VwKGludml0ZUNvZGUpO1xyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdzdWNjZXNzJyxcclxuICAgICAgcmVzcG9uc2U6IHtcclxuICAgICAgICBtZXNzYWdlOiAnVGhlIGluZm9ybWVkIGNvbnRhY3QocykgZW50ZXJlZCB0aGUgZ3JvdXAgc3VjY2Vzc2Z1bGx5JyxcclxuICAgICAgICBjb250YWN0OiBpbnZpdGVDb2RlLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdUaGUgaW5mb3JtZWQgY29udGFjdChzKSBkaWQgbm90IGpvaW4gdGhlIGdyb3VwIHN1Y2Nlc3NmdWxseScsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUdyb3VwKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJHcm91cFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBjb250ZW50OiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgcGFydGljaXBhbnRzOiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcImFycmF5XCIsXHJcbiAgICAgICAgICAgICAgICBpdGVtczoge1xyXG4gICAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBuYW1lOiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlZDogW1wicGFydGljaXBhbnRzXCIsIFwibmFtZVwiXVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50czogW1wiNTUyMTk5OTk5OTk5OVwiXSxcclxuICAgICAgICAgICAgICAgIG5hbWU6IFwiR3JvdXAgbmFtZVwiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBwYXJ0aWNpcGFudHMsIG5hbWUgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgbGV0IHJlc3BvbnNlID0ge307XHJcbiAgICBjb25zdCBpbmZvR3JvdXA6IGFueSA9IFtdO1xyXG5cclxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgZ3JvdXBOYW1lVG9BcnJheShuYW1lKSkge1xyXG4gICAgICByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuY3JlYXRlR3JvdXAoXHJcbiAgICAgICAgZ3JvdXAsXHJcbiAgICAgICAgY29udGFjdFRvQXJyYXkocGFydGljaXBhbnRzKVxyXG4gICAgICApO1xyXG4gICAgICBpbmZvR3JvdXAucHVzaCh7XHJcbiAgICAgICAgbmFtZTogZ3JvdXAsXHJcbiAgICAgICAgaWQ6IChyZXNwb25zZSBhcyBhbnkpLmdpZC51c2VyLFxyXG4gICAgICAgIHBhcnRpY2lwYW50czogKHJlc3BvbnNlIGFzIGFueSkucGFydGljaXBhbnRzLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ3N1Y2Nlc3MnLFxyXG4gICAgICByZXNwb25zZToge1xyXG4gICAgICAgIG1lc3NhZ2U6ICdHcm91cChzKSBjcmVhdGVkIHN1Y2Nlc3NmdWxseScsXHJcbiAgICAgICAgZ3JvdXA6IG5hbWUsXHJcbiAgICAgICAgZ3JvdXBJbmZvOiBpbmZvR3JvdXAsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzXHJcbiAgICAgIC5zdGF0dXMoNTAwKVxyXG4gICAgICAuanNvbih7IHN0YXR1czogJ2Vycm9yJywgbWVzc2FnZTogJ0Vycm9yIGNyZWF0aW5nIGdyb3VwKHMpJywgZXJyb3I6IGUgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbGVhdmVHcm91cChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiR3JvdXBcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgZ3JvdXBJZDogeyB0eXBlOiBcInN0cmluZ1wiIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcmVxdWlyZWQ6IFtcImdyb3VwSWRcIl1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGdyb3VwSWQgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgZm9yIChjb25zdCBncm91cCBvZiBncm91cFRvQXJyYXkoZ3JvdXBJZCkpIHtcclxuICAgICAgYXdhaXQgcmVxLmNsaWVudC5sZWF2ZUdyb3VwKGdyb3VwKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ3N1Y2Nlc3MnLFxyXG4gICAgICByZXNwb25zZTogeyBtZXNzYWdlczogJ1ZvY8OqIHNhaXUgZG8gZ3J1cG8gY29tIHN1Y2Vzc28nLCBncm91cDogZ3JvdXBJZCB9LFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJybyBhbyBzYWlyIGRvKHMpIGdydXBvKHMpJyxcclxuICAgICAgZXJyb3I6IGUsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRHcm91cE1lbWJlcnMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkdyb3VwXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGdyb3VwSWQgfSA9IHJlcS5wYXJhbXM7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2UgPSB7fTtcclxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgZ3JvdXBUb0FycmF5KGdyb3VwSWQpKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRHcm91cE1lbWJlcnMoZ3JvdXApO1xyXG4gICAgfVxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3BvbnNlIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGdldCBncm91cCBtZW1iZXJzJyxcclxuICAgICAgZXJyb3I6IGUsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRQYXJ0aWNpcGFudChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiR3JvdXBcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgY29udGVudDoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIGdyb3VwSWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgIHBob25lOiB7IHR5cGU6IFwic3RyaW5nXCIgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlZDogW1wiZ3JvdXBJZFwiLCBcInBob25lXCJdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgZ3JvdXBJZDogXCI8Z3JvdXBJZD5cIixcclxuICAgICAgICAgICAgICAgIHBob25lOiBcIjU1MjE5OTk5OTk5OTlcIlxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgZ3JvdXBJZCwgcGhvbmUgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgbGV0IHJlc3BvbnNlID0ge307XHJcbiAgICBjb25zdCBhcnJheUdyb3VwczogYW55ID0gW107XHJcblxyXG4gICAgZm9yIChjb25zdCBncm91cCBvZiBncm91cFRvQXJyYXkoZ3JvdXBJZCkpIHtcclxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmFkZFBhcnRpY2lwYW50KGdyb3VwLCBjb250YWN0VG9BcnJheShwaG9uZSkpO1xyXG4gICAgICBhcnJheUdyb3Vwcy5wdXNoKHJlc3BvbnNlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ3N1Y2Nlc3MnLFxyXG4gICAgICByZXNwb25zZToge1xyXG4gICAgICAgIG1lc3NhZ2U6ICdBZGRpdGlvbiB0byBncm91cCBhdHRlbXB0ZWQuJyxcclxuICAgICAgICBwYXJ0aWNpcGFudHM6IHBob25lLFxyXG4gICAgICAgIGdyb3VwczogZ3JvdXBUb0FycmF5KGdyb3VwSWQpLFxyXG4gICAgICAgIHJlc3VsdDogYXJyYXlHcm91cHMsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBhZGRpbmcgcGFydGljaXBhbnQocyknLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVBhcnRpY2lwYW50KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJHcm91cFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBcImdyb3VwSWRcIjogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgXCJwaG9uZVwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlZDogW1wiZ3JvdXBJZFwiLCBcInBob25lXCJdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgXCJncm91cElkXCI6IFwiPGdyb3VwSWQ+XCIsXHJcbiAgICAgICAgICAgICAgICBcInBob25lXCI6IFwiNTUyMTk5OTk5OTk5OVwiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBncm91cElkLCBwaG9uZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2U6IGFueSA9IHt9O1xyXG4gICAgY29uc3QgYXJyYXlHcm91cHM6IGFueSA9IFtdO1xyXG5cclxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgZ3JvdXBUb0FycmF5KGdyb3VwSWQpKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5yZW1vdmVQYXJ0aWNpcGFudChcclxuICAgICAgICBncm91cCxcclxuICAgICAgICBjb250YWN0VG9BcnJheShwaG9uZSlcclxuICAgICAgKTtcclxuICAgICAgYXJyYXlHcm91cHMucHVzaChyZXNwb25zZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdzdWNjZXNzJyxcclxuICAgICAgcmVzcG9uc2U6IHtcclxuICAgICAgICBtZXNzYWdlOiAnUGFydGljaXBhbnQocykgcmVtb3ZlZCBzdWNjZXNzZnVsbHknLFxyXG4gICAgICAgIHBhcnRpY2lwYW50czogcGhvbmUsXHJcbiAgICAgICAgZ3JvdXBzOiBhcnJheUdyb3VwcyxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIHJlbW92aW5nIHBhcnRpY2lwYW50KHMpJyxcclxuICAgICAgZXJyb3I6IGUsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tb3RlUGFydGljaXBhbnQocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkdyb3VwXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIFwiZ3JvdXBJZFwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICBcInBob25lXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcXVpcmVkOiBbXCJncm91cElkXCIsIFwicGhvbmVcIl1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICBcImdyb3VwSWRcIjogXCI8Z3JvdXBJZD5cIixcclxuICAgICAgICAgICAgICAgIFwicGhvbmVcIjogXCI1NTIxOTk5OTk5OTk5XCJcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGdyb3VwSWQsIHBob25lIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGFycmF5R3JvdXBzOiBhbnkgPSBbXTtcclxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgZ3JvdXBUb0FycmF5KGdyb3VwSWQpKSB7XHJcbiAgICAgIGF3YWl0IHJlcS5jbGllbnQucHJvbW90ZVBhcnRpY2lwYW50KGdyb3VwLCBjb250YWN0VG9BcnJheShwaG9uZSkpO1xyXG4gICAgICBhcnJheUdyb3Vwcy5wdXNoKGdyb3VwKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ3N1Y2Nlc3MnLFxyXG4gICAgICByZXNwb25zZToge1xyXG4gICAgICAgIG1lc3NhZ2U6ICdTdWNjZXNzZnVsIHByb21vdGVkIHBhcnRpY2lwYW50KHMpJyxcclxuICAgICAgICBwYXJ0aWNpcGFudHM6IHBob25lLFxyXG4gICAgICAgIGdyb3VwczogYXJyYXlHcm91cHMsXHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBwcm9tb3RpbmcgcGFydGljaXBhbnQocyknLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlbW90ZVBhcnRpY2lwYW50KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJHcm91cFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBcImdyb3VwSWRcIjogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgXCJwaG9uZVwiOiB7IHR5cGU6IFwic3RyaW5nXCIgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlZDogW1wiZ3JvdXBJZFwiLCBcInBob25lXCJdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgXCJncm91cElkXCI6IFwiPGdyb3VwSWQ+XCIsXHJcbiAgICAgICAgICAgICAgICBcInBob25lXCI6IFwiNTUyMTk5OTk5OTk5OVwiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBncm91cElkLCBwaG9uZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCBhcnJheUdyb3VwczogYW55ID0gW107XHJcbiAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIGdyb3VwVG9BcnJheShncm91cElkKSkge1xyXG4gICAgICBhd2FpdCByZXEuY2xpZW50LmRlbW90ZVBhcnRpY2lwYW50KGdyb3VwLCBjb250YWN0VG9BcnJheShwaG9uZSkpO1xyXG4gICAgICBhcnJheUdyb3Vwcy5wdXNoKGdyb3VwKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ3N1Y2Nlc3MnLFxyXG4gICAgICByZXNwb25zZToge1xyXG4gICAgICAgIG1lc3NhZ2U6ICdBZG1pbiBvZiBwYXJ0aWNpcGFudChzKSByZXZva2VkIHN1Y2Nlc3NmdWxseScsXHJcbiAgICAgICAgcGFydGljaXBhbnRzOiBwaG9uZSxcclxuICAgICAgICBncm91cHM6IGFycmF5R3JvdXBzLFxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiBcIkVycm9yIHJldm9raW5nIHBhcnRpY2lwYW50J3MgYWRtaW4ocylcIixcclxuICAgICAgZXJyb3I6IGUsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRHcm91cEFkbWlucyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiR3JvdXBcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgXCJncm91cElkXCI6IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHJlcXVpcmVkOiBbXCJncm91cElkXCJdXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgXCJncm91cElkXCI6IFwiPGdyb3VwSWQ+XCJcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGdyb3VwSWQgfSA9IHJlcS5wYXJhbXM7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2UgPSB7fTtcclxuICAgIGNvbnN0IGFycmF5R3JvdXBzOiBhbnkgPSBbXTtcclxuXHJcbiAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIGdyb3VwVG9BcnJheShncm91cElkKSkge1xyXG4gICAgICByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0R3JvdXBBZG1pbnMoZ3JvdXApO1xyXG4gICAgICBhcnJheUdyb3Vwcy5wdXNoKHJlc3BvbnNlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogYXJyYXlHcm91cHMgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3IgcmV0cmlldmluZyBncm91cCBhZG1pbihzKScsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0R3JvdXBJbnZpdGVMaW5rKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJHcm91cFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBncm91cElkOiB7IHR5cGU6IFwic3RyaW5nXCIgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBncm91cElkIH0gPSByZXEucGFyYW1zO1xyXG4gIHRyeSB7XHJcbiAgICBsZXQgcmVzcG9uc2UgPSB7fTtcclxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgZ3JvdXBUb0FycmF5KGdyb3VwSWQpKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5nZXRHcm91cEludml0ZUxpbmsoZ3JvdXApO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgZ3JvdXAgaW52aXRlIGxpbmsnLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJldm9rZUdyb3VwSW52aXRlTGluayhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiR3JvdXBcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgJGdyb3VwSWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGdyb3VwSWQgfSA9IHJlcS5wYXJhbXM7XHJcblxyXG4gIGxldCByZXNwb25zZSA9IHt9O1xyXG5cclxuICB0cnkge1xyXG4gICAgZm9yIChjb25zdCBncm91cCBvZiBncm91cFRvQXJyYXkoZ3JvdXBJZCkpIHtcclxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LnJldm9rZUdyb3VwSW52aXRlTGluayhncm91cCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdTdWNjZXNzJyxcclxuICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxyXG4gICAgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNDAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gcmV2b2tlIGdyb3VwIGludml0ZSBsaW5rJyxcclxuICAgICAgZXJyb3I6IGUsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGxCcm9hZGNhc3RMaXN0KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJNaXNjXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmdldEFsbEJyb2FkY2FzdExpc3QoKTtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgYWxsIGJyb2FkIGNhc3QgbGlzdCcsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0R3JvdXBJbmZvRnJvbUludml0ZUxpbmsocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkdyb3VwXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICRpbnZpdGVjb2RlOiB7IHR5cGU6IFwic3RyaW5nXCIgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHsgaW52aXRlY29kZSB9ID0gcmVxLmJvZHk7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0R3JvdXBJbmZvRnJvbUludml0ZUxpbmsoaW52aXRlY29kZSk7XHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gZ2V0IGdyb3VwIGluZm8gZnJvbSBpbnZpdGUgbGluaycsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0R3JvdXBNZW1iZXJzSWRzKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJHcm91cFwiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcImdyb3VwSWRcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJzxncm91cElkPidcclxuICAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBncm91cElkIH0gPSByZXEucGFyYW1zO1xyXG4gIGxldCByZXNwb25zZSA9IHt9O1xyXG4gIHRyeSB7XHJcbiAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIGdyb3VwVG9BcnJheShncm91cElkKSkge1xyXG4gICAgICByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZ2V0R3JvdXBNZW1iZXJzSWRzKGdyb3VwKTtcclxuICAgIH1cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgZ3JvdXAgbWVtYmVycyBpZHMnLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEdyb3VwRGVzY3JpcHRpb24ocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkdyb3VwXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICRncm91cElkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAkZGVzY3JpcHRpb246IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGdyb3VwSWQsIGRlc2NyaXB0aW9uIH0gPSByZXEuYm9keTtcclxuXHJcbiAgbGV0IHJlc3BvbnNlID0ge307XHJcblxyXG4gIHRyeSB7XHJcbiAgICBmb3IgKGNvbnN0IGdyb3VwIG9mIGdyb3VwVG9BcnJheShncm91cElkKSkge1xyXG4gICAgICByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuc2V0R3JvdXBEZXNjcmlwdGlvbihncm91cCwgZGVzY3JpcHRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBzZXQgZ3JvdXAgZGVzY3JpcHRpb24nLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEdyb3VwUHJvcGVydHkocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkdyb3VwXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICRncm91cElkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAkcHJvcGVydHk6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICR2YWx1ZTogeyB0eXBlOiBcImJvb2xlYW5cIiB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGdyb3VwSWQsIHByb3BlcnR5LCB2YWx1ZSA9IHRydWUgfSA9IHJlcS5ib2R5O1xyXG5cclxuICBsZXQgcmVzcG9uc2UgPSB7fTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgZ3JvdXBUb0FycmF5KGdyb3VwSWQpKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5zZXRHcm91cFByb3BlcnR5KGdyb3VwLCBwcm9wZXJ0eSwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBzZXQgZ3JvdXAgcHJvcGVydHknLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEdyb3VwU3ViamVjdChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiR3JvdXBcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgJGdyb3VwSWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICR0aXRsZTogeyB0eXBlOiBcInN0cmluZ1wiIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgZ3JvdXBJZCwgdGl0bGUgfSA9IHJlcS5ib2R5O1xyXG5cclxuICBsZXQgcmVzcG9uc2UgPSB7fTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGZvciAoY29uc3QgZ3JvdXAgb2YgZ3JvdXBUb0FycmF5KGdyb3VwSWQpKSB7XHJcbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5zZXRHcm91cFN1YmplY3QoZ3JvdXAsIHRpdGxlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzcG9uc2UgfSk7XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gc2V0IGdyb3VwIHN1YmplY3QnLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldE1lc3NhZ2VzQWRtaW5zT25seShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiR3JvdXBcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgJGdyb3VwSWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICR2YWx1ZTogeyB0eXBlOiBcImJvb2xlYW5cIiB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGdyb3VwSWQsIHZhbHVlID0gdHJ1ZSB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIGxldCByZXNwb25zZSA9IHt9O1xyXG5cclxuICB0cnkge1xyXG4gICAgZm9yIChjb25zdCBncm91cCBvZiBncm91cFRvQXJyYXkoZ3JvdXBJZCkpIHtcclxuICAgICAgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LnNldE1lc3NhZ2VzQWRtaW5zT25seShncm91cCwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXNwb25zZSB9KTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBzZXQgbWVzc2FnZXMgYWRtaW5zIG9ubHknLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoYW5nZVByaXZhY3lHcm91cChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiR3JvdXBcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgJGdyb3VwSWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICRzdGF0dXM6IHsgdHlwZTogXCJib29sZWFuXCIgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBncm91cElkLCBzdGF0dXMgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgZm9yIChjb25zdCBncm91cCBvZiBjb250YWN0VG9BcnJheShncm91cElkKSkge1xyXG4gICAgICBhd2FpdCByZXEuY2xpZW50LnNldEdyb3VwUHJvcGVydHkoXHJcbiAgICAgICAgZ3JvdXAsXHJcbiAgICAgICAgJ3Jlc3RyaWN0JyBhcyBhbnksXHJcbiAgICAgICAgc3RhdHVzID09PSAndHJ1ZSdcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ3N1Y2Nlc3MnLFxyXG4gICAgICByZXNwb25zZTogeyBtZXNzYWdlOiAnR3JvdXAgcHJpdmFjeSBjaGFuZ2VkIHN1Y2Nlc3NmdWxseScgfSxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIGNoYW5naW5nIGdyb3VwIHByaXZhY3knLFxyXG4gICAgICBlcnJvcjogZSxcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldEdyb3VwUHJvZmlsZVBpYyhyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAjc3dhZ2dlci50YWdzID0gW1wiR3JvdXBcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgJGdyb3VwSWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICRwYXRoOiB7IHR5cGU6IFwic3RyaW5nXCIgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBncm91cElkLCBwYXRoIH0gPSByZXEuYm9keTtcclxuXHJcbiAgaWYgKCFwYXRoICYmICFyZXEuZmlsZSlcclxuICAgIHJlcy5zdGF0dXMoNDAxKS5zZW5kKHtcclxuICAgICAgbWVzc2FnZTogJ1NlbmRpbmcgdGhlIGltYWdlIGlzIG1hbmRhdG9yeScsXHJcbiAgICB9KTtcclxuXHJcbiAgY29uc3QgcGF0aEZpbGUgPSBwYXRoIHx8IHJlcS5maWxlPy5wYXRoO1xyXG5cclxuICB0cnkge1xyXG4gICAgZm9yIChjb25zdCBjb250YWN0IG9mIGNvbnRhY3RUb0FycmF5KGdyb3VwSWQsIHRydWUpKSB7XHJcbiAgICAgIGF3YWl0IHJlcS5jbGllbnQuc2V0R3JvdXBJY29uKGNvbnRhY3QsIHBhdGhGaWxlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ3N1Y2Nlc3MnLFxyXG4gICAgICByZXNwb25zZTogeyBtZXNzYWdlOiAnR3JvdXAgcHJvZmlsZSBwaG90byBzdWNjZXNzZnVsbHkgY2hhbmdlZCcgfSxcclxuICAgIH0pO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZSk7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIGNoYW5naW5nIGdyb3VwIHBob3RvJyxcclxuICAgICAgZXJyb3I6IGUsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDb21tb25Hcm91cHMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgI3N3YWdnZXIudGFncyA9IFtcIkdyb3VwXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wid2lkXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICc1NTIxOTk5OTk5OTk5QGMudXMnXHJcbiAgICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgd2lkIH0gPSByZXEucGFyYW1zO1xyXG4gIHRyeSB7XHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbihhd2FpdCAocmVxLmNsaWVudCBhcyBhbnkpLmdldENvbW1vbkdyb3Vwcyh3aWQpKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGUpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgY29tbW9uIGdyb3VwcycsXHJcbiAgICAgIGVycm9yOiBlLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkEsSUFBQUEsVUFBQSxHQUFBQyxPQUFBLHNCQUkyQixDQXJCM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBU08sZUFBZUMsWUFBWUEsQ0FBQ0MsR0FBWSxFQUFFQyxHQUFhLEVBQUUsQ0FDOUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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