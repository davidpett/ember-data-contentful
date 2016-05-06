import DS from 'ember-data';
import Ember from 'ember';
import config from 'ember-get-config';
import fetch from 'ember-network/fetch';
import injectService from 'ember-service/inject';

const {
  get
} = Ember;

export default DS.Adapter.extend({
  torii: injectService(),

  /**
    @property coalesceFindRequests
    @type {boolean}
    @public
  */
  coalesceFindRequests: true,

  /**
    @property defaultSerializer
    @type {String}
    @public
  */
  defaultSerializer: 'contentful',

  /**
    Currently not implemented as this is adapter only implements the
    READ ONLY Content Delivery API (https://www.contentful.com/developers/docs/references/content-delivery-api/).
    For more information on the Content Management API,
    see https://www.contentful.com/developers/docs/references/content-management-api/

    @method createRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
    @public
  */
  createRecord(store, type, snapshot) {
    let data = {};
    let serializer = store.serializerFor(type.modelName);
    // let url = this.buildURL(type.modelName, null, snapshot, 'createRecord');

    serializer.serializeIntoHash(data, type, snapshot, { includeId: true });

    return this._setContent('create', type, { data });
  },

  /**
    Currently not implemented as this is adapter only implements the
    READ ONLY Content Delivery API (https://www.contentful.com/developers/docs/references/content-delivery-api/).
    For more information on the Content Management API,
    see https://www.contentful.com/developers/docs/references/content-management-api/

    @method updateRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
    @public
  */
  updateRecord(store, type, snapshot) {
    let data = {};
    let serializer = store.serializerFor(type.modelName);
    let id = snapshot.id;

    serializer.serializeIntoHash(data, type, snapshot);

    // let url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this._setContent('update', type, id, { data });
  },

  /**
    Currently not implemented as this is adapter only implements the
    READ ONLY Content Delivery API (https://www.contentful.com/developers/docs/references/content-delivery-api/).
    For more information on the Content Management API,
    see https://www.contentful.com/developers/docs/references/content-management-api/

    @method deleteRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {DS.Snapshot} snapshot
    @return {Promise} promise
    @public
  */
  deleteRecord(store, type, snapshot) {
    let id = snapshot.id;

    return this._setContent('delete', type, id);
  },

  /**
    Called by the store in order to fetch the JSON for a given
    type and ID.

    The `findRecord` method makes a fetch (HTTP GET) request to a URL, and returns a
    promise for the resulting payload.

    @method findRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {String} id
    @return {Promise} promise
    @public
  */
  findRecord(store, type, id) {
    let contentType = (type.modelName === 'asset' || type.modelName === 'contentful-asset') ? 'asset' : 'entries';

    return this._getContent(`${contentType}/${id}`);
  },

  /**
    Called by the store in order to fetch several records together.

    The `findMany` method makes a fetch (HTTP GET) request to a URL, and returns a
    promise for the resulting payload.

    @method findMany
    @param {DS.Store} store
    @param {DS.Model} type
    @param {Array} ids
    @return {Promise} promise
    @public
  */
  findMany(store, type, ids) {
    let contentType = (type.modelName === 'asset' || type.modelName === 'contentful-asset') ? 'asset' : 'entries';

    return this._getContent(contentType, { 'sys.id[in]': ids.toString() });
  },

  /**
    Called by the store in order to fetch a JSON array for all
    of the records for a given type.

    The `findAll` method makes a fetch (HTTP GET) request to a URL, and returns a
    promise for the resulting payload.

    @method findAll
    @param {DS.Store} store
    @param {DS.Model} type
    @return {Promise} promise
    @public
  */
  findAll(store, type) {
    return this._getContent('entries', { 'content_type': type.modelName });
  },

  /**
    Called by the store in order to fetch a JSON array for
    the records that match a particular query.

    The `query` method makes a fetch (HTTP GET) request to a URL
    and returns a promise for the resulting payload.

    The `query` argument is a simple JavaScript object that will be passed directly
    to the server as parameters.

    @method query
    @param {DS.Store} store
    @param {DS.Model} type
    @param {Object} query
    @return {Promise} promise
    @public
  */
  query(store, type, query) {
    query = query || {};
    query['content_type'] = type.modelName;
    return this._getContent('entries', query);
  },

  /**
    Called by the store in order to fetch a JSON object for
    the record that matches a particular query.

    The `queryRecord` method makes a fetch (HTTP GET) request to a URL
    and returns a promise for the resulting payload.

    The `query` argument is a simple JavaScript object that will be passed directly
    to the server as parameters.

    @method queryRecord
    @param {DS.Store} store
    @param {DS.Model} type
    @param {Object} query
    @return {Promise} promise
    @public
  */
  queryRecord(store, type, query) {
    query = query || {};
    query['content_type'] = type.modelName;
    return this._getContent('entries', query);
  },

  /**
    `_getContent` makes all requests to the contentful.com content delivery API

    @method _getContent
    @param {String} type
    @param {Object} params
    @return {Promise} promise
    @private
  */
  _getContent(type, params) {
    let data = params || {};
    let {
      accessToken,
      api,
      space
    } = this._getConfig('delivery');

    Object.assign(data, {
      'access_token': accessToken
    });
    return fetch(`https://${api}.contentful.com/spaces/${space}/${type}/${this._serializeQueryParams(data)}`, {
      headers: {
        'Accept': 'application/json; charset=utf-8'
      }
    }).then((response) => {
      return response.json();
    });
  },

  /**
    `_setContent` makes all requests to the contentful.com content management API

    @method _setContent
    @param {String} type
    @param {Object} params
    @return {Promise} promise
    @private
  */
  _setContent(method, type, id, data) {
    console.warn(`The Contentful Content Management API has not yet been fully implemented`);
    let body = data || {};
    let {
      headers,
      space
    } = this._getConfig('management', method, type);

    return fetch(`https://api.contentful.com/spaces/${space}/entries/${id}`, {
      method,
      body,
      headers
    }).then((response) => {
      return response.json();
    });
  },

  /**
    `_serializeQueryParams` is a private utility used to
    stringify the query param object to be used with the fetch API.

    @method _serializeQueryParams
    @param {Object} obj
    @return {String} query string
    @private
  */
  _serializeQueryParams(obj) {
    let str = [];
    for (let p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(`${encodeURIComponent(p)}=${encodeURIComponent(obj[p])}`);
      }
    }
    return str.length ? `?${str.join('&')}` : '';
  },

  /**
    `_getConfig` returns the config from your `config/environment.js`

    @method _getConfig
    @param {String} type
    @param {String} method
    @param {String} contentType
    @return {Object} params
    @private
  */
  _getConfig(type, method, contentType) {
    let {
      accessToken,
      previewAccessToken,
      space,
      usePreviewApi
    } = config.contentful;

    if (type === 'delivery') {
      let api = 'cdn';

      if (usePreviewApi) {
        if (!previewAccessToken) {
          console.warn('You have specified to use the Contentful Preview API; However, no `previewAccessToken` has been specified in config/environment.js');
        } else {
          accessToken = previewAccessToken;
          api = 'preview';
        }
      }
      return {
        accessToken,
        api,
        space
      };
    } else {
      return this._getHeaders(method, contentType).then((headers) => {
        return {
          headers,
          space
        };
      });

    }
  },

  /**
    `_getHeaders` returns a headers object for the Contentful Content Management API

    @method _getHeaders
    @param {String} method
    @param {String} contentType
    @return {Object} headers
    @private
  */
  _getHeaders(method, contentType) {
    return get(this, 'torii').open('contentful-oauth2-bearer').then((authorization) => {
      let headers = {
        'Authorization': `Bearer ${authorization.accessToken}`
      };

      if (method === 'post' || method === 'put') {
        headers['Content-Type'] = 'application/vnd.contentful.management.v1+json';
        headers['X-Contentful-Content-Type'] = contentType;
      }
      if (method === 'delete') {
        headers['X-Contentful-Version'] = 4;
      }
      return headers;
    });
  }
});
