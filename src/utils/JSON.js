/**
 * Utility class for JSON operations
 */
fc.JSON = class {
	static stringify(obj, formatted = true) {
		if (typeof obj !== 'object') return obj;
		return formatted
			? JSON.stringify(obj, null, 4).replaceAll( /},\n\s*{/gm, '},{' ).replaceAll('    ', "\t")
			: JSON.stringify(obj)
	}

	static parse(text) {
		try {
			return JSON.parse(text);
		} catch (err) {
			console.warn('Invalid JSON:', err);
			const repaired = this.repair(text);
			try {
				return JSON.parse(repaired);
			} catch (repairErr) {
				console.warn('Repair failed:', repairErr);
				return null; // or throw error
			}
		}
	}

	static hash(obj) {
		const text = JSON.stringify(obj);
		let hash = 0;
		for (let i = 0; i < text.length; i++) {
			const chr = text.charCodeAt(i);
			hash = (hash << 5) - hash + chr;
			hash |= 0;
		}
		return hash.toString(36);
	}

	static repair(text) {
		if (!text) return '';

		let repaired = text + "\n";

		repaired = this._normalize_whitespace(repaired);
		repaired = this._add_missing_commas(repaired);
		repaired = this._remove_invalid_commas(repaired);
		repaired = this._cleanup(repaired);

		return repaired;
	}

	static _normalize_whitespace(text) {
		return text
			.replaceAll("\r", "\n")
			.replace(/\s*\n\s*/gm, "\n")
			.replace(/\n,[,\s]*/gm, ",\n")
			.replace(/\n\s*}[,\s]*{\n/gm, "\n},\n{")
			.replace(/\n\s*\][,\s]*\[\n/gm, "\n],\n[")
			.replace(/,[,\s]*\n/gm, ",\n");
	}

	static _add_missing_commas(text) {
		return text
			.replaceAll("}\n{", "},\n{")
			.replaceAll("}\n\"", "},\n\"")
			.replaceAll("]\n[", "],\n[")
			.replaceAll("]\n\"", "],\n\"")
			.replaceAll("\"\n\"", "\",\n\"")
			.replaceAll("\"\n{", "\",\n{");
	}

	static _remove_invalid_commas(text) {
		return text
			.replaceAll("},\n}", "}\n}")
			.replaceAll("},\n]", "}\n]")
			.replaceAll("],\n}", "]\n}")
			.replaceAll("],\n]", "]\n]")
			.replaceAll("\",\n}", "\"\n}")
			.replaceAll("\",\n]", "\"\n]")
			.replaceAll("{,\n", "{\n")
			.replaceAll("[,\n", "[\n");
	}

	static _cleanup(text) {
		text = text.trim();
		if (text.endsWith(',')) {
			text = text.substring(0, text.length - 1);
		}
		return text;
	}
}