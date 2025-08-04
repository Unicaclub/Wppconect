"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.addSubgroupsCommunity = addSubgroupsCommunity;exports.createCommunity = createCommunity;exports.deactivateCommunity = deactivateCommunity;exports.demoteCommunityParticipant = demoteCommunityParticipant;exports.getCommunityParticipants = getCommunityParticipants;exports.promoteCommunityParticipant = promoteCommunityParticipant;exports.removeSubgroupsCommunity = removeSubgroupsCommunity; /*
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
 */



async function createCommunity(req, res) {
  /**
       #swagger.tags = ["Community"]
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
                name: { type: "string" },
                description: { type: "boolean" },
                groupIds: { type: "array" },
              }
            },
            examples: {
              "Default": {
                value: {
                  name: "My community name",
                  description: "Description for your community",
                  groupIds: ["groupId1", "groupId2"],
                }
              },
            }
          }
        }
       }
     */
  const { name, description, groupIds } = req.body;

  try {
    const response = await req.client.createCommunity(
      name,
      description,
      groupIds
    );

    res.status(200).json(response);
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on create community',
      error: error
    });
  }
}

async function deactivateCommunity(req, res) {
  /**
         #swagger.tags = ["Community"]
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
                }
              },
              examples: {
                "Default": {
                  value: {
                    id: "<you_community_id@g.us>",
                  }
                },
              }
            }
          }
         }
       */
  const { id } = req.body;

  try {
    const response = await req.client.deactivateCommunity(id);

    res.status(200).json(response);
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on deactivate community',
      error: error
    });
  }
}

async function addSubgroupsCommunity(req, res) {
  /**
    #swagger.tags = ["Community"]
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
                        groupsIds: { type: "array" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                            id: "<you_community_id@g.us>",
                            groupsIds: ["group1Id@g.us"]
                        }
                    },
                }
            }
        }
    }
    */
  const { id, groupsIds } = req.body;

  try {
    const response = await req.client.addSubgroupsCommunity(id, groupsIds);

    res.status(200).json(response);
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on add subgroup',
      error: error
    });
  }
}

async function removeSubgroupsCommunity(req, res) {
  /**
     #swagger.tags = ["Community"]
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
                        groupsIds: { type: "array" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                            id: "<you_community_id@g.us>",
                            groupsIds: ["group1Id@g.us"]
                        }
                    },
                }
            }
        }
    }
    */
  const { id, groupsIds } = req.body;

  try {
    const response = await req.client.removeSubgroupsCommunity(id, groupsIds);

    res.status(200).json(response);
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on remove subgroup',
      error: error
    });
  }
}

async function demoteCommunityParticipant(req, res) {
  /**
    #swagger.tags = ["Community"]
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
                        participantsId: { type: "array" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                            id: "<you_community_id@g.us>",
                            participantsId: ["group1Id@g.us"]
                        }
                    },
                }
            }
        }
    }
    */
  const { id, participantsId } = req.body;

  try {
    const response = await req.client.demoteCommunityParticipant(
      id,
      participantsId
    );

    res.status(200).json(response);
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on demote participant of communoty',
      error: error
    });
  }
}

async function promoteCommunityParticipant(req, res) {
  /**
    #swagger.tags = ["Community"]
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
                        participantsId: { type: "array" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                            id: "<you_community_id@g.us>",
                            participantsId: ["group1Id@g.us"]
                        }
                    },
                }
            }
        }
    }
    */
  const { id, participantsId } = req.body;

  try {
    const response = await req.client.promoteCommunityParticipant(
      id,
      participantsId
    );

    res.status(200).json(response);
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on demote participant of communoty',
      error: error
    });
  }
}

