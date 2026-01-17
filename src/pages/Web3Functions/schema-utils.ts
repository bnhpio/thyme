import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export interface SchemaField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  default?: unknown;
  enum?: string[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  items?: SchemaField;
}

export function parseOpenAPISchema(schemaJson: string): SchemaField[] {
  try {
    const schema = JSON.parse(schemaJson);
    const fields: SchemaField[] = [];

    // Handle OpenAPI 3.0 format
    if (schema.openapi && schema.components?.schemas) {
      // Find the request body schema
      const paths = schema.paths;
      if (paths) {
        for (const pathKey in paths) {
          const path = paths[pathKey];
          for (const method in path) {
            const operation = path[method];
            if (operation.requestBody?.content?.['application/json']?.schema) {
              const requestSchema =
                operation.requestBody.content['application/json'].schema;
              return extractSchemaFields(requestSchema, schema.components);
            }
          }
        }
      }

      // Fallback: try to find a schema in components
      const firstSchema = Object.values(schema.components.schemas)[0];
      if (firstSchema) {
        return extractSchemaFields(firstSchema, schema.components);
      }
    }

    // Handle direct JSON Schema format
    if (schema.type === 'object' && schema.properties) {
      return extractSchemaFields(schema, {});
    }

    return fields;
  } catch (error) {
    console.error('Failed to parse schema:', error);
    return [];
  }
}

interface JsonSchemaProperty {
  type?: string;
  description?: string;
  default?: unknown;
  enum?: string[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  items?: JsonSchemaProperty;
  $ref?: string;
}

interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

interface Components {
  schemas?: Record<string, JsonSchemaProperty>;
}

function extractSchemaFields(
  schema: JsonSchema,
  components: Components,
): SchemaField[] {
  const fields: SchemaField[] = [];
  const required = schema.required || [];

  if (schema.properties) {
    for (const [name, prop] of Object.entries(schema.properties)) {
      const property: JsonSchemaProperty = prop;
      const field: SchemaField = {
        name,
        type: property.type || 'string',
        required: required.includes(name),
        description: property.description,
        default: property.default,
      };

      // Handle $ref
      if (property.$ref) {
        const refPath = property.$ref.replace('#/components/schemas/', '');
        const refSchema = components?.schemas?.[refPath];
        if (refSchema) {
          Object.assign(field, {
            type: refSchema.type || 'string',
            description: refSchema.description || field.description,
            enum: refSchema.enum,
            format: refSchema.format,
          });
        }
      }

      // Copy additional properties
      if (property.enum) field.enum = property.enum;
      if (property.format) field.format = property.format;
      if (property.minimum !== undefined) field.minimum = property.minimum;
      if (property.maximum !== undefined) field.maximum = property.maximum;
      if (property.minLength !== undefined)
        field.minLength = property.minLength;
      if (property.maxLength !== undefined)
        field.maxLength = property.maxLength;
      if (property.pattern) field.pattern = property.pattern;

      // Handle array items
      if (property.type === 'array' && property.items) {
        field.items = {
          name: '',
          type: property.items.type || 'string',
          required: false,
          enum: property.items.enum,
        };
      }

      fields.push(field);
    }
  }

  return fields;
}

export function validateSchemaData(
  schemaJson: string,
  data: Record<string, unknown>,
): { valid: boolean; errors: string[] } {
  try {
    const schema = JSON.parse(schemaJson);
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid && validate.errors) {
      const errors = validate.errors.map(
        (err) => `${err.instancePath || err.schemaPath}: ${err.message}`,
      );
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Validation failed'],
    };
  }
}
