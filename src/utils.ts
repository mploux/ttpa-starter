/**********************************************************
*
*  Utils
*  @author Marc <marcandre@ploux.fr>
*
***********************************************************/


// Schema parser
//---------------------------------------------------------
export function parseAs(SchemaObj: any, data: any | any[]) {
	
	const parseEntry = (entry: any) => {
		const schema = new SchemaObj()
		Object.keys(schema).forEach(key => { 
			return schema[key] = entry[key]
		})
		return schema
	}

	if (Array.isArray(data))
		return data.map((entry: any) => parseEntry(entry))
	return parseEntry(data)
}
