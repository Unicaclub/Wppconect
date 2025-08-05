"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.addProduct = addProduct;exports.addProductImage = addProductImage;exports.changeProductImage = changeProductImage;exports.createCollection = createCollection;exports.delProducts = delProducts;exports.deleteCollection = deleteCollection;exports.editCollection = editCollection;exports.editProduct = editProduct;exports.getCollections = getCollections;exports.getProductById = getProductById;exports.getProducts = getProducts;exports.removeProductImage = removeProductImage;exports.sendLinkCatalog = sendLinkCatalog;exports.setProductVisibility = setProductVisibility;exports.updateCartEnabled = updateCartEnabled;
















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
 */async function getProducts(req, res) {/**
   * #swagger.tags = ["Catalog & Bussiness"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      in: 'query',
      schema: '5521999999999',
     }
     #swagger.parameters["qnt"] = {
      in: 'query',
      schema: '10',
     }
   */const { phone, qnt } = req.query;if (!phone) res.status(401).send({ message: 'Please send the contact number you wish to return the products.' });try {const result = await req.client?.getProducts(phone, qnt
    );
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on get products',
      error: error
    });
  }
}

async function getProductById(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["phone"] = {
      in: 'query',
      schema: '5521999999999',
     }
     #swagger.parameters["id"] = {
      in: 'query',
      schema: '10',
     }
   */
  const { phone, id } = req.query;
  if (!phone || !id)
  res.status(401).send({
    message: 'Please send the contact number and productId.'
  });

  try {
    const result = await req.client.getProductById(
      phone,
      id
    );
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.
    status(500).
    json({ status: 'Error', message: 'Error on get product', error: error });
  }
}
async function editProduct(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                        options: { type: "object" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          id: '<product_id>',
                          options: {
                            name: 'New name for product',
                          }
                        }
                    },
                }
            }
        }
    }
   */
  const { id, options } = req.body;
  if (!id || !options)
  res.status(401).send({
    message: 'productId or options was not informed'
  });

  try {
    const result = await req.client.editProduct(id, options);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on edit product.',
      error: error
    });
  }
}

async function delProducts(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                          id: '<product_id>',
                        }
                    },
                }
            }
        }
    }
   */
  const { id } = req.body;
  if (!id)
  res.status(401).send({
    message: 'products Id was not informed'
  });

  try {
    const result = await req.client.delProducts(id);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on delete product.',
      error: error
    });
  }
}

async function changeProductImage(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                        base64: { type: "string" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          id: '<product_id>',
                          base64: '<base64_string>'
                        }
                    },
                }
            }
        }
    }
   */
  const { id, base64 } = req.body;
  if (!id || !base64)
  res.status(401).send({
    message: 'productId and base64 was not informed'
  });

  try {
    const result = await req.client.changeProductImage(id, base64);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on change product image.',
      error: error
    });
  }
}

async function addProduct(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                        image: { type: "string" },
                        description: { type: "string" },
                        price: { type: "string" },
                        url: { type: "string" },
                        retailerId: { type: "string" },
                        currency: { type: "string" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          name: 'Product name',
                          image: '<base64_string>',
                          description: 'Description for your product',
                          price: '8890',
                          url: 'http://link_for_your_product.com',
                          retailerId: 'SKU001',
                          currency: 'BRL',
                        }
                    },
                }
            }
        }
    }
   */
  const {
    name,
    image,
    description,
    price,
    url,
    retailerId,
    currency = 'BRL'
  } = req.body;
  if (!name || !image || !price)
  res.status(401).send({
    message: 'name, price and image was not informed'
  });

  try {
    const result = await req.client.createProduct(
      name,
      image,
      description,
      price,
      false,
      url,
      retailerId,
      currency
    );
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'Error',
      message: 'Error on add product.',
      error: error
    });
  }
}

async function addProductImage(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                        base64: { type: "string" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          id: '<product_id>',
                          base64: '<base64_string>'
                        }
                    },
                }
            }
        }
    }
   */
  const { id, base64 } = req.body;
  if (!id || !base64)
  res.status(401).send({
    message: 'productId and base64 was not informed'
  });

  try {
    const result = await req.client.addProductImage(id, base64);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on add product image.',
      error: error
    });
  }
}

async function removeProductImage(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                        index: { type: "number" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          id: '<product_id>',
                          index: 1
                        }
                    },
                }
            }
        }
    }
   */
  const { id, index } = req.body;
  if (!id || !index)
  res.status(401).send({
    message: 'productId and index image was not informed'
  });

  try {
    const result = await req.client.removeProductImage(id, index);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on remove product image.',
      error: error
    });
  }
}

