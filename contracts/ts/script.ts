import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

type AstNode = {
	nodeType: string;
	name?: string;
	canonicalName?: string;
	absolutePath?: string;
	nodes?: AstNode[];
	members?: AstNode[];
	typeDescriptions?: { typeString?: string };
	id?: number;
};

type ContractTypes = {
	enums: {
		name: string;
		members: string[];
	}[];
	structs: {
		name: string;
		members: { name: string; type: string }[];
	}[];
};

const REPO_ROOT = process.cwd();
const CONTRACTS_ROOT = existsSync(join(REPO_ROOT, "contracts", "out"))
	? join(REPO_ROOT, "contracts")
	: REPO_ROOT;
const OUT_DIR = join(CONTRACTS_ROOT, "out");
const OUTPUT_USER_FILE = join(CONTRACTS_ROOT, "package", "types.user.ts");
const OUTPUT_LIBS_FILE = join(CONTRACTS_ROOT, "package", "types.libs.ts");
const USER_SOURCE_PREFIXES = ["src/"];

const isJson = (file: string) => file.endsWith(".json");

const walkJsonFiles = (dir: string, acc: string[] = []): string[] => {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const stats = statSync(full);
		if (stats.isDirectory()) {
			walkJsonFiles(full, acc);
		} else if (stats.isFile() && isJson(entry)) {
			acc.push(full);
		}
	}
	return acc;
};

const extractContracts = (ast: AstNode): AstNode[] => {
	const found: AstNode[] = [];
	const visit = (node?: AstNode) => {
		if (!node) return;
		if (node.nodeType === "ContractDefinition") {
			found.push(node);
		}
		if (node.nodes) {
			for (const child of node.nodes) visit(child);
		}
	};
	visit(ast);
	return found;
};

const normalizeTypeString = (typeString: string): string => {
	const trimmed = typeString.trim();
	if (trimmed.startsWith("struct ")) return trimmed.replace("struct ", "");
	if (trimmed.startsWith("enum ")) return trimmed.replace("enum ", "");
	if (trimmed.startsWith("contract ")) return "Address";
	return trimmed;
};

const canFitInNumber = (bits: number) => bits <= 53;

const integerTypeToTs = (typeString: string): string => {
	const match = typeString.match(/^(u?)int([0-9]*)$/);
	const width = match?.[2] ? Number(match[2]) : 256;
	return canFitInNumber(width) ? "number" : "bigint";
};

const mapBaseType = (typeString: string): string => {
	const normalized = normalizeTypeString(typeString);

	if (normalized.startsWith("mapping(")) {
		const mappingMatch = normalized.match(/^mapping\((.*)=>(.*)\)$/);
		if (!mappingMatch) return "Record<string, unknown>";
		const key = typeStringToTs(mappingMatch[1].trim());
		const value = typeStringToTs(mappingMatch[2].trim());
		return `Record<${key}, ${value}>`;
	}

	if (normalized === "address") return "Address";
	if (normalized === "bool") return "boolean";
	if (normalized === "string") return "string";
	if (normalized.startsWith("bytes")) return "Bytes";
	if (normalized.startsWith("uint") || normalized.startsWith("int"))
		return integerTypeToTs(normalized);

	return normalized;
};

const typeStringToTs = (typeString: string): string => {
	const arrayMatch = typeString.match(/(\[[0-9]*\])+$/);
	const arraySuffix = arrayMatch ? arrayMatch[0] : "";
	const base = arraySuffix ? typeString.slice(0, -arraySuffix.length).trim() : typeString.trim();

	let mapped = mapBaseType(base);

	if (arraySuffix) {
		const dims = arraySuffix.match(/\[[0-9]*\]/g) ?? [];
		for (let i = 0; i < dims.length; i += 1) {
			mapped = `Array<${mapped}>`;
		}
	}

	return mapped;
};

