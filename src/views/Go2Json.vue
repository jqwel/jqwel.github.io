<template>
  <div class="container-fluid">
    <h2 class="mb-3">Go Struct ↔ JSON 转换</h2>
    <div class="row">
      <!-- Struct -->
      <div class="col-6">
        <label class="form-label">Go Struct</label>
        <textarea
            v-model="goStruct"
            rows="20"
            class="form-control"
            @input="handleGoInput"
        ></textarea>
      </div>

      <!-- JSON -->
      <div class="col-6">
        <label class="form-label">JSON</label>
        <textarea
            v-model="jsonText"
            rows="20"
            class="form-control"
            @input="handleJsonInput"
        ></textarea>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GoJsonConverterRandom",
  data() {
    return {
      goStruct: `type User struct {
  ID      int        \`json:"id"\`
  Name    string     \`json:"name"\`
  Active  bool       \`json:"active"\`
  Profile *Profile   \`json:"profile"\`
  Tags    []string   \`json:"tags"\`
  Friends []Friend   \`json:"friends"\`
}

type Profile struct {
  Email   string \`json:"email"\`
  Address string \`json:"address"\`
}

type Friend struct {
  Name string \`json:"name"\`
  Age  int    \`json:"age"\`
}`,
      jsonText: "",
      isSyncing: false,
    };
  },
  mounted() {
    this.handleGoInput();
  },
  methods: {
    handleGoInput() {
      if (this.isSyncing) return;
      this.isSyncing = true;
      try {
        const structDefs = this.parseStructs(this.goStruct);
        const root = Object.keys(structDefs)[0];
        const example = this.generateJson(structDefs, root);
        this.jsonText = JSON.stringify(example, null, 2);
      } catch (err) {
        this.jsonText = `// 解析失败：${err.message}`;
      } finally {
        this.isSyncing = false;
      }
    },

    // 基础结构提取器（支持多 struct）
    parseStructs(code) {
      const structs = {};
      const structRegex = /type\s+(\w+)\s+struct\s*{([^}]*)}/gs;
      let match;

      while ((match = structRegex.exec(code)) !== null) {
        const [, name, body] = match;
        const fields = [];
        const lines = body.split("\n")
            .map(l => l.trim())
            .map(l => l.split("//")[0].trim())
            .filter(Boolean);

        for (const line of lines) {
          // 匹配带 tag 的
          let m = line.match(/^(\w+)\s+([^\s]+)\s+`json:"([^"]+)"`/);
          if (m) {
            fields.push({ name: m[1], type: m[2], jsonKey: m[3] });
            continue;
          }

          // 匹配无 tag 的
          m = line.match(/^(\w+)\s+([^\s`]+)$/);
          if (m) {
            const fieldName = m[1];
            fields.push({
              name: fieldName,
              type: m[2],
              jsonKey: fieldName,
              // jsonKey: fieldName.charAt(0).toLowerCase() + fieldName.slice(1),
            });
          }
        }

        structs[name] = fields;
      }
      return structs;
    }
    ,

    generateJson(structMap, typeName) {
      const randString = (keyName = "") => {
        if (/url$|uri$|link$/i.test(keyName)) {
          const domains = ["example.com", "test.io", "my.site"];
          const paths = ["foo", "bar", "image", "profile"];
          const domain = domains[Math.floor(Math.random() * domains.length)];
          const path = paths[Math.floor(Math.random() * paths.length)];
          return `https://${domain}/${path}`;
        }
        return ["foo", "bar", "baz", "golang", "hello"][Math.floor(Math.random() * 5)];
      };
      const randInt = () => Math.floor(Math.random() * 100);
      const randBool = () => Math.random() > 0.5;

      const resolveType = (jsonKey, type) => {
        const isArray = type.startsWith("[]");
        const isPointer = type.startsWith("*");
        const baseType = isArray
            ? type.slice(2)
            : isPointer
                ? type.slice(1)
                : type;

        let value;
        switch (baseType) {
          case "string":
            value = randString(jsonKey);
            break;
          case "int":
          case "int64":
          case "float64":
            value = randInt();
            break;
          case "bool":
            value = randBool();
            break;
          default:
            value = this.generateJson(structMap, baseType);
        }

        if (isArray) return [value, value]; // array 模拟两个元素
        return value;
      };

      const schema = {};
      const fields = structMap[typeName];
      if (!fields) throw new Error(`未定义结构体: ${typeName}`);

      for (const { jsonKey, type } of fields) {
        schema[jsonKey] = resolveType(jsonKey, type);
      }
      return schema;
    },

    handleJsonInput() {
      if (this.isSyncing) return;
      this.isSyncing = true;
      try {
        const obj = JSON.parse(this.jsonText);
        const goCode = this.generateGoStructFromJson(obj);
        this.goStruct = goCode;
      } catch (err) {
        this.goStruct = `// JSON 转换失败：${err.message}`;
      } finally {
        this.isSyncing = false;
      }
    },
    generateGoStructFromJson(obj, structName = "AutoGenerated") {
      const toCamelCase = str =>
          str
              .replace(/[_-](\w)/g, (_, c) => c.toUpperCase())
              .replace(/^(\w)/, (_, c) => c.toUpperCase());

      const detectType = val => {
        if (Array.isArray(val)) {
          if (val.length === 0) return "[]interface{}";
          const t = detectType(val[0]);
          return `[]${t}`;
        } else if (val === null) {
          return "interface{}";
        } else if (typeof val === "string") {
          return "string";
        } else if (typeof val === "number") {
          return Number.isInteger(val) ? "int" : "float64";
        } else if (typeof val === "boolean") {
          return "bool";
        } else if (typeof val === "object") {
          return "struct";
        } else {
          return "interface{}";
        }
      };

      const structDefs = {};
      const parseObject = (obj, name) => {
        if (structDefs[name]) return;

        const fields = [];
        for (const key in obj) {
          const val = obj[key];
          const goKey = toCamelCase(key);
          let typ = detectType(val);

          if (typ === "struct") {
            const childName = toCamelCase(key);
            parseObject(val, childName);
            typ = childName;
          }

          if (typ.startsWith("[]") && typ.slice(2) === "struct") {
            const childName = toCamelCase(key);
            parseObject(val[0], childName);
            typ = `[]${childName}`;
          }

          fields.push({ goKey, typ, jsonKey: key });
        }

        structDefs[name] = fields;
      };

      parseObject(obj, structName);

      const entries = Object.entries(structDefs).reverse();
      const structStrings = entries.map(([name, fields]) => {
        const maxKeyLen = Math.max(...fields.map(f => f.goKey.length));
        const maxTypeLen = Math.max(...fields.map(f => f.typ.length));
        const lines = fields.map(f => {
          const pad = (s, len) => s + " ".repeat(len - s.length);
          return `  ${pad(f.goKey, maxKeyLen)} ${pad(f.typ, maxTypeLen)} \`json:"${f.jsonKey}"\``;
        });
        return `type ${name} struct {\n${lines.join("\n")}\n}`;
      });

      return structStrings.join("\n\n");
    }
  },
};
</script>

<style scoped>
textarea {
  width: 100%;
  font-family: monospace;
}
</style>
