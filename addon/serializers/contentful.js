import DS from 'ember-data';
import Ember from 'ember';

const {
  get,
  isNone,
  typeOf
} = Ember;

export default DS.JSONSerializer.extend({
  extractAttributes(modelClass, objHash) {
    let attributeKey;
    let attributes = {};

    modelClass.eachAttribute((key) => {
      attributeKey = this.keyForAttribute(key, 'deserialize');
      if (objHash && objHash.hasOwnProperty(attributeKey)) {
        let attributeValue = objHash[attributeKey];
        if (typeOf(attributeValue) === 'object' && modelClass.modelName !== 'asset') {
          attributeValue = attributeValue.sys.id;
        }
        attributes[key] = attributeValue;
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
      let ret = new Array(payload.items.length);
      for (let i = 0, l = payload.items.length; i < l; i++) {
        let item = payload.items[i];
        let {
          data,
          included
        } = this.normalize(primaryModelClass, item);

        if (included) {
          documentHash.included.push(...included);
        }
        ret[i] = data;
      }

      documentHash.data = ret;
    }
    return documentHash;
  }
});