const collectTypesFromContract = (contract: AstNode): ContractTypes => {
	const enums: ContractTypes["enums"] = [];
	const structs: ContractTypes["structs"] = [];

	const enumNames = new Set<string>();
	const structNames = new Set<string>();

	for (const node of contract.nodes ?? []) {
		if (node.nodeType === "EnumDefinition" && node.name) {
			if (enumNames.has(node.name)) continue;
			enumNames.add(node.name);
			const members = (node.members ?? [])
				.map((member) => member.name)
				.filter((memberName): memberName is string => Boolean(memberName));
			enums.push({ name: node.name, members });
		}

		if (node.nodeType === "StructDefinition" && node.name) {
			if (structNames.has(node.name)) continue;
			structNames.add(node.name);
			const members = (node.members ?? [])
				.map((member) => ({
					name: member.name ?? "",
					type: typeStringToTs(member.typeDescriptions?.typeString ?? "unknown"),
				}))
				.filter((member) => member.name.length > 0);
			structs.push({ name: node.name, members });
		}
	}

	return { enums, structs };
};

const mergeTypes = (target: ContractTypes, incoming: ContractTypes) => {
	const enumNames = new Set(target.enums.map((en) => en.name));
	for (const en of incoming.enums) {
		if (enumNames.has(en.name)) continue;
		enumNames.add(en.name);
		target.enums.push(en);
	}

	const structNames = new Set(target.structs.map((st) => st.name));
	for (const st of incoming.structs) {
		if (structNames.has(st.name)) continue;
		structNames.add(st.name);
		target.structs.push(st);
	}
};

const generateTypes = (contractTypes: Map<string, ContractTypes>, label: string): string => {
	const lines: string[] = [];
	lines.push(`/* Auto-generated by contracts/ts/script.ts (${label}). Do not edit manually. */`);
	lines.push("export type Address = string;");
	lines.push("export type Bytes = string;");
	lines.push("");

	for (const [contractName, types] of contractTypes) {
		const sortedEnums = [...types.enums].sort((a, b) => a.name.localeCompare(b.name));
		const sortedStructs = [...types.structs].sort((a, b) => a.name.localeCompare(b.name));
		if (types.enums.length === 0 && types.structs.length === 0) continue;
		lines.push(`export namespace ${contractName} {`);

		for (const en of sortedEnums) {
			lines.push(`\texport enum ${en.name} {`);
			for (let i = 0; i < en.members.length; i += 1) {
				const member = en.members[i];
				lines.push(`\t\t${member} = ${i},`);
			}
			lines.push("\t}");
		}

		for (const st of sortedStructs) {
			lines.push(`\texport type ${st.name} = {`);
			for (const member of st.members) {
				lines.push(`\t\t${member.name}: ${member.type};`);
			}
			lines.push("\t};");
		}

		lines.push("}");
		lines.push("");
	}

	return lines.join("\n");
};

const main = () => {
	const jsonFiles = walkJsonFiles(OUT_DIR);
	const userContractTypes = new Map<string, ContractTypes>();
	const libsContractTypes = new Map<string, ContractTypes>();

	for (const file of jsonFiles) {
		const content = readFileSync(file, "utf8");
		const parsed = JSON.parse(content) as { ast?: AstNode };
		if (!parsed.ast) continue;

		const isUserSource = USER_SOURCE_PREFIXES.some((prefix) =>
			parsed.ast?.absolutePath?.startsWith(prefix),
		);
		const targetMap = isUserSource ? userContractTypes : libsContractTypes;

		const contracts = extractContracts(parsed.ast);
		for (const contract of contracts) {
			const name = contract.name ?? contract.canonicalName;
			if (!name) continue;

			const types = collectTypesFromContract(contract);
			if (!targetMap.has(name)) {
				targetMap.set(name, types);
			} else {
				const existing = targetMap.get(name);
				if (!existing) continue;
				mergeTypes(existing, types);
			}
		}
	}

	const userOutput = generateTypes(userContractTypes, "user");
	const libsOutput = generateTypes(libsContractTypes, "libs");
	writeFileSync(OUTPUT_USER_FILE, userOutput, "utf8");
	writeFileSync(OUTPUT_LIBS_FILE, libsOutput, "utf8");

	const relativeUserOut = relative(REPO_ROOT, OUTPUT_USER_FILE);
	const relativeLibsOut = relative(REPO_ROOT, OUTPUT_LIBS_FILE);
	const userCount = Array.from(userContractTypes.values()).reduce(
		(acc, value) => acc + value.enums.length + value.structs.length,
		0,
	);
	const libsCount = Array.from(libsContractTypes.values()).reduce(
		(acc, value) => acc + value.enums.length + value.structs.length,
		0,
	);
	console.log(`Generated ${relativeUserOut} (${userCount}) and ${relativeLibsOut} (${libsCount}).`);
};

main();
