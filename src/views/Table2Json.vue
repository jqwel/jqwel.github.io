<template>
  <div class="container-fluid">
    <h2 class="mb-3">CSV ↔ JSON 实时转换</h2>
    <div class="row">
      <!-- CSV 区域 -->
      <div class="col-6">
        <label class="form-label">CSV 输入</label>
        <textarea
            v-model="csvText"
            rows="20"
            class="form-control"
            @input="handleCsvInput"
        ></textarea>
        <button class="btn btn-primary mt-2" @click="downloadCsv">下载 CSV</button>
      </div>

      <!-- JSON 区域 -->
      <div class="col-6">
        <label class="form-label">JSON 输出</label>
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
import Papa from "papaparse";

export default {
  name: "CsvJsonConverter",
  data() {
    return {
      csvText: `name,age,active\n小王,25,true\n小李,30,false`,
      jsonText: "",
      isSyncing: false,
    };
  },
  mounted() {
    this.handleCsvInput(); // 初始转换一次
  },
  methods: {
    handleCsvInput() {
      if (this.isSyncing) return;
      this.isSyncing = true;
      try {
        const result = Papa.parse(this.csvText.trim(), {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
        });

        const data = result.data.map(row => {
          const newRow = {};
          for (const key in row) {
            const original = row[key];
            // const lower = original.toLowerCase();
            const lower = original;

            // 优先处理布尔值（true/false）
            if (lower === "true") {
              newRow[key] = true;
            } else if (lower === "false") {
              newRow[key] = false;

              // 然后尝试严格数字匹配
            } else {
              const num = Number(original);
              if (!isNaN(num) && String(num) === original) {
                newRow[key] = num;
              } else {
                newRow[key] = original;
              }
            }
          }
          return newRow;
        });

        this.jsonText = JSON.stringify(data, null, 2);
      } catch (err) {
        this.jsonText = `// CSV 转换失败：${err.message}`;
      } finally {
        this.isSyncing = false;
      }
    },
    handleJsonInput() {
      if (this.isSyncing) return;
      this.isSyncing = true;
      try {
        const data = JSON.parse(this.jsonText);
        if (!Array.isArray(data)) throw new Error("JSON 必须是数组");
        const allFields = new Set();
        data.forEach(item => {
          Object.keys(item).forEach(key => allFields.add(key));
        });
        const normalized = data.map(row => {
          const r = {};
          allFields.forEach(field => {
            r[field] = field in row ? row[field] : "";
          });
          return r;
        });
        this.csvText = Papa.unparse(normalized);
      } catch (err) {
        this.csvText = `// JSON 转换失败：${err.message}`;
      } finally {
        this.isSyncing = false;
      }
    },
    downloadCsv() {
      try {
        const bom = "\uFEFF";
        const blob = new Blob([bom + this.csvText], {
          type: "text/csv;charset=utf-8;",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        alert("下载失败：" + err.message);
      }
    },
  },
};
</script>

<style scoped>
textarea {
  width: 100%;
  font-family: monospace;
}
</style>
