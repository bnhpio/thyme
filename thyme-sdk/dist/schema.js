import ajv_0 from "ajv";
async function validateSchema(schema, args) {
    try {
        const parsedSchema = JSON.parse(schema);
        const parsedArgs = JSON.parse(args);
        const ajv = new ajv_0();
        const valid = ajv.validate(parsedSchema, parsedArgs);
        return valid;
    } catch (error) {
        console.error(error);
        return false;
    }
}
export { validateSchema };
