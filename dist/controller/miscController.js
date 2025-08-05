"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.backupAllSessions = backupAllSessions;exports.clearSessionData = clearSessionData;exports.restoreAllSessions = restoreAllSessions;exports.setLimit = setLimit;exports.takeScreenshot = takeScreenshot;
















var _fs = _interopRequireDefault(require("fs"));

var _ = require("..");
var _config = _interopRequireDefault(require("../config"));
var _manageSession = require("../util/manageSession");
var _sessionUtil = require("../util/sessionUtil"); /*
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
 */async function backupAllSessions(req, res) {/**
     * #swagger.tags = ["Misc"]
     * #swagger.description = 'Please, open the router in your browser, in swagger this not run'
     * #swagger.produces = ['application/octet-stream']
     * #swagger.consumes = ['application/octet-stream']
       #swagger.autoBody=false
       #swagger.parameters["secretkey"] = {
          required: true,
          schema: 'THISISMYSECURETOKEN'
       }
       #swagger.responses[200] = {
        description: 'A ZIP file contaings your backup. Please, open this link in your browser',
        content: {
          "application/zip": {
            schema: {}
          }
        },
      }
     */const { secretkey } = req.params;if (secretkey !== _config.default.secretKey) {res.status(400).json({ response: 'error', message: 'The token is incorrect' });}try {res.setHeader('Content-Type', 'application/zip');
    res.send(await (0, _manageSession.backupSessions)(req));
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error on backup session',
      error: error
    });
  }
}

async function restoreAllSessions(req, res) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
    #swagger.parameters["secretkey"] = {
    required: true,
    schema: 'THISISMYSECURETOKEN'
    }
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: 'object',
            properties: {
              file: {
                type: "string",
                format: "binary"
              }
            },
            required: ['file'],
          }
        }
      }
    }
  */
  const { secretkey } = req.params;

  if (secretkey !== _config.default.secretKey) {
    res.status(400).json({
      response: 'error',
      message: 'The token is incorrect'
    });
  }

  try {
    const result = await (0, _manageSession.restoreSessions)(req, req.file);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error on restore session',
      error: error
    });
  }
}

async function takeScreenshot(req, res) {
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
    const result = await req.client.takeScreenshot();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error on take screenshot',
      error: error
    });
  }
}

async function clearSessionData(req, res) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.autoBody=false
    #swagger.parameters["secretkey"] = {
    required: true,
    schema: 'THISISMYSECURETOKEN'
    }
    #swagger.parameters["session"] = {
    schema: 'NERDWHATS_AMERICA'
    }
  */

  try {
    const { secretkey, session } = req.params;

    if (secretkey !== _config.default.secretKey) {
      res.status(400).json({
        response: 'error',
        message: 'The token is incorrect'
      });
    }
    if (req?.client?.page) {
      delete _sessionUtil.clientsArray[req.params.session];
      await req.client.logout();
    }
    const path = _config.default.customUserDataDir + session;
    const pathToken = __dirname + `../../../tokens/${session}.data.json`;
    if (_fs.default.existsSync(path)) {
      await _fs.default.promises.rm(path, {
        recursive: true
      });
    }
    if (_fs.default.existsSync(pathToken)) {
      await _fs.default.promises.rm(pathToken);
    }
    res.status(200).json({ success: true });
  } catch (error) {
    _.logger.error(error);
    res.status(500).json({
      status: false,
      message: 'Error on clear session data',
      error: error
    });
  }
}

