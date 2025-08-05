"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.createNewsletter = createNewsletter;exports.destroyNewsletter = destroyNewsletter;exports.editNewsletter = editNewsletter;exports.muteNewsletter = muteNewsletter; /*
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


function returnError(
req,
res,
session,
error)
{
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

async function createNewsletter(req, res) {
  /**
     * #swagger.tags = ["Newsletter]
        #swagger.operationId = 'createNewsletter'
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
                        options: { type: "object" },
                    }
                },
                examples: {
                    "Create newsletter/channel": {
                        value: { 
                            name: 'Name for your channel',
                            options: {
                                description: 'Description of channel',
                                picture: '<base64_image>',
                            }
                        }
                    },
                }
            }
        }
        }
     */
  const session = req.session;
  const { name, options } = req.body;

  try {
    res.status(201).json(await req.client.createNewsletter(name, options));
  } catch (error) {
    returnError(req, res, session, error);
  }
}

async function editNewsletter(req, res) {
  /**
       * #swagger.tags = ["Newsletter]
         #swagger.operationId = 'editNewsletter'
         #swagger.autoBody=false
         #swagger.security = [{
                "bearerAuth": []
         }]
         #swagger.parameters["session"] = {
          schema: 'NERDWHATS_AMERICA'
         }
         #swagger.parameters["id"] = {
          schema: '<newsletter_id>'
         }
         #swagger.requestBody = {
        required: true,
        "@content": {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" },
                picture: { type: "string" },
              }
            },
            examples: {
              "Edit newsletter/channel": {
                value: { 
                    name: 'New name of channel',
                    description: 'New description of channel',
                    picture: '<new_base64_image> or send null',
                }
              },
                "Create newsletter/channel": {
                    value: { 
                        name: 'Name for your channel',
                        options: {
                            description: 'Description of channel',
                            picture: '<base64_image>',
                        }
                    }
                },
            }
          }
        }
       }
       */
  const session = req.session;
  const { name, description, picture } = req.body;
  const { id } = req.params;

  try {
    res.status(201).json(
      await req.client.editNewsletter(id, {
        name,
        description,
        picture
      })
    );
  } catch (error) {
    returnError(req, res, session, error);
  }
}

async function destroyNewsletter(req, res) {
  /**
  * #swagger.tags = ["Newsletter]
    #swagger.autoBody=false
    #swagger.operationId = 'destroyNewsletter'
    #swagger.security = [{
            "bearerAuth": []
    }]
    #swagger.parameters["session"] = {
        schema: 'NERDWHATS_AMERICA'
    }
    #swagger.parameters["id"] = {
        schema: 'NEWSLETTER ID'
    }
    */
  const session = req.session;
  const { id } = req.params;

  try {
    res.status(201).json(await req.client.destroyNewsletter(id));
  } catch (error) {
    returnError(req, res, session, error);
  }
}

async function muteNewsletter(req, res) {
  /**
   * #swagger.tags = ["Newsletter]
     #swagger.operationId = 'muteNewsletter'
     #swagger.autoBody=false
     #swagger.security = [{
              "bearerAuth": []
      }]
      #swagger.parameters["session"] = {
          schema: 'NERDWHATS_AMERICA'
      }
      #swagger.parameters["id"] = {
          schema: 'NEWSLETTER ID'
      }
      */
  const session = req.session;
  const { id } = req.params;

  try {
    res.status(201).json(await req.client.muteNesletter(id));
  } catch (error) {
    returnError(req, res, session, error);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZXR1cm5FcnJvciIsInJlcSIsInJlcyIsInNlc3Npb24iLCJlcnJvciIsImxvZ2dlciIsInN0YXR1cyIsImpzb24iLCJyZXNwb25zZSIsIm1lc3NhZ2UiLCJsb2ciLCJjcmVhdGVOZXdzbGV0dGVyIiwibmFtZSIsIm9wdGlvbnMiLCJib2R5IiwiY2xpZW50IiwiZWRpdE5ld3NsZXR0ZXIiLCJkZXNjcmlwdGlvbiIsInBpY3R1cmUiLCJpZCIsInBhcmFtcyIsImRlc3Ryb3lOZXdzbGV0dGVyIiwibXV0ZU5ld3NsZXR0ZXIiLCJtdXRlTmVzbGV0dGVyIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXIvbmV3c2xldHRlckNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQ29weXJpZ2h0IDIwMjMgV1BQQ29ubmVjdCBUZWFtXHJcbiAqXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XHJcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cclxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XHJcbiAqXHJcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuICpcclxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxyXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXHJcbiAqIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxyXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXHJcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxyXG4gKi9cclxuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuXHJcbmZ1bmN0aW9uIHJldHVybkVycm9yKFxyXG4gIHJlcTogUmVxdWVzdCxcclxuICByZXM6IFJlc3BvbnNlLFxyXG4gIHNlc3Npb246IHN0cmluZyxcclxuICBlcnJvcj86IGFueVxyXG4pIHtcclxuICByZXEubG9nZ2VyLmVycm9yKGVycm9yKTtcclxuICByZXMuc3RhdHVzKDQwMCkuanNvbih7XHJcbiAgICBzdGF0dXM6ICdFcnJvcicsXHJcbiAgICByZXNwb25zZToge1xyXG4gICAgICBtZXNzYWdlOiAnRXJyb3IgcmV0cmlldmluZyBpbmZvcm1hdGlvbicsXHJcbiAgICAgIHNlc3Npb246IHNlc3Npb24sXHJcbiAgICAgIGxvZzogZXJyb3IsXHJcbiAgICB9LFxyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlTmV3c2xldHRlcihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJOZXdzbGV0dGVyXVxyXG4gICAgICAgICNzd2FnZ2VyLm9wZXJhdGlvbklkID0gJ2NyZWF0ZU5ld3NsZXR0ZXInXHJcbiAgICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgICAgfV1cclxuICAgICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgICAgfVxyXG4gICAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsgdHlwZTogXCJvYmplY3RcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiQ3JlYXRlIG5ld3NsZXR0ZXIvY2hhbm5lbFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7IFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ05hbWUgZm9yIHlvdXIgY2hhbm5lbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdEZXNjcmlwdGlvbiBvZiBjaGFubmVsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaWN0dXJlOiAnPGJhc2U2NF9pbWFnZT4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgKi9cclxuICBjb25zdCBzZXNzaW9uID0gcmVxLnNlc3Npb247XHJcbiAgY29uc3QgeyBuYW1lLCBvcHRpb25zIH0gPSByZXEuYm9keTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKGF3YWl0IHJlcS5jbGllbnQuY3JlYXRlTmV3c2xldHRlcihuYW1lLCBvcHRpb25zKSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybkVycm9yKHJlcSwgcmVzLCBzZXNzaW9uLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZWRpdE5ld3NsZXR0ZXIocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJOZXdzbGV0dGVyXVxyXG4gICAgICAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdlZGl0TmV3c2xldHRlcidcclxuICAgICAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgICAgIH1dXHJcbiAgICAgICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgICAgIH1cclxuICAgICAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcImlkXCJdID0ge1xyXG4gICAgICAgICAgc2NoZW1hOiAnPG5ld3NsZXR0ZXJfaWQ+J1xyXG4gICAgICAgICB9XHJcbiAgICAgICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgIHBpY3R1cmU6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgICBcIkVkaXQgbmV3c2xldHRlci9jaGFubmVsXCI6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7IFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6ICdOZXcgbmFtZSBvZiBjaGFubmVsJyxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ05ldyBkZXNjcmlwdGlvbiBvZiBjaGFubmVsJyxcclxuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlOiAnPG5ld19iYXNlNjRfaW1hZ2U+IG9yIHNlbmQgbnVsbCcsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiQ3JlYXRlIG5ld3NsZXR0ZXIvY2hhbm5lbFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHsgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdOYW1lIGZvciB5b3VyIGNoYW5uZWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0Rlc2NyaXB0aW9uIG9mIGNoYW5uZWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGljdHVyZTogJzxiYXNlNjRfaW1hZ2U+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICB9XHJcbiAgICAgICAqL1xyXG4gIGNvbnN0IHNlc3Npb24gPSByZXEuc2Vzc2lvbjtcclxuICBjb25zdCB7IG5hbWUsIGRlc2NyaXB0aW9uLCBwaWN0dXJlIH0gPSByZXEuYm9keTtcclxuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xyXG5cclxuICB0cnkge1xyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oXHJcbiAgICAgIGF3YWl0IHJlcS5jbGllbnQuZWRpdE5ld3NsZXR0ZXIoaWQsIHtcclxuICAgICAgICBuYW1lLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgIHBpY3R1cmUsXHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXR1cm5FcnJvcihyZXEsIHJlcywgc2Vzc2lvbiwgZXJyb3IpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlc3Ryb3lOZXdzbGV0dGVyKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gKiAjc3dhZ2dlci50YWdzID0gW1wiTmV3c2xldHRlcl1cclxuICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAjc3dhZ2dlci5vcGVyYXRpb25JZCA9ICdkZXN0cm95TmV3c2xldHRlcidcclxuICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICB9XVxyXG4gICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICB9XHJcbiAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wiaWRcIl0gPSB7XHJcbiAgICAgICAgc2NoZW1hOiAnTkVXU0xFVFRFUiBJRCdcclxuICAgIH1cclxuICAgICovXHJcbiAgY29uc3Qgc2Vzc2lvbiA9IHJlcS5zZXNzaW9uO1xyXG4gIGNvbnN0IHsgaWQgfSA9IHJlcS5wYXJhbXM7XHJcblxyXG4gIHRyeSB7XHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbihhd2FpdCByZXEuY2xpZW50LmRlc3Ryb3lOZXdzbGV0dGVyKGlkKSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybkVycm9yKHJlcSwgcmVzLCBzZXNzaW9uLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbXV0ZU5ld3NsZXR0ZXIocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk5ld3NsZXR0ZXJdXHJcbiAgICAgI3N3YWdnZXIub3BlcmF0aW9uSWQgPSAnbXV0ZU5ld3NsZXR0ZXInXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgIH1dXHJcbiAgICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgIH1cclxuICAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcImlkXCJdID0ge1xyXG4gICAgICAgICAgc2NoZW1hOiAnTkVXU0xFVFRFUiBJRCdcclxuICAgICAgfVxyXG4gICAgICAqL1xyXG4gIGNvbnN0IHNlc3Npb24gPSByZXEuc2Vzc2lvbjtcclxuICBjb25zdCB7IGlkIH0gPSByZXEucGFyYW1zO1xyXG5cclxuICB0cnkge1xyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oYXdhaXQgcmVxLmNsaWVudC5tdXRlTmVzbGV0dGVyKGlkKSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJldHVybkVycm9yKHJlcSwgcmVzLCBzZXNzaW9uLCBlcnJvcik7XHJcbiAgfVxyXG59XHJcbiJdLCJtYXBwaW5ncyI6InNQQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0EsU0FBU0EsV0FBV0E7QUFDbEJDLEdBQVk7QUFDWkMsR0FBYTtBQUNiQyxPQUFlO0FBQ2ZDLEtBQVc7QUFDWDtFQUNBSCxHQUFHLENBQUNJLE1BQU0sQ0FBQ0QsS0FBSyxDQUFDQSxLQUFLLENBQUM7RUFDdkJGLEdBQUcsQ0FBQ0ksTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDQyxJQUFJLENBQUM7SUFDbkJELE1BQU0sRUFBRSxPQUFPO0lBQ2ZFLFFBQVEsRUFBRTtNQUNSQyxPQUFPLEVBQUUsOEJBQThCO01BQ3ZDTixPQUFPLEVBQUVBLE9BQU87TUFDaEJPLEdBQUcsRUFBRU47SUFDUDtFQUNGLENBQUMsQ0FBQztBQUNKOztBQUVPLGVBQWVPLGdCQUFnQkEsQ0FBQ1YsR0FBWSxFQUFFQyxHQUFhLEVBQUU7RUFDbEU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0UsTUFBTUMsT0FBTyxHQUFHRixHQUFHLENBQUNFLE9BQU87RUFDM0IsTUFBTSxFQUFFUyxJQUFJLEVBQUVDLE9BQU8sQ0FBQyxDQUFDLEdBQUdaLEdBQUcsQ0FBQ2EsSUFBSTs7RUFFbEMsSUFBSTtJQUNGWixHQUFHLENBQUNJLE1BQU0sQ0FBQyxHQUFHLENBQUMs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