async function getCommunityParticipants(req, res) {
  /**
    #swagger.tags = ["Community"]
    #swagger.autoBody=false
    #swagger.security = [{
            "bearerAuth": []
    }]
    #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
    }
    #swagger.parameters["id"] = {
        schema: 'communityId@g.us'
    }
    */
  const { id } = req.params;

  try {
    const response = await req.client.getCommunityParticipants(id);

    res.status(200).json(response);
  } catch (error) {
    req.logger.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Error on get participant of communoty',
      error: error
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVDb21tdW5pdHkiLCJyZXEiLCJyZXMiLCJuYW1lIiwiZGVzY3JpcHRpb24iLCJncm91cElkcyIsImJvZHkiLCJyZXNwb25zZSIsImNsaWVudCIsInN0YXR1cyIsImpzb24iLCJlcnJvciIsImxvZ2dlciIsIm1lc3NhZ2UiLCJkZWFjdGl2YXRlQ29tbXVuaXR5IiwiaWQiLCJhZGRTdWJncm91cHNDb21tdW5pdHkiLCJncm91cHNJZHMiLCJyZW1vdmVTdWJncm91cHNDb21tdW5pdHkiLCJkZW1vdGVDb21tdW5pdHlQYXJ0aWNpcGFudCIsInBhcnRpY2lwYW50c0lkIiwicHJvbW90ZUNvbW11bml0eVBhcnRpY2lwYW50IiwiZ2V0Q29tbXVuaXR5UGFydGljaXBhbnRzIiwicGFyYW1zIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXIvY29tbXVuaXR5Q29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBDb3B5cmlnaHQgMjAyMyBXUFBDb25uZWN0IFRlYW1cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVDb21tdW5pdHkocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgICAjc3dhZ2dlci50YWdzID0gW1wiQ29tbXVuaXR5XCJdXHJcbiAgICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgICAgfV1cclxuICAgICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgICAgfVxyXG4gICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBJZHM6IHsgdHlwZTogXCJhcnJheVwiIH0sXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICBuYW1lOiBcIk15IGNvbW11bml0eSBuYW1lXCIsXHJcbiAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIkRlc2NyaXB0aW9uIGZvciB5b3VyIGNvbW11bml0eVwiLFxyXG4gICAgICAgICAgICAgICAgICBncm91cElkczogW1wiZ3JvdXBJZDFcIiwgXCJncm91cElkMlwiXSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgfVxyXG4gICAgICovXHJcbiAgY29uc3QgeyBuYW1lLCBkZXNjcmlwdGlvbiwgZ3JvdXBJZHMgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmNyZWF0ZUNvbW11bml0eShcclxuICAgICAgbmFtZSxcclxuICAgICAgZGVzY3JpcHRpb24sXHJcbiAgICAgIGdyb3VwSWRzXHJcbiAgICApO1xyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3BvbnNlKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGNyZWF0ZSBjb21tdW5pdHknLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWFjdGl2YXRlQ29tbXVuaXR5KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICAgICAjc3dhZ2dlci50YWdzID0gW1wiQ29tbXVuaXR5XCJdXHJcbiAgICAgICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgICAgICB9XVxyXG4gICAgICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgaWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IFwiPHlvdV9jb21tdW5pdHlfaWRAZy51cz5cIixcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICAgKi9cclxuICBjb25zdCB7IGlkIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5kZWFjdGl2YXRlQ29tbXVuaXR5KGlkKTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBkZWFjdGl2YXRlIGNvbW11bml0eScsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFN1Ymdyb3Vwc0NvbW11bml0eShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJDb21tdW5pdHlcIl1cclxuICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgfV1cclxuICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICB9XHJcbiAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3Vwc0lkczogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFwiPHlvdV9jb21tdW5pdHlfaWRAZy51cz5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3Vwc0lkczogW1wiZ3JvdXAxSWRAZy51c1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgICovXHJcbiAgY29uc3QgeyBpZCwgZ3JvdXBzSWRzIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5hZGRTdWJncm91cHNDb21tdW5pdHkoaWQsIGdyb3Vwc0lkcyk7XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24ocmVzcG9uc2UpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGVycm9yKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gYWRkIHN1Ymdyb3VwJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVtb3ZlU3ViZ3JvdXBzQ29tbXVuaXR5KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJDb21tdW5pdHlcIl1cclxuICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgfV1cclxuICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICB9XHJcbiAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3Vwc0lkczogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFwiPHlvdV9jb21tdW5pdHlfaWRAZy51cz5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyb3Vwc0lkczogW1wiZ3JvdXAxSWRAZy51c1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgICovXHJcbiAgY29uc3QgeyBpZCwgZ3JvdXBzSWRzIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVxLmNsaWVudC5yZW1vdmVTdWJncm91cHNDb21tdW5pdHkoaWQsIGdyb3Vwc0lkcyk7XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24ocmVzcG9uc2UpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGVycm9yKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gcmVtb3ZlIHN1Ymdyb3VwJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVtb3RlQ29tbXVuaXR5UGFydGljaXBhbnQocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAjc3dhZ2dlci50YWdzID0gW1wiQ29tbXVuaXR5XCJdXHJcbiAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgIH1dXHJcbiAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgfVxyXG4gICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudHNJZDogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFwiPHlvdV9jb21tdW5pdHlfaWRAZy51cz5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnRpY2lwYW50c0lkOiBbXCJncm91cDFJZEBnLnVzXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgKi9cclxuICBjb25zdCB7IGlkLCBwYXJ0aWNpcGFudHNJZCB9ID0gcmVxLmJvZHk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcS5jbGllbnQuZGVtb3RlQ29tbXVuaXR5UGFydGljaXBhbnQoXHJcbiAgICAgIGlkLFxyXG4gICAgICBwYXJ0aWNpcGFudHNJZFxyXG4gICAgKTtcclxuXHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXNwb25zZSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcS5sb2dnZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdlcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBkZW1vdGUgcGFydGljaXBhbnQgb2YgY29tbXVub3R5JyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbW90ZUNvbW11bml0eVBhcnRpY2lwYW50KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAgI3N3YWdnZXIudGFncyA9IFtcIkNvbW11bml0eVwiXVxyXG4gICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICB9XVxyXG4gICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgIH1cclxuICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFydGljaXBhbnRzSWQ6IHsgdHlwZTogXCJhcnJheVwiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBcIjx5b3VfY29tbXVuaXR5X2lkQGcudXM+XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0aWNpcGFudHNJZDogW1wiZ3JvdXAxSWRAZy51c1wiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgICovXHJcbiAgY29uc3QgeyBpZCwgcGFydGljaXBhbnRzSWQgfSA9IHJlcS5ib2R5O1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LnByb21vdGVDb21tdW5pdHlQYXJ0aWNpcGFudChcclxuICAgICAgaWQsXHJcbiAgICAgIHBhcnRpY2lwYW50c0lkXHJcbiAgICApO1xyXG5cclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3BvbnNlKTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVxLmxvZ2dlci5lcnJvcihlcnJvcik7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGRlbW90ZSBwYXJ0aWNpcGFudCBvZiBjb21tdW5vdHknLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDb21tdW5pdHlQYXJ0aWNpcGFudHMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAjc3dhZ2dlci50YWdzID0gW1wiQ29tbXVuaXR5XCJdXHJcbiAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgIH1dXHJcbiAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgIH1cclxuICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJpZFwiXSA9IHtcclxuICAgICAgICBzY2hlbWE6ICdjb21tdW5pdHlJZEBnLnVzJ1xyXG4gICAgfVxyXG4gICAgKi9cclxuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCByZXEuY2xpZW50LmdldENvbW11bml0eVBhcnRpY2lwYW50cyhpZCk7XHJcblxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24ocmVzcG9uc2UpO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXEubG9nZ2VyLmVycm9yKGVycm9yKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnZXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gZ2V0IHBhcnRpY2lwYW50IG9mIGNvbW11bm90eScsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibWFwcGluZ3MiOiJ3ZEFBQTtBQUNBO0FBQ0E7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