async function setLimit(req, res) {
  /**
   #swagger.tags = ["Misc"]
   #swagger.description = 'Change limits of whatsapp web. Types value: maxMediaSize, maxFileSize, maxShare, statusVideoMaxDuration, unlimitedPin;'
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
              type: { type: 'string' },
              value: { type: 'any' },
            },
            required: ['type', 'value'],
          },
          examples: {
            'Default': {
              value: {
                type: 'maxFileSize',
                value: 104857600
              },
            },
          },
        },
      },
    }
  */

  try {
    const { type, value } = req.body;
    if (!type || !value) throw new Error('Send de type and value');

    const result = await req.client.setLimit(type, value);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Error on set limit',
      error: error
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZnMiLCJfaW50ZXJvcFJlcXVpcmVEZWZhdWx0IiwicmVxdWlyZSIsIl8iLCJfY29uZmlnIiwiX21hbmFnZVNlc3Npb24iLCJfc2Vzc2lvblV0aWwiLCJiYWNrdXBBbGxTZXNzaW9ucyIsInJlcSIsInJlcyIsInNlY3JldGtleSIsInBhcmFtcyIsImNvbmZpZyIsInNlY3JldEtleSIsInN0YXR1cyIsImpzb24iLCJyZXNwb25zZSIsIm1lc3NhZ2UiLCJzZXRIZWFkZXIiLCJzZW5kIiwiYmFja3VwU2Vzc2lvbnMiLCJlcnJvciIsInJlc3RvcmVBbGxTZXNzaW9ucyIsInJlc3VsdCIsInJlc3RvcmVTZXNzaW9ucyIsImZpbGUiLCJ0YWtlU2NyZWVuc2hvdCIsImNsaWVudCIsImNsZWFyU2Vzc2lvbkRhdGEiLCJzZXNzaW9uIiwicGFnZSIsImNsaWVudHNBcnJheSIsImxvZ291dCIsInBhdGgiLCJjdXN0b21Vc2VyRGF0YURpciIsInBhdGhUb2tlbiIsIl9fZGlybmFtZSIsImZzIiwiZXhpc3RzU3luYyIsInByb21pc2VzIiwicm0iLCJyZWN1cnNpdmUiLCJzdWNjZXNzIiwibG9nZ2VyIiwic2V0TGltaXQiLCJ0eXBlIiwidmFsdWUiLCJib2R5IiwiRXJyb3IiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJvbGxlci9taXNjQ29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBDb3B5cmlnaHQgMjAyMyBXUFBDb25uZWN0IFRlYW1cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgUmVxdWVzdCwgUmVzcG9uc2UgfSBmcm9tICdleHByZXNzJztcclxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuXHJcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gJy4uJztcclxuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcnO1xyXG5pbXBvcnQgeyBiYWNrdXBTZXNzaW9ucywgcmVzdG9yZVNlc3Npb25zIH0gZnJvbSAnLi4vdXRpbC9tYW5hZ2VTZXNzaW9uJztcclxuaW1wb3J0IHsgY2xpZW50c0FycmF5IH0gZnJvbSAnLi4vdXRpbC9zZXNzaW9uVXRpbCc7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYmFja3VwQWxsU2Vzc2lvbnMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICAgKiAjc3dhZ2dlci50YWdzID0gW1wiTWlzY1wiXVxyXG4gICAgICogI3N3YWdnZXIuZGVzY3JpcHRpb24gPSAnUGxlYXNlLCBvcGVuIHRoZSByb3V0ZXIgaW4geW91ciBicm93c2VyLCBpbiBzd2FnZ2VyIHRoaXMgbm90IHJ1bidcclxuICAgICAqICNzd2FnZ2VyLnByb2R1Y2VzID0gWydhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nXVxyXG4gICAgICogI3N3YWdnZXIuY29uc3VtZXMgPSBbJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSddXHJcbiAgICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlY3JldGtleVwiXSA9IHtcclxuICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgICAgc2NoZW1hOiAnVEhJU0lTTVlTRUNVUkVUT0tFTidcclxuICAgICAgIH1cclxuICAgICAgICNzd2FnZ2VyLnJlc3BvbnNlc1syMDBdID0ge1xyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBaSVAgZmlsZSBjb250YWluZ3MgeW91ciBiYWNrdXAuIFBsZWFzZSwgb3BlbiB0aGlzIGxpbmsgaW4geW91ciBicm93c2VyJyxcclxuICAgICAgICBjb250ZW50OiB7XHJcbiAgICAgICAgICBcImFwcGxpY2F0aW9uL3ppcFwiOiB7XHJcbiAgICAgICAgICAgIHNjaGVtYToge31cclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9XHJcbiAgICAgKi9cclxuICBjb25zdCB7IHNlY3JldGtleSB9ID0gcmVxLnBhcmFtcztcclxuXHJcbiAgaWYgKHNlY3JldGtleSAhPT0gY29uZmlnLnNlY3JldEtleSkge1xyXG4gICAgcmVzLnN0YXR1cyg0MDApLmpzb24oe1xyXG4gICAgICByZXNwb25zZTogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ1RoZSB0b2tlbiBpcyBpbmNvcnJlY3QnLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL3ppcCcpO1xyXG4gICAgcmVzLnNlbmQoYXdhaXQgYmFja3VwU2Vzc2lvbnMocmVxKSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiBmYWxzZSxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGJhY2t1cCBzZXNzaW9uJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzdG9yZUFsbFNlc3Npb25zKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAjc3dhZ2dlci50YWdzID0gW1wiTWlzY1wiXVxyXG4gICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlY3JldGtleVwiXSA9IHtcclxuICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgc2NoZW1hOiAnVEhJU0lTTVlTRUNVUkVUT0tFTidcclxuICAgIH1cclxuICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgY29udGVudDoge1xyXG4gICAgICAgIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiOiB7XHJcbiAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgdHlwZTogJ29iamVjdCcsXHJcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICBmaWxlOiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0OiBcImJpbmFyeVwiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlZDogWydmaWxlJ10sXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgKi9cclxuICBjb25zdCB7IHNlY3JldGtleSB9ID0gcmVxLnBhcmFtcztcclxuXHJcbiAgaWYgKHNlY3JldGtleSAhPT0gY29uZmlnLnNlY3JldEtleSkge1xyXG4gICAgcmVzLnN0YXR1cyg0MDApLmpzb24oe1xyXG4gICAgICByZXNwb25zZTogJ2Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ1RoZSB0b2tlbiBpcyBpbmNvcnJlY3QnLFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzdG9yZVNlc3Npb25zKHJlcSwgcmVxLmZpbGUgYXMgYW55KTtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3VsdCk7XHJcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6IGZhbHNlLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gcmVzdG9yZSBzZXNzaW9uJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdGFrZVNjcmVlbnNob3QocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJNaXNjXCJdXHJcbiAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgIH1dXHJcbiAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgfVxyXG4gICovXHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXEuY2xpZW50LnRha2VTY3JlZW5zaG90KCk7XHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbihyZXN1bHQpO1xyXG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiBmYWxzZSxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIHRha2Ugc2NyZWVuc2hvdCcsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbkRhdGEocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICNzd2FnZ2VyLnRhZ3MgPSBbXCJNaXNjXCJdXHJcbiAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2VjcmV0a2V5XCJdID0ge1xyXG4gICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICBzY2hlbWE6ICdUSElTSVNNWVNFQ1VSRVRPS0VOJ1xyXG4gICAgfVxyXG4gICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgIH1cclxuICAqL1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgeyBzZWNyZXRrZXksIHNlc3Npb24gfSA9IHJlcS5wYXJhbXM7XHJcblxyXG4gICAgaWYgKHNlY3JldGtleSAhPT0gY29uZmlnLnNlY3JldEtleSkge1xyXG4gICAgICByZXMuc3RhdHVzKDQwMCkuanNvbih7XHJcbiAgICAgICAgcmVzcG9uc2U6ICdlcnJvcicsXHJcbiAgICAgICAgbWVzc2FnZTogJ1RoZSB0b2tlbiBpcyBpbmNvcnJlY3QnLFxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmIChyZXE/LmNsaWVudD8ucGFnZSkge1xyXG4gICAgICBkZWxldGUgY2xpZW50c0FycmF5W3JlcS5wYXJhbXMuc2Vzc2lvbl07XHJcbiAgICAgIGF3YWl0IHJlcS5jbGllbnQubG9nb3V0KCk7XHJcbiAgICB9XHJcbiAgICBjb25zdCBwYXRoID0gY29uZmlnLmN1c3RvbVVzZXJEYXRhRGlyICsgc2Vzc2lvbjtcclxuICAgIGNvbnN0IHBhdGhUb2tlbiA9IF9fZGlybmFtZSArIGAuLi8uLi8uLi90b2tlbnMvJHtzZXNzaW9ufS5kYXRhLmpzb25gO1xyXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aCkpIHtcclxuICAgICAgYXdhaXQgZnMucHJvbWlzZXMucm0ocGF0aCwge1xyXG4gICAgICAgIHJlY3Vyc2l2ZTogdHJ1ZSxcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoVG9rZW4pKSB7XHJcbiAgICAgIGF3YWl0IGZzLnByb21pc2VzLnJtKHBhdGhUb2tlbik7XHJcbiAgICB9XHJcbiAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7IHN1Y2Nlc3M6IHRydWUgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgbG9nZ2VyLmVycm9yKGVycm9yKTtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiBmYWxzZSxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGNsZWFyIHNlc3Npb24gZGF0YScsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldExpbWl0KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAjc3dhZ2dlci50YWdzID0gW1wiTWlzY1wiXVxyXG4gICAjc3dhZ2dlci5kZXNjcmlwdGlvbiA9ICdDaGFuZ2UgbGltaXRzIG9mIHdoYXRzYXBwIHdlYi4gVHlwZXMgdmFsdWU6IG1heE1lZGlhU2l6ZSwgbWF4RmlsZVNpemUsIG1heFNoYXJlLCBzdGF0dXNWaWRlb01heER1cmF0aW9uLCB1bmxpbWl0ZWRQaW47J1xyXG4gICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICB9XVxyXG4gICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgIH1cclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgIGNvbnRlbnQ6IHtcclxuICAgICAgICAnYXBwbGljYXRpb24vanNvbic6IHtcclxuICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICB0eXBlOiAnb2JqZWN0JyxcclxuICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgIHR5cGU6IHsgdHlwZTogJ3N0cmluZycgfSxcclxuICAgICAgICAgICAgICB2YWx1ZTogeyB0eXBlOiAnYW55JyB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICByZXF1aXJlZDogWyd0eXBlJywgJ3ZhbHVlJ10sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgJ0RlZmF1bHQnOiB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdtYXhGaWxlU2l6ZScsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogMTA0ODU3NjAwXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH1cclxuICAqL1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgeyB0eXBlLCB2YWx1ZSB9ID0gcmVxLmJvZHk7XHJcbiAgICBpZiAoIXR5cGUgfHwgIXZhbHVlKSB0aHJvdyBuZXcgRXJyb3IoJ1NlbmQgZGUgdHlwZSBhbmQgdmFsdWUnKTtcclxuXHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXEuY2xpZW50LnNldExpbWl0KHR5cGUsIHZhbHVlKTtcclxuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHJlc3VsdCk7XHJcbiAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6IGZhbHNlLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gc2V0IGxpbWl0JyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQkEsSUFBQUEsR0FBQSxHQUFBQyxzQkFBQSxDQUFBQyxPQUFBOztBQUVBLElBQUFDLENBQUEsR0FBQUQsT0FBQTtBQUNBLElBQUFFLE9BQUEsR0FBQUgsc0JBQUEsQ0FBQUMsT0FBQTtBQUNBLElBQUFHLGNBQUEsR0FBQUgsT0FBQTtBQUNBLElBQUFJLFlBQUEsR0FBQUosT0FBQSx3QkFBbUQsQ0F0Qm5EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQVVPLGVBQWVLLGlCQUFpQkEsQ0FBQ0MsR0FBWSxFQUFFQyxHQUFhLEVBQUUsQ0FDbkU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FDRSxNQUFNLEVBQUVDLFNBQVMsQ0FBQyxDQUFDLEdBQUdGLEdBQUcsQ0FBQ0csTUFBTSxDQUVoQyxJQUFJRCxTQUFTLEtBQUtFLGVBQU0sQ0FBQ0MsU0FBUyxFQUFFLENBQ2xDSixHQUFHLENBQUNLLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQ0MsSUFBSSxDQUFDLEVBQ25CQyxRQUFRLEVBQUUsT0FBTyxFQUNqQkMsT0FBTyxFQUFFLHdCQUF3QixDQUNuQyxDQUFDLENBQUMsQ0FDSixDQUVBLElBQUksQ0FDRlIsR0FBRyxDQUFDUyxTQUFTLENBQUMsY0FBYyxFQUFFLGlCQUFpQixD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