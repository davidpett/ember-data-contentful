import DS from 'ember-data';
import Ember from 'ember';

const {
  get,
  isNone,
  typeOf,
  assert,
} = Ember;

export default DS.JSONSerializer.extend({
  extractAttributes(modelClass, fieldsHash, objHash) {
    let attributeKey;
    let attributes = {};

    if (objHash.sys.type === 'Error') {
      console.warn(`[Contentful] ${objHash.message}`);
      console.warn(`[Contentful] It is possible that ${objHash.details.type}:${objHash.details.id} is not published, but is linked in this Entry.`);
      return {};
    }
    modelClass.eachAttribute((key) => {
      attributeKey = this.keyForAttribute(key, 'deserialize');
      if (fieldsHash && fieldsHash.hasOwnProperty(attributeKey)) {
        let attributeValue = fieldsHash[attributeKey];
        if (typeOf(attributeValue) === 'object' && objHash.sys.type !== 'Asset') {
          attributeValue = attributeValue.sys.id;
        }
        attributes[key] = attributeValue;
      }
      if (objHash) {
        attributes['contentType'] = objHash.sys.type === 'Asset' ? 'asset' : objHash.sys.contentType.sys.id;
        attributes['createdAt'] = objHash.sys.createdAt;
        attributes['updatedAt'] = objHash.sys.updatedAt;
      }
    });
    return attributes;
  },

  modelHasAttributeOrRelationshipNamedType(modelClass) {
    return get(modelClass, 'attributes').has('type') || get(modelClass, 'relationshipsByName').has('type');
  },

  extractRelationship(relationshipModelName, relationshipHash) {
    if (isNone(relationshipHash)) {
      return null;
    }
    if (typeOf(relationshipHash) === 'object') {
      let modelClass = this.store.modelFor(relationshipModelName);
      if (relationshipHash.sys.type && !this.modelHasAttributeOrRelationshipNamedType(modelClass)) {
        relationshipHash.type = modelClass.modelName;
        relationshipHash.id = relationshipHash.sys.id;
        delete relationshipHash.sys;

        return relationshipHash;
      } else {
        if (relationshipHash.fields) {
          let data = {
            id: relationshipHash.sys.id,
            type: modelClass.modelName,
            attributes: this.extractAttributes(modelClass, relationshipHash.fields, relationshipHash),
            relationships: this.extractRelationships(modelClass, relationshipHash.fields)
          };
          return data;
        }
      }
    }
    return { id: relationshipHash.sys.id, type: relationshipModelName };
  },

  normalize(modelClass, resourceHash) {
    let data = null;

    if (resourceHash) {
      data = {
        id: resourceHash.sys.id,
        type: modelClass.modelName,
        attributes: this.extractAttributes(modelClass, resourceHash.fields, resourceHash),
        relationships: this.extractRelationships(modelClass, resourceHash.fields)
      };
      this.applyTransforms(modelClass, data.attributes);
    }

    return { data };
  },

  normalizeResponse(store, primaryModelClass, payload, id, requestType) {
    switch (requestType) {
      case 'findRecord':
        return this.normalizeFindRecordResponse(...arguments);
      case 'queryRecord':
        return this.normalizeQueryRecordResponse(...arguments);
      case 'findAll':
        return this.normalizeFindAllResponse(...arguments);
      case 'findBelongsTo':
        return this.normalizeFindBelongsToResponse(...arguments);
      case 'findHasMany':
        return this.normalizeFindHasManyResponse(...arguments);
      case 'findMany':
        return this.normalizeFindManyResponse(...arguments);
      case 'query':
        return this.normalizeQueryResponse(...arguments);
      default:
        return null;
    }
  },

  normalizeFindRecordResponse() {
    return this.normalizeSingleResponse(...arguments);
  },

  normalizeQueryRecordResponse(store, primaryModelClass, payload, id, requestType) {
    let [firstItem] = payload.items;
    return this.normalizeSingleResponse(store, primaryModelClass, firstItem, id, requestType);
  },

  normalizeFindAllResponse() {
    return this.normalizeArrayResponse(...arguments);
  },

  normalizeFindBelongsToResponse() {
    return this.normalizeSingleResponse(...arguments);
  },

  normalizeFindHasManyResponse() {
    return this.normalizeArrayResponse(...arguments);
  },

  normalizeFindManyResponse() {
    return this.normalizeArrayResponse(...arguments);
  },

  normalizeQueryResponse() {
    return this.normalizeArrayResponse(...arguments);
  },

  normalizeSingleResponse() {
    return this._normalizeResponse(...arguments, true);
  },

  normalizeArrayResponse() {
    return this._normalizeResponse(...arguments, false);
  },

  _normalizeResponse(store, primaryModelClass, payload, id, requestType, isSingle) {
    let documentHash = {
      data: null,
      included: []
    };

    let meta = this.extractMeta(store, primaryModelClass, payload);
    if (meta) {
      assert('The `meta` property returned from `extractMeta` has to be an object.', typeof(meta) === 'object');
      documentHash.meta = meta;
    }

    if (isSingle) {
      let {
        data,
        included
      } = this.normalize(primaryModelClass, payload);

      documentHash.data = data;
      if (included) {
        documentHash.included = included;
      }
    } else {

      let items = new Array();
      for (let i = 0, l = payload.items.length; i < l; i++) {
        let item = payload.items[i];
        let {
          data,
          included
        } = this.normalize(primaryModelClass, item);

        if (included) {
          documentHash.included.push(...included);
        }
        items.push(data);
      }
      documentHash.data = items;

      if (payload.includes) {

        let entries = new Array();
        let assets = new Array();

        if (payload.includes.Entry) {
          for (let i = 0, l = payload.includes.Entry.length; i < l; i++) {
            let item = payload.includes.Entry[i];
            let {
              data
            } = this.normalize(store.modelFor(item.sys.contentType.sys.id), item);
            entries.push(data);
          }
        }

        if (payload.includes.Asset) {
          for (let i = 0, l = payload.includes.Asset.length; i < l; i++) {
            let item = payload.includes.Asset[i];
            let {
              data
            } = this.normalize(store.modelFor('contentful-asset'), item);
            assets.push(data);
          }
        }

        documentHash.included = entries.concat(assets);
      }
    }

    return documentHash;
  },

  /**
    @method extractMeta
    @param {DS.Store} store
    @param {DS.Model} modelClass
    @param {Object} payload
  **/
  extractMeta(store, modelClass, payload) {
    if (payload) {
      let meta = {};
      if (payload.hasOwnProperty('limit')) {
        meta.limit = payload.limit;
      }
      if (payload.hasOwnProperty('skip')) {
        meta.skip = payload.skip;
      }
      if (payload.hasOwnProperty('total')) {
        meta.total = payload.total;
      }
      return meta;
    }
  },
});