async function getCollections(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
     #swagger.parameters["qnt"] = {
      schema: '10'
     }
     #swagger.parameters["max"] = {
      schema: '10'
     }
   */
  const { phone, qnt, max } = req.query;
  if (!phone)
  res.status(401).send({
    message: 'phone was not informed'
  });

  try {
    const result = await req.client.getCollections(
      phone,
      qnt,
      max
    );
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on get collections.',
      error: error
    });
  }
}

async function createCollection(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                        products: { type: "array" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          name: 'Collection name',
                          products: ['<id_product1>', '<id_product2>'],
                        }
                    },
                }
            }
        }
    }
   */
  const { name, products } = req.body;
  if (!name || !products)
  res.status(401).send({
    message: 'name or products was not informed'
  });

  try {
    const result = await req.client.createCollection(name, products);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on create collection.',
      error: error
    });
  }
}

async function editCollection(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                        products: { type: "array" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          id: '<product_id>',
                          options: {
                            name: 'New name for collection',
                          }
                        }
                    },
                }
            }
        }
    }
   */
  const { id, options } = req.body;
  if (!id || !options)
  res.status(401).send({
    message: 'id or options was not informed'
  });

  try {
    const result = await req.client.editCollection(id, options);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on edit collection.',
      error: error
    });
  }
}

async function deleteCollection(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                          id: '<product_id>',
                        }
                    },
                }
            }
        }
    }
   */
  const { id } = req.body;
  if (!id)
  res.status(401).send({
    message: 'id was not informed'
  });

  try {
    const result = await req.client.deleteCollection(id);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on delete collection.',
      error: error
    });
  }
}

async function setProductVisibility(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
        $id: '<id_product>',
        $value: false,
      }
     }
     #swagger.requestBody = {
        required: true,
        "@content": {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        value: { type: "boolean" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          id: '<product_id>',
                          value: false,
                        }
                    },
                }
            }
        }
    }
   */
  const { id, value } = req.body;
  if (!id || !value)
  res.status(401).send({
    message: 'product id or value (false, true) was not informed'
  });

  try {
    const result = await req.client.setProductVisibility(id, value);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on set product visibility.',
      error: error
    });
  }
}

async function updateCartEnabled(req, res) {
  /**
   * #swagger.tags = ["Catalog & Bussiness"]
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
                        enabled: { type: "boolean" },
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          enabled: true,
                        }
                    },
                }
            }
        }
    }
   */
  const { enabled } = req.body;
  if (!enabled)
  res.status(401).send({
    message: 'enabled (false, true) was not informed'
  });

  try {
    const result = await req.client.updateCartEnabled(enabled);
    res.status(201).json({ status: 'success', response: result });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on set enabled cart.',
      error: error
    });
  }
}

