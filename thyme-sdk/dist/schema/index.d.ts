/**
 * Function validates args against schema (parsed from JSON schema)
 * @param schema JSON schema string generated using z.toJSONSchema()
 * @param args JSON string of arguments to validate
 * @returns True if args are valid, false otherwise
 */
export declare function validateSchema(schema: string, args: string): Promise<boolean>;