async function sendLinkCatalog(req, res) {
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
                      phones: { type: "array" },
                      message: { type: "string" }
                    }
                },
                examples: {
                    "Default": {
                        value: {
                          phones: ['<array_phone_id'],
                          message: 'Message',
                        }
                    },
                }
            }
        }
    }
   */
  const { phones, message } = req.body;
  if (!phones)
  res.status(401).send({
    message: 'phones was not informed'
  });
  const results = [];
  try {
    const session = await req.client.getWid();
    const catalogLink = (0, _functions.createCatalogLink)(session);
    for (const phone of phones) {
      const result = await req.client.sendText(
        phone,
        `${message} ${catalogLink}`,
        {
          buttons: [
          {
            url: catalogLink,
            text: 'Abrir catálogo'
          }]

        }
      );
      results.push({ phone, status: result.id });
    }
    res.status(200).json({ status: 'success', response: results });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'Error on set enabled cart.',
      error: error
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZnVuY3Rpb25zIiwicmVxdWlyZSIsImdldFByb2R1Y3RzIiwicmVxIiwicmVzIiwicGhvbmUiLCJxbnQiLCJxdWVyeSIsInN0YXR1cyIsInNlbmQiLCJtZXNzYWdlIiwicmVzdWx0IiwiY2xpZW50IiwianNvbiIsInJlc3BvbnNlIiwiZXJyb3IiLCJnZXRQcm9kdWN0QnlJZCIsImlkIiwiZWRpdFByb2R1Y3QiLCJvcHRpb25zIiwiYm9keSIsImRlbFByb2R1Y3RzIiwiY2hhbmdlUHJvZHVjdEltYWdlIiwiYmFzZTY0IiwiYWRkUHJvZHVjdCIsIm5hbWUiLCJpbWFnZSIsImRlc2NyaXB0aW9uIiwicHJpY2UiLCJ1cmwiLCJyZXRhaWxlcklkIiwiY3VycmVuY3kiLCJjcmVhdGVQcm9kdWN0IiwiY29uc29sZSIsImxvZyIsImFkZFByb2R1Y3RJbWFnZSIsInJlbW92ZVByb2R1Y3RJbWFnZSIsImluZGV4IiwiZ2V0Q29sbGVjdGlvbnMiLCJtYXgiLCJjcmVhdGVDb2xsZWN0aW9uIiwicHJvZHVjdHMiLCJlZGl0Q29sbGVjdGlvbiIsImRlbGV0ZUNvbGxlY3Rpb24iLCJzZXRQcm9kdWN0VmlzaWJpbGl0eSIsInZhbHVlIiwidXBkYXRlQ2FydEVuYWJsZWQiLCJlbmFibGVkIiwic2VuZExpbmtDYXRhbG9nIiwicGhvbmVzIiwicmVzdWx0cyIsInNlc3Npb24iLCJnZXRXaWQiLCJjYXRhbG9nTGluayIsImNyZWF0ZUNhdGFsb2dMaW5rIiwic2VuZFRleHQiLCJidXR0b25zIiwidGV4dCIsInB1c2giXSwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJvbGxlci9jYXRhbG9nQ29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBDb3B5cmlnaHQgMjAyMSBXUFBDb25uZWN0IFRlYW1cclxuICpcclxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcclxuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxyXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcclxuICpcclxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxyXG4gKlxyXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXHJcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcclxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXHJcbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcclxuICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXHJcbiAqL1xyXG5pbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xyXG5cclxuaW1wb3J0IHsgY3JlYXRlQ2F0YWxvZ0xpbmsgfSBmcm9tICcuLi91dGlsL2Z1bmN0aW9ucyc7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHJvZHVjdHMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNhdGFsb2cgJiBCdXNzaW5lc3NcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJwaG9uZVwiXSA9IHtcclxuICAgICAgaW46ICdxdWVyeScsXHJcbiAgICAgIHNjaGVtYTogJzU1MjE5OTk5OTk5OTknLFxyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wicW50XCJdID0ge1xyXG4gICAgICBpbjogJ3F1ZXJ5JyxcclxuICAgICAgc2NoZW1hOiAnMTAnLFxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lLCBxbnQgfSA9IHJlcS5xdWVyeTtcclxuICBpZiAoIXBob25lKVxyXG4gICAgcmVzLnN0YXR1cyg0MDEpLnNlbmQoe1xyXG4gICAgICBtZXNzYWdlOlxyXG4gICAgICAgICdQbGVhc2Ugc2VuZCB0aGUgY29udGFjdCBudW1iZXIgeW91IHdpc2ggdG8gcmV0dXJuIHRoZSBwcm9kdWN0cy4nLFxyXG4gICAgfSk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXEuY2xpZW50Py5nZXRQcm9kdWN0cyhcclxuICAgICAgcGhvbmUgYXMgc3RyaW5nLFxyXG4gICAgICBxbnQgYXMgdW5rbm93biBhcyBudW1iZXJcclxuICAgICk7XHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzdWx0IH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ0Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGdldCBwcm9kdWN0cycsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFByb2R1Y3RCeUlkKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJDYXRhbG9nICYgQnVzc2luZXNzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wicGhvbmVcIl0gPSB7XHJcbiAgICAgIGluOiAncXVlcnknLFxyXG4gICAgICBzY2hlbWE6ICc1NTIxOTk5OTk5OTk5JyxcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcImlkXCJdID0ge1xyXG4gICAgICBpbjogJ3F1ZXJ5JyxcclxuICAgICAgc2NoZW1hOiAnMTAnLFxyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lLCBpZCB9ID0gcmVxLnF1ZXJ5O1xyXG4gIGlmICghcGhvbmUgfHwgIWlkKVxyXG4gICAgcmVzLnN0YXR1cyg0MDEpLnNlbmQoe1xyXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbmQgdGhlIGNvbnRhY3QgbnVtYmVyIGFuZCBwcm9kdWN0SWQuJyxcclxuICAgIH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVxLmNsaWVudC5nZXRQcm9kdWN0QnlJZChcclxuICAgICAgcGhvbmUgYXMgc3RyaW5nLFxyXG4gICAgICBpZCBhcyBzdHJpbmdcclxuICAgICk7XHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzdWx0IH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXNcclxuICAgICAgLnN0YXR1cyg1MDApXHJcbiAgICAgIC5qc29uKHsgc3RhdHVzOiAnRXJyb3InLCBtZXNzYWdlOiAnRXJyb3Igb24gZ2V0IHByb2R1Y3QnLCBlcnJvcjogZXJyb3IgfSk7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlZGl0UHJvZHVjdChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2F0YWxvZyAmIEJ1c3NpbmVzc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHsgdHlwZTogXCJvYmplY3RcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICc8cHJvZHVjdF9pZD4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdOZXcgbmFtZSBmb3IgcHJvZHVjdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGlkLCBvcHRpb25zIH0gPSByZXEuYm9keTtcclxuICBpZiAoIWlkIHx8ICFvcHRpb25zKVxyXG4gICAgcmVzLnN0YXR1cyg0MDEpLnNlbmQoe1xyXG4gICAgICBtZXNzYWdlOiAncHJvZHVjdElkIG9yIG9wdGlvbnMgd2FzIG5vdCBpbmZvcm1lZCcsXHJcbiAgICB9KTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlcS5jbGllbnQuZWRpdFByb2R1Y3QoaWQsIG9wdGlvbnMpO1xyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3VsdCB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdFcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBlZGl0IHByb2R1Y3QuJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsUHJvZHVjdHMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNhdGFsb2cgJiBCdXNzaW5lc3NcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnJlcXVlc3RCb2R5ID0ge1xyXG4gICAgICAgIHJlcXVpcmVkOiB0cnVlLFxyXG4gICAgICAgIFwiQGNvbnRlbnRcIjoge1xyXG4gICAgICAgICAgICBcImFwcGxpY2F0aW9uL2pzb25cIjoge1xyXG4gICAgICAgICAgICAgICAgc2NoZW1hOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvYmplY3RcIixcclxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnPHByb2R1Y3RfaWQ+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBpZCB9ID0gcmVxLmJvZHk7XHJcbiAgaWYgKCFpZClcclxuICAgIHJlcy5zdGF0dXMoNDAxKS5zZW5kKHtcclxuICAgICAgbWVzc2FnZTogJ3Byb2R1Y3RzIElkIHdhcyBub3QgaW5mb3JtZWQnLFxyXG4gICAgfSk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXEuY2xpZW50LmRlbFByb2R1Y3RzKGlkKTtcclxuICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXN1bHQgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnRXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gZGVsZXRlIHByb2R1Y3QuJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hhbmdlUHJvZHVjdEltYWdlKHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJDYXRhbG9nICYgQnVzc2luZXNzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICBcclxuICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2U2NDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJzxwcm9kdWN0X2lkPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZTY0OiAnPGJhc2U2NF9zdHJpbmc+J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGlkLCBiYXNlNjQgfSA9IHJlcS5ib2R5O1xyXG4gIGlmICghaWQgfHwgIWJhc2U2NClcclxuICAgIHJlcy5zdGF0dXMoNDAxKS5zZW5kKHtcclxuICAgICAgbWVzc2FnZTogJ3Byb2R1Y3RJZCBhbmQgYmFzZTY0IHdhcyBub3QgaW5mb3JtZWQnLFxyXG4gICAgfSk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXEuY2xpZW50LmNoYW5nZVByb2R1Y3RJbWFnZShpZCwgYmFzZTY0KTtcclxuICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXN1bHQgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnRXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gY2hhbmdlIHByb2R1Y3QgaW1hZ2UuJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkUHJvZHVjdChyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2F0YWxvZyAmIEJ1c3NpbmVzc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlOiB7IHR5cGU6IFwic3RyaW5nXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmljZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldGFpbGVySWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnUHJvZHVjdCBuYW1lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZTogJzxiYXNlNjRfc3RyaW5nPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdEZXNjcmlwdGlvbiBmb3IgeW91ciBwcm9kdWN0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBwcmljZTogJzg4OTAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9saW5rX2Zvcl95b3VyX3Byb2R1Y3QuY29tJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXRhaWxlcklkOiAnU0tVMDAxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW5jeTogJ0JSTCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHtcclxuICAgIG5hbWUsXHJcbiAgICBpbWFnZSxcclxuICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgcHJpY2UsXHJcbiAgICB1cmwsXHJcbiAgICByZXRhaWxlcklkLFxyXG4gICAgY3VycmVuY3kgPSAnQlJMJyxcclxuICB9ID0gcmVxLmJvZHk7XHJcbiAgaWYgKCFuYW1lIHx8ICFpbWFnZSB8fCAhcHJpY2UpXHJcbiAgICByZXMuc3RhdHVzKDQwMSkuc2VuZCh7XHJcbiAgICAgIG1lc3NhZ2U6ICduYW1lLCBwcmljZSBhbmQgaW1hZ2Ugd2FzIG5vdCBpbmZvcm1lZCcsXHJcbiAgICB9KTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlcS5jbGllbnQuY3JlYXRlUHJvZHVjdChcclxuICAgICAgbmFtZSxcclxuICAgICAgaW1hZ2UsXHJcbiAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICBwcmljZSxcclxuICAgICAgZmFsc2UsXHJcbiAgICAgIHVybCxcclxuICAgICAgcmV0YWlsZXJJZCxcclxuICAgICAgY3VycmVuY3lcclxuICAgICk7XHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzdWx0IH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ0Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGFkZCBwcm9kdWN0LicsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZFByb2R1Y3RJbWFnZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2F0YWxvZyAmIEJ1c3NpbmVzc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlNjQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICc8cHJvZHVjdF9pZD4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2U2NDogJzxiYXNlNjRfc3RyaW5nPidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBpZCwgYmFzZTY0IH0gPSByZXEuYm9keTtcclxuICBpZiAoIWlkIHx8ICFiYXNlNjQpXHJcbiAgICByZXMuc3RhdHVzKDQwMSkuc2VuZCh7XHJcbiAgICAgIG1lc3NhZ2U6ICdwcm9kdWN0SWQgYW5kIGJhc2U2NCB3YXMgbm90IGluZm9ybWVkJyxcclxuICAgIH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVxLmNsaWVudC5hZGRQcm9kdWN0SW1hZ2UoaWQsIGJhc2U2NCk7XHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzdWx0IH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ0Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGFkZCBwcm9kdWN0IGltYWdlLicsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlbW92ZVByb2R1Y3RJbWFnZShyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2F0YWxvZyAmIEJ1c3NpbmVzc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogeyB0eXBlOiBcIm51bWJlclwiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJzxwcm9kdWN0X2lkPicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXg6IDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBpZCwgaW5kZXggfSA9IHJlcS5ib2R5O1xyXG4gIGlmICghaWQgfHwgIWluZGV4KVxyXG4gICAgcmVzLnN0YXR1cyg0MDEpLnNlbmQoe1xyXG4gICAgICBtZXNzYWdlOiAncHJvZHVjdElkIGFuZCBpbmRleCBpbWFnZSB3YXMgbm90IGluZm9ybWVkJyxcclxuICAgIH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVxLmNsaWVudC5yZW1vdmVQcm9kdWN0SW1hZ2UoaWQsIGluZGV4KTtcclxuICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXN1bHQgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnRXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gcmVtb3ZlIHByb2R1Y3QgaW1hZ2UuJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Q29sbGVjdGlvbnMocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNhdGFsb2cgJiBCdXNzaW5lc3NcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJwaG9uZVwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnNTUyMTk5OTk5OTk5OSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInFudFwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnMTAnXHJcbiAgICAgfVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJtYXhcIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJzEwJ1xyXG4gICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lLCBxbnQsIG1heCB9ID0gcmVxLnF1ZXJ5O1xyXG4gIGlmICghcGhvbmUpXHJcbiAgICByZXMuc3RhdHVzKDQwMSkuc2VuZCh7XHJcbiAgICAgIG1lc3NhZ2U6ICdwaG9uZSB3YXMgbm90IGluZm9ybWVkJyxcclxuICAgIH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVxLmNsaWVudC5nZXRDb2xsZWN0aW9ucyhcclxuICAgICAgcGhvbmUgYXMgc3RyaW5nLFxyXG4gICAgICBxbnQgYXMgc3RyaW5nLFxyXG4gICAgICBtYXggYXMgc3RyaW5nXHJcbiAgICApO1xyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3VsdCB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdFcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBnZXQgY29sbGVjdGlvbnMuJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlQ29sbGVjdGlvbihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2F0YWxvZyAmIEJ1c3NpbmVzc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogeyB0eXBlOiBcInN0cmluZ1wiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2R1Y3RzOiB7IHR5cGU6IFwiYXJyYXlcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ0NvbGxlY3Rpb24gbmFtZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZHVjdHM6IFsnPGlkX3Byb2R1Y3QxPicsICc8aWRfcHJvZHVjdDI+J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAqL1xyXG4gIGNvbnN0IHsgbmFtZSwgcHJvZHVjdHMgfSA9IHJlcS5ib2R5O1xyXG4gIGlmICghbmFtZSB8fCAhcHJvZHVjdHMpXHJcbiAgICByZXMuc3RhdHVzKDQwMSkuc2VuZCh7XHJcbiAgICAgIG1lc3NhZ2U6ICduYW1lIG9yIHByb2R1Y3RzIHdhcyBub3QgaW5mb3JtZWQnLFxyXG4gICAgfSk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXEuY2xpZW50LmNyZWF0ZUNvbGxlY3Rpb24obmFtZSwgcHJvZHVjdHMpO1xyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3VsdCB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdFcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBjcmVhdGUgY29sbGVjdGlvbi4nLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlZGl0Q29sbGVjdGlvbihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2F0YWxvZyAmIEJ1c3NpbmVzc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9kdWN0czogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXhhbXBsZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkRlZmF1bHRcIjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiAnPHByb2R1Y3RfaWQ+JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnTmV3IG5hbWUgZm9yIGNvbGxlY3Rpb24nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBpZCwgb3B0aW9ucyB9ID0gcmVxLmJvZHk7XHJcbiAgaWYgKCFpZCB8fCAhb3B0aW9ucylcclxuICAgIHJlcy5zdGF0dXMoNDAxKS5zZW5kKHtcclxuICAgICAgbWVzc2FnZTogJ2lkIG9yIG9wdGlvbnMgd2FzIG5vdCBpbmZvcm1lZCcsXHJcbiAgICB9KTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlcS5jbGllbnQuZWRpdENvbGxlY3Rpb24oaWQsIG9wdGlvbnMpO1xyXG4gICAgcmVzLnN0YXR1cygyMDEpLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3VsdCB9KTtcclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oe1xyXG4gICAgICBzdGF0dXM6ICdFcnJvcicsXHJcbiAgICAgIG1lc3NhZ2U6ICdFcnJvciBvbiBlZGl0IGNvbGxlY3Rpb24uJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQ29sbGVjdGlvbihyZXE6IFJlcXVlc3QsIHJlczogUmVzcG9uc2UpIHtcclxuICAvKipcclxuICAgKiAjc3dhZ2dlci50YWdzID0gW1wiQ2F0YWxvZyAmIEJ1c3NpbmVzc1wiXVxyXG4gICAgICNzd2FnZ2VyLmF1dG9Cb2R5PWZhbHNlXHJcbiAgICAgI3N3YWdnZXIuc2VjdXJpdHkgPSBbe1xyXG4gICAgICAgICAgICBcImJlYXJlckF1dGhcIjogW11cclxuICAgICB9XVxyXG4gICAgICNzd2FnZ2VyLnBhcmFtZXRlcnNbXCJzZXNzaW9uXCJdID0ge1xyXG4gICAgICBzY2hlbWE6ICdORVJEV0hBVFNfQU1FUklDQSdcclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICc8cHJvZHVjdF9pZD4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGlkIH0gPSByZXEuYm9keTtcclxuICBpZiAoIWlkKVxyXG4gICAgcmVzLnN0YXR1cyg0MDEpLnNlbmQoe1xyXG4gICAgICBtZXNzYWdlOiAnaWQgd2FzIG5vdCBpbmZvcm1lZCcsXHJcbiAgICB9KTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlcS5jbGllbnQuZGVsZXRlQ29sbGVjdGlvbihpZCk7XHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzdWx0IH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ0Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIGRlbGV0ZSBjb2xsZWN0aW9uLicsXHJcbiAgICAgIGVycm9yOiBlcnJvcixcclxuICAgIH0pO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFByb2R1Y3RWaXNpYmlsaXR5KHJlcTogUmVxdWVzdCwgcmVzOiBSZXNwb25zZSkge1xyXG4gIC8qKlxyXG4gICAqICNzd2FnZ2VyLnRhZ3MgPSBbXCJDYXRhbG9nICYgQnVzc2luZXNzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wib2JqXCJdID0ge1xyXG4gICAgICBpbjogJ2JvZHknLFxyXG4gICAgICBzY2hlbWE6IHtcclxuICAgICAgICAkaWQ6ICc8aWRfcHJvZHVjdD4nLFxyXG4gICAgICAgICR2YWx1ZTogZmFsc2UsXHJcbiAgICAgIH1cclxuICAgICB9XHJcbiAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHsgdHlwZTogXCJzdHJpbmdcIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogeyB0eXBlOiBcImJvb2xlYW5cIiB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBleGFtcGxlczoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiRGVmYXVsdFwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICc8cHJvZHVjdF9pZD4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICovXHJcbiAgY29uc3QgeyBpZCwgdmFsdWUgfSA9IHJlcS5ib2R5O1xyXG4gIGlmICghaWQgfHwgIXZhbHVlKVxyXG4gICAgcmVzLnN0YXR1cyg0MDEpLnNlbmQoe1xyXG4gICAgICBtZXNzYWdlOiAncHJvZHVjdCBpZCBvciB2YWx1ZSAoZmFsc2UsIHRydWUpIHdhcyBub3QgaW5mb3JtZWQnLFxyXG4gICAgfSk7XHJcblxyXG4gIHRyeSB7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXEuY2xpZW50LnNldFByb2R1Y3RWaXNpYmlsaXR5KGlkLCB2YWx1ZSk7XHJcbiAgICByZXMuc3RhdHVzKDIwMSkuanNvbih7IHN0YXR1czogJ3N1Y2Nlc3MnLCByZXNwb25zZTogcmVzdWx0IH0pO1xyXG4gIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7XHJcbiAgICAgIHN0YXR1czogJ0Vycm9yJyxcclxuICAgICAgbWVzc2FnZTogJ0Vycm9yIG9uIHNldCBwcm9kdWN0IHZpc2liaWxpdHkuJyxcclxuICAgICAgZXJyb3I6IGVycm9yLFxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlQ2FydEVuYWJsZWQocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIkNhdGFsb2cgJiBCdXNzaW5lc3NcIl1cclxuICAgICAjc3dhZ2dlci5hdXRvQm9keT1mYWxzZVxyXG4gICAgICNzd2FnZ2VyLnNlY3VyaXR5ID0gW3tcclxuICAgICAgICAgICAgXCJiZWFyZXJBdXRoXCI6IFtdXHJcbiAgICAgfV1cclxuICAgICAjc3dhZ2dlci5wYXJhbWV0ZXJzW1wic2Vzc2lvblwiXSA9IHtcclxuICAgICAgc2NoZW1hOiAnTkVSRFdIQVRTX0FNRVJJQ0EnXHJcbiAgICAgfVxyXG4gICAgICAjc3dhZ2dlci5yZXF1ZXN0Qm9keSA9IHtcclxuICAgICAgICByZXF1aXJlZDogdHJ1ZSxcclxuICAgICAgICBcIkBjb250ZW50XCI6IHtcclxuICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcclxuICAgICAgICAgICAgICAgIHNjaGVtYToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB7IHR5cGU6IFwiYm9vbGVhblwiIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IGVuYWJsZWQgfSA9IHJlcS5ib2R5O1xyXG4gIGlmICghZW5hYmxlZClcclxuICAgIHJlcy5zdGF0dXMoNDAxKS5zZW5kKHtcclxuICAgICAgbWVzc2FnZTogJ2VuYWJsZWQgKGZhbHNlLCB0cnVlKSB3YXMgbm90IGluZm9ybWVkJyxcclxuICAgIH0pO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVxLmNsaWVudC51cGRhdGVDYXJ0RW5hYmxlZChlbmFibGVkKTtcclxuICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHsgc3RhdHVzOiAnc3VjY2VzcycsIHJlc3BvbnNlOiByZXN1bHQgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnRXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gc2V0IGVuYWJsZWQgY2FydC4nLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTGlua0NhdGFsb2cocmVxOiBSZXF1ZXN0LCByZXM6IFJlc3BvbnNlKSB7XHJcbiAgLyoqXHJcbiAgICogI3N3YWdnZXIudGFncyA9IFtcIk1lc3NhZ2VzXCJdXHJcbiAgICAgI3N3YWdnZXIuYXV0b0JvZHk9ZmFsc2VcclxuICAgICAjc3dhZ2dlci5zZWN1cml0eSA9IFt7XHJcbiAgICAgICAgICAgIFwiYmVhcmVyQXV0aFwiOiBbXVxyXG4gICAgIH1dXHJcbiAgICAgI3N3YWdnZXIucGFyYW1ldGVyc1tcInNlc3Npb25cIl0gPSB7XHJcbiAgICAgIHNjaGVtYTogJ05FUkRXSEFUU19BTUVSSUNBJ1xyXG4gICAgIH1cclxuICAgICAgI3N3YWdnZXIucmVxdWVzdEJvZHkgPSB7XHJcbiAgICAgICAgcmVxdWlyZWQ6IHRydWUsXHJcbiAgICAgICAgXCJAY29udGVudFwiOiB7XHJcbiAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgIHBob25lczogeyB0eXBlOiBcImFycmF5XCIgfSxcclxuICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHsgdHlwZTogXCJzdHJpbmdcIiB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGV4YW1wbGVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJEZWZhdWx0XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBwaG9uZXM6IFsnPGFycmF5X3Bob25lX2lkJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ01lc3NhZ2UnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgKi9cclxuICBjb25zdCB7IHBob25lcywgbWVzc2FnZSB9ID0gcmVxLmJvZHk7XHJcbiAgaWYgKCFwaG9uZXMpXHJcbiAgICByZXMuc3RhdHVzKDQwMSkuc2VuZCh7XHJcbiAgICAgIG1lc3NhZ2U6ICdwaG9uZXMgd2FzIG5vdCBpbmZvcm1lZCcsXHJcbiAgICB9KTtcclxuICBjb25zdCByZXN1bHRzID0gW107XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IHNlc3Npb24gPSBhd2FpdCByZXEuY2xpZW50LmdldFdpZCgpO1xyXG4gICAgY29uc3QgY2F0YWxvZ0xpbmsgPSBjcmVhdGVDYXRhbG9nTGluayhzZXNzaW9uKTtcclxuICAgIGZvciAoY29uc3QgcGhvbmUgb2YgcGhvbmVzKSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHJlcS5jbGllbnQuc2VuZFRleHQoXHJcbiAgICAgICAgcGhvbmUsXHJcbiAgICAgICAgYCR7bWVzc2FnZX0gJHtjYXRhbG9nTGlua31gLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGJ1dHRvbnM6IFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgIHVybDogY2F0YWxvZ0xpbmssXHJcbiAgICAgICAgICAgICAgdGV4dDogJ0FicmlyIGNhdMOhbG9nbycsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICBdLFxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgICAgKHJlc3VsdHMgYXMgYW55KS5wdXNoKHsgcGhvbmUsIHN0YXR1czogcmVzdWx0LmlkIH0pO1xyXG4gICAgfVxyXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBzdGF0dXM6ICdzdWNjZXNzJywgcmVzcG9uc2U6IHJlc3VsdHMgfSk7XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIHJlcy5zdGF0dXMoNTAwKS5qc29uKHtcclxuICAgICAgc3RhdHVzOiAnRXJyb3InLFxyXG4gICAgICBtZXNzYWdlOiAnRXJyb3Igb24gc2V0IGVuYWJsZWQgY2FydC4nLFxyXG4gICAgICBlcnJvcjogZXJyb3IsXHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQWlCQSxJQUFBQSxVQUFBLEdBQUFDLE9BQUEsc0JBQXNELENBakJ0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FLTyxlQUFlQyxXQUFXQSxDQUFDQyxHQUFZLEVBQUVDLEdBQWEsRUFBRSxDQUM3RDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FDRSxNQUFNLEVBQUVDLEtBQUssRUFBRUMsR0FBRyxDQUFDLENBQUMsR0FBR0gsR0FBRyxDQUFDSSxLQUFLLENBQ2hDLElBQUksQ0FBQ0YsS0FBSyxFQUNSRCxHQUFHLENBQUNJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQ0MsSUFBSSxDQUFDLEVBQ25CQyxPQUFPLEVBQ0wsaUVBQWlFLENBQ3JFLENBQUMsQ0FBQyxDQUVKLElBQUksQ0FDRixNQUFNQyxNQUFNLEdBQUcsTUFBTVIsR0FBRyxDQUFDUyxNQUFNLEVBQUVWLFdBQVcsQ0FDMUNHLEtBQUssRUFDTEM7SUFDRixDQUFDO0lBQ0RGLEdBQUcsQ0FBQ0ksTUFBTSxDQUFDLEdB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